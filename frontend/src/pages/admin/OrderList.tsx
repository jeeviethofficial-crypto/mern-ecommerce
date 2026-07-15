import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Check, X } from 'lucide-react';
import { motion } from 'motion/react';

export function AdminOrderList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get('/api/orders', config);
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const deliverHandler = async (id: string) => {
    if (window.confirm('Mark order as delivered?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        await axios.put(`/api/orders/${id}/deliver`, {}, config);
        fetchOrders();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-neutral-900">Orders (Admin)</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-neutral-50 text-neutral-500 text-sm font-medium border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">USER ID</th>
                  <th className="px-6 py-4">DATE</th>
                  <th className="px-6 py-4">TOTAL</th>
                  <th className="px-6 py-4">PAID</th>
                  <th className="px-6 py-4">DELIVERED</th>
                  <th className="px-6 py-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((order) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={order._id} 
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-neutral-900 font-medium">{order._id}</td>
                    <td className="px-6 py-4 text-neutral-500 text-sm">{order.user}</td>
                    <td className="px-6 py-4 text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold">${order.totalPrice.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {order.isPaid ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-red-500" />}
                    </td>
                    <td className="px-6 py-4">
                      {order.isDelivered ? (
                        <span className="text-green-600 text-sm font-semibold">{new Date(order.deliveredAt).toLocaleDateString()}</span>
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!order.isDelivered && (
                        <button 
                          onClick={() => deliverHandler(order._id)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold py-1.5 px-3 rounded-lg text-sm transition-colors"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
