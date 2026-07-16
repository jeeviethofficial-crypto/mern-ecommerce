import mongoose, { Document, Model } from 'mongoose';

export interface IReview extends Document {
  name: string;
  rating: number;
  comment: string;
  user: mongoose.Types.ObjectId;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  countInStock: number;
  isActive: boolean;
  reviews: mongoose.Types.DocumentArray<IReview>;
  rating: number;
  numReviews: number;
}

const reviewSchema = new mongoose.Schema<IReview>(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: false },
    countInStock: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Product: Model<IProduct> = (mongoose.models.Product as Model<IProduct>) || mongoose.model<IProduct>('Product', productSchema);
export { Product };