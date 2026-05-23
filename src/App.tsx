import { NavLink, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NewApplication from "./pages/NewApplication";
import EditApplication from "./pages/EditApplication";
import ApplicationDetails from "./pages/ApplicationDetails";
import Wishlist from "./pages/Wishlist";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./pages/Auth";
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
  if (!session) {
    return <Auth />;
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="container navbar-inner">
          <NavLink to="/" className="navbar-brand">
            <div className="navbar-logo">AF</div>
            <span className="navbar-title">ApplyFlow</span>
          </NavLink>

          <nav className="navbar-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/wishlist"
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              Wishlist
            </NavLink>

            <NavLink to="/new" className="nav-link nav-link-primary">
              + New Application
            </NavLink>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => supabase.auth.signOut()}
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>

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
