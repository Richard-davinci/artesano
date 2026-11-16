import express from 'express';
import CategoryController from '../controllers/CategoryController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import { crearCargadorImagen } from '../middlewares/dishImageUpload.js';

const router = express.Router();
const controller = new CategoryController();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.get('/:id/image', controller.getImage);
router.post('/', authMiddleware, roleMiddleware, controller.create);
router.post('/:id/image', authMiddleware, roleMiddleware, crearCargadorImagen(4), controller.uploadImage);
router.put('/:id', authMiddleware, roleMiddleware, controller.update);
router.delete('/:id', authMiddleware, roleMiddleware, controller.delete);

export default router;
