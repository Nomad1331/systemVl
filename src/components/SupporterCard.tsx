import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Supporter, TIER_CONFIG } from '@/lib/supporters';
import { Crown, Sparkles } from 'lucide-react';

interface SupporterCardProps {
  supporter: Supporter;
}

export const SupporterCard = ({ supporter }: SupporterCardProps) => {
  const tierConfig = TIER_CONFIG[supporter.tier];

  return (
    <Card
      className={`relative overflow-hidden p-4 transition-all duration-300 hover:scale-[1.02] border-2 ${tierConfig.borderColor} ${tierConfig.bgColor} shadow-lg hover:shadow-xl ${tierConfig.glowColor}`}
    >
      {/* Glow effect for S-Rank */}
      {supporter.tier === 's_rank' && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-orange-500/10 animate-pulse" />
      )}

      {/* Header with tier icon and badge */}
      <div className="relative flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{tierConfig.icon}</span>
          <div>
            <h3 className={`font-bold text-lg ${tierConfig.color}`}>
              {supporter.hunter_name}
            </h3>
            {supporter.custom_title && (
              <p className="text-xs text-secondary italic">
                「 {supporter.custom_title} 」
              </p>
            )}
          </div>
        </div>
        <Badge className={`${tierConfig.bgColor} ${tierConfig.color} border ${tierConfig.borderColor}`}>
          {tierConfig.name}
        </Badge>
      </div>

      {/* Custom frame indicator for S-Rank */}
      {supporter.custom_frame_id && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 pt-2 border-t border-border/30">
          <Sparkles className="w-3 h-3 text-secondary" />
          <span>Custom Frame Owner</span>
        </div>
      )}

      {/* S-Rank crown decoration */}
      {supporter.tier === 's_rank' && (
        <div className="absolute top-0 right-0 opacity-10">
          <Crown className="w-16 h-16 text-yellow-400" />
        </div>
      )}

      {/* Decorative corner elements */}
      <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 ${tierConfig.borderColor} opacity-50`} />
      <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 ${tierConfig.borderColor} opacity-50`} />
    </Card>
  );
};
