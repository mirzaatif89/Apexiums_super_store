import React from 'react';
import Header from './Header';
import CategoryNav from './CategoryNav';
import HeroBanner from './HeroBanner';
import FlashSale from './FlashSale';
import CategoryGrid from './CategoryGrid';
import ProductGrid from './ProductGrid';
import Footer from './Footer';
import BottomNav from './BottomNav';
import LoginModal from './LoginModal';
import {
  footerSections,
  paymentMethods,
  storeLogoSrc,
  storeName,
  topLinks
} from '../data/storeData';

function filterProducts(list, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return list;
  return list.filter((product) =>
    [product.title, product.category, product.badge].some((field) => String(field || '').toLowerCase().includes(needle))
  );
}

function normalizeProduct(product) {
  const originalPrice = Number(product.actual_price || product.base_price || 0);
  const discountedPrice = Number(product.discounted_price || 0);
  const price = discountedPrice > 0 ? discountedPrice : originalPrice;
  const discount = originalPrice > price && originalPrice > 0
    ? `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF`
    : product.status;
  return {
    id: product.id,
    title: product.name,
    price,
    originalPrice,
    badge: discount,
    image: product.image_url,
    category: product.category || 'Uncategorized'
  };
}

export default function StorefrontHome({ onLogin }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [cartCount] = React.useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [authUser, setAuthUser] = React.useState(null);
  const [catalog, setCatalog] = React.useState({ banners: [], promotions: [], categories: [], products: [] });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    async function loadStorefront() {
      setLoading(true);
      setError('');
      try {
        const responses = await Promise.all([
          fetch('/api/banners?limit=50'),
          fetch('/api/promotions?limit=50'),
          fetch('/api/categories?limit=100'),
          fetch('/api/products?limit=100')
        ]);
        const payloads = await Promise.all(responses.map((response) => response.json()));
        const failed = responses.findIndex((response) => !response.ok);
        if (failed >= 0) throw new Error(payloads[failed]?.message || 'Unable to load storefront');
        if (!cancelled) {
          setCatalog({
            banners: payloads[0].rows || [],
            promotions: payloads[1].rows || [],
            categories: payloads[2].rows || [],
            products: payloads[3].rows || []
          });
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadStorefront();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const products = catalog.products.filter((product) => product.status === 'Live').map(normalizeProduct);
  const filteredProducts = filterProducts(products, searchQuery);
  const filteredFlashSale = filteredProducts.filter((product) => product.originalPrice > product.price);
  const filteredSections = [{
    title: searchQuery ? 'Search Results' : 'Products',
    description: searchQuery ? `Results for “${searchQuery}”` : 'Browse the latest available products',
    products: filteredProducts
  }];
  const categories = catalog.categories
    .filter((category) => category.status === 'Active')
    .map((category) => ({ id: category.id, label: category.name, image: category.image_url }));
  const mainNav = categories.map((category) => ({ label: category.label, items: [] }));
  const heroSlides = catalog.banners
    .filter((banner) => banner.status === 'Active' && banner.image_url)
    .map((banner) => ({
      id: banner.id,
      title: banner.title,
      description: banner.position || 'Featured marketplace offer',
      image: banner.image_url,
      cta: 'Explore Now',
      accent: banner.position || 'Featured'
    }));
  const promoBanners = catalog.promotions
    .filter((promotion) => promotion.status === 'Active' && promotion.show_on_website !== 'No' && promotion.image_url)
    .map((promotion) => ({
      id: promotion.id,
      title: promotion.name,
      subtitle: promotion.valid_till ? `Valid until ${String(promotion.valid_till).slice(0, 10)}` : 'Current offer',
      image: promotion.image_url
    }));

  function handleLogin(user) {
    setAuthUser(user);
    onLogin(user);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header
        storeName={storeName}
        logoSrc={storeLogoSrc}
        authUser={authUser}
        cartCount={cartCount}
        onAccountClick={() => setLoginOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        onMenuToggle={() => setMobileMenuOpen((value) => !value)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={(event) => event.preventDefault()}
        onSearchFocus={() => setMobileMenuOpen(false)}
      />

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/45 lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 h-full w-full"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <img src={storeLogoSrc} alt={storeName} loading="lazy" className="h-10 w-auto object-contain" />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLoginOpen(true);
                  }}
                  className="inline-flex min-h-11 items-center rounded-xl border border-teal-200 bg-teal-50 px-3 text-sm font-semibold text-teal-700"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200"
                >
                  X
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {topLinks.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="flex min-h-11 items-center rounded-2xl bg-slate-50 px-4 text-sm font-semibold text-slate-700"
                >
                  {link}
                </a>
              ))}
            </div>

            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Menu</p>
              <div className="mt-3 grid gap-3">
                {mainNav.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 p-4">
                    <h3 className="font-bold text-slate-950">{item.label}</h3>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {item.items.map((subItem) => (
                        <span key={subItem} className="rounded-xl bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700">
                          {subItem}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <main className="pb-20 lg:pb-0">
        <CategoryNav navItems={mainNav} />
        {error ? (
          <div className="mx-auto mt-4 max-w-7xl rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>
        ) : null}
        {loading ? (
          <div className="mx-auto grid min-h-[360px] max-w-7xl place-items-center px-4 text-sm font-semibold text-slate-500">Loading marketplace…</div>
        ) : (
          <>
        <HeroBanner slides={heroSlides} promoBanners={promoBanners} />
        {filteredFlashSale.length ? <FlashSale products={filteredFlashSale} /> : null}
        <CategoryGrid categories={categories} />
        <ProductGrid sections={filteredSections} />
          </>
        )}
        <Footer sections={footerSections} paymentMethods={paymentMethods} storeName={storeName} logoSrc={storeLogoSrc} />
      </main>

      <BottomNav />

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={handleLogin}
        storeName={storeName}
        logoSrc={storeLogoSrc}
      />
    </div>
  );
}
