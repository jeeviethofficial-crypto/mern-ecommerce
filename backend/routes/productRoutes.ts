import express from 'express';
import { products, users } from '../data/dummy';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// @desc    Get all products (Admin)
// @route   GET /api/products/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, admin, (req, res) => {
  res.json(products);
});

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', (req, res) => {
  // Simulating query parameters like search
  const keyword = req.query.keyword as string;
  let result = products;

  if (keyword) {
    result = products.filter((p) => 
      p.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // Only return active products (Admin module hides inactive ones)
  result = result.filter(p => p.isActive);

  res.json(result);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', (req, res) => {
  const product = products.find((p) => p._id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, (req, res) => {
  const { rating, comment } = req.body;
  const product = products.find((p) => p._id === req.params.id);
  const user = users.find(u => u._id === (req as any).userId);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user === (req as any).userId
    );

    if (alreadyReviewed) {
      res.status(400).json({ message: 'Product already reviewed' });
      return;
    }

    const review = {
      _id: `r${Date.now()}`,
      name: user?.name || 'Unknown',
      rating: Number(rating),
      comment,
      user: (req as any).userId,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, (req, res) => {
  const product = {
    _id: `p${Date.now()}`,
    name: 'Sample name',
    price: 0,
    category: 'Sample category',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    countInStock: 0,
    isActive: false,
    rating: 0,
    numReviews: 0,
    reviews: [],
    description: 'Sample description'
  };

  products.push(product);
  res.status(201).json(product);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, (req, res) => {
  const { name, price, description, imageUrl, category, countInStock, isActive } = req.body;
  const product = products.find(p => p._id === req.params.id);

  if (product) {
    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.description = description ?? product.description;
    product.imageUrl = imageUrl ?? product.imageUrl;
    product.category = category ?? product.category;
    product.countInStock = countInStock ?? product.countInStock;
    product.isActive = isActive ?? product.isActive;

    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, (req, res) => {
  const productIndex = products.findIndex(p => p._id === req.params.id);
  if (productIndex > -1) {
    products.splice(productIndex, 1);
    res.json({ message: 'Product removed' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

export default router;
