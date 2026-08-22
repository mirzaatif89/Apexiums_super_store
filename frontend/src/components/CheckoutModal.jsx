import React from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Trash2,
  User,
  Phone,
  X
} from 'lucide-react';

const generateOrderId = () => {
  const sequenceKey = 'elistin-order-sequence';
  const currentSequence = Number.parseInt(localStorage.getItem(sequenceKey) || '0', 10) || 0;
  const nextSequence = currentSequence + 1;
  localStorage.setItem(sequenceKey, String(nextSequence));
  return String(nextSequence).padStart(3, '0');
};

export default function CheckoutModal({
  open,
  onClose,
  storeName,
  logoSrc,
  cartItems = [],
  customerEmail = '',
  onUpdateQty,
  onRemoveItem,
  onOrderPlaced
}) {
  const [step, setStep] = React.useState('cart'); // 'cart' | 'checkout' | 'success'
  const [placedOrderData, setPlacedOrderData] = React.useState(null);
  const [trackingResult, setTrackingResult] = React.useState(null);

  // Address details
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState(customerEmail);
  const [province, setProvince] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [city, setCity] = React.useState('');
  const [landmark, setLandmark] = React.useState('');
  const [showAddressForm, setShowAddressForm] = React.useState(false);
  const [savedAddress, setSavedAddress] = React.useState(null);

  // Payment method
  const [paymentMethod, setPaymentMethod] = React.useState('cod'); // 'cod' | 'wallet' | 'card'
  const [cardNumber, setCardNumber] = React.useState('');
  const [cardExpiry, setCardExpiry] = React.useState('');
  const [cardCvc, setCardCvc] = React.useState('');
  const [walletPhone, setWalletPhone] = React.useState('');

  // Coupon code
  const [couponCode, setCouponCode] = React.useState('');
  const [appliedDiscount, setAppliedDiscount] = React.useState(0);
  const [couponMsg, setCouponMsg] = React.useState('');

  // State
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const items = cartItems || [];

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
  const totalQuantity = items.reduce((sum, item) => sum + (item.qty || 1), 0);
  const shippingFee = items.length > 0 && totalQuantity < 3 ? 260 : 0;
  const itemSavings = items.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + (item.originalPrice - item.price) * (item.qty || 1);
    }
    return sum;
  }, 0);
  const totalDiscount = appliedDiscount + itemSavings;
  const grandTotal = Math.max(0, subtotal + shippingFee - appliedDiscount);

  const savedAddressStorageKey = React.useMemo(
    () => `elistin-saved-checkout-address:${customerEmail.trim().toLowerCase() || 'guest'}`,
    [customerEmail]
  );

  React.useEffect(() => {
    if (!open) return;

    try {
      const storedAddress = JSON.parse(localStorage.getItem(savedAddressStorageKey) || 'null');
      if (storedAddress?.fullName && storedAddress?.phone && storedAddress?.province && storedAddress?.city && storedAddress?.address) {
        setFullName(storedAddress.fullName);
        setPhone(storedAddress.phone);
        setEmail(storedAddress.email || customerEmail || '');
        setProvince(storedAddress.province);
        setCity(storedAddress.city);
        setAddress(storedAddress.address);
        setLandmark(storedAddress.landmark || '');
        setSavedAddress(storedAddress);
        setShowAddressForm(false);
        return;
      }
    } catch {
      localStorage.removeItem(savedAddressStorageKey);
    }

    setFullName('');
    setPhone('');
    setEmail(customerEmail || '');
    setProvince('');
    setCity('');
    setAddress('');
    setLandmark('');
    setSavedAddress(null);
    setShowAddressForm(false);
  }, [open, customerEmail, savedAddressStorageKey]);

  React.useEffect(() => {
    if (!open) {
      setStep('cart');
      setError('');
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    if (code === 'APEX500' || code === 'WELCOME') {
      setAppliedDiscount(500);
      setCouponMsg('Voucher applied! Rs 500 discount added.');
      setError('');
    } else if (code === 'SUPERDEAL') {
      setAppliedDiscount(1000);
      setCouponMsg('Mega Voucher applied! Rs 1,000 discount added.');
      setError('');
    } else {
      setCouponMsg('');
      setError('Invalid voucher code. Try "APEX500" or "SUPERDEAL".');
    }
  };

  const handleProceedToCheckout = () => {
    if (items.length === 0) {
      setError('Your cart is empty. Please add items before proceeding.');
      return;
    }
    setError('');
    setStep('checkout');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    const currentName = savedAddress?.fullName || fullName;
    const currentPhone = savedAddress?.phone || phone;
    const currentEmail = savedAddress?.email || email;
    const currentProvince = savedAddress?.province || province;
    const currentAddress = savedAddress?.address || address;
    const currentCity = savedAddress?.city || city;
    const currentLandmark = savedAddress?.landmark || landmark;

    if (!currentName || !currentPhone || !currentProvince || !currentCity || !currentAddress) {
      setShowAddressForm(true);
      setError('Please click "+ Add Address" and enter your shipping details before placing the order.');
      return;
    }

    setLoading(true);
    setError('');
    const publicOrderId = generateOrderId();

    try {
      const orderPayload = {
        payment_method: paymentMethod.toUpperCase(),
        customer_name: currentName,
        customer_email: currentEmail,
        customer_phone: currentPhone,
        shipping_address: `${currentAddress}${currentLandmark ? `, Near ${currentLandmark}` : ''}, ${currentCity}, ${currentProvince}`,
        total_amount: grandTotal,
        items_count: items.reduce((sum, item) => sum + Number(item.qty || 1), 0),
        items: items,
        payment_status: paymentMethod === 'cod' ? 'Pending' : 'Paid',
        order_status: 'Pending'
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const orderResult = response.ok ? await response.json() : null;
      const backendOrderId = orderResult?.order?.id || null;

      const orderSummaryObj = {
        id: publicOrderId,
        backendOrderId,
        status: 'Placed',
        customerName: currentName,
        customerEmail: currentEmail,
        customerPhone: currentPhone,
        shippingAddress: `${currentAddress}${currentLandmark ? `, Near ${currentLandmark}` : ''}, ${currentCity}, ${currentProvince}`,
        paymentMethod:
          paymentMethod === 'cod'
            ? 'Cash on Delivery'
            : paymentMethod === 'wallet'
            ? 'JazzCash / EasyPaisa'
            : 'Credit / Debit Card',
        subtotal,
        shippingFee,
        discount: appliedDiscount,
        totalAmount: grandTotal,
        items,
        date: new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
      };

      setPlacedOrderData(orderSummaryObj);
      localStorage.setItem('apexiums-my-orders', JSON.stringify([orderSummaryObj, ...JSON.parse(localStorage.getItem('apexiums-my-orders') || '[]')]));
      setStep('success');
      if (onOrderPlaced) onOrderPlaced(orderSummaryObj);
    } catch (err) {
      setPlacedOrderData({
        id: publicOrderId,
        status: 'Placed',
        customerName: currentName,
        paymentMethod:
          paymentMethod === 'cod'
            ? 'Cash on Delivery'
            : paymentMethod === 'wallet'
            ? 'Mobile Wallet'
            : 'Card',
        subtotal,
        shippingFee,
        discount: appliedDiscount,
        totalAmount: grandTotal,
        items,
        date: new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
      });
      setStep('success');
      if (onOrderPlaced) onOrderPlaced();
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async () => {
    if (!placedOrderData?.id) return;
    let status = placedOrderData.status || 'Placed';

    if (placedOrderData.backendOrderId) {
      try {
        const response = await fetch(`/api/orders/${placedOrderData.backendOrderId}`);
        const data = response.ok ? await response.json() : null;
        const apiStatus = data?.order?.order_status || data?.order_status;
        if (apiStatus) status = apiStatus === 'Pending' ? 'Placed' : apiStatus;
      } catch {
        // Keep the locally saved status when live tracking is unavailable.
      }
    }

    setTrackingResult({ id: placedOrderData.id, status });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-hidden bg-slate-950/65 p-0 backdrop-blur-sm sm:items-center sm:p-4 md:p-6">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Close checkout overlay"
        onClick={onClose}
      />

      {/* Cart Modal Container */}
      <section className="relative z-10 flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden rounded-none border-0 bg-white shadow-2xl sm:h-[92vh] sm:max-h-[920px] sm:rounded-3xl sm:border sm:border-slate-200/90 xl:max-w-7xl">
        {/* Compact Colored Top Header Bar */}
        <div className="flex shrink-0 items-center justify-between rounded-none border-b border-red-700/60 bg-[#E8262A] px-3.5 py-2.5 text-white sm:rounded-t-3xl sm:px-5">
          {/* Left: Back Arrow Icon */}
          <button
            type="button"
            onClick={step === 'checkout' ? () => setStep('cart') : onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white hover:bg-white/25 active:scale-95 transition cursor-pointer shrink-0"
            title={step === 'checkout' ? 'Back to Cart' : 'Go Back'}
            aria-label={step === 'checkout' ? 'Back to Cart' : 'Go Back'}
          >
            <ArrowLeft size={18} />
          </button>

          {/* Center: Title & Item Count Badge */}
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              {step === 'cart' ? 'My Cart' : step === 'checkout' ? 'Checkout' : 'Order Confirmed'}
            </h2>
            {step === 'cart' && (
              <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-white text-[#E8262A] text-xs font-black shadow-2xs leading-none">
                {items.length}
              </span>
            )}
          </div>

          {/* Right: Compact Close (X) Button */}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white hover:bg-white/25 active:scale-95 transition cursor-pointer shrink-0"
            aria-label="Close modal"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* STEP 1: CART VIEW (Products & Subtotal - NO payment method or address shown) */}
        {step === 'cart' ? (
          items.length === 0 ? (
            /* EMPTY CART */
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 sm:p-12 text-center my-auto w-full">
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-red-50 text-[#E8262A] ring-8 ring-red-50/60 shadow-xs mb-4">
                <ShoppingCart size={42} className="text-[#E8262A] sm:w-12 sm:h-12" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">Your cart is empty</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Add items to your cart to review products and complete your purchase.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-[#E8262A] font-extrabold text-xs uppercase tracking-wider text-white shadow-lg shadow-red-900/20 hover:bg-red-700 transition active:scale-95 cursor-pointer"
              >
                <ShoppingBag size={18} />
                <span>Explore Products</span>
              </button>
            </div>
          ) : (
            /* CART WITH ITEMS */
            <div className="flex-1 min-h-0 overflow-y-auto grid lg:grid-cols-[1.3fr_0.9fr] divide-y lg:divide-y-0 lg:divide-x divide-slate-100 bg-white">
              {/* LEFT COLUMN: PRODUCTS LIST */}
              <div className="p-4 sm:p-6 md:p-8 space-y-5 bg-white">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <ShoppingBag size={18} className="text-[#E8262A]" />
                    <span>Selected Products ({items.length})</span>
                  </h3>
                  <span className="text-[11px] font-bold text-[#E8262A] bg-red-50 px-3 py-1 rounded-full border border-red-100">
                    100% Guaranteed Stock
                  </span>
                </div>

                {error ? (
                  <div className="flex items-center gap-2.5 rounded-xl bg-red-50 p-3.5 border border-red-200 text-xs font-semibold text-red-700">
                    <AlertCircle size={18} className="shrink-0 text-red-600" />
                    <span>{error}</span>
                  </div>
                ) : null}

                {/* Products Cards List */}
                <div className="space-y-3.5">
                  {items.map((item, idx) => {
                    const itemQty = item.qty || 1;
                    const itemTotal = (item.price || 0) * itemQty;

                    return (
                      <div
                        key={item.id || idx}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-red-200 transition shadow-2xs"
                      >
                        {/* Image & Title */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            {item.category ? (
                              <span className="inline-block text-[10px] font-black uppercase tracking-wider text-red-800 bg-red-100/80 px-2 py-0.5 rounded-md">
                                {item.category}
                              </span>
                            ) : null}
                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug">
                              {item.title}
                            </h4>
                            <p className="text-[11px] sm:text-xs font-semibold text-slate-500">
                              Unit Price: <span className="font-bold text-slate-800">Rs {(item.price || 0).toLocaleString('en-PK')}</span>
                            </p>
                          </div>
                        </div>

                        {/* Quantity Controls & Line Total */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                          {/* Qty Counter Buttons */}
                          <div className="flex items-center rounded-xl bg-white border border-slate-200 p-1 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => onUpdateQty && onUpdateQty(item.id, -1)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer"
                              title="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-xs font-black text-slate-900">
                              {itemQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty && onUpdateQty(item.id, 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer"
                              title="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                            <p className="text-xs sm:text-sm font-black text-[#E8262A]">
                              Rs {itemTotal.toLocaleString('en-PK')}
                            </p>
                          </div>

                          {/* Remove Item Button */}
                          <button
                            type="button"
                            onClick={() => onRemoveItem && onRemoveItem(item.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer shrink-0 ml-1"
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT COLUMN: ORDER SUMMARY & PROCEED BUTTON */}
              <div className="p-4 sm:p-6 md:p-8 bg-slate-50 flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#E8262A] pb-2 border-b border-slate-200 flex items-center gap-1.5">
                    <Tag size={16} />
                    <span>Order Summary</span>
                  </h3>

                  {/* Voucher Section */}
                  <div>
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1 flex items-center">
                        <Tag size={15} className="absolute left-3 text-slate-400" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Voucher Code (APEX500)"
                          className="w-full h-10 pl-9 pr-2 text-xs font-bold uppercase bg-white border border-slate-200 rounded-xl outline-none focus:border-[#E8262A]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="h-10 px-4 bg-[#E8262A] text-white font-extrabold text-xs rounded-xl hover:bg-red-700 transition cursor-pointer"
                      >
                        Apply
                      </button>
                    </form>
                    {couponMsg ? (
                      <p className="mt-1.5 text-[11px] font-bold text-red-700 flex items-center gap-1">
                        <CheckCircle2 size={14} /> {couponMsg}
                      </p>
                    ) : null}
                  </div>

                  {/* Cost Summary Breakdown */}
                  <div className="space-y-2.5 text-xs pt-4 border-t border-slate-200 text-slate-600">
                    <div className="flex justify-between">
                      <span>Items Subtotal</span>
                      <span className="font-extrabold text-slate-900">Rs {subtotal.toLocaleString('en-PK')}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Standard Delivery</span>
                      <span className="font-extrabold text-slate-900">Rs {shippingFee.toLocaleString('en-PK')}</span>
                    </div>

                    <div className="flex justify-between text-red-700 font-bold">
                      <span>Voucher Less</span>
                      <span>
                        {appliedDiscount > 0
                          ? `- Rs ${appliedDiscount.toLocaleString('en-PK')}`
                          : 'Rs 0'}
                      </span>
                    </div>

                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Total Discount</span>
                      <span>
                        {totalDiscount > 0
                          ? `- Rs ${totalDiscount.toLocaleString('en-PK')}`
                          : 'Rs 0'}
                      </span>
                    </div>

                    <div className="flex justify-between pt-3 border-t border-slate-300 text-base font-black text-slate-900">
                      <span>Total Amount</span>
                      <span className="text-[#E8262A] text-xl font-black">
                        Rs {grandTotal.toLocaleString('en-PK')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PROCEED TO CHECKOUT BUTTON */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    className="w-full h-13 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#E8262A] font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-red-900/25 hover:bg-red-700 active:scale-[0.99] transition cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <PackageCheck size={20} />
                  </button>

                  <div className="text-center text-[10px] font-semibold text-slate-400 flex items-center justify-center gap-1">
                    <ShieldCheck size={14} className="text-[#E8262A]" />
                    <span>Free Return & 100% Guaranteed Stock</span>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : step === 'checkout' ? (
          /* STEP 2: CHECKOUT VIEW (DELIVERY ADDRESS & PAYMENT METHOD) */
          <div className="flex-1 min-h-0 overflow-y-auto grid lg:grid-cols-[1.2fr_0.8fr] divide-y lg:divide-y-0 lg:divide-x divide-slate-100 bg-white">
            {/* LEFT COLUMN: ADDRESS & PAYMENT FORM */}
            <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-white">
              {/* Shipping Address Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#E8262A] pb-2 border-b border-slate-200 flex items-center gap-1.5">
                  <MapPin size={16} />
                  <span>1. Delivery Address</span>
                </h3>

                {error ? (
                  <div className="flex items-center gap-2.5 rounded-xl bg-red-50 p-3.5 border border-red-200 text-xs font-semibold text-red-700">
                    <AlertCircle size={18} className="shrink-0 text-red-600" />
                    <span>{error}</span>
                  </div>
                ) : null}

                {/* Add Address Card vs Open Form vs Saved Address */}
                {!showAddressForm && !savedAddress ? (
                  <div className="p-5 rounded-2xl bg-slate-50 border-2 border-dashed border-red-300/80 hover:border-red-500 transition text-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-[#E8262A] mx-auto">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">No Delivery Address Added</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Please add your delivery address to receive your order</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(true)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E8262A] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:bg-red-700 transition active:scale-95 cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>Add Address</span>
                    </button>
                  </div>
                ) : showAddressForm ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                        <MapPin size={16} className="text-[#E8262A]" />
                        <span>Enter Delivery Details</span>
                      </h4>
                      {savedAddress ? (
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                          Name
                        </label>
                        <div className="relative flex items-center">
                          <User size={15} className="absolute left-3 text-slate-400" />
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Ali Raza"
                            className="w-full h-10 pl-9 pr-3 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:border-[#E8262A] transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                          Contact
                        </label>
                        <div className="relative flex items-center">
                          <Phone size={15} className="absolute left-3 text-slate-400" />
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0300-1234567"
                            className="w-full h-10 pl-9 pr-3 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:border-[#E8262A] transition"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                        Email <span className="font-medium text-slate-400">(Optional)</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full h-10 px-3 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:border-[#E8262A] transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                          Province
                        </label>
                        <input
                          type="text"
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          placeholder="Enter Province"
                          className="w-full h-10 px-3 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:border-[#E8262A] transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Enter City"
                          className="w-full h-10 px-3 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:border-[#E8262A] transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                          Mohallah / Sector / Street
                        </label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="House No, Mohallah, Sector or Street"
                          className="w-full h-10 px-3 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:border-[#E8262A] transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                          Landmark <span className="font-medium text-slate-400">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="Near mosque, school, market, etc."
                          className="w-full h-10 px-3 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:border-[#E8262A] transition"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (!fullName || !phone || !province || !city || !address) {
                            setError('Please fill in Name, Contact, Province, City, and Mohallah / Sector / Street.');
                            return;
                          }
                          const addressToSave = { fullName, phone, email: email.trim(), province, city, address, landmark };
                          setError('');
                          setSavedAddress(addressToSave);
                          localStorage.setItem(savedAddressStorageKey, JSON.stringify(addressToSave));
                          setShowAddressForm(false);
                        }}
                        className="px-6 py-2 rounded-xl bg-[#E8262A] text-white font-black text-xs uppercase tracking-wider hover:bg-red-700 transition shadow-sm cursor-pointer"
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                ) : (
                  /* SAVED ADDRESS DISPLAY CARD */
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                        <CheckCircle2 size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-extrabold text-slate-900 truncate">{savedAddress?.fullName || fullName}</h4>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                            ✓ Address Saved
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {savedAddress?.phone || phone}
                        </p>
                        {(savedAddress?.email || email) ? (
                          <p className="text-[11px] text-slate-600">
                            {savedAddress?.email || email}
                          </p>
                        ) : null}
                        <p className="text-[11px] text-slate-500 font-medium leading-snug truncate">
                          {savedAddress?.address || address}{(savedAddress?.landmark || landmark) ? `, Near ${savedAddress?.landmark || landmark}` : ''}, {savedAddress?.city || city}, {savedAddress?.province || province}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddressForm(true)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-bold text-xs shrink-0 self-end sm:self-auto cursor-pointer"
                    >
                      Edit Address
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#E8262A] pb-2 border-b border-slate-200 flex items-center gap-1.5">
                  <CreditCard size={16} />
                  <span>2. Payment Method</span>
                </h3>

                <div className="space-y-2.5">
                  {/* Cash on Delivery (COD) */}
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                      paymentMethod === 'cod'
                        ? 'border-[#E8262A] bg-red-50/80 text-red-950 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="text-[#E8262A] focus:ring-red-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Cash on Delivery (COD)</p>
                        <p className="text-[11px] text-slate-500">Pay cash when order arrives at doorstep</p>
                      </div>
                    </div>
                    <span className="rounded bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                      Standard
                    </span>
                  </label>

                  {/* Mobile Wallet EasyPaisa / JazzCash */}
                  <label
                    onClick={() => setPaymentMethod('wallet')}
                    className={`flex flex-col p-3.5 rounded-xl border cursor-pointer transition ${
                      paymentMethod === 'wallet'
                        ? 'border-[#E8262A] bg-red-50/80 text-red-950 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'wallet'}
                          onChange={() => setPaymentMethod('wallet')}
                          className="text-[#E8262A] focus:ring-red-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">EasyPaisa / JazzCash</p>
                          <p className="text-[11px] text-slate-500">Pay directly from Mobile Account</p>
                        </div>
                      </div>
                      <span className="rounded bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-800">
                        Instant
                      </span>
                    </div>

                    {paymentMethod === 'wallet' ? (
                      <div className="mt-3 pt-2.5 border-t border-red-200/80">
                        <input
                          type="text"
                          value={walletPhone}
                          onChange={(e) => setWalletPhone(e.target.value)}
                          placeholder="Mobile Account Number (03001234567)"
                          className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-[#E8262A]"
                        />
                      </div>
                    ) : null}
                  </label>

                  {/* Visa / Mastercard */}
                  <label
                    onClick={() => setPaymentMethod('card')}
                    className={`flex flex-col p-3.5 rounded-xl border cursor-pointer transition ${
                      paymentMethod === 'card'
                        ? 'border-[#E8262A] bg-red-50/80 text-red-950 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="text-[#E8262A] focus:ring-red-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Debit / Credit Card</p>
                          <p className="text-[11px] text-slate-500">Visa, Mastercard & UnionPay</p>
                        </div>
                      </div>
                      <ShieldCheck size={18} className="text-[#E8262A]" />
                    </div>

                    {paymentMethod === 'card' ? (
                      <div className="mt-3 pt-2.5 border-t border-red-200/80 space-y-2">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="Card Number (xxxx xxxx xxxx xxxx)"
                          className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-[#E8262A]"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM / YY"
                            className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-[#E8262A]"
                          />
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="CVV"
                            className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-[#E8262A]"
                          />
                        </div>
                      </div>
                    ) : null}
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: MINI REVIEW & PLACE ORDER */}
            <div className="p-4 sm:p-6 md:p-8 bg-slate-50 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#E8262A] pb-2 border-b border-slate-200 flex items-center gap-1.5">
                  <ShoppingBag size={16} />
                  <span>3. Order Summary ({items.length} items)</span>
                </h3>

                {/* Items Summary list with Product Picture & Details */}
                <div className="space-y-2.5 max-h-[230px] overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-center justify-between text-xs p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-12 w-12 object-cover rounded-xl border border-slate-200 shrink-0 bg-slate-50"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-slate-900 truncate leading-tight">{item.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-slate-500 font-medium">Qty: <strong className="text-slate-800">{item.qty || 1}</strong></span>
                            <span className="text-[11px] text-slate-400">•</span>
                            <span className="text-[11px] text-slate-500">Rs {(item.price || 0).toLocaleString('en-PK')}</span>
                          </div>
                        </div>
                      </div>
                      <span className="font-black text-slate-900 shrink-0 ml-2">
                        Rs {((item.price || 0) * (item.qty || 1)).toLocaleString('en-PK')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-2 text-xs pt-3 border-t border-slate-200 text-slate-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-extrabold text-slate-900">Rs {subtotal.toLocaleString('en-PK')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Standard Delivery</span>
                    <span className="font-extrabold text-slate-900">Rs {shippingFee.toLocaleString('en-PK')}</span>
                  </div>

                  <div className="flex justify-between text-red-700 font-bold">
                    <span>Voucher Less</span>
                    <span>
                      {appliedDiscount > 0
                        ? `- Rs ${appliedDiscount.toLocaleString('en-PK')}`
                        : 'Rs 0'}
                    </span>
                  </div>

                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Total Discount</span>
                    <span>
                      {totalDiscount > 0
                        ? `- Rs ${totalDiscount.toLocaleString('en-PK')}`
                        : 'Rs 0'}
                    </span>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-slate-300 text-base font-black text-slate-900">
                    <span>Total Amount</span>
                    <span className="text-[#E8262A] text-xl font-black">
                      Rs {grandTotal.toLocaleString('en-PK')}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full h-13 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#E8262A] font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-red-900/25 hover:bg-red-700 transition active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                >
                  <PackageCheck size={20} />
                  <span>{loading ? 'Processing Order...' : `Place Order (Rs ${grandTotal.toLocaleString('en-PK')})`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="w-full py-2 text-center text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                >
                  ← Back to Cart Items
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 3: ORDER CONFIRMATION VIEW */
          <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-12 text-center space-y-6 my-auto flex flex-col justify-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-[#E8262A] animate-bounce">
              <CheckCircle2 size={44} />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-black uppercase tracking-widest text-[#E8262A]">
                Order Placed Successfully
              </span>
              <h3 className="text-3xl font-black text-slate-900">Thank You For Your Order!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your order has been confirmed and is being processed for dispatch.
              </p>
            </div>

            {/* Order Progress Status Timeline */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 max-w-xl mx-auto text-left space-y-4 w-full">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Estimated Dispatch:</span>
                <span className="font-black text-[#E8262A]">2 to 4 Days</span>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-4 gap-2 pt-1 text-center text-[11px]">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-[#E8262A] text-white flex items-center justify-center font-black">1</div>
                  <span className="mt-1 font-bold text-red-800">Placed</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">2</div>
                  <span className="mt-1 text-slate-500">Processing</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">3</div>
                  <span className="mt-1 text-slate-500">Shipped</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">4</div>
                  <span className="mt-1 text-slate-500">Delivered</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 text-xs space-y-1 text-slate-600">
                <p><strong>Order ID:</strong> <span className="font-black tracking-wide text-[#E8262A]">{placedOrderData?.id}</span></p>
                <p><strong>Customer:</strong> {placedOrderData?.customerName}</p>
                <p><strong>Payment Method:</strong> {placedOrderData?.paymentMethod}</p>
                <p><strong>Total Paid:</strong> <span className="font-black text-[#E8262A]">Rs {placedOrderData?.totalAmount?.toLocaleString('en-PK')}</span></p>
              </div>
            </div>

            {trackingResult ? (
              <div className="mx-auto w-full max-w-xl rounded-2xl border border-red-200 bg-red-50 p-4 text-left shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Tracking Order ID</p>
                    <p className="mt-0.5 text-sm font-black tracking-wide text-[#E8262A]">{trackingResult.id}</p>
                  </div>
                  <span className="rounded-full bg-[#E8262A] px-4 py-2 text-xs font-black text-white">{trackingResult.status}</span>
                </div>
                <p className="mt-3 text-xs text-slate-600">Your order status is updated from the order tracking system.</p>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-8 h-12 inline-flex items-center gap-2 rounded-2xl bg-[#E8262A] text-white font-extrabold text-xs uppercase tracking-wider hover:bg-red-700 transition cursor-pointer"
              >
                <ShoppingBag size={18} />
                <span>Continue Shopping</span>
              </button>

              <button
                type="button"
                onClick={handleViewOrder}
                className="px-6 h-12 inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white text-slate-700 font-bold text-xs uppercase hover:bg-slate-50 transition cursor-pointer"
              >
                <Truck size={18} />
                <span>View Order</span>
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
