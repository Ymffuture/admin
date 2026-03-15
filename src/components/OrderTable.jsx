import StatusDropdown from "./StatusDropdown";

// Custom Icons
const Icons = {
  Package: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  User: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  MapPin: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Calendar: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  ChevronRight: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Eye: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    pending:   "bg-amber-50 text-amber-700 border-amber-200",
    paid:      "bg-blue-50 text-blue-700 border-blue-200",
    preparing: "bg-orange-50 text-orange-700 border-orange-200",
    ready:     "bg-purple-50 text-purple-700 border-purple-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const labels = {
    pending:   "Pending",
    paid:      "Paid",
    preparing: "Preparing",
    ready:     "Ready",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  const icons = {
    pending:   "⏳",
    paid:      "💳",
    preparing: "👨‍🍳",
    ready:     "🎁",
    delivered: "✓",
    cancelled: "✕",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${styles[status] || styles.pending}`}>
      <span>{icons[status] || "●"}</span>
      {labels[status] || status}
    </span>
  );
};

// Order Row Component
const OrderRow = ({ order, onStatusChange, isEven }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr 
        className={`group transition-all duration-200 ${isEven ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 cursor-pointer`}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Order ID */}
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-500 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-600 transition-all">
              <Icons.Package className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono text-sm font-bold text-gray-900">#{order.id?.slice(-8).toUpperCase()}</p>
              <p className="text-xs text-gray-400">{order.items?.length || 0} items</p>
            </div>
          </div>
        </td>

        {/* User */}
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
              <Icons.User className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">User {order.user_id?.slice(-6).toUpperCase()}</p>
              <p className="text-xs text-gray-400">ID: ...{order.user_id?.slice(-4)}</p>
            </div>
          </div>
        </td>

        {/* Address */}
        <td className="px-4 py-4">
          <div className="flex items-start gap-2 max-w-[200px]">
            <Icons.MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 line-clamp-2" title={order.delivery_address}>
              {order.delivery_address || "No address provided"}
            </p>
          </div>
        </td>

        {/* Total */}
        <td className="px-4 py-4">
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">R{order.total_amount?.toFixed(2)}</p>
            <p className="text-xs text-gray-400">incl. delivery</p>
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
          <div className="flex items-center gap-2 text-gray-500">
            <Icons.Calendar className="w-4 h-4" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                {order.created_at ? new Date(order.created_at).toLocaleDateString("en-ZA", {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : "—"}
              </p>
              <p className="text-xs text-gray-400">
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
          <button 
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
            onClick={(e) => {
              e.stopPropagation();
              // View order details
            }}
          >
            <Icons.Eye className="w-5 h-5" />
          </button>
        </td>
      </tr>

      {/* Expanded Details Row */}
      {expanded && (
        <tr className="bg-blue-50/30">
          <td colSpan={7} className="px-4 py-4">
            <div className="rounded-xl bg-white border border-blue-100 p-4 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Icons.Package className="w-4 h-4 text-blue-600" />
                Order Details
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Subtotal</p>
                  <p className="font-semibold text-gray-900">R{(order.total_amount * 0.9)?.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Delivery</p>
                  <p className="font-semibold text-gray-900">R{(order.total_amount * 0.1)?.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Payment</p>
                  <p className="font-semibold text-gray-900">Cash on Delivery</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {order.items && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Items</p>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {item.quantity}
                        </span>
                        <span className="text-sm text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">R{item.price?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

import { useState } from "react";

export default function OrderTable({ orders, onStatusChange }) {
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  if (!orders?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icons.Package className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
        <p className="text-gray-500 text-center max-w-sm">Orders will appear here when customers place them.</p>
      </div>
    );
  }

  const sortedOrders = [...orders].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const modifier = sortDirection === 'asc' ? 1 : -1;
    return aVal > bVal ? modifier : -modifier;
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }) => (
    <span className={`ml-1 text-xs transition-transform ${sortField === field ? 'text-blue-600' : 'text-gray-300'}`}>
      {sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Live Orders
          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">{orders.length}</span>
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Sorted by {sortField.replace('_', ' ')}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
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
                  className={`px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider ${col.key ? 'cursor-pointer hover:text-gray-700 hover:bg-gray-100 transition-colors' : ''}`}
                >
                  <div className="flex items-center">
                    {col.label}
                    {col.key && <SortIcon field={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedOrders.map((order, index) => (
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
      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-sm text-gray-500">
        <p>Showing {orders.length} orders</p>
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}
