import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Save } from 'lucide-react';
import { motion } from 'motion/react';

export function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setName(data.name);
        setPrice(data.price);
        setImageUrl(data.imageUrl);
        setCategory(data.category);
        setCountInStock(data.countInStock);
        setDescription(data.description);
        setIsActive(data.isActive);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`/api/products/${id}`, {
        name,
        price,
        imageUrl,
        category,
        countInStock,
        description,
        isActive
      }, config);
      navigate('/admin/products');
    } catch (error) {
      console.error(error);
      alert('Error updating product');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto pb-12">
      <Link to="/admin/products" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>
      
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-8 sm:p-12">
        <h1 className="text-3xl font-extrabold text-neutral-900 mb-8">Edit Product</h1>
        
        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full border-neutral-300 rounded-xl px-4 py-3 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 border transition-colors"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Price ($)</label>
              <input 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(Number(e.target.value))} 
                className="w-full border-neutral-300 rounded-xl px-4 py-3 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 border transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Stock Count</label>
              <input 
                type="number" 
                value={countInStock} 
                onChange={(e) => setCountInStock(Number(e.target.value))} 
                className="w-full border-neutral-300 rounded-xl px-4 py-3 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 border transition-colors"
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
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Product
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
