import React, { useEffect, useState } from 'react';

export const usePWA = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('Service Worker registered successfully:', registration);
            
            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60000); // Check every minute
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }

    // Handle PWA install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install button
      const installBtn = document.getElementById('pwa-install-btn');
      if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.addEventListener('click', async () => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
              console.log('PWA installed');
            }
            deferredPrompt = null;
          }
        });
      }
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      const installBtn = document.getElementById('pwa-install-btn');
      if (installBtn) {
        installBtn.style.display = 'none';
      }
    });
  }, []);
};

// PWA Install Banner Component
export const PWAInstallBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (!isInstalled && !localStorage.getItem('pwa-banner-dismissed')) {
      setShowBanner(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 shadow-lg z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Install InsiderJobs App</h3>
          <p className="text-sm text-blue-100">
            Install our app for faster access and offline support
          </p>
        </div>
        <div className="flex gap-2">
          <button
            id="pwa-install-btn"
            onClick={() => document.getElementById('pwa-install-btn').click()}
            className="bg-white text-blue-600 px-4 py-2 rounded font-semibold hover:bg-blue-50"
            style={{ display: 'none' }}
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
