import express from 'express';
import { createHash, timingSafeEqual } from 'crypto';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

const CARD_PAYMENT_METHOD = 'Card';
const PAYHERE_CURRENCY = 'LKR';
const SHIPPING_FEE = Number(process.env.SHIPPING_FEE_LKR || 0);
const TAX_RATE = Number(process.env.TAX_RATE || 0);

const md5 = (value: string) => createHash('md5').update(value).digest('hex').toUpperCase();
const formatAmount = (amount: number) => amount.toFixed(2);
const maskCardNumber = (cardNumber: unknown) => {
  const lastFour = String(cardNumber || '').replace(/\D/g, '').slice(-4);
  return lastFour ? `•••• ${lastFour}` : undefined;
};

const createPayHereHash = (orderId: string, amount: string) => {
  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

  if (!merchantId || !merchantSecret) {
    throw new Error('PayHere is not configured');
  }

  return md5(`${merchantId}${orderId}${amount}${PAYHERE_CURRENCY}${md5(merchantSecret)}`);
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (customers only — admins are not allowed to place orders)
router.post('/', protect, async (req, res) => {
  try {
    // Admins are not allowed to place orders
    if ((req as any).userRole === 'admin') {
      res.status(403).json({ message: 'Admins are not allowed to place orders' });
      return;
    }

    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    if (![CARD_PAYMENT_METHOD, 'Cash on Delivery'].includes(paymentMethod)) {
      res.status(400).json({ message: 'Unsupported payment method' });
      return;
    }

    if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.postalCode || !shippingAddress?.country) {
      res.status(400).json({ message: 'Complete shipping details are required' });
      return;
    }

    const productIds = orderItems.map((item: any) => item.product);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true }).exec();
    const productsById = new Map(products.map((product) => [product._id.toString(), product]));

    const validatedItems = orderItems.map((item: any) => {
      const quantity = Number(item.qty);
      const product = productsById.get(item.product);

      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > product.countInStock) {
        throw new Error('One or more products are unavailable in the requested quantity');
      }

      return {
        product: product._id,
        name: product.name,
        imageUrl: product.imageUrl,
        qty: quantity,
        price: product.price,
      };
    });

    const itemsPrice = validatedItems.reduce((total, item) => total + item.price * item.qty, 0);
    const shippingPrice = SHIPPING_FEE;
    const taxPrice = Number((itemsPrice * TAX_RATE).toFixed(2));
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    const isCardPayment = paymentMethod === CARD_PAYMENT_METHOD;

    const order = new Order({
      user: (req as any).userId,
      orderItems: validatedItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      currency: PAYHERE_CURRENCY,
      isPaid: isCardPayment,
      paidAt: isCardPayment ? new Date() : undefined,
      paymentResult: isCardPayment ? {
        statusCode: 2,
        statusMessage: 'Payment completed',
      } : undefined,
    });

    const createdOrder = await order.save();

    // Decrement stock for each product in the order
    await Promise.all(
      validatedItems.map((item) =>
        Product.findByIdAndUpdate(item.product, { $inc: { countInStock: -item.qty } }).exec()
      )
    );

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create signed PayHere checkout data for an order
// @route   POST /api/orders/:id/payhere
// @access  Private
router.post('/:id/payhere', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).exec();
    if (!order || order.user.toString() !== (req as any).userId) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.paymentMethod !== CARD_PAYMENT_METHOD || order.isPaid) {
      res.status(400).json({ message: 'This order cannot be paid through PayHere' });
      return;
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const notifyUrl = process.env.PAYHERE_NOTIFY_URL;
    const frontendUrl = process.env.FRONTEND_URL;
    if (!merchantId || !notifyUrl || !frontendUrl) {
      res.status(500).json({ message: 'PayHere is not configured' });
      return;
    }

    const customer = await User.findById((req as any).userId).select('email').exec();
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    const [firstName, ...lastNameParts] = order.shippingAddress.fullName.trim().split(/\s+/);
    const amount = formatAmount(order.totalPrice);
    const orderId = order._id.toString();

    res.json({
      checkoutUrl: process.env.PAYHERE_SANDBOX === 'true'
        ? 'https://sandbox.payhere.lk/pay/checkout'
        : 'https://www.payhere.lk/pay/checkout',
      fields: {
        merchant_id: merchantId,
        return_url: `${frontendUrl}/checkout?payment=return&orderId=${orderId}`,
        cancel_url: `${frontendUrl}/checkout?payment=cancel&orderId=${orderId}`,
        notify_url: notifyUrl,
        order_id: orderId,
        items: `Order ${orderId}`,
        currency: PAYHERE_CURRENCY,
        amount,
        first_name: firstName,
        last_name: lastNameParts.join(' ') || '-',
        email: customer.email,
        phone: order.shippingAddress.phone,
        address: order.shippingAddress.address,
        city: order.shippingAddress.city,
        country: order.shippingAddress.country,
        hash: createPayHereHash(orderId, amount),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
});

// @desc    Receive and verify PayHere payment notifications
// @route   POST /api/orders/payhere/notify
// @access  Public (verified with PayHere signature)
router.post('/payhere/notify', async (req, res) => {
  try {
    const { merchant_id, order_id, payment_id, payhere_amount, payhere_currency, status_code, md5sig, method, status_message, card_no } = req.body;
    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!merchantId || !merchantSecret || merchant_id !== merchantId || !order_id || !md5sig) {
      res.status(400).send('Invalid notification');
      return;
    }

    const expectedSignature = md5(`${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${md5(merchantSecret)}`);
    const receivedSignature = String(md5sig).toUpperCase();
    if (expectedSignature.length !== receivedSignature.length || !timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(receivedSignature))) {
      res.status(400).send('Invalid signature');
      return;
    }

    const order = await Order.findById(order_id).exec();
    if (!order || order.paymentMethod !== CARD_PAYMENT_METHOD || order.currency !== payhere_currency || formatAmount(order.totalPrice) !== String(payhere_amount)) {
      res.status(400).send('Order validation failed');
      return;
    }

    const paymentStatus = Number(status_code);
    order.paymentResult = {
      id: payment_id,
      statusCode: paymentStatus,
      statusMessage: status_message,
      method,
      cardNumber: maskCardNumber(card_no),
      paidAt: paymentStatus === 2 ? new Date() : undefined,
    };
    if (paymentStatus === 2) {
      order.isPaid = true;
      order.paidAt = new Date();
    }
    await order.save();

    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// @desc    Get logged-in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const orders = await Order.find({ user: userId }).exec();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).exec();

    if (order && order.user.toString() === (req as any).userId) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name')
      .populate('orderItems.product', 'name imageUrl')
      .exec();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).exec();

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
