import React from 'react';

const displaySlides = [
  { id: 1, badge: 'Limited time!', subtitle: 'Get Special Offer', offerPrefix: 'Up to', offerMain: '40%', terms: 'All Services Available | T&C Applied', cta: 'Claim', image: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=1600&q=85' },
  { id: 2, badge: 'New Season', subtitle: 'Exclusive Gadgets Deal', offerPrefix: 'Up to', offerMain: '50%', terms: 'Free Shipping Nationwide | T&C Applied', cta: 'Claim', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=85' },
  { id: 3, badge: 'Hot Offer', subtitle: 'Top Accessories Upgrade', offerPrefix: 'Up to', offerMain: '35%', terms: 'Cash on Delivery Available | T&C Applied', cta: 'Claim', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=85' }
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    const timer = window.setInterval(() => setCurrentSlide((previous) => (previous + 1) % displaySlides.length), 4500);
    return () => window.clearInterval(timer);
  }, []);

  const activeSlide = displaySlides[currentSlide];
  const showProducts = () => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="mx-auto w-full max-w-7xl px-3 pt-1 pb-0 sm:px-4 lg:px-6">
      <div className="mb-1 flex items-center justify-between pb-1.5">
        <h2 className="text-base font-black tracking-tight text-slate-900 sm:text-lg">#SpecialForYou</h2>
        <button type="button" onClick={showProducts} className="cursor-pointer text-xs font-bold tracking-wide text-[#E8262A] transition hover:text-red-700 sm:text-sm">See All</button>
      </div>

      <div className="mx-auto w-full max-w-6xl md:px-3 lg:px-8">
        <div className="group relative h-[210px] overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-900 shadow-lg shadow-slate-900/10 sm:h-[260px] sm:rounded-[28px] md:h-[300px] lg:h-[320px] xl:h-[340px]">
          <img key={activeSlide.id} src={activeSlide.image} alt={activeSlide.subtitle} className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 group-hover:scale-[1.025]" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/72 via-slate-950/30 to-slate-950/5" />
          <div className="absolute inset-x-0 bottom-0 h-[18%] bg-slate-950/45 backdrop-blur-[1px]" />

          <span className="absolute left-[4%] top-[8%] z-10 inline-flex items-center rounded-full border border-white/70 bg-white/95 px-3 py-1 text-[9px] font-bold text-slate-900 shadow-sm sm:px-4 sm:py-2 sm:text-xs">{activeSlide.badge}</span>

          <h3 className="absolute left-[4%] top-[34%] z-10 max-w-[70%] text-lg font-black leading-tight tracking-tight text-white drop-shadow-md sm:text-2xl md:text-3xl">{activeSlide.subtitle}</h3>

          <div className="absolute left-[4%] top-[54%] z-10 flex items-baseline gap-1.5 sm:gap-3">
            <span className="text-xs font-bold text-white sm:text-base md:text-lg">{activeSlide.offerPrefix}</span>
            <span className="text-4xl font-black leading-none tracking-tight text-white drop-shadow-md sm:text-5xl md:text-6xl">{activeSlide.offerMain}</span>
          </div>

          <p className="absolute bottom-[5.5%] left-[4%] z-10 max-w-[58%] truncate text-[8px] font-medium leading-none text-white/80 sm:text-xs md:text-sm">{activeSlide.terms}</p>

          <button type="button" onClick={showProducts} className="absolute bottom-[3.5%] right-[4%] z-20 inline-flex items-center justify-center rounded-full bg-[#E8262A] px-5 py-2 text-xs font-extrabold text-white shadow-lg shadow-red-950/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d01f23] hover:shadow-xl active:scale-95 sm:px-8 sm:py-3 sm:text-sm md:px-9 md:text-base">{activeSlide.cta}</button>
        </div>
      </div>

      <div className="mt-1.5 flex items-center justify-center gap-1.5">
        {displaySlides.map((slide, index) => (
          <button key={slide.id} type="button" onClick={() => setCurrentSlide(index)} className={`h-2 cursor-pointer rounded-full transition-all duration-300 ${index === currentSlide ? 'w-6 bg-[#E8262A]' : 'w-2 bg-slate-300 hover:bg-slate-400'}`} aria-label={`Go to slide ${index + 1}`} />
        ))}
      </div>
    </section>
  );
}
