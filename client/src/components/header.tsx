import { Link, useLocation } from "wouter";
import { Recycle } from "lucide-react";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Recycle className="text-primary-foreground text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">GarbageTracker</h1>
                <p className="text-sm text-muted-foreground">Community Waste Management</p>
              </div>
            </div>
          </Link>
          
          <nav className="flex items-center space-x-4">
            <Link href="/" data-testid="nav-user">
              <span className={`font-medium transition-colors cursor-pointer flex items-center space-x-1 text-sm ${
                location === "/" ? "text-foreground" : "text-muted-foreground hover:text-primary"
              }`}>
                <i className="fas fa-camera" />
                <span className="hidden sm:inline">Report</span>
              </span>
            </Link>
            <Link href="/admin" data-testid="nav-admin">
              <span className={`font-medium transition-colors cursor-pointer flex items-center space-x-1 text-sm ${
                location === "/admin" ? "text-foreground" : "text-muted-foreground hover:text-primary"
              }`}>
                <i className="fas fa-shield-alt" />
                <span className="hidden sm:inline">Admin</span>
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
