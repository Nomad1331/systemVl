import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HabitGridProps {
  completionGrid: Record<string, boolean>;
  startDate: string;
  color: string;
  daysToShow?: number;
  onDateClick?: (date: string) => void;
}

const HabitGrid = ({ completionGrid, startDate, color, daysToShow = 90, onDateClick }: HabitGridProps) => {
  const start = new Date(startDate);
  const today = new Date();
  
  // Generate date range
  const dates: Date[] = [];
  for (let i = 0; i < daysToShow; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    if (date <= today) {
      dates.push(date);
    }
  }

  // Group by weeks (columns)
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  // Start from the first date's day of week
  const firstDayOfWeek = dates[0]?.getDay() || 0;
  
  // Add empty cells for days before start
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null as any);
  }

  dates.forEach((date) => {
    currentWeek.push(date);
    if (date.getDay() === 6 || date === dates[dates.length - 1]) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const getIntensity = (date: Date | null) => {
    if (!date) return 0;
    const dateStr = formatDate(date);
    return completionGrid[dateStr] ? 1 : 0;
  };

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthLabels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  return (
    <div className="flex gap-1">
      {/* Day labels */}
      <div className="flex flex-col gap-1 text-xs text-muted-foreground pr-2">
        {dayLabels.map((day, i) => (
          <div key={day} className="h-3 flex items-center justify-end" style={{ fontSize: "10px" }}>
            {i % 2 === 0 ? day.charAt(0) : ""}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex gap-1">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
              const date = week[dayIdx];
              const intensity = getIntensity(date);
              const isToday = date && formatDate(date) === formatDate(new Date());

              return (
                <TooltipProvider key={dayIdx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`h-3 w-3 rounded-sm border transition-all ${
                          isToday ? "ring-2 ring-neon-cyan" : ""
                        } ${date && onDateClick ? "cursor-pointer hover:scale-110" : ""}`}
                        style={{
                          backgroundColor: date
                            ? intensity > 0
                              ? color
                              : "hsl(var(--muted))"
                            : "transparent",
                          borderColor: date ? "hsl(var(--border))" : "transparent",
                          opacity: intensity > 0 ? 1 : 0.3,
                        }}
                        onClick={() => date && onDateClick && onDateClick(formatDate(date))}
                      />
                    </TooltipTrigger>
                    {date && (
                      <TooltipContent>
                        <p className="text-xs">
                          {date.toLocaleDateString()} -{" "}
                          {intensity > 0 ? "Completed ✓" : "Not completed"}
                          {onDateClick && <span className="block mt-1 text-neon-cyan">Click to toggle</span>}
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitGrid;
