import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, UserCheck, UserX, User, Calendar, Phone, CreditCard, FileText, CheckCircle, XCircle } from "lucide-react";
import { formatDate, getStatusColor, getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Runner, User } from "@shared/schema";

interface VerifyRunnerModalProps {
  runner: Runner | null;
  user?: User | null;
  isOpen: boolean;
  onClose: () => void;
  onVerified?: () => void;
}

export default function VerifyRunnerModal({ 
  runner, 
  user, 
  isOpen, 
  onClose, 
  onVerified 
}: VerifyRunnerModalProps) {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const verifyRunnerMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      const response = await fetch(`/api/runners/${id}/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (!response.ok) throw new Error("Failed to update runner verification");
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/runners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/runners/pending"] });
      toast({
        title: "Runner Verification Updated",
        description: `Runner has been ${variables.status === "approved" ? "approved" : "rejected"} successfully.`,
      });
      onVerified?.();
      onClose();
      setNotes("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update runner verification status.",
        variant: "destructive",
      });
    },
  });

  const handleVerify = async (status: "approved" | "rejected") => {
    if (!runner) return;
    
    setIsSubmitting(true);
    try {
      await verifyRunnerMutation.mutateAsync({ 
        id: runner.id, 
        status, 
        notes: notes.trim() || undefined 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !runner) return null;

  const verificationChecks = [
    {
      label: "Documents Uploaded",
      status: runner.documentsUploaded,
      icon: FileText,
    },
    {
      label: "Background Check",
      status: runner.backgroundCheckPassed,
      icon: CheckCircle,
    },
    {
      label: "Vehicle Verified",
      status: runner.vehicleVerified,
      icon: CheckCircle,
    },
  ];

  const allChecksCompleted = verificationChecks.every(check => check.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="admin-primary">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-3">
              <div className="w-8 h-8 admin-secondary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-admin-primary" />
              </div>
              Verify Runner Application
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Runner Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-600">Runner ID</Label>
                <p className="text-lg font-semibold text-slate-900">#{runner.id}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-slate-600">User ID</Label>
                <p className="text-sm text-slate-700">#{runner.userId}</p>
              </div>

              {user && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Full Name</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {getInitials(user.fullName)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{user.fullName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-slate-600">Phone Number</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <p className="text-sm text-slate-700">{runner.phone || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-600">National ID</Label>
                <div className="flex items-center gap-2 mt-1">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <p className="text-sm text-slate-700">{runner.nationalId || "Not provided"}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600">Date of Birth</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <p className="text-sm text-slate-700">{runner.dateOfBirth || "Not provided"}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600">Application Date</Label>
                <p className="text-sm text-slate-700">
                  {runner.createdAt ? formatDate(runner.createdAt) : "N/A"}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600">Current Status</Label>
                <Badge className={getStatusColor(runner.verificationStatus)}>
                  {runner.verificationStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Verification Checklist */}
          <div>
            <Label className="text-sm font-medium text-slate-600 mb-3 block">
              Verification Checklist
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {verificationChecks.map((check, index) => {
                const Icon = check.icon;
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      check.status
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {check.status ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          check.status ? "text-emerald-800" : "text-red-800"
                        }`}
                      >
                        {check.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {!allChecksCompleted && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Some verification requirements are not yet completed. 
                  Please ensure all checks are satisfied before approval.
                </p>
              </div>
            )}
          </div>

          {/* Admin Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-slate-600">
              Admin Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this verification decision..."
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            
            {runner.verificationStatus === "pending" && (
              <>
                <Button
                  onClick={() => handleVerify("rejected")}
                  variant="destructive"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <UserX className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Processing..." : "Reject"}
                </Button>
                
                <Button
                  onClick={() => handleVerify("approved")}
                  className="flex-1 admin-secondary hover:bg-amber-600"
                  disabled={isSubmitting || !allChecksCompleted}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Processing..." : "Approve"}
                </Button>
              </>
            )}
          </div>

          {runner.verificationStatus !== "pending" && (
            <div className="text-center py-4">
              <p className="text-sm text-slate-600">
                This runner has already been {runner.verificationStatus}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
