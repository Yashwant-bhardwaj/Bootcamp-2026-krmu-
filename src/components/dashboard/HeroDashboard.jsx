import React from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/utils/subscriptionHelpers";

export default function HeroDashboard({ totalMonthly, activeCount, name }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="relative overflow-hidden rounded-3xl p-8 md:p-10"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-3xl" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-accent/10 rounded-3xl" />

      {/* Floating shapes */}
      <motion.div
        className="absolute top-6 right-6 w-24 h-24 rounded-full bg-primary/10 blur-2xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-6 left-1/2 w-32 h-32 rounded-full bg-accent/10 blur-2xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">SubTrack AI</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Welcome back{name ? `, ${name}` : ""}
        </h1>
        <p className="text-muted-foreground max-w-lg">
          Your financial overview at a glance. Track, manage, and optimize all
          your subscriptions in one place.
        </p>

        <div className="flex flex-wrap items-center gap-6 mt-8">
          <div className="glass rounded-2xl px-5 py-4">
            <p className="text-xs text-muted-foreground font-medium">
              Monthly Spend
            </p>
            <p className="text-2xl font-bold mt-0.5">
              {formatCurrency(totalMonthly)}
            </p>
          </div>
          <div className="glass rounded-2xl px-5 py-4">
            <p className="text-xs text-muted-foreground font-medium">
              Active Subscriptions
            </p>
            <p className="text-2xl font-bold mt-0.5">{activeCount}</p>
          </div>
          <div className="glass rounded-2xl px-5 py-4">
            <p className="text-xs text-muted-foreground font-medium">
              Yearly Projection
            </p>
            <p className="text-2xl font-bold mt-0.5">
              {formatCurrency(totalMonthly * 12)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
