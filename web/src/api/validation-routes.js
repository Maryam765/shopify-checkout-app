import express from "express";
import { errorHandler, planMiddleware } from "../middleware/index.js";
import { PLAN_OPTIONS } from "../constants/index.js";
import * as ValidationController from "../controllers/index.js";

const router = express.Router();

router.post(
  "/create",
  planMiddleware([PLAN_OPTIONS.ESSENTIAL]),
  errorHandler(ValidationController.createValidation)
);
router.get(
  "/",
  planMiddleware([PLAN_OPTIONS.ESSENTIAL]),
  errorHandler(ValidationController.getAllValidation)
);
router.get(
  "/:id",
  planMiddleware([PLAN_OPTIONS.ESSENTIAL]),
  errorHandler(ValidationController.getByIdValidation)
);
router.put(
  "/:id",
  planMiddleware([PLAN_OPTIONS.ESSENTIAL]),
  errorHandler(ValidationController.updateValidation)
);
router.delete(
  "/:id",
  planMiddleware([PLAN_OPTIONS.ESSENTIAL]),
  errorHandler(ValidationController.deleteValidation)
);

export const validationRoutes = router;
