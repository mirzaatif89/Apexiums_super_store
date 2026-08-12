import React from 'react';

export default function HeroBanner({ slides = [], promoBanners = [] }) {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const displaySlides = [
    {
      id: 1,
      badge: 'Limited time!',
      subtitle: 'Get Special Offer',
      offerPrefix: 'Up to',
      offerMain: '40%',
      terms: 'All Services Available | T&C Applied',
      cta: 'Claim',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 2,
      badge: 'New Season',
      subtitle: 'Exclusive Gadgets Deal',
      offerPrefix: 'Up to',
      offerMain: '50%',
      terms: 'Free Shipping Nationwide | T&C Applied',
      cta: 'Claim',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 3,
      badge: 'Hot Offer',
      subtitle: 'Top Accessories Upgrade',
      offerPrefix: 'Up to',
      offerMain: '35%',
      terms: 'Cash on Delivery Available | T&C Applied',
      cta: 'Claim',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
    }
  ];

  // Auto-slide carousel
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [displaySlides.length]);

  const activeSlide = displaySlides[currentSlide] || displaySlides[0];

  return (
    <section className="w-full max-w-none px-3 sm:px-4 md:px-6 lg:px-8 pt-1 pb-1">
      {/* Section Header: #SpecialForYou */}
      <div className="flex items-center justify-between pb-1.5 mb-1">
        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          #SpecialForYou
        </h2>
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('products-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-xs sm:text-sm font-bold text-[#E8262A] hover:text-red-700 tracking-wide transition cursor-pointer"
        >
          See All
        </button>
      </div>

      {/* Main Banner Card (Polished Premium Silver/Gray Banner with Smooth Depth & Hierarchy) */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-100 via-slate-200/90 to-slate-300/80 p-4 sm:p-6 md:p-8 lg:p-9 shadow-sm border border-slate-200/90 w-full">
        {/* Subtle Ambient Light Overlay */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-white/30 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-6 md:gap-8 lg:gap-10 w-full">

          {/* Left Text Content - Spans full remaining card width */}
          <div className="flex-1 min-w-0 w-full flex flex-col justify-center items-start">
            {/* Limited time Badge */}
            {activeSlide.badge && (
              <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] sm:text-xs font-bold text-slate-700 shadow-2xs border border-white/80 mb-2 sm:mb-2.5">
                {activeSlide.badge}
              </span>
            )}

            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-800 tracking-tight leading-snug w-full">
              {activeSlide.subtitle}
            </h3>

            {/* Offer Display (Up to 40%) */}
            <div className="my-1 sm:my-1.5 flex items-baseline gap-1.5 flex-wrap w-full">
              <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-slate-700">
                {activeSlide.offerPrefix}
              </span>
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">
                {activeSlide.offerMain}
              </span>
            </div>

            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-500 leading-tight mb-3 sm:mb-4 w-full">
              {activeSlide.terms}
            </p>

            {/* Red Action Button */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center rounded-full bg-[#E8262A] hover:bg-[#d01f23] text-white font-extrabold text-xs sm:text-sm md:text-base px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 shadow-md shadow-red-500/20 transition-all duration-200 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 cursor-pointer"
            >
              {activeSlide.cta}
            </button>
          </div>

          {/* Right Product Image - Styled exactly as in reference screenshot */}
          <div className="relative shrink-0 w-32 xs:w-40 sm:w-52 md:w-72 lg:w-96 h-28 xs:h-36 sm:h-44 md:h-56 lg:h-64 overflow-hidden rounded-2xl md:rounded-3xl shadow-md border border-slate-200/80 group">
            <img
              src={activeSlide.image}
              alt={activeSlide.subtitle}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Bottom Overlay Bar matching reference screenshot */}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-slate-950/70 backdrop-blur-md text-white border-t border-white/10">
              <span className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-white/90">
                <span>🔥</span> Hot Deal
              </span>
              <span className="bg-[#E8262A] text-white text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Pagination Dots Below Banner */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5">
        {displaySlides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentSlide
                ? 'w-6 bg-[#E8262A]'
                : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
