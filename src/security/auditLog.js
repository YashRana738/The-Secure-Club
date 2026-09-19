/**
 * The Secure Club - Audit Log Subsystem (Standard ES Module)
 *
 * Core Concept:
 * When Anshuman is authenticated as Yash:
 * {
 *   identity: "yash",
 *   action: "purchase_drinks"
 * }
 * The audit log records the AUTHENTICATED IDENTITY, NOT the physical person.
 * This directly demonstrates why account takeover is so damaging.
 */

export class AuditLogManager {
  constructor() {
    this.events = [];
    this.reset();
  }

  reset() {
    this.events = [];
  }

  /**
   * Records an event strictly under the authenticated identity.
   * If physical person was Anshuman, but authenticated identity is 'yash',
   * the record is labeled under Yash.
   */
  logAction(authenticatedIdentity, action, details, cost, flagged = false) {
    const event = {
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      identity: (authenticatedIdentity || '').toLowerCase(),
      action,
      details,
      timestamp: Date.now(),
      cost,
      flagged
    };
    this.events.unshift(event);
    return event;
  }

  getEventsForIdentity(identity) {
    const norm = (identity || '').toLowerCase();
    return this.events.filter(e => e.identity === norm);
  }

  getAllEvents() {
    return [...this.events];
  }
}

export const auditLog = new AuditLogManager();
