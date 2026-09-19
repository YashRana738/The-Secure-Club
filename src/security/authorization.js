/**
 * The Secure Club - Authorization Subsystem (Standard ES Module)
 *
 * Core rule:
 * Authorization answers: "What are you allowed to access or do?"
 * NEVER authorize based on the visible physical character.
 * ALWAYS authorize based on authenticatedIdentity.
 */

import { USER_ACCOUNTS } from './authentication.js';

export const CLUB_RESOURCES = {
  VIP_LOUNGE: 'vip_lounge'
};

/**
 * Checks if the authenticated identity has permission to access a specific resource.
 * Example:
 * authorize("yash", "vip_lounge") => allowed: false
 * authorize("vipul", "vip_lounge") => allowed: true
 */
export function authorize(authenticatedIdentity, resource, accounts = USER_ACCOUNTS) {
  // If not authenticated, cannot access any internal club resources
  if (!authenticatedIdentity) {
    return {
      allowed: false,
      resource,
      authenticatedIdentity: null,
      reason: 'Authentication required. The Security Guard cannot authorize an unauthenticated guest.'
    };
  }

  const account = accounts[authenticatedIdentity.toLowerCase()];
  if (!account) {
    return {
      allowed: false,
      resource,
      authenticatedIdentity,
      reason: 'Unrecognized authenticated identity.'
    };
  }

  // Check resource permissions
  if (resource === CLUB_RESOURCES.VIP_LOUNGE) {
    if (account.isVIP) {
      return {
        allowed: true,
        resource,
        authenticatedIdentity: account.id,
        reason: `Access Granted. ${account.name} possesses VIP membership privileges.`
      };
    } else {
      return {
        allowed: false,
        resource,
        authenticatedIdentity: account.id,
        reason: `Access Denied. ${account.name} is authenticated as a Regular member, which does not include VIP Lounge access.`
      };
    }
  }

  // General club areas accessible to any authenticated member
  return {
    allowed: true,
    resource,
    authenticatedIdentity: account.id,
    reason: `Access Granted to ${resource} for member ${account.name}.`
  };
}
