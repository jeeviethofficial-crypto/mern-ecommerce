import { useState, useEffect } from 'react';
import { Trash2, User as UserIcon, Key } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';

export function AdminUserList() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get('/api/users', config);
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteHandler = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        await axios.delete(`/api/users/${id}`, config);
        fetchUsers();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error deleting user');
        console.error('Error deleting user', error);
      }
    }
  };

  const makeAdminHandler = async (id: string, currentRole: string) => {
    if (window.confirm(`Are you sure you want to change this user's role?`)) {
      try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        await axios.put(`/api/users/${id}`, { role: currentRole === 'admin' ? 'customer' : 'admin' }, config);
        fetchUsers();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error updating user role');
        console.error('Error updating user role', error);
      }
    }
  };

  const resetPasswordHandler = async (id: string, name: string) => {
    const newPassword = window.prompt(`Enter new password for ${name} (min 6 characters):`);
    if (newPassword === null) return;
    
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    
    if (window.confirm(`Are you sure you want to reset the password for ${name}?`)) {
      try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        await axios.put(`/api/users/${id}`, { password: newPassword }, config);
        alert('Password reset successfully.');
        fetchUsers();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error resetting password');
        console.error('Error resetting password', error);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Users (Admin)</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">NAME</th>
                  <th className="px-6 py-4">EMAIL</th>
                  <th className="px-6 py-4">PASSWORD (HASH)</th>
                  <th className="px-6 py-4">ROLE</th>
                  <th className="px-6 py-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={u._id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{u._id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                        {u.profileImage ? <img src={u.profileImage} alt={u.name} className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 m-2.5 text-slate-400" />}
                      </div>
                      {u.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{u.email}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400 max-w-[150px] truncate" title={u.password}>
                      {u.password || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => makeAdminHandler(u._id, u.role)}
                        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full hover:opacity-80 transition-opacity cursor-pointer ${u.role === 'admin' ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300'}`}
                        title="Click to toggle role"
                      >
                        {u.role === 'admin' ? 'Admin' : 'Customer'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => resetPasswordHandler(u._id, u.name)}
                        title="Reset Password"
                        className="inline-flex text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 p-2 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteHandler(u._id)}
                        title="Delete User"
                        className="inline-flex text-rose-600 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 p-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
