import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { CheckCircle2 } from 'lucide-react';

export function Checkout() {
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState('123 Main St');
  const [city, setCity] = useState('Anytown');
  const [postalCode, setPostalCode] = useState('12345');
  const [country, setCountry] = useState('USA');
  const [paymentMethod, setPaymentMethod] = useState('PayPal');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    }
  }, [user, navigate]);

  const placeOrderHandler = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      };

      await axios.post(
        '/api/orders',
        {
          orderItems: cartItems,
          shippingAddress: {
            fullName: user?.name,
            address,
            city,
            postalCode,
            country,
          },
          paymentMethod,
          itemsPrice: cartTotal,
          shippingPrice: 10,
          taxPrice: cartTotal * 0.08,
          totalPrice: cartTotal + 10 + (cartTotal * 0.08),
        },
        config
      );

      clearCart();
      setOrderPlaced(true);
    } catch (error) {
      console.error(error);
      alert('Error placing order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Order Placed Successfully!</h2>
        <p className="text-xl text-gray-600 mb-8">Thank you for your purchase.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Address"
                className="w-full px-4 py-2 border rounded-md"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  className="w-full px-4 py-2 border rounded-md"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  className="w-full px-4 py-2 border rounded-md"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
              <input
                type="text"
                placeholder="Country"
                className="w-full px-4 py-2 border rounded-md"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  value="PayPal" 
                  checked={paymentMethod === 'PayPal'} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                PayPal
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  value="Stripe" 
                  checked={paymentMethod === 'Stripe'} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Stripe
              </label>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.qty} x {item.name}</span>
                  <span>${(item.qty * item.price).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-300 my-2 pt-2 flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>$10.00</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span>${(cartTotal * 0.08).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-300 pt-3 flex justify-between font-bold text-gray-900 text-lg">
                <span>Total</span>
                <span>${(cartTotal + 10 + cartTotal * 0.08).toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={placeOrderHandler}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
