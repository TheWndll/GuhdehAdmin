import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Building2, MapPin, Tag } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Service, InsertService } from "@shared/schema";

const serviceCategories = [
  { id: 'auto', name: 'Auto Services', description: 'Car parts, vehicle services', icon: '🚗' },
  { id: 'gas', name: 'Gas Station', description: 'Fuel services, convenience', icon: '⛽' },
  { id: 'gov', name: 'Government', description: 'Official services, documentation', icon: '🏛️' },
  { id: 'medical', name: 'Medical & Pharmacy', description: 'Healthcare, prescriptions', icon: '🏥' },
  { id: 'grocery', name: 'Grocery & Food', description: 'Supermarkets, food stores', icon: '🛒' },
  { id: 'restaurant', name: 'Restaurant', description: 'Food pickup, catering', icon: '🍽️' },
  { id: 'retail', name: 'Retail Shopping', description: 'General retail, electronics', icon: '🛍️' },
  { id: 'courier', name: 'Courier & Shipping', description: 'Package services', icon: '📦' },
  { id: 'bank', name: 'Banking & Finance', description: 'Financial services', icon: '🏦' },
  { id: 'utility', name: 'Utility Services', description: 'Bills, municipal services', icon: '⚡' },
  { id: 'print', name: 'Print & Office', description: 'Printing, office supplies', icon: '🖨️' },
  { id: 'legal', name: 'Legal Services', description: 'Law firms, notary', icon: '⚖️' },
  { id: 'travel', name: 'Travel & Transport', description: 'Transport, travel agencies', icon: '✈️' },
  { id: 'edu', name: 'Education', description: 'Schools, educational services', icon: '🎓' },
  { id: 'home', name: 'Home Services', description: 'Hardware, home improvement', icon: '🏠' },
  { id: 'places', name: 'Google Places', description: 'Real-time business lookup via Google Places API', icon: '📍' },
];

export default function Services() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Partial<InsertService>>({
    name: "",
    description: "",
    category: "",
    basePrice: "",
    pricePerKm: "",
    isActive: true,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ["/api/services"],
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: InsertService) => {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create service");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Service Created",
        description: "New service has been created successfully.",
      });
      setIsCreating(false);
      setFormData({
        name: "",
        description: "",
        category: "",
        basePrice: "",
        pricePerKm: "",
        isActive: true,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create service.",
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertService> }) => {
      const response = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update service");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Service Updated",
        description: "Service has been updated successfully.",
      });
      setIsCreating(false);
      setEditingService(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update service.",
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete service");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Service Deleted",
        description: "Service has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete service.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.basePrice) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data: formData });
    } else {
      createServiceMutation.mutate(formData as InsertService);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      category: service.category,
      basePrice: service.basePrice,
      pricePerKm: service.pricePerKm || "",
      isActive: service.isActive || true,
    });
    setIsCreating(true);
  };

  const handleDelete = (service: Service) => {
    if (confirm("Are you sure you want to delete this service?")) {
      deleteServiceMutation.mutate(service.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-secondary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Service Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage service categories and pricing ({services?.length || 0} total)
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/business-signup">
            <Button variant="outline" className="gap-2">
              <Building2 className="w-4 h-4" />
              Add Business
            </Button>
          </Link>
          <Button
            onClick={() => {
              setIsCreating(true);
              setEditingService(null);
              setFormData({
                name: "",
                description: "",
                category: "",
                basePrice: "",
                pricePerKm: "",
                isActive: true,
              });
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Service Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Service Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceCategories.map((category) => (
              <div
                key={category.id}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingService ? "Edit Service" : "Create New Service"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Grocery Shopping"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category || ""} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Service description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="basePrice">Base Price *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice || ""}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerKm">Price per Km</Label>
                  <Input
                    id="pricePerKm"
                    type="number"
                    step="0.01"
                    value={formData.pricePerKm || ""}
                    onChange={(e) => setFormData({ ...formData, pricePerKm: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active Service</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createServiceMutation.isPending || updateServiceMutation.isPending}>
                  {editingService ? "Update" : "Create"} Service
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle>Services ({services?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Service</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Base Price</th>
                  <th className="text-left p-2">Per Km</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Created</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                      No services found. Create your first service above.
                    </td>
                  </tr>
                ) : (
                  services?.map((service: Service) => (
                    <tr key={service.id} className="border-b hover:bg-accent/50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{service.name}</div>
                          {service.description && (
                            <div className="text-sm text-muted-foreground">
                              {service.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">{service.category}</Badge>
                      </td>
                      <td className="p-2">{formatCurrency(service.basePrice)}</td>
                      <td className="p-2">
                        {service.pricePerKm ? formatCurrency(service.pricePerKm) : "—"}
                      </td>
                      <td className="p-2">
                        <Badge variant={service.isActive ? "default" : "secondary"}>
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {service.createdAt ? formatDate(service.createdAt) : "—"}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(service)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(service)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}