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
    investors,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    updateProductStock,
    bulkDeleteProducts,
    bulkUpdateProductStatus
  } = useAdmin();
  const categoryOptions = Array.from(new Set([
    ...categories.map((category) => category.name).filter(Boolean),
    ...products.map((product) => product.category).filter(Boolean)
  ])).map((name) => categories.find((category) => category.name === name) || { id: `product-category-${name}`, name, subcategories: [] });

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
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
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [productSaved, setProductSaved] = useState(false);

  // Form State for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics & Tech',
    subcategory: '',
    images: [],
    price: '',
    realPrice: '',
    discountedPrice: '',
    costPrice: '',
    discount: 0,
    stock: '',
    minStock: 10,
    status: 'Active',
    brand: '',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    description: '', investorId: ''
    ,colors: '', sizes: ''
  });

  // Filter products logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesStatus = selectedStatus ? p.status === selectedStatus : true;

    let matchesStock = true;
    if (selectedStockStatus === 'in-stock') matchesStock = p.stock > p.minStock;
    if (selectedStockStatus === 'low-stock') matchesStock = p.stock > 0 && p.stock <= p.minStock;
    if (selectedStockStatus === 'out-of-stock') matchesStock = p.stock === 0;

    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
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
    setSaveError('');
    setFormData({
      name: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: categoryOptions[0]?.name || 'Electronics & Tech',
      subcategory: '',
      images: [],
      price: '',
      realPrice: '',
      discountedPrice: '',
      discount: 0,
      stock: '',
      minStock: 10,
      status: 'Active',
      brand: 'Apexium',
      image: '',
      description: ''
      ,colors: '', sizes: '', investorId: ''
    });
    setUploadPreview('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setSaveError('');
    setFormData({
      name: p.name,
      sku: p.sku,
      category: p.category,
      subcategory: p.subcategory || '',
      price: p.price,
      realPrice: p.realPrice ?? p.price,
      discountedPrice: p.discountedPrice ?? p.price,
      costPrice: p.costPrice ?? p.cost_price ?? '',
      discount: p.discount || 0,
      stock: p.stock,
      minStock: p.minStock || 10,
      status: p.status,
      brand: p.brand || '',
      image: p.image,
      images: Array.isArray(p.images) ? p.images : (p.image ? [{ url: p.image, style: 'Default' }] : []),
      description: p.description || ''
      ,colors: p.colors || '', sizes: p.sizes || '', investorId: p.investorId ?? p.investor_id ?? ''
    });
    setUploadPreview(p.image || '');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.realPrice || !formData.discountedPrice || formData.stock === '') {
      setSaveError('Please complete Product Name, Category, Subcategory, Sales Price, Discounted Price, and Stock.');
      return;
    }
    const salesPrice = Number(formData.realPrice);
    const discountedPrice = Number(formData.discountedPrice);
    const acquisitionCost = Number(formData.costPrice || 0);
    if (acquisitionCost > 0 && salesPrice <= acquisitionCost) {
      setSaveError('Sales Price must be greater than the Cost of Acquisition.');
      return;
    }
    if (discountedPrice >= salesPrice) {
      setSaveError('Discounted Price must be less than the Sales Price.');
      return;
    }
    if (acquisitionCost > 0 && discountedPrice < acquisitionCost) {
      setSaveError('Discounted Price cannot be less than the Cost of Acquisition.');
      return;
    }
    setSaveError('');
    setProductSaved(false);
    setIsSaving(true);

    const image = formData.images?.[0]?.url || formData.image || uploadPreview || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80';
    const payload = { ...formData, price: formData.discountedPrice, image, images: formData.images || [], status: Number(formData.stock) === 0 ? 'Out of Stock' : formData.status };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await addProduct(payload);
      }
      setProductSaved(true);
      window.setTimeout(() => {
        setIsModalOpen(false);
        setProductSaved(false);
      }, 900);
    } catch (error) {
      setSaveError(error.message || 'Product could not be saved. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
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
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-visible">
        <div className="overflow-visible">
          <table className="w-full min-w-[760px] text-left text-xs">
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
                <th className="px-4 py-3.5 whitespace-nowrap">Product</th>
                <th className="px-4 py-3.5 whitespace-nowrap">SKU</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Category</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Price</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Stock</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
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
                  const isHidden = p.status === 'Inactive' || (() => { try { return JSON.parse(localStorage.getItem('apexiums-hidden-products') || '[]').includes(p.id); } catch { return false; } })();

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
                            src={p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'}
                            alt={p.name}
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'; }}
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
                      <td className="p-2.5 font-black text-slate-900">Rs {p.price}</td>
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
                              const hidden = JSON.parse(localStorage.getItem('apexiums-hidden-products') || '[]');
                              const ids = isHidden ? hidden.filter((id) => id !== p.id) : [...new Set([...hidden, p.id])];
                              localStorage.setItem('apexiums-hidden-products', JSON.stringify(ids));
                              updateProduct(p.id, { ...p, status: isHidden ? 'Active' : 'Inactive' });
                              window.dispatchEvent(new Event('apexiums-product-visibility-changed'));
                            }}
                            title={isHidden ? 'Show on website' : 'Hide from website'}
                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 cursor-pointer transition-colors ${isHidden ? 'bg-slate-300 hover:bg-slate-400' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                          >
                            <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${isHidden ? 'translate-x-0' : 'translate-x-5'}`} />
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
          <div className="bg-white rounded-3xl shadow-2xl border border-red-100 w-full sm:w-[72vw] max-w-[72vw] min-w-0 sm:min-w-[680px] overflow-hidden flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between px-7 py-5 border-b border-red-100 bg-gradient-to-r from-red-50 to-white text-slate-900">
              <h3 className="text-sm font-extrabold">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Marketplace Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form noValidate onSubmit={handleSaveProduct} className="px-7 py-6 overflow-y-auto space-y-5">
              {saveError && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{saveError}</p>}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">Product Images (up to 5) *</label>
                <label title="Upload up to 5 product images" className="relative flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-red-200 bg-red-50/40 text-center transition hover:border-red-400 hover:bg-red-50">
                  <ImageIcon size={34} className="text-red-500" />
                  <input type="file" accept="image/*" multiple required={!editingProduct && !formData.image} className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => {
                    const files = Array.from(e.target.files || []).slice(0, 5);
                    Promise.all(files.map((file) => new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => resolve({ url: String(reader.result || ''), style: file.name.replace(/\.[^.]+$/, '') }); reader.readAsDataURL(file); }))).then((images) => setFormData({ ...formData, image: images[0]?.url || formData.image, images: images.slice(1) }));
                  }} />
                </label>
                {Boolean(formData.image || formData.images?.length) && <div className="mt-3 flex flex-wrap gap-2">
                  {[formData.image, ...(formData.images || []).map((item) => item.url)].filter(Boolean).slice(0, 5).map((src, index) => <img key={`${src}-${index}`} src={src} alt={`Product ${index + 1}`} className="h-16 w-16 rounded-xl border border-red-100 object-cover shadow-sm" />)}
                </div>}
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product ID</label>
                <input value={editingProduct?.id || 'Auto-generated on save'} readOnly className="w-56 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-500" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200" placeholder="e.g. Studio Pro Headphones" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Description</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:border-red-500" placeholder="Enter product description..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Investor</label>
                  <select value={formData.investorId} onChange={(e) => setFormData({ ...formData, investorId: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none">
                    <option value="">Admin / General Inventory</option>
                    {investors.map((investor) => <option key={investor.id} value={investor.id}>{investor.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: categories.find((c) => c.name === e.target.value)?.subcategories?.[0] || '' })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    {categoryOptions.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sales Price (PKR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.realPrice}
                    onChange={(e) => setFormData({ ...formData, realPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discounted Price (PKR) *</label>
                  <input type="number" min={formData.costPrice || 0} step="0.01" value={formData.discountedPrice} onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200" />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cost of Acquisition (PKR)</label>
                  <input type="number" min="0" step="0.01" value={formData.costPrice} onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })} placeholder="Product purchase cost" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200" />
                  <p className="mt-1 text-[10px] font-medium text-slate-400">Only visible in the admin panel.</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
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
                    <option value="Inactive">Inactive</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Colors <span className="font-normal text-slate-400">(optional, comma separated)</span></label>
                  <input value={formData.colors} onChange={(e) => setFormData({ ...formData, colors: e.target.value })} placeholder="Black, White, Blue" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none" />
                </div>
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
                  disabled={isSaving || productSaved}
                  className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer disabled:cursor-not-allowed ${productSaved ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'}`}
                >
                  {productSaved ? <span className="inline-flex items-center gap-1.5"><Check size={14} className="animate-bounce" /> Successfully Saved</span> : isSaving ? <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Saving Product...</span> : 'Save Product'}
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
              <div><span className="text-slate-400">Price:</span> <strong className="text-slate-900">Rs {viewingProduct.price}</strong></div>
              <div><span className="text-slate-400">Stock:</span> <strong className="text-slate-900">{viewingProduct.stock} pcs</strong></div>
              <div><span className="text-slate-400">Status:</span> <Badge status={viewingProduct.status}>{viewingProduct.status}</Badge></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListing;

