import { Button } from "@/components/ui/button";
import { Home, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RewardCentre } from "@/components/RewardCentre";
import { XPBoostShop } from "@/components/XPBoostShop";
import { CardFrameShop } from "@/components/CardFrameShop";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { Card } from "@/components/ui/card";

const Rewards = () => {
  const navigate = useNavigate();
  const { stats } = usePlayerStats();
  const isBoostsUnlocked = stats.level >= 10;

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2 font-cinzel" style={{ textShadow: "0 0 10px hsl(var(--neon-cyan) / 0.8)" }}>
            REWARD CENTRE
          </h1>
          <p className="text-muted-foreground">Claim your rewards and purchase boosts</p>
        </div>
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="gap-2 border-primary/50 hover:bg-primary/10"
        >
          <Home className="w-4 h-4" />
          Back to Awakening
        </Button>
      </div>

      <Tabs defaultValue="rewards" className="w-full">
        <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3 mb-6">
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="frames">Card Frames</TabsTrigger>
          <TabsTrigger value="boosts" className="relative">
            XP Boosts
            {!isBoostsUnlocked && <Lock className="w-3 h-3 ml-1 inline" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rewards">
          <RewardCentre />
        </TabsContent>

        <TabsContent value="frames">
          <CardFrameShop />
        </TabsContent>

        <TabsContent value="boosts">
          {isBoostsUnlocked ? (
            <XPBoostShop />
          ) : (
            <Card className="p-12 text-center bg-card/50 border-border">
              <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-2xl font-bold text-foreground mb-2 font-cinzel">
                XP BOOSTS LOCKED
              </h2>
              <p className="text-muted-foreground mb-4">
                Reach Level 10 to unlock XP Boosts
              </p>
              <div className="text-lg font-semibold text-primary">
                Current Level: {stats.level} / 10
              </div>
              <div className="w-48 h-2 bg-muted rounded-full mx-auto mt-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                  style={{ width: `${Math.min((stats.level / 10) * 100, 100)}%` }}
                />
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Rewards;
