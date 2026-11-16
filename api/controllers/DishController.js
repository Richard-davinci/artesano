import mongoose from 'mongoose';
import { profileImageExtension } from '../middlewares/profileImageUpload.js';
import {
  buscarPlato, crearPlato, editarPlato, eliminarPlato, guardarFotoPlato, listarPlatos
} from '../services/DishService.js';

class DishController {
  // Guarda la nueva foto y retira la anterior.
  async uploadImage(req, res, next) {
    const { id } = req.params;
    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({ message: 'El ID del plato no es válido' });
    }
    const extension = req.file && profileImageExtension(req.file.buffer);
    if (!extension) {
      return res.status(400).json({ message: 'Elegí una imagen JPEG, PNG o WebP' });
    }

    try {
      const image = await guardarFotoPlato(id, req.file.buffer, extension);
      if (!image) return res.status(404).json({ message: 'Plato no encontrado' });
      return res.json({ message: 'Foto del plato actualizada', data: { image } });
    } catch (error) {
      return next(error);
    }
  }

  async getAll(req, res) {
    try {
      const { name, category, minPrice, maxPrice } = req.query;

      const filter = {};

      if (name !== undefined) {
        if (
          typeof name !== 'string' ||
          name.trim() === '' ||
          name.trim().length > 100
        ) {
          return res.status(400).json({
            message: 'El nombre de búsqueda debe tener entre 1 y 100 caracteres'
          });
        }

        const searchName = name
          .trim()
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        filter.name = {
          $regex: searchName,
          $options: 'i'
        };
      }

      if (category !== undefined) {
        if (
          typeof category !== 'string' ||
          !mongoose.isObjectIdOrHexString(category)
        ) {
          return res.status(400).json({
            message: 'El ID de categoría no es válido'
          });
        }

        filter.category = category;
      }

      if (minPrice !== undefined) {
        if (
          typeof minPrice !== 'string' ||
          minPrice.trim() === '' ||
          !Number.isFinite(Number(minPrice)) ||
          Number(minPrice) < 0
        ) {
          return res.status(400).json({
            message: 'El precio mínimo debe ser un número mayor o igual a cero'
          });
        }

        filter.price = {
          $gte: Number(minPrice)
        };
      }

      if (maxPrice !== undefined) {
        if (
          typeof maxPrice !== 'string' ||
          maxPrice.trim() === '' ||
          !Number.isFinite(Number(maxPrice)) ||
          Number(maxPrice) < 0
        ) {
          return res.status(400).json({
            message: 'El precio máximo debe ser un número mayor o igual a cero'
          });
        }

        if (!filter.price) {
          filter.price = {};
        }

        filter.price.$lte = Number(maxPrice);
      }

      if (
        minPrice !== undefined &&
        maxPrice !== undefined &&
        Number(minPrice) > Number(maxPrice)
      ) {
        return res.status(400).json({
          message: 'El precio mínimo no puede superar al máximo'
        });
      }

      const dishes = await listarPlatos(filter);

      return res.status(200).json({
        message: 'success',
        data: dishes
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: 'Error al obtener los platos'
      });
    }
  }

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

      const {
        name,
        description,
        price,
        available,
        category
      } = req.body;

      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          message: 'El nombre es obligatorio y debe ser un texto'
        });
      }

      if (
        typeof description !== 'string' ||
        description.trim() === ''
      ) {
        return res.status(400).json({
          message: 'La descripción es obligatoria y debe ser un texto'
        });
      }

      if (
        typeof price !== 'number' ||
        !Number.isFinite(price) ||
        price < 0.01
      ) {
        return res.status(400).json({
          message: 'El precio debe ser un número mayor o igual a 0.01'
        });
      }

      if (
        available !== undefined &&
        typeof available !== 'boolean'
      ) {
        return res.status(400).json({
          message: 'La disponibilidad debe ser true o false'
        });
      }

      if (
        typeof category !== 'string' ||
        !mongoose.isObjectIdOrHexString(category)
      ) {
        return res.status(400).json({
          message: 'Debés enviar un ID de categoría válido'
        });
      }

      const { dish, categoriaInexistente } = await crearPlato({
        name,
        description,
        price,
        available,
        category
      });

      if (categoriaInexistente) {
        return res.status(404).json({
          message: 'La categoría no existe'
        });
      }

      return res.status(201).json({
        message: 'success',
        data: dish
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          message: error.message
        });
      }

      console.error(error);

      return res.status(500).json({
        message: 'Error al crear el plato'
      });
    }
  }

  async getById(req, res) {
    try {
      const id = req.params.id;

      if (!mongoose.isObjectIdOrHexString(id)) {
        return res.status(400).json({
          message: 'El ID del plato no es válido'
        });
      }

      const dish = await buscarPlato(id);

      if (!dish) {
        return res.status(404).json({
          message: 'Plato no encontrado'
        });
      }

      return res.status(200).json({
        message: 'success',
        data: dish
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: 'Error al obtener el plato'
      });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;

      if (!mongoose.isObjectIdOrHexString(id)) {
        return res.status(400).json({
          message: 'El ID del plato no es válido'
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

      const {
        name,
        description,
        price,
        available,
        category
      } = req.body;

      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          message: 'El nombre es obligatorio y debe ser un texto'
        });
      }

      if (
        typeof description !== 'string' ||
        description.trim() === ''
      ) {
        return res.status(400).json({
          message: 'La descripción es obligatoria y debe ser un texto'
        });
      }

      if (
        typeof price !== 'number' ||
        !Number.isFinite(price) ||
        price < 0.01
      ) {
        return res.status(400).json({
          message: 'El precio debe ser un número mayor o igual a 0.01'
        });
      }

      if (typeof available !== 'boolean') {
        return res.status(400).json({
          message: 'La disponibilidad debe ser true o false'
        });
      }

      if (
        typeof category !== 'string' ||
        !mongoose.isObjectIdOrHexString(category)
      ) {
        return res.status(400).json({
          message: 'Debés enviar un ID de categoría válido'
        });
      }

      const { dish, categoriaInexistente } = await editarPlato(id, { name, description, price, available, category });

      if (categoriaInexistente) {
        return res.status(404).json({
          message: 'La categoría no existe'
        });
      }

      if (!dish) {
        return res.status(404).json({
          message: 'Plato no encontrado'
        });
      }

      return res.status(200).json({
        message: 'success',
        data: dish
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          message: error.message
        });
      }

      console.error(error);

      return res.status(500).json({
        message: 'Error al actualizar el plato'
      });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!mongoose.isObjectIdOrHexString(id)) {
        return res.status(400).json({
          message: 'El ID del plato no es válido'
        });
      }

      const dish = await eliminarPlato(id);

      if (!dish) {
        return res.status(404).json({
          message: 'Plato no encontrado'
        });
      }

      return res.status(200).json({
        message: 'Plato eliminado correctamente',
        data: dish
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: 'Error al eliminar el plato'
      });
    }
  }
}

export default DishController;
