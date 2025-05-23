import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, DollarSign, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const serviceCategories = [
  { id: 'auto', name: 'Auto Services', description: 'Car parts, vehicle services' },
  { id: 'gas', name: 'Gas Station', description: 'Fuel services, convenience' },
  { id: 'gov', name: 'Government', description: 'Official services, documentation' },
  { id: 'medical', name: 'Medical & Pharmacy', description: 'Healthcare, prescriptions' },
  { id: 'grocery', name: 'Grocery & Food', description: 'Supermarkets, food stores' },
  { id: 'restaurant', name: 'Restaurant', description: 'Food pickup, catering' },
  { id: 'retail', name: 'Retail Shopping', description: 'General retail, electronics' },
  { id: 'courier', name: 'Courier & Shipping', description: 'Package services' },
  { id: 'bank', name: 'Banking & Finance', description: 'Financial services' },
  { id: 'utility', name: 'Utility Services', description: 'Bills, municipal services' },
  { id: 'print', name: 'Print & Office', description: 'Printing, office supplies' },
  { id: 'legal', name: 'Legal Services', description: 'Law firms, notary' },
  { id: 'travel', name: 'Travel & Transport', description: 'Transport, travel agencies' },
  { id: 'edu', name: 'Education', description: 'Schools, educational services' },
  { id: 'home', name: 'Home Services', description: 'Hardware, home improvement' },
  { id: 'places', name: 'Google Places', description: 'Search real businesses via Google Places API' },
];

export default function BusinessSignup() {
  const [formData, setFormData] = useState({
    businessName: "",
    category: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    basePrice: "",
    pricePerKm: "",
    contactPerson: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createBusinessMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.businessName,
          category: data.category,
          description: data.description,
          basePrice: data.basePrice,
          pricePerKm: data.pricePerKm || null,
          isActive: true,
        }),
      });
      if (!response.ok) throw new Error("Failed to add business");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Business Added Successfully!",
        description: "The business has been added to the Guhdeh platform.",
      });
      // Reset form
      setFormData({
        businessName: "",
        category: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        basePrice: "",
        pricePerKm: "",
        contactPerson: "",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add business. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.category || !formData.basePrice) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createBusinessMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="admin-primary">
          <CardTitle className="text-white flex items-center gap-3">
            <div className="w-8 h-8 admin-secondary rounded-full flex items-center justify-center">
              <Building2 className="w-4 h-4 text-admin-primary" />
            </div>
            Add Business to Guhdeh Platform
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName" className="text-sm font-medium">
                  Business Name *
                </Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange("businessName", e.target.value)}
                  placeholder="e.g., KIG Auto Parts"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-medium">
                  Service Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div>
                          <div className="font-medium">{cat.name}</div>
                          <div className="text-xs text-slate-500">{cat.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactPerson" className="text-sm font-medium">
                  Contact Person
                </Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                  placeholder="Business owner/manager name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="876-xxx-xxxx"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Business Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="business@example.com"
                className="mt-1"
              />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Business Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Full business address including parish"
                className="mt-1"
                rows={2}
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Business Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe the services offered by this business..."
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePrice" className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Base Service Fee (JMD) *
                </Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => handleInputChange("basePrice", e.target.value)}
                  placeholder="500.00"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="pricePerKm" className="text-sm font-medium">
                  Price per KM (Optional)
                </Label>
                <Input
                  id="pricePerKm"
                  type="number"
                  step="0.01"
                  value={formData.pricePerKm}
                  onChange={(e) => handleInputChange("pricePerKm", e.target.value)}
                  placeholder="50.00"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Special note for Google Places */}
            {formData.category === "places" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Tag className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Google Places Integration</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      This category enables real-time business lookup using Google Places API. 
                      Businesses will be searchable directly from the requester dashboard with 
                      live autocomplete and location data.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 admin-secondary hover:bg-amber-600"
                disabled={createBusinessMutation.isPending}
              >
                {createBusinessMutation.isPending ? "Adding Business..." : "Add Business"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}