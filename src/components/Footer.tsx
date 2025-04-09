import { Github, Bug } from "lucide-react";
import { Button } from "./ui/button";
export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 w-full py-6 bg-background/95 backdrop-blur-sm border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="outline"
              className="group relative overflow-hidden rounded-full border border-primary/20 bg-background px-6 py-2 transition-all duration-300 hover:border-primary/40"
              onClick={() => window.open("https://github.com/musama619/yup-schema-builder", "_blank")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex items-center gap-2">
                <Github className="h-4 w-4" />
                <span>Star on GitHub</span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="group relative overflow-hidden rounded-full border border-primary/20 bg-background px-6 py-2 transition-all duration-300 hover:border-primary/40"
              onClick={() => window.open("https://github.com/musama619/yup-schema-builder/issues/new", "_blank")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex items-center gap-2">
                <Bug className="h-4 w-4" />
                <span>Report Issue</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
} 