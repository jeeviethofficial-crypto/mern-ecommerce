import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Plus } from 'lucide-react';
import { motion } from 'motion/react';

export function AdminProductCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.post('/api/products', {
        name,
        price: Number(price),
        imageUrl,
        category,
        countInStock: Number(countInStock),
        description,
        isActive
      }, config);
      navigate('/admin/products');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error creating product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto pb-12">
      <Link to="/admin/products" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-8 sm:p-12">
        <h1 className="text-3xl font-extrabold text-neutral-900 mb-8">Add New Product</h1>

        {error && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">{error}</div>}

        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-neutral-300 rounded-xl px-4 py-3 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 border transition-colors"
              placeholder="Product name"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border-neutral-300 rounded-xl px-4 py-3 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 border transition-colors"
                placeholder="29.99"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Stock Count</label>
              <input
                type="number"
                min="0"
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
                className="w-full border-neutral-300 rounded-xl px-4 py-3 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 border transition-colors"
                placeholder="10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full border-neutral-300 rounded-xl px-4 py-3 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 border transition-colors"
              placeholder="https://images.unsplash.com/..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border-neutral-300 rounded-xl px-4 py-3 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 border transition-colors"
              placeholder="Electronics, Furniture, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-neutral-300 rounded-xl px-4 py-3 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 border transition-colors resize-none"
              placeholder="Product description..."
              required
            ></textarea>
          </div>

          <div className="flex items-center">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-3 block text-sm font-medium text-neutral-700">
              Active (Visible to customers)
            </label>
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-4 rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              {submitting ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}