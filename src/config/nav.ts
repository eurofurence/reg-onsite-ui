import { AuthGroups } from "@/types/internal/convention";
import type { NavFieldset } from "@/types/internal/nav";

export const navConfig: NavFieldset[] = [
  {
    legend: "Registration",
    authGroups: [AuthGroups.registration, AuthGroups.security, AuthGroups.director],
    items: [
      {
        label: "Registration Desk",
        icon: "pi pi-id-card",
        link: { kind: "internal", path: "/regdesk" },
      },
      {
        label: "Cashier Desk",
        icon: "pi pi-money-bill",
        authGroups: [AuthGroups.admin],
        link: { kind: "internal", path: "/cashierdesk" },
      },
      {
        label: "Quick Registration Desk",
        icon: "pi pi-bolt",
        link: { kind: "internal", path: "/quickregdesk" },
      },
      {
        label: "Quick Cashier Desk",
        icon: "pi pi-bolt",
        authGroups: [AuthGroups.admin],
        link: { kind: "internal", path: "/quickcashierdesk" },
      },
      {
        label: "Badge Management",
        icon: "pi pi-credit-card",
        authGroups: [AuthGroups.admin, AuthGroups.director],
        link: { kind: "internal", path: "/badge" },
      },
    ],
  },
  {
    legend: "Goodies",
    items: [
      {
        label: "Sponsor Desk",
        sublabel: "(First Day)",
        icon: "pi pi-heart-fill pr-2",
        authGroups: [AuthGroups.sponsorDesk, AuthGroups.director],
        link: { kind: "internal", path: "/sponsordesk" },
      },
      {
        label: "Con Store Desk",
        sublabel: "(In the DD)",
        icon: "pi pi-shopping-cart pr-2",
        authGroups: [AuthGroups.dealersDen, AuthGroups.director],
        link: { kind: "internal", path: "/constore" },
      },
      {
        label: "Shipping Form",
        icon: "pi pi-envelope",
        link: { kind: "internal", path: "/shipping" },
      },
      {
        label: "Item Management",
        icon: "pi pi-box pr-2",
        authGroups: [AuthGroups.dealersDen, AuthGroups.sponsorDesk, AuthGroups.director],
        link: { kind: "internal", path: "/items" },
      },
    ],
  },
  {
    legend: "Statistics",
    authGroups: [
      AuthGroups.dealersDen,
      AuthGroups.registration,
      AuthGroups.security,
      AuthGroups.director,
    ],
    items: [
      {
        label: "Statistics",
        icon: "pi pi-chart-line",
        link: { kind: "internal", path: "/stats" },
      },
    ],
  },
];
