// ============================================================
// SuncityConnect — TypeScript Types
// ============================================================

export type UserRole = 'super_admin' | 'admin' | 'user' | 'guard';
export type PaymentStatus = 'pending' | 'paid';
export type ComplaintStatus = 'open' | 'in_progress' | 'resolved';
export type VisitorType = 'maid' | 'delivery' | 'service' | 'guest';

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  house_number: string | null;
  role: UserRole;
  is_approved: boolean;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  is_important: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  user_id: string;
  house_number: string;
  title: string;
  description: string | null;
  image_url: string | null;
  status: ComplaintStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: Pick<User, 'name' | 'email'>;
}

export interface Visitor {
  id: string;
  house_number: string;
  visitor_type: VisitorType;
  name: string | null;
  photo_url: string | null;
  entry_time: string;
  exit_time: string | null;
  recorded_by: string | null;
  created_at: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  created_by: string | null;
  created_at: string;
}
