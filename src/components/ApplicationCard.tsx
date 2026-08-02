import { Link } from "react-router-dom";
import type { JobApplication } from "../types/application";

type ApplicationCardProps = {
  application: JobApplication;
  onDelete: (id: number) => void;
};

function ApplicationCard({ application, onDelete }: ApplicationCardProps) {
  const statusClass = `status status-${application.status.toLowerCase()}`;

  const deadline = application.applicationDeadline;
  const daysLeft = deadline
    ? Math.ceil(
        (new Date(deadline).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="card application-card">
      <div className="application-header">
        <h3>
          <Link to={`/applications/${application.id}`} className="company-link">
            {application.company}
          </Link>
        </h3>
        <span className={statusClass}>{application.status}</span>
      </div>

      <p className="application-position">{application.position}</p>

      {application.status === "Saved" && deadline && (
        <p className="application-meta">
          Apply before:{" "}
          {new Date(deadline).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          {daysLeft !== null && daysLeft < 0 && (
            <span className="wishlist-badge wishlist-badge-expired">
              Expired
            </span>
          )}
          {daysLeft !== null && daysLeft >= 0 && daysLeft <= 3 && (
            <span className="wishlist-badge wishlist-badge-soon">
              {daysLeft === 0 ? "Today!" : `${daysLeft}d left`}
            </span>
          )}
        </p>
      )}

      {application.location && (
        <p className="application-meta">Location: {application.location}</p>
      )}
      {application.workType && (
        <span
          className={`work-type-badge work-type-${application.workType
            .toLowerCase()
            .replace("-", "")}`}
        >
          {application.workType}
        </span>
      )}

      {application.salary && (
        <p className="application-meta">Salary: {application.salary}</p>
      )}
      {application.dateApplied && (
        <p className="application-meta">
          Applied:{" "}
          {new Date(application.dateApplied).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      )}

      {application.jobLink && (
        <a
          href={application.jobLink}
          target="_blank"
          rel="noreferrer"
          className="job-link"
        >
          View Job
        </a>
      )}
      <Link to={`/applications/${application.id}`} className="btn">
        View Details
      </Link>

      <div className="actions">
        <Link to={`/edit/${application.id}`} className="action-link">
          Edit
        </Link>
        <button
          className="action-button"
          onClick={() => onDelete(application.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default ApplicationCard;
