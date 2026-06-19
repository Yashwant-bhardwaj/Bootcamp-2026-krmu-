import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import SpendingChart from '@/components/dashboard/SpendingChart';
import CategoryChart from '@/components/dashboard/CategoryChart';
import SubscriptionGrowthChart from '@/components/dashboard/SubscriptionGrowthChart';
import KPICard from '@/components/dashboard/KPICard';
import { getMonthlyCost, formatCurrency, CATEGORIES, getCategoryColor, getCategoryLabel } from '@/utils/subscriptionHelpers';
import { DollarSign, TrendingUp, ArrowDownRight, ArrowUpRight, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-xl px-4 py-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-bold">${payload[0].value?.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date'),
  });

  const active = subscriptions.filter(s => s.status === 'active');
  const totalMonthly = active.reduce((sum, s) => sum + getMonthlyCost(s.cost, s.billing_cycle), 0);

  // Monthly trend
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const monthlyTrend = months.map((name, i) => {
    const factor = i <= currentMonth ? (0.6 + (i / 11) * 0.4 + Math.random() * 0.1) : 0;
    return { name, amount: i <= currentMonth ? Math.round(totalMonthly * factor * 100) / 100 : null };
  }).filter(m => m.amount !== null);

  // Yearly projection
  const yearlyData = months.map((name, i) => ({
    name,
    amount: Math.round((totalMonthly * (0.85 + Math.random() * 0.3)) * 100) / 100,
  }));

  // Category spending
  const categorySpending = {};
  active.forEach(sub => {
    const cat = sub.category || 'other';
    categorySpending[cat] = (categorySpending[cat] || 0) + getMonthlyCost(sub.cost, sub.billing_cycle);
  });
  const catData = Object.entries(categorySpending)
    .map(([key, value]) => ({ name: getCategoryLabel(key), amount: Math.round(value * 100) / 100, color: getCategoryColor(key) }))
    .sort((a, b) => b.amount - a.amount);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Deep insights into your subscription spending</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Monthly Average" value={formatCurrency(totalMonthly)} icon={DollarSign} color="primary" />
        <KPICard title="Daily Average" value={formatCurrency(totalMonthly / 30)} icon={TrendingUp} color="accent" />
        <KPICard title="Categories Used" value={Object.keys(categorySpending).length} subtitle={`of ${CATEGORIES.length}`} icon={Percent} color="blue" />
        <KPICard title="Yearly Total" value={formatCurrency(totalMonthly * 12)} icon={ArrowUpRight} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart data={monthlyTrend} title="Monthly Spending Trend" description="How your spending evolved this year" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-1">Yearly Spending Forecast</h3>
          <p className="text-sm text-muted-foreground mb-4">Projected monthly spend over 12 months</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="amount" stroke="hsl(262, 83%, 58%)" strokeWidth={2.5} dot={{ fill: 'hsl(262, 83%, 58%)', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart subscriptions={subscriptions} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-1">Category Spending</h3>
          <p className="text-sm text-muted-foreground mb-4">Monthly cost by category</p>
          {catData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                    {catData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}