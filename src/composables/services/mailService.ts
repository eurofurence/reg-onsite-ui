import { getMailTemplates } from "@/composables/api/backend/getMailTemplates";
import { postMassMail } from "@/composables/api/backend/postMassMail";
import { postMailPreview } from "@/composables/api/backend/postMailPreview";

interface MailService {
  templates: { list: typeof getMailTemplates };
  mails: { send: typeof postMassMail };
  preview: { resolve: typeof postMailPreview };
}

export const mailService: MailService = {
  templates: {
    list: getMailTemplates,
  },
  mails: {
    send: postMassMail,
  },
  preview: {
    resolve: postMailPreview,
  },
};
