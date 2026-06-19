import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/subscriptionHelpers";

export default function RenewalCalendar({ subscriptions }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  // Build map: date string -> subscriptions renewing that day
  const renewalMap = useMemo(() => {
    const map = {};
    subscriptions
      .filter((s) => s.status === "active" && s.renewal_date)
      .forEach((s) => {
        const d = format(parseISO(s.renewal_date), "yyyy-MM-dd");
        if (!map[d]) map[d] = [];
        map[d].push(s);
      });
    return map;
  }, [subscriptions]);

  const selectedRenewals = selectedDate
    ? renewalMap[format(selectedDate, "yyyy-MM-dd")] || []
    : [];

  const goPrev = () => setCurrentDate(subMonths(currentDate, 1));
  const goNext = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Renewal Calendar</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <button
            onClick={goNext}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="text-center text-[10px] text-muted-foreground font-medium py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells */}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const renewals = renewalMap[dateKey] || [];
          const hasRenewal = renewals.length > 0;
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const today = isToday(day);

          return (
            <button
              key={dateKey}
              onClick={() => setSelectedDate(isSelected ? null : day)}
              className={`
                relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs
                transition-all duration-200
                ${today ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}
                ${isSelected ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-secondary"}
                ${hasRenewal && !isSelected ? "font-semibold" : ""}
              `}
            >
              <span className="text-xs">{format(day, "d")}</span>
              {hasRenewal && (
                <div className="flex gap-0.5 mt-0.5">
                  {renewals.slice(0, 3).map((s, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-primary-foreground" : ""}`}
                      style={{
                        backgroundColor: isSelected
                          ? undefined
                          : s.color || "#6366f1",
                      }}
                    />
                  ))}
                  {renewals.length > 3 && (
                    <span
                      className={`text-[8px] leading-none ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}
                    >
                      +{renewals.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date details */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {format(selectedDate, "EEEE, MMMM d")}
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {selectedRenewals.length} renewal
                  {selectedRenewals.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              {selectedRenewals.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No renewals on this date
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedRenewals.map((sub, i) => (
                    <motion.div
                      key={sub.id || i}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: sub.color || "#6366f1" }}
                        >
                          {sub.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{sub.name}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">
                            {sub.billing_cycle}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold">
                        {formatCurrency(sub.cost)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
