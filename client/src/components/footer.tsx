import { Recycle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
<div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
  <Recycle className="text-white" />
</div>
              <span className="text-lg font-bold text-foreground">CleanCity Connect</span>
            </div>
            <p className="text-muted-foreground text-sm">Making communities cleaner through collaborative reporting and efficient waste management.</p>
          </div>
          
          <div>
            <h4 className="text-foreground font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Report Issue</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Track Reports</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Guidelines</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-foreground font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-foreground font-semibold mb-4">Connect</h4>
            <div className="flex space-x-3">
              <a href="#" className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" data-testid="link-twitter">
                <i className="fab fa-twitter" />
              </a>
              <a href="#" className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" data-testid="link-facebook">
                <i className="fab fa-facebook" />
              </a>
              <a href="#" className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" data-testid="link-instagram">
                <i className="fab fa-instagram" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">&copy; 2024 CleanCity Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
