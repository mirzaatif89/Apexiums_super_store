import React, { useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  Image,
  Megaphone,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

const emptyForm = {
  title: "",
  destination: "Both Website & App",
  order: 1,
  active: true,
  image: "",
};

export const BannersView = () => {
  const {
    banners,
    ads,
    addBanner,
    addAd,
    deleteBanner,
    deleteAd,
    toggleBanner,
    toggleAd,
  } = useAdmin();
  const [form, setForm] = useState(emptyForm);
  const fileInput = useRef(null);
  const savedBanners = [
    ...banners.map((item) => ({
      ...item,
      source: "Website",
      sourceType: "website",
      displayTitle: item.title,
    })),
    ...ads.map((item) => ({
      ...item,
      source: "App",
      sourceType: "app",
      displayTitle: item.name,
    })),
  ].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

  const resetForm = () => {
    setForm(emptyForm);
    if (fileInput.current) fileInput.current.value = "";
  };

  const selectImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setForm((current) => ({
        ...current,
        image: String(reader.result || ""),
      }));
    reader.readAsDataURL(file);
  };

  const saveBanner = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.image) return;
    const shared = {
      image: form.image,
      order: Number(form.order || 1),
      visible: form.active,
      status: form.active ? "Active" : "Inactive",
    };
    if (form.destination !== "App Only")
      addBanner({
        ...shared,
        title: form.title.trim(),
        description: "",
        ctaText: "Shop Now",
        ctaUrl: "/catalog",
      });
    if (form.destination !== "Website Only")
      addAd({
        ...shared,
        name: form.title.trim(),
        placement: "Mobile App Banner",
        targetUrl: "/catalog",
        budget: 0,
      });
    resetForm();
  };

  const removeBanner = (item) =>
    item.sourceType === "website" ? deleteBanner(item.id) : deleteAd(item.id);
  const changeVisibility = (item) =>
    item.sourceType === "website" ? toggleBanner(item.id) : toggleAd(item.id);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900">
          <Megaphone className="text-red-500" size={24} /> Banner Manager
        </h2>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Upload and manage website and app banners from one place.
        </p>
      </div>

      <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[420px_1fr]">
        <section className="border-b border-slate-200 lg:border-b-0 lg:border-r">
          <div className="border-b bg-slate-50 px-5 py-4">
            <h3 className="font-black text-slate-900">Banner Details</h3>
            <p className="mt-1 text-xs text-slate-500">
              Upload one image and choose where it should appear.
            </p>
          </div>
          <form onSubmit={saveBanner} className="space-y-5 p-5">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
              Show Banner On
              <select
                value={form.destination}
                onChange={(e) =>
                  setForm({ ...form, destination: e.target.value })
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold normal-case text-slate-800 outline-none focus:border-red-400"
              >
                <option>Both Website & App</option>
                <option>Website Only</option>
                <option>App Only</option>
              </select>
            </label>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
              Title
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter banner title"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold normal-case outline-none focus:border-red-400"
              />
            </label>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                Upload Banner
              </p>
              <div className="rounded-xl border border-dashed border-red-200 bg-red-50/30 p-3">
                <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl border bg-white">
                  {form.image ? (
                    <img
                      src={form.image}
                      alt="Banner preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <Image className="mx-auto mb-2" size={28} />
                      <p className="text-sm font-bold">No image selected</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  onChange={selectImage}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-xs font-black text-red-600 hover:bg-red-50"
                >
                  <Upload size={15} /> Choose Image
                </button>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_auto] items-end gap-3">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
                Display Order
                <input
                  type="number"
                  min="1"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-red-400"
                />
              </label>
              <label className="flex h-[46px] items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                  className="accent-red-500"
                />{" "}
                Active
              </label>
            </div>
            {!form.image && form.title && (
              <p className="text-xs font-semibold text-red-500">
                Please choose a banner image.
              </p>
            )}
            <div className="flex gap-2 border-t pt-4">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-xs font-black text-white shadow-sm hover:bg-red-600"
              >
                <Save size={16} /> Save Banner
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          </form>
        </section>

        <section>
          <div className="border-b bg-slate-50 px-5 py-4">
            <h3 className="font-black text-slate-900">Saved Banners</h3>
            <p className="mt-1 text-xs text-slate-500">
              All website and app banners appear here.
            </p>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {savedBanners.map((item) => (
              <article
                key={`${item.sourceType}-${item.id}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative aspect-[16/7] bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.displayTitle}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-slate-950/75 px-2.5 py-1 text-[10px] font-black text-white">
                    {item.source}
                  </span>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-black text-slate-900">
                        {item.displayTitle || "Untitled Banner"}
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Display order: {item.order || 1}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.visible === false ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-700"}`}
                    >
                      {item.visible === false ? "Inactive" : "Active"}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2 border-t pt-3">
                    <button
                      type="button"
                      onClick={() => changeVisibility(item)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                    >
                      {item.visible === false ? (
                        <Eye size={14} />
                      ) : (
                        <EyeOff size={14} />
                      )}
                      {item.visible === false ? "Activate" : "Deactivate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBanner(item)}
                      className="rounded-lg border border-red-100 px-3 py-2 text-red-500 hover:bg-red-50"
                      title="Delete banner"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {!savedBanners.length && (
              <div className="col-span-full flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
                <div>
                  <Image className="mx-auto mb-3 text-slate-400" size={30} />
                  <h4 className="font-black text-slate-800">
                    No banners saved yet
                  </h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Upload a banner image and save it to show it here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BannersView;
