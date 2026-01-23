import { cn } from "@/lib/utils";

interface OrnamentalBorderProps {
  className?: string;
}

export function OrnamentalBorder({ className }: OrnamentalBorderProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 z-0", className)}>
      {/* Top Left Corner */}
      <svg
        className="absolute top-0 left-0 w-16 h-16 text-accent opacity-60"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M 10 90 Q 10 10 90 10" />
        <path d="M 20 90 Q 20 20 90 20" />
        <circle cx="15" cy="15" r="3" fill="currentColor" className="text-primary" />
      </svg>

      {/* Top Right Corner */}
      <svg
        className="absolute top-0 right-0 w-16 h-16 text-accent opacity-60 transform rotate-90"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M 10 90 Q 10 10 90 10" />
        <path d="M 20 90 Q 20 20 90 20" />
        <circle cx="15" cy="15" r="3" fill="currentColor" className="text-primary" />
      </svg>

      {/* Bottom Right Corner */}
      <svg
        className="absolute bottom-0 right-0 w-16 h-16 text-accent opacity-60 transform rotate-180"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M 10 90 Q 10 10 90 10" />
        <path d="M 20 90 Q 20 20 90 20" />
        <circle cx="15" cy="15" r="3" fill="currentColor" className="text-primary" />
      </svg>

      {/* Bottom Left Corner */}
      <svg
        className="absolute bottom-0 left-0 w-16 h-16 text-accent opacity-60 transform -rotate-90"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M 10 90 Q 10 10 90 10" />
        <path d="M 20 90 Q 20 20 90 20" />
        <circle cx="15" cy="15" r="3" fill="currentColor" className="text-primary" />
      </svg>
    </div>
  );
}
