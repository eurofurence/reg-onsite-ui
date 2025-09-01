import { getPropertyFromCollection } from "@/composables/collection_tools/getPropertyFromCollection";
import { getDiagramDataFromList } from "@/composables/statistics/getDiagramDataFromList";
import type { ColoredLabeledValue } from "@/types/internal/infos";
import type { ChartData, StatsConfig } from "@/types/internal/statistics";

export function getStatsFromProperty<Type, ConfigValueType extends string>(
  inputData: Type[],
  key: keyof Type,
  configItems: Partial<ColoredLabeledValue<ConfigValueType>>[],
  config: StatsConfig
): ChartData {
  const propertyValueList: ConfigValueType[] = <ConfigValueType[]>(
    getPropertyFromCollection<Type>(inputData, key)
  );
  const valueList: ConfigValueType[] = (
    config?.flatten ? propertyValueList.flat() : propertyValueList
  ) as ConfigValueType[];
  if (config?.color === undefined) {
    return getDiagramDataFromList(valueList, configItems, config);
  } else {
    return getDiagramDataFromList(
      valueList,
      configItems.map((item: Partial<ColoredLabeledValue<ConfigValueType>>) => {
        return {
          ...item,
          ...{ color: config.color },
        };
      }),
      config
    );
  }
}
