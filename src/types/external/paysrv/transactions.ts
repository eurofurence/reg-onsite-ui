export interface ApiTransaction {
  transaction: {
    debitor_id: number;
    transaction_identifier: string;
    transaction_type: string;
    method: string;
    amount: {
      currency: "EUR";
      gross_cent: number;
      vat_rate: number;
    };
    comment: string;
    status: "tentative";
    payment_processor_information: any;
    payment_start_url: string;
    effective_date: string;
    status_history: any | null;
    reason: string;
  };
}
