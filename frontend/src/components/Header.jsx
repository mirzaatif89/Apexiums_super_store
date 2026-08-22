import React from 'react';
import { Heart, Menu, Search, User } from 'lucide-react';

function ReferenceCartIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.75 5.5h3.5l2.65 12.25h14.4l3.2-9.25H9"
        stroke="currentColor"
        strokeWidth="2.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.4 21.25h13.15"
        stroke="currentColor"
        strokeWidth="2.65"
        strokeLinecap="round"
      />
      <circle cx="12" cy="26" r="1.9" fill="currentColor" />
      <circle cx="22.2" cy="26" r="1.9" fill="currentColor" />
    </svg>
  );
}

export default function Header({
  storeName = 'Apexiums',
  logoSrc,
  authUser,
  cartCount = 0,
  wishlistCount = 0,
  onAccountClick,
  onCartClick,
  onWishlistClick,
  onMenuToggle,
  onMenuClick,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onSearchFocus
}) {
  return (
    <header className="w-full bg-brand-primary text-white transition-all relative z-20 shadow-md">
      {/* Header Content Container - Full Available Width */}
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 md:py-2.5">

        {/* DESKTOP LAYOUT (md & larger): Menu on left, search in center, cart, wishlist & account on right */}
        <div className="hidden md:flex items-center justify-between gap-6 w-full">
          {/* Left: Menu */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onMenuToggle || onMenuClick}
              className="flex h-10 w-10 lg:h-11 lg:w-11 items-center justify-center rounded-[16px] bg-white/20 hover:bg-white/30 text-white transition active:scale-95 cursor-pointer backdrop-blur-md"
              aria-label="Menu"
              title="Menu"
            >
              <Menu size={21} strokeWidth={2.2} className="text-white" />
            </button>
          </div>

          {/* Center: Search Bar */}
          <form onSubmit={onSearchSubmit} className="flex-1 max-w-2xl mx-auto">
            <div className="relative flex h-10 lg:h-11 items-center rounded-full bg-white px-4 shadow-sm focus-within:ring-2 focus-within:ring-white/40 transition-all">
              <Search size={18} className="text-slate-400 shrink-0 mr-2.5" />
              <input
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                onFocus={onSearchFocus}
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Search products, categories..."
                aria-label="Search"
              />
            </div>
          </form>

          {/* Right: Wishlist, Cart & Account Icons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onWishlistClick}
              className="group relative flex h-10 w-10 lg:h-11 lg:w-11 items-center justify-center rounded-[16px] bg-white/20 hover:bg-white/30 text-white shadow-xs transition active:scale-95 cursor-pointer backdrop-blur-md"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart size={20} className="text-white transition-transform group-hover:scale-110" />
              {wishlistCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-white px-1 text-[9px] font-black text-brand-primary shadow-md animate-bounce">
                  {wishlistCount}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={onCartClick}
              className="group relative flex h-10 w-10 lg:h-11 lg:w-11 items-center justify-center rounded-[16px] bg-white/20 hover:bg-white/30 text-white shadow-xs transition active:scale-95 cursor-pointer backdrop-blur-md"
              title="Cart"
              aria-label="Cart"
            >
              <ReferenceCartIcon className="h-[25px] w-[25px] text-white transition-transform group-hover:scale-105" />
              {cartCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-white px-1 text-[9px] font-black text-[#E8262A] shadow-md animate-bounce">
                  {cartCount}
                </span>
              ) : null}
            </button>

            {onAccountClick ? (
              <button
                type="button"
                onClick={onAccountClick}
                className="group relative flex h-10 w-10 lg:h-11 lg:w-11 items-center justify-center rounded-[16px] bg-white/20 hover:bg-white/30 text-white shadow-xs transition active:scale-95 cursor-pointer backdrop-blur-md"
                title="Account"
                aria-label="Account"
              >
                <User size={20} className="text-white transition-transform group-hover:scale-105" />
              </button>
            ) : null}
          </div>
        </div>

        {/* MOBILE LAYOUT (under md): Unchanged 2-row layout */}
        <div className="block md:hidden space-y-3 sm:space-y-3.5">
          {/* Top Row: Menu on Left, Cart on Far Right */}
          <div className="flex items-center justify-between gap-3 w-full">
            <button
              type="button"
              onClick={onMenuToggle || onMenuClick}
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-[16px] bg-white/20 hover:bg-white/30 text-white transition active:scale-95 cursor-pointer shrink-0 backdrop-blur-md"
              aria-label="Menu"
              title="Menu"
            >
              <Menu size={20} strokeWidth={2.2} className="text-white" />
            </button>

            <button
              type="button"
              onClick={onCartClick}
              className="group relative flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/5 bg-white/15 hover:bg-white/25 text-white shadow-sm transition active:scale-95 cursor-pointer shrink-0 backdrop-blur-md"
              title="Cart"
              aria-label="Cart"
            >
              <ReferenceCartIcon className="h-[31px] w-[31px] text-white transition-transform group-hover:scale-105" />
              {cartCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-white px-1 text-[9px] font-black text-[#E8262A] shadow-md animate-bounce">
                  {cartCount}
                </span>
              ) : null}
            </button>
          </div>

          {/* Second Row: Search Input Row + Wishlist Button */}
          <div className="flex items-center gap-2.5 sm:gap-3 w-full">
            <form onSubmit={onSearchSubmit} className="flex-1 flex items-center min-w-0">
              <div className="relative flex-1 flex h-10 sm:h-11 items-center rounded-full bg-white px-4 shadow-sm focus-within:ring-2 focus-within:ring-white/40 transition-all">
                <Search
                  size={18}
                  className="text-slate-400 shrink-0 mr-2.5"
                />
                <input
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  onFocus={onSearchFocus}
                  className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Search"
                  aria-label="Search"
                />
              </div>
            </form>

            <button
              type="button"
              onClick={onWishlistClick}
              className="group relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 hover:bg-white/30 text-white shadow-xs transition active:scale-95 cursor-pointer backdrop-blur-xs"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart size={19} className="text-white transition-transform group-hover:scale-110" />
              {wishlistCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-white px-1 text-[9px] font-black text-[#E8262A] shadow-md animate-bounce">
                  {wishlistCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
