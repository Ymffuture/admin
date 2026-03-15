import { useState } from "react";
import { 
  Package, 
  User, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  Eye, 
  ArrowUpDown,
  Clock,
  CreditCard,
  Truck,
  CheckCircle2,
  XCircle,
  ChefHat,
  Gift,
  Printer,
  Download,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail
} from "lucide-react";
import StatusDropdown from "./StatusDropdown";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const configs = {
    pending:   { 
      bg: "bg-amber-50", 
      text: "text-amber-700", 
      border: "border-amber-200",
      icon: Clock,
      label: "Pending"
    },
    paid:      { 
      bg: "bg-blue-50", 
      text: "text-blue-700", 
      border: "border-blue-200",
      icon: CreditCard,
      label: "Paid"
    },
    preparing: { 
      bg: "bg-orange-50", 
      text: "text-orange-700", 
      border: "border-orange-200",
      icon: ChefHat,
      label: "Preparing"
    },
    ready:     { 
      bg: "bg-purple-50", 
      text: "text-purple-700", 
      border: "border-purple-200",
      icon: Gift,
      label: "Ready"
    },
    delivered: { 
      bg: "bg-emerald-50", 
      text: "text-emerald-700", 
      border: "border-emerald-200",
      icon: CheckCircle2,
      label: "Delivered"
    },
    cancelled: { 
      bg: "bg-rose-50", 
      text: "text-rose-700", 
      border: "border-rose-200",
      icon: XCircle,
      label: "Cancelled"
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

// Order Row Component
const OrderRow = ({ order, onStatusChange, isEven }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr 
        className={`group transition-all duration-200 ${isEven ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50/30 cursor-pointer border-b border-slate-100 last:border-b-0`}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Order ID */}
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-500 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-600 transition-all duration-300">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono text-sm font-bold text-slate-900">#{order.id?.slice(-8).toUpperCase()}</p>
              <p className="text-xs text-slate-400">{order.items?.length || 0} items</p>
            </div>
          </div>
        </td>

        {/* User */}
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">User {order.user_id?.slice(-6).toUpperCase()}</p>
              <p className="text-xs text-slate-400">ID: ...{order.user_id?.slice(-4)}</p>
            </div>
          </div>
        </td>

        {/* Address */}
        <td className="px-4 py-4">
          <div className="flex items-start gap-2 max-w-[200px]">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-600 line-clamp-2" title={order.delivery_address}>
              {order.delivery_address || "No address provided"}
            </p>
          </div>
        </td>

        {/* Total */}
        <td className="px-4 py-4">
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">R{order.total_amount?.toFixed(2)}</p>
            <p className="text-xs text-slate-400">incl. delivery</p>
          </div>
        </td>

        {/* Status */}
        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
          <StatusDropdown
            value={order.status}
            onChange={(s) => onStatusChange(order.id, s)}
          />
        </td>

        {/* Date */}
        <td className="px-4 py-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="w-4 h-4" />
            <div>
              <p className="text-sm font-medium text-slate-700">
                {order.created_at ? new Date(order.created_at).toLocaleDateString("en-ZA", {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : "—"}
              </p>
              <p className="text-xs text-slate-400">
                {order.created_at ? new Date(order.created_at).toLocaleTimeString("en-ZA", {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : ""}
              </p>
            </div>
          </div>
        </td>

        {/* Actions */}
        <td className="px-4 py-4 text-right">
          <div className="flex items-center justify-end gap-1">
            <button 
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              onClick={(e) => {
                e.stopPropagation();
                // View order details
              }}
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              className={`p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-300 ${expanded ? 'rotate-90' : ''}`}
              title="Expand"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded Details Row */}
      {expanded && (
        <tr className="bg-blue-50/20">
          <td colSpan={7} className="px-4 py-4">
            <div className="rounded-xl bg-white border border-blue-100 p-5 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  Order Details
                </h4>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                    <Printer className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Subtotal</p>
                  <p className="font-semibold text-slate-900">R{(order.total_amount * 0.9)?.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Delivery</p>
                  <p className="font-semibold text-slate-900">R{(order.total_amount * 0.1)?.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Payment</p>
                  <p className="font-semibold text-slate-900">Cash on Delivery</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Status</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {/* Items List */}
              {order.items && order.items.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Items</p>
                  <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
                    {order.items.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between px-4 py-3 ${idx !== order.items.length - 1 ? 'border-b border-slate-100' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {item.quantity}
                          </span>
                          <div>
                            <span className="text-sm font-medium text-slate-700">{item.name}</span>
                            {item.category && (
                              <span className="ml-2 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                {item.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-slate-900">R{(item.price * item.quantity)?.toFixed(2)}</span>
                          <p className="text-xs text-slate-400">R{item.price?.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Order Timeline</p>
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">Order placed</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                  <div className={`flex items-center gap-1.5 ${['paid', 'preparing', 'ready', 'delivered'].includes(order.status) ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <CreditCard className="w-4 h-4" />
                    <span className="font-medium">Payment</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                  <div className={`flex items-center gap-1.5 ${['preparing', 'ready', 'delivered'].includes(order.status) ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <ChefHat className="w-4 h-4" />
                    <span className="font-medium">Preparing</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                  <div className={`flex items-center gap-1.5 ${['ready', 'delivered'].includes(order.status) ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <Gift className="w-4 h-4" />
                    <span className="font-medium">Ready</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                  <div className={`flex items-center gap-1.5 ${order.status === 'delivered' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <Truck className="w-4 h-4" />
                    <span className="font-medium">Delivered</span>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default function OrderTable({ orders, onStatusChange }) {
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.delivery_address?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      return aVal > bVal ? modifier : -modifier;
    });

  if (!orders?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Package className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No orders found</h3>
        <p className="text-slate-500 text-center max-w-sm">Orders will appear here when customers place them.</p>
      </div>
    );
  }

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }) => (
    <ArrowUpDown className={`ml-1.5 w-3.5 h-3.5 transition-colors ${sortField === field ? 'text-blue-600' : 'text-slate-300'}`} />
  );

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, customers, or addresses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {[
              { key: 'all', label: 'All', count: statusCounts.all },
              { key: 'pending', label: 'Pending', count: statusCounts.pending },
              { key: 'preparing', label: 'Preparing', count: statusCounts.preparing },
              { key: 'ready', label: 'Ready', count: statusCounts.ready },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  statusFilter === key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
                <span className={`ml-1.5 text-xs ${statusFilter === key ? 'text-slate-500' : 'text-slate-400'}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Live Orders
            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs font-bold rounded-full">{filteredOrders.length}</span>
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Sorted by <span className="font-medium text-slate-700">{sortField.replace('_', ' ')}</span></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  { key: 'id', label: 'Order ID' },
                  { key: 'user_id', label: 'Customer' },
                  { key: 'delivery_address', label: 'Address' },
                  { key: 'total_amount', label: 'Total' },
                  { key: 'status', label: 'Status' },
                  { key: 'created_at', label: 'Date' },
                  { key: null, label: '' }
                ].map((col) => (
                  <th 
                    key={col.label || 'actions'}
                    onClick={() => col.key && toggleSort(col.key)}
                    className={`px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider ${col.key ? 'cursor-pointer hover:text-slate-700 hover:bg-slate-100 transition-colors' : ''}`}
                  >
                    <div className="flex items-center">
                      {col.label}
                      {col.key && <SortIcon field={col.key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <OrderRow 
                  key={order.id} 
                  order={order} 
                  onStatusChange={onStatusChange}
                  isEven={index % 2 === 0}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-sm text-slate-500">
          <p>Showing <span className="font-semibold text-slate-900">{filteredOrders.length}</span> of <span className="font-semibold text-slate-900">{orders.length}</span> orders</p>
          <div className="flex items-center gap-2">
            <span className="text-xs">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
