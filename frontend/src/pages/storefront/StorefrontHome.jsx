import React from 'react';
import Header from '../../components/Header';
import CategoryNav from '../../components/CategoryNav';
import HeroBanner from '../../components/HeroBanner';
import FlashSale from '../../components/FlashSale';
import CategoryGrid from '../../components/CategoryGrid';
import ProductGrid from '../../components/ProductGrid';
import Footer from '../../components/Footer';
import BottomNav from '../../components/BottomNav';
import LoginModal from '../../components/LoginModal';
import CheckoutModal from '../../components/CheckoutModal';
import ProductDetailsModal from '../../components/ProductDetailsModal';
import UserProfileView from '../../components/UserProfileView';
import {
  Briefcase,
  ChevronRight,
  Download,
  Headphones,
  Heart,
  Info,
  LogIn,
  LogOut,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Store,
  Truck,
  User,
  X
} from 'lucide-react';
import {
  footerSections,
  flashSaleProducts,
  heroSlides,
  mainNav,
  paymentMethods,
  productSections,
  promoBanners,
  storeLogoSrc,
  storeName,
  topLinks
} from '../../data/storeData';
import { openWhatsApp } from '../../utils/whatsapp';
import { isAdminRole } from '../../utils/roles';

function matchesCategory(product, cat) {
  if (!cat || cat === 'All') return true;
  const c = cat.toLowerCase();
  const pCat = (product.category || '').toLowerCase();
  const pSubCat = (product.subcategory || '').toLowerCase();
  const pTitle = (product.title || '').toLowerCase();

  if (pCat.includes(c) || pSubCat.includes(c) || pTitle.includes(c)) return true;

  if (c === 'fashion' || c === 'clothes' || c === 'shirts') {
    return (
      pCat.includes('fashion') ||
      pCat.includes('shirt') ||
      pCat.includes('cloth') ||
      pCat.includes('accessor') ||
      pTitle.includes('tee') ||
      pTitle.includes('shirt') ||
      pTitle.includes('sneaker') ||
      pTitle.includes('backpack') ||
      pTitle.includes('hoodie')
    );
  }
  if (c === 'electronics' || c === 'mobiles' || c === 'audio' || c === 'gaming' || c === 'laptops') {
    return (
      pCat.includes('electr') ||
      pCat.includes('audio') ||
      pCat.includes('gamin') ||
      pCat.includes('laptop') ||
      pTitle.includes('earbud') ||
      pTitle.includes('watch') ||
      pTitle.includes('phone') ||
      pTitle.includes('tv') ||
      pTitle.includes('controller') ||
      pTitle.includes('camera') ||
      pTitle.includes('keyboard') ||
      pTitle.includes('speaker')
    );
  }
  if (c === 'home & living' || c === 'home' || c === 'decor' || c === 'appliances') {
    return (
      pCat.includes('home') ||
      pCat.includes('decor') ||
      pCat.includes('appliance') ||
      pTitle.includes('lamp') ||
      pTitle.includes('chair') ||
      pTitle.includes('art') ||
      pTitle.includes('desk')
    );
  }
  if (c === 'shoes') {
    return (
      pCat.includes('shoe') ||
      pTitle.includes('shoe') ||
      pTitle.includes('sneaker')
    );
  }
  if (c === 'watches' || c === 'watch') {
    return pCat.includes('watch') || pTitle.includes('watch');
  }
  if (c === 'health & beauty' || c === 'beauty' || c === 'health') {
    return pCat.includes('beaut') || pCat.includes('health') || pTitle.includes('skin') || pTitle.includes('face') || pTitle.includes('fragrance');
  }
  if (c === 'sports' || c === 'fitness') {
    return pCat.includes('sport') || pCat.includes('fitn') || pTitle.includes('shoe') || pTitle.includes('mat');
  }

  return false;
}

function filterProducts(list, query, cat) {
  let result = list;
  if (cat && cat !== 'All') {
    result = result.filter((p) => matchesCategory(p, cat));
  }
  const needle = query.trim().toLowerCase();
  if (!needle) return result;
  return result.filter((product) =>
    [product.title, product.category, product.badge].some((field) => (field || '').toLowerCase().includes(needle))
  );
}

export default function StorefrontHome({ onLogin, session, onLogout }) {
  const [websiteCategories, setWebsiteCategories] = React.useState([]);
  const [websiteProducts, setWebsiteProducts] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [categoryPage, setCategoryPage] = React.useState(null);

  React.useEffect(() => {
    if (categoryPage) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [categoryPage]);
  const [hiddenProductIds, setHiddenProductIds] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('apexiums-hidden-products') || '[]'); } catch { return []; }
  });
  const [cartItems, setCartItems] = React.useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [authUser, setAuthUser] = React.useState(() => {
    if (session) return session;
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('apexiums-auth-session');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  React.useEffect(() => {
    if (session) {
      setAuthUser(session);
    }
  }, [session]);

  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [modalQty, setModalQty] = React.useState(1);

  const cartCount = React.useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.qty || 1), 0);
  }, [cartItems]);

  const [infoModal, setInfoModal] = React.useState(null);
  const [applicationForm, setApplicationForm] = React.useState({ applicant_name: '', business_name: '', email: '', phone: '', category: '', proposed_amount: '', message: '' });
  const [applicationStatus, setApplicationStatus] = React.useState('');
  const [chatOpen, setChatOpen] = React.useState(false);
  const [chatMessage, setChatMessage] = React.useState('');
  const [chatSent, setChatSent] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    const loadCategories = () => fetch('/api/categories?limit=100', { headers: { 'x-user-role': 'User' } })
      .then((response) => response.ok ? response.json() : { rows: [] })
      .then((data) => { if (active) setWebsiteCategories((Array.isArray(data.rows) ? data.rows : []).map((row) => ({ ...row, subcategories: Array.isArray(row.subcategories) ? row.subcategories : (() => { try { return JSON.parse(row.subcategories || '[]'); } catch { return []; } })() }))); })
      .catch(() => { if (active) setWebsiteCategories([]); });
    loadCategories();
    const interval = window.setInterval(loadCategories, 5000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  React.useEffect(() => {
    let active = true;
    const loadProducts = () => fetch('/api/products?limit=500', { headers: { 'x-user-role': 'User' } })
      .then((response) => response.ok ? response.json() : { rows: [] })
      .then((data) => {
        if (!active) return;
        const rows = Array.isArray(data.rows) ? data.rows : [];
        setWebsiteProducts(rows.map((row) => ({
          ...row,
          id: row.id,
          title: row.name || 'Product',
          name: row.name || 'Product',
          image: row.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
          gallery: [row.image_url, ...(() => { try { return (row.product_images ? JSON.parse(row.product_images) : []).map((item) => typeof item === 'string' ? item : item.url).filter(Boolean); } catch { return []; } })()].filter(Boolean).slice(0, 5),
          price: Number(row.discounted_price ?? row.base_price ?? row.actual_price ?? 0),
          originalPrice: Number(row.actual_price ?? row.base_price ?? 0),
          stock: Number(row.stock_qty || 0),
          category: row.category || 'All',
          subcategory: row.subcategory || '',
          colors: (() => { try { return JSON.parse(row.product_detail || '{}').colors || ''; } catch { return ''; } })(),
          sizes: (() => { try { return JSON.parse(row.product_detail || '{}').sizes || ''; } catch { return ''; } })(),
          status: Number(row.stock_qty || 0) === 0 ? 'Out of Stock' : (row.status || 'Active')
        })));
      })
      .catch(() => { if (active) setWebsiteProducts([]); });
    loadProducts();
    const interval = window.setInterval(loadProducts, 5000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  const handleAddProductToCart = (product, qty = 1) => {
    if (!product) return;
    setCartItems((prev) => {
      const idx = prev.findIndex((item) => item.id === product.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: (copy[idx].qty || 1) + qty };
        return copy;
      }
      return [...prev, { ...product, qty }];
    });
  };

  React.useEffect(() => {
    document.body.style.overflow = mobileMenuOpen || selectedProduct || checkoutOpen || infoModal || chatOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, selectedProduct, checkoutOpen, infoModal, chatOpen]);

  React.useEffect(() => {
    const refreshVisibility = () => {
      try { setHiddenProductIds(JSON.parse(localStorage.getItem('apexiums-hidden-products') || '[]')); } catch { setHiddenProductIds([]); }
    };
    window.addEventListener('apexiums-product-visibility-changed', refreshVisibility);
    return () => window.removeEventListener('apexiums-product-visibility-changed', refreshVisibility);
  }, []);

  const visible = (list) => list.filter((p) => !hiddenProductIds.includes(p.id) && p.status !== 'Inactive' && p.status !== 'Out of Stock');
  const catalogProducts = websiteProducts.length ? websiteProducts : [...flashSaleProducts, ...productSections.flatMap((section) => section.products)];
  const filteredFlashSale = filterProducts(visible(catalogProducts), searchQuery, selectedCategory);
  const filteredSections = [{ title: 'All Products', products: filterProducts(visible(catalogProducts), searchQuery, selectedCategory) }];

  const allProductsList = React.useMemo(() => {
    const map = new Map();
    catalogProducts.forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  }, [catalogProducts]);

  function handleLogin(user) {
    setAuthUser(user);
    if (typeof localStorage !== 'undefined' && user) {
      localStorage.setItem('apexiums-auth-session', JSON.stringify(user));
    }
    if (onLogin) onLogin(user);
    setLoginOpen(false);
    setProfileOpen(true);
  }

  const handleAccountClick = () => {
    let currentUser = authUser;
    if (!currentUser) {
      try { currentUser = JSON.parse(localStorage.getItem('apexiums-auth-session') || 'null'); } catch { currentUser = null; }
    }

    if (currentUser && (isAdminRole(currentUser.role) || currentUser.loginType === 'admin')) {
      window.location.assign('/dashboard');
    } else if (currentUser) {
      setAuthUser(currentUser);
      setProfileOpen(true);
    } else {
      setLoginOpen(true);
    }
  };

  function handleLogout() {
    setAuthUser(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('apexiums-auth-session');
      localStorage.removeItem('apexiums-user-avatar');
    }
    if (onLogout) {
      onLogout();
    }
    setInfoModal({
      title: 'Logged Out',
      content: 'You have been successfully logged out of your Apexiums account.'
    });
  }

  const sideMenuOptions = [
    {
      label: authUser ? 'My Profile' : 'Login / Register',
      icon: authUser ? <User size={18} /> : <LogIn size={18} />,
      onClick: handleAccountClick
    },
    {
      label: 'My Orders',
      icon: <Package size={18} />,
      onClick: () => setCheckoutOpen(true)
    },
    {
      label: 'Wishlist',
      icon: <Heart size={18} />,
      onClick: () => {
        const el = document.getElementById('products-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      label: 'About',
      icon: <Info size={18} />,
      onClick: () =>
        setInfoModal({
          title: 'About Apexiums',
          content:
            'Apexiums Technologies is your premier online e-commerce marketplace offering high-quality fashion, electronics, gadgets, and daily essentials with fast delivery and guaranteed satisfaction.'
        })
    },
    {
      label: 'Download the app',
      icon: <Smartphone size={18} />,
      onClick: () =>
        setInfoModal({
          title: 'Download Apexiums App',
          content:
            'Get exclusive discounts, real-time order tracking, and instant flash sale notifications! Available now on Android Play Store and Apple App Store.'
        })
    },
    {
      label: 'Become a Seller',
      icon: <Store size={18} />,
      onClick: () =>
        setInfoModal({
          title: 'Become a Seller',
          type: 'seller-application',
          content:
            'Join thousands of successful merchants on Apexiums! List your products, reach millions of active shoppers across Pakistan, and grow your sales effortless.'
        })
    },
    {
      label: 'Become an Investor',
      icon: <Briefcase size={18} />,
      onClick: () =>
        setInfoModal({
          title: 'Become an Investor',
          type: 'investor-application',
          content:
            'Apexiums Technologies is expanding rapidly! Partner with us to revolutionize next-generation logistics and digital e-commerce infrastructure.'
        })
    },
    {
      label: 'Privacy Policy',
      icon: <ShieldCheck size={18} />,
      onClick: () =>
        setInfoModal({
          title: 'Privacy Policy',
          content:
            'Your privacy and data security are our top priorities. All customer transactions are encrypted, and personal details are strictly protected under our global privacy standard.'
        })
    },
    {
      label: 'Help and Support',
      icon: <Headphones size={18} />,
      onClick: () => openWhatsApp('Hello, I need assistance from Elistin customer support.')
    },
    {
      label: 'Logout',
      icon: <LogOut size={18} />,
      isLogout: true,
      onClick: handleLogout
    }
  ];

  return (
    <div
      className="flex min-h-screen flex-col text-slate-900 font-sans"
      style={{ backgroundColor: 'var(--brand-primary)' }}
    >
      <Header
        storeName={storeName}
        logoSrc={storeLogoSrc}
        authUser={authUser}
        cartCount={cartCount}
        onAccountClick={handleAccountClick}
        onCartClick={() => setCheckoutOpen(true)}
        onWishlistClick={() => {
          const el = document.getElementById('products-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        mobileMenuOpen={mobileMenuOpen}
        onMenuToggle={() => setMobileMenuOpen((value) => !value)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={(event) => event.preventDefault()}
        onSearchFocus={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Card with Crisp White / Light Slate #F8F9FA */}
      <main className="relative z-10 flex-1 overflow-hidden rounded-t-[28px] bg-[#F8F9FA] pt-3 pb-24 shadow-[0_10px_24px_rgba(15,23,42,0.10)] sm:rounded-t-[36px] sm:pb-28 space-y-0">
        {categoryPage ? (
          <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-5 space-y-4">
            <button type="button" onClick={() => { setCategoryPage(null); setSelectedCategory('All'); window.history.pushState({}, '', '/'); window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); }} className="text-sm font-bold text-red-600">← Back to Home</button>
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h1 className="text-2xl font-black text-slate-900">{categoryPage}</h1>
              <p className="mt-1 text-sm text-slate-500">Products in {categoryPage} category</p>
              {websiteCategories.find((c) => c.name === categoryPage)?.subcategories?.length ? <div className="mt-4 flex flex-wrap gap-2">{websiteCategories.find((c) => c.name === categoryPage).subcategories.map((sub) => <button key={sub} type="button" onClick={() => setSelectedCategory(sub)} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold hover:bg-red-50 hover:text-red-600">{sub}</button>)}</div> : null}
            </div>
            <ProductGrid sections={filteredSections} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} onSelectProduct={(p) => { setSelectedProduct(p); setModalQty(1); }} onAddToCart={(p) => handleAddProductToCart(p, 1)} />
          </section>
        ) : <>
        <HeroBanner slides={heroSlides} promoBanners={promoBanners} />
        <CategoryGrid
          categories={websiteCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => { setSelectedCategory(cat); if (cat !== 'All') { setCategoryPage(cat); window.history.pushState({}, '', `/category/${encodeURIComponent(cat)}`); } }}
        />
        <FlashSale
          products={filteredFlashSale}
          onProductClick={(p) => { setSelectedProduct(p); setModalQty(1); }}
          onAddToCart={(p) => handleAddProductToCart(p, 1)}
        />
        </>}
      </main>

      <Footer
        sections={footerSections}
        paymentMethods={paymentMethods}
        storeName={storeName}
        logoSrc={storeLogoSrc}
        categories={websiteCategories}
        onCategoryClick={(categoryName) => {
          setSelectedCategory(categoryName);
          setCategoryPage(categoryName);
          window.history.pushState({}, '', `/category/${encodeURIComponent(categoryName)}`);
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }}
        onAdminClick={() => setLoginOpen(true)}
      />

      {!selectedProduct ? (
        <BottomNav
          cartCount={cartCount}
          isCartOpen={checkoutOpen}
          isProfileOpen={profileOpen}
          onCartClick={() => {
            setProfileOpen(false);
            setCheckoutOpen(true);
          }}
          onHomeClick={() => {
            setProfileOpen(false);
            setCheckoutOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onAccountClick={() => {
            setCheckoutOpen(false);
            handleAccountClick();
          }}
          onWishlistClick={() => {
            setProfileOpen(false);
            setCheckoutOpen(false);
            const el = document.getElementById('products-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onSupportClick={() => {
            setProfileOpen(false);
            setCheckoutOpen(false);
            openWhatsApp('Hello, I need assistance from Elistin customer support.');
          }}
          onChatClick={() => {
            setProfileOpen(false);
            setCheckoutOpen(false);
            openWhatsApp('Hello, I need assistance from Elistin customer support.');
          }}
        />
      ) : null}

      {/* Slide-out Menu Drawer */}
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-xs transition-opacity">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 h-full w-full cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 z-10 flex h-[100dvh] w-[85%] max-w-sm flex-col justify-between overflow-y-auto overscroll-contain bg-white p-5 pb-32 shadow-2xl">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-[#E8262A] font-black text-lg shadow-2xs">
                    A
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-base leading-tight">{storeName}</h2>
                    <p className="text-[11px] font-medium text-slate-500">Super Online Marketplace</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* User Account Banner with Red Gradient */}
              <div className="mt-4 rounded-2xl bg-gradient-to-r from-[#E8262A] to-[#E8262A] p-3.5 text-white shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-red-100">Welcome to {storeName}</p>
                  <p className="text-xs sm:text-sm font-bold mt-0.5 truncate max-w-[170px]">
                    {authUser ? authUser.name || authUser.email : 'Guest Account'}
                  </p>
                </div>
                {!authUser ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLoginOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white text-[#E8262A] font-bold text-xs shadow-2xs hover:bg-red-50 transition cursor-pointer shrink-0"
                  >
                    Login
                  </button>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold backdrop-blur-xs">
                    Signed In
                  </span>
                )}
              </div>

              {/* Menu Options List */}
              <div className="mt-4 space-y-1 pb-6">
                {sideMenuOptions.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      item.onClick();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      item.isLogout
                        ? 'text-red-600 hover:bg-red-50 mt-3 mb-4 border border-red-100'
                        : 'text-slate-800 hover:bg-red-50/60 hover:text-[#E8262A]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                          item.isLogout
                            ? 'bg-red-100 text-red-600'
                            : 'bg-red-50 text-[#E8262A]'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Dynamic Info Popup Modal */}
      {chatOpen ? <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"><form onSubmit={async(e)=>{e.preventDefault();if(!chatMessage.trim())return;const chat={id:`chat-${Date.now()}`,customerName:authUser?.name||'Guest Customer',customerEmail:authUser?.email||'',message:chatMessage.trim(),reply:'',status:'Open',date:new Date().toLocaleString()};const chats=JSON.parse(localStorage.getItem('apexiums-support-chats')||'[]');localStorage.setItem('apexiums-support-chats',JSON.stringify([chat,...chats]));window.dispatchEvent(new Event('apexiums-chat-created'));try{await fetch('/api/chats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sender_name:chat.customerName,sender_type:'Customer',subject:'Customer Support',message:chat.message,status:'Open'})})}catch{}setChatMessage('');setChatSent(true)}} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between border-b pb-3"><div className="flex items-center gap-2"><Headphones className="text-red-600" size={20}/><h3 className="font-black">Chat with Support</h3></div><button type="button" onClick={()=>setChatOpen(false)}><X size={18}/></button></div>{chatSent&&<div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700">Message sent. Admin will reply from Customer Chats.</div>}<label className="mt-4 block text-xs font-bold">Your question<textarea required rows="5" value={chatMessage} onChange={(e)=>setChatMessage(e.target.value)} placeholder="Write your question here..." className="mt-1 w-full rounded-xl border p-3 font-medium outline-none focus:border-red-500"/></label><button className="mt-4 w-full rounded-xl bg-red-600 py-3 text-xs font-black text-white">Send Message</button></form></div> : null}

      {infoModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 text-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-[#E8262A]">
                  <Info size={20} />
                </div>
                <h3 className="font-extrabold text-base text-[#1E1E1E]">{infoModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-600 font-medium">{infoModal.content}</p>

            {infoModal.type ? <form className="mt-4 space-y-3" onSubmit={async (event) => {
              event.preventDefault(); setApplicationStatus('Submitting...');
              const resource = infoModal.type === 'seller-application' ? 'seller_applications' : 'investor_applications';
              const payload = infoModal.type === 'seller-application' ? { applicant_name: applicationForm.applicant_name, business_name: applicationForm.business_name, email: applicationForm.email, phone: applicationForm.phone, category: applicationForm.category, message: applicationForm.message, status: 'Pending' } : { applicant_name: applicationForm.applicant_name, email: applicationForm.email, phone: applicationForm.phone, proposed_amount: Number(applicationForm.proposed_amount || 0), message: applicationForm.message, status: 'Pending' };
              try { const response = await fetch(`/api/${resource}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!response.ok) throw new Error('Application could not be submitted.'); setApplicationStatus('Application submitted successfully. Our team will review it.'); setApplicationForm({ applicant_name: '', business_name: '', email: '', phone: '', category: '', proposed_amount: '', message: '' }); } catch (error) { setApplicationStatus(error.message); }
            }}>
              <div className="grid grid-cols-2 gap-2"><input required value={applicationForm.applicant_name} onChange={(event) => setApplicationForm({ ...applicationForm, applicant_name: event.target.value })} placeholder="Full name" className="rounded-xl border px-3 py-2 text-xs"/><input required type="email" value={applicationForm.email} onChange={(event) => setApplicationForm({ ...applicationForm, email: event.target.value })} placeholder="Email address" className="rounded-xl border px-3 py-2 text-xs"/></div>
              <input required value={applicationForm.phone} onChange={(event) => setApplicationForm({ ...applicationForm, phone: event.target.value })} placeholder="Phone number" className="w-full rounded-xl border px-3 py-2 text-xs"/>
              {infoModal.type === 'seller-application' ? <div className="grid grid-cols-2 gap-2"><input required value={applicationForm.business_name} onChange={(event) => setApplicationForm({ ...applicationForm, business_name: event.target.value })} placeholder="Business name" className="rounded-xl border px-3 py-2 text-xs"/><input required value={applicationForm.category} onChange={(event) => setApplicationForm({ ...applicationForm, category: event.target.value })} placeholder="Product category" className="rounded-xl border px-3 py-2 text-xs"/></div> : <input required type="number" min="1" value={applicationForm.proposed_amount} onChange={(event) => setApplicationForm({ ...applicationForm, proposed_amount: event.target.value })} placeholder="Proposed investment amount (Rs)" className="w-full rounded-xl border px-3 py-2 text-xs"/>}
              <textarea rows="3" value={applicationForm.message} onChange={(event) => setApplicationForm({ ...applicationForm, message: event.target.value })} placeholder="Additional details" className="w-full rounded-xl border px-3 py-2 text-xs"/>
              {applicationStatus ? <p className="text-xs font-bold text-emerald-600">{applicationStatus}</p> : null}
              <button className="w-full rounded-xl bg-[#E8262A] py-2.5 text-xs font-bold text-white">Submit Application</button>
            </form> : null}

            {!infoModal.type ? <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="w-full py-2.5 rounded-xl bg-[#E8262A] hover:bg-red-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
              >
                Got It
              </button>
            </div> : null}
          </div>
        </div>
      ) : null}

      {/* Interactive Product Detail Modal */}
      {selectedProduct ? (
        <ProductDetailsModal
          product={selectedProduct}
          allProducts={allProductsList}
          storeName={storeName}
          cartCount={cartCount}
          onOpenCart={() => {
            if (selectedProduct) {
              handleAddProductToCart(selectedProduct, modalQty);
            }
            setSelectedProduct(null);
            setCheckoutOpen(true);
          }}
          onSelectProduct={(p) => {
            setSelectedProduct(p);
            setModalQty(1);
          }}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(qty) => {
            handleAddProductToCart(selectedProduct, qty);
          }}
          onBuyNow={(qty) => {
            handleAddProductToCart(selectedProduct, qty);
            setSelectedProduct(null);
            setCheckoutOpen(true);
          }}
        />
      ) : null}

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={handleLogin}
        storeName={storeName}
        logoSrc={storeLogoSrc}
      />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        storeName={storeName}
        logoSrc={storeLogoSrc}
        cartItems={cartItems}
        customerEmail={authUser?.email || ''}
        onUpdateQty={(id, delta) => {
          setCartItems((prev) =>
            prev
              .map((item) =>
                item.id === id ? { ...item, qty: Math.max(1, (item.qty || 1) + delta) } : item
              )
          );
        }}
        onRemoveItem={(id) => {
          setCartItems((prev) => prev.filter((item) => item.id !== id));
        }}
        onOrderPlaced={() => setCartItems([])}
      />

      {profileOpen ? (
        <div className="fixed inset-0 z-[90] bg-white overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          <UserProfileView
            session={authUser}
            onBack={() => setProfileOpen(false)}
            onOpenLogin={() => {
              setProfileOpen(false);
              setLoginOpen(true);
            }}
            onLogout={() => {
              handleLogout();
              setProfileOpen(false);
            }}
            onNavigateTab={(tab, filter) => {
              setProfileOpen(false);
              setCheckoutOpen(true);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
