// ============================================================
// SuncityConnect — App Constants
// ============================================================

export const APP_NAME = 'SuncityConnect';
export const APP_DESCRIPTION = 'Smart Society Management System';

// Role labels
export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin (President/Manager)',
  user: 'Resident (निवासी)',
  guard: 'Guard (गार्ड)',
};

// Complaint status labels
export const COMPLAINT_STATUS_LABELS: Record<string, string> = {
  open: 'Open (खुला)',
  in_progress: 'In Progress (प्रगति में)',
  resolved: 'Resolved (हल)',
};

// Complaint status colors
export const COMPLAINT_STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
};

// Visitor type labels
export const VISITOR_TYPE_LABELS: Record<string, string> = {
  maid: 'Maid (कामवाली)',
  delivery: 'Delivery (डिलीवरी)',
  service: 'Service (सर्विस)',
  guest: 'Guest (मेहमान)',
};

// Visitor type icons (emoji for simplicity)
export const VISITOR_TYPE_ICONS: Record<string, string> = {
  maid: '🧹',
  delivery: '📦',
  service: '🔧',
  guest: '👤',
};

// Payment status labels
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending (बकाया)',
  paid: 'Paid (भुगतान हुआ)',
};

// Payment status colors
export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-800',
  paid: 'bg-green-100 text-green-800',
};

// Routes
export const ROUTES = {
  LOGIN: '/login',
  AUTH_CALLBACK: '/auth/callback',
  AUTH_VERIFY: '/auth/verify',
  ONBOARDING: '/onboarding',
  WAITING_APPROVAL: '/waiting-approval',
  DASHBOARD: '/dashboard',
  NOTICES: '/notices',
  COMPLAINTS: '/complaints',
  COMPLAINTS_NEW: '/complaints/new',
  VISITORS: '/visitors',
  STAFF: '/staff',
  PROFILE: '/profile',
  GUARD: '/guard',
  ADMIN: '/admin',
  ADMIN_NOTICES: '/admin/notices',
  ADMIN_COMPLAINTS: '/admin/complaints',
  ADMIN_STAFF: '/admin/staff',
  ADMIN_USERS: '/admin/users',
} as const;

// Public routes (no auth needed)
export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.AUTH_CALLBACK,
  ROUTES.AUTH_VERIFY,
];

// Routes that need auth but NOT approval
export const AUTH_ONLY_ROUTES = [
  ROUTES.WAITING_APPROVAL,
  ROUTES.ONBOARDING,
];
