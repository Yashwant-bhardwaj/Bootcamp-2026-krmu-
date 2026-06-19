export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'quarterly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';
export type Category =
  | 'Entertainment'
  | 'Music'
  | 'Productivity'
  | 'Education'
  | 'Fitness'
  | 'Shopping'
  | 'Cloud Services'
  | 'Other';

export interface Subscription {
  id: string;
  name: string;
  category: Category;
  monthlyCost: number;
  billingCycle: BillingCycle;
  renewalDate: string; // ISO date string
  status: SubscriptionStatus;
  description?: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface FilterOptions {
  search: string;
  category: Category | 'All';
  status: SubscriptionStatus | 'All';
  minCost: number;
  maxCost: number;
  sortBy: 'name' | 'cost' | 'renewalDate' | 'category';
  sortOrder: 'asc' | 'desc';
}
