import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ShoppingCart, ArrowLeft, MessageSquare, Star, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Rating } from '../components/Rating';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/products/${id}`);
      setProduct(data);
    } catch (err) {
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      product: product._id,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      countInStock: product.countInStock,
      qty,
    });
    navigate('/cart');
  };

  const submitReviewHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=/product/' + id);
      return;
    }

    // Admins are not allowed to rate products
    if (user.role === 'admin') {
      setReviewError('Admins are not allowed to rate products');
      return;
    }

    try {
      setReviewLoading(true);
      setReviewError('');

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.post(`/api/products/${id}/reviews`, { rating, comment }, config);

      setReviewSuccess(true);
      setRating(0);
      setComment('');
      fetchProduct(); // Refresh product to get new reviews

      setTimeout(() => {
        setReviewSuccess(false);
      }, 3000);

    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Error submitting review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-40">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error) return <div className="text-center py-20 text-red-500 font-medium">{error}</div>;
  if (!product) return null;

  const isLowStock = product.countInStock > 0 && product.countInStock <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-12"
    >
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Collection
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
        {/* Image Gallery */}
        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden aspect-square flex items-center justify-center p-8">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover rounded-2xl shadow-xl dark:shadow-slate-950"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-center">
          <div className="uppercase tracking-widest text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-3">
            {product.category}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <Rating value={product.rating} text={`${product.numReviews} review${product.numReviews !== 1 ? 's' : ''}`} />
          </div>

          <div className="flex items-baseline gap-4 mb-4">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              ${product.price.toFixed(2)}
            </div>
            {product.countInStock > 0 ? (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
                isLowStock
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                {product.countInStock} unit{product.countInStock !== 1 ? 's' : ''} available
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Out of stock
              </span>
            )}
          </div>

          {/* Low Stock Warning */}
          {isLowStock && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-4 py-2.5 rounded-xl mb-6 text-sm font-medium"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Hurry! Only {product.countInStock} unit{product.countInStock !== 1 ? 's' : ''} left in stock.</span>
            </motion.div>
          )}

          <p className="text-slate-600 dark:text-slate-300 text-lg mb-10 leading-relaxed max-w-xl">
            {product.description}
          </p>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 mt-auto">
            {user?.role === 'admin' ? (
              <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-6 py-4 rounded-xl font-medium flex items-center justify-center mb-4">
                Admins cannot purchase products
              </div>
            ) : product.countInStock > 0 ? (
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden w-fit h-14 bg-slate-50 dark:bg-slate-800">
                  <button
                    className="px-5 h-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                  >
                    -
                  </button>
                  <div className="px-4 h-full flex items-center justify-center font-semibold min-w-[3.5rem] bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {qty}
                  </div>
                  <button
                    className="px-5 h-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                    onClick={() => setQty(Math.min(product.countInStock, qty + 1))}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-bold h-14 px-8 rounded-xl transition-all hover:shadow-lg active:scale-95"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
            ) : (
              <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-6 py-4 rounded-xl font-medium flex items-center justify-center mb-4">
                Currently Out of Stock
              </div>
            )}

            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.countInStock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              {product.countInStock > 0
                ? `${product.countInStock} unit${product.countInStock !== 1 ? 's' : ''} available in stock`
                : 'Please check back later for availability.'}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Customer Reviews
            </h2>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Write a Review</h3>

              {user && user.role === 'admin' ? (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-slate-600 dark:text-slate-300 mb-4">Admins are not allowed to rate products.</p>
                </div>
              ) : user ? (
                <form onSubmit={submitReviewHandler} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Very Good</option>
                      <option value="3">3 - Good</option>
                      <option value="2">2 - Fair</option>
                      <option value="1">1 - Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Comment</label>
                    <textarea
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none"
                      placeholder="Share your thoughts..."
                      required
                    ></textarea>
                  </div>

                  {reviewError && <div className="text-rose-500 dark:text-rose-400 text-sm font-medium">{reviewError}</div>}
                  {reviewSuccess && <div className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Review submitted successfully!</div>}

                  <button
                    disabled={reviewLoading}
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                  >
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-slate-600 dark:text-slate-300 mb-4">Please sign in to write a review.</p>
                  <Link to={`/login?redirect=/product/${product._id}`} className="inline-block bg-slate-900 dark:bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors">
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {product.reviews.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center h-full min-h-[300px]">
                <Star className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Reviews Yet</h3>
                <p className="text-slate-500 dark:text-slate-400">Be the first to share your experience with this product.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {product.reviews.map((review: any) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={review._id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{review.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Rating value={review.rating} />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{review.comment}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
