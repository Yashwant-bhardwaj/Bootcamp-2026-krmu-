import { format, isToday, isThisWeek, isThisMonth, differenceInDays, parseISO } from 'date-fns';

export const CATEGORIES = [
  { value: 'entertainment', label: 'Entertainment', color: '#8b5cf6', icon: 'Tv' },
  { value: 'productivity', label: 'Productivity', color: '#3b82f6', icon: 'Zap' },
  { value: 'fitness', label: 'Fitness', color: '#10b981', icon: 'Heart' },
  { value: 'education', label: 'Education', color: '#f59e0b', icon: 'GraduationCap' },
  { value: 'utilities', label: 'Utilities', color: '#6366f1', icon: 'Settings' },
  { value: 'other', label: 'Other', color: '#8b8b8b', icon: 'MoreHorizontal' },
];

export const BILLING_CYCLES = [
  { value: 'weekly', label: 'Weekly', multiplier: 4.33 },
  { value: 'monthly', label: 'Monthly', multiplier: 1 },
  { value: 'quarterly', label: 'Quarterly', multiplier: 0.33 },
  { value: 'yearly', label: 'Yearly', multiplier: 1/12 },
];

export function getMonthlyCost(cost, cycle) {
  const cycleInfo = BILLING_CYCLES.find(b => b.value === cycle);
  return cost * (cycleInfo?.multiplier || 1);
}

export function getYearlyCost(cost, cycle) {
  return getMonthlyCost(cost, cycle) * 12;
}

export function getCategoryColor(category) {
  return CATEGORIES.find(c => c.value === category)?.color || '#8b8b8b';
}

export function getCategoryLabel(category) {
  return CATEGORIES.find(c => c.value === category)?.label || 'Other';
}

export function getRenewalStatus(dateStr) {
  if (!dateStr) return 'none';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  if (isToday(date)) return 'today';
  const days = differenceInDays(date, new Date());
  if (days < 0) return 'overdue';
  if (days <= 7) return 'this_week';
  if (days <= 30) return 'this_month';
  return 'upcoming';
}

export function getRenewalLabel(status) {
  const labels = {
    today: 'Renews Today',
    overdue: 'Overdue',
    this_week: 'This Week',
    this_month: 'This Month',
    upcoming: 'Upcoming',
    none: 'No Date',
  };
  return labels[status] || 'Unknown';
}

export function getDaysUntilRenewal(dateStr) {
  if (!dateStr) return null;
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return differenceInDays(date, new Date());
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export const POPULAR_SERVICES = [
  { name: 'Netflix', color: '#E50914', icon: 'Tv' },
  { name: 'Spotify', color: '#1DB954', icon: 'Music' },
  { name: 'YouTube Premium', color: '#FF0000', icon: 'Play' },
  { name: 'Disney+', color: '#113CCF', icon: 'Star' },
  { name: 'Adobe Creative Cloud', color: '#FF0000', icon: 'Palette' },
  { name: 'GitHub Pro', color: '#333', icon: 'Code' },
  { name: 'Notion', color: '#000', icon: 'FileText' },
  { name: 'Slack', color: '#4A154B', icon: 'MessageSquare' },
  { name: 'Figma', color: '#F24E1E', icon: 'PenTool' },
  { name: 'ChatGPT Plus', color: '#10A37F', icon: 'Bot' },
  { name: 'AWS', color: '#FF9900', icon: 'Cloud' },
  { name: 'Gym Membership', color: '#22c55e', icon: 'Heart' },
];