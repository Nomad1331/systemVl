import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Gift, Bug, Wrench } from "lucide-react";

interface ChangelogEntry {
  type: "added" | "fixed" | "changed";
  text: string;
}

interface VersionChangelog {
  version: string;
  date: string;
  entries: ChangelogEntry[];
}

// Keywords that indicate technical/internal changes users don't care about
const TECHNICAL_KEYWORDS = [
  /\d+px/i,           // pixel values
  /\d+ms/i,           // milliseconds
  /v\d+\)/i,          // version numbers in parentheses like (v14)
  /html2canvas/i,     // library names
  /onclone/i,
  /DOM/i,
  /CSS/i,
  /flex/i,
  /padding/i,
  /margin/i,
  /inset/i,
  /offset/i,
  /alignment/i,
  /className/i,
  /component/i,
  /src\//i,           // file paths
  /\.tsx?/i,          // file extensions
  /\.ts/i,
  /localStorage/i,
  /base64/i,
  /CORS/i,
  /gradient/i,
  /canvas element/i,
  /cloned/i,
  /render/i,
  /capture/i,
  /propagation/i,
  /onClick/i,
  /handler/i,
];

// Parse a single changelog entry to user-friendly format
const parseEntryText = (text: string): string | null => {
  // Skip sub-items (lines that start with more indentation)
  if (text.match(/^\s{4,}-/)) return null;
  
  // Skip if it contains technical keywords
  for (const pattern of TECHNICAL_KEYWORDS) {
    if (pattern.test(text)) return null;
  }
  
  // Clean up the text - remove bold markers and leading dash
  let cleaned = text.replace(/^\s*-\s*/, '').replace(/\*\*/g, '');
  
  // Extract just the main feature name if it has a colon description
  const colonMatch = cleaned.match(/^([^:]+):/);
  if (colonMatch) {
    cleaned = colonMatch[1].trim();
  }
  
  // Skip if too short or still looks technical
  if (cleaned.length < 5) return null;
  if (cleaned.toLowerCase().includes('technical')) return null;
  
  return cleaned;
};

// Parse CHANGELOG.md content
const parseChangelog = (content: string): VersionChangelog[] => {
  const versions: VersionChangelog[] = [];
  const versionBlocks = content.split(/^## \[/m).slice(1); // Split by version headers
  
  for (const block of versionBlocks.slice(0, 10)) { // Only last 10 versions max
    const headerMatch = block.match(/^([\d.]+)\]\s*-\s*(\d{4}-\d{2}-\d{2})/);
    if (!headerMatch) continue;
    
    const [, version, date] = headerMatch;
    const entries: ChangelogEntry[] = [];
    
    // Extract Added section - only top-level items (not indented sub-items)
    const addedMatch = block.match(/### Added\n([\s\S]*?)(?=###|$)/);
    if (addedMatch) {
      const lines = addedMatch[1].split('\n').filter(l => l.match(/^- /)); // Only lines starting with "- " (no indentation)
      for (const line of lines) {
        const parsed = parseEntryText(line);
        if (parsed) entries.push({ type: 'added', text: parsed });
      }
    }
    
    // Extract Fixed section - only top-level items
    const fixedMatch = block.match(/### Fixed\n([\s\S]*?)(?=###|$)/);
    if (fixedMatch) {
      const lines = fixedMatch[1].split('\n').filter(l => l.match(/^- /));
      for (const line of lines) {
        const parsed = parseEntryText(line);
        if (parsed) entries.push({ type: 'fixed', text: parsed });
      }
    }
    
    // Extract Changed section - only top-level items
    const changedMatch = block.match(/### Changed\n([\s\S]*?)(?=###|$)/);
    if (changedMatch) {
      const lines = changedMatch[1].split('\n').filter(l => l.match(/^- /));
      for (const line of lines) {
        const parsed = parseEntryText(line);
        if (parsed) entries.push({ type: 'changed', text: parsed });
      }
    }
    
    // Only include versions that have user-visible changes
    if (entries.length > 0) {
      versions.push({ version, date, entries });
    }
  }
  
  return versions;
};

const ICON_MAP = {
  added: <Gift className="w-4 h-4 text-green-400" />,
  fixed: <Bug className="w-4 h-4 text-yellow-400" />,
  changed: <Wrench className="w-4 h-4 text-blue-400" />,
};

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion: string;
}

export const WhatsNewModal = ({ isOpen, onClose, currentVersion }: WhatsNewModalProps) => {
  const [changelog, setChangelog] = useState<VersionChangelog[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      fetch('/CHANGELOG.md')
        .then(res => res.text())
        .then(content => {
          const parsed = parseChangelog(content);
          // Show only versions with changes, limit to 5
          setChangelog(parsed.slice(0, 5));
        })
        .catch(err => {
          console.error('Failed to load changelog:', err);
          setChangelog([]);
        });
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-background via-background to-background/95 border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-cinzel text-primary">
            <Sparkles className="w-5 h-5" />
            What's New
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Version {currentVersion} updates
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {changelog.length === 0 ? (
              <p className="text-sm text-muted-foreground">Loading updates...</p>
            ) : (
              changelog.map((release) => (
                <div key={release.version} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">v{release.version}</span>
                    <span className="text-xs text-muted-foreground">• {release.date}</span>
                  </div>
                  <ul className="space-y-1.5 pl-1">
                    {release.entries.map((entry, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                        <span className="mt-0.5 shrink-0">{ICON_MAP[entry.type]}</span>
                        <span>{entry.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <Button onClick={onClose} className="w-full mt-2">
          Got it!
        </Button>
      </DialogContent>
    </Dialog>
  );
};
