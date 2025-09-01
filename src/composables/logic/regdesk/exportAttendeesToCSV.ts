import type { TransformedAttendeeInfo } from "@/types/internal/attendee";

export function exportAttendeesToCSV(
  attendees: TransformedAttendeeInfo[]
): string {
  const headers = [
    "Id",
    "Nick",
    "First",
    "Last",
    "Fullname",
    "Street",
    "Zip",
    "City",
    "Email",
    "Country",
    "Languages",
    "Status",
    "Registr.",
    "Total",
    "Dues",
    "Type",
    "Sponsor",
    "NotParticipating",
    "Druck-Attendee",
    "Druck-Sponsor",
    "Druck-Guest",
    "Druck-SuperSponsor",
    "Druck-Staff",
    "Druck-Director",
    "Day",
    "Day-Mon",
    "Day-Tue",
    "Day-Wed",
    "Day-Thu",
    "Day-Fri",
    "Day-Sat",
    "Day-Sun",
    "Ultra-Sponsor",
  ];

  const rows = attendees.map((a) => {
    const packages = Object.fromEntries(
      (a.packages_list || []).map((p) => [p.name, p.count])
    );

    return [
      a.badge_id || a.id,
      a.nickname,
      a.first_name,
      a.last_name,
      a.transFullName,
      a.street ?? "",
      a.zip ?? "",
      a.city ?? "",
      a.email ?? "",
      a.transCountryName,
      (a.spoken_languages_list || []).join(","),
      a.status,
      a.birthday,
      ((a.total_dues || 0) / 100).toFixed(2),
      ((a.current_dues || 0) / 100).toFixed(2),
      a.transConRole,
      a.transSponsorChoice ?? "",
      !(a.flags_list || []).includes("terms-accepted") ? "x" : "",
      (a.flags_list || []).includes("terms-accepted") ? "x" : "",
      a.transSponsorChoice === "sponsor" ? "x" : "",
      (a.flags_list || []).includes("guest") ? "x" : "",
      a.transSponsorChoice === "sponsor2" ? "x" : "",
      (a.flags_list || []).includes("staff") ? "x" : "",
      (a.flags_list || []).includes("director") ? "x" : "",
      "day" in packages ? "x" : "",
      "day-mon" in packages ? "x" : "",
      "day-tue" in packages ? "x" : "",
      "day-wed" in packages ? "x" : "",
      "day-thu" in packages ? "x" : "",
      "day-fri" in packages ? "x" : "",
      "day-sat" in packages ? "x" : "",
      "day-sun" in packages ? "x" : "",
      false ? "x" : "",
    ];
  });

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")
    )
    .join("\n");

  return csv;
}
