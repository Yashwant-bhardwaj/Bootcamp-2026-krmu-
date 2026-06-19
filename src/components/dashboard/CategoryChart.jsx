import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  getCategoryColor,
  getCategoryLabel,
  formatCurrency,
  getMonthlyCost,
} from "@/utils/subscriptionHelpers";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-xl px-4 py-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">{payload[0].name}</p>
        <p className="text-sm font-bold">
          {formatCurrency(payload[0].value)}/mo
        </p>
      </div>
    );
  }
  return null;
};

export default function CategoryChart({ subscriptions }) {
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "active",
  );

  const categoryData = {};
  activeSubscriptions.forEach((sub) => {
    const cat = sub.category || "other";
    const monthly = getMonthlyCost(sub.cost, sub.billing_cycle);
    categoryData[cat] = (categoryData[cat] || 0) + monthly;
  });

  const data = Object.entries(categoryData).map(([key, value]) => ({
    name: getCategoryLabel(key),
    value: Math.round(value * 100) / 100,
    color: getCategoryColor(key),
  }));

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold mb-2">Category Breakdown</h3>
        <p className="text-sm text-muted-foreground">
          No active subscriptions yet
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
      <div className="flex items-center gap-6">
        <div className="w-44 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2.5">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="text-sm font-medium">
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
