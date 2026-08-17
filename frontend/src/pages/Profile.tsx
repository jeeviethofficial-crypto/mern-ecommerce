import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Package, ChevronRight, Save, Key, User as UserIcon, Upload, X, LogOut, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageCropper } from '../components/ImageCropper';

export function Profile() {
  const { user, logout, updateProfile, uploadProfileImage, changePassword } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile edit form state
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Profile image state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [imageSuccess, setImageSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/profile');
      return;
    }

    setEditName(user.name || '');
    setEditUsername(user.username || '');
    setEditEmail(user.email || '');

    if (user.role !== 'admin') {
      const fetchOrders = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.get('/api/orders/myorders', config);
          setOrders(data);
        } catch (error) {
          console.error('Error fetching orders', error);
        } finally {
          setLoading(false);
        }
      };

      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!editName.trim() || !editUsername.trim() || !editEmail.trim()) {
      setProfileError('All fields are required');
      return;
    }

    if (editUsername.length < 3) {
      setProfileError('Username must be at least 3 characters');
      return;
    }

    try {
      await updateProfile(editName, editUsername, editEmail);
      setProfileSuccess('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsChangingPassword(false);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image must be smaller than 2MB');
      return;
    }

    setImageError('');
    setImageSuccess('');

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result?.toString() || '');
      setShowCropModal(true);
    });
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropSave = async (croppedImageBase64: string) => {
    try {
      setIsUploadingImage(true);
      await uploadProfileImage(croppedImageBase64);
      setImageSuccess('Profile photo updated successfully!');
      setShowCropModal(false);
      setImageSrc(null);
    } catch (err: any) {
      setImageError(err.response?.data?.message || 'Failed to crop and upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    setImageError('');
    setImageSuccess('');
    setIsUploadingImage(true);
    try {
      await uploadProfileImage('');
      setImageSuccess('Profile photo removed successfully!');
    } catch (err: any) {
      setImageError(err.response?.data?.message || 'Failed to remove profile photo');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  if (!user) return null;

  const hasProfileImage = user.profileImage && user.profileImage.trim() !== '';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto">
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Account Settings</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {user.role === 'admin' ? 'Manage your profile and security.' : 'Manage your profile, security, and orders.'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-neutral-100 dark:border-neutral-800 sticky top-28">
            <div className="flex flex-col items-center mb-6 text-center">
              <div className="relative group mb-4">
                {hasProfileImage ? (
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-neutral-800 shadow-lg">
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  </div>
                ) : (
                  <div className="w-28 h-28 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-4xl font-extrabold border-4 border-white dark:border-neutral-800 shadow-lg">
                    {user.name.charAt(0)}
                  </div>
                )}
                
                <button
                  onClick={triggerFileInput}
                  disabled={isUploadingImage}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 hover:scale-110 transition-all disabled:opacity-50"
                  title="Change photo"
                >
                  <Camera className="w-4 h-4" />
                </button>

                {hasProfileImage && (
                  <button
                    onClick={handleRemoveImage}
                    disabled={isUploadingImage}
                    className="absolute top-0 right-0 w-7 h-7 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full flex items-center justify-center shadow-sm hover:bg-red-200 dark:hover:bg-red-900/50 hover:scale-110 transition-all disabled:opacity-50"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <input type="file" ref={fileInputRef} accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onChange={handleImageChange} className="hidden" />

              {imageError && <div className="mt-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-lg w-full">{imageError}</div>}
              {imageSuccess && <div className="mt-2 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-3 py-1.5 rounded-lg w-full">{imageSuccess}</div>}

              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-2">{user.name}</h2>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">@{user.username}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">{user.email}</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 font-semibold text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Profile Information Section */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-neutral-100 dark:border-neutral-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Profile Information</h2>
              {!isEditingProfile && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl transition-colors"
                >
                  <UserIcon className="w-4 h-4" /> Edit Profile
                </motion.button>
              )}
            </div>

            {profileError && <div className="mb-6 p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium">{profileError}</div>}
            {profileSuccess && <div className="mb-6 p-3 bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 text-green-600 dark:text-green-400 rounded-xl text-sm font-medium">{profileSuccess}</div>}

            <AnimatePresence mode="wait">
              {isEditingProfile ? (
                <motion.form
                  key="edit-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleProfileSubmit}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Full Name</label>
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Username</label>
                      <input type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} minLength={3} maxLength={20} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Email Address</label>
                    <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" />
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-lg shadow-indigo-600/20">
                      <Save className="w-4 h-4" /> Save Changes
                    </motion.button>
                    <button type="button" onClick={() => { setIsEditingProfile(false); setEditName(user.name || ''); setEditUsername(user.username || ''); setEditEmail(user.email || ''); setProfileError(''); }} className="px-5 py-2.5 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                      Cancel
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div key="view-info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl">
                    <span className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Full Name</span>
                    <span className="text-neutral-900 dark:text-white font-medium">{user.name}</span>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl">
                    <span className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Username</span>
                    <span className="text-neutral-900 dark:text-white font-medium">@{user.username}</span>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl">
                    <span className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Email Address</span>
                    <span className="text-neutral-900 dark:text-white font-medium">{user.email}</span>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl">
                    <span className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Account Role</span>
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm font-bold capitalize">{user.role}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Password Change Section */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-neutral-100 dark:border-neutral-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Security</h2>
              {!isChangingPassword && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsChangingPassword(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl transition-colors"
                >
                  <Key className="w-4 h-4" /> Change Password
                </motion.button>
              )}
            </div>

            {passwordError && <div className="mb-6 p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium">{passwordError}</div>}
            {passwordSuccess && <div className="mb-6 p-3 bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 text-green-600 dark:text-green-400 rounded-xl text-sm font-medium">{passwordSuccess}</div>}

            <AnimatePresence mode="wait">
              {isChangingPassword ? (
                <motion.form
                  key="password-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handlePasswordSubmit}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Current Password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">New Password</label>
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Confirm New Password</label>
                      <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} minLength={6} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-lg shadow-indigo-600/20">
                      <Save className="w-4 h-4" /> Update Password
                    </motion.button>
                    <button type="button" onClick={() => { setIsChangingPassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); setPasswordError(''); }} className="px-5 py-2.5 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                      Cancel
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div key="password-info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">Ensure your account is using a long, random password to stay secure.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Order History Section */}
          {user.role !== 'admin' && (
            <motion.div variants={itemVariants} className="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-neutral-100 dark:border-neutral-800">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Order History</h2>

              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-24 bg-neutral-100 dark:bg-neutral-800 rounded-2xl"></div>)}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-800/30 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700">
                  <Package className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">No orders yet</h3>
                  <p className="text-neutral-500 dark:text-neutral-400">When you place orders, they will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      key={order._id}
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-neutral-800 transition-all group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-white dark:bg-neutral-900 p-3 rounded-full border border-neutral-200 dark:border-neutral-700 group-hover:border-indigo-300 dark:group-hover:border-indigo-500/50 transition-colors">
                          <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right w-full sm:w-auto flex flex-col items-end">
                        <p className="font-extrabold text-lg text-neutral-900 dark:text-white">${order.totalPrice.toFixed(2)}</p>
                        <div className="flex flex-wrap gap-2 justify-end mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${order.isPaid ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                            {order.isPaid ? 'Paid' : 'Payment Pending'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${order.isDelivered ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                            {order.isDelivered ? 'Delivered' : 'Processing'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="hidden sm:block w-5 h-5 text-neutral-300 dark:text-neutral-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Crop Modal */}
      {showCropModal && imageSrc && (
        <ImageCropper
          imageSrc={imageSrc}
          isUploading={isUploadingImage}
          onCropSave={handleCropSave}
          onCancel={() => {
            setShowCropModal(false);
            setImageSrc(null);
          }}
        />
      )}
    </motion.div>
  );
}
