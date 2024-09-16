import express from 'express';
import { authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  uploadUserImages,
  getImages,
  updateImage,
  deleteImage,
  updateImageOrder
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../config/multerConfig.js';
const router = express.Router()

router.post('/auth',authUser)
router.get('/images',protect,getImages)
router.put('/images/order', protect, updateImageOrder);
router.put('/upload',upload.array('images', 10),protect, uploadUserImages);
router.put('/images/:id', upload.single('image'),protect, updateImage);
router.route('/images/:id').delete(protect, deleteImage);
router.put('/images/order', protect, updateImageOrder);
router.post('/',registerUser)

router.post('/logout',logoutUser)
router.route('/profile').get(protect,getUserProfile).put(protect,updateUserProfile);

export default router
