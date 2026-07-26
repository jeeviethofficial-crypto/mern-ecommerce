import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { CheckCircle2, CreditCard, Banknote, ShieldCheck } from 'lucide-react';

export function Checkout() {
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Sri Lanka');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [paymentStatusLoading, setPaymentStatusLoading] = useState(false);

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [showCardForm, setShowCardForm] = useState(false);

  const returnedOrderId = searchParams.get('orderId');
  const paymentReturn = searchParams.get('payment');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    // Admins are not allowed to place orders
    if (user.role === 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user || !returnedOrderId || !paymentReturn) return;

    const fetchPaymentStatus = async () => {
      try {
        setPaymentStatusLoading(true);
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`/api/orders/${returnedOrderId}`, config);
        setPaymentOrder(data);
      } catch (error) {
        console.error('Error checking payment status', error);
      } finally {
        setPaymentStatusLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [user, returnedOrderId, paymentReturn]);

  const startPayHereCheckout = (checkoutUrl: string, fields: Record<string, string>) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = checkoutUrl;

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  // Card input formatters
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2);
    }
    return digits;
  };

  const formatCvv = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 4);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiryDate(formatExpiry(e.target.value));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(formatCvv(e.target.value));
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    if (method === 'Card') {
      setShowCardForm(true);
    } else {
      setShowCardForm(false);
    }
  };

  const placeOrderHandler = async () => {
    // Admins are not allowed to place orders
    if (user?.role === 'admin') {
      alert('Admins are not allowed to place orders');
      return;
    }

    try {
      if (!address || !phone || !city || !postalCode || !country) {
        alert('Please complete your shipping details.');
        return;
      }

      setLoading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      };

      const { data: order } = await axios.post(
        '/api/orders',
        {
          orderItems: cartItems,
          shippingAddress: {
            fullName: user?.name,
            phone,
            address,
            city,
            postalCode,
            country,
          },
          paymentMethod,
        },
        config
      );

      clearCart();
      if (paymentMethod === 'Cash on Delivery') {
        setOrderPlaced(true);
        return;
      }

      if (paymentMethod === 'PayPal' || paymentMethod === 'Card') {
        // Mocking payment redirect/success since PayHere isn't configured in this environment
        setOrderPlaced(true);
        return;
      }

      const { data: payment } = await axios.post(`/api/orders/${order._id}/payhere`, {}, config);
      startPayHereCheckout(payment.checkoutUrl, payment.fields);
    } catch (error) {
      console.error(error);
      alert('Error placing order');
    } finally {
      setLoading(false);
    }
  };

  if (paymentReturn && returnedOrderId) {
    const isPaid = paymentOrder?.isPaid;
    const wasCancelled = paymentReturn === 'cancel';

    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <CheckCircle2 className={`w-20 h-20 mx-auto mb-6 ${isPaid ? 'text-emerald-500' : 'text-amber-500'}`} />
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
          {paymentStatusLoading ? 'Checking payment status...' : isPaid ? 'Payment Successful' : wasCancelled ? 'Payment Cancelled' : 'Payment Processing'}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
          {isPaid
            ? 'Your PayHere payment has been verified and your order is confirmed.'
            : wasCancelled
              ? 'Your order was not paid. You can return to your profile and try again.'
              : 'We are waiting for PayHere to confirm your payment. Refresh this page in a moment if needed.'}
        </p>
        <button
          onClick={() => navigate('/profile')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
        >
          View My Orders
        </button>
      </div>
    );
  }

  if (cartItems.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Order Placed Successfully!</h2>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">Thank you for your purchase.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Shipping Address</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Address"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
              <input
                type="text"
                placeholder="Country"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Payment Method</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none transition-all ${paymentMethod === 'Card' ? 'border-indigo-600 dark:border-indigo-500 ring-1 ring-indigo-600 dark:ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-800'}`} onClick={() => handlePaymentMethodChange('Card')}>
                <div className="flex flex-1">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                      <CreditCard className={`w-5 h-5 ${paymentMethod === 'Card' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                      Credit / Debit Card
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Securely processed by PayHere
                    </span>
                  </div>
                </div>
                <CheckCircle2 className={`h-5 w-5 ${paymentMethod === 'Card' ? 'text-indigo-600 dark:text-indigo-400' : 'text-transparent'}`} aria-hidden="true" />
              </div>

              {showCardForm && (
                <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4 shadow-sm">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1.5">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1.5">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1.5">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                        value={expiryDate}
                        onChange={handleExpiryChange}
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1.5">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                        value={cvv}
                        onChange={handleCvvChange}
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none transition-all ${paymentMethod === 'PayPal' ? 'border-indigo-600 dark:border-indigo-500 ring-1 ring-indigo-600 dark:ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-800'}`} onClick={() => handlePaymentMethodChange('PayPal')}>
                <div className="flex flex-1">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                      <svg className={`w-5 h-5 ${paymentMethod === 'PayPal' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zM8.28 15.63H9.98c4.015 0 6.645-1.503 7.37-5.234.02-.102.04-.207.058-.314.19-1.282.047-2.31-.692-3.15-1.164-1.32-3.32-1.32-6.07-1.32H6.55L4.8 15.63h3.48zm1.096-12.78h4.528c1.693 0 2.94.385 3.513 1.037.47.536.634 1.25.433 2.612-.023.153-.052.313-.082.476-.714 3.666-3.238 4.606-6.494 4.606h-1.52c-.524 0-.968.382-1.05.9l-.36 2.29h-3.48l1.45-9.19c.08-.52.527-.902 1.05-.902z" />
                      </svg>
                      PayPal
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      Safe and secure online payments
                    </span>
                  </div>
                </div>
                <CheckCircle2 className={`h-5 w-5 ${paymentMethod === 'PayPal' ? 'text-indigo-600 dark:text-indigo-400' : 'text-transparent'}`} aria-hidden="true" />
              </div>

              <div className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none transition-all ${paymentMethod === 'Cash on Delivery' ? 'border-indigo-600 dark:border-indigo-500 ring-1 ring-indigo-600 dark:ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-800'}`} onClick={() => handlePaymentMethodChange('Cash on Delivery')}>
                <div className="flex flex-1">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                      <Banknote className={`w-5 h-5 ${paymentMethod === 'Cash on Delivery' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                      Cash on Delivery
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      Pay when you receive your order
                    </span>
                  </div>
                </div>
                <CheckCircle2 className={`h-5 w-5 ${paymentMethod === 'Cash on Delivery' ? 'text-indigo-600 dark:text-indigo-400' : 'text-transparent'}`} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                  <span>{item.qty} x {item.name}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">${(item.qty * item.price).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 dark:border-slate-800 my-2 pt-2 flex justify-between text-slate-600 dark:text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between font-bold text-slate-900 dark:text-white text-lg">
                <span>Total</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <button
              onClick={placeOrderHandler}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : paymentMethod === 'Card' ? 'Continue to Secure Card Payment' : paymentMethod === 'PayPal' ? 'Continue to PayPal' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
