import { TShirtShape, type TShirtShapeValue } from "@/config/setupTShirtShapes";
import {
  type TShirtInfo,
  setupTShirtTypePlaceholder,
  setupTShirtTypes,
} from "@/config/setupTShirtTypes";

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
        children: setupTShirtTypes.filter(
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
