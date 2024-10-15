export type IdpGroupId = Branded<string, "IdpGroupId">;

export interface ApiFrontendUserInfo {
  audiences: string[];
  subject: string;
  name: string;
  email: string;
  email_verified: boolean;
  groups: IdpGroupId[];
}
