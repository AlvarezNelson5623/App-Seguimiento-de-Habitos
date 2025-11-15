import express from "express";
import {
  getGlobalHabits,
  getUserHabits,
  addCustomHabit,
  addExistingHabit,
  removeUserHabit,
} from "../controllers/habitController.js";

const router = express.Router();

router.get("/global", getGlobalHabits);
router.get("/user/:userId", getUserHabits);
router.post("/custom", addCustomHabit);
router.post("/assign", addExistingHabit);
router.delete("/remove", removeUserHabit);

export default router;
