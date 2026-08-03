export default function CategoryGrid({ categories }) {
  return (
    <section className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-600">Categories</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Shop by category</h2>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.label}
              type="button"
              className="group flex min-h-28 flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-3 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10"
            >
              <span className="flex aspect-square w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-50 to-cyan-50 ring-1 ring-teal-100">
                <img
                  src={category.image}
                  alt={category.label}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                <Icon size={18} />
              </span>
              <span className="text-xs font-semibold text-slate-700 sm:text-sm">{category.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
