import React from "react";
import { motion } from "framer-motion";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getCategoryColor,
  getCategoryLabel,
  formatCurrency,
  getRenewalStatus,
  getDaysUntilRenewal,
} from "@/utils/subscriptionHelpers";
import SubscriptionLogo from "@/components/subscriptions/SubscriptionLogo";
import { format, parseISO } from "date-fns";

export default function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  index = 0,
}) {
  const catColor = getCategoryColor(subscription.category);
  const renewalStatus = getRenewalStatus(subscription.renewal_date);
  const daysLeft = getDaysUntilRenewal(subscription.renewal_date);

  const statusBadge = {
    active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    inactive: "bg-muted text-muted-foreground border-border",
    cancelled: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="glass rounded-2xl p-5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <SubscriptionLogo
            name={subscription.name}
            color={subscription.color || catColor}
            size="md"
          />
          <div>
            <h3 className="font-semibold text-sm">{subscription.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0"
                style={{ borderColor: catColor + "40", color: catColor }}
              >
                {getCategoryLabel(subscription.category)}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 border ${statusBadge[subscription.status]}`}
              >
                {subscription.status}
              </Badge>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-strong">
            <DropdownMenuItem onClick={() => onEdit(subscription)}>
              <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(subscription)}
              className="text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold tracking-tight">
            {formatCurrency(subscription.cost)}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            /{subscription.billing_cycle}
          </p>
        </div>
        {subscription.renewal_date && (
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {format(parseISO(subscription.renewal_date), "MMM d")}
            </div>
            {daysLeft !== null && daysLeft >= 0 && (
              <p
                className={`text-[10px] font-medium mt-0.5 ${
                  daysLeft === 0
                    ? "text-amber-500"
                    : daysLeft <= 7
                      ? "text-blue-500"
                      : "text-muted-foreground"
                }`}
              >
                {daysLeft === 0 ? "Today" : `${daysLeft}d left`}
              </p>
            )}
          </div>
        )}
      </div>

      {subscription.notes && (
        <p className="text-xs text-muted-foreground mt-3 line-clamp-2 border-t border-border/50 pt-3">
          {subscription.notes}
        </p>
      )}
    </motion.div>
  );
}
