import { GarbageReport } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";

interface ReportCardProps {
  report: GarbageReport;
}

const statusConfig = {
  pending: {
    label: "Pending",
    variant: "destructive" as const,
    icon: "fas fa-exclamation",
  },
  verified: {
    label: "Verified",
    variant: "secondary" as const,
    icon: "fas fa-eye",
  },
  "in-progress": {
    label: "In Progress",
    variant: "default" as const,
    icon: "fas fa-cog",
  },
  completed: {
    label: "Completed",
    variant: "outline" as const,
    icon: "fas fa-check-circle",
  },
};

export default function ReportCard({ report }: ReportCardProps) {
  const config = statusConfig[report.status];
  const timeAgo = getTimeAgo(new Date(report.createdAt));

  return (
    <Card className="overflow-hidden border border-border hover:shadow-lg transition-shadow" data-testid={`card-report-${report.id}`}>
      <img 
        src={report.imageUrl} 
        alt="Garbage report" 
        className="w-full h-48 object-cover"
        data-testid={`img-report-${report.id}`}
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge variant={config.variant} className="text-xs font-medium" data-testid={`status-${report.id}`}>
            <i className={`${config.icon} mr-1`} />
            {config.label}
          </Badge>
          <span className="text-sm text-muted-foreground flex items-center" data-testid={`time-${report.id}`}>
            <Clock className="mr-1" size={12} />
            {timeAgo}
          </span>
        </div>
        <h4 className="text-lg font-semibold text-foreground mb-2" data-testid={`location-${report.id}`}>
          {report.location}
        </h4>
        {report.description && (
          <p className="text-muted-foreground text-sm mb-4" data-testid={`description-${report.id}`}>
            {report.description}
          </p>
        )}
        <div className="flex items-center text-sm text-muted-foreground" data-testid={`reporter-${report.id}`}>
          <User className="mr-2" size={14} />
          <span>{report.reporterName}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
}
