import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function Layout() {
  const location = useLocation();
  // The home page runs its hero edge to edge, so it manages its own
  // content width instead of sitting in the standard page column.
  const fullBleed = location.pathname === "/";

  return (
    <div className="app-shell">
      <Navbar />
      <main className={fullBleed ? "app-main app-main--bleed" : "app-main"}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
