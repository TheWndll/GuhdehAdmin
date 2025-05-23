import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, UserX, Eye, ArrowUpDown, User } from "lucide-react";
import { formatDate, getStatusColor, getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import VerifyRunnerModal from "../../components/modals/VerifyRunnerModal";
import type { Runner, User as UserType } from "@shared/schema";

type SortOption = "name" | "jobs" | "recent" | "status";

export default function Runners() {
  const [selectedRunner, setSelectedRunner] = useState<Runner | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: runners, isLoading } = useQuery({
    queryKey: ["/api/runners"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  // Enhanced sorting logic
  const sortedRunners = useMemo(() => {
    if (!runners) return [];
    
    const runnersWithUsers = runners.map((runner: Runner) => {
      const user = users?.find((u: UserType) => u.id === runner.userId);
      return { ...runner, user };
    });

    switch (sortBy) {
      case "name":
        return runnersWithUsers.sort((a, b) => {
          const nameA = a.user?.fullName || "";
          const nameB = b.user?.fullName || "";
          return nameA.localeCompare(nameB);
        });
      case "jobs":
        // Sort by number of jobs completed (would need job count data)
        return runnersWithUsers.sort((a, b) => {
          // For now, sort by verification status priority
          const statusOrder = { pending: 0, approved: 2, rejected: 1 };
          return statusOrder[a.verificationStatus as keyof typeof statusOrder] - 
                 statusOrder[b.verificationStatus as keyof typeof statusOrder];
        });
      case "status":
        return runnersWithUsers.sort((a, b) => {
          return a.verificationStatus.localeCompare(b.verificationStatus);
        });
      case "recent":
      default:
        return runnersWithUsers.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
    }
  }, [runners, users, sortBy]);

  const verifyRunnerMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/runners/${id}/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update runner");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/runners"] });
      toast({
        title: "Runner Updated",
        description: "Runner verification status has been updated.",
      });
      setSelectedRunner(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update runner verification status.",
        variant: "destructive",
      });
    },
  });

  const handleVerify = (runner: Runner, status: "approved" | "rejected") => {
    verifyRunnerMutation.mutate({ id: runner.id, status });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-secondary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading runners...</p>
        </div>
      </div>
    );
  }

  const handleVerifyRunner = (runner: any) => {
    setSelectedRunner(runner);
    setSelectedUser(runner.user);
    setIsVerifyModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Runner Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage and verify runner accounts ({sortedRunners?.length || 0} total)
          </p>
        </div>
        
        {/* Sorting Controls */}
        <div className="flex items-center gap-3">
          <ArrowUpDown className="w-4 h-4 text-slate-500" />
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Latest First</SelectItem>
              <SelectItem value="name">Alphabetical (A-Z)</SelectItem>
              <SelectItem value="status">By Status</SelectItem>
              <SelectItem value="jobs">By Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Runners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Runner ID</th>
                  <th className="text-left py-3 px-4 font-medium">User ID</th>
                  <th className="text-left py-3 px-4 font-medium">Phone</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Created</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {runners?.length ? (
                  runners.map((runner: Runner) => (
                    <tr key={runner.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <span className="font-medium">#{runner.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        #{runner.userId}
                      </td>
                      <td className="py-3 px-4">
                        {runner.phone || "Not provided"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(runner.verificationStatus)}>
                          {runner.verificationStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {runner.createdAt ? formatDate(runner.createdAt) : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedRunner(runner)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {runner.verificationStatus === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-emerald-600 hover:text-emerald-700"
                                onClick={() => handleVerify(runner, "approved")}
                                disabled={verifyRunnerMutation.isPending}
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleVerify(runner, "rejected")}
                                disabled={verifyRunnerMutation.isPending}
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No runners found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Runner Detail Modal */}
      {selectedRunner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Runner Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Runner ID</label>
                <p className="text-sm">#{selectedRunner.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">User ID</label>
                <p className="text-sm">#{selectedRunner.userId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Phone</label>
                <p className="text-sm">{selectedRunner.phone || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">National ID</label>
                <p className="text-sm">{selectedRunner.nationalId || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Date of Birth</label>
                <p className="text-sm">{selectedRunner.dateOfBirth || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Verification Status</label>
                <Badge className={getStatusColor(selectedRunner.verificationStatus)}>
                  {selectedRunner.verificationStatus}
                </Badge>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setSelectedRunner(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
                {selectedRunner.verificationStatus === "pending" && (
                  <>
                    <Button
                      onClick={() => handleVerify(selectedRunner, "approved")}
                      className="flex-1 admin-secondary hover:bg-amber-600"
                      disabled={verifyRunnerMutation.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleVerify(selectedRunner, "rejected")}
                      variant="destructive"
                      className="flex-1"
                      disabled={verifyRunnerMutation.isPending}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
