import { convertListToMap } from "@/composables/collection_tools/convertListToMap";
import { getColorFromStyle } from "@/composables/colors/getColorFromStyle";
import { getColorVariants } from "@/composables/colors/getColorVariants";
import { ColorsPalette, type ColorsPaletteValue } from "@/config/theme";
import type {
  ColoredLabeledValue,
  ChartData,
  StatsConfig,
} from "@/types/internal";

function getValueCounts<ConfigValueType extends string>(
  valueList: ConfigValueType[]
): Map<ConfigValueType, number> {
  return valueList.reduce((counts, value) => {
    counts.set(value, (counts.get(value) || 0) + 1);
    return counts;
  }, new Map<ConfigValueType, number>());
}

export function getDiagramDataFromList<ConfigValueType extends string>(
  valueList: ConfigValueType[],
  configItems: Partial<ColoredLabeledValue<ConfigValueType>>[],
  config: StatsConfig
): ChartData {
  const valueCountMap: Map<ConfigValueType, number> = getValueCounts(valueList);
  const dataEntriesList: [ConfigValueType, number][] = Array.from(
    valueCountMap
  ).sort((item1: [ConfigValueType, number], item2: [ConfigValueType, number]) =>
    config?.sort == "label"
      ? `${item1[0]}`.localeCompare(`${item2[0]}`)
      : item2[1] - item1[1]
  );
  const uniqueValueList: ConfigValueType[] = dataEntriesList.map(
    ([value, _key]: [ConfigValueType, number]) => value
  );
  const valueCountList: number[] = dataEntriesList.map(
    ([_value, key]: [ConfigValueType, number]) => key
  );
  const castConfigItems: ColoredLabeledValue<ConfigValueType>[] = <
    ColoredLabeledValue<ConfigValueType>[]
  >configItems;
  const configMap: Map<
    ConfigValueType,
    ColoredLabeledValue<ConfigValueType>
  > = convertListToMap(castConfigItems);

  const labelList: string[] = uniqueValueList.map(
    (value: ConfigValueType) => configMap.get(value)?.label || value
  );
  const colorList: [string, string][] = uniqueValueList.map(
    (value: ConfigValueType) => {
      const [mainColor, altColor]: [ColorsPaletteValue, ColorsPaletteValue] =
        getColorVariants(
          configMap.get(value)?.color || config?.color || ColorsPalette.text
        );
      return [getColorFromStyle(mainColor), getColorFromStyle(altColor)];
    }
  );
  const backgroundColorList: string[] = colorList.map(
    (value: [string, string]) => value[0] || ColorsPalette.text
  );
  const hoverBackgroundColor: string[] = colorList.map(
    (value: [string, string]) => value[1] || ColorsPalette.text
  );
  return {
    labels: labelList,
    datasets: [
      {
        label: "Data",
        data: valueCountList,
        backgroundColor: backgroundColorList,
        hoverBackgroundColor: hoverBackgroundColor,
      },
    ],
  };
}
