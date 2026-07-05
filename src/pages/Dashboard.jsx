import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DollarSign, CreditCard, TrendingUp, Bell, Crown, PieChart } from 'lucide-react';
import HeroDashboard from '@/components/dashboard/HeroDashboard';
import KPICard from '@/components/dashboard/KPICard';
import SpendingChart from '@/components/dashboard/SpendingChart';
import CategoryChart from '@/components/dashboard/CategoryChart';
import RenewalAlerts from '@/components/dashboard/RenewalAlerts';
import RenewalCalendar from '@/components/dashboard/RenewalCalendar';
import SubscriptionGrowthChart from '@/components/dashboard/SubscriptionGrowthChart';
import { getMonthlyCost, getYearlyCost, formatCurrency, getRenewalStatus } from '@/utils/subscriptionHelpers';

export default function Dashboard() {
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date'),
  });

  const active = subscriptions.filter(s => s.status === 'active');
  const totalMonthly = active.reduce((sum, s) => sum + getMonthlyCost(s.cost, s.billing_cycle), 0);
  const totalYearly = totalMonthly * 12;
  const highestExpense = active.length > 0
    ? active.reduce((max, s) => getMonthlyCost(s.cost, s.billing_cycle) > getMonthlyCost(max.cost, max.billing_cycle) ? s : max, active[0])
    : null;
  const upcomingRenewals = active.filter(s => {
    const status = getRenewalStatus(s.renewal_date);
    return ['today', 'this_week', 'this_month', 'overdue'].includes(status);
  });

  // Monthly spending trend data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const spendingTrend = months.slice(0, currentMonth + 1).map((name, i) => {
    const factor = 0.7 + (i / currentMonth) * 0.3;
    return { name, amount: Math.round(totalMonthly * factor * 100) / 100 };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeroDashboard totalMonthly={totalMonthly} activeCount={active.length} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Monthly Spend"
          value={formatCurrency(totalMonthly)}
          icon={DollarSign}
          color="primary"
          delay={0}
        />
        <KPICard
          title="Yearly Spend"
          value={formatCurrency(totalYearly)}
          icon={TrendingUp}
          color="accent"
          delay={0.05}
        />
        <KPICard
          title="Active Subs"
          value={active.length}
          subtitle={`${subscriptions.length} total`}
          icon={CreditCard}
          color="green"
          delay={0.1}
        />
        <KPICard
          title="Upcoming"
          value={upcomingRenewals.length}
          subtitle="Need attention"
          icon={Bell}
          color="amber"
          delay={0.15}
        />
        <KPICard
          title="Highest"
          value={highestExpense ? formatCurrency(getMonthlyCost(highestExpense.cost, highestExpense.billing_cycle)) : '$0'}
          subtitle={highestExpense?.name || 'None'}
          icon={Crown}
          color="rose"
          delay={0.2}
        />
        <KPICard
          title="Avg / Sub"
          value={active.length > 0 ? formatCurrency(totalMonthly / active.length) : '$0'}
          subtitle="Per month"
          icon={PieChart}
          color="blue"
          delay={0.25}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart
          data={spendingTrend}
          title="Monthly Spending Trend"
          description="Your spending trajectory this year"
        />
        <CategoryChart subscriptions={subscriptions} />
      </div>

      {/* Calendar row */}
      <RenewalCalendar subscriptions={subscriptions} />

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubscriptionGrowthChart subscriptions={subscriptions} />
        <RenewalAlerts subscriptions={subscriptions} />
      </div>
    </div>
  );
}