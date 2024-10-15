import { Router } from "express";
import { ctrlScraping } from "../controllers/scrapersControllers.js";

const scraperRouter = Router();

scraperRouter.get("/:category", ctrlScraping);

export { scraperRouter };
