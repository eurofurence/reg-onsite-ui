import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import {
  TShirtShape,
  type TShirtShapeValue,
} from "@/config/metadata/tshirt/metadataForTShirtShapes";
import {
  type TShirtInfo,
  metadataForTShirtTypePlaceholder,
} from "@/config/metadata/tshirt/metadataForTShirtTypes";

type FlexibleTShirtInfo = TShirtInfo | typeof metadataForTShirtTypePlaceholder;

interface TShirtGroup {
  label: string;
  children: FlexibleTShirtInfo[];
}

export function getGroupedTShirtOptions(): TShirtGroup[] {
  const tshirtShapeGroups: TShirtShapeValue[] = [
    TShirtShape.regular,
    TShirtShape.contoured,
  ];
  const tshirtGroups: TShirtGroup[] = tshirtShapeGroups.map(
    (tshirtShape: TShirtShapeValue) => {
      return {
        label: tshirtShape,
        children: getConventionSetup().metadata.forTShirtTypes.list.filter(
          (tshirtInfo: FlexibleTShirtInfo) => tshirtInfo.shape == tshirtShape
        ),
      };
    }
  );
  return tshirtGroups.concat([
    {
      label: "-",
      children: [metadataForTShirtTypePlaceholder],
    },
  ]);
}
