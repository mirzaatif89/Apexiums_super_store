import React from 'react';
import { ChevronRight, Clock3, Star } from 'lucide-react';

const pad = (value) => String(value).padStart(2, '0');

export default function FlashSale({ products }) {
  const [remaining, setRemaining] = React.useState({ h: 4, m: 59, s: 59 });

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((current) => {
        let total = current.h * 3600 + current.m * 60 + current.s - 1;
        if (total < 0) total = 4 * 3600 + 59 * 60 + 59;
        return {
          h: Math.floor(total / 3600),
          m: Math.floor((total % 3600) / 60),
          s: total % 60
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-3 py-2 sm:px-4 lg:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-600">Flash Sale</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Limited time deals</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-slate-950 px-3 py-2 text-xs font-bold text-white">
          <Clock3 size={14} />
          <span>
            {pad(remaining.h)}:{pad(remaining.m)}:{pad(remaining.s)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Hurry up before these prices end.</p>
          <a href="#" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600">
            See All <ChevronRight size={16} />
          </a>
      </div>

      <div className="mt-4 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <article
            key={product.id}
            className="group min-w-[12.5rem] flex-none overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10 sm:min-w-[15rem]"
          >
            <div className="relative overflow-hidden">
              <img
                src={product.image}
                alt={product.title}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-teal-600 px-2.5 py-1 text-[11px] font-bold text-white">
                {product.badge}
              </span>
            </div>
            <div className="grid gap-2 p-4">
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                <Star size={14} fill="currentColor" />
                <span>{product.rating}</span>
              </div>
              <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-900">
                {product.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-950">Rs {product.price.toLocaleString('en-PK')}</span>
                <span className="text-xs text-slate-400 line-through">
                  Rs {product.originalPrice.toLocaleString('en-PK')}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
