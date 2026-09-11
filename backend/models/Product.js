import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  required: { type: Boolean, default: false },
  choices: [
    {
      label: { type: String, required: true },
      price: { type: Number, default: 0 },
    },
  ],
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    image: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      index: true,
    },
    ingredients: [String],
    allergens: [String],
    options: [optionSchema],
    tags: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    available: {
      type: Boolean,
      default: true,
    },
    isDeal: {
      type: Boolean,
      default: false,
    },
    dealEnds: Date,
    vegetarian: { type: Boolean, default: false },
    spicy: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text', category: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
