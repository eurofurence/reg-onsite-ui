import { resolveBadgeType } from "@/composables/badge/badgeTypeInheritance";
import { renderBadgeSvg } from "@/composables/print/badgeHtml";
import { printBadgePages } from "@/composables/print/printFrame";
import { badgeTypesRef, printSettingsRef } from "@/composables/services/badgeConfigStore";
import type { BadgeType } from "@/types/badgeType";
import { buildPageSizeCss, getOrientedPageDimensionsMm } from "@/types/printSettings";

export async function printSingleBadge(
  badgeType: BadgeType,
  fieldValues: Record<string, string>
): Promise<void> {
  const printSettings = printSettingsRef.value;
  const resolvedBadgeType = resolveBadgeType(badgeTypesRef.value, badgeType.id);
  const svg = await renderBadgeSvg(
    resolvedBadgeType,
    fieldValues,
    printSettings.cardWidthMm,
    printSettings.cardHeightMm,
    printSettings.dpi
  );
  const pages = printSettings.doubleSided ? [svg, svg] : [svg];
  const pageDimensions = getOrientedPageDimensionsMm(printSettings);
  await printBadgePages(
    pages,
    buildPageSizeCss(printSettings),
    pageDimensions.width,
    pageDimensions.height,
    printSettings.cardXMm,
    printSettings.cardYMm,
    printSettings.cardWidthMm,
    printSettings.cardHeightMm,
    printSettings.cardRotationDeg,
    printSettings.backSideRotated180,
    printSettings.cardBorderRadiusMm
  );
}
