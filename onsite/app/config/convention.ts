import type { ConventionSettings } from "@/types/internal/fields";

export const conventionSetupForEF: ConventionSettings = {
  maxRegNumber: 99999,
  minAge: 18,
  logoLink: "/ef_logo.png",
  idpDashboardLink: "https://identity.eurofurence.org/dashboard",
  privacyLink: "https://help.eurofurence.org/legal/privacy",
  imprintLink: "https://help.eurofurence.org/legal/imprint",
};

export const conventionSetup: ConventionSettings = conventionSetupForEF;
