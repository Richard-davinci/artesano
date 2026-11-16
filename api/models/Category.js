import mongoose from 'mongoose';
export const categoryNameCollation = { locale: 'es', strength: 2 };

//categorias de los platos
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la categoría es obligatorio'],
    trim: true,
    minlength: 3,
    maxlength: 60
  },
  description: {
    type: String,
    trim: true,
    maxlength: 300,
    default: ''
  },
  image: { type: String, default: null },
  imageFile: {
    type: new mongoose.Schema({ bytes: Buffer, mime: String }, { _id: false }),
    select: false
  }
}, { autoIndex: false });

categorySchema.index({ name: 1 }, {
  name: 'category_name_unique',
  unique: true,
  collation: categoryNameCollation
});

const Category = mongoose.model('category', categorySchema);

export default Category;
