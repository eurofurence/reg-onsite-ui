import type { AuthGroupValue } from "@/types/internal/convention";

export type NavLink =
  | { kind: "internal"; path: string }
  | { kind: "url"; url: URL };

export interface NavItem {
  label: string;
  sublabel?: string;
  icon: string;
  authGroups?: AuthGroupValue[];
  link: NavLink;
}

export interface NavFieldset {
  legend: string;
  authGroups?: AuthGroupValue[];
  items: NavItem[];
}
