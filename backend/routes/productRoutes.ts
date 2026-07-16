import express from 'express';
import { Product } from '../models/Product';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// @desc    Get all products (Admin)
// @route   GET /api/products/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const products = await Product.find().exec();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const keyword = req.query.keyword as string;
    let products;

    if (keyword) {
      products = await Product.find({
        isActive: true,
        name: { $regex: keyword, $options: 'i' },
      }).exec();
    } else {
      products = await Product.find({ isActive: true }).exec();
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).exec();
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id).exec();

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r: any) => r.user.toString() === (req as any).userId
      );

      if (alreadyReviewed) {
        res.status(400).json({ message: 'Product already reviewed' });
        return;
      }

      const review = {
        name: (req as any).userName || 'Unknown',
        rating: Number(rating),
        comment,
        user: (req as any).userId,
      } as any;

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc: number, item: any) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();

      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, price, description, imageUrl, category, countInStock, isActive } = req.body;

    const product = new Product({
      name: name || 'Sample name',
      price: price ?? 0,
      description: description || 'Sample description',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      category: category || 'Sample category',
      countInStock: countInStock ?? 0,
      isActive: isActive ?? false,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, price, description, imageUrl, category, countInStock, isActive } = req.body;
    const product = await Product.findById(req.params.id).exec();

    if (product) {
      product.name = name ?? product.name;
      product.price = price ?? product.price;
      product.description = description ?? product.description;
      product.imageUrl = imageUrl ?? product.imageUrl;
      product.category = category ?? product.category;
      product.countInStock = countInStock ?? product.countInStock;
      product.isActive = isActive ?? product.isActive;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id).exec();
    if (product) {
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;