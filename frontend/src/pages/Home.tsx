import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { motion } from 'motion/react';
import { Rating } from '../components/Rating';

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  rating: number;
  numReviews: number;
  countInStock: number;
}

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products');
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-neutral-900 rounded-[2.5rem] overflow-hidden shadow-2xl text-white py-20 px-8 sm:px-16 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between min-h-[500px]"
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400 via-neutral-900 to-neutral-900 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl lg:pr-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-indigo-100">Next-Gen Commerce Experience</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]"
          >
            Curated gear for <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              modern living.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-neutral-400 mb-10 max-w-xl mx-auto lg:mx-0"
          >
            Discover our premium selection of electronics, furniture, and accessories designed to elevate your everyday workflow.
          </motion.p>
          
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 bg-white text-neutral-900 px-8 py-4 rounded-full font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] group"
            >
              Shop Collection
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="hidden lg:block relative z-10 w-full max-w-md h-[400px]"
        >
          {/* Abstract decoration for hero */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 rounded-3xl blur-3xl"></div>
          <div className="absolute inset-4 border border-white/20 rounded-3xl backdrop-blur-md bg-white/10 flex items-center justify-center overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
             <img src="https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&q=80" alt="Hero Featured" className="w-full h-full object-cover opacity-90 hover:scale-110 transition-transform duration-700" />
          </div>
          
          {/* Floating Badges */}
          <motion.div 
            animate={{ y: [0, 10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -right-8 top-12 bg-white text-neutral-900 font-bold py-2 px-4 rounded-xl shadow-xl border border-neutral-100 flex items-center gap-2"
          >
            <span className="text-xl">🔥</span> 
            <div>
              <div className="text-xs text-neutral-500 uppercase tracking-wider">Hot Trend</div>
              <div className="text-sm">Premium Gear</div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -left-6 bottom-16 bg-neutral-900/80 backdrop-blur-md text-white font-bold py-3 px-5 rounded-xl shadow-xl border border-white/10 flex items-center gap-3"
          >
            <div className="bg-indigo-500 p-2 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm">New Arrivals</div>
              <div className="text-xs text-indigo-300">Shop Now</div>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Featured Products */}
      <section id="featured-products" className="pt-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">New Arrivals</h2>
            <p className="text-neutral-500 mt-2">Handpicked essentials for your workspace.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {loading ? (
            /* Skeleton placeholders */
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="w-full aspect-[4/5] bg-neutral-100 rounded-2xl animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-5 bg-neutral-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-neutral-100 rounded w-1/4 animate-pulse"></div>
                </div>
              </div>
            ))
          ) : (
            products.map((product, index) => {
              const isLowStock = product.countInStock > 0 && product.countInStock <= 5;
              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    to={`/product/${product._id}`} 
                    className="group flex flex-col gap-4"
                  >
                    <div className="relative w-full aspect-[4/5] bg-neutral-100 rounded-2xl overflow-hidden">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                      {isLowStock && (
                        <div className="absolute top-3 right-3 bg-amber-100 text-amber-800 p-1.5 rounded-full">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-semibold text-neutral-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        <span className="font-bold text-neutral-900">${product.price.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-neutral-500">{product.category}</p>
                      <div className="mt-1">
                        <Rating value={product.rating} text={`(${product.numReviews})`} />
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
                        {product.countInStock > 0 ? (
                          <>
                            <span className={`w-1.5 h-1.5 rounded-full ${isLowStock ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                            <span className={isLowStock ? 'text-amber-700' : 'text-green-700'}>
                              {isLowStock ? `Only ${product.countInStock} unit${product.countInStock !== 1 ? 's' : ''} left` : `${product.countInStock} unit${product.countInStock !== 1 ? 's' : ''} left`}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            <span className="text-red-600">Out of stock</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
