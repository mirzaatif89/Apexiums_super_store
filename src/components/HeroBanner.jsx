import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function HeroBanner({ slides, promoBanners }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const mobileTrackRef = React.useRef(null);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  React.useEffect(() => {
    const node = mobileTrackRef.current?.children?.[activeIndex];
    node?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeIndex]);

  const activeSlide = slides[activeIndex];
  const nextPromo = promoBanners[activeIndex % promoBanners.length];
  const secondPromo = promoBanners[(activeIndex + 1) % promoBanners.length];

  return (
    <section className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6">
      <div className="lg:hidden">
        <div
          ref={mobileTrackRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide) => (
            <article
              key={slide.id}
              className="min-w-full snap-center overflow-hidden rounded-3xl bg-slate-900 shadow-lg shadow-slate-900/10"
            >
              <div className="grid gap-4 p-4">
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover"
                  />
                </div>
                <div className="grid gap-3 text-white">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">{slide.accent}</p>
                    <h2 className="mt-2 text-2xl font-black leading-tight">{slide.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{slide.description}</p>
                  </div>
                  <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 text-sm font-bold text-white transition hover:bg-teal-700">
                    {slide.cta}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="hidden lg:block">
        <article className="w-full overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl shadow-slate-900/10">
          <div className="grid h-full grid-cols-1 gap-0 md:grid-cols-[2fr_1fr]">
            <div className="relative min-h-[26rem] overflow-hidden">
              <img
                src={activeSlide.image}
                alt={activeSlide.title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-300">
                  {activeSlide.accent}
                </p>
                <h2 className="mt-3 max-w-xl text-4xl font-black leading-tight">{activeSlide.title}</h2>
                <p className="mt-3 max-w-lg text-sm leading-7 text-slate-200">{activeSlide.description}</p>
                <button className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-bold text-slate-950 transition hover:bg-teal-50">
                  {activeSlide.cta}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid gap-4 bg-slate-100 p-4">
              {[nextPromo, secondPromo].map((promo) => (
                <article key={promo.title} className="relative overflow-hidden rounded-[1.75rem] bg-white shadow-sm">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    loading="lazy"
                    className="h-full min-h-48 w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">{promo.subtitle}</p>
                    <h3 className="mt-2 text-xl font-extrabold leading-tight">{promo.title}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </article>
      </div>

      <div className="mt-3 flex justify-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-7 bg-teal-600' : 'w-2 bg-slate-300'}`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
