import { randomUUID } from 'node:crypto';
import Category, { categoryNameCollation } from '../models/Category.js';
import Dish from '../models/Dish.js';

// Quita espacios externos y deja solo la inicial en mayúscula.
function formatCategoryName(name) {
  const trimmedName = name.trim().toLocaleLowerCase('es');
  const [first, ...rest] = trimmedName;
  return first.toLocaleUpperCase('es') + rest.join('');
}

export function listarCategorias() {
  return Category.find();
}

export function buscarCategoria(id) {
  return Category.findById(id);
}

// Busca un nombre equivalente antes de guardar.
export async function crearCategoria({ name, description }) {
  const formattedName = formatCategoryName(name);
  if (await Category.exists({ name: formattedName }).collation(categoryNameCollation)) {
    return { duplicada: true };
  }

  const category = await Category.create({ name: formattedName, description });
  return { category };
}

// Excluye la categoría editada de la búsqueda de duplicados.
export async function editarCategoria(id, { name, description }) {
  const formattedName = formatCategoryName(name);
  const duplicada = await Category.exists({
    _id: { $ne: id },
    name: formattedName
  }).collation(categoryNameCollation);

  if (duplicada) {
    return (await Category.exists({ _id: id })) ? { duplicada: true } : {};
  }

  const category = await Category.findByIdAndUpdate(
    id,
    { name: formattedName, description },
    { new: true, runValidators: true }
  );
  return { category };
}

// Conserva las categorías que todavía tienen platos asociados.
export async function eliminarCategoria(id) {
  const category = await Category.findById(id);
  if (!category) return {};

  const dishes = await Dish.find({ category: id });
  if (dishes.length > 0) return { tienePlatos: true };

  const deletedCategory = await Category.findByIdAndDelete(id);
  return { category: deletedCategory };
}

export async function buscarFotoCategoria(id) {
  const category = await Category.findById(id).select('imageFile');
  return category?.imageFile;
}

// Guarda los bytes y actualiza la URL pública de la foto.
export async function guardarFotoCategoria(id, bytes, extension) {
  const mime = extension === 'jpg' ? 'image/jpeg' : `image/${extension}`;
  const image = `/api/categories/${id}/image?v=${randomUUID()}`;
  const resultado = await Category.updateOne({ _id: id }, {
    $set: { image, imageFile: { bytes, mime } }
  });
  return resultado.matchedCount ? image : null;
}
