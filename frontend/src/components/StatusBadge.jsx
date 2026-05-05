export default function StatusBadge({ status }) {
  const colors = {
    Placed: "gray",
    Received: "blue",
    "In-Process": "yellow",
    Ready: "green",
    Delivered: "purple",
    Cancelled: "red",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded bg-${colors[status]}-200`}>
      {status}
    </span>
  );
}
