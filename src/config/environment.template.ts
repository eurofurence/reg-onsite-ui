import { AuthGroups } from "@/types/internal/convention";
import { EnvName, type EnvironmentSettings } from "@/types/internal/env";

export const defaultEnvironment: EnvironmentSettings = {
  envName: EnvName.dev,
  apiBaseUrl: new URL("https://.../api"),
  externalFieldsets: [
    {
      legend: "Dealer's Den",
      authGroups: [AuthGroups.dealersDen],
      items: [
        {
          label: "DD Checkin Desk",
          icon: "pi pi-palette",
          link: { kind: "url", url: new URL("https://.../frontdesk") },
        },
      ],
    },
    {
      legend: "Other Services",
      items: [
        {
          label: "Helper System",
          icon: "pi pi-briefcase",
          link: { kind: "url", url: new URL("https://.../helper") },
        },
        {
          label: "Live Stream",
          icon: "pi pi-video",
          link: { kind: "url", url: new URL("https://.../stream") },
        },
      ],
    },
  ],
};
