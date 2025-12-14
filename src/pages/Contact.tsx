import { Mail, MessageCircle, Send, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Contact = () => {
  const contactMethods = [
    {
      icon: Mail,
      name: "Gmail",
      handle: "shaikh.talha1710@gmail.com",
      link: "mailto:shaikh.talha1710@gmail.com",
      color: "text-red-400",
      bgGlow: "shadow-[0_0_20px_hsl(0,70%,50%/0.3)]",
      description: "For detailed inquiries, suggestions, or collaboration proposals",
    },
    {
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-pink-400">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      name: "Instagram",
      handle: "@nomad13313",
      link: "https://www.instagram.com/nomad13313",
      color: "text-pink-400",
      bgGlow: "shadow-[0_0_20px_hsl(330,70%,50%/0.3)]",
      description: "Follow for updates, behind-the-scenes, and quick responses",
    },
    {
      icon: Send,
      name: "Telegram",
      handle: "@Nomad1331",
      link: "https://t.me/Nomad1331",
      color: "text-sky-400",
      bgGlow: "shadow-[0_0_20px_hsl(200,70%,50%/0.3)]",
      description: "Fastest way to reach me for quick chats or urgent matters",
    },
    {
      icon: Users,
      name: "Discord",
      handle: "Nomad",
      link: "https://discord.com/users/912971486548086794",
      color: "text-indigo-400",
      bgGlow: "shadow-[0_0_20px_hsl(230,70%,50%/0.3)]",
      description: "Connect for gaming discussions or community interactions",
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 pt-20 md:pt-24 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent blur-3xl -z-10" />
        <h1 
          className="text-4xl md:text-5xl font-bold font-cinzel text-primary mb-4"
          style={{ textShadow: "0 0 30px hsl(var(--neon-cyan) / 0.6)" }}
        >
          CONTACT THE SHADOW MONARCH
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          "Even the mightiest hunter needs allies. Reach out through these dimensional gates."
        </p>
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-6" />
      </div>

      {/* Contact Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {contactMethods.map((method, index) => {
          const Icon = method.icon;
          return (
            <Card
              key={method.name}
              className={`p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 ${method.bgGlow} hover:scale-[1.02]`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-background/50 ${method.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold font-cinzel ${method.color}`}>
                    {method.name}
                  </h3>
                  <p className="text-foreground font-medium mb-2">{method.handle}</p>
                  <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
                  <Button
                    variant="outline"
                    className="w-full border-border/50 hover:border-primary/50 hover:bg-primary/10"
                    onClick={() => window.open(method.link, "_blank")}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Connect via {method.name}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Footer Message */}
      <Card className="mt-8 p-6 bg-gradient-to-r from-primary/10 via-background to-secondary/10 border-primary/30">
        <div className="text-center">
          <h3 className="text-xl font-cinzel font-bold text-foreground mb-3">
            💬 What Can You Reach Out About?
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="p-3 rounded-lg bg-background/50">
              <span className="text-primary font-bold">Bug Reports</span>
              <p>Found a glitch in the system? Report it!</p>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <span className="text-secondary font-bold">Feature Suggestions</span>
              <p>Have ideas to make this better? Share them!</p>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <span className="text-neon-purple font-bold">General Feedback</span>
              <p>Love it? Hate it? Let me know!</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Lore Quote */}
      <div className="mt-8 text-center">
        <p className="text-muted-foreground italic text-sm">
          "A hunter's greatest strength lies not in solitude, but in the connections they forge."
        </p>
        <p className="text-xs text-muted-foreground/60 mt-2">— System Message</p>
      </div>
    </div>
  );
};

export default Contact;
