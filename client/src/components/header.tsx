import { Link, useLocation } from "wouter";
import { Recycle } from "lucide-react";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-gradient-to-r from-orange-500 via-white to-green-500 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <Link href="/" data-testid="link-home">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-md">
                <Recycle className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black drop-shadow">
                  CleanCity Connect
                </h1>
                <p className="text-sm text-gray-800">
                  Making communities clean and organized
                </p>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link href="/" data-testid="nav-user">
              <span
                className={`font-semibold cursor-pointer flex items-center space-x-1 text-sm ${
                  location === "/" 
                } text-black hover:text-gray-700`}
              >
                <i className="fas fa-camera" />
                <span className="hidden sm:inline">Report</span>
              </span>
            </Link>
            <Link href="/admin" data-testid="nav-admin">
              <span
                className={`font-semibold cursor-pointer flex items-center space-x-1 text-sm ${
                  location === "/admin" ? "underline" : ""
                } text-black hover:text-gray-700`}
              >
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
