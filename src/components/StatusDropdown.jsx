const statuses = [
  "submitted",
  "pending",
  "approved",
  "declined",
  "preparing",
  "on_delivery",
  "delivered",
  "closed",
];

export default function StatusDropdown({ value, onChange }) {

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
