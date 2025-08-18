import { Request, Response } from "express";
import { prismaClient } from "@repo/db/client";
import { s3 } from "../config/s3.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const getPartnerItems = async (req: Request, res: Response): Promise<void> => {
  const { partnerId } = req.query;
  if (!partnerId || typeof partnerId !== "string") {
    res.status(400).json({ error: "partnerId is required" });
    return;
  }
  try {
    const items = await prismaClient.item.findMany({ where: { partnerId } });
    res.status(200).json({ items });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
}


export const getAllPartnersWithItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const partners = await prismaClient.partner.findMany({
      include: {
        items: true,
        shopimage: true,
        verification: true,
      },
    });
    const result = partners.map((partner: any) => ({
      id: partner.id,
      name: partner.shopname,
      image: partner.shopimage?.url || "/logo.png",
      rating: 4.5,
      ratingsCount: partner.items.length,
      shopAddress: partner.verification?.shopAddress || "",
      items: partner.items.map((item: any) => ({
        name: item.name,
        price: item.price,
        image: item.image,
        available: item.available,
      })),
    }));
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch partners with items" });
  }
};

export const getBurgerItems = async (req: Request, res: Response): Promise<void> => {
  const { shopname } = req.query;
  if (!shopname || typeof shopname !== "string") {
    res.status(400).json({ error: "shopname is required" });
    return;
  }

  try {
    const partner = await prismaClient.partner.findUnique({
      where: { shopname },
      include: { items: true },
    });

    if (!partner) {
      res.status(404).json({ error: "Partner not found" });
      return;
    }

    const burgerItems = partner.items
      .filter((item: any) => item.name.toLowerCase().includes("burger"))
      .map((item: any) => ({
        name: item.name,
        price: item.price,
        image: item.image,
        available: item.available,
      }));

    res.json({
      shop: {
        name: partner.shopname,
        image: "/logo.png",
        rating: 4.5,
        ratingsCount: partner.items.length,
      },
      items: burgerItems,
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch burger items" });
  }
};

export const toggleItemAvailability = async (req: Request, res: Response): Promise<void> => {
  const { itemId } = req.params;
  if (!itemId) {
    res.status(400).json({ error: "itemId is required" });
    return;
  }

  try {
    const item = await prismaClient.item.findUnique({ where: { id: itemId } });
    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    const updated = await prismaClient.item.update({
      where: { id: itemId },
      data: { available: !item.available },
    });

    res.status(200).json({ item: updated });
  } catch (e) {
    res.status(500).json({ error: "Failed to toggle availability" });
  }
};



export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  const { itemId } = req.params;
  if (!itemId) {
    res.status(400).json({ error: "itemId is required" });
    return;
  }

  try {
    // Get the item first to get the image URL
    const item = await prismaClient.item.findUnique({ where: { id: itemId } });
    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    // Delete the item from the database
    const deleted = await prismaClient.item.delete({ where: { id: itemId } });

    // Try to delete the image from S3 if it exists and is an S3 URL
    if (item.image && item.image.includes('.amazonaws.com/')) {
      try {
        // Extract the S3 key from the image URL
        const url = new URL(item.image);
        // The key is everything after the bucket host, e.g. /items/12345-image.jpg
        // Remove leading slash
        let key = url.pathname;
        if (key.startsWith('/')) key = key.slice(1);
        await s3.send(new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET as string,
          Key: key,
        }));
      } catch (err) {
        // Log but don't fail the request if S3 delete fails
        console.error('Failed to delete S3 image:', err);
      }
    }

    res.status(200).json({ success: true, deleted });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete item", details: String(e) });
  }
}


export const addItem = async (req: Request, res: Response): Promise<void> => {
  const { name, price, partnerId } = req.body;
  if (!name || !price || !partnerId || !req.file) {
    res.status(400).json({ error: "Name, price, partnerId, and image are required" });
    return;
  }

  try {
    const key = `items/${Date.now()}-${req.file.originalname}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET as string,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    const item = await prismaClient.item.create({
      data: {
        name,
        price: parseFloat(price),
        image: imageUrl,
        partnerId,
        available: true,
      },
    });

    res.status(201).json({ item });
  } catch (e) {
    res.status(500).json({ error: "Failed to add item", details: String(e) });
  }
};
