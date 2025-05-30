import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.put("/edit/:id", protectRoute, editMessage); // New endpoint for editing
router.delete("/delete/:id", protectRoute, deleteMessage); // New endpoint for deleting

export default router;
