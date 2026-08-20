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

  // Revenue vs expense data from saved orders and expenses.
  const monthKeys = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index), 1);
    return { key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`, month: date.toLocaleString('en-US', { month: 'short' }) };
  });
  const chartData = monthKeys.map(({ key, month }) => ({
    month,
    revenue: orders.filter((order) => { const date = new Date(order.orderDate || order.created_at); return !Number.isNaN(date.getTime()) && `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === key; }).reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    expenses: (finance.expensesList || []).filter((expense) => String(expense.date || '').startsWith(key)).reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
  }));

  // Category share based on actual sold order items.
  const productById = new Map(products.map((product) => [String(product.id), product]));
  const categoryTotals = orders.reduce((result, order) => {
    (order.products || []).forEach((item) => {
      const product = productById.get(String(item.id));
      const name = product?.category || item.category || 'Uncategorized';
      result[name] = (result[name] || 0) + (Number(item.qty || 1) * Number(item.price || 0));
    });
    return result;
  }, {});
  const categoryColors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];
  const categoryTotal = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);
  const categoryPieData = Object.entries(categoryTotals).map(([name, value], index) => ({
    name,
    value: categoryTotal ? Math.round((value / categoryTotal) * 100) : 0,
    color: categoryColors[index % categoryColors.length]
  })).filter((item) => item.value > 0).sort((a, b) => b.value - a.value).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* 8 Primary KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`Rs ${totalRevenue.toLocaleString('en-PK')}`}
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
          value={`Rs ${totalExpenses.toLocaleString('en-PK')}`}
          trend="down"
          trendValue="Live"
          description="Saved expenses"
          icon={Receipt}
          accentColor="rose"
          onClick={() => setActiveTab('expenses')}
        />
        <StatCard
          title="Net Profit"
          value={`Rs ${netProfit.toLocaleString('en-PK')}`}
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
                <Tooltip formatter={(val) => [`Rs ${Number(val).toLocaleString('en-PK')}`, '']} />
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

    </div>
  );
};

export default DashboardView;
