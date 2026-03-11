export interface Entry {
    id: string;
    type: "SALE" | "CREDIT_SUPPLY" | "EXPENSE" | "PURCHASE" | "COLLECTION" | "LODGMENT";
    date: string;
    submittedBy: string;
    submittedAt: string;
    amount: number;
    product?: string;
    quantity?: number;
    details?: string;
    notes?: string;
    deletedAt?: string;
    rawDoc: any;
}
