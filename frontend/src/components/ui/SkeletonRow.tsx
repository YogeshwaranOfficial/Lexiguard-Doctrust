export default function SkeletonRow() {
  return (
    <tr>
      {[200, 120, 80, 100, 60].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}
