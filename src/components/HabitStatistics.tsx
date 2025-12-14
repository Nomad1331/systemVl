import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Habit } from "@/lib/storage";
import { Trophy, Target, TrendingUp, Calendar } from "lucide-react";

interface HabitStatisticsProps {
  habits: Habit[];
}

export const HabitStatistics = ({ habits }: HabitStatisticsProps) => {
  // Calculate overall statistics
  const totalHabits = habits.length;
  const activeHabits = habits.filter(h => h.status === "active").length;
  const wonHabits = habits.filter(h => h.status === "won").length;
  const lostHabits = habits.filter(h => h.status === "lost").length;
  const completedHabits = wonHabits + lostHabits;
  
  const winRate = completedHabits > 0 ? Math.round((wonHabits / completedHabits) * 100) : 0;
  
  // Calculate best streak across all habits
  const bestStreak = habits.reduce((max, habit) => {
    const dates = Object.keys(habit.completionGrid).sort();
    if (dates.length === 0) return max;
    
    let currentStreak = 0;
    let maxStreak = 0;
    let prevDate: Date | null = null;
    
    dates.forEach(dateStr => {
      if (habit.completionGrid[dateStr]) {
        const currentDate = new Date(dateStr);
        
        if (prevDate) {
          const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          if (dayDiff === 1) {
            currentStreak++;
          } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
          }
        } else {
          currentStreak = 1;
        }
        
        prevDate = currentDate;
      }
    });
    
    maxStreak = Math.max(maxStreak, currentStreak);
    return Math.max(max, maxStreak);
  }, 0);
  
  // Calculate average completion rate for active habits
  const avgCompletionRate = activeHabits > 0 
    ? Math.round(
        habits
          .filter(h => h.status === "active")
          .reduce((sum, habit) => {
            const completed = Object.values(habit.completionGrid).filter(Boolean).length;
            const rate = habit.goalDays > 0 ? (completed / habit.goalDays) * 100 : 0;
            return sum + rate;
          }, 0) / activeHabits
      )
    : 0;
  
  // Calculate total days tracked
  const totalDaysTracked = habits.reduce((sum, habit) => {
    return sum + Object.keys(habit.completionGrid).length;
  }, 0);

  if (totalHabits === 0) {
    return (
      <Card className="p-8 text-center bg-card border-border">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No habit data yet. Start tracking habits to see statistics!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-orbitron font-bold mb-4 text-neon-cyan">Habit Analytics</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-neon-cyan" />
            <div>
              <p className="text-sm text-muted-foreground">Active Habits</p>
              <p className="text-2xl font-bold text-foreground">{activeHabits}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-sm text-muted-foreground">Win Rate</p>
              <p className="text-2xl font-bold text-yellow-400">{winRate}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-sm text-muted-foreground">Best Streak</p>
              <p className="text-2xl font-bold text-green-400">{bestStreak} Days</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-neon-purple" />
            <div>
              <p className="text-sm text-muted-foreground">Days Tracked</p>
              <p className="text-2xl font-bold text-neon-purple">{totalDaysTracked}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Win/Loss Chart */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-orbitron font-bold mb-4">Habit Outcomes</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Won</span>
              <span className="text-sm font-bold text-green-400">{wonHabits} / {completedHabits}</span>
            </div>
            <Progress 
              value={completedHabits > 0 ? (wonHabits / completedHabits) * 100 : 0} 
              className="h-3 bg-muted"
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Lost</span>
              <span className="text-sm font-bold text-destructive">{lostHabits} / {completedHabits}</span>
            </div>
            <Progress 
              value={completedHabits > 0 ? (lostHabits / completedHabits) * 100 : 0} 
              className="h-3 bg-muted"
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">In Progress</span>
              <span className="text-sm font-bold text-neon-cyan">{activeHabits} / {totalHabits}</span>
            </div>
            <Progress 
              value={totalHabits > 0 ? (activeHabits / totalHabits) * 100 : 0} 
              className="h-3 bg-muted"
            />
          </div>
        </div>
      </Card>

      {/* Completion Rate by Habit */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-orbitron font-bold mb-4">Completion Rates</h3>
        <div className="space-y-4">
          {habits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No habits to display</p>
          ) : (
            habits.map((habit) => {
              const completed = Object.values(habit.completionGrid).filter(Boolean).length;
              const total = habit.status === "active" ? habit.goalDays : Math.max(Object.keys(habit.completionGrid).length, habit.goalDays);
              const rate = total > 0 ? (completed / total) * 100 : 0;
              
              return (
                <div key={habit.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{habit.icon}</span>
                      <span className="text-sm font-semibold">{habit.name}</span>
                      {habit.status === "won" && <Trophy className="w-4 h-4 text-yellow-400" />}
                      {habit.status === "lost" && <span className="text-xs text-destructive">(Lost)</span>}
                    </div>
                    <span className="text-sm font-bold" style={{ color: habit.color }}>
                      {Math.round(rate)}%
                    </span>
                  </div>
                  <Progress 
                    value={rate} 
                    className="h-2"
                    style={{
                      // @ts-ignore
                      '--progress-background': habit.color,
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {completed} / {total} days completed
                  </p>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Average Completion */}
      {activeHabits > 0 && (
        <Card className="p-6 bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 border-neon-cyan/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Average Completion Rate</p>
              <p className="text-3xl font-bold text-neon-cyan">{avgCompletionRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Across {activeHabits} active habits</p>
            </div>
            <TrendingUp className="w-12 h-12 text-neon-cyan opacity-50" />
          </div>
        </Card>
      )}
    </div>
  );
};
