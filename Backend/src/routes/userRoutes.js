import express from "express";
import { registerUser, loginUser, getUserById, updateUserProfile  } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:id", getUserById); 
router.put("/update-profile/:email", updateUserProfile);

export default router;
