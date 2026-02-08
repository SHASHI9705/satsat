import express, { Router } from "express";
import { getAdminMetrics } from "../controllers/adminController";

const router: Router = express.Router();

router.get("/metrics", getAdminMetrics);

export default router;
