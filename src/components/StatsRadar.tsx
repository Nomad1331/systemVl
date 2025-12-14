import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface StatsRadarProps {
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  sense: number;
}

export const StatsRadar = ({ strength, agility, intelligence, vitality, sense }: StatsRadarProps) => {
  const data = [
    { stat: "STR", value: strength, fullMark: 100 },
    { stat: "AGI", value: agility, fullMark: 100 },
    { stat: "INT", value: intelligence, fullMark: 100 },
    { stat: "VIT", value: vitality, fullMark: 100 },
    { stat: "SEN", value: sense, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="stat"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
        />
        <Radar
          name="Stats"
          dataKey="value"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};
