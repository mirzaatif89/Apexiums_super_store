import React from 'react';
import { Heart, Home, ShoppingCart, User } from 'lucide-react';
import { openWhatsApp } from '../utils/whatsapp';

function WhatsAppIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path fill="#25D366" d="M12 2a9.8 9.8 0 0 0-8.45 14.76L2.2 21.8l5.16-1.31A9.98 9.98 0 1 0 12 2Z" />
      <path fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M8.15 7.45c.35-.4.72-.25.93.08l1.12 2.05c.18.32.12.63-.13.91l-.65.72c.82 1.65 1.76 2.55 3.4 3.35l.72-.72c.27-.27.58-.32.9-.14l2.08 1.13c.34.2.46.55.2.9-.7.95-1.76 1.38-2.88 1.2-3.57-.55-6.43-3.42-6.95-6.98-.16-1.08.3-1.9 1.26-2.5Z" />
    </svg>
  );
}

export default function BottomNav({
  onCartClick,
  onAccountClick,
  onWishlistClick,
  onChatClick,
  onSupportClick,
  onHomeClick,
  cartCount = 0,
  isCartOpen = false,
  isProfileOpen = false
}) {
  const [activeTab, setActiveTab] = React.useState('Home');

  React.useEffect(() => {
    if (isCartOpen) {
      setActiveTab('Cart');
    } else if (isProfileOpen) {
      setActiveTab('Account');
    } else if ((activeTab === 'Cart' && !isCartOpen) || (activeTab === 'Account' && !isProfileOpen)) {
      setActiveTab('Home');
    }
  }, [isCartOpen, isProfileOpen]);

  const handleHome = () => {
    setActiveTab('Home');
    if (onHomeClick) {
      onHomeClick();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleChat = () => {
    setActiveTab('WhatsApp');
    if (onChatClick) {
      onChatClick();
    } else if (onSupportClick) {
      onSupportClick();
    } else {
      openWhatsApp('Assalam-o-Alaikum, mujhe Apexiums customer support se madad chahiye.');
    }
  };

  const handleCart = () => {
    setActiveTab('Cart');
    if (onCartClick) onCartClick();
  };

  const handleWishlist = () => {
    setActiveTab('Wishlist');
    if (onWishlistClick) {
      onWishlistClick();
    } else {
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAccount = () => {
    setActiveTab('Account');
    if (onAccountClick) onAccountClick();
  };

  const navItems = [
    { label: 'Home', icon: Home, action: handleHome },
    { label: 'WhatsApp', icon: WhatsAppIcon, action: handleChat },
    { label: 'Cart', icon: ShoppingCart, action: handleCart, badge: cartCount },
    { label: 'Wishlist', icon: Heart, action: handleWishlist },
    { label: 'Account', icon: User, action: handleAccount }
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[95] border-t border-slate-200/80 bg-white/95 backdrop-blur-md shadow-lg">
      <div className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl grid grid-cols-5 gap-1 px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.label;

          return (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              className="relative flex flex-col items-center justify-center py-1 px-1 transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                {item.label === 'Home' ? (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill={isActive ? '#E8262A' : '#6E6E6E'}
                    xmlns="http://www.w3.org/2000/svg"
                    className="transition-colors duration-150"
                  >
                    <path d="M12 2.5L2 10.5H4.5V20.5C4.5 21.0523 4.94772 21.5 5.5 21.5H10V15.5H14V21.5H18.5C19.0523 21.5 19.5 21.0523 19.5 20.5V10.5H22L12 2.5Z" />
                  </svg>
                ) : item.label === 'WhatsApp' ? (
                  <WhatsAppIcon />
                ) : (
                  <Icon
                    size={22}
                    className={`transition-colors duration-150 ${
                      isActive
                        ? 'text-[#E8262A] fill-[#E8262A]'
                        : 'text-[#6E6E6E] fill-none'
                    }`}
                    strokeWidth={isActive ? 1.5 : 1.8}
                  />
                )}
                {item.badge !== undefined && item.badge !== null && item.badge > 0 ? (
                  <span
                    className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E8262A] text-white px-1 text-[9px] font-black shadow-xs ring-2 ring-white"
                  >
                    {item.badge}
                  </span>
                ) : null}
              </div>

              <span
                className={`text-[11px] tracking-tight mt-1 leading-none transition-colors duration-150 ${
                  item.label === 'WhatsApp'
                    ? 'text-[#25D366] font-medium'
                    : isActive
                    ? 'text-[#E8262A] font-medium'
                    : 'text-[#6E6E6E] font-normal'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
