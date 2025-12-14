import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";

interface FirstTimeSetupProps {
  open: boolean;
  onComplete: (name: string, avatar: string, title: string) => void;
}

const AVATAR_OPTIONS = [
  { id: "fighter", emoji: "⚔️", label: "Fighter" },
  { id: "tanker", emoji: "🛡️", label: "Tanker" },
  { id: "mage", emoji: "🔮", label: "Mage" },
  { id: "assassin", emoji: "🗡️", label: "Assassin" },
  { id: "ranger", emoji: "🏹", label: "Ranger" },
  { id: "healer", emoji: "💚", label: "Healer" },
];

const TITLE_OPTIONS = [
  "Awakened Hunter",
  "Novice Warrior",
  "The Weakest Hunter",
  "System User",
  "Rising Hunter",
];

export const FirstTimeSetup = ({ open, onComplete }: FirstTimeSetupProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("fighter");
  const [selectedTitle, setSelectedTitle] = useState("Awakened Hunter");

  const handleComplete = () => {
    onComplete(name || "Hunter", selectedAvatar, selectedTitle);
  };

  const handleSignIn = () => {
    // Navigate to auth page - user will be redirected back after login
    navigate("/auth");
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px] bg-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-3xl font-cinzel text-center bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            {step === 1 ? "AWAKENING INITIATED" : step === 2 ? "CHOOSE YOUR CLASS" : "CLAIM YOUR TITLE"}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {step === 1 && "The System has chosen you. What shall we call you?"}
            {step === 2 && "Select your class to represent your journey"}
            {step === 3 && "Choose a title that defines your beginning"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-foreground">Hunter Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  className="mt-2 bg-background/50 border-primary/30 focus:border-primary"
                  maxLength={20}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                This name will appear on your status window (you can change it later in Customize Profile)
              </p>
              
              {/* Sign In Option */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground text-center mb-3">
                  Already have an account?
                </p>
                <Button
                  variant="outline"
                  onClick={handleSignIn}
                  className="w-full border-secondary/50 hover:bg-secondary/10 gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In to Continue
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedAvatar === avatar.id
                        ? "border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                        : "border-border bg-background/50 hover:border-primary/50"
                    }`}
                  >
                    <div className="text-4xl mb-2">{avatar.emoji}</div>
                    <p className="text-xs font-medium text-foreground">{avatar.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {TITLE_OPTIONS.map((title) => (
                  <button
                    key={title}
                    onClick={() => setSelectedTitle(title)}
                    className={`p-3 rounded-lg border transition-all text-left ${
                      selectedTitle === title
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
                        : "border-border bg-background/50 text-foreground hover:border-primary/50"
                    }`}
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1 border-border"
              >
                Back
              </Button>
            )}
            <Button
              onClick={() => {
                if (step < 3) {
                  setStep(step + 1);
                } else {
                  handleComplete();
                }
              }}
              disabled={step === 1 && !name.trim()}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              {step === 3 ? "Begin My Journey" : "Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
