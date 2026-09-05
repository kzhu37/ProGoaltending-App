"use client";

import { CalendarDays, House, Library, Plus } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreaseIcon } from "@/components/ui/crease-icon";
import { ProductTour } from "./product-tour";

const navItems = [
  { href: "/", label: "Home", icon: House, match: (path: string) => path === "/" },
  { href: "/training", label: "Training", icon: CalendarDays, match: (path: string) => path.startsWith("/training") },
  { href: "/book", label: "Book", icon: Plus, primary: true, match: (path: string) => path.startsWith("/book") },
  { href: "/blueprint", label: "Blueprint", icon: CreaseIcon, match: (path: string) => path.startsWith("/blueprint") },
  { href: "/library", label: "Library", icon: Library, match: (path: string) => path.startsWith("/library") },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="stage">
      <div className="ambient-copy ambient-left" aria-hidden="true"><span>01</span> DEVELOPMENT<br />CONTINUITY</div>
      <div className="ambient-copy ambient-right" aria-hidden="true">OTTAWA<br /><span>45.4215° N</span></div>
      <div className="app-frame">
        <motion.div
          key={pathname}
          className="route-view"
          initial={{ opacity: 0, y: 7 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
        <nav className="bottom-nav" aria-label="Primary navigation">
          {navItems.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""} ${item.primary ? "nav-primary" : ""}`} aria-current={active ? "page" : undefined}>
                {active && !item.primary ? <motion.span className="nav-indicator" layoutId="nav-indicator" transition={{ type: "spring", stiffness: 440, damping: 38 }} /> : null}
                <span className="nav-icon"><Icon size={item.primary ? 26 : 21} /></span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <ProductTour />
    </div>
  );
}
