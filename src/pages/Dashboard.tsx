import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { JobApplication, ApplicationStatus } from "../types/application";
import type { Session } from "@supabase/supabase-js";
import { Link } from "react-router-dom";

type DashboardProps = {
  session: Session;
};

function Dashboard({ session }: DashboardProps) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"All" | ApplicationStatus>(
    "All"
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching:", error);
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
        }));
        setApplications(mapped);
      }
      setLoading(false);
    };

    fetchApplications();
  }, []);

  const handleClearFilters = () => {
    setFilterStatus("All");
    setSearch("");
  };

  const filtered = applications
    .filter((app) => filterStatus === "All" || app.status === filterStatus)
    .filter((app) =>
      `${app.company} ${app.position}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  const byStatus = (status: ApplicationStatus) =>
    filtered.filter((app) => app.status === status);

  const statusStrip: Array<{ status: ApplicationStatus; label: string }> = [
    { status: "Saved", label: "Saved" },
    { status: "Applied", label: "Applied" },
    { status: "Interview", label: "Interview" },
    { status: "Offer", label: "Offer" },
    { status: "Rejected", label: "Rejected" },
  ];

  if (loading) {
    return <p style={{ padding: 24 }}>Loading...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>My Applications</h2>
        <p>Track and manage your job search pipeline</p>
      </div>

      {/* Status Strip */}
      <div className="status-strip">
        {statusStrip.map(({ status, label }) => (
          <button
            key={status}
            type="button"
            className={`status-strip-item ${
              filterStatus === status ? "active" : ""
            }`}
            onClick={() =>
              setFilterStatus(filterStatus === status ? "All" : status)
            }
          >
            <span className="status-strip-count">
              {byStatus(status).length}
            </span>
            <span className="status-strip-label">{label}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="card toolbar">
        <div className="toolbar-left">
          <div className="toolbar-search">
            <span className="toolbar-search-icon">🔍</span>
            <input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter jobs..."
            />
          </div>

          <select
            id="filterStatus"
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "All" | ApplicationStatus)
            }
            style={{ width: "160px" }}
          >
            <option value="All">All statuses</option>
            <option value="Saved">Saved</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>

          {(filterStatus !== "All" || search) && (
            <button onClick={handleClearFilters} className="clear-btn">
              Clear
            </button>
          )}
        </div>

        <Link to="/new" className="btn btn-primary">
          + New Application
        </Link>
      </div>

      {/* List */}
      <div className="card list-view">
        <table className="app-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Position</th>
              <th>Status</th>
              <th>Work type</th>
              <th>Salary</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((app) => (
              <tr key={app.id}>
                <td>{app.company}</td>
                <td>{app.position}</td>
                <td>
                  <span className={`status status-${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                </td>
                <td>{app.workType ?? "—"}</td>
                <td>{app.salary || "—"}</td>
                <td>
                  {app.status === "Saved"
                    ? app.applicationDeadline
                    : app.dateApplied}
                </td>
                <td>
                  <Link to={`/edit/${app.id}`} className="action-link">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
