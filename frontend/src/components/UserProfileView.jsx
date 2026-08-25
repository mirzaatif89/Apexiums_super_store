import React, { useState, useRef } from 'react';
import { openPrivacyPolicy, PrivacyPolicyContent } from './PrivacyPolicyModal';
import {
  ArrowLeft,
  Camera,
  ChevronRight,
  CreditCard,
  Lock,
  MapPin,
  Package,
  PackageCheck,
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
  onOpenLogin,
  initialOrders = false
}) {
  const fileInputRef = useRef(null);

  const [profileName, setProfileName] = useState(session?.name || session?.username || 'Esther Howard');
  const [profileEmail, setProfileEmail] = useState(session?.email || 'esther.howard@example.com');
  const [trackId, setTrackId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [ordersOpen, setOrdersOpen] = useState(initialOrders);
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const loadMyOrders = React.useCallback(async () => {
    const email = String(session?.email || profileEmail || '').trim().toLowerCase();
    setOrdersLoading(true);
    try {
      const response = await fetch('/api/orders?limit=500');
      const data = response.ok ? await response.json() : { rows: [] };
      const apiOrders = (data.rows || []).filter((order) => email && String(order.customer_email || '').toLowerCase() === email);
      const detailed = await Promise.all(apiOrders.map(async (order) => {
        try { const detail = await fetch(`/api/orders/${order.id}`); const result = detail.ok ? await detail.json() : order; return { ...order, ...(result.order || result), items: result.items || order.items || [] }; } catch { return order; }
      }));
      const activeOrders = detailed.filter((order) => !['Cancelled', 'Canceled'].includes(order.order_status || order.status));
      setMyOrders(activeOrders);
    } catch {
      setMyOrders([]);
    } finally { setOrdersLoading(false); }
  }, [session?.email, profileEmail]);

  React.useEffect(() => { if (ordersOpen) loadMyOrders(); }, [ordersOpen, loadMyOrders]);
  const trackOrder = async (event) => {
    event.preventDefault();
    const id = trackId.trim();
    if (!id) return;
    const lookupId = id.replace(/^ORD-/i, '');
    try { const response = await fetch(`/api/orders/${lookupId}`); const data = response.ok ? await response.json() : null; const status = data?.order?.order_status || data?.order_status || 'Placed'; setTrackedOrder({ id, status: status === 'Pending' ? 'Placed' : status }); } catch { setTrackedOrder(null); }
  };
  const [profilePhone, setProfilePhone] = useState(session?.phone || '603.555.0123');
  const [avatarUrl, setAvatarUrl] = useState(session?.avatar || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80');

  React.useEffect(() => {
    if (session) {
      if (session.name || session.username) setProfileName(session.name || session.username);
      if (session.email) setProfileEmail(session.email);
      if (session.phone) setProfilePhone(session.phone);
      if (session.avatar) {
        setAvatarUrl(session.avatar);
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

  const persistProfileData = async (newAvatar, newName, _newEmail, newPhone) => {
    const response = await fetch('/api/customers/me', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName, phone: newPhone, avatar_url: newAvatar }) });
    if (!response.ok) throw new Error('Unable to save profile to server.');
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

      <div className="mx-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><h3 className="text-sm font-black text-slate-900">Track Order</h3><form onSubmit={trackOrder} className="mt-3 flex gap-2"><input value={trackId} onChange={(e) => setTrackId(e.target.value)} placeholder="Enter Order ID e.g. ORD-12" className="min-w-0 flex-1 rounded-xl border bg-white px-3 py-2 text-xs outline-none" /><button className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white">Track</button></form>{trackedOrder && <p className="mt-3 text-xs font-bold text-emerald-700">Order {trackedOrder.id}: {trackedOrder.status}</p>}</div>

      {ordersOpen ? <div className="px-5 py-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-black text-slate-900">My Orders</h2><p className="mt-1 text-xs text-slate-500">Track your purchases and delivery progress.</p></div><button type="button" onClick={() => setOrdersOpen(false)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">Back</button></div>{ordersLoading ? <p className="py-10 text-center text-xs font-semibold text-slate-400">Loading your orders...</p> : !myOrders.length ? <div className="rounded-2xl border border-dashed p-8 text-center"><Package className="mx-auto text-slate-300" size={34}/><p className="mt-3 text-sm font-bold text-slate-700">No orders yet</p><p className="mt-1 text-xs text-slate-500">Your placed orders will appear here.</p></div> : <div className="space-y-4">{myOrders.map((order) => { const status = order.order_status || order.status || 'Pending'; const displayStatus = status === 'Pending' ? 'Placed' : status; const items = order.items || []; const delivered = ['Delivered', 'Received'].includes(status); const shipped = ['Shipped', 'Delivered', 'Received'].includes(status); return <article key={order.id || order.backendOrderId} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3"><div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Order #{order.id || order.backendOrderId}</p><p className="mt-0.5 text-xs font-bold text-slate-700">{order.created_at ? new Date(order.created_at).toLocaleDateString('en-PK') : order.date || 'Recent order'}</p></div><span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black text-red-600">{displayStatus}</span></div><div className="space-y-2 px-4 py-3">{items.slice(0, 2).map((item, index) => <div key={`${item.product_id || item.id}-${index}`} className="flex justify-between gap-3 text-xs"><span className="min-w-0 truncate font-semibold text-slate-800">{item.product_name || item.title || item.name || 'Product'} × {item.qty || 1}</span><span className="shrink-0 font-bold">Rs {Number(item.price || 0).toLocaleString('en-PK')}</span></div>)}<div className="flex justify-between border-t pt-3 text-xs"><span className="text-slate-500">{order.payment_method || order.paymentMethod || 'Cash on Delivery'}</span><strong className="text-red-600">Rs {Number(order.total_amount || order.totalAmount || 0).toLocaleString('en-PK')}</strong></div></div><div className="grid grid-cols-4 border-t px-3 py-3 text-center text-[9px] font-bold"><div className="text-red-600"><PackageCheck className="mx-auto mb-1" size={17}/>Placed</div><div className={status !== 'Pending' ? 'text-red-600' : 'text-slate-300'}><Package className="mx-auto mb-1" size={17}/>Processing</div><div className={shipped ? 'text-red-600' : 'text-slate-300'}><Truck className="mx-auto mb-1" size={17}/>Shipped</div><div className={delivered ? 'text-red-600' : 'text-slate-300'}><MapPin className="mx-auto mb-1" size={17}/>Delivered</div></div></article>; })}</div>}</div> : <>
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
          onClick={openPrivacyPolicy}
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
      </>}

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

            <PrivacyPolicyContent />
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
