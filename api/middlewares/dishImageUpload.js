import multer from 'multer';
import { fileURLToPath } from 'node:url';

export const dishImageDir = fileURLToPath(new URL('../uploads/dishes/', import.meta.url));

// Recibe una sola imagen en el campo image.
export function crearCargadorImagen(maxMiB) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxMiB * 1024 * 1024, files: 1, fields: 0 }
  }).single('image');

  return (req, res, next) => {
    upload(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ message: `La imagen no puede superar los ${maxMiB} MiB` });
        }
        return res.status(400).json({ message: 'Enviá una sola imagen en el campo image' });
      }
      return next(error);
    });
  };
}

export default crearCargadorImagen(2);
