import { AuthGroups } from "@/types/internal/convention";
import { EnvName, type EnvironmentSettings } from "@/types/internal/env";

export const defaultEnvironment: EnvironmentSettings = {
  envName: EnvName.dev,
  apiBaseUrl: new URL(import.meta.env.VITE_API_BASE_URL),
  externalFieldsets: [
    {
      legend: "Dealer's Den",
      authGroups: [AuthGroups.dealersDen],
      items: [
        {
          label: "DD Checkin Desk",
          icon: "pi pi-palette",
          link: { kind: "url", url: new URL("https://dealers.eurofurence.org/frontdesk") },
        },
      ],
    },
    {
      legend: "Other Services",
      items: [
        {
          label: "Critter System",
          icon: "pi pi-briefcase",
          link: { kind: "url", url: new URL("https://critter.eurofurence.org") },
        },
        {
          label: "Live Stream",
          icon: "pi pi-video",
          link: { kind: "url", url: new URL("https://stream.eurofurence.org") },
        },
      ],
    },
  ],
};
