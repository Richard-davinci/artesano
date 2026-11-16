import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import Dish from '../models/Dish.js';
import { buscarCategoria } from './CategoryService.js';
import { dishImageDir } from '../middlewares/dishImageUpload.js';

// Borra una imagen guardada en la carpeta de platos.
async function borrarImagen(ruta) {
  const archivo = ruta?.match(/^\/uploads\/dishes\/([0-9a-f-]{36}\.(?:jpg|png|webp))$/i)?.[1];
  if (archivo) await unlink(join(dishImageDir, archivo)).catch(() => {});
}

export function listarPlatos(filter) {
  return Dish.find(filter).populate('category');
}

export function buscarPlato(id) {
  return Dish.findById(id).populate('category');
}

// Comprueba la categoría antes de crear o editar un plato.
export async function crearPlato(datos) {
  if (!(await buscarCategoria(datos.category))) return { categoriaInexistente: true };

  const dish = await Dish.create(datos);
  return { dish };
}

export async function editarPlato(id, datos) {
  if (!(await buscarCategoria(datos.category))) return { categoriaInexistente: true };

  const dish = await Dish.findByIdAndUpdate(id, datos, { new: true, runValidators: true })
    .populate('category');
  return { dish };
}

// Elimina el plato y su foto si existe.
export async function eliminarPlato(id) {
  const dish = await Dish.findByIdAndDelete(id);
  if (dish) await borrarImagen(dish.image);
  return dish;
}

// Actualiza la foto y limpia el archivo anterior.
export async function guardarFotoPlato(id, bytes, extension) {
  const nombre = `${randomUUID()}.${extension}`;
  const image = `/uploads/dishes/${nombre}`;
  let anterior;

  try {
    await mkdir(dishImageDir, { recursive: true });
    await writeFile(join(dishImageDir, nombre), bytes);
    anterior = await Dish.findByIdAndUpdate(id, { image }, { new: false }).select('image');
  } catch (error) {
    await borrarImagen(image);
    throw error;
  }

  if (!anterior) {
    await borrarImagen(image);
    return null;
  }

  await borrarImagen(anterior.image);
  return image;
}
