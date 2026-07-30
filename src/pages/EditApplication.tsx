import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ApplicationStatus, WorkType } from "../types/application";
import { supabase } from "../lib/supabase";

function EditApplication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("Applied");
  const [location, setLocation] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [salary, setSalary] = useState("");
  const [error, setError] = useState("");
  const [dateApplied, setDateApplied] = useState("");
  const [workType, setWorkType] = useState<WorkType | "">("");

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

      setCompany(data.company);
      setPosition(data.position);
      setStatus(data.status);
      setLocation(data.location || "");
      setJobLink(data.job_link || "");
      setSalary(data.salary || "");
      setDateApplied(data.date_applied || "");
      setWorkType(data.work_type || "");
    };

    fetchApplication();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!company.trim() || !position.trim()) {
      setError("Company and Position are required.");
      return;
    }

    setError("");

    const { error } = await supabase
      .from("applications")
      .update({
        company: company.trim(),
        position: position.trim(),
        status,
        location: location.trim(),
        job_link: jobLink.trim(),
        salary: salary.trim(),
        date_applied: dateApplied,
        work_type: workType || null,
      })
      .eq("id", Number(id));

    if (error) {
      setError("Something went wrong. Please try again.");
      console.error(error);
      return;
    }

    navigate("/");
  };

  return (
    <div>
      <div className="page-header">
        <h2>Edit Application</h2>
        <p>Update your job application details</p>
      </div>

      <form onSubmit={handleSubmit} className="card form-card">
        {error && <div className="form-error">⚠ {error}</div>}

        <div className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="company">
              Company <span className="required">*</span>
            </label>
            <input
              id="company"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="position">
              Position <span className="required">*</span>
            </label>
            <input
              id="position"
              value={position}
              onChange={(e) => {
                setPosition(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Remote, New York"
            />
          </div>

          <div className="form-group">
            <label htmlFor="workType">Work type</label>
            <select
              id="workType"
              value={workType}
              onChange={(e) => setWorkType(e.target.value as WorkType | "")}
            >
              <option value="">Not specified</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="salary">Salary</label>
            <input
              id="salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g. $120k–$150k"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateApplied">Date Applied</label>
            <input
              id="dateApplied"
              type="date"
              value={dateApplied}
              onChange={(e) => setDateApplied(e.target.value)}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="jobLink">Job Link</label>
            <input
              id="jobLink"
              type="url"
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
              placeholder="https://…"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
            >
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Update Application
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditApplication;
