export type RepairBranch = "regenerate" | "omni_edit";

export type RepairDiagnosis = {
  branch: RepairBranch;
  complaint: string;
  prompt: string;
  fallbackAction: string;
};
