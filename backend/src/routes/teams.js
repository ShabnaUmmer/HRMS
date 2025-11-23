import express from "express";
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam
} from "../controllers/teamController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected routes
router.use(authMiddleware);

router.post("/", createTeam);
router.get("/", getTeams);
router.get("/:id", getTeamById);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);

export default router;