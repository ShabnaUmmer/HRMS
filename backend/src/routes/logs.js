import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { 
  getLogs, 
  getLogStats, 
  clearLogs,
  clearLogsByDate 
} from "../controllers/logsController.js";

const router = express.Router();

// All routes protected by auth middleware
router.use(authMiddleware);

router.get("/", getLogs);
router.get("/stats", getLogStats);
router.delete("/clear", clearLogs); // Clear all logs
router.delete("/clear-old", clearLogsByDate); // Clear logs by date

export default router;