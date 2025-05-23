import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Search, Filter, ArrowUpDown, User } from "lucide-react";
import { formatDate, formatCurrency, getStatusColor, getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import JobDetailModal from "../../components/modals/JobDetailModal";
import type { Job, User as UserType } from "@shared/schema";

type JobSortOption = "latest" | "alphabetical" | "requester" | "status" | "price";

export default function Jobs() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<JobSortOption>("latest");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["/api/jobs"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  // Helper function to format requester name like "Wendell R"
  const formatRequesterName = (user: UserType) => {
    if (!user?.fullName) return "Unknown User";
    const nameParts = user.fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : "";
    return lastInitial ? `${firstName} ${lastInitial}` : firstName;
  };

  // Enhanced sorting and filtering logic
  const sortedAndFilteredJobs = useMemo(() => {
    if (!jobs) return [];
    
    const jobsWithRequesters = jobs.map((job: Job) => {
      const requester = users?.find((u: UserType) => u.id === job.requesterId);
      return { ...job, requester };
    });

    // Filter by status
    let filtered = jobsWithRequesters;
    if (statusFilter !== "all") {
      filtered = jobsWithRequesters.filter((job: any) => job.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((job: any) => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.requester && formatRequesterName(job.requester).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort the filtered results
    switch (sortBy) {
      case "alphabetical":
        return filtered.sort((a: any, b: any) => a.title.localeCompare(b.title));
      case "requester":
        return filtered.sort((a: any, b: any) => {
          const nameA = a.requester ? formatRequesterName(a.requester) : "zzzz";
          const nameB = b.requester ? formatRequesterName(b.requester) : "zzzz";
          return nameA.localeCompare(nameB);
        });
      case "status":
        return filtered.sort((a: any, b: any) => a.status.localeCompare(b.status));
      case "price":
        return filtered.sort((a: any, b: any) => parseFloat(b.price) - parseFloat(a.price));
      case "latest":
      default:
        return filtered.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
    }
  }, [jobs, users, statusFilter, searchTerm, sortBy]);

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
      toast({
        title: "Job Updated",
        description: "Job has been updated successfully.",
      });
      setSelectedJob(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update job.",
        variant: "destructive",
      });
    },
  });

  const filteredJobs = jobs?.filter((job: Job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (job: Job, newStatus: string) => {
    updateJobMutation.mutate({ 
      id: job.id, 
      updates: { status: newStatus as Job["status"] }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-secondary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Job Management</h3>
          <p className="text-sm text-muted-foreground">
            Monitor and manage all errands
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Jobs ({filteredJobs?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Job ID</th>
                  <th className="text-left py-3 px-4 font-medium">Title</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Price</th>
                  <th className="text-left py-3 px-4 font-medium">Created</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs?.length ? (
                  filteredJobs.map((job: Job) => (
                    <tr key={job.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <span className="font-medium">
                          #GH-{String(job.id).padStart(6, '0')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-xs text-slate-500 truncate max-w-32">
                            {job.description}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{job.category}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">
                          {formatCurrency(job.price)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {job.createdAt ? formatDate(job.createdAt) : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedJob(job)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No jobs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Job ID</label>
                <p className="text-sm">#GH-{String(selectedJob.id).padStart(6, '0')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Title</label>
                <p className="text-sm">{selectedJob.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Description</label>
                <p className="text-sm">{selectedJob.description || "No description"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Category</label>
                <p className="text-sm">{selectedJob.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Pickup Address</label>
                <p className="text-sm">{selectedJob.pickupAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Dropoff Address</label>
                <p className="text-sm">{selectedJob.dropoffAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Price</label>
                <p className="text-sm font-semibold">{formatCurrency(selectedJob.price)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Status</label>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(selectedJob.status)}>
                    {selectedJob.status}
                  </Badge>
                  <Select
                    value={selectedJob.status}
                    onValueChange={(value) => handleStatusChange(selectedJob, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Created</label>
                <p className="text-sm">
                  {selectedJob.createdAt ? formatDate(selectedJob.createdAt) : "N/A"}
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setSelectedJob(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
