import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { mailService } from "@/composables/services/mailService";
import { extractMailTemplateVariables } from "@/composables/services/mails/getMailVariablesForAttendee";
import type { MailPreviewEntry, MailTemplate } from "@/types/internal/mails";
import {
  computed,
  ref,
  watch,
  type ComputedRef,
  type Ref,
} from "vue";

export interface CidOption {
  label: string;
  value: string;
}

export interface MailTemplatesController {
  templates: Ref<MailTemplate[]>;
  loading: Ref<boolean>;
  selectedCid: Ref<string>;
  selectedLang: Ref<string>;
  selectedTemplate: ComputedRef<MailTemplate | null>;
  previewTemplate: ComputedRef<MailTemplate | null>;
  cidOptions: ComputedRef<CidOption[]>;
  langOptions: ComputedRef<CidOption[]>;
  variableNames: Ref<string[]>;
  variableOverrides: Ref<Record<string, string>>;
  previewEntry: Ref<MailPreviewEntry | null>;
  previewVariables: ComputedRef<Record<string, string>>;
  previewLoading: Ref<boolean>;
  initializeSelection: (preferredLang: string | null, ready: boolean) => void;
  refreshPreview: (attendeeId: number | null) => Promise<void>;
  load: () => Promise<void>;
}

export function useMailTemplates(
  errorHandler: RestErrorHandler
): MailTemplatesController {
  const templates: Ref<MailTemplate[]> = ref([]);
  const loading: Ref<boolean> = ref(true);
  const selectedCid: Ref<string> = ref("");
  const selectedLang: Ref<string> = ref("");
  const variableNames: Ref<string[]> = ref([]);
  const variableOverrides: Ref<Record<string, string>> = ref({});
  const previewEntry: Ref<MailPreviewEntry | null> = ref(null);
  const previewLoading: Ref<boolean> = ref(false);
  let initializedSelection: boolean = false;

  const previewVariables: ComputedRef<Record<string, string>> = computed(
    () => previewEntry.value?.variables ?? {}
  );

  const selectedTemplate: ComputedRef<MailTemplate | null> = computed(() => {
    if (selectedCid.value === "") {
      return null;
    }
    return (
      templates.value.find(
        (template: MailTemplate) => template.cid === selectedCid.value
      ) ?? null
    );
  });

  const previewTemplate: ComputedRef<MailTemplate | null> = computed(() => {
    if (selectedCid.value === "") {
      return null;
    }
    return (
      templates.value.find(
        (template: MailTemplate) =>
          template.cid === selectedCid.value &&
          template.lang === selectedLang.value
      ) ?? selectedTemplate.value
    );
  });

  const cidOptions: ComputedRef<CidOption[]> = computed<CidOption[]>(() => {
    const seen: Set<string> = new Set<string>();
    const result: CidOption[] = [];
    for (const template of templates.value) {
      if (!seen.has(template.cid)) {
        seen.add(template.cid);
        result.push({ label: template.cid, value: template.cid });
      }
    }
    return result;
  });

  const langOptions: ComputedRef<CidOption[]> = computed<CidOption[]>(() => {
    const seen: Set<string> = new Set<string>();
    const result: CidOption[] = [];
    for (const template of templates.value) {
      if (template.cid === selectedCid.value && !seen.has(template.lang)) {
        seen.add(template.lang);
        result.push({ label: template.lang, value: template.lang });
      }
    }
    return result;
  });

  watch(
    selectedCid,
    (cid: string): void => {
      if (cid === "") {
        return;
      }
      const langsForCid: string[] = templates.value
        .filter((template: MailTemplate) => template.cid === cid)
        .map((template: MailTemplate) => template.lang);
      const firstLang: string | undefined = langsForCid[0];
      if (firstLang !== undefined && !langsForCid.includes(selectedLang.value)) {
        selectedLang.value = firstLang;
      }
    }
  );

  watch(
    selectedTemplate,
    (template: MailTemplate | null): void => {
      variableNames.value =
        template === null
          ? []
          : [
              ...new Set(
                templates.value
                  .filter(
                    (candidate: MailTemplate) =>
                      candidate.cid === template.cid
                  )
                  .flatMap((candidate: MailTemplate) =>
                    extractMailTemplateVariables(candidate)
                  )
              ),
            ];
      variableOverrides.value = {};
    },
    { immediate: true }
  );

  function initializeSelection(
    preferredLang: string | null,
    ready: boolean
  ): void {
    if (initializedSelection || !ready || templates.value.length === 0) {
      return;
    }
    const firstCid: string | undefined = cidOptions.value[0]?.value;
    if (firstCid !== undefined) {
      selectedCid.value = firstCid;
      const langsForCid: string[] = templates.value
        .filter((template: MailTemplate) => template.cid === firstCid)
        .map((template: MailTemplate) => template.lang);
      selectedLang.value =
        preferredLang !== null && langsForCid.includes(preferredLang)
          ? preferredLang
          : (langsForCid[0] ?? "");
    }
    initializedSelection = true;
  }

  async function refreshPreview(attendeeId: number | null): Promise<void> {
    if (attendeeId === null || previewTemplate.value === null) {
      previewEntry.value = null;
      return;
    }
    previewLoading.value = true;
    try {
      const result = await mailService.preview.resolve(errorHandler, {
        cid: previewTemplate.value.cid,
        lang: previewTemplate.value.lang,
        attendee_ids: [attendeeId],
        variables: { ...variableOverrides.value },
      });
      previewEntry.value = result?.recipients[0] ?? null;
    } finally {
      previewLoading.value = false;
    }
  }

  async function load(): Promise<void> {
    try {
      templates.value =
        (await mailService.templates.list(errorHandler)) ?? [];
    } finally {
      loading.value = false;
    }
  }

  return {
    templates,
    loading,
    selectedCid,
    selectedLang,
    selectedTemplate,
    previewTemplate,
    cidOptions,
    langOptions,
    variableNames,
    variableOverrides,
    previewEntry,
    previewVariables,
    previewLoading,
    initializeSelection,
    refreshPreview,
    load,
  };
}