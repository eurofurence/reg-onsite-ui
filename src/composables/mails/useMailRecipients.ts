import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { attendeeService } from "@/composables/services/attendeeService";
import { isBulkMailRecipient } from "@/composables/services/mails/hasNoBulkMailFlag";
import { makeMailAttendeeEntry } from "@/composables/services/mails/mailEntryState";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { MailAttendeeEntry } from "@/types/internal/mails";
import {
  computed,
  ref,
  watch,
  type ComputedRef,
  type Ref,
} from "vue";

export interface MailRecipientsController {
  attendees: Ref<TransformedAttendeeInfo[]>;
  loading: Ref<boolean>;
  selected: Ref<TransformedAttendeeInfo[]>;
  entries: Ref<MailAttendeeEntry[]>;
  sampleAttendee: ComputedRef<TransformedAttendeeInfo | null>;
  eligibleCount: ComputedRef<number>;
  load: () => Promise<void>;
}

export function useMailRecipients(
  errorHandler: RestErrorHandler
): MailRecipientsController {
  const attendees: Ref<TransformedAttendeeInfo[]> = ref([]);
  const loading: Ref<boolean> = ref(true);
  const selected: Ref<TransformedAttendeeInfo[]> = ref([]);
  const entries: Ref<MailAttendeeEntry[]> = ref([]);

  const sampleAttendee: ComputedRef<TransformedAttendeeInfo | null> = computed(
    () => selected.value.find((attendee) => attendee.email) ?? null
  );

  const eligibleCount: ComputedRef<number> = computed(
    () => selected.value.filter(isBulkMailRecipient).length
  );

  function syncEntries(): void {
    const nextEmailToAttendee: Map<string, TransformedAttendeeInfo> =
      new Map<string, TransformedAttendeeInfo>();
    for (const attendee of selected.value) {
      if (!isBulkMailRecipient(attendee)) {
        continue;
      }
      if (!nextEmailToAttendee.has(attendee.email)) {
        nextEmailToAttendee.set(attendee.email, attendee);
      }
    }

    if (hasSameEmailSet(nextEmailToAttendee, entries.value)) {
      return;
    }

    const existingByEmail: Map<string, MailAttendeeEntry> = new Map<
      string,
      MailAttendeeEntry
    >(entries.value.map((entry: MailAttendeeEntry) => [entry.email, entry]));

    entries.value = Array.from(nextEmailToAttendee, ([email, attendee]) => {
      return existingByEmail.get(email) ?? makeMailAttendeeEntry(attendee);
    });
  }

  function hasSameEmailSet(
    nextEmailToAttendee: Map<string, TransformedAttendeeInfo>,
    currentEntries: readonly MailAttendeeEntry[]
  ): boolean {
    if (nextEmailToAttendee.size !== currentEntries.length) {
      return false;
    }
    for (const entry of currentEntries) {
      if (!nextEmailToAttendee.has(entry.email)) {
        return false;
      }
    }
    return true;
  }

  watch(selected, syncEntries);

  async function load(): Promise<void> {
    try {
      attendees.value =
        (await attendeeService.getAllAttendees(errorHandler, true)) ?? [];
    } finally {
      loading.value = false;
    }
  }

  return {
    attendees,
    loading,
    selected,
    entries,
    sampleAttendee,
    eligibleCount,
    load,
  };
}