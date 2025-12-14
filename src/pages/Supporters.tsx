import { useSupporters } from '@/hooks/useSupporters';
import { SupporterCard } from '@/components/SupporterCard';
import { CodeRedemptionModal } from '@/components/CodeRedemptionModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TIER_CONFIG, TIER_ORDER, SupporterTier } from '@/lib/supporters';
import { Crown, Heart, Users, Gift, Sparkles, ExternalLink } from 'lucide-react';

const Supporters = () => {
  const { supporters, loading, error } = useSupporters();

  // Group supporters by tier
  const supportersByTier = TIER_ORDER.reduce((acc, tier) => {
    acc[tier] = supporters.filter((s) => s.tier === tier);
    return acc;
  }, {} as Record<SupporterTier, typeof supporters>);

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Crown className="w-16 h-16 text-yellow-400" />
            <div className="absolute inset-0 animate-pulse bg-yellow-400/20 rounded-full blur-xl" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary font-cinzel mb-4" style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.5)' }}>
          HALL OF HUNTERS
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          These legendary hunters have supported the development of the Solo Leveling System. 
          Their contributions fuel the continued growth of The System.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        <CodeRedemptionModal
          trigger={
            <Button className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              <Gift className="w-4 h-4" />
              Redeem Supporter Code
            </Button>
          }
        />
        <a
          href="https://ko-fi.com/nomad1331"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" className="gap-2 border-secondary/50 hover:bg-secondary/10">
            <Heart className="w-4 h-4" />
            Become a Supporter
            <ExternalLink className="w-3 h-3" />
          </Button>
        </a>
      </div>

      {/* Tier Benefits Info */}
      <Card className="p-6 mb-12 bg-card/50 border-primary/20">
        <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Supporter Tiers
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TIER_ORDER.map((tier) => {
            const config = TIER_CONFIG[tier];
            return (
              <div
                key={tier}
                className={`p-3 rounded-lg border ${config.borderColor} ${config.bgColor}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{config.icon}</span>
                  <span className={`font-bold ${config.color}`}>{config.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{config.minDonation}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {tier === 'e_rank' && 'Badge of appreciation'}
                  {tier === 'd_rank' && 'Supporter badge'}
                  {tier === 'c_rank' && 'Badge + Hall of Fame listing'}
                  {tier === 'b_rank' && 'Badge + Exclusive "Supporter" frame'}
                  {tier === 'a_rank' && 'All above + Custom title'}
                  {tier === 's_rank' && 'All above + Custom frame designed for you'}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Loading state */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 bg-card/50">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-20 h-3" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <Card className="p-8 text-center bg-destructive/10 border-destructive/30">
          <p className="text-destructive">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && supporters.length === 0 && (
        <Card className="p-12 text-center bg-card/50 border-primary/20">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Be the First Hunter!</h3>
          <p className="text-muted-foreground mb-6">
            No supporters yet. Be the first legendary hunter to support The System!
          </p>
          <a
            href="https://ko-fi.com/nomad1331"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="gap-2 bg-gradient-to-r from-primary to-secondary">
              <Heart className="w-4 h-4" />
              Become the First Supporter
            </Button>
          </a>
        </Card>
      )}

      {/* Supporters by tier */}
      {!loading && !error && supporters.length > 0 && (
        <div className="space-y-8">
          {TIER_ORDER.map((tier) => {
            const tierSupporters = supportersByTier[tier];
            if (tierSupporters.length === 0) return null;

            const config = TIER_CONFIG[tier];
            return (
              <div key={tier}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{config.icon}</span>
                  <h2 className={`text-xl font-bold ${config.color}`}>
                    {config.name} Hunters
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    ({tierSupporters.length})
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tierSupporters.map((supporter) => (
                    <SupporterCard key={supporter.id} supporter={supporter} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-16 text-center">
        <p className="text-sm text-muted-foreground italic">
          "A Hunter's strength is measured not by their power alone, but by those who stand beside them."
        </p>
      </div>
    </div>
  );
};

export default Supporters;
