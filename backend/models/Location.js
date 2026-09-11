import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    openingHours: { type: String, required: true },
    latitude: Number,
    longitude: Number,
    deliveryAvailable: { type: Boolean, default: true },
    pickupAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Location = mongoose.model('Location', locationSchema);
export default Location;
