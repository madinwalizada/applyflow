import { useEffect, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import DraggableCard from "../components/DraggableCard";
import KanbanColumn from "../components/KanbanColumn";
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
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

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
          applicationDeadline: item.application_deadline, // ← add this
        }));
        setApplications(mapped);
      }
      setLoading(false);
    };

    fetchApplications();
  }, []);

  const handleDeleteApplication = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this application?"))
      return;

    const { error } = await supabase.from("applications").delete().eq("id", id);

    if (error) {
      console.error("Error deleting:", error);
      return;
    }

    setApplications((prev) => prev.filter((app) => app.id !== id));
  };

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

  const kanbanCols: Array<{ status: ApplicationStatus; label: string }> = [
    { status: "Saved", label: "Saved" },
    { status: "Applied", label: "Applied" },
    { status: "Interview", label: "Interview" },
    { status: "Offer", label: "Offer" },
    { status: "Rejected", label: "Rejected" },
  ];

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over) return;
    if (active.id === over.id) return;

    const { error } = await supabase
      .from("applications")
      .update({ status: over.id })
      .eq("id", active.id);

    if (error) {
      console.error("Error updating status:", error);
      return;
    }

    setApplications((prev) =>
      prev.map((app) =>
        app.id === active.id
          ? { ...app, status: over.id as ApplicationStatus }
          : app
      )
    );
  };
  if (loading) {
    return <p style={{ padding: 24 }}>Loading...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>My Applications</h2>
        <p>Track and manage your job search pipeline</p>
      </div>

      {/* Toolbar */}
      <div className="card toolbar">
        <div className="toolbar-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Company or position…"
          />
        </div>

        <div className="toolbar-group">
          <label htmlFor="filterStatus">Status</label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "All" | ApplicationStatus)
            }
          >
            <option value="All">All statuses</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
            <option value="Saved">Saved</option>
          </select>
        </div>

        {(filterStatus !== "All" || search) && (
          <button onClick={handleClearFilters} className="clear-btn">
            Clear filters
          </button>
        )}
      </div>
      <div className="toolbar-group view-toggle-group">
        <label>View</label>
        <div className="view-toggle">
          <button
            type="button"
            className={viewMode === "board" ? "view-btn active" : "view-btn"}
            onClick={() => setViewMode("board")}
          >
            Board
          </button>
          <button
            type="button"
            className={viewMode === "list" ? "view-btn active" : "view-btn"}
            onClick={() => setViewMode("list")}
          >
            List
          </button>
        </div>
      </div>
      {/* Kanban */}
      {viewMode === "board" && (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="kanban-board">
            {kanbanCols.map(({ status, label }) => {
              const cards = byStatus(status);
              return (
                <KanbanColumn
                  key={status}
                  status={status}
                  label={label}
                  count={cards.length}
                >
                  {cards.length === 0 ? (
                    <p className="empty-column">No applications</p>
                  ) : (
                    cards.map((app) => (
                      <DraggableCard
                        key={app.id}
                        application={app}
                        onDelete={handleDeleteApplication}
                      />
                    ))
                  )}
                </KanbanColumn>
              );
            })}
          </div>
        </DndContext>
      )}

      {viewMode === "list" && (
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
                    <span
                      className={`status status-${app.status.toLowerCase()}`}
                    >
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
      )}
    </div>
  );
}

export default Dashboard;
