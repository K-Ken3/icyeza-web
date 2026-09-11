import mongoose from 'mongoose';

const dailyMealSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
      unique: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'A meal must be selected for the day'],
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

const DailyMeal = mongoose.model('DailyMeal', dailyMealSchema);
export default DailyMeal;