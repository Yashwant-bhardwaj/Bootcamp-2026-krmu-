import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, CalendarDays, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getRenewalStatus,
  getDaysUntilRenewal,
  formatCurrency,
  getCategoryColor,
} from "@/utils/subscriptionHelpers";
import SubscriptionLogo from "@/components/subscriptions/SubscriptionLogo";
import { format, parseISO } from "date-fns";

export default function RenewalAlerts({ subscriptions }) {
  const active = subscriptions.filter(
    (s) => s.status === "active" && s.renewal_date,
  );

  const today = active.filter(
    (s) => getRenewalStatus(s.renewal_date) === "today",
  );
  const thisWeek = active.filter(
    (s) => getRenewalStatus(s.renewal_date) === "this_week",
  );
  const thisMonth = active.filter(
    (s) => getRenewalStatus(s.renewal_date) === "this_month",
  );
  const overdue = active.filter(
    (s) => getRenewalStatus(s.renewal_date) === "overdue",
  );

  const alerts = [
    ...overdue.map((s) => ({ ...s, alertType: "overdue" })),
    ...today.map((s) => ({ ...s, alertType: "today" })),
    ...thisWeek.map((s) => ({ ...s, alertType: "this_week" })),
    ...thisMonth.map((s) => ({ ...s, alertType: "this_month" })),
  ];

  const alertConfig = {
    overdue: {
      label: "Overdue",
      color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      icon: AlertTriangle,
    },
    today: {
      label: "Today",
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: Clock,
    },
    this_week: {
      label: "This Week",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: CalendarDays,
    },
    this_month: {
      label: "This Month",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      icon: CalendarDays,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Upcoming Renewals</h3>
        <Badge variant="secondary" className="text-xs">
          {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {alerts.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No upcoming renewals
        </p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {alerts.slice(0, 8).map((alert, i) => {
            const config = alertConfig[alert.alertType];
            const Icon = config.icon;
            const days = getDaysUntilRenewal(alert.renewal_date);
            return (
              <motion.div
                key={alert.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <SubscriptionLogo
                    name={alert.name}
                    color={alert.color || getCategoryColor(alert.category)}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium">{alert.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.renewal_date
                        ? format(parseISO(alert.renewal_date), "MMM d, yyyy")
                        : "No date"}
                      {days !== null &&
                        ` · ${days < 0 ? Math.abs(days) + "d overdue" : days === 0 ? "today" : days + "d left"}`}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold">
                  {formatCurrency(alert.cost)}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
