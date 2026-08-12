import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Badge from '../common/Badge';
import { Layers, Plus, Search, Edit2, Trash2, X, FolderTree } from 'lucide-react';

export const CategoriesView = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [uploadPreview, setUploadPreview] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent: '',
    image: '',
    status: 'Active',
    subcategories: ''
  });

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      parent: '',
      image: '',
      status: 'Active',
      subcategories: ''
    });
    setUploadPreview('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCategory(c);
    setFormData({
      name: c.name,
      slug: c.slug,
      parent: c.parent || '',
      image: c.image,
      status: c.status,
      subcategories: Array.isArray(c.subcategories) ? c.subcategories.join(', ') : ''
    });
    setUploadPreview(c.image || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const formattedData = {
      ...formData,
      image: formData.image || uploadPreview || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      subcategories: formData.subcategories
        ? formData.subcategories.split(',').map((s) => s.trim())
        : []
    };

    if (editingCategory) {
      updateCategory(editingCategory.id, formattedData);
    } else {
      addCategory(formattedData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Category Hierarchy Management</h2>
          <p className="text-xs text-slate-500 font-medium">Organize products into main categories, subcategories, and navigation trees.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 cursor-pointer transition-all"
        >
          <Plus size={16} /> Add New Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search categories or subcategories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="relative h-36 w-full">
                <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <div>
                    <h3 className="text-base font-black tracking-tight">{c.name}</h3>
                    <p className="text-[10px] text-slate-300 font-mono">/{c.slug}</p>
                  </div>
                  <Badge status={c.status}>{c.status}</Badge>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5"><Layers size={14} className="text-red-500" /> Product Items</span>
                  <span className="font-black text-slate-900">{c.productCount} items</span>
                </div>

                {/* Subcategories list */}
                {c.subcategories && c.subcategories.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Subcategories</p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.subcategories.map((sub, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(c)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <Edit2 size={12} /> Edit
              </button>
              <button
                onClick={() => deleteCategory(c.id)}
                className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-100 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-slate-900 text-white">
              <h3 className="text-sm font-extrabold">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-semibold focus:outline-none focus:border-red-500"
                  placeholder="e.g. Sports & Outdoors"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subcategories (comma separated)</label>
                <input
                  type="text"
                  value={formData.subcategories}
                  onChange={(e) => setFormData({ ...formData, subcategories: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-semibold focus:outline-none"
                  placeholder="e.g. Cycling, Camping, Yoga"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner / Cover Image Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const result = String(reader.result || '');
                      setUploadPreview(result);
                      setFormData({ ...formData, image: result });
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="w-full rounded-xl border px-3 py-2 font-semibold focus:outline-none"
                />
                {(uploadPreview || formData.image) && (
                  <img
                    src={uploadPreview || formData.image}
                    alt="Category preview"
                    className="mt-2 h-32 w-full rounded-xl border object-cover"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-xl border text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesView;
