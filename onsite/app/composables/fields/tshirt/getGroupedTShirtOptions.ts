import {
  TShirtShape,
  type TShirtShapeValue,
} from "@/config/metadata/tshirt/metadataForTShirtShapes";
import {
  type TShirtInfo,
  setupTShirtTypePlaceholder,
  metadataListForTShirtTypes,
} from "@/config/metadata/tshirt/metadataForTShirtTypes";

type FlexibleTShirtInfo = TShirtInfo | typeof setupTShirtTypePlaceholder;

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
        children: metadataListForTShirtTypes.filter(
          (tshirtInfo: FlexibleTShirtInfo) => tshirtInfo.shape == tshirtShape
        ),
      };
    }
  );
  return tshirtGroups.concat([
    {
      label: "-",
      children: [setupTShirtTypePlaceholder],
    },
  ]);
}
