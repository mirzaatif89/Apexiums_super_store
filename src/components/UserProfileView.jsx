import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Camera,
  ChevronRight,
  CreditCard,
  Lock,
  MapPin,
  Package,
  Pencil,
  Settings,
  ShieldCheck,
  SquarePen,
  Truck,
  Upload,
  User,
  X
} from 'lucide-react';

export default function UserProfileView({
  session,
  onBack,
  onLogout,
  onNavigateTab,
  onOpenLogin
}) {
  const fileInputRef = useRef(null);

  const [profileName, setProfileName] = useState(session?.name || session?.username || 'Esther Howard');
  const [profileEmail, setProfileEmail] = useState(session?.email || 'esther.howard@example.com');
  const [profilePhone, setProfilePhone] = useState(session?.phone || '603.555.0123');
  const [avatarUrl, setAvatarUrl] = useState(() => {
    if (session?.avatar) return session.avatar;
    if (typeof localStorage !== 'undefined') {
      const savedAvatar = localStorage.getItem('apexiums-user-avatar');
      if (savedAvatar) return savedAvatar;
      try {
        const savedSession = localStorage.getItem('apexiums-auth-session');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.avatar) return parsed.avatar;
        }
      } catch (e) {}
    }
    return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80';
  });

  React.useEffect(() => {
    if (session) {
      if (session.name || session.username) setProfileName(session.name || session.username);
      if (session.email) setProfileEmail(session.email);
      if (session.phone) setProfilePhone(session.phone);
      if (session.avatar) {
        setAvatarUrl(session.avatar);
      } else if (typeof localStorage !== 'undefined') {
        const savedAvatar = localStorage.getItem('apexiums-user-avatar');
        if (savedAvatar) setAvatarUrl(savedAvatar);
      }
    }
  }, [session]);

  // Modals for menu items
  const [activeModal, setActiveModal] = useState(null); // 'address' | 'payment' | 'privacy' | 'settings' | 'editProfile'

  // Editable forms state
  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Home Address', address: '742 Evergreen Terrace, Springfield, OR', isDefault: true }
  ]);
  const [newAddress, setNewAddress] = useState('');

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, name: 'Visa ending in 4242', exp: '12/28', isDefault: true }
  ]);

  const [editNameInput, setEditNameInput] = useState(profileName);
  const [editEmailInput, setEditEmailInput] = useState(profileEmail);
  const [editPhoneInput, setEditPhoneInput] = useState(profilePhone);
  const [editAvatarInput, setEditAvatarInput] = useState(avatarUrl || '');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const persistProfileData = (newAvatar, newName, newEmail, newPhone) => {
    try {
      const currentAvatar = newAvatar !== undefined ? newAvatar : avatarUrl;
      const currentName = newName !== undefined ? newName : profileName;
      const currentEmail = newEmail !== undefined ? newEmail : profileEmail;
      const currentPhone = newPhone !== undefined ? newPhone : profilePhone;

      if (currentAvatar) {
        localStorage.setItem('apexiums-user-avatar', currentAvatar);
      }

      const savedSessionStr = localStorage.getItem('apexiums-auth-session');
      let currentSession = savedSessionStr ? JSON.parse(savedSessionStr) : (session || {});
      const updatedSession = {
        ...currentSession,
        name: currentName,
        email: currentEmail,
        phone: currentPhone,
        avatar: currentAvatar
      };
      localStorage.setItem('apexiums-auth-session', JSON.stringify(updatedSession));

      const regUsersStr = localStorage.getItem('apexiums-registered-users');
      if (regUsersStr) {
        const usersList = JSON.parse(regUsersStr);
        const updatedUsers = usersList.map((u) => {
          if (u.email === currentEmail || u.username === currentSession?.username || u.id === currentSession?.id) {
            return { ...u, name: currentName, phone: currentPhone, avatar: currentAvatar };
          }
          return u;
        });
        localStorage.setItem('apexiums-registered-users', JSON.stringify(updatedUsers));
      }
    } catch (e) {
      console.error('Failed to persist profile picture', e);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result;
        if (result) {
          setAvatarUrl(result);
          setEditAvatarInput(result);
          persistProfileData(result, profileName, profileEmail, profilePhone);
          showToast('Profile picture saved permanently!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileName(editNameInput);
    setProfileEmail(editEmailInput);
    setProfilePhone(editPhoneInput);
    const newAvatar = editAvatarInput || null;
    setAvatarUrl(newAvatar);
    persistProfileData(newAvatar, editNameInput, editEmailInput, editPhoneInput);
    setActiveModal(null);
    showToast('Profile updated & saved!');
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    setAddresses([
      ...addresses,
      { id: Date.now(), label: 'New Address', address: newAddress, isDefault: addresses.length === 0 }
    ]);
    setNewAddress('');
    showToast('New address added!');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans max-w-md mx-auto relative pb-20 sm:border-x sm:border-slate-100 sm:shadow-lg">
      {/* Hidden File Input for Local Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Toast Notification */}
      {toastMessage ? (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg transition-all animate-bounce">
          {toastMessage}
        </div>
      ) : null}

      {/* Top Header Bar */}
      <div className="sticky top-0 z-10 bg-white px-4 py-4 flex items-center justify-between border-b border-slate-100/60">
        <button
          type="button"
          onClick={() => {
            if (onBack) onBack();
            else window.history.back();
          }}
          className="p-1.5 -ml-1 text-slate-800 hover:bg-slate-100 rounded-full transition cursor-pointer"
          aria-label="Go Back"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <h1 className="text-base font-bold text-slate-900 tracking-tight">Profile</h1>

        <div className="w-6" /> {/* Spacer for symmetry */}
      </div>

      {/* User Avatar & Basic Info */}
      <div className="pt-6 pb-6 text-center px-4">
        <div className="relative inline-block group">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-slate-100 shadow-xs mx-auto bg-slate-100 flex items-center justify-center cursor-pointer relative"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={profileName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                <User className="w-14 h-14" />
              </div>
            )}

            {/* Hover overlay for upload prompt */}
            <div className="absolute inset-0 bg-slate-900/30 text-white opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 text-[11px] font-semibold">
              <Camera className="w-5 h-5 text-white" />
              <span>Upload</span>
            </div>
          </div>

          {/* Red Edit Pencil Floating Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-[#E8262A] hover:bg-red-600 text-white p-2.5 rounded-full shadow-md border-2 border-white transition transform active:scale-95 cursor-pointer"
            title="Upload Profile Picture"
            aria-label="Upload Profile Picture"
          >
            <Pencil className="w-4 h-4 text-white stroke-[2.5]" />
          </button>
        </div>

        {/* User Name */}
        <h2 className="text-xl font-extrabold text-slate-900 mt-3 tracking-tight">
          {profileName}
        </h2>

        {/* Contact info subtext */}
        <p className="text-xs text-slate-400 mt-1 font-medium tracking-tight">
          {profileEmail} / {profilePhone}
        </p>
      </div>

      {/* "My orders" Section */}
      <div className="px-6 py-4 mt-2">
        <h3 className="text-base font-bold text-slate-900 mb-6 tracking-tight">
          My orders
        </h3>

        {/* 4 Quick Action Columns */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {/* To pay */}
          <button
            type="button"
            onClick={() => {
              if (onNavigateTab) onNavigateTab('orders', 'To pay');
              else showToast('Filter orders: To pay');
            }}
            className="flex flex-col items-center justify-center group cursor-pointer"
          >
            <CreditCard className="w-6 h-6 text-[#E8262A] stroke-[1.8] group-hover:scale-110 transition" />
            <span className="text-[12px] text-slate-600 font-medium mt-3 group-hover:text-[#E8262A] transition">
              To pay
            </span>
          </button>

          {/* To ship */}
          <button
            type="button"
            onClick={() => {
              if (onNavigateTab) onNavigateTab('orders', 'To ship');
              else showToast('Filter orders: To ship');
            }}
            className="flex flex-col items-center justify-center group cursor-pointer"
          >
            <Truck className="w-6 h-6 text-[#E8262A] stroke-[1.8] group-hover:scale-110 transition" />
            <span className="text-[12px] text-slate-600 font-medium mt-3 group-hover:text-[#E8262A] transition">
              To ship
            </span>
          </button>

          {/* To receive */}
          <button
            type="button"
            onClick={() => {
              if (onNavigateTab) onNavigateTab('orders', 'To receive');
              else showToast('Filter orders: To receive');
            }}
            className="flex flex-col items-center justify-center group cursor-pointer"
          >
            <Package className="w-6 h-6 text-[#E8262A] stroke-[1.8] group-hover:scale-110 transition" />
            <span className="text-[12px] text-slate-600 font-medium mt-3 group-hover:text-[#E8262A] transition">
              To receive
            </span>
          </button>

          {/* To review */}
          <button
            type="button"
            onClick={() => {
              if (onNavigateTab) onNavigateTab('orders', 'To review');
              else showToast('Filter orders: To review');
            }}
            className="flex flex-col items-center justify-center group cursor-pointer"
          >
            <SquarePen className="w-6 h-6 text-[#E8262A] stroke-[1.8] group-hover:scale-110 transition" />
            <span className="text-[12px] text-slate-600 font-medium mt-3 group-hover:text-[#E8262A] transition">
              To review
            </span>
          </button>
        </div>
      </div>

      {/* Action Menu List */}
      <div className="mt-4 px-6 space-y-1">
        {/* Manage Address */}
        <button
          type="button"
          onClick={() => setActiveModal('address')}
          className="w-full flex items-center justify-between py-4 border-b border-slate-100 hover:bg-slate-50/80 px-2 rounded-xl transition cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <MapPin className="w-5 h-5 text-[#E8262A] stroke-[2]" />
            <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
              Manage address
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition" />
        </button>

        {/* Payment method */}
        <button
          type="button"
          onClick={() => setActiveModal('payment')}
          className="w-full flex items-center justify-between py-4 border-b border-slate-100 hover:bg-slate-50/80 px-2 rounded-xl transition cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <CreditCard className="w-5 h-5 text-[#E8262A] stroke-[2]" />
            <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
              Payment method
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition" />
        </button>

        {/* Privacy Policy */}
        <button
          type="button"
          onClick={() => setActiveModal('privacy')}
          className="w-full flex items-center justify-between py-4 border-b border-slate-100 hover:bg-slate-50/80 px-2 rounded-xl transition cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-5 h-5 text-[#E8262A] stroke-[2]" />
            <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
              Privacy Policy
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition" />
        </button>

        {/* Setting */}
        <button
          type="button"
          onClick={() => setActiveModal('settings')}
          className="w-full flex items-center justify-between py-4 hover:bg-slate-50/80 px-2 rounded-xl transition cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <Settings className="w-5 h-5 text-[#E8262A] stroke-[2]" />
            <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
              Setting
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition" />
        </button>
      </div>

      {/* Logout Option Button (if logged in) */}
      {onLogout ? (
        <div className="px-6 mt-8">
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3 bg-red-50 hover:bg-red-100 text-[#E8262A] font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      ) : null}

      {/* MODAL 1: EDIT PROFILE */}
      {activeModal === 'editProfile' ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Profile</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#E8262A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmailInput}
                  onChange={(e) => setEditEmailInput(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#E8262A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editPhoneInput}
                  onChange={(e) => setEditPhoneInput(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#E8262A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Profile Photo</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition border border-slate-200 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#E8262A]" />
                    <span>Upload Image File</span>
                  </button>
                  {editAvatarInput ? (
                    <button
                      type="button"
                      onClick={() => setEditAvatarInput('')}
                      className="py-2 px-3 bg-red-50 hover:bg-red-100 text-[#E8262A] text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-11 bg-[#E8262A] hover:bg-red-900 text-white font-bold text-xs rounded-xl transition shadow-sm"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* MODAL 2: MANAGE ADDRESS */}
      {activeModal === 'address' ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Manage Address</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {addresses.map((addr) => (
                <div key={addr.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                    <span>{addr.label}</span>
                    {addr.isDefault ? (
                      <span className="text-[10px] bg-red-100 text-[#E8262A] px-2 py-0.5 rounded-full font-bold">
                        Default
                      </span>
                    ) : null}
                  </div>
                  <p className="text-slate-600">{addr.address}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddAddress} className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Add New Address</label>
              <textarea
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Enter street name, house/suite number, city"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl h-20 outline-none focus:bg-white focus:border-[#E8262A]"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-[#E8262A] text-white font-bold text-xs rounded-xl hover:bg-red-900 transition"
              >
                Save New Address
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {/* MODAL 3: PAYMENT METHOD */}
      {activeModal === 'payment' ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Payment Methods</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((pm) => (
                <div key={pm.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-[#E8262A]" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{pm.name}</p>
                      <p className="text-[10px] text-slate-400">Expires {pm.exp}</p>
                    </div>
                  </div>
                  {pm.isDefault ? (
                    <span className="text-[10px] bg-red-100 text-[#E8262A] px-2 py-0.5 rounded-full font-bold">
                      Primary
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                showToast('Card addition flow opened');
              }}
              className="w-full py-2.5 border border-dashed border-[#E8262A] text-[#E8262A] font-bold text-xs rounded-xl hover:bg-red-50 transition"
            >
              + Add Credit / Debit Card
            </button>
          </div>
        </div>
      ) : null}

      {/* MODAL 4: PRIVACY POLICY */}
      {activeModal === 'privacy' ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Privacy Policy</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                At Apexiums, we are committed to protecting your personal information and your right to privacy.
              </p>
              <p>
                <strong>Information We Collect:</strong> Personal details such as name, email, delivery address, and payment information required for processing transactions.
              </p>
              <p>
                <strong>Data Encryption:</strong> All sensitive user communication and credit card transactions are encrypted using end-to-end SSL standards.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL 5: SETTINGS */}
      {activeModal === 'settings' ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Account Settings</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="font-semibold text-slate-800">Push Notifications</span>
                <input type="checkbox" defaultChecked className="accent-[#E8262A] h-4 w-4" />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="font-semibold text-slate-800">SMS Order Updates</span>
                <input type="checkbox" defaultChecked className="accent-[#E8262A] h-4 w-4" />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="font-semibold text-slate-800">Two-Factor Authentication</span>
                <input type="checkbox" className="accent-[#E8262A] h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
