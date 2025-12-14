import { Button } from "@/components/ui/button";
import type { PlayerStats } from "@/lib/storage";
import { Download, Share2, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { useRef, useState } from "react";
import { StatsCardFrame } from "./StatsCardFrame";

interface ShareableStatsCardProps {
  stats: PlayerStats;
  frameId?: string;
}

export const ShareableStatsCard = ({ stats, frameId }: ShareableStatsCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const createAnimationOverlay = () => {
    if (!cardRef.current) return null;

    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "1000";
    overlay.style.overflow = "hidden";

    // Create sparkle particles
    for (let i = 0; i < 30; i++) {
      const sparkle = document.createElement("div");
      sparkle.style.position = "absolute";
      sparkle.style.width = "4px";
      sparkle.style.height = "4px";
      sparkle.style.background = `hsl(${Math.random() * 360}, 100%, 70%)`;
      sparkle.style.borderRadius = "50%";
      sparkle.style.boxShadow = `0 0 10px currentColor`;
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.top = `${Math.random() * 100}%`;
      sparkle.style.animation = `sparkle ${0.5 + Math.random() * 0.5}s ease-out forwards`;
      overlay.appendChild(sparkle);
    }

    // Create glow wave
    const glowWave = document.createElement("div");
    glowWave.style.position = "absolute";
    glowWave.style.inset = "-50%";
    glowWave.style.background = "radial-gradient(circle, rgba(255,255,255,0.8), transparent 70%)";
    glowWave.style.animation = "wave 0.8s ease-out forwards";
    overlay.appendChild(glowWave);

    return overlay;
  };

  const triggerShareAnimation = async () => {
    if (!cardRef.current) return;

    setIsAnimating(true);
    const overlay = createAnimationOverlay();
    if (overlay) {
      cardRef.current.appendChild(overlay);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (overlay && cardRef.current.contains(overlay)) {
      cardRef.current.removeChild(overlay);
    }
    setIsAnimating(false);
  };

  const preloadImages = async (element: HTMLElement): Promise<void> => {
    const images = element.querySelectorAll('img');
    const promises = Array.from(images).map(async (img) => {
      // Wait for image to be ready
      if (!img.complete || img.naturalWidth === 0) {
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          // Force reload
          const src = img.src;
          img.src = '';
          img.src = src;
        });
      }
      
      // Convert to base64 data URL to avoid CORS issues with html2canvas
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 500;
        canvas.height = img.naturalHeight || 500;
        const ctx = canvas.getContext('2d');
        if (ctx && img.naturalWidth > 0 && img.naturalHeight > 0) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          img.src = dataUrl;
        }
      } catch (e) {
        console.warn('Could not convert image to base64:', e);
      }
    });
    await Promise.all(promises);
  };

  const captureCard = async (scale: number = 4) => {
    if (!cardRef.current) return null;

    // Get the actual dimensions for consistent rendering
    const rect = cardRef.current.getBoundingClientRect();

    // Wait for all images (especially frame images) to load and convert to base64
    await preloadImages(cardRef.current);
    
    // Longer delay to ensure all images are rendered after conversion
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: "#000000",
      scale: scale,
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: rect.width,
      height: rect.height,
      windowWidth: rect.width,
      windowHeight: rect.height,
      onclone: (_clonedDoc, element) => {
        // Remove all canvas elements (particle animations cause the error)
        const canvases = element.querySelectorAll('canvas');
        canvases.forEach(c => c.remove());
        
        // Remove z-index animation overlays
        const overlays = element.querySelectorAll('[style*="z-index: 1000"]');
        overlays.forEach(el => el.remove());
        
        // Fix all images - remove mixBlendMode
        const images = element.querySelectorAll('img');
        images.forEach(img => {
          (img as HTMLImageElement).style.mixBlendMode = 'normal';
        });
        
        // Remove gradient backgrounds to avoid createPattern error, BUT preserve stat bar fills
        const allElements = element.querySelectorAll('*');
        allElements.forEach(el => {
          const htmlEl = el as HTMLElement;
          const computedStyle = window.getComputedStyle(htmlEl);
          const bgImage = computedStyle.backgroundImage;
          if (bgImage && bgImage !== 'none' && bgImage.includes('gradient')) {
            // Preserve stat bar fills (they have h-full rounded-full and are inside overflow-hidden containers)
            const isStatBarFill = htmlEl.classList.contains('h-full') && 
                                  htmlEl.classList.contains('rounded-full') &&
                                  htmlEl.parentElement?.classList.contains('overflow-hidden');
            if (!isStatBarFill) {
              htmlEl.style.backgroundImage = 'none';
            }
          }
        });
        
        // WORKAROUND: html2canvas renders text slightly lower than browser
        // Apply different offsets for different text elements
        const textElements = element.querySelectorAll('h2, span, p');
        textElements.forEach(el => {
          const htmlEl = el as HTMLElement;
          // Skip rank badge text (has border) - it already has correct padding
          if (htmlEl.style.border || htmlEl.classList.contains('rank-badge')) return;
          
          const text = htmlEl.textContent?.trim() || '';
          const isStatName = ['STR', 'AGI', 'INT', 'VIT', 'SEN'].includes(text);
          const isStatEmoji = ['💪', '⚡', '🧠', '❤️', '👁️'].includes(text);
          const isStatValue = htmlEl.classList.contains('text-right') || (htmlEl.closest('.flex.items-center.gap-2') && /^\d+$/.test(text));
          const isFooterQuote = text.includes('I am a Hunter');
          
          if (isStatName) {
            // Stat names: 1px down from base (-8px + 1px = -7px)
            htmlEl.style.transform = 'translateY(-7px)';
          } else if (isStatEmoji || isStatValue) {
            // Stat values and emojis: 1px up from base (-8px - 1px = -9px)
            htmlEl.style.transform = 'translateY(-9px)';
          } else if (isFooterQuote) {
            // Footer quote: 1px up from base (-8px - 1px = -9px)
            htmlEl.style.transform = 'translateY(-9px)';
          } else {
            // Default for name, level, power (unchanged at -8px)
            htmlEl.style.transform = 'translateY(-8px)';
          }
        });
        
        // Fix rank badge text centering - it sits too low in its border
        // The rank badge needs even more shift to center in its glowing border
        const rankBadge = element.querySelector('.rounded-lg.backdrop-blur-sm');
        if (rankBadge) {
          // Apply padding-bottom to push text up within the badge
          (rankBadge as HTMLElement).style.paddingBottom = '16px';
          (rankBadge as HTMLElement).style.paddingTop = '0px';
        }
      },
    });

    return canvas;
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    try {
      toast({
        title: "✨ Creating 4K Image...",
        description: "This may take a moment for best quality",
      });

      await triggerShareAnimation();

      const canvas = await captureCard(4); // 4K scale
      if (!canvas) return;

      const link = document.createElement("a");
      link.download = `${stats.name}-stats-card-4k.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();

      toast({
        title: "✅ 4K Download Complete",
        description: "Your high-quality stats card has been saved!",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "❌ Download Failed",
        description: "There was an error generating your stats card",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      toast({
        title: "✨ Creating 4K Image...",
        description: "Preparing your shareable card",
      });

      await triggerShareAnimation();

      const canvas = await captureCard(4); // 4K scale
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast({
            title: "❌ Share Failed",
            description: "Could not generate image",
            variant: "destructive",
          });
          return;
        }

        if (navigator.share && navigator.canShare?.({ files: [new File([blob], "stats.png", { type: "image/png" })] })) {
          const file = new File([blob], `${stats.name}-stats-4k.png`, { type: "image/png" });
          await navigator.share({
            files: [file],
            title: "My Hunter Stats",
            text: `Check out my Level ${stats.level} ${stats.rank} Hunter stats!`,
          });
        } else {
          // Fallback to download if share is not supported
          const link = document.createElement("a");
          link.download = `${stats.name}-stats-card-4k.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
          
          toast({
            title: "✅ Downloaded",
            description: "Share not supported. 4K image downloaded instead.",
          });
        }
      }, "image/png", 1.0);
    } catch (error) {
      console.error("Share error:", error);
      toast({
        title: "❌ Share Failed",
        description: "There was an error sharing your stats card",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center overflow-visible py-4">
        {/* Extra padding ensures frame overflow is fully captured when saving image */}
        <div ref={cardRef} className="p-12 -m-12">
          <StatsCardFrame stats={stats} frameId={frameId} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 justify-center">
        <Button
          onClick={handleDownload}
          disabled={isAnimating}
          variant="outline"
          className="gap-2 border-primary/50 hover:bg-primary/10"
        >
          <Download className="w-4 h-4" />
          Download 4K Card
        </Button>
        <Button
          onClick={handleShare}
          disabled={isAnimating}
          className="gap-2 bg-gradient-to-r from-primary to-secondary"
        >
          <Sparkles className="w-4 h-4" />
          Share Stats
        </Button>
      </div>
    </div>
  );
};
