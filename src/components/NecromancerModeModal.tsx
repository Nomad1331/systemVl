import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skull, Shield, AlertTriangle, Check } from "lucide-react";
import { playClick, playSuccess, playError } from "@/lib/sounds";

interface NecromancerModeModalProps {
  open: boolean;
  onClose: () => void;
  onSelectMode: (mode: "normal" | "hard") => void;
}

export const NecromancerModeModal = ({ open, onClose, onSelectMode }: NecromancerModeModalProps) => {
  const [showHardConfirm, setShowHardConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  
  const isConfirmValid = confirmText.toLowerCase() === "i accept this contract";

  const handleNormalSelect = () => {
    playSuccess();
    onSelectMode("normal");
    onClose();
  };

  const handleHardSelect = () => {
    playClick();
    setShowHardConfirm(true);
  };

  const handleHardConfirm = () => {
    if (isConfirmValid) {
      playSuccess();
      onSelectMode("hard");
      onClose();
      setShowHardConfirm(false);
      setConfirmText("");
    } else {
      playError();
    }
  };

  const handleClose = () => {
    setShowHardConfirm(false);
    setConfirmText("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cinzel text-center text-purple-400 flex items-center justify-center gap-2">
            <Skull className="w-6 h-6" />
            Choose Your Path
            <Skull className="w-6 h-6" />
          </DialogTitle>
        </DialogHeader>

        {!showHardConfirm ? (
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            {/* Normal Mode */}
            <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-background border-2 border-blue-500/30 hover:border-blue-500/60 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <Shield className="w-10 h-10 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-blue-400 font-cinzel tracking-wide">Normal Mode</h3>
                  <p className="text-sm text-blue-300/80 font-medium">(Recommended)</p>
                  <p className="text-base text-muted-foreground">Safe Attempt</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-base text-foreground font-medium">If you fail (miss a streak):</p>
                <ul className="space-y-2 text-base text-muted-foreground list-disc list-inside pl-1">
                  <li>Legendary Challenge streak resets to 0</li>
                  <li>Lose <span className="text-blue-400 font-semibold">5%</span> of each major stat</li>
                  <li className="text-sm text-muted-foreground/80">(XP, Gold, Credits, Gems, STR, AGI, INT, VIT, SEN)</li>
                </ul>
                <div className="pt-3 border-t border-blue-500/20 space-y-1">
                  <p className="text-green-400 text-sm font-medium">✓ Keep all titles, classes, progress, frames</p>
                  <p className="text-green-400 text-sm font-medium">✓ May reattempt the challenge anytime</p>
                </div>
              </div>

              <div className="p-4 bg-blue-950/50 border border-blue-500/30 rounded-lg mb-4">
                <p className="text-blue-400 font-bold text-sm mb-2">Reward:</p>
                <p className="text-base text-foreground">💀 Unlock Necromancer Class</p>
              </div>

              <div className="p-4 bg-blue-900/30 border border-blue-500/20 rounded-lg mb-4">
                <p className="text-blue-300 font-bold text-sm mb-2">Normal Mode Selected</p>
                <p className="text-base text-muted-foreground">If you miss a day:</p>
                <p className="text-base text-muted-foreground">– Your streak resets</p>
                <p className="text-base text-muted-foreground">– You lose 5% of your stats</p>
                <p className="text-green-400 font-medium mt-2">Your account remains safe.</p>
              </div>

              <Button
                onClick={handleNormalSelect}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-base font-semibold h-12"
              >
                <Shield className="w-5 h-5 mr-2" />
                Choose Normal Mode
              </Button>
            </Card>

            {/* Hard Mode */}
            <Card className="p-6 bg-gradient-to-br from-red-900/20 to-background border-2 border-red-500/30 hover:border-red-500/60 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-red-500/20">
                  <Skull className="w-10 h-10 text-red-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-red-400 font-cinzel tracking-wide">Hard Mode</h3>
                  <p className="text-sm text-red-300/80 font-medium">(Serious Users Only)</p>
                  <p className="text-base text-muted-foreground">High-Risk Contract</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-base text-foreground font-medium">If you fail (miss a streak):</p>
                <ul className="space-y-2 text-base text-red-400/90 list-disc list-inside pl-1">
                  <li>ALL progress resets</li>
                  <li>All stats reset to 0</li>
                  <li>All XP, Gold, Credits reset</li>
                  <li>All titles removed</li>
                  <li>All classes reset to starting class</li>
                  <li>All ongoing quests reset</li>
                  <li>Legendary Challenge goes back to 0/90</li>
                </ul>
                <div className="pt-3 border-t border-red-500/20 space-y-1">
                  <p className="text-green-400 text-sm font-medium">✓ You keep frames</p>
                  <p className="text-green-400 text-sm font-medium">✓ May reattempt the challenge anytime</p>
                </div>
              </div>

              <div className="p-4 bg-red-950/50 border border-red-500/30 rounded-lg mb-4">
                <p className="text-red-400 font-bold text-sm mb-2">Rewards:</p>
                <div className="space-y-1 text-base text-foreground">
                  <p>💀 Unlock Necromancer Class</p>
                  <p>⬆️ +10 Levels</p>
                  <p>💪 +20 to all stats (STR, AGI, INT, VIT, SEN)</p>
                  <p>💎 100 Credits, 5 Gold, 5 Gems</p>
                </div>
              </div>

              <div className="p-4 bg-red-900/30 border border-red-500/20 rounded-lg mb-4">
                <p className="text-red-400 font-bold text-sm flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4" /> WARNING:
                </p>
                <p className="text-base text-muted-foreground mb-1">If you miss a day:</p>
                <div className="space-y-1 text-base text-red-400/90">
                  <p>– All stats reset</p>
                  <p>– All XP, Gold, Credits reset</p>
                  <p>– All titles removed</p>
                  <p>– All classes reset</p>
                  <p>– All progress wiped</p>
                </div>
                <p className="text-red-500 font-bold text-lg mt-3">One mistake ends everything.</p>
              </div>

              <Button
                onClick={handleHardSelect}
                variant="outline"
                className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-500 text-base font-semibold h-12"
              >
                <Skull className="w-5 h-5 mr-2" />
                Choose Hard Mode
              </Button>
            </Card>
          </div>
        ) : (
          /* Hard Mode Confirmation */
          <div className="space-y-6 mt-4">
            <Card className="p-6 bg-gradient-to-br from-red-900/30 to-background border-2 border-red-500/50">
              <div className="text-center mb-6">
                <Skull className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-2xl font-bold text-red-400 font-cinzel mb-2">Final Warning</h3>
                <p className="text-muted-foreground">
                  You are about to enter the High-Risk Contract. This cannot be undone.
                </p>
              </div>

              <div className="p-4 bg-red-950/50 border border-red-500/30 rounded-lg mb-6">
                <p className="text-red-400 font-semibold mb-2">By accepting, you acknowledge:</p>
                <ul className="text-sm text-red-400/80 space-y-1">
                  <li>• Missing a single day will reset ALL your progress</li>
                  <li>• All stats, XP, Gold, Credits, Gems will be wiped</li>
                  <li>• All titles and classes will be removed</li>
                  <li>• There are no second chances</li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Type <span className="text-red-400 font-mono">"I accept this contract"</span> to confirm:
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="I accept this contract"
                  className="bg-background/50 border-red-500/30 focus:border-red-500 text-center"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowHardConfirm(false)}
                  className="flex-1"
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleHardConfirm}
                  disabled={!isConfirmValid}
                  className={`flex-1 ${
                    isConfirmValid
                      ? "bg-gradient-to-r from-red-600 to-red-400 hover:from-red-500 hover:to-red-300"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isConfirmValid && <Check className="w-4 h-4 mr-2" />}
                  Accept Contract
                </Button>
              </div>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
