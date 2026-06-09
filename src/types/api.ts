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
  amountPerPerson: number;
  dueDate: string;
  isClosed: boolean;
  createdAt: string;
  payments?: RentPayment[];
}

export interface RentPayment {
  id: string;
  rentCycleId: string;
  userId: string;
  hasPaid: boolean;
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
  message: string;
  isRead: boolean;
  createdAt: string;
}
