import { useEffect, useState } from 'react';
import moment from 'dayjs';
export function useMessagePrompt() {
  useEffect(() => {
    window.onload = () => {
      let deferredPrompt;
      window.addEventListener('beforeinstallprompt', es => {
        // Stash the event so it can be triggered later.
        deferredPrompt = es;
      });
      if (deferredPrompt) {
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then(choiceResult => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
          } else {
            console.log('User dismissed the A2HS prompt');
          }
          deferredPrompt = null;
        });
      }
    };
  });
  return [];
}

const getInstallPromptLastSeenAt = promptName =>
  localStorage.getItem(promptName);

const setInstallPromptSeenToday = promptName => {
  const today = moment().toISOString();
  localStorage.setItem(promptName, today);
};

function getUserShouldBePromptedToInstall(
  promptName,
  daysToWaitBeforePromptingAgain
) {
  const lastPrompt = moment(getInstallPromptLastSeenAt(promptName));
  const daysSinceLastPrompt = moment().diff(lastPrompt, 'days');
  return (
    isNaN(daysSinceLastPrompt) ||
    daysSinceLastPrompt > daysToWaitBeforePromptingAgain
  );
}

export const useShouldShowPrompt = (
  promptName,
  daysToWaitBeforePromptingAgain = 30
) => {
  const [
    userShouldBePromptedToInstall,
    setUserShouldBePromptedToInstall,
  ] = useState(
    getUserShouldBePromptedToInstall(promptName, daysToWaitBeforePromptingAgain)
  );

  const handleUserSeeingInstallPrompt = () => {
    setUserShouldBePromptedToInstall(false);
    setInstallPromptSeenToday(promptName);
  };

  return [userShouldBePromptedToInstall, handleUserSeeingInstallPrompt];
};

const iosInstallPromptedAt = 'iosInstallPromptedAt';

const isIOS = () => {
  // @ts-ignore
  if (navigator.standalone) {
    //User has already installed the app
    return false;
  }
  const ua = window.navigator.userAgent;
  const isIPad = !!ua.match(/iPad/i);
  const isIPhone = !!ua.match(/iPhone/i);
  return isIPad || isIPhone;
};

export const useIosInstallPrompt = () => {
  const [
    userShouldBePromptedToInstall,
    handleUserSeeingInstallPrompt,
  ] = useShouldShowPrompt(iosInstallPromptedAt);

  return [
    isIOS() && userShouldBePromptedToInstall,
    handleUserSeeingInstallPrompt,
  ];
};
const webInstallPromptedAt = 'webInstallPromptedAt';

export const useWebInstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState();
  const [
    userShouldBePromptedToInstall,
    handleUserSeeingInstallPrompt,
  ] = useShouldShowPrompt(webInstallPromptedAt);

  useEffect(() => {
    const beforeInstallPromptHandler = event => {
      event.preventDefault();
      // Check if user has already been asked
      if (userShouldBePromptedToInstall) {
        // Store the event for later use
        setInstallPromptEvent(event);
      }
    };
    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    return () =>
      window.removeEventListener(
        'beforeinstallprompt',
        beforeInstallPromptHandler
      );
  }, [userShouldBePromptedToInstall]);

  const handleInstallDeclined = () => {
    handleUserSeeingInstallPrompt();
    setInstallPromptEvent(null);
  };

  const handleInstallAccepted = () => {
    // Show native prompt
    installPromptEvent.prompt();

    // Decide what to do after the user chooses
    installPromptEvent.userChoice.then(choice => {
      // If the user declined, we don't want to show the prompt again
      if (choice.outcome !== 'accepted') {
        handleUserSeeingInstallPrompt();
      }
      setInstallPromptEvent(null);
    });
  };
  return [installPromptEvent, handleInstallDeclined, handleInstallAccepted];
};

export function useOffline() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    window.addEventListener('offline', () => setOffline(true));
    window.addEventListener('online', () => setOffline(false));
  }, []);
  return [offline];
}
