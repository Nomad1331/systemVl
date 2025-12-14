import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCodeRedemption } from '@/hooks/useCodeRedemption';
import { TIER_CONFIG } from '@/lib/supporters';
import { Gift, Sparkles, Check, Crown } from 'lucide-react';

interface CodeRedemptionModalProps {
  trigger?: React.ReactNode;
}

export const CodeRedemptionModal = ({ trigger }: CodeRedemptionModalProps) => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const { benefits, loading, redeemCode, isSupporter } = useCodeRedemption();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await redeemCode(code);
    if (success) {
      setCode('');
      // Keep modal open to show success state
    }
  };

  const tierConfig = benefits.tier ? TIER_CONFIG[benefits.tier] : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="gap-2 border-secondary/50 hover:bg-secondary/10"
          >
            <Gift className="w-4 h-4" />
            Redeem Code
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card border-primary/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Supporter Redemption
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your supporter code to unlock exclusive benefits
          </DialogDescription>
        </DialogHeader>

        {isSupporter && tierConfig ? (
          // Already a supporter - show benefits
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${tierConfig.borderColor} ${tierConfig.bgColor}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{tierConfig.icon}</span>
                <div>
                  <p className={`font-bold ${tierConfig.color}`}>{tierConfig.displayName}</p>
                  {benefits.hunterName && (
                    <p className="text-sm text-muted-foreground">{benefits.hunterName}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Your Benefits:</p>
                <ul className="space-y-1">
                  {benefits.badge && (
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-green-400" />
                      Supporter Badge
                    </li>
                  )}
                  {benefits.title && (
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-green-400" />
                      Title: {benefits.title}
                    </li>
                  )}
                  {benefits.frame && (
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-green-400" />
                      Exclusive Frame Unlocked
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Thank you for supporting the Solo Leveling System!
            </p>
          </div>
        ) : (
          // Not a supporter - show redemption form
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter your code (e.g., HUNTER-XXXX)"
                className="bg-background/50 border-border/50 text-center font-mono tracking-wider"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              {loading ? 'Redeeming...' : 'Redeem Code'}
            </Button>

            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-center text-muted-foreground mb-3">
                Don't have a code? Support us to get one!
              </p>
              <a
                href="https://ko-fi.com/nomad1331"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 border-secondary/50 hover:bg-secondary/10"
                >
                  <Crown className="w-4 h-4" />
                  Become a Supporter
                </Button>
              </a>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
