import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CATEGORIES,
  BILLING_CYCLES,
  POPULAR_SERVICES,
} from "@/utils/subscriptionHelpers";
import { format } from "date-fns";
import { Sparkles } from "lucide-react";
import SubscriptionLogo from "@/components/subscriptions/SubscriptionLogo";

export default function SubscriptionForm({
  open,
  onOpenChange,
  subscription,
  onSave,
}) {
  const [form, setForm] = useState({
    name: "",
    cost: "",
    billing_cycle: "monthly",
    category: "other",
    renewal_date: format(new Date(), "yyyy-MM-dd"),
    status: "active",
    notes: "",
    color: "#6366f1",
    currency: "USD",
  });

  useEffect(() => {
    if (subscription) {
      setForm({
        name: subscription.name || "",
        cost: subscription.cost || "",
        billing_cycle: subscription.billing_cycle || "monthly",
        category: subscription.category || "other",
        renewal_date:
          subscription.renewal_date || format(new Date(), "yyyy-MM-dd"),
        status: subscription.status || "active",
        notes: subscription.notes || "",
        color: subscription.color || "#6366f1",
        currency: subscription.currency || "USD",
      });
    } else {
      setForm({
        name: "",
        cost: "",
        billing_cycle: "monthly",
        category: "other",
        renewal_date: format(new Date(), "yyyy-MM-dd"),
        status: "active",
        notes: "",
        color: "#6366f1",
        currency: "USD",
      });
    }
  }, [subscription, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.cost) return;
    onSave({
      ...form,
      cost: parseFloat(form.cost),
    });
    onOpenChange(false);
  };

  const applyTemplate = (service) => {
    setForm((prev) => ({
      ...prev,
      name: service.name,
      color: service.color,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {subscription ? "Edit Subscription" : "Add Subscription"}
          </DialogTitle>
        </DialogHeader>

        {!subscription && (
          <div className="mb-4">
            <Label className="text-xs text-muted-foreground mb-2 block">
              Quick Add
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SERVICES.slice(0, 6).map((service) => (
                <button
                  key={service.name}
                  type="button"
                  onClick={() => applyTemplate(service)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border border-border/50 hover:bg-secondary transition-colors"
                >
                  <SubscriptionLogo
                    name={service.name}
                    color={service.color}
                    size="sm"
                  />
                  {service.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Netflix"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={form.cost}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, cost: e.target.value }))
                }
                placeholder="9.99"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Billing Cycle</Label>
              <Select
                value={form.billing_cycle}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, billing_cycle: v }))
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_CYCLES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, category: v }))
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        {c.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, status: v }))
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="renewal_date">Renewal Date</Label>
              <Input
                id="renewal_date"
                type="date"
                value={form.renewal_date}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, renewal_date: e.target.value }))
                }
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="color">Brand Color</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  type="color"
                  id="color"
                  value={form.color}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  value={form.color}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className="flex-1"
                />
              </div>
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Optional notes..."
                className="mt-1.5 h-20 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              <Sparkles className="w-4 h-4 mr-2" />
              {subscription ? "Save Changes" : "Add Subscription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
