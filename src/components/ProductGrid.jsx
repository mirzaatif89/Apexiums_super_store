import { Package, Plus } from 'lucide-react';

function ProductCard({ product }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
      <div className="relative overflow-hidden">
        {product.image ? <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
        /> : <div className="grid aspect-[4/3] w-full place-items-center bg-slate-100 text-slate-400"><Package size={32} /></div>}
        <span className="absolute left-3 top-3 rounded-full bg-teal-600 px-2.5 py-1 text-[11px] font-bold text-white">
          {product.badge}
        </span>

        <button
          type="button"
          aria-label={`Add ${product.title} to cart`}
          className="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg shadow-slate-900/10 transition md:opacity-0 md:group-hover:opacity-100"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="grid gap-2 p-4">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">
          <span>{product.category}</span>
        </div>

        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-900">
          {product.title}
        </h3>

        <div className="flex items-end justify-between gap-3">
          <div>
            <span className="block text-base font-black text-slate-950">Rs {product.price.toLocaleString('en-PK')}</span>
            {product.originalPrice > product.price ? <span className="text-xs text-slate-400 line-through">
              Rs {product.originalPrice.toLocaleString('en-PK')}
            </span> : null}
          </div>
          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700">{product.badge}</span>
        </div>
      </div>
    </article>
  );
}

export default function ProductGrid({ sections }) {
  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <section key={section.title} className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-600">{section.title}</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">{section.description}</h2>
            </div>
            <a href="#" className="hidden text-sm font-semibold text-teal-600 sm:inline-flex">
              View more
            </a>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {section.products.length ? section.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            )) : <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm font-semibold text-slate-500">No products are available yet.</div>}
          </div>
        </section>
      ))}
    </div>
  );
}
