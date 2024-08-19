import express from "express";
import { errorHandler, planMiddleware } from "../middleware/index.js";
import { PLAN_OPTIONS } from "../constants/index.js";
import * as CustomFieldsController from "../controllers/index.js";

const router = express.Router();

router.post(
  "/create",
  planMiddleware([PLAN_OPTIONS.PROFESSIONAL]),
  errorHandler(CustomFieldsController.createCustomFields)
);
router.get(
  "/",
  planMiddleware([PLAN_OPTIONS.PROFESSIONAL]),
  errorHandler(CustomFieldsController.getAllCustomFields)
);
router.get(
  "/:id",
  planMiddleware([PLAN_OPTIONS.PROFESSIONAL]),
  errorHandler(CustomFieldsController.getByIdCustomFields)
);
router.put(
  "/:id",
  planMiddleware([PLAN_OPTIONS.PROFESSIONAL]),
  errorHandler(CustomFieldsController.updateCustomFields)
);
router.delete(
  "/:id",
  planMiddleware([PLAN_OPTIONS.PROFESSIONAL]),
  errorHandler(CustomFieldsController.deleteFields)
);

export const customFieldsRoutes = router;
