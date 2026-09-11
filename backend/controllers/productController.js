import Product from '../models/Product.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

export const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    q,
    minPrice,
    maxPrice,
    sort,
    vegetarian,
    spicy,
    deals,
    rating,
    page = 1,
    limit = 20,
  } = req.query;

  const query = {};

  if (category && category !== 'all') {
    query.category = category;
  }

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } },
    ];
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (vegetarian === 'true') query.vegetarian = true;
  if (spicy === 'true') query.spicy = true;
  if (deals === 'true') query.isDeal = true;
  if (rating) query.rating = { $gte: Number(rating) };

  let sortOption = {};
  if (sort === 'price_asc') sortOption = { price: 1 };
  else if (sort === 'price_desc') sortOption = { price: -1 };
  else if (sort === 'rating') sortOption = { rating: -1 };
  else if (sort === 'popularity') sortOption = { reviews: -1 };
  else sortOption = { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(query).sort(sortOption).skip(skip).limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

export const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  res.json({ success: true, product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  res.json({ success: true, product });
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  res.json({ success: true, message: 'Product deleted' });
});
