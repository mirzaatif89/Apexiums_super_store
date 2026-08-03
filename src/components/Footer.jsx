import React from 'react';

function FooterSection({ title, links, logoSrc, storeName, defaultOpen = false }) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <section className="border-b border-slate-200 py-4 lg:border-0 lg:py-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-11 w-full items-center justify-between gap-4 text-left lg:pointer-events-none lg:min-h-0"
      >
        <span className="text-sm font-bold text-slate-950">{title}</span>
        <span className="text-slate-400 lg:hidden">{open ? '-' : '+'}</span>
      </button>

      <div className={`${open ? 'mt-3 grid' : 'hidden'} gap-3 lg:mt-4 lg:grid`}>
        {title === 'About' ? (
          <img src={logoSrc} alt={storeName} loading="lazy" className="h-12 w-auto object-contain" />
        ) : null}

        {links.map((link) => (
          <a key={link} href="#" className="text-sm text-slate-600 transition hover:text-teal-600">
            {link}
          </a>
        ))}
      </div>
    </section>
  );
}

export default function Footer({ sections, paymentMethods, storeName, logoSrc }) {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white pb-20 lg:pb-0">
      <div className="mx-auto max-w-7xl px-3 py-10 sm:px-4 lg:px-6">
        <div className="grid gap-8 lg:grid-cols-4 lg:items-start">
          {sections.map((section, index) => (
            <div key={section.title} className="space-y-4">
              <div className="lg:hidden">
                <FooterSection title={section.title} links={section.links} logoSrc={logoSrc} storeName={storeName} defaultOpen={index === 0} />
              </div>

              <div className="hidden lg:block">
                <div className="space-y-4">
                  {index === 0 ? (
                    <div className="space-y-4">
                      <img src={logoSrc} alt={storeName} loading="lazy" className="h-14 w-auto object-contain" />
                      <div>
                        <p className="mb-3 text-sm font-semibold text-slate-950">Payment Methods</p>
                        <div className="flex flex-wrap gap-2">
                          {paymentMethods.map((method) => (
                            <span
                              key={method}
                              className="inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700"
                            >
                              {method}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-sm font-bold text-slate-950">{section.title}</h3>
                      <div className="grid gap-2">
                        {section.links.map((link) => (
                          <a key={link} href="#" className="text-sm text-slate-600 transition hover:text-teal-600">
                            {link}
                          </a>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="lg:hidden">
              <div className="mt-4">
                <p className="mb-3 text-sm font-semibold text-slate-950">Payment Methods</p>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <span
                    key={method}
                    className="inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">
          (c) {new Date().getFullYear()} {storeName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
