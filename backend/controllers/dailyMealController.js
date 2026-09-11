import DailyMeal from '../models/DailyMeal.js';
import Product from '../models/Product.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const toDayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const fromInput = (input) => {
  if (!input) return toDayStart(new Date());
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, day] = input.split('-').map(Number);
    return new Date(y, m - 1, day);
  }
  return toDayStart(new Date(input));
};

const withProduct = async (meal) => {
  if (!meal) return null;
  const product = await Product.findById(meal.productId);
  return { ...meal.toObject(), product: product ? product.toObject() : null };
};

export const getTodaysMeal = asyncHandler(async (req, res) => {
  const today = toDayStart(new Date());
  const meal = await DailyMeal.findOne({ date: today });
  const enriched = await withProduct(meal);
  res.json({ success: true, meal: enriched });
});

export const listMeals = asyncHandler(async (req, res) => {
  const meals = await DailyMeal.find()
    .sort({ date: -1 })
    .limit(Number(req.query.limit) || 30)
    .populate('productId', 'name image price category');
  res.json({ success: true, meals });
});

export const upsertMeal = asyncHandler(async (req, res) => {
  const { date, productId, note } = req.body;
  if (!date || !productId) {
    throw new AppError('Both date and meal are required', 400);
  }
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Selected meal product was not found', 404);
  }
  const dayStart = fromInput(date);
  const meal = await DailyMeal.findOneAndUpdate(
    { date: dayStart },
    { date: dayStart, productId, note: note || '' },
    { new: true, upsert: true, runValidators: true }
  );
  res.json({ success: true, meal: await withProduct(meal) });
});

export const deleteMeal = asyncHandler(async (req, res, next) => {
  const meal = await DailyMeal.findByIdAndDelete(req.params.id);
  if (!meal) {
    throw new AppError('Meal entry not found', 404);
  }
  res.json({ success: true, message: 'Meal entry deleted' });
});