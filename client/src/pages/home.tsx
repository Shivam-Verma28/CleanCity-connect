import { useQuery } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import ReportForm from "@/components/report-form";
import ReportCard from "@/components/report-card";
import { GarbageReport } from "@shared/schema";

export default function Home() {
  const { data: reports = [], isLoading } = useQuery<GarbageReport[]>({
    queryKey: ["/api/reports"],
  });

  const recentReports = reports.slice(0, 6);

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-400 via-white to-green-500 text-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Report Garbage in Your Community
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
          Be a part of India’s clean revolution! Report waste, take action, and help keep our country Swachh
          </p>
          <button
  onClick={() => {
    document.getElementById("report-form")?.scrollIntoView({ behavior: "smooth" });
  }}
  className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-green-600 transition"
>
  🧹 Start Reporting
</button>

        </div>
      </section>

      {/* Report Form Section */}
      <section id="report-form" className="py-16 bg-muted/50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <ReportForm />
        </div>
      </section>

      {/* Recent Reports */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Recent Community Reports
            </h3>
            <p className="text-muted-foreground text-lg">
              Track the progress of garbage reports in your area
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl shadow-lg overflow-hidden border border-border animate-pulse"
                >
                  <div className="w-full h-48 bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-6 bg-muted rounded w-2/3" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="text-muted-foreground" size={24} />
              </div>
              <p className="text-muted-foreground text-lg">
                No reports yet. Be the first to report an issue!
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
