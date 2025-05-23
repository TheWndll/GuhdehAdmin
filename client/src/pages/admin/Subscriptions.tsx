import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Eye } from "lucide-react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Subscription, InsertSubscription } from "@shared/schema";

const SUBSCRIPTION_PLANS = {
  basic: { name: "Basic", price: 9.99, errands: 10 },
  premium: { name: "Premium", price: 19.99, errands: 25 },
  business: { name: "Business", price: 49.99, errands: 100 },
};

export default function Subscriptions() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState<Partial<InsertSubscription>>({
    userId: undefined,
    plan: "basic",
    status: "active",
    monthlyPrice: "9.99",
    errandsUsed: 0,
    errandsLimit: 10,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["/api/subscriptions"],
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (data: InsertSubscription) => {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create subscription");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "Subscription Created",
        description: "New subscription has been created successfully.",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create subscription.",
        variant: "destructive",
      });
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Subscription> }) => {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update subscription");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "Subscription Updated",
        description: "Subscription has been updated successfully.",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update subscription.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      userId: undefined,
      plan: "basic",
      status: "active",
      monthlyPrice: "9.99",
      errandsUsed: 0,
      errandsLimit: 10,
    });
    setIsCreating(false);
    setEditingSubscription(null);
  };

  const handlePlanChange = (plan: string) => {
    const planDetails = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];
    setFormData({
      ...formData,
      plan: plan as Subscription["plan"],
      monthlyPrice: planDetails.price.toString(),
      errandsLimit: planDetails.errands,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.plan) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingSubscription) {
      updateSubscriptionMutation.mutate({ id: editingSubscription.id, data: formData });
    } else {
      createSubscriptionMutation.mutate(formData as InsertSubscription);
    }
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      userId: subscription.userId,
      plan: subscription.plan,
      status: subscription.status,
      monthlyPrice: subscription.monthlyPrice,
      errandsUsed: subscription.errandsUsed,
      errandsLimit: subscription.errandsLimit,
    });
    setIsCreating(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-secondary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Subscription Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage user plans and billing
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="admin-secondary hover:bg-amber-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Subscription
        </Button>
      </div>

      {/* Plan Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
          const count = subscriptions?.filter((sub: Subscription) => sub.plan === key && sub.status === "active").length || 0;
          return (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{plan.name}</h4>
                    <p className="text-sm text-muted-foreground">{formatCurrency(plan.price)}/month</p>
                    <p className="text-xs text-muted-foreground">{plan.errands} errands included</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">active users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingSubscription ? "Edit Subscription" : "Create New Subscription"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userId">User ID *</Label>
                  <Input
                    id="userId"
                    type="number"
                    value={formData.userId || ""}
                    onChange={(e) => setFormData({ ...formData, userId: parseInt(e.target.value) })}
                    placeholder="Enter user ID"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="plan">Plan *</Label>
                  <Select
                    value={formData.plan}
                    onValueChange={handlePlanChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic - $9.99/month</SelectItem>
                      <SelectItem value="premium">Premium - $19.99/month</SelectItem>
                      <SelectItem value="business">Business - $49.99/month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as Subscription["status"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="past_due">Past Due</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    step="0.01"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                    readOnly
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="errandsUsed">Errands Used</Label>
                  <Input
                    id="errandsUsed"
                    type="number"
                    value={formData.errandsUsed}
                    onChange={(e) => setFormData({ ...formData, errandsUsed: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="errandsLimit">Errands Limit</Label>
                  <Input
                    id="errandsLimit"
                    type="number"
                    value={formData.errandsLimit}
                    onChange={(e) => setFormData({ ...formData, errandsLimit: parseInt(e.target.value) })}
                    min="1"
                    readOnly
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="admin-secondary hover:bg-amber-600"
                  disabled={createSubscriptionMutation.isPending || updateSubscriptionMutation.isPending}
                >
                  {editingSubscription ? "Update Subscription" : "Create Subscription"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions ({subscriptions?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">ID</th>
                  <th className="text-left py-3 px-4 font-medium">User ID</th>
                  <th className="text-left py-3 px-4 font-medium">Plan</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Price</th>
                  <th className="text-left py-3 px-4 font-medium">Usage</th>
                  <th className="text-left py-3 px-4 font-medium">Created</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions?.length ? (
                  subscriptions.map((subscription: Subscription) => (
                    <tr key={subscription.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <span className="font-medium">#{subscription.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        #{subscription.userId}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {SUBSCRIPTION_PLANS[subscription.plan].name}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">
                          {formatCurrency(subscription.monthlyPrice)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <span className="font-medium">{subscription.errandsUsed}</span>
                          <span className="text-muted-foreground">/{subscription.errandsLimit}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full" 
                            style={{ 
                              width: `${Math.min((subscription.errandsUsed / subscription.errandsLimit) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {subscription.startDate ? formatDate(subscription.startDate) : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedSubscription(subscription)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(subscription)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No subscriptions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Detail Modal */}
      {selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Subscription ID</label>
                <p className="text-sm">#{selectedSubscription.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">User ID</label>
                <p className="text-sm">#{selectedSubscription.userId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Plan</label>
                <p className="text-sm">{SUBSCRIPTION_PLANS[selectedSubscription.plan].name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Status</label>
                <Badge className={getStatusColor(selectedSubscription.status)}>
                  {selectedSubscription.status}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Monthly Price</label>
                <p className="text-sm font-semibold">{formatCurrency(selectedSubscription.monthlyPrice)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Errand Usage</label>
                <div className="text-sm">
                  <span className="font-medium">{selectedSubscription.errandsUsed}</span>
                  <span className="text-muted-foreground"> of {selectedSubscription.errandsLimit} used</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min((selectedSubscription.errandsUsed / selectedSubscription.errandsLimit) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Start Date</label>
                <p className="text-sm">
                  {selectedSubscription.startDate ? formatDate(selectedSubscription.startDate) : "N/A"}
                </p>
              </div>
              {selectedSubscription.endDate && (
                <div>
                  <label className="text-sm font-medium text-slate-600">End Date</label>
                  <p className="text-sm">{formatDate(selectedSubscription.endDate)}</p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setSelectedSubscription(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setSelectedSubscription(null);
                    handleEdit(selectedSubscription);
                  }}
                  className="flex-1 admin-secondary hover:bg-amber-600"
                >
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
