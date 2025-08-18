

import { Request, Response } from "express";
import { prismaClient } from "@repo/db/client";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { s3 } from "../config/s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";


// Get all partners
export const getAllPartners = async (req: Request, res: Response): Promise<void> => {
  try {
    const partners = await prismaClient.partner.findMany({
      include: { shopimage: true, items: true, verification: true }
    });
    // Add shopAddress directly to each partner object, keep all other fields unchanged
    const partnersWithAddress = partners.map((partner: any) => ({
      ...partner,
      shopAddress: partner.verification?.shopAddress || ""
    }));
    res.status(200).json({ partners: partnersWithAddress });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch partners", details: String(e) });
  }
};

export const savePushSubscription = async (req: Request, res: Response): Promise<void> => {
  const { partnerId, subscription } = req.body;
  if (!partnerId || !subscription || !subscription.endpoint || !subscription.keys) {
    res.status(400).json({ error: "partnerId and valid subscription required" });
    return;
  }
  try {
    // Upsert: update if exists, else create
    await prismaClient.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        partnerId,
        keys: subscription.keys as unknown as Prisma.InputJsonValue,
      },
      create: {
        partnerId,
        endpoint: subscription.endpoint,
        keys: subscription.keys as unknown as Prisma.InputJsonValue,
      },
    });
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to save push subscription", details: String(e) });
  }
};

export const partnerSignup = async (req: Request, res: Response): Promise<void> => {
  const { shopname, shopcategory, password } = req.body;
  if (!shopname || !shopcategory || !password) {
    res.status(400).json({ error: "Shop name, shop category, and password are required" });
    return;
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const partner = await prismaClient.partner.create({
      data: { shopname, shopcategory, password: hashedPassword }
    });
    res.status(201).json({ partner });
  } catch (e: any) {
    if (e.code === 'P2002') {
      res.status(409).json({ error: "Shop name already exists" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const partnerSignin = async (req: Request, res: Response): Promise<void> => {
  const { shopname, password } = req.body;
  if (!shopname || !password) {
    res.status(400).json({ error: "Shop name and password are required" });
    return;
  }
  try {
    const partner = await prismaClient.partner.findUnique({ where: { shopname } });
    if (!partner) {
      res.status(401).json({ error: "Invalid shop name or password" });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, partner.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid shop name or password" });
      return;
    }
    res.status(200).json({ partner });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePartner = async (req: Request, res: Response): Promise<void> => {
  const { id, shopname, shopcategory } = req.body;
  if (!id || !shopname || !shopcategory) {
    res.status(400).json({ error: "id, shopname, and shopcategory are required" });
    return;
  }
  try {
    const existing = await prismaClient.partner.findFirst({
      where: { shopname, NOT: { id } }
    });
    if (existing) {
      res.status(409).json({ error: "Shop name already exists" });
      return;
    }
    const updated = await prismaClient.partner.update({
      where: { id },
      data: { shopname, shopcategory },
    });
    res.status(200).json({ partner: updated });
  } catch (e) {
    res.status(500).json({ error: "Failed to update partner", details: String(e) });
  }
};

export const getPartnerById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "id is required" });
    return;
  }
  try {
    const partner = await prismaClient.partner.findUnique({
      where: { id },
      include: { shopimage: true }
    });
    if (!partner) {
      res.status(404).json({ error: "Partner not found" });
      return;
    }
    res.status(200).json({ partner });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch partner", details: String(e) });
  }
};

export const uploadShopImage = async (req: Request, res: Response): Promise<void> => {
  const { partnerId } = req.body;
  if (!partnerId || !req.file) {
    res.status(400).json({ error: "partnerId and image are required" });
    return;
  }
  try {
    const key = `shopimages/${Date.now()}-${req.file.originalname.replace(/\s+/g, "-")}`;
    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET as string,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));
    const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    const existing = await prismaClient.shopimage.findUnique({ where: { partnerId } });
    const shopimage = existing
      ? await prismaClient.shopimage.update({ where: { partnerId }, data: { url: imageUrl } })
      : await prismaClient.shopimage.create({ data: { url: imageUrl, partnerId } });

    res.status(200).json({ url: shopimage.url });
  } catch (e) {
    res.status(500).json({ error: "Failed to upload shop image", details: String(e) });
  }
};

export const verifyPartner = async (req: Request, res: Response): Promise<void> => {
  const { name, aadhaarNumber, shopAddress, fssaiNumber, partnerId } = req.body;
  if (!name || !aadhaarNumber || !shopAddress || !fssaiNumber || !partnerId) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  try {
    const verification = await prismaClient.verification.create({
      data: {
        name,
        aadhaarNumber,
        shopAddress,
        fssaiNumber,
        partner: { connect: { id: partnerId } },
        verified: false,
      },
    });
    res.status(201).json({ verification });
  } catch (error) {
    res.status(500).json({ error: "Failed to create verification", details: String(error) });
  }
};

export const getVerificationStatus = async (req: Request, res: Response): Promise<void> => {
  const { partnerId } = req.query;
  if (!partnerId || typeof partnerId !== "string") {
    res.status(400).json({ verified: false });
    return;
  }
  try {
    const verification = await prismaClient.verification.findFirst({
      where: { partnerId },
      orderBy: { id: "desc" },
    });
    if (!verification) {
      res.json({ verified: false });
      return;
    }
    res.json({ verified: verification.verified });
  } catch (e) {
    res.status(500).json({ verified: false });
  }
};
