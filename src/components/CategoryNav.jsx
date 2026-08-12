export default function CategoryNav({ navItems }) {
  if (!navItems.length) return null;
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 lg:px-6">
        <div className="lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navItems.map((item) => (
              <button
                key={item.label}
                className="inline-flex min-h-11 flex-none items-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-600"
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <div key={item.label} className="group relative">
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-teal-600"
                >
                  {item.label}
                </button>

                <div className="invisible absolute left-0 top-full z-30 mt-3 w-[22rem] translate-y-2 rounded-3xl border border-slate-200 bg-white p-4 opacity-0 shadow-2xl shadow-slate-900/10 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    {item.label}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {item.items.map((subItem) => (
                      <a
                        key={subItem}
                        href="#"
                        className="rounded-2xl bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-teal-50 hover:text-teal-600"
                      >
                        {subItem}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
