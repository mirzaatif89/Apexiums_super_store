import React, { useState } from 'react';
import {
  User,
  Headphones,
  CreditCard,
  ShoppingBag,
  HelpCircle,
  Tag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Lock,
  Mail
} from 'lucide-react';
import { getWhatsAppUrl } from '../utils/whatsapp';
import easypaisaLogo from '../../images/EASYPAISA-logo.png';
import jazzCashLogo from '../../images/jazzcash-logo.png';

export default function Footer({ storeName = "Apexiums", logoSrc, onAdminClick }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="w-full mt-4 sm:mt-8 bg-white text-slate-900 border-t-4 border-[#E8262A] pt-8 sm:pt-12 pb-20 sm:pb-24 font-sans shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Top Section: Left Info/Cards & Right Categorized Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* Left Column (Brand, Payment Badges, Socials, Stay Updated Card) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Logo and Tagline */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                {logoSrc ? (
                  <img src={logoSrc} alt={`${storeName} logo`} className="h-11 w-11 rounded-xl border border-slate-200 bg-white object-cover shadow-sm" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#E8262A] to-[#B71C1C] text-lg font-black text-white shadow-md shadow-red-900/20">
                    {storeName.charAt(0)}
                  </div>
                )}
                <h2 className="text-xl font-extrabold leading-none tracking-tight text-slate-900">
                  {storeName}
                </h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md font-medium">
                Pakistan's leading online store for electronics, fashion, home essentials & lifestyle products with fast delivery and authentic items.
              </p>
            </div>

            {/* Payment Methods Badges */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900">
                PAYMENT METHODS
              </h3>
              <div className="flex flex-wrap gap-2.5 items-center">
                {/* JazzCash Badge */}
                <div className="flex h-8 w-[88px] items-center justify-center overflow-hidden rounded-lg border border-slate-200/90 bg-white px-2 py-1 shadow-xs transition hover:scale-105 cursor-default">
                  <img src={jazzCashLogo} alt="JazzCash" className="h-7 w-auto object-contain" />
                </div>

                {/* easypaisa Badge */}
                <div className="flex h-8 w-[98px] items-center justify-center overflow-hidden rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 shadow-xs transition hover:scale-105 cursor-default">
                  <img src={easypaisaLogo} alt="Easypaisa" className="h-6 w-auto object-contain" />
                </div>

                {/* VISA Badge */}
                <div className="flex h-8 items-center rounded-lg bg-white px-3 py-1 shadow-xs border border-slate-200/90 hover:scale-105 transition cursor-default">
                  <span className="font-black italic text-[#1A1F71] text-base tracking-widest leading-none font-serif">
                    <span className="text-amber-500">V</span>ISA
                  </span>
                </div>

                {/* Mastercard Badge */}
                <div className="flex h-8 items-center rounded-lg bg-white px-2.5 py-1 shadow-xs border border-slate-200/90 hover:scale-105 transition cursor-default gap-1.5">
                  <div className="flex -space-x-1.5">
                    <div className="w-4 h-4 rounded-full bg-[#EB001B]"></div>
                    <div className="w-4 h-4 rounded-full bg-[#F79E1B] opacity-90"></div>
                  </div>
                  <span className="font-extrabold text-slate-800 text-[11px] tracking-tight">mastercard</span>
                </div>

                {/* COD Badge */}
                <div className="flex h-8 items-center rounded-lg bg-white px-2.5 py-1 shadow-xs border border-slate-200/90 hover:scale-105 transition cursor-default gap-1.5">
                  <span className="font-black text-slate-900 text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">COD</span>
                  <span className="text-[10px] font-bold text-slate-700 leading-tight">Cash on Delivery</span>
                </div>
              </div>
            </div>

            {/* Follow Us */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900">
                FOLLOW US
              </h3>
              <div className="flex items-center gap-2">
                <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-90 transition shadow-xs" title="Facebook">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white hover:opacity-90 transition shadow-xs" title="Instagram">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8262A] text-white hover:bg-red-700 transition shadow-xs" title="TikTok">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.57-1.31 1.56-1.33 2.56-.01.8.29 1.61.85 2.19.78.82 2 1.17 3.09.92 1.1-.23 2.01-1.06 2.33-2.13.16-.58.21-1.18.21-1.78.02-4.88.01-9.76.01-14.64z"/></svg>
                </a>
                <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF0000] text-white hover:opacity-90 transition shadow-xs" title="YouTube">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A66C2] text-white hover:opacity-90 transition shadow-xs" title="LinkedIn">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>

            {/* Stay Updated Card Box */}
            <div className="rounded-2xl bg-red-50/70 border border-red-100 p-4 sm:p-5 shadow-xs space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs uppercase tracking-wider">
                  <Mail size={16} className="text-[#E8262A]" />
                  <span>STAY UPDATED</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Subscribe to get updates on new arrivals, exclusive offers & more.
              </p>

              {subscribed ? (
                <div className="rounded-lg bg-emerald-50 border border-emerald-300 p-2.5 text-xs text-emerald-800 font-bold text-center">
                  ✓ Thank you for subscribing!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E8262A] shadow-2xs"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#E8262A] hover:bg-red-700 px-4 py-2 text-xs font-bold text-white transition active:scale-95 shadow-xs cursor-pointer shrink-0"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Right Columns Grid (2 Rows of 3 Columns) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">

            {/* Column 1: ABOUT */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-red-200 pb-1.5">
                <User size={14} className="text-[#E8262A]" />
                <span>ABOUT</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><a href="#" className="hover:text-[#E8262A] transition">About Us</a></li>
                <li><a href="#" className="hover:text-[#E8262A] transition">Careers</a></li>
                <li><a href="#" className="hover:text-[#E8262A] transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#E8262A] transition">Terms & Conditions</a></li>
              </ul>
            </div>

            {/* Column 2: CUSTOMER SERVICE */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-red-200 pb-1.5">
                <Headphones size={14} className="text-[#E8262A]" />
                <span>CUSTOMER SERVICE</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><a href={getWhatsAppUrl()} target="_blank" rel="noreferrer" className="hover:text-[#E8262A] transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-[#E8262A] transition">FAQs</a></li>
                <li><a href="#" className="hover:text-[#E8262A] transition">Track Order</a></li>
                <li><a href="#" className="hover:text-[#E8262A] transition">Shipping Information</a></li>
              </ul>
            </div>

            {/* Column 3: PAYMENT METHODS */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-red-200 pb-1.5">
                <CreditCard size={14} className="text-[#E8262A]" />
                <span>PAYMENT METHODS</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><a href="#" className="hover:text-[#E8262A] transition">JazzCash</a></li>
                <li><a href="#" className="hover:text-[#E8262A] transition">Easypaisa</a></li>
                <li><a href="#" className="hover:text-[#E8262A] transition">Visa</a></li>
                <li><a href="#" className="hover:text-[#E8262A] transition">Mastercard</a></li>
                <li><a href="#" className="hover:text-[#E8262A] transition">Cash on Delivery</a></li>
              </ul>
            </div>

            {/* Column 4: CATEGORIES */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-red-200 pb-1.5">
                <ShoppingBag size={14} className="text-[#E8262A]" />
                <span>CATEGORIES</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><a href="#" className="hover:text-[#E8262A] transition">Electronics</a></li>
                <li><a href="#" className="hover:text-[#E8262A] transition">Fashion</a></li>
                <li><a href="#" className="hover:text-[#E8262A] transition">Home Essentials</a></li>
                <li><a href="#" className="hover:text-[#E8262A] transition">Beauty & Health</a></li>
                <li><a href="#" className="hover:text-[#E8262A] transition">Sports & Outdoors</a></li>
                <li><a href="#" className="hover:text-[#E8262A] transition">Toys & Games</a></li>
              </ul>
            </div>

            {/* Column 5: HELP & SUPPORT */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-red-200 pb-1.5">
                <HelpCircle size={14} className="text-[#E8262A]" />
                <span>HELP & SUPPORT</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><a href={getWhatsAppUrl('Assalam-o-Alaikum, mujhe Help Center se madad chahiye.')} target="_blank" rel="noreferrer" className="hover:text-[#E8262A] transition">Help Center</a></li>
                <li><a href="#" className="hover:text-[#E8262A] transition">How to Order</a></li>
                <li><a href="#" className="hover:text-[#E8262A] transition">Warranty Policy</a></li>
              </ul>
            </div>

            {/* Column 6: EXTRA */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-red-200 pb-1.5">
                <Tag size={14} className="text-[#E8262A]" />
                <span>EXTRA</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><a href="#" className="hover:text-[#E8262A] transition">Gift Cards</a></li>
                <li><a href="#" className="hover:text-[#E8262A] transition">Become a Seller</a></li>
                <li><a href="#" className="hover:text-[#E8262A] transition">Become an Investor</a></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Feature Trust Badges Banner */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/90 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#E8262A] border border-red-200 shadow-2xs">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">FAST DELIVERY</h4>
              <p className="text-[11px] text-slate-600 font-medium">Get your orders delivered fast & secure</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#E8262A] border border-red-200 shadow-2xs">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">100% AUTHENTIC</h4>
              <p className="text-[11px] text-slate-600 font-medium">We only sell genuine quality products</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#E8262A] border border-red-200 shadow-2xs">
              <RotateCcw size={20} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">EASY RETURNS</h4>
              <p className="text-[11px] text-slate-600 font-medium">Hassle-free returns within 7 days</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#E8262A] border border-red-200 shadow-2xs">
              <Lock size={20} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">SECURE PAYMENTS</h4>
              <p className="text-[11px] text-slate-600 font-medium">Your payment information is safe with us</p>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <a href="#" className="hover:text-[#E8262A] transition">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-[#E8262A] transition">Terms of Use</a>
            <span>•</span>
            <a href="#" className="hover:text-[#E8262A] transition">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
