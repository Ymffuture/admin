import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";

// BUG FIX: old statuses (submitted, approved, declined, on_delivery, closed)
// don't exist in the backend OrderStatus enum.
// Correct values from utils/enums.py: pending, paid, preparing, ready, delivered, cancelled
const STATUSES = [
  { value: "pending",   label: "Pending",   color: "#d97706", bg: "#fffbeb" },
  { value: "paid",      label: "Paid",      color: "#2563eb", bg: "#eff6ff" },
  { value: "preparing", label: "Preparing", color: "#ea580c", bg: "#fff7ed" },
  { value: "ready",     label: "Ready",     color: "#7c3aed", bg: "#f5f3ff" },
  { value: "delivered", label: "Delivered", color: "#059669", bg: "#ecfdf5" },
  { value: "cancelled", label: "Cancelled", color: "#e11d48", bg: "#fff1f2" },
];

export default function StatusDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(value ?? "pending");
  const [tempValue, setTempValue] = useState(value ?? "pending");
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  const currentStatus = STATUSES.find((s) => s.value === selected) || STATUSES[0];

  useEffect(() => {
    setSelected(value ?? "pending");
    setTempValue(value ?? "pending");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)) {
        setIsOpen(false);
        setTempValue(selected);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, selected]);

  const handleEsc = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setTempValue(selected);
    }
  };

  const handleConfirm = () => {
    setSelected(tempValue);
    onChange(tempValue);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempValue(selected);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 hover:shadow-sm"
        style={{
          backgroundColor: currentStatus.bg,
          borderColor: currentStatus.color + "30",
          color: currentStatus.color,
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: currentStatus.color }}
        />
        {currentStatus.label}
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </button>

      {/* ChatGPT-Style Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={handleCancel}
          />

          {/* Modal Card */}
          <div
            ref={modalRef}
            className="relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{ animation: "modalIn 0.2s ease-out" }}
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Update Order Status
                </h3>
                <button
                  onClick={handleCancel}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Select a new status for this order.
              </p>
            </div>

            {/* Status Options */}
            <div className="px-3 pb-2">
              <div className="space-y-1">
                {STATUSES.map((status) => {
                  const isSelected = tempValue === status.value;
                  return (
                    <button
                      key={status.value}
                      onClick={() => setTempValue(status.value)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-150 group ${
                        isSelected
                          ? "bg-gray-50 border border-gray-200"
                          : "hover:bg-gray-50/50 border border-transparent"
                      }`}
                    >
                      {/* Status Dot */}
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-offset-2 transition-all"
                        style={{
                          backgroundColor: status.color,
                          ringColor: isSelected ? status.color : "transparent",
                        }}
                      />

                      {/* Label & Description */}
                      <div className="flex-1 min-w-0">
                        <span
                          className="block text-sm font-semibold"
                          style={{ color: status.color }}
                        >
                          {status.label}
                        </span>
                        <span className="block text-xs text-gray-400 mt-0.5">
                          {status.value === "pending" && "Order received, awaiting payment"}
                          {status.value === "paid" && "Payment confirmed"}
                          {status.value === "preparing" && "Kitchen is preparing the order"}
                          {status.value === "ready" && "Order is ready for pickup/delivery"}
                          {status.value === "delivered" && "Order has been delivered"}
                          {status.value === "cancelled" && "Order was cancelled"}
                        </span>
                      </div>

                      {/* Checkmark */}
                      {isSelected && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: status.color }}
                        >
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-5 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={tempValue === selected}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  tempValue === selected
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-gray-800 shadow-sm hover:shadow"
                }`}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
