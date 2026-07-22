import { Link, useNavigate } from 'react-router';
import { Trash2, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function Cart() {
  const { cartItems, addToCart, removeFromCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const isOutOfStock = item.countInStock === 0;
              const isLowStock = item.countInStock > 0 && item.countInStock <= 5;
              return (
                <div key={item.product} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row items-center gap-4 ${isOutOfStock ? 'opacity-60' : ''}`}>
                  <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                  <div className="flex-1 text-center sm:text-left">
                    <Link to={`/product/${item.product}`} className="font-semibold text-gray-900 hover:text-indigo-600 block mb-1">
                      {item.name}
                    </Link>
                    <p className="font-bold text-gray-900">${item.price.toFixed(2)}</p>
                    {isLowStock && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Only {item.countInStock} unit{item.countInStock !== 1 ? 's' : ''} left in stock</span>
                      </div>
                    )}
                    {isOutOfStock && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-red-600 font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        <span>This item is out of stock</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <select
                      value={item.qty}
                      onChange={(e) => addToCart({ ...item, qty: Number(e.target.value) })}
                      disabled={isOutOfStock}
                      className={`border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2 px-3 border ${isOutOfStock ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                      {[...Array(item.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeFromCart(item.product)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                {/* Dummy calculations for visual sake */}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>$10.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span>${(cartTotal * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-lg">
                  <span>Total</span>
                  <span>${(cartTotal + 10 + cartTotal * 0.08).toFixed(2)}</span>
                </div>
              </div>

              {isAdmin ? (
                <div className="bg-neutral-100 text-neutral-500 px-4 py-3 rounded-xl font-medium text-center">
                  Admins cannot purchase products
                </div>
              ) : (
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
