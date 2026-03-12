// BUG FIX: old statuses (submitted, approved, declined, on_delivery, closed)
// don't exist in the backend OrderStatus enum.
// Correct values from utils/enums.py: pending, paid, preparing, ready, delivered, cancelled
const STATUSES = [
  { value: "pending",   label: "Pending" },
  { value: "paid",      label: "Paid" },
  { value: "preparing", label: "Preparing" },
  { value: "ready",     label: "Ready" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function StatusDropdown({ value, onChange }) {
  return (
    <select
      value={value ?? "pending"}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded px-2 py-1 text-sm bg-white"
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
