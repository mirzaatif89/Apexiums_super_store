import React from 'react';
import { MoreVertical } from 'lucide-react';

export default function ActionMenu({ actions = [], buttonTitle = 'Actions' }) {
  const [open, setOpen] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState(null);
  const rootRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
        setMenuPosition(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative inline-flex justify-end">
      <button
        type="button"
        onClick={(event) => {
          if (open) { setOpen(false); setMenuPosition(null); return; }
          const rect = event.currentTarget.getBoundingClientRect();
          const menuHeight = Math.min(actions.length * 38 + 12, 180);
          const openAbove = rect.bottom + menuHeight > window.innerHeight - 12;
          setMenuPosition({
            top: openAbove ? Math.max(12, rect.top - menuHeight - 8) : rect.bottom + 8,
            right: Math.max(12, window.innerWidth - rect.right)
          });
          setOpen(true);
        }}
        title={buttonTitle}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div style={menuPosition || undefined} className="fixed z-[9999] w-44 overflow-hidden rounded-2xl border border-rose-100 bg-white p-1.5 shadow-2xl">
          {actions.map((action) => {
            const Icon = action.icon;
            const isDanger = action.variant === 'danger';
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  setOpen(false);
                  action.onClick?.();
                }}
                disabled={action.disabled}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                  isDanger
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-slate-700 hover:bg-slate-100'
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {Icon && <Icon size={14} />}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
