// No-op stand-in for @supabase/realtime-js, aliased in next.config.
//
// Why: this app uses Supabase Realtime 0× (no `.channel()`/`.subscribe()` anywhere), yet
// `@supabase/supabase-js`'s SupabaseClient constructor *hard-instantiates* a RealtimeClient
// and does `export * from '@supabase/realtime-js'`. That pulls the whole websocket/presence/
// serializer bundle — and its inlined core-js polyfills (PSI "legacy JavaScript") — into the
// client chunk for nothing. Auth/DB/Storage do not depend on realtime, so no-oping it is safe.
//
// Surface: supabase-js only ever calls `new RealtimeClient()` + `setAuth()` automatically; the
// channel/* methods fire only if app code uses realtime (it doesn't). If realtime is ever needed,
// remove the `@supabase/realtime-js` alias in next.config and this file.

export class RealtimeClient {
  constructor() {}
  setAuth() {}
  connect() {}
  disconnect() {}
  getChannels() {
    return []
  }
  removeChannel() {
    return Promise.resolve('ok')
  }
  removeAllChannels() {
    return Promise.resolve([])
  }
  channel() {
    throw new Error(
      'Supabase Realtime is disabled in this build (realtime-stub). Remove the ' +
        "'@supabase/realtime-js' alias in next.config.ts to re-enable it.",
    )
  }
}

export class RealtimeChannel {}
export class RealtimePresence {}
export class WebSocketFactory {}

export const REALTIME_LISTEN_TYPES = {}
export const REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = {}
export const REALTIME_PRESENCE_LISTEN_EVENTS = {}
export const REALTIME_SUBSCRIBE_STATES = {}
export const REALTIME_CHANNEL_STATES = {}
