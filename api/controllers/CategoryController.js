import mongoose from 'mongoose';
import { profileImageExtension } from '../middlewares/profileImageUpload.js';
import {
  buscarCategoria, buscarFotoCategoria, crearCategoria, editarCategoria,
  eliminarCategoria, guardarFotoCategoria, listarCategorias
} from '../services/CategoryService.js';

// Devuelve 409 cuando el nombre ya pertenece a otra categoría.
const duplicateName = (res) => res.status(409).json({
  message: 'Ya existe una categoría con ese nombre'
});

// Identifica un nombre duplicado rechazado por el índice de MongoDB.
const isDuplicateName = (error) => error.code === 11000 && error.keyPattern?.name === 1;

class CategoryController {
  // Sirve la imagen guardada para la categoría.
  async getImage(req, res, next) {
    const { id } = req.params;
    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({ message: 'El ID de la categoría no es válido' });
    }

    try {
      const imageFile = await buscarFotoCategoria(id);
      if (!imageFile?.bytes) {
        return res.status(404).json({ message: 'Imagen no encontrada' });
      }
      res.set('X-Content-Type-Options', 'nosniff');
      res.set('Cache-Control', 'no-cache');
      return res.type(imageFile.mime).send(imageFile.bytes);
    } catch (error) {
      return next(error);
    }
  }

  // Guarda o reemplaza la imagen en MongoDB.
  async uploadImage(req, res, next) {
    const { id } = req.params;
    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({ message: 'El ID de la categoría no es válido' });
    }
    const extension = req.file && profileImageExtension(req.file.buffer);
    if (!extension) {
      return res.status(400).json({ message: 'Elegí una imagen JPEG, PNG o WebP' });
    }

    try {
      const image = await guardarFotoCategoria(id, req.file.buffer, extension);
      if (!image) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      return res.json({ message: 'Foto de la categoría actualizada', data: { image } });
    } catch (error) {
      return next(error);
    }
  }

  // Lista todas las categorías.
  async getAll(req, res) {
    try {
      const categories = await listarCategorias();

      return res.status(200).json({
        message: 'success',
        data: categories
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: 'Error al obtener las categorías'
      });
    }
  }

  // Valida el ID y busca la categoría correspondiente.
  async getById(req, res) {
    try {
      const id = req.params.id;

      if (!mongoose.isObjectIdOrHexString(id)) {
        return res.status(400).json({
          message: 'El ID de la categoría no es válido'
        });
      }

      const category = await buscarCategoria(id);

      if (!category) {
        return res.status(404).json({
          message: 'Categoría no encontrada'
        });
      }

      return res.status(200).json({
        message: 'success',
        data: category
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: 'Error al obtener la categoría'
      });
    }
  }

  // Valida los datos y crea una categoría si el nombre está disponible.
  async create(req, res) {
    try {
      if (
        !req.body ||
        typeof req.body !== 'object' ||
        Array.isArray(req.body)
      ) {
        return res.status(400).json({
          message: 'Debés enviar un objeto JSON'
        });
      }

      const { name, description } = req.body;

      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          message: 'El nombre es obligatorio y debe ser un texto'
        });
      }

      if (
        description !== undefined &&
        typeof description !== 'string'
      ) {
        return res.status(400).json({
          message: 'La descripción debe ser un texto'
        });
      }

      const { category, duplicada } = await crearCategoria({ name, description });
      if (duplicada) return duplicateName(res);

      return res.status(201).json({
        message: 'success',
        data: category
      });
    } catch (error) {
      if (isDuplicateName(error)) return duplicateName(res);
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          message: error.message
        });
      }

      console.error(error);

      return res.status(500).json({
        message: 'Error al crear la categoría'
      });
    }
  }

  // Actualiza la categoría sin permitir que tome el nombre de otra.
  async update(req, res) {
    try {
      const id = req.params.id;

      if (!mongoose.isObjectIdOrHexString(id)) {
        return res.status(400).json({
          message: 'El ID de la categoría no es válido'
        });
      }

      if (
        !req.body ||
        typeof req.body !== 'object' ||
        Array.isArray(req.body)
      ) {
        return res.status(400).json({
          message: 'Debés enviar un objeto JSON'
        });
      }

      const { name, description } = req.body;

      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          message: 'El nombre es obligatorio y debe ser un texto'
        });
      }

      // PUT exige enviar ambos campos.
      // La descripción puede ser un texto vacío.
      if (typeof description !== 'string') {
        return res.status(400).json({
          message: 'Debés enviar la descripción como texto'
        });
      }

      const { category, duplicada } = await editarCategoria(id, { name, description });
      if (duplicada) return duplicateName(res);

      if (!category) {
        return res.status(404).json({
          message: 'Categoría no encontrada'
        });
      }

      return res.status(200).json({
        message: 'success',
        data: category
      });
    } catch (error) {
      if (isDuplicateName(error)) return duplicateName(res);
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          message: error.message
        });
      }

      console.error(error);

      return res.status(500).json({
        message: 'Error al actualizar la categoría'
      });
    }
  }

  // Elimina la categoría solo si no tiene platos asociados.
  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!mongoose.isObjectIdOrHexString(id)) {
        return res.status(400).json({
          message: 'El ID de la categoría no es válido'
        });
      }

      const { category: deletedCategory, tienePlatos } = await eliminarCategoria(id);
      if (tienePlatos) {
        return res.status(400).json({
          message: 'No se puede eliminar una categoría con platos asociados'
        });
      }

      if (!deletedCategory) {
        return res.status(404).json({
          message: 'Categoría no encontrada'
        });
      }

      return res.status(200).json({
        message: 'Categoría eliminada correctamente',
        data: deletedCategory
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: 'Error al eliminar la categoría'
      });
    }
  }
}

export default CategoryController;
