import { Router } from "express";
import { ctrlGraphics } from "../controllers/graphicsControllers.js";

const graphicsRouter = Router();

graphicsRouter.get("/:category", ctrlGraphics);

export { graphicsRouter };
