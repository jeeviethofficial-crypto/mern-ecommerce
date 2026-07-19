import { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router';
import { ShoppingCart, User, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export function CustomerLayout() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold tracking-tight text-gray-900">
              E-Shop
            </Link>
            
            <nav className="flex items-center space-x-4 sm:space-x-6">
              <button
                type="button"
                onClick={() => setIsDarkMode((currentTheme) => !currentTheme)}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/cart" className="text-gray-600 hover:text-gray-900 flex items-center gap-2 relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:inline">Cart</span>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-3 sm:right-auto sm:-top-2 sm:left-4 bg-indigo-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              
              {user ? (
                <div className="flex items-center gap-4">
                  {user.role === 'admin' && (
                    <div className="hidden md:flex items-center gap-6 mr-4 pr-6 border-r border-gray-200">
                      <Link to="/admin/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                        Admin: Products
                      </Link>
                      <Link to="/admin/orders" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                        Admin: Orders
                      </Link>
                    </div>
                  )}
                  <Link to="/profile" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">{user.name}</span>
                  </Link>
                  <button onClick={logout} className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">Logout</span>
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} E-Shop. All rights reserved.</p>
        <p className="mt-2 text-xs">Customer Module - MERN E-Commerce</p>
      </footer>
    </div>
  );
}
