import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  X, 
  MapPin, 
  DollarSign, 
  Calendar, 
  User, 
  Package,
  Edit3,
  Save,
  ArrowRight,
  Clock
} from "lucide-react";
import { formatDate, formatCurrency, getStatusColor, getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Job } from "@shared/schema";

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export default function JobDetailModal({ 
  job, 
  isOpen, 
  onClose, 
  onUpdated 
}: JobDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Job>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Job> }) => {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update job");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/recent"] });
      toast({
        title: "Job Updated",
        description: "Job details have been updated successfully.",
      });
      setIsEditing(false);
      onUpdated?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update job details.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if (!job) return;
    setFormData({
      title: job.title,
      description: job.description || "",
      category: job.category,
      pickupAddress: job.pickupAddress,
      dropoffAddress: job.dropoffAddress,
      price: job.price,
      status: job.status,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!job) return;
    
    const updates = Object.entries(formData).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== job[key as keyof Job]) {
        acc[key as keyof Job] = value;
      }
      return acc;
    }, {} as Partial<Job>);

    if (Object.keys(updates).length > 0) {
      updateJobMutation.mutate({ id: job.id, updates });
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({});
    setIsEditing(false);
  };

  if (!isOpen || !job) return null;

  const displayJob = isEditing ? { ...job, ...formData } : job;

  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    { value: "assigned", label: "Assigned", color: "bg-purple-100 text-purple-800" },
    { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-800" },
    { value: "completed", label: "Completed", color: "bg-emerald-100 text-emerald-800" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="admin-primary">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-3">
              <div className="w-8 h-8 admin-secondary rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-admin-primary" />
              </div>
              Job Details - #GH-{String(job.id).padStart(6, '0')}
            </CardTitle>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="text-white hover:bg-slate-700"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Job Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-600">Job Title</Label>
                {isEditing ? (
                  <Input
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-lg font-semibold text-slate-900 mt-1">{displayJob.title}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600">Category</Label>
                {isEditing ? (
                  <Select
                    value={formData.category || ""}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grocery">Grocery</SelectItem>
                      <SelectItem value="food">Food Delivery</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="documents">Documents</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className="mt-1">{displayJob.category}</Badge>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600">Price</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price || ""}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="mt-1"
                    prefix="$"
                  />
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <p className="text-lg font-semibold text-slate-900">
                      {formatCurrency(displayJob.price)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-600">Status</Label>
                {isEditing ? (
                  <Select
                    value={formData.status || ""}
                    onValueChange={(value) => setFormData({ ...formData, status: value as Job["status"] })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={`${getStatusColor(displayJob.status)} mt-1`}>
                    {displayJob.status}
                  </Badge>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600">Requester ID</Label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-4 h-4 text-slate-400" />
                  <p className="text-sm text-slate-700">#{job.requesterId}</p>
                </div>
              </div>

              {job.runnerId && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Runner ID</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-slate-400" />
                    <p className="text-sm text-slate-700">#{job.runnerId}</p>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-slate-600">Created</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <p className="text-sm text-slate-700">
                    {job.createdAt ? formatDate(job.createdAt) : "N/A"}
                  </p>
                </div>
              </div>

              {job.completedAt && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Completed</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <p className="text-sm text-slate-700">
                      {formatDate(job.completedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium text-slate-600">Description</Label>
            {isEditing ? (
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
                rows={3}
                placeholder="Job description..."
              />
            ) : (
              <p className="text-sm text-slate-700 mt-1 p-3 bg-slate-50 rounded-lg">
                {displayJob.description || "No description provided"}
              </p>
            )}
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-slate-600">Pickup Address</Label>
              {isEditing ? (
                <Textarea
                  value={formData.pickupAddress || ""}
                  onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                  className="mt-1"
                  rows={2}
                />
              ) : (
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                  <p className="text-sm text-slate-700">{displayJob.pickupAddress}</p>
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-600">Dropoff Address</Label>
              {isEditing ? (
                <Textarea
                  value={formData.dropoffAddress || ""}
                  onChange={(e) => setFormData({ ...formData, dropoffAddress: e.target.value })}
                  className="mt-1"
                  rows={2}
                />
              ) : (
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                  <p className="text-sm text-slate-700">{displayJob.dropoffAddress}</p>
                </div>
              )}
            </div>
          </div>

          {/* Route Overview */}
          {!isEditing && (
            <div className="bg-slate-50 rounded-lg p-4">
              <Label className="text-sm font-medium text-slate-600 mb-3 block">Route Overview</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs font-medium text-slate-600">PICKUP</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs font-medium text-slate-600">DROPOFF</span>
                </div>
              </div>
            </div>
          )}

          {/* Coordinates (if available) */}
          {(job.pickupLat || job.dropoffLat) && !isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-500">
              {job.pickupLat && job.pickupLng && (
                <div>
                  <Label className="text-xs font-medium text-slate-500">Pickup Coordinates</Label>
                  <p className="font-mono">{job.pickupLat}, {job.pickupLng}</p>
                </div>
              )}
              {job.dropoffLat && job.dropoffLng && (
                <div>
                  <Label className="text-xs font-medium text-slate-500">Dropoff Coordinates</Label>
                  <p className="font-mono">{job.dropoffLat}, {job.dropoffLng}</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            {isEditing ? (
              <>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1"
                  disabled={updateJobMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 admin-secondary hover:bg-amber-600"
                  disabled={updateJobMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateJobMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
