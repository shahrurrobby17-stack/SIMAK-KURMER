import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp, 
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { UserAccount } from '../types';
import { getClientDeviceInfo, formatDateTimeIndonesian } from './userLoginLogService';

export interface UserPresence {
  id: string;
  email: string;
  uid?: string;
  name: string;
  role: string;
  schoolName: string;
  isOnline: boolean;
  lastSeenMillis: number;
  lastSeenFormatted: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  os: string;
}

const PRESENCE_CACHE_KEY = 'simak_presence_cache_v1';
const BROADCAST_CHANNEL_NAME = 'simak_presence_channel';

// Helper to sanitize email as valid Firestore document ID
export function sanitizeEmailToId(email: string): string {
  if (!email) return 'unknown_user';
  return email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
}

// Local cache helpers
export function getLocalPresenceMap(): Record<string, UserPresence> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PRESENCE_CACHE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse local presence cache:', e);
  }
  return {};
}

export function saveLocalPresenceMap(map: Record<string, UserPresence>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRESENCE_CACHE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('Failed to save local presence cache:', e);
  }
}

// Set user online/offline presence
export async function setUserOnlinePresence(user: Partial<UserAccount>, isOnline: boolean): Promise<void> {
  if (!user || !user.email) return;

  const emailNorm = user.email.toLowerCase().trim();
  const docId = sanitizeEmailToId(emailNorm);
  const now = new Date();
  const nowMillis = now.getTime();
  const deviceInfo = getClientDeviceInfo();

  const presenceData: UserPresence = {
    id: docId,
    email: emailNorm,
    uid: user.uid || '',
    name: user.name || 'Pengguna SIMAK',
    role: user.role || 'Guru Pengampu',
    schoolName: user.schoolName || 'Satuan Pendidikan',
    isOnline: isOnline,
    lastSeenMillis: nowMillis,
    lastSeenFormatted: formatDateTimeIndonesian(now),
    deviceType: deviceInfo.deviceType,
    browser: deviceInfo.browser,
    os: deviceInfo.os
  };

  // 1. Update local storage cache immediately
  const localMap = getLocalPresenceMap();
  localMap[emailNorm] = presenceData;
  saveLocalPresenceMap(localMap);

  // 2. Broadcast across tabs in the same browser
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.postMessage({ type: 'PRESENCE_UPDATE', data: presenceData });
      channel.close();
    }
  } catch (e) {
    // Ignore broadcast errors
  }

  // 3. Write to Firestore collection `userPresence`
  try {
    const presenceRef = doc(db, 'userPresence', docId);
    await setDoc(presenceRef, {
      ...presenceData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (firestoreErr: any) {
    // Handled gracefully in offline or restricted environments
    console.warn('Firestore userPresence note:', firestoreErr?.message || firestoreErr);
  }
}

/**
 * Starts continuous heartbeat for the active user.
 * Sends periodic keep-alive pings and sets offline on unload.
 */
export function startPresenceHeartbeat(user: UserAccount): () => void {
  if (!user || !user.email) return () => {};

  let isDestroyed = false;
  let lastPing = Date.now();

  // Initial online registration
  setUserOnlinePresence(user, true).catch(() => {});

  // Periodic heartbeat every 10 seconds
  const intervalId = window.setInterval(() => {
    if (isDestroyed) return;
    setUserOnlinePresence(user, true).catch(() => {});
    lastPing = Date.now();
  }, 10000);

  // User activity listeners (throttled) to renew active status on interaction
  const handleUserActivity = () => {
    if (isDestroyed) return;
    const now = Date.now();
    if (now - lastPing > 6000) {
      lastPing = now;
      setUserOnlinePresence(user, true).catch(() => {});
    }
  };

  window.addEventListener('mousemove', handleUserActivity, { passive: true });
  window.addEventListener('keydown', handleUserActivity, { passive: true });
  window.addEventListener('click', handleUserActivity, { passive: true });
  window.addEventListener('scroll', handleUserActivity, { passive: true });

  // Handle tab visibility (when tab is active vs background)
  const handleVisibilityChange = () => {
    if (isDestroyed) return;
    if (document.visibilityState === 'visible') {
      setUserOnlinePresence(user, true).catch(() => {});
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Handle unload / page exit
  const handleUnload = () => {
    if (isDestroyed) return;
    // Attempt sync / quick offline update
    setUserOnlinePresence(user, false).catch(() => {});
  };
  window.addEventListener('beforeunload', handleUnload);
  window.addEventListener('pagehide', handleUnload);

  // Cleanup handler
  return () => {
    isDestroyed = true;
    window.clearInterval(intervalId);
    window.removeEventListener('mousemove', handleUserActivity);
    window.removeEventListener('keydown', handleUserActivity);
    window.removeEventListener('click', handleUserActivity, { passive: true } as any);
    window.removeEventListener('scroll', handleUserActivity);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleUnload);
    window.removeEventListener('pagehide', handleUnload);

    // Mark as offline when session ends
    setUserOnlinePresence(user, false).catch(() => {});
  };
}

/**
 * Subscribes to real-time presence data from Firestore & BroadcastChannel.
 * Provides evaluated presence map with expired timeouts automatically checked.
 */
export function subscribeToUserPresence(callback: (presenceMap: Record<string, UserPresence>) => void): () => void {
  let isSubscribed = true;
  let localCache = getLocalPresenceMap();

  // Helper to recompute timeout status
  // A user is considered online if:
  // 1) isOnline === true
  // 2) lastSeenMillis is within the last 60 seconds (60,000 ms)
  const evaluateMap = (rawMap: Record<string, UserPresence>): Record<string, UserPresence> => {
    const evaluated: Record<string, UserPresence> = {};
    const now = Date.now();

    for (const key of Object.keys(rawMap)) {
      const item = rawMap[key];
      const elapsed = now - (item.lastSeenMillis || 0);
      const isStillFresh = item.isOnline && elapsed < 60000; // 60 seconds threshold

      evaluated[key] = {
        ...item,
        isOnline: isStillFresh
      };
    }
    return evaluated;
  };

  // Immediate emission from cache
  callback(evaluateMap(localCache));

  // 1. Listen to BroadcastChannel for zero-latency multi-tab updates
  let broadcastChannel: BroadcastChannel | null = null;
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      broadcastChannel.onmessage = (event) => {
        if (!isSubscribed) return;
        if (event.data?.type === 'PRESENCE_UPDATE' && event.data?.data) {
          const item: UserPresence = event.data.data;
          localCache[item.email.toLowerCase().trim()] = item;
          saveLocalPresenceMap(localCache);
          callback(evaluateMap(localCache));
        }
      };
    }
  } catch (e) {
    // Ignore channel errors
  }

  // 2. Real-time Firestore onSnapshot listener
  let unsubscribeFirestore = () => {};
  try {
    const presenceCol = collection(db, 'userPresence');
    unsubscribeFirestore = onSnapshot(presenceCol, (snapshot) => {
      if (!isSubscribed) return;

      const remoteMap: Record<string, UserPresence> = { ...localCache };

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.email) {
          const emailKey = data.email.toLowerCase().trim();
          let millis = data.lastSeenMillis || 0;
          if (data.updatedAt instanceof Timestamp) {
            millis = Math.max(millis, data.updatedAt.toMillis());
          }

          remoteMap[emailKey] = {
            id: docSnap.id,
            email: emailKey,
            uid: data.uid || '',
            name: data.name || 'Pengguna SIMAK',
            role: data.role || 'Guru Pengampu',
            schoolName: data.schoolName || '',
            isOnline: Boolean(data.isOnline),
            lastSeenMillis: millis,
            lastSeenFormatted: data.lastSeenFormatted || formatDateTimeIndonesian(new Date(millis)),
            deviceType: data.deviceType || 'Desktop',
            browser: data.browser || 'Browser',
            os: data.os || 'OS'
          };
        }
      });

      localCache = remoteMap;
      saveLocalPresenceMap(remoteMap);
      callback(evaluateMap(remoteMap));
    }, (error) => {
      console.warn('userPresence onSnapshot listener note:', error?.message || error);
      callback(evaluateMap(localCache));
    });
  } catch (err) {
    console.warn('subscribeToUserPresence error:', err);
  }

  // 3. Regular evaluation ticker (every 3 seconds) to automatically transition expired sessions to offline
  const tickerId = window.setInterval(() => {
    if (!isSubscribed) return;
    callback(evaluateMap(localCache));
  }, 3000);

  return () => {
    isSubscribed = false;
    window.clearInterval(tickerId);
    unsubscribeFirestore();
    if (broadcastChannel) {
      try {
        broadcastChannel.close();
      } catch (e) {}
    }
  };
}
