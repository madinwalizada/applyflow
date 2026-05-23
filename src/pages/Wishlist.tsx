import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { WishlistItem } from "../types/application";
import type { Session } from "@supabase/supabase-js";

type WishlistProps = {
  session: Session;
};

function Wishlist({ session }: WishlistProps) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobLink, setJobLink] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWishlist = async () => {
      const { data, error } = await supabase
        .from("wishlist")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching wishlist:", error);
      } else {
        const mapped = (data || []).map((item) => ({
          id: item.id,
          jobLink: item.job_link,
          expiryDate: item.expiry_date,
        }));
        setItems(mapped);
      }
      setLoading(false);
    };

    fetchWishlist();
  }, [session.user.id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobLink.trim() || !expiryDate) {
      setError("Both job link and expiry date are required.");
      return;
    }

    setError("");

    const { data, error } = await supabase
      .from("wishlist")
      .insert({
        job_link: jobLink.trim(),
        expiry_date: expiryDate,
        user_id: session.user.id,
      })
      .select()
      .single();

    if (error) {
      setError("Something went wrong. Please try again.");
      console.error(error);
      return;
    }

    setItems((prev) => [
      { id: data.id, jobLink: data.job_link, expiryDate: data.expiry_date },
      ...prev,
    ]);

    setJobLink("");
    setExpiryDate("");
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Remove this item from wishlist?")) return;

    const { error } = await supabase.from("wishlist").delete().eq("id", id);

    if (error) {
      console.error("Error deleting:", error);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const isExpiringSoon = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days <= 3 && days >= 0;
  };

  const isExpired = (date: string) => {
    return new Date(date).getTime() < new Date().getTime();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return <p style={{ padding: 24 }}>Loading...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Wishlist</h2>
        <p>Save jobs you want to apply to later</p>
      </div>

      <form onSubmit={handleAdd} className="card form-card">
        {error && <div className="form-error">⚠ {error}</div>}

        <div className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="jobLink">Job Link</label>
            <input
              id="jobLink"
              type="url"
              value={jobLink}
              onChange={(e) => {
                setJobLink(e.target.value);
                if (error) setError("");
              }}
              placeholder="https://…"
            />
          </div>

          <div className="form-group">
            <label htmlFor="expiryDate">Apply Before</label>
            <input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => {
                setExpiryDate(e.target.value);
                if (error) setError("");
              }}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Add to Wishlist
          </button>
        </div>
      </form>

      {items.length === 0 ? (
        <div className="wishlist-empty">
          <p>No jobs saved yet. Add one above.</p>
        </div>
      ) : (
        <div className="wishlist-list">
          {items.map((item) => {
            const expired = isExpired(item.expiryDate);
            const expiringSoon = isExpiringSoon(item.expiryDate);

            return (
              <div
                key={item.id}
                className={`card wishlist-card ${
                  expired ? "wishlist-expired" : ""
                } ${expiringSoon ? "wishlist-expiring" : ""}`}
              >
                <div className="wishlist-card-top">
                  <a
                    href={item.jobLink}
                    target="_blank"
                    rel="noreferrer"
                    className="wishlist-link"
                  >
                    ↗ {getDomain(item.jobLink)}
                  </a>

                  {expired && (
                    <span className="wishlist-badge wishlist-badge-expired">
                      Expired
                    </span>
                  )}
                  {expiringSoon && (
                    <span className="wishlist-badge wishlist-badge-soon">
                      Expiring soon
                    </span>
                  )}
                </div>

                <p className="wishlist-date">
                  Apply before: {formatDate(item.expiryDate)}
                </p>

                <div className="actions">
                  <button
                    className="action-button"
                    onClick={() => handleDelete(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
