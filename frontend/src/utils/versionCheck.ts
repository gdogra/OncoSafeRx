// Force browser to reload when new version is deployed
export const VERSION_CHECK = {
  current: "2024.10.04.001",
  timestamp: 1759546420000
};

export function checkForUpdates() {
  const currentVersion = localStorage.getItem('app_version');
  if (currentVersion !== VERSION_CHECK.current) {
    console.log('🔄 New version detected, forcing reload...');
    localStorage.setItem('app_version', VERSION_CHECK.current);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    return true;
  }
  return false;
}