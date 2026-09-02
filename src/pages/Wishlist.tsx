import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { JobApplication } from "../types/application";
import type { Session } from "@supabase/supabase-js";

type WishlistProps = {
  session: Session;
};

function Wishlist({ session }: WishlistProps) {
  const [items, setItems] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSaved = async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "Saved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching saved jobs:", error);
      } else {
        const mapped = (data || []).map((item) => ({
          id: item.id,
          company: item.company,
          position: item.position,
          status: item.status,
          location: item.location,
          workType: item.work_type,
          jobLink: item.job_link,
          salary: item.salary,
          dateApplied: item.date_applied,
          applicationDeadline: item.application_deadline,
          resumeText: item.resume_text,
          jobDescription: item.job_description,
          matchScore: item.match_score,
          matchData: item.match_data,
        }));
        setItems(mapped);
      }
      setLoading(false);
    };

    fetchSaved();
  }, [session.user.id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!company.trim() || !position.trim() || !jobLink.trim()) {
      setError("Company, position, and job link are required.");
      return;
    }

    setError("");

    const { data, error } = await supabase
      .from("applications")
      .insert({
        user_id: session.user.id,
        company: company.trim(),
        position: position.trim(),
        status: "Saved",
        job_link: jobLink.trim(),
        application_deadline: deadline || null,
        location: "",
        salary: "",
        date_applied: null,
      })
      .select()
      .single();

    if (error) {
      setError("Something went wrong. Please try again.");
      console.error(error);
      return;
    }

    setItems((prev) => [
      {
        id: data.id,
        company: data.company,
        position: data.position,
        status: data.status,
        location: data.location,
        workType: data.work_type,
        jobLink: data.job_link,
        salary: data.salary,
        dateApplied: data.date_applied,
        applicationDeadline: data.application_deadline,
        resumeText: data.resume_text,
        jobDescription: data.job_description,
        matchScore: data.match_score,
        matchData: data.match_data,
      },
      ...prev,
    ]);

    setCompany("");
    setPosition("");
    setJobLink("");
    setDeadline("");
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Remove this saved job?")) return;

    const { error } = await supabase.from("applications").delete().eq("id", id);

    if (error) {
      console.error("Error deleting:", error);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
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
        <h2>Saved Jobs</h2>
        <p>Jobs you want to apply to later — also visible on your board</p>
      </div>

      <form onSubmit={handleAdd} className="card form-card">
        {error && <div className="form-error">⚠ {error}</div>}

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="company">Company</label>
            <input
              id="company"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Apple"
            />
          </div>

          <div className="form-group">
            <label htmlFor="position">Position</label>
            <input
              id="position"
              value={position}
              onChange={(e) => {
                setPosition(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Frontend Engineer"
            />
          </div>

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
            <label htmlFor="deadline">Apply Before</label>
            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Save Job
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
            const expired = item.applicationDeadline
              ? isExpired(item.applicationDeadline)
              : false;
            const expiringSoon = item.applicationDeadline
              ? isExpiringSoon(item.applicationDeadline)
              : false;

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
                    ↗ {item.company}
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

                <p className="application-position">{item.position}</p>

                {item.applicationDeadline && (
                  <p className="wishlist-date">
                    Apply before: {formatDate(item.applicationDeadline)}
                  </p>
                )}

                <div className="actions">
                  <Link to={`/edit/${item.id}`} className="action-link">
                    Edit
                  </Link>
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
