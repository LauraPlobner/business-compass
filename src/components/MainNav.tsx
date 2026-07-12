import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { GitCompareArrows, Lightbulb, Scale } from "lucide-react";

const items = [
  { base: "/ideen", label: "Business-Ideen", icon: Lightbulb },
  { base: "/vergleich", label: "Vergleich", icon: GitCompareArrows },
  { base: "/kriterien", label: "Kriterien", icon: Scale },
];

export function MainNav() {
  const { pathname } = useLocation();
  // Wer von Vergleich oder Kriterien zurückkommt, landet wieder bei der zuletzt offenen Idee.
  const lastIdeaPath = useRef("/ideen");

  useEffect(() => {
    if (pathname.startsWith("/ideen")) lastIdeaPath.current = pathname;
  }, [pathname]);

  return (
    <nav className="flex items-stretch gap-1">
      {items.map(({ base, label, icon: Icon }) => {
        const active = pathname === base || pathname.startsWith(`${base}/`);
        return (
          <Link
            key={base}
            to={base === "/ideen" ? lastIdeaPath.current : base}
            className={`flex items-center gap-1.5 px-3 border-b-2 text-sm font-semibold transition-colors ${
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
