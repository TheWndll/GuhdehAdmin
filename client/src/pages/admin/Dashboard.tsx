import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Users, DollarSign, AlertTriangle } from "lucide-react";
import RevenueChart from "../../components/charts/RevenueChart";
import JobStatusChart from "../../components/charts/JobStatusChart";
import { formatCurrency, getStatusColor, getInitials } from "@/lib/utils";
import type { Analytics, Job } from "@shared/schema";

export default function Dashboard() {
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
  });

  const { data: recentJobs } = useQuery({
    queryKey: ["/api/jobs/recent"],
  });

  const statsCards = [
    {
      title: "Total Jobs",
      value: analytics?.totalJobs || 0,
      change: "+12%",
      icon: Activity,
      color: "blue",
    },
    {
      title: "Active Runners",
      value: analytics?.activeRunners || 0,
      change: "+8%",
      icon: Users,
      color: "emerald",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(analytics?.revenue || "0"),
      change: "+15%",
      icon: DollarSign,
      color: "yellow",
    },
    {
      title: "Open Disputes",
      value: analytics?.disputes || 0,
      change: "-3%",
      icon: AlertTriangle,
      color: "red",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change.startsWith("+");
          
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 bg-${stat.color}-50 rounded-lg`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    isPositive 
                      ? "text-emerald-600 bg-emerald-50" 
                      : "text-red-600 bg-red-50"
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-600">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <JobStatusChart />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Recent Jobs</h3>
                <a href="#/admin/jobs" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                  View all
                </a>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Job ID
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentJobs?.length ? (
                    recentJobs.map((job: Job, index: number) => (
                      <tr key={job.id} className="hover:bg-slate-50">
                        <td className="py-4 px-6">
                          <span className="text-sm font-medium text-slate-900">
                            #GH-{String(job.id).padStart(6, '0')}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-blue-600">
                                {getInitials(job.title)}
                              </span>
                            </div>
                            <span className="text-sm text-slate-900">{job.title}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-semibold text-slate-900">
                            {formatCurrency(job.price)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        No recent jobs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Actions & System Health */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Verify Runner</p>
                      <p className="text-xs text-slate-600">Review pending applications</p>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Resolve Dispute</p>
                      <p className="text-xs text-slate-600">Handle customer complaints</p>
                    </div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">System Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">API Response Time</span>
                  <span className="text-sm font-semibold text-emerald-600">142ms</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Database Load</span>
                  <span className="text-sm font-semibold text-yellow-600">68%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "68%" }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Active Connections</span>
                  <span className="text-sm font-semibold text-blue-600">234</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
