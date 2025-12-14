import { useState } from "react";
import { Swords, Target, Trophy, Zap, Crown, Palette, Gift, Sparkles, HelpCircle, Mail, BarChart3, Award, Medal, Castle, Users } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserMenu } from "@/components/UserMenu";

const navItems = [
  { to: "/", label: "Awakening", icon: Zap },
  { to: "/quests", label: "Quests", icon: Target },
  { to: "/habits", label: "Habits", icon: Trophy },
  { to: "/gates", label: "Gates", icon: Swords },
  { to: "/leaderboard", label: "Leaderboard", icon: Medal },
  { to: "/guilds", label: "Guilds", icon: Castle },
  { to: "/friends", label: "Friends", icon: Users },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/achievements", label: "Achievements", icon: Award },
  { to: "/rewards", label: "Rewards", icon: Gift },
  { to: "/customize", label: "Customize", icon: Palette },
  { to: "/supporters", label: "Hall of Fame", icon: Crown },
  { to: "/faq", label: "FAQ", icon: HelpCircle },
  { to: "/contact", label: "Contact", icon: Mail },
];

interface AppSidebarProps {
  onOpenChangelog?: () => void;
}

export function AppSidebar({ onOpenChangelog }: AppSidebarProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const handleNavClick = () => {
    setOpen(false);
  };

  const handleChangelogClick = () => {
    setOpen(false);
    onOpenChangelog?.();
  };

  return (
    <>
      {/* Fixed header with sidebar trigger */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-b border-primary/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="relative group hover:bg-primary/20 hover:text-primary border border-primary/30 hover:border-primary/60 transition-all duration-300"
                  >
                    {/* Solo Leveling styled menu icon */}
                    <div className="flex flex-col gap-1 items-center justify-center w-5 h-5">
                      <span className="block w-4 h-0.5 bg-primary rounded-full shadow-[0_0_6px_hsl(var(--neon-cyan))] group-hover:shadow-[0_0_10px_hsl(var(--neon-cyan))] transition-all duration-300 group-hover:w-5" />
                      <span className="block w-5 h-0.5 bg-primary rounded-full shadow-[0_0_6px_hsl(var(--neon-cyan))] group-hover:shadow-[0_0_10px_hsl(var(--neon-cyan))] transition-all duration-300" />
                      <span className="block w-3 h-0.5 bg-primary rounded-full shadow-[0_0_6px_hsl(var(--neon-cyan))] group-hover:shadow-[0_0_10px_hsl(var(--neon-cyan))] transition-all duration-300 group-hover:w-5" />
                    </div>
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 bg-card/95 backdrop-blur-xl border-primary/20 p-0">
                  <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-primary/20">
                      <h2 className="text-2xl font-bold text-primary font-cinzel" style={{ textShadow: "0 0 10px hsl(var(--neon-cyan) / 0.8)" }}>
                        SYSTEM
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">Solo Leveling Tracker</p>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                      {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                          key={to}
                          to={to}
                          onClick={handleNavClick}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground transition-all duration-300 hover:text-primary hover:bg-primary/10"
                          activeClassName="text-primary bg-primary/20 shadow-[0_0_20px_hsl(var(--neon-cyan)/0.3)]"
                        >
                          <Icon className="w-5 h-5" />
                          <span>{label}</span>
                        </NavLink>
                      ))}
                    </nav>

                    {/* Footer with What's New */}
                    <div className="p-4 border-t border-primary/20">
                      <Button
                        variant="ghost"
                        onClick={handleChangelogClick}
                        className="w-full justify-start gap-3 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <Sparkles className="w-5 h-5" />
                        What's New
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <h1 className="text-2xl font-bold text-primary font-cinzel" style={{ textShadow: "0 0 10px hsl(var(--neon-cyan) / 0.8)" }}>
                SYSTEM
              </h1>
            </div>
            
            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </header>
    </>
  );
}
