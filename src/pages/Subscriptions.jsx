import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import SubscriptionCard from '@/components/subscriptions/SubscriptionCard';
import SubscriptionForm from '@/components/subscriptions/SubscriptionForm';
import SubscriptionFilters from '@/components/subscriptions/SubscriptionFilters';
import { getMonthlyCost } from '@/utils/subscriptionHelpers';

export default function Subscriptions() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('recent');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Subscription.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({ title: 'Subscription added', description: 'Your subscription has been saved.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Subscription.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({ title: 'Subscription updated' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Subscription.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({ title: 'Subscription deleted', variant: 'destructive' });
    },
  });

  const handleSave = (data) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
    setEditing(null);
  };

  const handleEdit = (sub) => {
    setEditing(sub);
    setFormOpen(true);
  };

  const handleDelete = (sub) => {
    deleteMutation.mutate(sub.id);
  };

  const filtered = useMemo(() => {
    let result = [...subscriptions];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => s.name?.toLowerCase().includes(q));
    }
    if (category !== 'all') {
      result = result.filter(s => s.category === category);
    }
    if (status !== 'all') {
      result = result.filter(s => s.status === status);
    }

    switch (sort) {
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'cost_high':
        result.sort((a, b) => getMonthlyCost(b.cost, b.billing_cycle) - getMonthlyCost(a.cost, a.billing_cycle));
        break;
      case 'cost_low':
        result.sort((a, b) => getMonthlyCost(a.cost, a.billing_cycle) - getMonthlyCost(b.cost, b.billing_cycle));
        break;
      case 'renewal':
        result.sort((a, b) => (a.renewal_date || '').localeCompare(b.renewal_date || ''));
        break;
      case 'recent':
      default:
        break;
    }

    return result;
  }, [subscriptions, search, category, status, sort]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subscriptions</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage all your recurring payments</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Add New
        </Button>
      </div>

      <SubscriptionFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        status={status}
        onStatusChange={setStatus}
        sort={sort}
        onSortChange={setSort}
      />

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-lg font-medium mb-1">No subscriptions found</p>
          <p className="text-sm text-muted-foreground mb-4">
            {subscriptions.length === 0 ? 'Add your first subscription to get started.' : 'Try adjusting your filters.'}
          </p>
          {subscriptions.length === 0 && (
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Subscription
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((sub, i) => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                onEdit={handleEdit}
                onDelete={handleDelete}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <SubscriptionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        subscription={editing}
        onSave={handleSave}
      />
    </div>
  );
}