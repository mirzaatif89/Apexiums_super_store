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
    <section className="mx-auto w-full max-w-7xl px-3 pt-1 pb-1 sm:px-4 lg:px-6">
      <div className="mb-1 flex items-center justify-between pb-1.5">
        <h2 className="text-base font-black tracking-tight text-slate-900 sm:text-lg">#SpecialForYou</h2>
        <button type="button" onClick={showProducts} className="cursor-pointer text-xs font-bold tracking-wide text-[#E8262A] transition hover:text-red-700 sm:text-sm">See All</button>
      </div>

      <div className="mx-auto w-full max-w-6xl md:px-3 lg:px-8">
        <div className="group relative min-h-[210px] overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-900 shadow-lg shadow-slate-900/10 sm:min-h-[280px] sm:rounded-[28px] md:min-h-[340px] lg:min-h-[390px]">
          <img key={activeSlide.id} src={activeSlide.image} alt={activeSlide.subtitle} className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 group-hover:scale-[1.025]" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/52 to-slate-950/5" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/35 to-transparent" />

          <div className="relative z-10 flex min-h-[210px] max-w-[84%] flex-col items-start justify-center p-5 sm:min-h-[280px] sm:max-w-[68%] sm:p-8 md:min-h-[340px] md:max-w-[62%] md:p-10 lg:min-h-[390px] lg:max-w-[58%] lg:p-12">
            <span className="mb-3 inline-flex items-center rounded-full border border-white/70 bg-white/95 px-3.5 py-1.5 text-[10px] font-bold text-slate-900 shadow-sm sm:text-xs">{activeSlide.badge}</span>
            <h3 className="text-xl font-black leading-tight tracking-tight text-white drop-shadow-sm sm:text-2xl md:text-3xl lg:text-4xl">{activeSlide.subtitle}</h3>
            <div className="my-1.5 flex flex-wrap items-baseline gap-2 sm:my-2">
              <span className="text-sm font-bold text-white sm:text-lg md:text-xl">{activeSlide.offerPrefix}</span>
              <span className="text-4xl font-black leading-none tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl lg:text-7xl">{activeSlide.offerMain}</span>
            </div>
            <p className="mb-3 text-[10px] font-medium leading-tight text-white/80 sm:mb-5 sm:text-xs md:text-sm">{activeSlide.terms}</p>
            <button type="button" onClick={showProducts} className="inline-flex items-center justify-center rounded-full bg-[#E8262A] px-6 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-red-950/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d01f23] hover:shadow-xl active:scale-95 sm:px-8 sm:py-3 sm:text-sm md:text-base">{activeSlide.cta}</button>
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-center gap-1.5">
        {displaySlides.map((slide, index) => (
          <button key={slide.id} type="button" onClick={() => setCurrentSlide(index)} className={`h-2 cursor-pointer rounded-full transition-all duration-300 ${index === currentSlide ? 'w-6 bg-[#E8262A]' : 'w-2 bg-slate-300 hover:bg-slate-400'}`} aria-label={`Go to slide ${index + 1}`} />
        ))}
      </div>
    </section>
  );
}
