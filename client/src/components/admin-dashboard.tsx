import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut, Eye, Settings, CheckCircle, AlertTriangle, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { GarbageReport } from "@shared/schema";
import ImageModal from "@/components/ImageModal";

interface AdminStats {
  pending: number;
  verified: number;
  inProgress: number;
  completed: number;
  total: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
    queryFn: async () => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/stats", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      
      return response.json();
    },
  });

  const { data: reports = [], isLoading } = useQuery<GarbageReport[]>({
    queryKey: ["/api/reports"],
    refetchInterval: 30000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/reports/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Status Updated",
        description: "Report status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update report status.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      await apiRequest("POST", "/api/admin/logout", {}, {
        "Authorization": `Bearer ${token}`,
      });
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem("adminToken");
      window.location.reload();
    }
  };

  const handleStatusUpdate = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { variant: "destructive" as const, icon: AlertTriangle, color: "text-destructive" },
      verified: { variant: "secondary" as const, icon: Eye, color: "text-accent" },
      "in-progress": { variant: "default" as const, icon: Settings, color: "text-secondary" },
      completed: { variant: "outline" as const, icon: CheckCircle, color: "text-primary" },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const reportDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than 1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  };

  return (
    <section className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage garbage reports and track completion status</p>
            </div>
            <Button 
              variant="destructive"
              onClick={handleLogout}
              data-testid="button-admin-logout"
            >
              <LogOut className="mr-2" size={16} />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="text-destructive text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-pending">
                    {stats?.pending || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Eye className="text-accent text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-verified">
                    {stats?.verified || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Settings className="text-secondary text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-in-progress">
                    {stats?.inProgress || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-primary text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-completed">
                    {stats?.completed || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports Table */}
        <Card>
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">All Reports</h3>
              <div className="flex items-center space-x-3">
                <Select defaultValue="all">
                  <SelectTrigger className="w-32" data-testid="select-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" data-testid="button-filter">
                  <Filter className="mr-2" size={16} />
                  Filter
                </Button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No reports found.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Report</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Reporter</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Time</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reports.map((report) => {
                    const statusConfig = getStatusConfig(report.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr key={report.id} className="hover:bg-muted/30 transition-colors" data-testid={`row-report-${report.id}`}>
                        <td className="px-6 py-4">
  <div className="flex items-center">
    <ImageModal
      src={report.imageUrl}
      alt="Report"
      className="w-16 h-16 rounded-lg object-cover mr-4 cursor-pointer"
    />
    <div>
      <p className="font-medium text-foreground">
        {report.description || "Garbage report"}
      </p>
      <p className="text-sm text-muted-foreground">
        ID: {report.id.slice(0, 8)}
      </p>
    </div>
  </div>
</td>
                        <td className="px-6 py-4 text-foreground" data-testid={`location-admin-${report.id}`}>
                          {report.location}
                        </td>
                        <td className="px-6 py-4 text-foreground" data-testid={`reporter-admin-${report.id}`}>
                          {report.reporterName}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusConfig.variant} data-testid={`status-admin-${report.id}`}>
                            <StatusIcon className="mr-1" size={12} />
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('-', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground flex items-center" data-testid={`time-admin-${report.id}`}>
                          <Clock className="mr-1" size={12} />
                          {getTimeAgo(report.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {report.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(report.id, "verified")}
                                disabled={updateStatusMutation.isPending}
                                data-testid={`button-verify-${report.id}`}
                              >
                                <Eye className="mr-1" size={14} />
                                Verify
                              </Button>
                            )}
                            {["verified", "in-progress"].includes(report.status) && (
                              <>
                                {report.status === "verified" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(report.id, "in-progress")}
                                    disabled={updateStatusMutation.isPending}
                                    className="bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20"
                                    data-testid={`button-process-${report.id}`}
                                  >
                                    <Settings className="mr-1" size={14} />
                                    Process
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(report.id, "completed")}
                                  disabled={updateStatusMutation.isPending}
                                  className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                                  data-testid={`button-complete-${report.id}`}
                                >
                                  <CheckCircle className="mr-1" size={14} />
                                  Complete
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          
          {reports.length > 0 && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {reports.length} of {reports.length} reports
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
