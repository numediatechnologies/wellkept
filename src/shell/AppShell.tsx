import { Link, NavLink, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">WK</span>
          <span>
            <strong>Well-Kept</strong>
            <small>Good condition. Fair price. Close to home.</small>
          </span>
        </Link>
        <nav className="nav">
          <NavLink to="/browse">Browse</NavLink>
          <NavLink to="/buyer-post/new">Post a request</NavLink>
          <NavLink to="/seller/listing/new">Sell an item</NavLink>
          <NavLink to="/alerts">Alerts</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
