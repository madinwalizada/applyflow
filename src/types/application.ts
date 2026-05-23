export type ApplicationStatus = "Applied" | "Interview" | "Offer" | "Rejected";

export type JobApplication = {
  id: number;
  company: string;
  position: string;
  status: ApplicationStatus;
  location: string;
  jobLink: string;
  salary: string;
  dateApplied: string;
};

export type WishlistItem = {
  id: number;
  jobLink: string;
  expiryDate: string;
};
