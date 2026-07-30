export type ApplicationStatus = "Applied" | "Interview" | "Offer" | "Rejected";
export type WorkType = "Remote" | "Hybrid" | "On-site";

export type JobApplication = {
  id: number;
  company: string;
  position: string;
  status: ApplicationStatus;
  location: string;
  workType: WorkType | null;
  jobLink: string;
  salary: string;
  dateApplied: string;
};

export type WishlistItem = {
  id: number;
  jobLink: string;
  expiryDate: string;
};
