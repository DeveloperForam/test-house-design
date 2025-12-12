export default function Sidebar({ setPage }) {
  return (
    <div className="sidebar">
      <h2>Admin Panel</h2>
      <ul>
        <li onClick={() => setPage("dashboard")}>Dashboard</li>
        <li onClick={() => setPage("projects")}>Projects</li>
        <li onClick={() => setPage("houses")}>Houses</li>
      </ul>
    </div>
  );
}
