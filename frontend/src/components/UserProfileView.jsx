import React, { useState, useRef } from "react";
import { openPrivacyPolicy, PrivacyPolicyContent } from "./PrivacyPolicyModal";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  CreditCard,
  Download,
  Eye,
  Lock,
  MapPin,
  Package,
  PackageCheck,
  Pencil,
  ShieldCheck,
  SquarePen,
  Truck,
  Upload,
  User,
  X,
} from "lucide-react";

export default function UserProfileView({
  session,
  onBack,
  onLogout,
  onNavigateTab,
  onOpenLogin,
  initialOrders = false,
}) {
  const fileInputRef = useRef(null);

  const [profileName, setProfileName] = useState(
    session?.name || session?.username || "Customer",
  );
  const [profileEmail, setProfileEmail] = useState(session?.email || "");
  const [ordersOpen, setOrdersOpen] = useState(initialOrders);
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadMyOrders = React.useCallback(async () => {
    const email = String(session?.email || profileEmail || "")
      .trim()
      .toLowerCase();
    setOrdersLoading(true);
    try {
      const response = await fetch("/api/orders?limit=500", {
        credentials: "include",
      });
      const data = response.ok ? await response.json() : { rows: [] };
      const apiOrders = (data.rows || []).filter(
        (order) =>
          email && String(order.customer_email || "").toLowerCase() === email,
      );
      const detailed = await Promise.all(
        apiOrders.map(async (order) => {
          try {
            const detail = await fetch(`/api/orders/${order.id}`, {
              credentials: "include",
            });
            const result = detail.ok ? await detail.json() : order;
            return {
              ...order,
              ...(result.order || result),
              items: result.items || order.items || [],
            };
          } catch {
            return order;
          }
        }),
      );
      const activeOrders = detailed.filter(
        (order) =>
          !["Cancelled", "Canceled"].includes(
            order.order_status || order.status,
          ),
      );
      setMyOrders(activeOrders);
    } catch {
      setMyOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [session?.email, profileEmail]);

  React.useEffect(() => {
    if (ordersOpen) loadMyOrders();
  }, [ordersOpen, loadMyOrders]);
  const [profilePhone, setProfilePhone] = useState(session?.phone || "");
  const profileIdentifier = session?.email
    ? profileEmail
    : profilePhone || session?.username || "";
  // Start with a clean placeholder. A remote stock image can fail to load and
  // leaves the browser's broken-image text over the profile card.
  const [avatarUrl, setAvatarUrl] = useState(session?.avatar || null);

  React.useEffect(() => {
    if (session) {
      if (session.name || session.username)
        setProfileName(session.name || session.username);
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
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    fullName: "",
    phone: "",
    email: "",
    province: "",
    city: "",
    address: "",
    landmark: "",
    isDefault: true,
  });
  const addressStorageKey = React.useMemo(
    () =>
      `elistin-profile-addresses:${
        String(session?.email || session?.username || "")
          .trim()
          .toLowerCase() || "guest"
      }`,
    [session?.email, session?.username],
  );
  const checkoutAddressStorageKey = React.useMemo(
    () =>
      `elistin-saved-checkout-address:${
        String(session?.email || session?.username || "")
          .trim()
          .toLowerCase() || "guest"
      }`,
    [session?.email, session?.username],
  );

  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(addressStorageKey) || "[]");
      setAddresses(Array.isArray(saved) ? saved : []);
    } catch {
      setAddresses([]);
    }
  }, [addressStorageKey]);

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, name: "Visa ending in 4242", exp: "12/28", isDefault: true },
  ]);

  const [editNameInput, setEditNameInput] = useState(profileName);
  const [editEmailInput, setEditEmailInput] = useState(profileEmail);
  const [editPhoneInput, setEditPhoneInput] = useState(profilePhone);
  const [editAvatarInput, setEditAvatarInput] = useState(avatarUrl || "");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const persistProfileData = async (
    newAvatar,
    newName,
    _newEmail,
    newPhone,
  ) => {
    const response = await fetch("/api/customers/me", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        phone: newPhone,
        avatar_url: newAvatar,
      }),
    });
    if (!response.ok) throw new Error("Unable to save profile to server.");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("File size must be under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result;
        if (result) {
          setAvatarUrl(result);
          setEditAvatarInput(result);
          persistProfileData(result, profileName, profileEmail, profilePhone);
          showToast("Profile picture saved permanently!");
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
    persistProfileData(
      newAvatar,
      editNameInput,
      editEmailInput,
      editPhoneInput,
    );
    setActiveModal(null);
    showToast("Profile updated & saved!");
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    const {
      label,
      fullName,
      phone,
      email,
      province,
      city,
      address,
      landmark,
      isDefault,
    } = addressForm;
    if (!fullName || !phone || !province || !city || !address) {
      showToast("Fill Name, Contact, Province, City and Street.");
      return;
    }
    const isNewDefault = isDefault || addresses.length === 0;
    const next = [
      ...addresses.map((item) => ({
        ...item,
        isDefault: isNewDefault ? false : item.isDefault,
      })),
      {
        id: Date.now(),
        label: label || "Home",
        fullName,
        phone,
        email: email.trim(),
        province,
        city,
        address,
        landmark,
        isDefault: isNewDefault,
      },
    ];
    setAddresses(next);
    localStorage.setItem(addressStorageKey, JSON.stringify(next));
    const defaultAddress = next.find((item) => item.isDefault) || next[0];
    localStorage.setItem(
      checkoutAddressStorageKey,
      JSON.stringify(defaultAddress),
    );
    setAddressForm({
      label: "Home",
      fullName: profileName,
      phone: profilePhone,
      email: profileEmail,
      province: "",
      city: "",
      address: "",
      landmark: "",
      isDefault: false,
    });
    showToast("Address saved. It will be available at checkout.");
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
        <h1 className="text-base font-bold text-slate-900 tracking-tight">
          Profile
        </h1>
        <div className="w-6" /> {/* Spacer for symmetry */}
      </div>

      {ordersOpen ? (
        <div className="px-5 py-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">My Orders</h2>
              <p className="mt-1 text-xs text-slate-500">
                Track your purchases and delivery progress.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOrdersOpen(false)}
              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
            >
              Back
            </button>
          </div>
          {ordersLoading ? (
            <p className="py-10 text-center text-xs font-semibold text-slate-400">
              Loading your orders...
            </p>
          ) : !myOrders.length ? (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              <Package className="mx-auto text-slate-300" size={34} />
              <p className="mt-3 text-sm font-bold text-slate-700">
                No orders yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Your placed orders will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((order) => {
                const status = order.order_status || order.status || "Pending";
                const displayStatus = status === "Pending" ? "Placed" : status;
                const items = order.items || [];
                const delivered = ["Delivered", "Received"].includes(status);
                const shipped = ["Shipped", "Delivered", "Received"].includes(
                  status,
                );
                return (
                  <article
                    key={order.id || order.backendOrderId}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Order #{order.id || order.backendOrderId}
                        </p>
                        <p className="mt-0.5 text-xs font-bold text-slate-700">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString(
                                "en-PK",
                              )
                            : order.date || "Recent order"}
                        </p>
                      </div>
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black text-red-600">
                        {displayStatus}
                      </span>
                    </div>
                    <div className="space-y-2 px-4 py-3">
                      {items.slice(0, 2).map((item, index) => (
                        <div
                          key={`${item.product_id || item.id}-${index}`}
                          className="flex justify-between gap-3 text-xs"
                        >
                          <span className="min-w-0 truncate font-semibold text-slate-800">
                            {item.product_name ||
                              item.title ||
                              item.name ||
                              "Product"}{" "}
                            × {item.qty || 1}
                          </span>
                          <span className="shrink-0 font-bold">
                            Rs {Number(item.price || 0).toLocaleString("en-PK")}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t pt-3 text-xs">
                        <span className="text-slate-500">
                          {order.payment_method ||
                            order.paymentMethod ||
                            "Cash on Delivery"}
                        </span>
                        <strong className="text-red-600">
                          Rs{" "}
                          {Number(
                            order.total_amount || order.totalAmount || 0,
                          ).toLocaleString("en-PK")}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-[11px] font-black text-white transition hover:bg-[#E8262A]"
                      >
                        <Eye size={14} /> View order
                      </button>
                    </div>
                    <div className="grid grid-cols-4 border-t px-3 py-3 text-center text-[9px] font-bold">
                      <div className="text-red-600">
                        <PackageCheck className="mx-auto mb-1" size={17} />
                        Placed
                      </div>
                      <div
                        className={
                          status !== "Pending"
                            ? "text-red-600"
                            : "text-slate-300"
                        }
                      >
                        <Package className="mx-auto mb-1" size={17} />
                        Processing
                      </div>
                      <div
                        className={shipped ? "text-red-600" : "text-slate-300"}
                      >
                        <Truck className="mx-auto mb-1" size={17} />
                        Shipped
                      </div>
                      <div
                        className={
                          delivered ? "text-red-600" : "text-slate-300"
                        }
                      >
                        <MapPin className="mx-auto mb-1" size={17} />
                        Delivered
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* User Avatar & Basic Info */}
          <div className="mx-4 mt-5 rounded-3xl border border-slate-100 bg-white px-5 py-6 text-center shadow-[0_8px_30px_rgba(15,23,42,0.07)]">
            <div className="relative inline-block group">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-24 w-24 overflow-hidden rounded-full bg-slate-100 ring-4 ring-red-50 shadow-md mx-auto flex items-center justify-center cursor-pointer relative"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    onError={() => setAvatarUrl(null)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                    <User className="h-11 w-11 stroke-[1.5]" />
                  </div>
                )}
              </div>

              {/* Red Edit Pencil Floating Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-[#E8262A] hover:bg-red-600 text-white p-2 rounded-full shadow-md border-2 border-white transition transform active:scale-95 cursor-pointer"
                title="Upload Profile Picture"
                aria-label="Upload Profile Picture"
              >
                <Pencil className="w-4 h-4 text-white stroke-[2.5]" />
              </button>
            </div>

            {/* User Name */}
            <h2 className="mt-4 text-xl font-black text-slate-900 tracking-tight">
              {profileName}
            </h2>

            {/* Contact info subtext */}
            {profileIdentifier ? (
              <p className="mx-auto mt-1.5 w-fit max-w-full break-all rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-[#E8262A]">
                {profileIdentifier}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => setActiveModal("editProfile")}
              className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
            >
              Edit profile
            </button>
          </div>

          {/* "My orders" Section */}
          <div className="mx-4 mt-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
            <h3 className="mb-5 text-base font-black text-slate-900 tracking-tight">
              My orders
            </h3>

            {/* 4 Quick Action Columns */}
            <div className="grid grid-cols-4 gap-2 text-center">
              {/* To pay */}
              <button
                type="button"
                onClick={() => {
                  setOrdersOpen(true);
                }}
                className="group flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <span className="rounded-2xl bg-amber-50 p-2.5 ring-1 ring-amber-100">
                  <CreditCard className="w-5 h-5 text-amber-600 stroke-[1.8] group-hover:scale-110 transition" />
                </span>
                <span className="text-[11px] text-slate-600 font-semibold group-hover:text-amber-600 transition">
                  To pay
                </span>
              </button>

              {/* To ship */}
              <button
                type="button"
                onClick={() => {
                  setOrdersOpen(true);
                }}
                className="group flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <span className="rounded-2xl bg-sky-50 p-2.5 ring-1 ring-sky-100">
                  <Truck className="w-5 h-5 text-sky-600 stroke-[1.8] group-hover:scale-110 transition" />
                </span>
                <span className="text-[11px] text-slate-600 font-semibold group-hover:text-sky-600 transition">
                  To ship
                </span>
              </button>

              {/* To receive */}
              <button
                type="button"
                onClick={() => {
                  setOrdersOpen(true);
                }}
                className="group flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <span className="rounded-2xl bg-violet-50 p-2.5 ring-1 ring-violet-100">
                  <Package className="w-5 h-5 text-violet-600 stroke-[1.8] group-hover:scale-110 transition" />
                </span>
                <span className="text-[11px] text-slate-600 font-semibold group-hover:text-violet-600 transition">
                  To receive
                </span>
              </button>

              {/* To review */}
              <button
                type="button"
                onClick={() => {
                  setOrdersOpen(true);
                }}
                className="group flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <span className="rounded-2xl bg-emerald-50 p-2.5 ring-1 ring-emerald-100">
                  <SquarePen className="w-5 h-5 text-emerald-600 stroke-[1.8] group-hover:scale-110 transition" />
                </span>
                <span className="text-[11px] text-slate-600 font-semibold group-hover:text-emerald-600 transition">
                  To review
                </span>
              </button>
            </div>
          </div>

          {/* Action Menu List */}
          <div className="mx-4 mt-5 overflow-hidden rounded-3xl border border-slate-100 bg-white px-3 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
            {/* Manage Address */}
            <button
              type="button"
              onClick={() => setActiveModal("address")}
              className="w-full flex items-center justify-between py-4 border-b border-slate-100 hover:bg-slate-50/80 px-2 rounded-xl transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                  <MapPin className="h-4 w-4 stroke-[2]" />
                </span>
                <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                  Manage address
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#E8262A] transition" />
            </button>

            {/* Payment method */}
            <button
              type="button"
              onClick={() => setActiveModal("payment")}
              className="w-full flex items-center justify-between py-4 border-b border-slate-100 hover:bg-slate-50/80 px-2 rounded-xl transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                  <CreditCard className="h-4 w-4 stroke-[2]" />
                </span>
                <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                  Payment method
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#E8262A] transition" />
            </button>

            {/* Privacy Policy */}
            <button
              type="button"
              onClick={openPrivacyPolicy}
              className="w-full flex items-center justify-between py-4 border-b border-slate-100 hover:bg-slate-50/80 px-2 rounded-xl transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <ShieldCheck className="h-4 w-4 stroke-[2]" />
                </span>
                <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                  Privacy Policy
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#E8262A] transition" />
            </button>
          </div>

          {/* Logout Option Button (if logged in) */}
          {onLogout ? (
            <div className="mx-4 mt-5">
              <button
                type="button"
                onClick={onLogout}
                className="w-full rounded-2xl border border-red-100 bg-red-50 py-3.5 text-xs font-black text-[#E8262A] transition hover:bg-red-100 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : null}
        </>
      )}

      {/* MODAL 1: EDIT PROFILE */}
      {activeModal === "editProfile" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Edit Profile
              </h3>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#E8262A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmailInput}
                  onChange={(e) => setEditEmailInput(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#E8262A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editPhoneInput}
                  onChange={(e) => setEditPhoneInput(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#E8262A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Profile Photo
                </label>
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
                      onClick={() => setEditAvatarInput("")}
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
      {activeModal === "address" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Manage Address
              </h3>
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
                <div
                  key={addr.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                    <span>{addr.label}</span>
                    {addr.isDefault ? (
                      <span className="text-[10px] bg-red-100 text-[#E8262A] px-2 py-0.5 rounded-full font-bold">
                        Default
                      </span>
                    ) : null}
                  </div>
                  <p className="text-slate-700 font-semibold">
                    {addr.fullName} · {addr.phone}
                  </p>
                  {addr.email ? (
                    <p className="mt-0.5 text-slate-500">{addr.email}</p>
                  ) : null}
                  <p className="mt-1 text-slate-600">
                    {addr.address}
                    {addr.landmark ? `, Near ${addr.landmark}` : ""},{" "}
                    {addr.city}, {addr.province}
                  </p>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleAddAddress}
              className="pt-3 border-t border-slate-100 space-y-3"
            >
              <label className="block text-xs font-black text-slate-800">
                Add New Address
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[11px] font-bold text-slate-600">
                  Address label
                  <input
                    value={addressForm.label}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, label: e.target.value })
                    }
                    placeholder="Home / Office"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#E8262A]"
                  />
                </label>
                <label className="text-[11px] font-bold text-slate-600">
                  Full name *
                  <input
                    required
                    value={addressForm.fullName}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        fullName: e.target.value,
                      })
                    }
                    placeholder="Ali Raza"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#E8262A]"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[11px] font-bold text-slate-600">
                  Contact *
                  <input
                    required
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, phone: e.target.value })
                    }
                    placeholder="0300-1234567"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#E8262A]"
                  />
                </label>
                <label className="text-[11px] font-bold text-slate-600">
                  Email <span className="font-normal">(optional)</span>
                  <input
                    type="email"
                    value={addressForm.email}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, email: e.target.value })
                    }
                    placeholder="name@email.com"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#E8262A]"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[11px] font-bold text-slate-600">
                  Province *
                  <input
                    required
                    value={addressForm.province}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        province: e.target.value,
                      })
                    }
                    placeholder="Punjab"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#E8262A]"
                  />
                </label>
                <label className="text-[11px] font-bold text-slate-600">
                  City *
                  <input
                    required
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, city: e.target.value })
                    }
                    placeholder="Lahore"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#E8262A]"
                  />
                </label>
              </div>
              <label className="block text-[11px] font-bold text-slate-600">
                Mohallah / Sector / Street *
                <input
                  required
                  value={addressForm.address}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, address: e.target.value })
                  }
                  placeholder="House No, Mohallah, Sector or Street"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#E8262A]"
                />
              </label>
              <label className="block text-[11px] font-bold text-slate-600">
                Landmark <span className="font-normal">(optional)</span>
                <input
                  value={addressForm.landmark}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, landmark: e.target.value })
                  }
                  placeholder="Near mosque, school, market, etc."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#E8262A]"
                />
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-[11px] font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      isDefault: e.target.checked,
                    })
                  }
                  className="accent-[#E8262A]"
                />
                Use as default delivery address
              </label>
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
      {activeModal === "payment" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Payment Methods
              </h3>
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
                <div
                  key={pm.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-[#E8262A]" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {pm.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Expires {pm.exp}
                      </p>
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
                showToast("Card addition flow opened");
              }}
              className="w-full py-2.5 border border-dashed border-[#E8262A] text-[#E8262A] font-bold text-xs rounded-xl hover:bg-red-50 transition"
            >
              + Add Credit / Debit Card
            </button>
          </div>
        </div>
      ) : null}

      {/* MODAL 4: PRIVACY POLICY */}
      {activeModal === "privacy" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Privacy Policy
              </h3>
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

      {selectedOrder ? (
        <div className="absolute inset-0 z-40 min-h-full bg-white pb-8">
          <div className="flex items-center justify-between bg-[#F82D46] px-5 py-4 text-white shadow-sm">
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="grid h-9 w-9 place-items-center rounded-xl bg-white/15"
              aria-label="Back to orders"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-base font-black">Order Details</h2>
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="grid h-9 w-9 place-items-center rounded-xl bg-white/15"
              aria-label="Close order details"
            >
              <X size={20} />
            </button>
          </div>
          <div className="px-5 py-8 text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-rose-100 text-[#F82D46]">
              <Check size={40} strokeWidth={3} />
            </div>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#F82D46]">
              Order status
            </p>
            <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              {orderStatusLabel(selectedOrder)}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your order is confirmed. Track its delivery progress below.
            </p>
            <OrderTimeline order={selectedOrder} />
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left shadow-sm">
              <p className="text-sm font-black text-slate-800">
                Order ID:{" "}
                <span className="text-[#F82D46]">
                  #{selectedOrder.id || selectedOrder.backendOrderId}
                </span>
              </p>
              <p className="mt-2 text-sm font-bold text-slate-700">
                Customer:{" "}
                <span className="font-medium text-slate-500">
                  {selectedOrder.customer_name || customerName}
                </span>
              </p>
              <p className="mt-2 text-sm font-bold text-slate-700">
                Payment Method:{" "}
                <span className="font-medium text-slate-500">
                  {selectedOrder.payment_method ||
                    selectedOrder.paymentMethod ||
                    "Cash on Delivery"}
                </span>
              </p>
              <div className="my-4 border-t border-slate-200" />
              {(selectedOrder.items || []).map((item, index) => (
                <div
                  key={`${item.product_id || item.id || "item"}-${index}`}
                  className="mb-2 flex justify-between gap-3 text-xs"
                >
                  <span className="min-w-0 truncate font-semibold text-slate-700">
                    {item.product_name || item.title || item.name || "Product"}{" "}
                    × {item.qty || 1}
                  </span>
                  <strong>
                    Rs{" "}
                    {Number((item.price || 0) * (item.qty || 1)).toLocaleString(
                      "en-PK",
                    )}
                  </strong>
                </div>
              ))}
              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-4 text-base font-black text-slate-800">
                <span>Total Paid</span>
                <span className="text-[#F82D46]">
                  Rs{" "}
                  {Number(
                    selectedOrder.total_amount ||
                      selectedOrder.totalAmount ||
                      0,
                  ).toLocaleString("en-PK")}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedOrder(null);
                setOrdersOpen(false);
                onBack?.();
              }}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F82D46] py-4 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-rose-200"
            >
              <Package size={19} /> Continue Shopping
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3.5 text-sm font-black text-slate-700"
            >
              <Download size={18} /> Save / Print Order
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function orderStatusLabel(order) {
  const status = String(
    order?.order_status || order?.status || "Pending",
  ).trim();
  return status === "Pending" ? "Order Confirmed" : status;
}

function OrderTimeline({ order }) {
  const normalized = String(
    order?.order_status || order?.status || "Pending",
  ).toLowerCase();
  const step =
    normalized.includes("deliver") || normalized.includes("receiv")
      ? 4
      : normalized.includes("ship")
        ? 3
        : normalized.includes("process") || normalized.includes("confirm")
          ? 2
          : 1;
  return (
    <div className="mt-7 rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-5 flex items-center justify-between text-xs font-bold text-slate-500">
        <span>Estimated Dispatch</span>
        <span className="text-[#F82D46]">2 to 4 Days</span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {["Placed", "Processing", "Shipped", "Delivered"].map(
          (label, index) => {
            const active = index + 1 <= step;
            return (
              <div
                key={label}
                className={active ? "text-[#F82D46]" : "text-slate-400"}
              >
                <span
                  className={`mx-auto grid h-9 w-9 place-items-center rounded-full text-sm font-black ${active ? "bg-[#F82D46] text-white" : "bg-slate-200 text-slate-500"}`}
                >
                  {active && index + 1 < step ? (
                    <Check size={16} strokeWidth={3} />
                  ) : (
                    index + 1
                  )}
                </span>
                <p className="mt-2 text-[10px] font-black">{label}</p>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}
