export interface Bank {
  id: string;
  name: string;
  code?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payroll {
  totalAmount: number;
  entries: Payment[];
}

export interface Payment {
  id?: string;
  memberId: string;
  bankId: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  status?: "PENDING" | "SENT" | "FAILED";
}