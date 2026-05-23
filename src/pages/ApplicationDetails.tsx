import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { JobApplication } from "../types/application";

function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<JobApplication | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("id", Number(id))
        .single();

      if (error) {
        console.error("Error fetching:", error);
        return;
      }

      setApplication({
        id: data.id,
        company: data.company,
        position: data.position,
        status: data.status,
        location: data.location,
        jobLink: data.job_link,
        salary: data.salary,
        dateApplied: data.date_applied,
      });
    };

    fetchApplication();
  }, [id]);

  if (!application) {
    return (
      <div className="not-found">
        <p>Application not found.</p>
        <button
          className="btn btn-secondary"
          style={{ marginTop: 12 }}
          onClick={() => navigate("/")}
        >
          ← Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Application Details</h2>
      </div>

      <div className="card details-card">
        <div className="details-company">{application.company}</div>
        <div className="details-position">{application.position}</div>
        <span className={`status status-${application.status.toLowerCase()}`}>
          {application.status}
        </span>

        {(application.location ||
          application.salary ||
          application.jobLink) && (
          <div style={{ marginTop: 16 }}>
            {application.location && (
              <div className="details-meta-row">
                <span className="details-meta-label">Location</span>
                <span>{application.location}</span>
              </div>
            )}
            {application.salary && (
              <div className="details-meta-row">
                <span className="details-meta-label">Salary</span>
                <span>{application.salary}</span>
              </div>
            )}
            {application.dateApplied && (
              <div className="details-meta-row">
                <span className="details-meta-label">Applied</span>
                <span>
                  {new Date(application.dateApplied).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </span>
              </div>
            )}
            {application.jobLink && (
              <div className="details-meta-row">
                <span className="details-meta-label">Job Link</span>
                <a
                  href={application.jobLink}
                  target="_blank"
                  rel="noreferrer"
                  className="job-link"
                >
                  ↗ View job posting
                </a>
              </div>
            )}
          </div>
        )}

        <div className="details-actions">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/edit/${application.id}`)}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApplicationDetails;
