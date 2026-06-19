import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Clock,
  CalendarDays,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import {
  getRenewalStatus,
  getDaysUntilRenewal,
  formatCurrency,
  getCategoryLabel,
  getCategoryColor,
} from "@/utils/subscriptionHelpers";
import { format, parseISO } from "date-fns";
import SubscriptionLogo from "@/components/subscriptions/SubscriptionLogo";

function RenewalItem({ subscription, index }) {
  const status = getRenewalStatus(subscription.renewal_date);
  const days = getDaysUntilRenewal(subscription.renewal_date);
  const catColor = getCategoryColor(subscription.category);

  const statusConfig = {
    overdue: {
      color: "text-rose-500 bg-rose-500/10",
      icon: AlertTriangle,
      label: "Overdue",
    },
    today: {
      color: "text-amber-500 bg-amber-500/10",
      icon: Clock,
      label: "Today",
    },
    this_week: {
      color: "text-blue-500 bg-blue-500/10",
      icon: CalendarDays,
      label: "This Week",
    },
    this_month: {
      color: "text-emerald-500 bg-emerald-500/10",
      icon: Calendar,
      label: "This Month",
    },
    upcoming: {
      color: "text-muted-foreground bg-muted",
      icon: CheckCircle2,
      label: "Upcoming",
    },
  };

  const config = statusConfig[status] || statusConfig.upcoming;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass rounded-xl p-4 flex items-center justify-between hover:shadow-lg hover:shadow-primary/5 transition-all"
    >
      <div className="flex items-center gap-3">
        <SubscriptionLogo
          name={subscription.name}
          color={subscription.color || catColor}
          size="sm"
        />
        <div>
          <p className="font-medium text-sm">{subscription.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">
              {getCategoryLabel(subscription.category)}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground capitalize">
              {subscription.billing_cycle}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold text-sm">
            {formatCurrency(subscription.cost)}
          </p>
          <p className="text-xs text-muted-foreground">
            {subscription.renewal_date
              ? format(parseISO(subscription.renewal_date), "MMM d, yyyy")
              : "No date"}
          </p>
        </div>
        <Badge className={`${config.color} border-0 text-xs`}>
          <Icon className="w-3 h-3 mr-1" />
          {days !== null
            ? days < 0
              ? `${Math.abs(days)}d ago`
              : days === 0
                ? "Today"
                : `${days}d`
            : config.label}
        </Badge>
      </div>
    </motion.div>
  );
}

export default function Renewals() {
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => base44.entities.Subscription.list("-created_date"),
  });

  const active = subscriptions.filter(
    (s) => s.status === "active" && s.renewal_date,
  );
  const sorted = [...active].sort((a, b) =>
    (a.renewal_date || "").localeCompare(b.renewal_date || ""),
  );

  const overdue = sorted.filter(
    (s) => getRenewalStatus(s.renewal_date) === "overdue",
  );
  const today = sorted.filter(
    (s) => getRenewalStatus(s.renewal_date) === "today",
  );
  const thisWeek = sorted.filter(
    (s) => getRenewalStatus(s.renewal_date) === "this_week",
  );
  const thisMonth = sorted.filter(
    (s) => getRenewalStatus(s.renewal_date) === "this_month",
  );
  const upcoming = sorted.filter(
    (s) => getRenewalStatus(s.renewal_date) === "upcoming",
  );

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
        <h2 className="text-2xl font-bold tracking-tight">Renewals</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track upcoming subscription renewals
        </p>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        {overdue.length > 0 && (
          <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 border">
            <AlertTriangle className="w-3 h-3 mr-1" /> {overdue.length} Overdue
          </Badge>
        )}
        {today.length > 0 && (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 border">
            <Clock className="w-3 h-3 mr-1" /> {today.length} Today
          </Badge>
        )}
        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 border">
          <CalendarDays className="w-3 h-3 mr-1" /> {thisWeek.length} This Week
        </Badge>
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 border">
          <Calendar className="w-3 h-3 mr-1" /> {thisMonth.length} This Month
        </Badge>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="glass">
          <TabsTrigger value="all">All ({sorted.length})</TabsTrigger>
          <TabsTrigger value="urgent">
            Urgent ({overdue.length + today.length})
          </TabsTrigger>
          <TabsTrigger value="week">This Week ({thisWeek.length})</TabsTrigger>
          <TabsTrigger value="month">
            This Month ({thisMonth.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-2 mt-4">
          {sorted.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-muted-foreground">
                No active subscriptions with renewal dates
              </p>
            </div>
          ) : (
            sorted.map((sub, i) => (
              <RenewalItem key={sub.id} subscription={sub} index={i} />
            ))
          )}
        </TabsContent>
        <TabsContent value="urgent" className="space-y-2 mt-4">
          {[...overdue, ...today].length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-muted-foreground">
                No urgent renewals — you're all caught up!
              </p>
            </div>
          ) : (
            [...overdue, ...today].map((sub, i) => (
              <RenewalItem key={sub.id} subscription={sub} index={i} />
            ))
          )}
        </TabsContent>
        <TabsContent value="week" className="space-y-2 mt-4">
          {thisWeek.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-muted-foreground">No renewals this week</p>
            </div>
          ) : (
            thisWeek.map((sub, i) => (
              <RenewalItem key={sub.id} subscription={sub} index={i} />
            ))
          )}
        </TabsContent>
        <TabsContent value="month" className="space-y-2 mt-4">
          {thisMonth.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-muted-foreground">No renewals this month</p>
            </div>
          ) : (
            thisMonth.map((sub, i) => (
              <RenewalItem key={sub.id} subscription={sub} index={i} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
