import express from 'express';
import { orders } from '../data/dummy';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
  if (orderItems && orderItems.length === 0) { res.status(400).json({ message: 'No order items' }); return; }
  const order = {
    _id: `order-${orders.length + 1}`, user: (req as any).userId, orderItems, shippingAddress,
    paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice,
    isPaid: true, paidAt: new Date(), isDelivered: false, createdAt: new Date(), deliveredAt: undefined as Date | undefined,
  };
  orders.push(order);
  res.status(201).json(order);
});

router.get('/myorders', protect, (req, res) => {
  const userId = (req as any).userId;
  res.json(orders.filter((o) => o.user === userId));
});

router.get('/:id', protect, (req, res) => {
  const order = orders.find((o) => o._id === req.params.id);
  if (order) { res.json(order); } else { res.status(404).json({ message: 'Order not found' }); }
});

router.get('/', protect, admin, (req, res) => { res.json(orders); });

router.put('/:id/deliver', protect, admin, (req, res) => {
  const order = orders.find(o => o._id === req.params.id);
  if (order) { order.isDelivered = true; order.deliveredAt = new Date(); res.json(order); }
  else { res.status(404).json({ message: 'Order not found' }); }
});

export default router;
