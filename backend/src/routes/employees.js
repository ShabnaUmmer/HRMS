import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { 
  getAllEmployees, 
  getEmployeeById,
  createEmployee, 
  updateEmployee,
  deleteEmployee,
  assignTeams, 
  getEmployeeTeams 
} from "../controllers/employeeController.js";

const router = express.Router();

// All routes protected by auth middleware
router.use(authMiddleware);

router.get("/", getAllEmployees);
router.get("/:id", getEmployeeById);
router.post("/", createEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);
router.put("/:id/teams", assignTeams);
router.get("/:id/teams", getEmployeeTeams);

export default router;