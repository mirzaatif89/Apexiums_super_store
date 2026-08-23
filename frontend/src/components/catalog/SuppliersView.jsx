import React from "react";
import {
  Building2,
  Edit2,
  PackagePlus,
  Phone,
  Plus,
  Search,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

const emptySupplier = {
  business_name: "",
  contact_person: "",
  phone: "",
  email: "",
  address: "",
  products_supplied: "",
  description: "",
  contact_date: new Date().toISOString().slice(0, 10),
  supplier_payment_amount: "",
  supplier_payment_date: new Date().toISOString().slice(0, 10),
  status: "Active",
};
const emptyPurchase = {
  wholeseller_id: "",
  product_id: "",
  quantity: "",
  unit_cost: "",
  paid_amount: "",
  payment_method: "Bank Transfer",
  delivery_status: "Not Delivered",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
};

const parseItems = (value) => {
  try {
    return typeof value === "string" ? JSON.parse(value) : value || {};
  } catch {
    return {};
  }
};

export default function SuppliersView() {
  const { products, addStockRecord } = useAdmin();
  const [suppliers, setSuppliers] = React.useState([]);
  const [purchases, setPurchases] = React.useState([]);
  const [query, setQuery] = React.useState("");
  const [supplierForm, setSupplierForm] = React.useState(null);
  const [purchaseForm, setPurchaseForm] = React.useState(null);
  const [editingSupplier, setEditingSupplier] = React.useState(null);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const loadData = React.useCallback(async () => {
    const [supplierResponse, purchaseResponse] = await Promise.all([
      fetch("/api/wholesellers?limit=100"),
      fetch("/api/purchase_orders?limit=100"),
    ]);
    const [supplierData, purchaseData] = await Promise.all([
      supplierResponse.ok ? supplierResponse.json() : { rows: [] },
      purchaseResponse.ok ? purchaseResponse.json() : { rows: [] },
    ]);
    setSuppliers(Array.isArray(supplierData.rows) ? supplierData.rows : []);
    setPurchases(Array.isArray(purchaseData.rows) ? purchaseData.rows : []);
  }, []);

  React.useEffect(() => {
    loadData().catch(() => setError("Supplier data could not be loaded."));
  }, [loadData]);

  const filteredSuppliers = suppliers.filter((supplier) =>
    [
      supplier.business_name,
      supplier.contact_person,
      supplier.phone,
      supplier.email,
      supplier.products_supplied,
    ].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(query.toLowerCase()),
    ),
  );
  const totalPurchased = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.total_amount || 0),
    0,
  );
  const totalUnits = purchases.reduce(
    (sum, purchase) =>
      sum + Number(parseItems(purchase.items_json).quantity || 0),
    0,
  );
  const totalDue = suppliers.reduce(
    (sum, supplier) => sum + Number(supplier.payment_due || 0),
    0,
  );

  const saveSupplier = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const endpoint = editingSupplier
        ? `/api/wholesellers/${editingSupplier.id}`
        : "/api/wholesellers";
      const response = await fetch(endpoint, {
        method: editingSupplier ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...supplierForm,
          name: supplierForm.contact_person,
          supplier_payment_amount: Number(supplierForm.supplier_payment_amount || 0),
          status: "Active",
          total_purchases: Number(editingSupplier?.total_purchases || 0),
          payment_due: Number(editingSupplier?.payment_due || 0),
        }),
      });
      if (!response.ok)
        throw new Error(
          (await response.json()).message || "Supplier save failed",
        );
      setSupplierForm(null);
      setEditingSupplier(null);
      await loadData();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const savePurchase = async (event) => {
    event.preventDefault();
    const supplier = suppliers.find(
      (item) => String(item.id) === String(purchaseForm.wholeseller_id),
    );
    const product = products.find(
      (item) => String(item.id) === String(purchaseForm.product_id),
    );
    const quantity = Number(purchaseForm.quantity || 0);
    const unitCost = Number(purchaseForm.unit_cost || 0);
    if (!supplier || !product || quantity <= 0 || unitCost <= 0)
      return setError(
        "Please enter a supplier, product, quantity, and unit cost.",
      );
    const total = quantity * unitCost;
    const paidAmount = Math.min(
      total,
      Math.max(0, Number(purchaseForm.paid_amount || 0)),
    );
    const paymentStatus =
      paidAmount >= total
        ? "Paid"
        : paidAmount > 0
          ? "Partially Paid"
          : "Pending";
    const item = {
      product_id: product.id,
      product_name: product.name,
      sku: product.sku || "",
      quantity,
      unit_cost: unitCost,
      notes: purchaseForm.notes,
    };
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/purchase_orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wholeseller_id: supplier.id,
          items_json: JSON.stringify(item),
          total_amount: total,
          paid_amount: paidAmount,
          payment_method: purchaseForm.payment_method,
          payment_status: paymentStatus,
          delivery_status: purchaseForm.delivery_status,
          status: paymentStatus,
          date: purchaseForm.date,
        }),
      });
      if (!response.ok)
        throw new Error(
          (await response.json()).message || "Purchase save failed",
        );
      if (purchaseForm.delivery_status === "Delivered")
        addStockRecord({
          productId: product.id,
          totalItems: quantity,
          quantity,
          stockBelongTo: supplier.business_name,
          description: `Supplier purchase: ${supplier.business_name}${purchaseForm.notes ? ` — ${purchaseForm.notes}` : ""}`,
        });
      await fetch(`/api/wholesellers/${supplier.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_purchases: Number(supplier.total_purchases || 0) + total,
          payment_due: Number(supplier.payment_due || 0) + (total - paidAmount),
        }),
      });
      if (paidAmount > 0)
        await fetch("/api/delivery_expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courier: supplier.business_name,
            tracking_number: purchaseForm.payment_method,
            amount: paidAmount,
            expense_date: purchaseForm.date,
            payment_status: "Paid",
            notes: `Supplier stock payment: ${item.product_name}`,
          }),
        });
      setPurchaseForm(null);
      await loadData();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const markDelivered = async (purchase) => {
    if (purchase.delivery_status === "Delivered") return;
    const item = parseItems(purchase.items_json);
    const supplier = suppliers.find(
      (entry) => String(entry.id) === String(purchase.wholeseller_id),
    );
    await fetch(`/api/purchase_orders/${purchase.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...purchase, delivery_status: "Delivered" }),
    });
    if (item.product_id)
      addStockRecord({
        productId: item.product_id,
        totalItems: Number(item.quantity || 0),
        quantity: Number(item.quantity || 0),
        stockBelongTo: supplier?.business_name || "Supplier",
        description: `Delivered supplier purchase #${purchase.id}`,
      });
    await loadData();
  };

  const recordPayment = async (purchase) => {
    const currentPaid = Number(purchase.paid_amount || 0);
    const due = Math.max(0, Number(purchase.total_amount || 0) - currentPaid);
    if (!due) return;
    const entered = window.prompt(`Amount due: Rs ${due.toLocaleString("en-PK")}\nEnter payment amount:`);
    if (entered === null) return;
    const amount = Math.min(due, Math.max(0, Number(entered || 0)));
    if (!amount) return setError("Enter a valid supplier payment amount.");
    const method = window.prompt("Payment method: Bank Transfer, Cash, JazzCash, EasyPaisa, or Cheque", purchase.payment_method || "Bank Transfer") || "Bank Transfer";
    const newPaid = currentPaid + amount;
    const paymentStatus = newPaid >= Number(purchase.total_amount || 0) ? "Paid" : "Partially Paid";
    const supplier = suppliers.find((entry) => String(entry.id) === String(purchase.wholeseller_id));
    await fetch(`/api/purchase_orders/${purchase.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...purchase, paid_amount: newPaid, payment_method: method, payment_status: paymentStatus, status: paymentStatus }) });
    if (supplier) await fetch(`/api/wholesellers/${supplier.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ payment_due: Math.max(0, Number(supplier.payment_due || 0) - amount) }) });
    await fetch("/api/delivery_expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courier: supplier?.business_name || `Supplier #${purchase.wholeseller_id}`, tracking_number: method, amount, expense_date: new Date().toISOString().slice(0, 10), payment_status: "Paid", notes: `Supplier payment for purchase #${purchase.id}` }) });
    await loadData();
  };

  const removeSupplier = async (supplier) => {
    if (!window.confirm(`Delete supplier "${supplier.business_name}"?`)) return;
    await fetch(`/api/wholesellers/${supplier.id}`, { method: "DELETE" });
    await loadData();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Suppliers</h2>
          <p className="text-xs font-medium text-slate-500">
            Manage suppliers, purchases, costs and supplier-wise received stock.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setPurchaseForm({ ...emptyPurchase });
              setError("");
            }}
            disabled={!suppliers.length || !products.length}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-bold text-red-600 disabled:opacity-40"
          >
            <PackagePlus size={16} /> Add Purchase
          </button>
          <button
            onClick={() => {
              setEditingSupplier(null);
              setSupplierForm({ ...emptySupplier });
              setError("");
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white"
          >
            <Plus size={16} /> Add Supplier
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          [
            "Active Suppliers",
            suppliers.filter((s) => s.status !== "Inactive").length,
            Building2,
          ],
          ["Stock Purchased", `${totalUnits} units`, Truck],
          [
            "Purchase / Due",
            `Rs ${totalPurchased.toLocaleString("en-PK")} / ${totalDue.toLocaleString("en-PK")}`,
            PackagePlus,
          ],
        ].map(([label, value, Icon]) => (
          <div key={label} className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-lg font-black text-slate-900">
                  {value}
                </p>
              </div>
              <div className="rounded-xl bg-red-50 p-2.5 text-red-600">
                <Icon size={19} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search supplier..."
          className="w-full rounded-xl border bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-red-400"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full min-w-[850px] text-left text-xs">
          <thead className="bg-slate-900 text-[10px] uppercase text-white">
            <tr>
              {[
                "Supplier",
                "Contact",
                "Products",
                "Purchased",
                "Payment Due",
                "Contact / Payment",
                "Actions",
              ].map((heading) => (
                <th key={heading} className="p-4">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredSuppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-red-50/30">
                <td className="p-4">
                  <p className="font-black">{supplier.business_name}</p>
                  <p className="text-[10px] text-slate-500">
                    {supplier.address || "No address"}
                  </p>
                </td>
                <td className="p-4">
                  <p className="font-bold">{supplier.contact_person || "—"}</p>
                  <p className="text-[10px] text-slate-500">
                    {supplier.phone || supplier.email || "—"}
                  </p>
                </td>
                <td className="p-4">{supplier.products_supplied || "—"}</td>
                <td className="p-4 font-black text-emerald-700">
                  Rs{" "}
                  {Number(supplier.total_purchases || 0).toLocaleString(
                    "en-PK",
                  )}
                </td>
                <td className="p-4 font-black text-amber-700">
                  Rs {Number(supplier.payment_due || 0).toLocaleString("en-PK")}
                </td>
                <td className="p-4"><p className="text-[10px] text-slate-500">Contact: {supplier.contact_date || "—"}</p><p className="font-black text-blue-700">Paid: Rs {Number(supplier.supplier_payment_amount || 0).toLocaleString("en-PK")}</p><p className="text-[10px] text-slate-500">Payment date: {supplier.supplier_payment_date || "—"}</p><p className="max-w-xs text-[10px] text-slate-500">{supplier.description || "No description"}</p></td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingSupplier(supplier);
                        setSupplierForm({ ...emptySupplier, ...supplier });
                      }}
                      className="rounded-lg border p-2 text-slate-600"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setPurchaseForm({
                          ...emptyPurchase,
                          wholeseller_id: String(supplier.id),
                        });
                      }}
                      className="rounded-lg border border-emerald-200 p-2 text-emerald-600"
                    >
                      <PackagePlus size={14} />
                    </button>
                    <button
                      onClick={() => removeSupplier(supplier)}
                      className="rounded-lg border border-red-200 p-2 text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <h3 className="font-black text-slate-900">Recent Supplier Purchases</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="border-b text-[10px] uppercase text-slate-500">
              <tr>
                {[
                  "Date",
                  "Supplier",
                  "Product",
                  "Quantity",
                  "Unit Cost",
                  "Total",
                  "Paid / Due",
                  "Payment Method",
                  "Delivery Status",
                  "Actions",
                ].map((heading) => (
                  <th key={heading} className="p-3">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {purchases.map((purchase) => {
                const item = parseItems(purchase.items_json);
                const supplier = suppliers.find(
                  (s) => String(s.id) === String(purchase.wholeseller_id),
                );
                return (
                  <tr key={purchase.id}>
                    <td className="p-3">{purchase.date || "—"}</td>
                    <td className="p-3 font-bold">
                      {supplier?.business_name ||
                        `Supplier #${purchase.wholeseller_id}`}
                    </td>
                    <td className="p-3">{item.product_name || "—"}</td>
                    <td className="p-3 font-black">{item.quantity || 0}</td>
                    <td className="p-3">
                      Rs {Number(item.unit_cost || 0).toLocaleString("en-PK")}
                    </td>
                    <td className="p-3 font-black">
                      Rs{" "}
                      {Number(purchase.total_amount || 0).toLocaleString(
                        "en-PK",
                      )}
                    </td>
                    <td className="p-3"><p className="font-bold text-emerald-700">Rs {Number(purchase.paid_amount || 0).toLocaleString("en-PK")}</p><p className="text-amber-700">Due: Rs {Math.max(0, Number(purchase.total_amount || 0) - Number(purchase.paid_amount || 0)).toLocaleString("en-PK")}</p></td>
                    <td className="p-3">{purchase.payment_method || "Not recorded"}</td>
                    <td className="p-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${purchase.delivery_status === "Delivered" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{purchase.delivery_status || "Not Delivered"}</span></td>
                    <td className="p-3"><div className="flex flex-wrap gap-1">{purchase.delivery_status === "Delivered" ? <span className="rounded-lg bg-emerald-50 px-2 py-1 font-bold text-emerald-600">Stock Received</span> : <button onClick={() => markDelivered(purchase)} className="rounded-lg bg-red-600 px-3 py-2 font-bold text-white">Mark Delivered</button>}{Number(purchase.paid_amount || 0) < Number(purchase.total_amount || 0) ? <button onClick={() => recordPayment(purchase)} className="rounded-lg border border-blue-200 px-3 py-2 font-bold text-blue-600">Record Payment</button> : null}</div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {supplierForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4">
          <form
            onSubmit={saveSupplier}
            className="w-full max-w-xl rounded-2xl bg-white p-6"
          >
            <div className="mb-4 flex justify-between">
              <div>
                <h3 className="text-lg font-black">
                  {editingSupplier ? "Edit Supplier" : "Add Supplier"}
                </h3>
                <p className="text-xs text-slate-500">
                  Supplier contact and product details.
                </p>
              </div>
              <button type="button" onClick={() => setSupplierForm(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["business_name", "Business / Supplier Name *"],
                ["contact_person", "Contact Person *"],
                ["phone", "Phone *"],
                ["email", "Email"],
                ["products_supplied", "Products Supplied"],
                ["address", "Address"],
                ["contact_date", "Contact Date"],
                ["supplier_payment_amount", "Payment Amount (Rs)"],
                ["supplier_payment_date", "Payment Date"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className={`text-xs font-bold ${key === "address" ? "sm:col-span-2" : ""}`}
                >
                  {label}
                  <input
                    type={key.includes("date") ? "date" : key === "supplier_payment_amount" ? "number" : "text"}
                    min={key === "supplier_payment_amount" ? "0" : undefined}
                    step={key === "supplier_payment_amount" ? "0.01" : undefined}
                    required={label.includes("*")}
                    value={supplierForm[key] || ""}
                    onChange={(e) =>
                      setSupplierForm({
                        ...supplierForm,
                        [key]: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border p-2.5 outline-none focus:border-red-400"
                  />
                </label>
              ))}
              <label className="text-xs font-bold sm:col-span-2">Description<textarea rows="3" value={supplierForm.description || ""} onChange={(e) => setSupplierForm({ ...supplierForm, description: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5 outline-none focus:border-red-400" placeholder="Products, terms, or supplier details"/></label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSupplierForm(null)}
                className="rounded-xl border px-4 py-2 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                Save Supplier
              </button>
            </div>
          </form>
        </div>
      )}

      {purchaseForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4">
          <form
            onSubmit={savePurchase}
            className="w-full max-w-xl rounded-2xl bg-white p-6"
          >
            <div className="mb-4 flex justify-between">
              <div>
                <h3 className="text-lg font-black">Add Supplier Purchase</h3>
                <p className="text-xs text-slate-500">
                  Saved quantity will automatically be added to product stock.
                </p>
              </div>
              <button type="button" onClick={() => setPurchaseForm(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold">
                Supplier *
                <select
                  required
                  value={purchaseForm.wholeseller_id}
                  onChange={(e) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      wholeseller_id: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border p-2.5"
                >
                  <option value="">Select supplier</option>
                  {suppliers
                    .filter((s) => s.status !== "Inactive")
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.business_name}
                      </option>
                    ))}
                </select>
              </label>
              <label className="text-xs font-bold">
                Product *
                <select
                  required
                  value={purchaseForm.product_id}
                  onChange={(e) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      product_id: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border p-2.5"
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold">
                Quantity *
                <input
                  required
                  min="1"
                  type="number"
                  value={purchaseForm.quantity}
                  onChange={(e) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      quantity: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border p-2.5"
                />
              </label>
              <label className="text-xs font-bold">
                Unit Cost (Rs) *
                <input
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  value={purchaseForm.unit_cost}
                  onChange={(e) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      unit_cost: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border p-2.5"
                />
              </label>
              <label className="text-xs font-bold">
                Purchase Date
                <input
                  type="date"
                  value={purchaseForm.date}
                  onChange={(e) =>
                    setPurchaseForm({ ...purchaseForm, date: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border p-2.5"
                />
              </label>
              <label className="text-xs font-bold">Amount Paid (Rs)<input min="0" step="0.01" type="number" value={purchaseForm.paid_amount} onChange={(e) => setPurchaseForm({ ...purchaseForm, paid_amount: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5"/></label>
              <label className="text-xs font-bold">Payment Method<select value={purchaseForm.payment_method} onChange={(e) => setPurchaseForm({ ...purchaseForm, payment_method: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5"><option>Bank Transfer</option><option>Cash</option><option>JazzCash</option><option>EasyPaisa</option><option>Cheque</option></select></label>
              <label className="text-xs font-bold">Delivery Status<select value={purchaseForm.delivery_status} onChange={(e) => setPurchaseForm({ ...purchaseForm, delivery_status: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5"><option>Not Delivered</option><option>In Transit</option><option>Delivered</option></select></label>
              <label className="text-xs font-bold sm:col-span-2">
                Notes
                <textarea
                  rows="2"
                  value={purchaseForm.notes}
                  onChange={(e) =>
                    setPurchaseForm({ ...purchaseForm, notes: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border p-2.5"
                />
              </label>
            </div>
            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-right text-sm font-black">
              Total: Rs{" "}
              {(
                Number(purchaseForm.quantity || 0) *
                Number(purchaseForm.unit_cost || 0)
              ).toLocaleString("en-PK")}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPurchaseForm(null)}
                className="rounded-xl border px-4 py-2 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                Save Purchase
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
