import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Store,
  TrendingUp,
  Receipt,
  PieChart as PieIcon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldAlert
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const DashboardView = () => {
  const {
    products,
    orders,
    customers,
    sellers,
    investors,
    categories,
    finance,
    notifications,
    dateRange,
    setActiveTab
  } = useAdmin();
  const [liveSummary, setLiveSummary] = React.useState(null);

  React.useEffect(() => {
    let active = true;
    fetch('/api/dashboard/summary', { headers: { 'x-user-role': 'Admin' } })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (active && data) setLiveSummary(data); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Date filtering logic multiplier for mock analytics simulation
  let multiplier = 1;
  if (dateRange === 'Today') multiplier = 0.15;
  if (dateRange === 'Last 7 Days') multiplier = 0.45;
  if (dateRange === 'This Year') multiplier = 2.8;

  // Key KPI Numbers
  const totalRevenue = Number(liveSummary?.orders?.revenue ?? finance.summary?.totalRevenue ?? orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0));
  const totalExpenses = Number((finance.expensesList || []).reduce((sum, expense) => sum + Number(expense.amount || 0), 0));
  const netProfit = totalRevenue - totalExpenses;
  const totalOrders = Number(liveSummary?.orders?.total ?? orders.length);
  const totalCustomers = customers.length;
  const totalProducts = Number(liveSummary?.products?.total ?? products.length);
  const totalSellers = sellers.length;
  const totalInvestors = investors.length;
  const pendingOrders = Number(liveSummary?.orders?.pending ?? orders.filter((order) => ['Pending', 'Processing'].includes(order.orderStatus)).length);
  const pendingSellers = sellers.filter((seller) => ['Pending', 'pending'].includes(seller.status)).length;
  const totalInvestment = investors.reduce((sum, investor) => sum + Number(investor.investmentAmount || investor.investment_amount || 0), 0);

  // Low stock products
  const lowStockItems = products.filter((p) => p.stock <= p.minStock);

  // Recent orders slice
  const recentOrders = orders.slice(0, 5);

  // Revenue vs Expense chart data
  const chartData = [];

  // Category sales pie data
  const categoryPieData = [];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-transparent p-0 text-slate-800 shadow-none flex flex-col md:flex-row items-start md:items-center justify-end gap-4">
        <div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('products')}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            + Add New Product
          </button>
        </div>
      </div>

      {/* 8 Primary KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          trend="up"
          trendValue={totalRevenue ? 'Live' : 'No sales'}
          description="From saved orders"
          icon={DollarSign}
          accentColor="emerald"
          onClick={() => setActiveTab('revenue')}
        />
        <StatCard
          title="Total Orders"
          value={totalOrders.toLocaleString()}
          trend="up"
          trendValue={`${pendingOrders} pending`}
          description="From saved orders"
          icon={ShoppingCart}
          accentColor="blue"
          onClick={() => setActiveTab('orders')}
        />
        <StatCard
          title="Total Customers"
          value={totalCustomers.toLocaleString()}
          trend="up"
          trendValue="Live"
          description="From customer records"
          icon={Users}
          accentColor="purple"
          onClick={() => setActiveTab('customers')}
        />
        <StatCard
          title="Total Products"
          value={totalProducts.toString()}
          trend="up"
          trendValue={`${categories.length} categories`}
          description="From catalog database"
          icon={Package}
          accentColor="indigo"
          onClick={() => setActiveTab('products')}
        />

        <StatCard
          title="Active Sellers"
          value={totalSellers.toString()}
          trend="up"
          trendValue={`${pendingSellers} pending`}
          description="From seller records"
          icon={Store}
          accentColor="amber"
          onClick={() => setActiveTab('sellers')}
        />
        <StatCard
          title="Total Investors"
          value={totalInvestors.toString()}
          trend="up"
          trendValue={`$${totalInvestment.toLocaleString()}`}
          description="Saved investment total"
          icon={TrendingUp}
          accentColor="purple"
          onClick={() => setActiveTab('investors')}
        />
        <StatCard
          title="Total Expenses"
          value={`$${totalExpenses.toLocaleString()}`}
          trend="down"
          trendValue="Live"
          description="Saved expenses"
          icon={Receipt}
          accentColor="rose"
          onClick={() => setActiveTab('expenses')}
        />
        <StatCard
          title="Net Profit"
          value={`$${netProfit.toLocaleString()}`}
          trend="up"
          trendValue={totalRevenue ? 'Live' : 'No revenue'}
          description="Revenue minus expenses"
          icon={DollarSign}
          accentColor="emerald"
          onClick={() => setActiveTab('revenue')}
        />
      </div>

      {/* Charts Section: Revenue vs Expenses & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue vs Expenses Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Revenue & Expense Growth</h3>
              <p className="text-xs text-slate-500 font-medium">Monthly revenue compared against operational costs</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500" /> Expenses</span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(val) => [`$${val.toLocaleString()}`, '']} />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expenses" stroke="#F43F5E" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category Pie Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Sales by Category</h3>
            <p className="text-xs text-slate-500 font-medium">Marketplace merchandise share</p>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
            {categoryPieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-slate-700 truncate">{item.name}</span>
                <span className="ml-auto font-black text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Low Stock Warnings & Recent Orders Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Low Stock Alerts</h3>
                <p className="text-[11px] text-slate-500 font-medium">{lowStockItems.length} items need restock</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('stock')}
              className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
            >
              Manage Stock
            </button>
          </div>

          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">All products well stocked.</p>
            ) : (
              lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0 border" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500">Seller: {item.seller}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-black block">
                      {item.stock} left
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">Min: {item.minStock}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Recent Marketplace Orders</h3>
              <p className="text-xs text-slate-500 font-medium">Latest transactions across multi-vendor stores</p>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All Orders <ArrowRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Seller Store</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-bold text-slate-900">{o.id}</td>
                    <td className="py-3">
                      <div>
                        <p className="font-bold text-slate-800">{o.customerName}</p>
                        <p className="text-[10px] text-slate-400">{o.customerEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-slate-700">{o.sellerName}</td>
                    <td className="py-3 font-black text-slate-900">${o.totalAmount}</td>
                    <td className="py-3">
                      <Badge status={o.orderStatus}>{o.orderStatus}</Badge>
                    </td>
                    <td className="py-3 text-right text-slate-400 font-semibold">{o.orderDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
