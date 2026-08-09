import { NavLink, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NewApplication from "./pages/NewApplication";
import EditApplication from "./pages/EditApplication";
import ApplicationDetails from "./pages/ApplicationDetails";
import Wishlist from "./pages/Wishlist";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import type { Session } from "@supabase/supabase-js";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for login/logout changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <p style={{ padding: 24 }}>Loading…</p>;
  }

  // If not logged in, show auth page
  if (!session || window.location.pathname === "/reset-password") {
    return (
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Auth />} />
      </Routes>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="sidebar-brand">
          <div className="navbar-logo">AF</div>
          <span className="sidebar-title">ApplyFlow</span>
        </NavLink>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/wishlist"
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            Wishlist
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-profile">
            <div className="sidebar-avatar">
              {session.user.email?.[0].toUpperCase()}
            </div>
            <span className="sidebar-profile-name">{session.user.email}</span>
          </div>
          <button
            className="btn btn-secondary btn-sm sidebar-signout"
            onClick={() => supabase.auth.signOut()}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="page-content">
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard session={session} />} />
            <Route path="/new" element={<NewApplication session={session} />} />
            <Route path="/edit/:id" element={<EditApplication />} />
            <Route path="/applications/:id" element={<ApplicationDetails />} />
            <Route path="/wishlist" element={<Wishlist session={session} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
