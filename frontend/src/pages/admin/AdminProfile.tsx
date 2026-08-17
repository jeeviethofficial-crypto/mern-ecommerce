import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Save, Key, User as UserIcon, Shield, Package, ClipboardList, Upload, X, Users } from 'lucide-react';

export function AdminProfile() {
  const { user, logout, updateProfile, uploadProfileImage, changePassword } = useAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/admin/profile');
      return;
    }

    if (user.role !== 'admin') {
      navigate('/');
      return;
    }

    // Initialize form fields with current user data
    setEditName(user.name || '');
    setEditUsername(user.username || '');
    setEditEmail(user.email || '');
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

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image must be smaller than 2MB');
      return;
    }

    setImageError('');
    setIsUploadingImage(true);
    setImageSuccess('');

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64String = event.target?.result as string;
      try {
        await uploadProfileImage(base64String);
        setImageSuccess('Profile photo updated successfully!');
      } catch (err: any) {
        setImageError(err.response?.data?.message || 'Failed to upload profile photo');
      } finally {
        setIsUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!user || user.role !== 'admin') return null;

  const hasProfileImage = user.profileImage && user.profileImage.trim() !== '';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Admin Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            {/* Profile Image */}
            <div className="flex flex-col items-center mb-4">
              {hasProfileImage ? (
                <div className="relative">
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                  />
                  <button
                    onClick={handleRemoveImage}
                    disabled={isUploadingImage}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                    title="Remove photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-2xl font-bold">
                  {user.name.charAt(0)}
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />

              <button
                onClick={triggerFileInput}
                disabled={isUploadingImage}
                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors disabled:opacity-50"
              >
                <Upload className="w-3 h-3" />
                {isUploadingImage ? 'Uploading...' : hasProfileImage ? 'Change Photo' : 'Add Photo'}
              </button>
            </div>

            {imageError && (
              <div className="mb-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 p-2 rounded-lg text-xs font-medium">{imageError}</div>
            )}
            {imageSuccess && (
              <div className="mb-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-2 rounded-lg text-xs font-medium">{imageSuccess}</div>
            )}

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-1">@{user.username}</p>
            <p className="text-slate-500 dark:text-slate-400 mb-4">{user.email}</p>

            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 text-xs font-semibold rounded-full">
                <Shield className="w-3 h-3" />
                Administrator
              </span>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 my-4"></div>

            <nav className="space-y-2">
              <button
                onClick={() => navigate('/admin/products')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Package className="w-4 h-4" />
                Products
              </button>
              <button
                onClick={() => navigate('/admin/orders')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ClipboardList className="w-4 h-4" />
                Orders
              </button>
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Users className="w-4 h-4" />
                Users
              </button>
              <button
                onClick={() => navigate('/admin/profile')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg transition-colors font-medium"
              >
                <UserIcon className="w-4 h-4" />
                Profile
              </button>
            </nav>

            <div className="border-t border-slate-200 dark:border-slate-800 my-4"></div>

            <button
              onClick={logout}
              className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Profile Information Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Information</h2>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>

            {profileError && (
              <div className="mb-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 p-3 rounded-lg text-sm font-medium">{profileError}</div>
            )}
            {profileSuccess && (
              <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg text-sm font-medium">{profileSuccess}</div>
            )}

            {isEditingProfile ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    minLength={3}
                    maxLength={20}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setEditName(user.name || '');
                      setEditUsername(user.username || '');
                      setEditEmail(user.email || '');
                      setProfileError('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Full Name</span>
                  <span className="text-slate-900 dark:text-white font-medium">{user.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Username</span>
                  <span className="text-slate-900 dark:text-white font-medium">{user.username}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Email</span>
                  <span className="text-slate-900 dark:text-white font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 dark:text-slate-400">Role</span>
                  <span className="text-slate-900 dark:text-white font-medium capitalize">{user.role}</span>
                </div>
              </div>
            )}
          </div>

          {/* Password Change Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Change Password</h2>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                >
                  <Key className="w-4 h-4" />
                  Change Password
                </button>
              )}
            </div>

            {passwordError && (
              <div className="mb-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 p-3 rounded-lg text-sm font-medium">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg text-sm font-medium">{passwordSuccess}</div>
            )}

            {isChangingPassword ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    minLength={6}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setPasswordError('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm">Click "Change Password" to update your password.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
