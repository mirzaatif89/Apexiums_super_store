import React from 'react';
import { Heart, Home, User } from 'lucide-react';
import { openWhatsApp } from '../utils/whatsapp';
import customerSupportIcon from '../../images/customer_support.png';

function ReferenceCartIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.75 5.5h3.5l2.65 12.25h14.4l3.2-9.25H9" stroke="currentColor" strokeWidth="2.65" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.4 21.25h13.15" stroke="currentColor" strokeWidth="2.65" strokeLinecap="round" />
      <circle cx="12" cy="26" r="1.9" fill="currentColor" />
      <circle cx="22.2" cy="26" r="1.9" fill="currentColor" />
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
    setActiveTab('Contact');
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
    { label: 'Contact', icon: null, action: handleChat },
    { label: 'Cart', icon: null, action: handleCart, badge: cartCount },
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
                ) : item.label === 'Contact' ? (
                  <img
                    src={customerSupportIcon}
                    alt="Customer support"
                    className="h-6 w-6 object-contain"
                  />
                ) : item.label === 'Cart' ? (
                  <ReferenceCartIcon
                    className={`h-[22px] w-[22px] transition-colors duration-150 ${
                      isActive ? 'text-[#E8262A]' : 'text-[#6E6E6E]'
                    }`}
                  />
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
                  isActive
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
