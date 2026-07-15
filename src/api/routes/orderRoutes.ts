import express from 'express';
import { orders } from '../data/dummy';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  }

  const order = {
    _id: `order-${orders.length + 1}`,
    user: (req as any).userId,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid: true, // Auto pay for dummy
    paidAt: new Date(),
    isDelivered: false,
    createdAt: new Date(),
  };

  orders.push(order);

  res.status(201).json(order);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, (req, res) => {
  const userId = (req as any).userId;
  const myOrders = orders.filter((o) => o.user === userId);
  res.json(myOrders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, (req, res) => {
  const order = orders.find((o) => o._id === req.params.id);

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, (req, res) => {
  res.json(orders);
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, (req, res) => {
  const order = orders.find(o => o._id === req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = new Date();
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

export default router;
