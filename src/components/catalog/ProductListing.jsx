import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Badge from '../common/Badge';
import ActionMenu from '../common/ActionMenu';
import {
  Search,
  Plus,
  Filter,
  Trash2,
  Edit2,
  Copy,
  Boxes,
  Eye,
  X,
  Image as ImageIcon,
  Check,
  Power,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const ProductListing = () => {
  const {
    products,
    categories,
    sellers,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    updateProductStock,
    bulkDeleteProducts,
    bulkUpdateProductStatus
  } = useAdmin();

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeller, setSelectedSeller] = useState('');
  const [selectedStockStatus, setSelectedStockStatus] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Bulk selection state
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states (Add/Edit, Stock Update, View Product)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [stockModalProduct, setStockModalProduct] = useState(null);
  const [newStockQty, setNewStockQty] = useState(0);
  const [uploadPreview, setUploadPreview] = useState('');

  // Form State for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics & Tech',
    subcategory: 'Audio & Headphones',
    seller: 'Apexium Tech Store',
    price: '',
    discount: 0,
    stock: '',
    minStock: 10,
    status: 'Active',
    brand: '',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    description: ''
  });

  // Filter products logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesSeller = selectedSeller ? p.seller === selectedSeller : true;
    const matchesStatus = selectedStatus ? p.status === selectedStatus : true;

    let matchesStock = true;
    if (selectedStockStatus === 'in-stock') matchesStock = p.stock > p.minStock;
    if (selectedStockStatus === 'low-stock') matchesStock = p.stock > 0 && p.stock <= p.minStock;
    if (selectedStockStatus === 'out-of-stock') matchesStock = p.stock === 0;

    return matchesSearch && matchesCategory && matchesSeller && matchesStatus && matchesStock;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'stock-low') return a.stock - b.stock;
    return new Date(b.dateAdded) - new Date(a.dateAdded);
  });

  // Show the complete product catalog on one page.
  const itemsPerPage = Math.max(sortedProducts.length, 1);

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Checkbox Selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProductIds(paginatedProducts.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Form Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: categories[0]?.name || 'Electronics & Tech',
      subcategory: categories[0]?.subcategories[0] || 'General',
      seller: sellers[0]?.storeName || 'Apexium Tech Store',
      price: '',
      discount: 0,
      stock: '',
      minStock: 10,
      status: 'Active',
      brand: 'Apexium',
      image: '',
      description: ''
    });
    setUploadPreview('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      category: p.category,
      subcategory: p.subcategory || '',
      seller: p.seller,
      price: p.price,
      discount: p.discount || 0,
      stock: p.stock,
      minStock: p.minStock || 10,
      status: p.status,
      brand: p.brand || '',
      image: p.image,
      description: p.description || ''
    });
    setUploadPreview(p.image || '');
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || formData.stock === '') return;

    const image = formData.image || uploadPreview || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80';
    const payload = { ...formData, image };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Catalog Product Management</h2>
          <p className="text-xs text-slate-500 font-medium">Manage multi-vendor marketplace catalog, prices, and stock inventory.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filter & Search Bar Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, SKU, brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Seller Filter */}
          <select
            value={selectedSeller}
            onChange={(e) => setSelectedSeller(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Sellers</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.storeName}>{s.storeName}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={selectedStockStatus}
            onChange={(e) => setSelectedStockStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Stock Levels</option>
            <option value="in-stock">In Stock (&gt; Min)</option>
            <option value="low-stock">Low Stock (≤ Min)</option>
            <option value="out-of-stock">Out of Stock (0)</option>
          </select>
        </div>

        {/* Secondary Bulk Actions Toolbar */}
        {selectedProductIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-900 animate-fade-in">
            <span>{selectedProductIds.length} Products Selected</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => bulkUpdateProductStatus(selectedProductIds, 'Active')}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer text-[11px]"
              >
                Set Active
              </button>
              <button
                onClick={() => bulkUpdateProductStatus(selectedProductIds, 'Draft')}
                className="px-2.5 py-1 rounded-lg bg-slate-600 text-white hover:bg-slate-700 cursor-pointer text-[11px]"
              >
                Set Draft
              </button>
              <button
                onClick={() => {
                  bulkDeleteProducts(selectedProductIds);
                  setSelectedProductIds([]);
                }}
                className="px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer text-[11px] flex items-center gap-1"
              >
                <Trash2 size={12} /> Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-hidden">
          <table className="w-full table-fixed text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      paginatedProducts.length > 0 &&
                      selectedProductIds.length === paginatedProducts.length
                    }
                    className="rounded text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                </th>
                <th className="p-2.5">Product</th>
                <th className="p-2.5">SKU</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5">Seller</th>
                <th className="p-2.5">Price</th>
                <th className="p-2.5">Stock</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No products matching your search or filters.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isChecked = selectedProductIds.includes(p.id);
                  const isLow = p.stock <= p.minStock && p.stock > 0;
                  const isOut = p.stock === 0;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isChecked ? 'bg-red-50/20' : ''
                      }`}
                    >
                      <td className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(p.id)}
                          className="rounded text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-slate-900 truncate">{p.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">Brand: {p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2.5 font-mono text-[11px] font-bold text-slate-600 break-words">{p.sku}</td>
                      <td className="p-2.5 font-semibold text-slate-700 break-words">{p.category}</td>
                      <td className="p-2.5 font-semibold text-slate-800 break-words">{p.seller}</td>
                      <td className="p-2.5 font-black text-slate-900">${p.price}</td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-black text-xs ${
                              isOut
                                ? 'text-rose-600'
                                : isLow
                                ? 'text-amber-600'
                                : 'text-slate-800'
                            }`}
                          >
                            {p.stock} pcs
                          </span>
                          <button
                            onClick={() => {
                              setStockModalProduct(p);
                              setNewStockQty(p.stock);
                            }}
                            title="Update Quick Stock"
                            className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                          >
                            <Boxes size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          <Badge status={p.status} className="whitespace-nowrap text-[11px] px-2.5">
                            {p.status}
                          </Badge>
                          <button
                            type="button"
                            onClick={() => {
                              const nextStatus = p.status === 'Inactive' ? 'Active' : 'Inactive';
                              updateProduct(p.id, { status: nextStatus });
                              const hidden = JSON.parse(localStorage.getItem('apexiums-hidden-products') || '[]');
                              const ids = nextStatus === 'Inactive'
                                ? [...new Set([...hidden, p.id])]
                                : hidden.filter((id) => id !== p.id);
                              localStorage.setItem('apexiums-hidden-products', JSON.stringify(ids));
                              window.dispatchEvent(new Event('apexiums-product-visibility-changed'));
                            }}
                            title={p.status === 'Inactive' ? 'Show on website' : 'Hide from website'}
                            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold cursor-pointer transition-colors ${p.status === 'Inactive' ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                          >
                            <Power size={11} /> {p.status === 'Inactive' ? 'Off' : 'On'}
                          </button>
                        </div>
                      </td>
                      <td className="p-2.5 text-right">
                        <ActionMenu
                          buttonTitle="Product actions"
                          actions={[
                            { label: 'View details', icon: Eye, onClick: () => setViewingProduct(p) },
                            { label: 'Edit product', icon: Edit2, onClick: () => handleOpenEdit(p) },
                            { label: 'Duplicate product', icon: Copy, onClick: () => duplicateProduct(p.id) },
                            { label: 'Delete product', icon: Trash2, variant: 'danger', onClick: () => deleteProduct(p.id) }
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add / Edit Product Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-900 text-white">
              <h3 className="text-sm font-extrabold">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Marketplace Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500"
                    placeholder="e.g. Studio Pro Headphones"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Seller / Vendor Store *</label>
                  <select
                    value={formData.seller}
                    onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    {sellers.map((s) => (
                      <option key={s.id} value={s.storeName}>{s.storeName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Alert Stock Threshold</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Inactive">Inactive (Hidden)</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">Image Upload</label>
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none"
                />
                {(uploadPreview || formData.image) && (
                  <img
                    src={uploadPreview || formData.image}
                    alt="Product preview"
                    className="mt-2 h-32 w-full rounded-xl border object-cover"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  placeholder="Enter detailed product specifications..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Stock Update Modal */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Update Stock Quantity</h3>
            <p className="text-xs text-slate-500 font-medium">{stockModalProduct.name}</p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNewStockQty(Math.max(0, Number(newStockQty) - 1))}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-slate-800 text-lg cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                value={newStockQty}
                onChange={(e) => setNewStockQty(Number(e.target.value))}
                className="flex-1 text-center font-black text-lg py-1.5 border border-slate-200 rounded-xl focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setNewStockQty(Number(newStockQty) + 1)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-slate-800 text-lg cursor-pointer"
              >
                +
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStockModalProduct(null)}
                className="px-3 py-1.5 rounded-xl border text-xs font-bold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateProductStock(stockModalProduct.id, newStockQty);
                  setStockModalProduct(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Product Details Drawer/Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Product Preview</h3>
              <button onClick={() => setViewingProduct(null)} className="p-1 text-slate-400 hover:text-slate-800">
                <X size={18} />
              </button>
            </div>
            <img src={viewingProduct.image} alt={viewingProduct.name} className="w-full h-48 rounded-xl object-cover border" />
            <div>
              <h4 className="text-base font-black text-slate-900">{viewingProduct.name}</h4>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">SKU: {viewingProduct.sku} • {viewingProduct.category}</p>
              <p className="text-xs text-slate-600 mt-2">{viewingProduct.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs border-t pt-3">
              <div><span className="text-slate-400">Price:</span> <strong className="text-slate-900">${viewingProduct.price}</strong></div>
              <div><span className="text-slate-400">Stock:</span> <strong className="text-slate-900">{viewingProduct.stock} pcs</strong></div>
              <div><span className="text-slate-400">Seller:</span> <strong className="text-slate-900">{viewingProduct.seller}</strong></div>
              <div><span className="text-slate-400">Status:</span> <Badge status={viewingProduct.status}>{viewingProduct.status}</Badge></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListing;
