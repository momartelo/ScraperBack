import { Router } from "express";
import { ctrlScrapingECON } from "../controllers/scrapersControllers.js";

const scraperRouter = Router();

scraperRouter.get("/:category", ctrlScrapingECON);

export { scraperRouter };
