import { useState } from "react";

const STATUSES = [
  { value: "pending", label: "Pending", color: "bg-yellow-500/10 text-yellow-600" },
  { value: "paid", label: "Paid", color: "bg-blue-500/10 text-blue-600" },
  { value: "preparing", label: "Preparing", color: "bg-indigo-500/10 text-indigo-600" },
  { value: "ready", label: "Ready", color: "bg-purple-500/10 text-purple-600" },
  { value: "delivered", label: "Delivered", color: "bg-green-500/10 text-green-600" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500/10 text-red-600" },
];

export default function StatusModal({ open, onClose, value, onChange }) {
  const [selected, setSelected] = useState(value ?? "pending");

  if (!open) return null;

  const handleSave = () => {
    onChange(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      
      {/* modal */}
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl p-5 animate-in fade-in zoom-in duration-200">

        {/* header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Update Order Status
          </h2>
          <p className="text-sm text-slate-500">
            Select the current state of this order
          </p>
        </div>

        {/* status list */}
        <div className="space-y-2">
          {STATUSES.map((s) => {
            const active = selected === s.value;

            return (
              <button
                key={s.value}
                onClick={() => setSelected(s.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition
                  ${active ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"}
                `}
              >
                <span className="text-sm text-slate-700">{s.label}</span>

                <span className={`text-xs px-2 py-1 rounded-full ${s.color}`}>
                  {s.value}
                </span>
              </button>
            );
          })}
        </div>

        {/* actions */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
