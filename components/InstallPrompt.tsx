import { useEffect, useState } from 'react';
import { Platform, View, Text, Pressable } from 'react-native';
import { X, Download, Share } from 'lucide-react-native';

const DISMISS_KEY = 'adopt_install_dismissed';

// Chrome's beforeinstallprompt event (not in the standard lib types).
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const iosStandalone = (window.navigator as any).standalone === true;
  const displayStandalone =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches;
  return iosStandalone || displayStandalone;
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const iOSDevice = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ reports as Mac but has touch.
  const iPadOS = /Macintosh/.test(ua) && 'ontouchend' in document;
  return iOSDevice || iPadOS;
}

function isMobileWidth(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

/**
 * Web-only banner that invites mobile visitors to install Adopt to their home
 * screen. Renders nothing on native, on desktop, when already installed, or
 * once dismissed.
 */
export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof window === 'undefined') return;

    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      dismissed = false;
    }
    if (dismissed || isStandalone() || !isMobileWidth()) return;

    if (isIOS()) {
      setIos(true);
      setVisible(true);
      return;
    }

    // Android / Chrome: wait for the browser to say the app is installable.
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  }

  if (!visible) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: '#1F1B2E',
        paddingTop: 12,
        paddingBottom: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: '#FF7A4F',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Download size={22} color="#FFFFFF" strokeWidth={2.4} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Sora-Bold', fontSize: 14, color: '#FFFFFF' }}>
          Install Adopt
        </Text>
        {ios ? (
          <Text style={{ fontFamily: 'DMSans', fontSize: 12, color: '#E2DEEB', marginTop: 2 }}>
            Tap the Share icon, then “Add to Home Screen”.
          </Text>
        ) : (
          <Text style={{ fontFamily: 'DMSans', fontSize: 12, color: '#E2DEEB', marginTop: 2 }}>
            Add it to your home screen for the full app.
          </Text>
        )}
      </View>

      {ios ? (
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: 'rgba(255,255,255,0.12)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Share size={18} color="#FFFFFF" strokeWidth={2.2} />
        </View>
      ) : (
        <Pressable
          onPress={install}
          style={{
            backgroundColor: '#FF7A4F',
            paddingHorizontal: 16,
            paddingVertical: 9,
            borderRadius: 999,
          }}
        >
          <Text style={{ fontFamily: 'DMSans-SemiBold', fontSize: 13, color: '#FFFFFF' }}>
            Install
          </Text>
        </Pressable>
      )}

      <Pressable onPress={dismiss} hitSlop={8} style={{ padding: 4 }}>
        <X size={20} color="#948AA8" strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}
