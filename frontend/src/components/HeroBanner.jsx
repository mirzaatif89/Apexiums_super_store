import React from 'react';

const fallbackSlides = [
  { id: 1, title: 'Get Special Offer', eyebrow: 'Limited time offer', cta: 'Shop now', image: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=1600&q=85' },
  { id: 2, title: 'Exclusive Gadgets Deal', eyebrow: 'New season', cta: 'Shop now', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=85' }
];

export default function HeroBanner({ slides = [] }) {
  const [liveBanners, setLiveBanners] = React.useState([]);
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    let active = true;
    fetch('/api/banners?limit=50').then((response) => response.ok ? response.json() : { rows: [] }).then((data) => {
      const today = new Date().toISOString().slice(0, 10);
      const rows = (data.rows || []).filter((row) => row.image_url && String(row.status || 'Active').toLowerCase() === 'active' && (!row.start_date || String(row.start_date).slice(0, 10) <= today) && (!row.end_date || String(row.end_date).slice(0, 10) >= today));
      if (active) setLiveBanners(rows.sort((a, b) => Number(a.position || 0) - Number(b.position || 0)).map((row) => ({ id: row.id, title: row.title || 'Shop our latest offers', eyebrow: 'Special for you', cta: 'Shop now', image: row.image_url, link: row.link })));
    }).catch(() => { if (active) setLiveBanners([]); });
    return () => { active = false; };
  }, []);

  const suppliedSlides = slides.map((slide) => ({ id: slide.id, title: slide.subtitle || slide.title, eyebrow: slide.badge, cta: slide.cta || 'Shop now', image: slide.image, link: slide.link }));
  const activeSlides = liveBanners.length ? liveBanners : (suppliedSlides.length ? suppliedSlides : fallbackSlides);
  React.useEffect(() => { setCurrentSlide(0); if (activeSlides.length < 2) return undefined; const timer = window.setInterval(() => setCurrentSlide((value) => (value + 1) % activeSlides.length), 5000); return () => window.clearInterval(timer); }, [activeSlides.length]);
  const slide = activeSlides[currentSlide] || activeSlides[0];
  const showProducts = () => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  const handleCta = () => slide.link ? window.location.assign(slide.link) : showProducts();

  return <section className="mx-auto w-full max-w-7xl px-3 pt-2 sm:px-4 lg:px-6"><div className="mb-2 flex items-center justify-between"><h2 className="text-base font-black tracking-tight text-slate-900 sm:text-lg">#SpecialForYou</h2><button type="button" onClick={showProducts} className="text-xs font-bold text-[#E8262A] hover:text-red-700 sm:text-sm">See All</button></div><div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-md sm:rounded-3xl"><div className="relative h-[190px] sm:h-[260px] md:h-[310px]"><img key={slide.id} src={slide.image} alt={slide.title} className="absolute inset-0 h-full w-full object-cover object-center transition duration-700"/><div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/35 to-slate-950/5"/><div className="absolute inset-y-0 left-0 z-10 flex max-w-[78%] flex-col justify-center px-5 sm:px-9"><span className="mb-2 w-fit rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-800 sm:text-xs">{slide.eyebrow}</span><h3 className="text-xl font-black leading-tight text-white drop-shadow sm:text-3xl md:text-4xl">{slide.title}</h3><button type="button" onClick={handleCta} className="mt-4 w-fit rounded-xl bg-[#E8262A] px-4 py-2.5 text-xs font-black text-white shadow-lg hover:bg-red-700 sm:px-5 sm:text-sm">{slide.cta}</button></div></div>{activeSlides.length > 1 && <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">{activeSlides.map((item, index) => <button key={item.id || index} onClick={() => setCurrentSlide(index)} aria-label={`Show banner ${index + 1}`} className={`h-2 rounded-full transition-all ${index === currentSlide ? 'w-6 bg-[#E8262A]' : 'w-2 bg-white/70'}`}/>)}</div>}</div></section>;
}
