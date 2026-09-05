import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// Minimal, self-hosted, GDPR-clean analytics. Events go to the `analytics_events`
// table (insert-only under RLS; no third-party SDK). Guests are real users, so
// user_id is nullable and a persistent session_id ties a guest's actions together.

const SESSION_KEY = 'adopt_session_id';
let cachedSessionId: string | null = null;
let sessionLoad: Promise<string> | null = null;

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function getSessionId(): Promise<string> {
  if (cachedSessionId) return cachedSessionId;
  if (sessionLoad) return sessionLoad;
  sessionLoad = (async () => {
    try {
      let id = await AsyncStorage.getItem(SESSION_KEY);
      if (!id) {
        id = uuid();
        await AsyncStorage.setItem(SESSION_KEY, id);
      }
      cachedSessionId = id;
      return id;
    } catch {
      cachedSessionId = uuid();
      return cachedSessionId;
    }
  })();
  return sessionLoad;
}

/**
 * Fire-and-forget analytics. Never throws, never blocks the UI, and never turns
 * a guest into an authenticated user (it only reads the existing local session).
 */
export function track(name: string, properties: Record<string, unknown> = {}): void {
  void (async () => {
    try {
      const sessionId = await getSessionId();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await supabase.from('analytics_events').insert({
        user_id: session?.user?.id ?? null,
        session_id: sessionId,
        name,
        properties,
      });
    } catch {
      // Analytics must never break the product.
    }
  })();
}
