import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  name: { type: String, required: true },
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  options: [
    {
      name: String,
      label: String,
      price: Number,
    },
  ],
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    trackingToken: String,
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    deliveryMethod: {
      type: String,
      enum: ['delivery', 'pickup'],
      required: true,
    },
    address: {
      province: String,
      district: String,
      sector: String,
      street: String,
      landmark: String,
      notes: String,
    },
    customerInfo: {
      name: String,
      phone: String,
      email: String,
    },
    paymentMethod: {
      type: String,
      enum: ['mobile_money', 'card', 'cash_delivery', 'cash_pickup'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'successful', 'failed', 'cancelled'],
      default: 'pending',
    },
    paidBy: String,
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentRef: String,
    estimatedDelivery: Date,
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
