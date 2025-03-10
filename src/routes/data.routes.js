import { Router } from "express";
import { ctrlData } from "../controllers/dataControllers.js";

const dataRouter = Router();

dataRouter.get("/:category", ctrlData);

export { dataRouter };
