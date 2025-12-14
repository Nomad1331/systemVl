// Version check hook - auto-updates app code without clearing user data
// Increment this version whenever you deploy significant updates
const APP_VERSION = "1.22.0";
const VERSION_KEY = "soloLevelingAppVersion";
const LAST_SEEN_VERSION_KEY = "soloLevelingLastSeenVersion";

export const useVersionCheck = () => {
  const checkVersion = (): { needsReload: boolean; showWhatsNew: boolean } => {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    const lastSeenVersion = localStorage.getItem(LAST_SEEN_VERSION_KEY);
    
    let needsReload = false;
    let showWhatsNew = false;

    if (storedVersion !== APP_VERSION) {
      console.log(`App updated: ${storedVersion || 'initial'} → ${APP_VERSION}`);
      
      // Store new version
      localStorage.setItem(VERSION_KEY, APP_VERSION);
      
      // If this is an update (not first load), clear only cache and reload
      if (storedVersion) {
        // Clear service worker caches if available
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
        
        // Force reload from server, not cache
        window.location.reload();
        needsReload = true;
      }
    }
    
    // Show What's New if user hasn't seen this version yet
    if (!needsReload && lastSeenVersion !== APP_VERSION && storedVersion) {
      showWhatsNew = true;
    }
    
    return { needsReload, showWhatsNew };
  };

  const markVersionAsSeen = () => {
    localStorage.setItem(LAST_SEEN_VERSION_KEY, APP_VERSION);
  };

  return { checkVersion, markVersionAsSeen, currentVersion: APP_VERSION };
};
