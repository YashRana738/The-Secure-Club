/**
 * The Secure Club - Session Subsystem (Standard ES Module)
 *
 * Core Metaphor:
 * Entering the club grants an "invisible club card" (session).
 * The club remembers who authenticated so subsequent actions (orders, games)
 * are tied to that identity without asking for the password every time.
 *
 * Never expose raw tokens or cookies in normal gameplay.
 */

export class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.currentSessionId = null;
    this.reset();
  }

  reset() {
    this.sessions.clear();
    this.currentSessionId = null;
  }

  /**
   * Creates an active session when authentication succeeds.
   * Re-authenticating from the same identity+device pair replaces its previous
   * session rather than piling up duplicate active entries indefinitely -
   * concurrent sessions from genuinely different devices (e.g. an attacker's
   * device vs. the owner's own) are untouched, since they key on different
   * deviceCharId values.
   */
  createSession(identity, device = 'Current Device', deviceCharId = null) {
    const normIdentity = (identity || '').toLowerCase();
    const normDeviceCharId = deviceCharId ? deviceCharId.toLowerCase() : normIdentity;

    for (const session of this.sessions.values()) {
      if (session.active && session.identity === normIdentity && session.deviceCharId === normDeviceCharId) {
        session.active = false;
      }
    }

    const id = 'sess_' + Math.random().toString(36).substring(2, 9);
    const session = {
      id,
      identity: normIdentity,
      device,
      deviceCharId: normDeviceCharId,
      active: true,
      createdAt: Date.now(),
      lastActive: Date.now()
    };
    this.sessions.set(id, session);
    this.currentSessionId = id;
    return session;
  }

  getActiveSession(deviceCharId = null) {
    if (deviceCharId) {
      const norm = deviceCharId.toLowerCase();
      // Look for the newest active session associated with this character/device
      const matching = Array.from(this.sessions.values())
        .reverse()
        .find(s => s.active && s.deviceCharId === norm);
      if (matching) return matching;
      return null;
    }
    if (!this.currentSessionId) return null;
    const sess = this.sessions.get(this.currentSessionId);
    return sess && sess.active ? sess : null;
  }

  getSessionsForIdentity(identity) {
    const list = [];
    const norm = (identity || '').toLowerCase();
    for (const session of this.sessions.values()) {
      if (session.identity.toLowerCase() === norm) {
        list.push(session);
      }
    }
    return list;
  }

  revokeSession(sessionId) {
    const sess = this.sessions.get(sessionId);
    if (sess) {
      sess.active = false;
      if (this.currentSessionId === sessionId) {
        this.currentSessionId = null;
      }
      return true;
    }
    return false;
  }
}

export const sessionManager = new SessionManager();
