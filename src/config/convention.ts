import {
  conventionSettingsForEF,
  type ConventionGoodieTypesForEF,
} from "@/config/convention/eurofurence/convention";

// this is the active convention configuration
export const currentConventionSettings = conventionSettingsForEF;

export type ConcreteGoodieValue = ConventionGoodieTypesForEF["concreteGoodieValue"];
export type GoodieConfig = ConventionGoodieTypesForEF["goodieConfig"];
export type AbstractGoodieValue = ConventionGoodieTypesForEF["abstractGoodieValue"];
export type AbstractGoodieWithVariantsValue = ConventionGoodieTypesForEF["abstractGoodieWithVariantsValue"];
export const metadataRecordForGoodies = currentConventionSettings.goodiesRecord;

export const conventionIterations = currentConventionSettings.iterations;
const [currentIteration] = conventionIterations;
if (currentIteration === undefined) {
  throw new Error("No convention iterations configured");
}
export const currentIterationSettings = currentIteration.settings;
export const currentIterationLabel = currentIteration.label;

export const currentInventorySubset = currentConventionSettings.inventory;
