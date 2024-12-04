import { Router } from "express";
import {
  ctrlScrapingCemento,
  ctrlScrapingECON,
  ctrlScrapingHormigon,
  ctrlScrapingMLSearch,
} from "../controllers/scrapersControllers.js";

const scraperRouter = Router();

scraperRouter.get("/ECON/:category", ctrlScrapingECON);
scraperRouter.get("/ML/:word", ctrlScrapingMLSearch);
scraperRouter.get("/cementos", ctrlScrapingCemento);
scraperRouter.get("/hormigon", ctrlScrapingHormigon);

export { scraperRouter };
