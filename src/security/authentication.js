/**
 * The Secure Club - Security Subsystem (Standard ES Module)
 *
 * Core rule:
 * Authentication answers: "Who are you?"
 * Authorization answers: "What are you allowed to access or do?"
 * These systems must remain strictly decoupled.
 */

// Fictional club member database (strictly fictional credentials)
export const USER_ACCOUNTS = {
  // Yash: the "bad practice" example - weak password, reused across every account
  yash: {
    id: 'yash',
    name: 'Yash',
    secretPhrase: '123456',
    passwordStrength: 'weak',
    strongPassword: '94@Yash#2402',
    weakPassword: '123456',
    isVIP: false,
    mfaEnabled: false,
    secondFactorId: 'SC-10482',
    bank: { password: 'Y@nkVault71', reusesClubPassword: true, compromised: false },
    ecommerce: { password: 'YShop!204', reusesClubPassword: true, compromised: false }
  },
  // Vipul: the "mixed practice" example - strong password and MFA enabled,
 // but he still reuses that password across his other accounts like Yash
  vipul: {
    id: 'vipul',
    name: 'Vipul',
    secretPhrase: '015$Sharma00',
    passwordStrength: 'strong',
    strongPassword: '015$Sharma00',
    weakPassword: 'password',
    isVIP: true,
    mfaEnabled: true,
    secondFactorId: 'SC-99201',
    bank: { password: 'V@ultGold92', reusesClubPassword: true, compromised: false },
    ecommerce: { password: 'VShop!655', reusesClubPassword: true, compromised: false }
  }
};

/**
 * Switch password between weak and strong
 */
export function setPasswordStrength(userId, strength, accounts = USER_ACCOUNTS) {
  const account = accounts[userId?.toLowerCase()];
  if (!account) return false;
  account.passwordStrength = strength === 'weak' ? 'weak' : 'strong';
  account.secretPhrase = account.passwordStrength === 'weak' ? account.weakPassword : account.strongPassword;
  return true;
}

/**
 * Anshuman's Automated Dictionary Brute Force Attack
 * Anshuman's terminal automatically tries the 3 most common passwords against the target.
 * If the target has a WEAK password, one of those 3 attempts always matches it (weak
 * passwords are drawn from that same common wordlist by definition).
 * If the target has a STRONG password, high entropy means none of the 3 attempts land.
 */
export function attemptPasswordGuess(claimedIdentity, accounts = USER_ACCOUNTS) {
  const account = accounts[claimedIdentity?.toLowerCase()];
  if (!account) {
    return {
      success: false,
      reason: 'unknown_user',
      message: 'Cannot guess password for unknown user.'
    };
  }

  if (account.passwordStrength !== 'weak') {
    return {
      success: false,
      reason: 'high_entropy',
      message: `Brute force failed after 3 automated attempts! ${account.name}'s password is STRONG (${account.secretPhrase.length} chars, high entropy). Common wordlists failed.`
    };
  }

  return {
    success: true,
    guessedPassword: account.secretPhrase,
    message: `CRACKED! ${account.name} uses a WEAK password ("${account.secretPhrase}") found in the top common passwords wordlist!`
  };
}

/**
 * Validates primary credential (password/secret phrase).
 * Does NOT decide VIP authorization.
 */
export function authenticate(claimedIdentity, providedPhrase, accounts = USER_ACCOUNTS) {
  const normalizedId = (claimedIdentity || '').trim().toLowerCase();
  const account = accounts[normalizedId];

  if (!account) {
    return {
      success: false,
      authenticatedIdentity: null,
      mfaRequired: false,
      message: 'Unknown club member. Authentication failed.'
    };
  }

  // Check password (something you know)
  if (account.secretPhrase.toLowerCase() !== (providedPhrase || '').trim().toLowerCase()) {
    return {
      success: false,
      authenticatedIdentity: null,
      mfaRequired: false,
      message: 'Incorrect secret phrase. Authentication failed.'
    };
  }

  // If MFA is required for this account
  if (account.mfaEnabled) {
    return {
      success: false,
      authenticatedIdentity: null,
      mfaRequired: true,
      requiresSecondFactor: true,
      message: 'Password verified. Multi-factor authentication required. Please present Club Security ID.'
    };
  }

  // Password-only authentication succeeded
  return {
    success: true,
    authenticatedIdentity: account.id,
    mfaRequired: false,
    message: `Identity verified. Welcome to The Secure Club, ${account.name}!`
  };
}

/**
 * MFA Authentication function
 * Strictly requires both:
 * 1. Something you know (password)
 * 2. Something you have (Club Security ID)
 */
export function authenticateWithMFA(claimedIdentity, providedPhrase, providedSecondFactorId, accounts = USER_ACCOUNTS) {
  const normalizedId = (claimedIdentity || '').trim().toLowerCase();
  const account = accounts[normalizedId];

  if (!account) {
    return {
      success: false,
      authenticatedIdentity: null,
      mfaRequired: false,
      message: 'Unknown member identity.'
    };
  }

  // Verify first factor (password)
  if (account.secretPhrase.toLowerCase() !== (providedPhrase || '').trim().toLowerCase()) {
    return {
      success: false,
      authenticatedIdentity: null,
      mfaRequired: false,
      message: 'Incorrect secret phrase. Authentication failed.'
    };
  }

  // Verify second factor (Something you have)
  if (!account.mfaEnabled) {
    return {
      success: true,
      authenticatedIdentity: account.id,
      mfaRequired: false,
      message: `Identity verified (Standard). Welcome, ${account.name}!`
    };
  }

  if (!providedSecondFactorId || providedSecondFactorId !== account.secondFactorId) {
    return {
      success: false,
      authenticatedIdentity: null,
      mfaRequired: true,
      requiresSecondFactor: true,
      message: 'Password correct, but Club Security ID (2nd factor) is missing or invalid. Access denied.'
    };
  }

  return {
    success: true,
    authenticatedIdentity: account.id,
    mfaRequired: true,
    message: `Identity verified with Multi-Factor Authentication! Welcome, ${account.name}!`
  };
}
