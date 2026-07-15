import { BrowserRouter, Routes, Route } from 'react-router';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { Home } from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Login } from './pages/Login';
import { Checkout } from './pages/Checkout';
import { Profile } from './pages/Profile';
import { AdminRoute } from './components/AdminRoute';
import { AdminProductList } from './pages/admin/ProductList';
import { AdminProductEdit } from './pages/admin/ProductEdit';
import { AdminOrderList } from './pages/admin/OrderList';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/products" element={<AdminProductList />} />
            <Route path="/admin/product/:id/edit" element={<AdminProductEdit />} />
            <Route path="/admin/orders" element={<AdminOrderList />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
