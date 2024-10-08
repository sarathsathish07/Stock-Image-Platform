import express from "express";
import {
  authUser,
  registerUser,
  logoutUser,
  updateUserProfile,
  uploadUserImages,
  getImages,
  updateImage,
  deleteImage,
  updateImageOrder,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../config/multerConfig.js";
const router = express.Router();

router.post("/auth", authUser);
router.get("/images", protect, getImages);
router.put("/images/order", protect, updateImageOrder);
router.put("/upload", upload.array("images", 10), protect, uploadUserImages);
router.put("/images/:id", upload.single("image"), protect, updateImage);
router.route("/images/:id").delete(protect, deleteImage);
router.put("/images/order", protect, updateImageOrder);
router.route("/profile").put(protect, updateUserProfile);

router.post("/", registerUser);

router.post("/logout", logoutUser);

export default router;
