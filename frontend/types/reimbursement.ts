export interface Category {
  id: 1;
  name: string;
  limit_per_month: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Reimbursement {
  id: string;
  user_id: number;
  category_id: number;
  title: string;
  description: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  receipt_path: string;
  approved_at: string;
  created_at: string;
  updated_at: string;
  deleted_at?: boolean;
  category?: Category | null;
  user?: User | null;
}
