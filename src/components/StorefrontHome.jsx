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
  categories,
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
} from '../data/storeData';

function filterProducts(list, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return list;
  return list.filter((product) =>
    [product.title, product.category, product.badge].some((field) => field.toLowerCase().includes(needle))
  );
}

export default function StorefrontHome({ onLogin }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [cartCount] = React.useState(4);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [authUser, setAuthUser] = React.useState(null);

  React.useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const filteredFlashSale = filterProducts(flashSaleProducts, searchQuery);
  const filteredSections = productSections.map((section) => ({
    ...section,
    products: filterProducts(section.products, searchQuery)
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
        <HeroBanner slides={heroSlides} promoBanners={promoBanners} />
        <FlashSale products={filteredFlashSale} />
        <CategoryGrid categories={categories} />
        <ProductGrid sections={filteredSections} />
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
