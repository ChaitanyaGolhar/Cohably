export type ApiResponse<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };
export interface ApiSuccessResponse<T> { success: true; data: T; }

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  membership?: Member | null;
}

export interface Flat {
  id: string;
  name: string;
  inviteCode: string;
  currency: string;
  createdBy: string;
  createdAt: string;
}

export interface Member {
  id: string;
  flatId: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  isActive: boolean;
  user?: User;
}

export interface Expense {
  id: string;
  flatId: string;
  paidBy: string;
  title: string;
  amount: number;
  category: 'FOOD' | 'GROCERIES' | 'UTILITIES' | 'RENT' | 'TRANSPORT' | 'OTHER';
  splitType: 'EQUAL' | 'CUSTOM';
  note: string | null;
  isDisputed: boolean;
  createdAt: string;
  updatedAt: string;
  payer?: User;
  splits?: Split[];
}

export interface Split {
  id: string;
  expenseId: string;
  userId: string;
  amountOwed: number;
  isSettled: boolean;
  user?: User;
}

export interface Settlement {
  id: string;
  flatId: string;
  fromUser: string;
  toUser: string;
  amount: number;
  method: string;
  note: string | null;
  settledAt: string;
  payer?: User;
  payee?: User;
}

export interface RentCycle {
  id: string;
  flatId: string;
  month: string;
  totalAmount: number;
  splitType: 'EQUAL' | 'CUSTOM';
  dueDate: string;
  isClosed: boolean;
  createdAt: string;
  payments?: RentPayment[];
}

export interface RentPayment {
  id: string;
  rentCycleId: string;
  userId: string;
  amountOwed: number;
  hasPaid: boolean;
  isApproved: boolean;
  paidAt: string | null;
  method: string | null;
  user?: User;
}

export interface Comment {
  id: string;
  expenseId: string;
  userId: string;
  message: string;
  createdAt: string;
  user?: User;
}

export interface Balance {
  userId: string;
  name: string;
  amount: number;
}

export interface MyBalances {
  youOwe: Balance[];
  owedToYou: Balance[];
  netTotal: number;
}

export interface Notification {
  id: string;
  userId: string;
  flatId: string;
  type: string;
  title: string;
  body: string;
  referenceId?: string;
  referenceType?: string;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCount {
  count: number;
}

export type RotationFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'ON_DEMAND';

export interface RotationCycle {
  id: string;
  rotationId: string;
  assignedTo: User;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'SKIPPED';
  dueDate: string;
  completedAt?: string;
  cycleNumber: number;
}

export interface Rotation {
  id: string;
  name: string;
  description?: string;
  frequency: RotationFrequency;
  frequencyDay?: number;
  isActive: boolean;
  currentCycle?: RotationCycle | null;
  memberCount: number;
}

export interface RotationMemberStat {
  userId: string;
  name: string;
  completionCount: number;
  isActive: boolean;
}

export interface RotationLog {
  id: string;
  userId: string;
  name: string;
  outcome: 'COMPLETED' | 'SKIPPED';
  loggedAt: string;
}

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  title: string;
  description?: string;
  createdBy: User;
  assignedTo: User | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
}

export type BillRecurrence = 'MONTHLY' | 'QUARTERLY' | 'BIANNUAL' | 'ANNUAL' | 'CUSTOM';

export interface BillReminder {
  id: string;
  title: string;
  category: 'FOOD' | 'GROCERIES' | 'UTILITIES' | 'RENT' | 'TRANSPORT' | 'OTHER';
  amountEstimate?: number;
  recurrence: BillRecurrence;
  recurrenceDay?: number;
  paymentUrl?: string;
  nextDueDate: string;
  responsibleMember: User | null;
  remindDaysBefore: number;
  isActive: boolean;
  lastTriggeredAt?: string;
}
