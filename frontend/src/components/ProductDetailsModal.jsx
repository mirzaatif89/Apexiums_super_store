import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Share2,
  Heart,
  MoreVertical,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  MapPin,
  CheckCircle2,
  ShoppingCart,
  ShoppingBag,
  Plus,
  Minus,
  X,
  Check,
  Sparkles,
  PackageCheck,
  Award
} from 'lucide-react';
import { openWhatsApp } from '../utils/whatsapp';

export default function ProductDetailsModal({
  product,
  allProducts = [],
  onClose,
  onAddToCart,
  onBuyNow,
  onSelectProduct,
  onOpenCart,
  cartCount = 0,
  storeName = 'Apexiums Super Store'
}) {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [isWishlist, setIsWishlist] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviews, setReviews] = useState([]);
  const averageRating = reviews.length ? reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviews.length : 0;

  const handleAddToCart = () => {
    if (onAddToCart) onAddToCart(quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2200);
  };

  // Delivery Address State
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('Lahore');
  const [addrError, setAddrError] = useState('');

  // Lock background body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Reset internal state when selected product changes
  useEffect(() => {
    setSelectedImgIndex(0);
    setQuantity(1);
    setSelectedColor('');
    setSelectedSize('');
  }, [product?.id]);

  useEffect(() => {
    let active = true;
    fetch(`/api/reviews?product_id=${encodeURIComponent(product?.id || '')}&limit=100`)
      .then((response) => response.ok ? response.json() : { rows: [] })
      .then((data) => { if (active) setReviews((data.rows || []).filter((review) => String(review.product_id) === String(product?.id))); })
      .catch(() => { if (active) setReviews([]); });
    return () => { active = false; };
  }, [product?.id]);

  // Derive Brand name dynamically if not supplied
  const brandName = useMemo(() => {
    if (product.brand && product.brand !== 'Apexiums Tech') return product.brand;
    return '';
  }, [product]);

  // Gallery images setup (fallback angles if array not provided)
  const galleryImages = useMemo(() => {
    if (Array.isArray(product.gallery) && product.gallery.length > 0) {
      return product.gallery.filter(Boolean).slice(0, 5);
    }
    // Generate 4 image slots using product image
    return [
      product.image,
      product.image,
      product.image,
      product.image
    ];
  }, [product]);

  // Discount percentage
  const discountPercent = useMemo(() => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 20;
  }, [product]);

  // Color options
  const colorOptions = useMemo(() => {
    return String(product.colors || '').split(',').map((value) => value.trim()).filter(Boolean);
  }, [product]);

  // Size/Variant options
  const variantOptions = useMemo(() => {
    return String(product.sizes || '').split(',').map((value) => value.trim()).filter(Boolean);
  }, [product]);

  // Dynamically constructed Product Details List
  const productDetails = useMemo(() => {
    const details = [];
    if (brandName) details.push({ label: 'Brand', value: brandName });
    if (product.category) details.push({ label: 'Category', value: product.category });
    if (product.material) details.push({ label: 'Material', value: product.material });
    if (selectedColor || product.color) details.push({ label: 'Color', value: selectedColor || product.color });
    if (selectedSize || product.size) details.push({ label: 'Size', value: selectedSize || product.size });
    if (product.weight) details.push({ label: 'Weight', value: product.weight });
    if (product.packageContents) {
      details.push({ label: 'Package Contents', value: product.packageContents });
    } else {
      details.push({ label: 'Package Contents', value: `1x ${product.title}` });
    }
    details.push({ label: 'Condition', value: '100% Brand New & Authentic' });
    return details;
  }, [product, brandName, selectedColor, selectedSize]);

  // Key Features
  const keyFeatures = useMemo(() => {
    if (Array.isArray(product.features) && product.features.length > 0) {
      return product.features;
    }
    return [
      'Certified Authentic & Quality Tested',
      'Fast Nationwide Express Delivery',
      'Cash on Delivery Available',
      '100% Satisfaction Guarantee'
    ];
  }, [product]);

  // Show only the description entered by the admin.
  const productDescription = useMemo(() => {
    return String(product.description || '').trim();
  }, [product]);

  // Filter Related Products from same category
  const relatedProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    const sameCat = allProducts.filter(
      (p) => p.id !== product.id && p.category === product.category
    );
    if (sameCat.length >= 3) return sameCat.slice(0, 4);
    // Fallback to other products if category has few items
    const others = allProducts.filter((p) => p.id !== product.id);
    return others.slice(0, 4);
  }, [product, allProducts]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out ${product.title} on ${storeName}!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSharedToast(true);
      setTimeout(() => setSharedToast(false), 2500);
    }
  };

  const handleSupportInquiry = () => {
    openWhatsApp(
      `Hello ${storeName},\n\nI would like more information about this product:\n• Product: ${product.title}\n• Price: Rs ${product.price.toLocaleString('en-PK')}\n• Color: ${selectedColor}\n• Size/Variant: ${selectedSize}\n\nPlease assist me.`
    );
  };

  return (
    <div className="fixed inset-0 z-[100] font-sans bg-slate-950/70 sm:backdrop-blur-xs flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 overflow-hidden w-full h-full">
      {/* Backdrop overlay */}
      <div className="fixed inset-0 hidden sm:block" onClick={onClose} aria-hidden="true" />

      {/* Main Modal Container - Permanent flex layout with pinned header and pinned bottom action bar on mobile and desktop */}
      <div className="relative z-10 flex flex-col w-full h-full max-h-full sm:h-[90vh] sm:max-h-[90vh] max-w-4xl sm:rounded-[20px] bg-slate-50 shadow-2xl border-0 sm:border border-slate-200/80 overflow-hidden min-h-0">

        {/* 1. TOP NAVIGATION BAR (Fixed Header) */}
        <header className="shrink-0 flex items-center justify-between gap-2 border-b border-slate-200/80 bg-white px-3 sm:px-4 py-2 shadow-2xs z-20">
          {/* Back Button */}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 h-7.5 px-2.5 rounded-lg bg-slate-100/90 text-slate-800 transition hover:bg-slate-200 hover:text-red-600 active:scale-95 cursor-pointer border border-slate-200/80 font-bold text-xs shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={14} className="text-red-600" />
            <span>Back</span>
          </button>

          {/* Center Space */}
          <div className="flex-1" />

          {/* Action Buttons Right */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-red-600 border border-slate-200/80 transition active:scale-95 cursor-pointer"
              title="Share Product"
            >
              <Share2 size={14} />
            </button>

            {/* Cart Button */}
            <button
              type="button"
              onClick={onOpenCart || (() => { if (onAddToCart) onAddToCart(quantity); })}
              className="relative inline-flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-red-600 border border-slate-200/80 transition active:scale-95 cursor-pointer"
              title="View Cart"
            >
              <ShoppingCart size={14} />
              {cartCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#E8262A] px-1 text-[8px] font-black text-white shadow-xs">
                  {cartCount}
                </span>
              ) : null}
            </button>

            {/* Wishlist */}
            <button
              type="button"
              onClick={() => setIsWishlist(!isWishlist)}
              className={`inline-flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-slate-200/80 transition active:scale-95 cursor-pointer ${
                isWishlist
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-red-600'
              }`}
              title="Add to Wishlist"
            >
              <Heart size={14} fill={isWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>
        </header>

        {/* Copy Share Toast Notification */}
        {sharedToast && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-lg">
            Link copied to clipboard!
          </div>
        )}

        {/* Added to Cart Toast Notification */}
        {addedToast && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xl flex items-center gap-1.5 animate-bounce">
            <CheckCircle2 size={14} />
            <span>Added to Cart!</span>
          </div>
        )}

        {/* Scrollable Body Container */}
        <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-6 space-y-5 pb-28 sm:pb-12 overscroll-contain touch-pan-y">

          {/* Main Top Product Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 sm:p-6 rounded-[20px] border border-slate-100 shadow-xs">

            {/* 2. PRODUCT IMAGE GALLERY */}
            <div className="space-y-3">
              {/* Main Image View */}
              <div className="relative overflow-hidden rounded-[18px] bg-slate-50 border border-slate-100 group aspect-square flex items-center justify-center">
                <img
                  src={galleryImages[selectedImgIndex]}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Discount Badge Top Left */}
                {product.badge && (
                  <span className="absolute top-3 left-3 rounded-lg bg-[#E8262A] px-2.5 py-1 text-[11px] font-black uppercase text-white shadow-sm tracking-wider">
                    {product.badge}
                  </span>
                )}

                {/* Small Image Counter Bottom Right */}
                <div className="absolute bottom-3 right-3 rounded-full bg-slate-900/75 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
                  {selectedImgIndex + 1} / {galleryImages.length}
                </div>
              </div>

              {/* Thumbnails Row */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImgIndex(idx)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition cursor-pointer ${
                      selectedImgIndex === idx
                        ? 'border-[#E8262A] ring-2 ring-red-500/20'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* 3. PRODUCT INFORMATION */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                {/* Brand & Stock Status Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {brandName ? (
                      <>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-800 bg-red-50 px-2.5 py-1 rounded-md border border-red-200/60">
                          {brandName}
                        </span>
                        <span className="text-[11px] text-slate-400">•</span>
                      </>
                    ) : null}
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                      {product.category || 'Product Details'}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50/80 px-2.5 py-0.5 rounded-full">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      In Stock
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                      <span className="text-amber-500 font-extrabold">4.8</span>
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      <span className="text-[10px] text-slate-400 font-normal">({product.reviewsCount || 128})</span>
                    </div>
                  </div>
                </div>

                {/* Product Name */}
                <h1 className="mt-2.5 text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                  {product.title}
                </h1>

                {/* Wishlist & Authenticity Bar */}
                <div className="mt-2 flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-semibold text-red-700">100% Authentic & Certified Quality</span>
                  <button
                    type="button"
                    onClick={() => setIsWishlist(!isWishlist)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      isWishlist ? 'text-rose-600 bg-rose-50 border border-rose-200' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    <Heart size={14} fill={isWishlist ? 'currentColor' : 'none'} />
                    <span>{isWishlist ? 'Wishlisted' : 'Add to Wishlist'}</span>
                  </button>
                </div>

                {/* Price Box */}
                <div className="mt-3.5 rounded-2xl bg-red-50/80 p-3.5 border border-red-100">
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-[#E8262A]">
                      Rs {product.price.toLocaleString('en-PK')}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm font-medium text-slate-400 line-through">
                        Rs {product.originalPrice.toLocaleString('en-PK')}
                      </span>
                    )}
                    <span className="rounded-md bg-[#E8262A] px-2 py-0.5 text-[11px] font-extrabold text-white uppercase">
                      {discountPercent}% OFF
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-red-800 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-red-600 shrink-0" />
                    Inclusive of all taxes
                  </p>
                </div>

                {/* Color Swatches (only when configured for this product) */}
                {colorOptions.length > 0 && <div className="mt-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Available Color:</span>
                    <span className="font-semibold text-red-700">{selectedColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-1 text-xs rounded-lg border font-semibold transition cursor-pointer ${
                          selectedColor === c
                            ? 'border-[#E8262A] bg-[#E8262A] text-white shadow-xs'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>}

                {/* Variant Chips (only when configured for this product) */}
                {variantOptions.length > 0 && <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Variant / Size:</span>
                    <span className="font-semibold text-red-700">{selectedSize}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {variantOptions.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setSelectedSize(v)}
                        className={`px-3 py-1 text-xs rounded-lg border font-semibold transition cursor-pointer ${
                          selectedSize === v
                            ? 'border-[#E8262A] bg-red-50 text-red-700 font-bold border-2'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>}
              </div>

              {/* Quantity Selector Box */}
              <div className="mt-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 p-3 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-800">Quantity</span>
                  <span className="text-[10px] text-red-700 font-bold bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                    Select Quantity
                  </span>
                </div>
                <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-xs font-extrabold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. PRODUCT DESCRIPTION SECTION */}
          {productDescription && <div className="rounded-[20px] border border-slate-100 bg-white p-4 sm:p-6 shadow-xs space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2.5">
              Product Description
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {productDescription}
            </p>
          </div>}

          {/* 5. PRODUCT DETAILS SECTION */}
          <div className="rounded-[20px] border border-slate-100 bg-white p-4 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2.5">
              Product Details
            </h2>

            {/* Product Specifications & Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {productDetails.map((detail) => (
                <div key={detail.label} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-500">{detail.label}</span>
                  <span className="font-bold text-slate-900 text-right">{detail.value}</span>
                </div>
              ))}
            </div>

            {/* Key Features */}
            {keyFeatures.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <h3 className="text-xs font-bold text-slate-800">Key Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {keyFeatures.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 size={15} className="text-red-600 shrink-0" />
                      <span className="font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 6. DELIVERY & SHIPPING INFORMATION CARD (Right below Key Features) */}
          <div className="rounded-[20px] border border-slate-100 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Truck size={16} className="text-[#E8262A]" />
                Delivery Information
              </h3>
              <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-100">
                Nationwide Express
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Delivery Time & Cost */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <Truck size={20} className="text-[#E8262A] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-slate-900">Standard Delivery</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">2 to 4 Days</p>
                  <p className="text-[11px] font-extrabold text-red-700 mt-0.5">Rs 260 (Buy 3 products for free delivery)</p>
                </div>
              </div>

              {/* Guarantees & Pakistan Wide Delivery */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <MapPin size={20} className="text-[#E8262A] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-slate-900">Delivery Coverage</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">Fast & Reliable Shipping Across All Cities in Pakistan</p>
                </div>
              </div>
            </div>
          </div>

          {/* 7. RATING DISPLAY SECTION (Right after Delivery, with numeric text 4.5 / 4.8) */}
          <div className="rounded-[20px] border border-slate-100 bg-white p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Customer Rating
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Quality verified product review score</p>
            </div>
            <div className="flex items-center gap-3 bg-amber-50/90 px-4 py-2 rounded-xl border border-amber-200/80">
              <span className="text-lg font-black text-amber-700">{averageRating.toFixed(1)}</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.round(averageRating) ? 'currentColor' : 'none'} className="text-amber-500" />
                ))}
              </div>
              <span className="text-xs font-bold text-amber-800">({averageRating.toFixed(1)} / 5.0)</span>
            </div>
          </div>

          {/* 8. CUSTOMER REVIEWS SECTION (With Product Picture & Product Name) */}
          <div className="rounded-[20px] border border-slate-100 bg-white p-4 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Customer Reviews
              </h3>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                ✓ Verified Customer Reviews
              </span>
            </div>

            {/* Product Picture & Product Name Header in Reviews */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <img
                src={product.image}
                alt={product.title}
                className="h-14 w-14 rounded-lg object-cover border border-slate-200 shrink-0 bg-white shadow-2xs"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {product.title}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">4.8 ★</span>
                  <span className="text-[11px] text-slate-500 font-medium">• 128 Verified Reviews</span>
                </div>
              </div>
            </div>

            {/* Reviews Cards List */}
            <div className="space-y-3 pt-1">
              {!reviews.length && <p className="py-4 text-center text-xs font-medium text-slate-400">No reviews yet.</p>}
              {reviews.map((review) => <article key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black text-slate-900">{review.reviewer_name}</p><div className="mt-0.5 flex items-center gap-0.5">{[...Array(5)].map((_, index) => <Star key={index} size={13} fill={index < Number(review.rating) ? 'currentColor' : 'none'} className="text-amber-500" />)}</div></div><time className="shrink-0 text-[10px] font-medium text-slate-400">{review.created_at ? new Date(review.created_at).toLocaleDateString('en-GB') : ''}</time></div><p className="mt-2 text-xs leading-relaxed text-slate-600">{review.comment}</p></article>)}
            </div>
          </div>

          {/* 8. RELATED PRODUCTS SECTION */}
          {relatedProducts.length > 0 && (
            <div className="rounded-[20px] border border-slate-100 bg-white p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Related Products
                </h3>
                <span className="text-xs font-semibold text-red-700">From {product.category}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectProduct && onSelectProduct(rel)}
                    className="group flex flex-col justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-red-300 hover:shadow-md transition cursor-pointer"
                  >
                    <div className="space-y-2">
                      <div className="aspect-square rounded-lg overflow-hidden bg-white">
                        <img
                          src={rel.image}
                          alt={rel.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-2 group-hover:text-red-700">
                        {rel.title}
                      </p>
                    </div>
                    <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#E8262A]">
                        Rs {rel.price.toLocaleString('en-PK')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* 9. STICKY BOTTOM ACTION BAR (Always visible & pinned across all mobile & desktop screen sizes) */}
        <footer
          className="shrink-0 z-30 border-t border-slate-200/90 bg-white/95 backdrop-blur-md p-2.5 sm:p-3 sm:px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.12)]"
          style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="flex items-center justify-between gap-2 sm:gap-3 max-w-4xl mx-auto">
            {/* Customer Support Compact Icon Button */}
            <button
              type="button"
              onClick={handleSupportInquiry}
              className="h-11 sm:h-12 w-11 sm:w-12 rounded-xl border-2 border-slate-200 bg-white text-[#6E6E6E] flex items-center justify-center shrink-0 transition hover:bg-slate-50 hover:text-[#E8262A] active:scale-95 cursor-pointer shadow-2xs"
              title="Customer Support"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-label="Customer support">
                <path d="M5 13v-1.5a7 7 0 0 1 14 0V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <rect x="3.5" y="11.5" width="3.5" height="6" rx="1.75" fill="currentColor"/>
                <rect x="17" y="11.5" width="3.5" height="6" rx="1.75" fill="currentColor"/>
                <path d="M19 17c0 2.3-1.8 3.5-4.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                <rect x="12" y="19" width="3.5" height="2.5" rx="1.25" fill="currentColor"/>
              </svg>
            </button>

            {/* Add To Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 h-11 sm:h-12 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 rounded-xl border-2 border-[#E8262A] bg-white text-[#E8262A] font-extrabold text-xs uppercase tracking-wider transition hover:bg-red-50 active:scale-95 cursor-pointer whitespace-nowrap shadow-xs"
            >
              <ShoppingCart size={17} className="shrink-0 text-[#E8262A]" />
              <span>Add To Cart</span>
            </button>

            {/* Buy Now Button */}
            <button
              type="button"
              onClick={() => onBuyNow(quantity)}
              className="flex-[1.25] h-11 sm:h-12 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 rounded-xl bg-[#E8262A] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition hover:bg-red-700 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <ShoppingBag size={17} className="shrink-0" />
              <span>Buy Now</span>
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}
