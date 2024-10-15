import type { ConcreteGoodieValue } from "@/config/convention";

export interface ApiSponsorDeskAddInfo {
  pastItems: ConcreteGoodieValue[];
  reservedItems: ConcreteGoodieValue[];
  issuedItems: ConcreteGoodieValue[];
}
