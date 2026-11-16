import express from 'express';
import DishController from '../controllers/DishController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import dishImageUpload from '../middlewares/dishImageUpload.js';

const router = express.Router();
const controller = new DishController();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authMiddleware, roleMiddleware, controller.create);
router.post('/:id/image', authMiddleware, roleMiddleware, dishImageUpload, controller.uploadImage);
router.put('/:id', authMiddleware, roleMiddleware, controller.update);
router.delete('/:id', authMiddleware, roleMiddleware, controller.delete);

export default router;
