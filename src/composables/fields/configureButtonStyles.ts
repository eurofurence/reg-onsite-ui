import type { ColoredLabeledValue } from "@/types/internal/infos";
import { NoFlag, NoPackage } from "@/types/internal/missing";
import type { SelectButtonPassThroughMethodOptions } from "primevue/selectbutton";

const commonButtonStyle: string = `relative flex-auto inline-flex items-center justify-center gap-2 py-1 px-3
            rounded-md transition-colors duration-200
            p-checked:shadow-[0px_1px_2px_0px_rgba(0,0,0,0.02),0px_1px_2px_0px_rgba(0,0,0,0.04)]`;

const defaultButtonStyle: string = `dark:p-checked:bg-primary-500 p-checked:bg-primary-500`;

// FIXME Disable user interaction in appropriate places
export function getDisableInteractionOnActivePlaceholderValue(
  styleContext: SelectButtonPassThroughMethodOptions
): string {
  const disableInteraction: boolean =
    styleContext.context.active &&
    (styleContext.parent.state.d_value === NoFlag.no_flag ||
      styleContext.parent.state.d_value === NoPackage.no_package);
  return disableInteraction ? "pointer-events-none select-none" : "";
}

export function configureDefaultButtonStyle() {
  // If type does not have a color attribute, fall back and return a function that returns the string
  return function getButtonStyle(
    _styleContext: SelectButtonPassThroughMethodOptions
  ) {
    return `${commonButtonStyle} ${defaultButtonStyle}`;
  };
}

export function configureAnnotatedButtonStyles<Type extends string>(
  labeledValues: ColoredLabeledValue<Type>[]
) {
  return function getButtonStyle(
    styleContext: SelectButtonPassThroughMethodOptions
  ) {
    const matched: ColoredLabeledValue<Type> | undefined = labeledValues.find(
      (labeledValue) =>
        styleContext?.parent?.state?.d_value === labeledValue.value
    );
    if (matched) {
      return {
        class: `${commonButtonStyle} dark:p-checked:bg-${matched.color} p-checked:bg-${matched.color}`,
      };
    }
    return {
      class: `${commonButtonStyle} ${defaultButtonStyle}`,
    };
  };
}
