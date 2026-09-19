/**
 * The Secure Club - Main Application Orchestration Controller (Standard ES Module)
 *
 * Implements:
 * - Open-ended 2D sandbox world simulation
 * - Character switching (Yash, Vipul, Anshuman)
 * - Authentication & Authorization security mechanics
 * - Eavesdropping & Phishing credential harvesting
 * - Session management & Incident attribution
 * - Multi-Factor Authentication (MFA)
 * - Server-side data breaches (attacker-controlled terminal hack)
 * - 10-Question cybersecurity knowledge quiz
 */

import { USER_ACCOUNTS, authenticate, authenticateWithMFA, setPasswordStrength, attemptPasswordGuess } from './security/authentication.js';
import { authorize, CLUB_RESOURCES } from './security/authorization.js';
import { sessionManager } from './security/sessions.js';
import { auditLog } from './security/auditLog.js';
import { GameWorld } from './game/gameWorld.js';
import { EDUCATIONAL_CARDS, QUIZ_QUESTIONS } from './content/contentData.js';

// Shared catalog for the simulated ShopNow ecommerce site
const SHOP_PRODUCTS = [
 { id: 'headphones', name: 'Wireless Headphones', price: 2500 },
 { id: 'smartwatch', name: 'Smart Watch', price: 4000 },
 { id: 'sneakers', name: 'Sneakers', price: 3200 },
 { id: 'backpack', name: 'Travel Backpack', price: 1800 }
];

class SecureClubApp {
 constructor() {
 const canvas = document.getElementById('clubCanvas');
 if (!canvas) throw new Error('Canvas element not found');
 this.world = new GameWorld(canvas);

 this.quizScore = 0;
 this.currentQuizIndex = 0;

 // DOM Elements
 this.speakerName = document.getElementById('speakerName');
 this.dialogueText = document.getElementById('dialogueText');
 this.dialogueActions = document.getElementById('dialogueActions');
 this.modalOverlay = document.getElementById('modalOverlay');
 this.modalContainer = document.getElementById('modalContainer');
 this.escMenuOverlay = document.getElementById('escMenuOverlay');

 // HUD Elements
 this.hudPhoto = document.getElementById('hudPhoto');
 this.hudName = document.getElementById('hudName');
 this.hudRole = document.getElementById('hudRole');
 this.hudBadge = document.getElementById('hudBadge');
 this.hudPassword = document.getElementById('hudPassword');
 this.hudVip = document.getElementById('hudVip');
 this.hudClubId = document.getElementById('hudClubId');
 this.hudMfa = document.getElementById('hudMfa');
 this.hudCash = document.getElementById('hudCash');

 // Pokémon Battle Encounter Elements
 this.battleOverlay = document.getElementById('battleOverlay');
 this.battleCanvas = document.getElementById('battleCanvas');
 this.battleOpponentName = document.getElementById('battleOpponentName');
 this.battleOpponentRole = document.getElementById('battleOpponentRole');
 this.battleOpponentHp = document.getElementById('battleOpponentHp');
 this.battleOpponentBadge = document.getElementById('battleOpponentBadge');
 this.battlePlayerName = document.getElementById('battlePlayerName');
 this.battlePlayerRole = document.getElementById('battlePlayerRole');
 this.battlePlayerHp = document.getElementById('battlePlayerHp');
 this.battlePlayerBadge = document.getElementById('battlePlayerBadge');
 this.battleSpeakerName = document.getElementById('battleSpeakerName');
 this.battleDialogueText = document.getElementById('battleDialogueText');
 this.battleActions = document.getElementById('battleActions');
 this.screenFadeOverlay = document.getElementById('screenFadeOverlay');

 // One-time teaching-moment flags - each formal lesson card interrupts
 // gameplay only the first time its concept comes up, never again.
 this.hasShownAuthenticationCard = false;
 this.hasShownSessionsCard = false;

 // True while a non-interactive world cutscene (e.g. Anshuman's ejection
 // animation) is playing, so stray clicks/keypresses don't fight with it.
 this.cutsceneInProgress = false;

 // Hacker initially knows NO passwords (must eavesdrop or phish)
 this.hackerKnownPasswords = new Map();

 // Hacker initially has NO physical MFA cards (must pickpocket the owner directly)
 this.hackerStolenMfaCards = new Set();

 // Tracks which breached bank/ecommerce accounts (`${userId}:${serviceKey}`) the
 // owner has already worked out the cause of, via the breach investigation
 // encounter - so it only interrupts them with the "how did this happen?"
 // mystery once per account, not on every dashboard visit.
 this.breachInvestigated = new Set();

 // Club fines owed by accounts due to intruder disturbances / session hijacking
 this.unpaidFines = new Map();

 // Starting cash, to pay fines or buy security upgrades - Vipul's VIP tier
 // affords him a much bigger cushion than Yash's regular membership.
 this.userCash = new Map([['yash', 20000], ['vipul', 70000], ['anshuman', 0]]);

 // Anshuman's own stolen loot from online-account password-reuse heists - kept separate
 // from the session-borrowed cash concept, since this money is genuinely his to keep.
 this.anshumanLoot = 0;

 // Wire World Interaction Hooks (Open-Ended Sandbox Simulation & Area Zones)
 this.world.onBuildingClick = (buildingId) => this.handleBuildingClick(buildingId);
 this.world.onNpcClick = (npc) => this.handleNpcClick(npc);
 this.world.onCharacterSwitch = (charId) => this.handleCharacterSwitch(charId);
 this.world.onPhishTargetClick = (targetChar) => this.handlePhishTargetClick(targetChar);
 this.world.onAnshumanPickpocketClick = (targetChar) => this.handlePickpocketClick(targetChar);
 this.world.onSecurityPcClick = () => this.handleSecurityPcClick();
 this.world.onZoneEnter = (zoneId) => this.handleZoneEnter(zoneId);
 this.world.onCheckInteractionBlocked = () => {
 const isBattle = Boolean(this.battleOverlay && this.battleOverlay.classList.contains('active'));
 const isModal = Boolean(this.modalOverlay && this.modalOverlay.classList.contains('active'));
 return isBattle || isModal || this.cutsceneInProgress;
 };

 this.initUIEventListeners();
 this.initCustomCursor();
 this.setActiveCharacter('yash');
 this.world.centerOnCharacter('yash');
 this.showSandboxWelcomeBanner();
 }

 // Drives the on-page #customCursor element (native cursor is hidden via
 // CSS `cursor: none`) so the pointer is an actual rendered element instead
 // of an OS-composited image - it shows up in screenshots either way.
 initCustomCursor() {
 const cursorEl = document.getElementById('customCursor');
 if (!cursorEl) return;
 const POINTER_SELECTOR = 'a, button, .btn, [role="button"], input, select, textarea, label';

 window.addEventListener('mousemove', (e) => {
 // Offset so the arrow's drawn tip (not the box's top-left corner) lines up
 // with the real pointer position.
 cursorEl.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 2}px)`;
 const overClickable = Boolean(e.target.closest && e.target.closest(POINTER_SELECTOR));
 cursorEl.classList.toggle('pointer', overClickable);
 });

 window.addEventListener('mouseleave', () => {
 cursorEl.style.opacity = '0';
 });
 window.addEventListener('mouseenter', () => {
 cursorEl.style.opacity = '1';
 });
 }

 initUIEventListeners() {
 // Top-Left Character HUD Collapse / Expand
 document.getElementById('btnToggleHud')?.addEventListener('click', () => {
 this.toggleCharacterHud(false);
 });
 document.getElementById('btnExpandHud')?.addEventListener('click', () => {
 this.toggleCharacterHud(true);
 });

 // ESC Menu toggles
 document.getElementById('btnFloatingMenu')?.addEventListener('click', () => {
 this.toggleEscMenu();
 });
 document.getElementById('btnCloseEscMenu')?.addEventListener('click', () => {
 this.toggleEscMenu(false);
 });

 // Quiz button in ESC menu
 document.getElementById('btnOpenQuiz')?.addEventListener('click', () => {
 this.toggleEscMenu(false);
 this.startQuiz();
 });

 // Reset Game button
 document.getElementById('btnResetGame')?.addEventListener('click', () => {
 this.toggleEscMenu(false);
 this.resetFullGame();
 });

 // Character Switcher Buttons
 const switchBtns = document.querySelectorAll('.btn-char');
 switchBtns.forEach(btn => {
 btn.addEventListener('click', (e) => {
 const charId = e.currentTarget.getAttribute('data-char');
 this.setActiveCharacter(charId);
 });
 });

 // Quick Center Camera
 document.getElementById('btnCenterCam')?.addEventListener('click', () => {
 this.world.centerOnCharacter(this.world.controlledCharId);
 });

 // Anshuman-Only Quick Actions (moved here from the bottom action bar into the top-left HUD)
 document.getElementById('btnAnshumanToggleDisguise')?.addEventListener('click', () => {
 const anshuman = this.world.characters.get('anshuman');
 if (anshuman && anshuman.isDisguisedAsBouncer) {
 this.toggleAnshumanDisguise(false);
 } else {
 this.showPhishingChoice();
 }
 });
 document.getElementById('btnAnshumanRecordDoor')?.addEventListener('click', () => {
 this.world.moveCharacterTo('anshuman', 1280, 720);
 this.world.centerOnCharacter('anshuman');
 this.world.showBubble('anshuman', 'Recording near club door! When any member enters, I will sniff their secret phrase!', 5000);
 });
 document.getElementById('btnAnshumanHackAccounts')?.addEventListener('click', () => {
 this.openAnshumanHackingTerminal();
 });

 // Keyboard controls
 window.addEventListener('keydown', (e) => {
 if (e.key === ' ' || e.key === 'Enter') {
 // Trigger primary action if available
 const primaryBtn = this.dialogueActions?.querySelector('.btn-primary');
 if (primaryBtn && !this.modalOverlay?.classList.contains('active') && !this.escMenuOverlay?.classList.contains('active')) {
 primaryBtn.click();
 }
 } else if (e.key === 'Escape') {
 if (this.modalOverlay?.classList.contains('active')) {
 this.closeModal();
 } else {
 this.toggleEscMenu();
 }
 }
 });
 }

 toggleEscMenu(forceState) {
 if (!this.escMenuOverlay) return;
 const shouldOpen = forceState !== undefined ? forceState : !this.escMenuOverlay.classList.contains('active');
 if (shouldOpen) {
 this.escMenuOverlay.classList.add('active');
 } else {
 this.escMenuOverlay.classList.remove('active');
 }
 }

 toggleCharacterHud(forceOpen) {
 const hud = document.getElementById('characterHud');
 const pill = document.getElementById('btnExpandHud');
 if (!hud || !pill) return;
 const shouldOpen = forceOpen !== undefined ? forceOpen : hud.classList.contains('collapsed');
 if (shouldOpen) {
 hud.classList.remove('collapsed');
 pill.style.display = 'none';
 } else {
 hud.classList.add('collapsed');
 pill.style.display = 'flex';
 // pillAvatar/pillName are already kept in sync by updateCharacterHud()
 // whenever the active character changes - no need to duplicate that here.
 }
 }

 handleCharacterSwitch(charId) {
 if (!['yash', 'vipul', 'anshuman'].includes(charId)) return;
 this.setActiveCharacter(charId);
 this.world.centerOnCharacter(charId);

 const msgs = {
 yash: 'Switched to Yash! Ready to test credentials & club entry.',
 vipul: 'Switched to Vipul! Holding VIP credentials.',
 anshuman: 'Switched to Anshuman! Threat actor in position.'
 };
 this.world.showBubble(charId, msgs[charId] || `Switched to ${charId}!`, 4000);
 }

 formatCash(amount) {
 return '₹' + Math.max(0, amount).toLocaleString('en-IN');
 }

 /**
 * Anshuman owns no account of his own - any cash he spends or receives while
 * impersonating a member comes out of that member's authenticated session identity.
 * Returns null if Anshuman has no active session to spend against.
 */
 resolveCashIdentity(charId) {
 if (charId === 'anshuman') {
 const anshumanSession = sessionManager.getActiveSession('anshuman');
 return anshumanSession ? anshumanSession.identity : null;
 }
 return charId;
 }

 getCash(charId) {
 const id = this.resolveCashIdentity(charId);
 return id ? (this.userCash.get(id) || 0) : 0;
 }

 /** Deducts cash if the identity can afford it. Returns false (no charge) if funds are insufficient. */
 spendCash(charId, amount) {
 const id = this.resolveCashIdentity(charId);
 if (!id || this.getCash(charId) < amount) return false;
 this.userCash.set(id, this.userCash.get(id) - amount);
 this.refreshCashHud();
 return true;
 }

 refreshCashHud() {
 if (!this.hudCash) return;
 const controlledCharId = this.world.controlledCharId;
 const id = this.resolveCashIdentity(controlledCharId);
 this.hudCash.innerText = id ? this.formatCash(this.getCash(controlledCharId)) : 'None (No Session)';
 }

 updateCharacterHud(charData) {
 if (!this.hudName) return;
 this.hudName.innerText = charData.name.toUpperCase();
 this.hudRole.innerText = charData.role;
 if (this.hudPassword) this.hudPassword.innerText = charData.password || 'None';
 this.refreshCashHud();
 if (this.hudVip) {
 this.hudVip.innerText = charData.isVip ? 'AUTHORIZED' : 'DENIED';
 this.hudVip.style.color = charData.isVip ? 'var(--gold-text)' : 'var(--danger-text)';
 }
 if (this.hudClubId) this.hudClubId.innerText = charData.clubId || 'N/A';
 if (this.hudMfa) this.hudMfa.innerText = charData.mfa || 'None';

 if (this.hudBadge) {
 this.hudBadge.innerText = charData.badgeText;
 this.hudBadge.className = `hud-badge ${charData.badgeClass}`;
 }

 // Password strength badge in HUD
 const hudStrength = document.getElementById('hudStrength');    if (hudStrength) {
      if (charData.strength) {
        hudStrength.style.display = 'inline-block';
        hudStrength.className = `badge-strength ${charData.strength.toLowerCase()}`;
        hudStrength.innerText = charData.strength === 'weak' ? 'WEAK' : 'STRONG';
      } else {
        hudStrength.style.display = 'none';
      }
    }

    if (this.hudPhoto) this.hudPhoto.innerText = charData.avatar || charData.name.charAt(0);

    // Update collapsed mini pill indicator
    const pillAvatar = document.getElementById('pillAvatar');
    const pillName = document.getElementById('pillName');
    if (pillAvatar) pillAvatar.innerText = charData.name.toUpperCase();
    if (pillName) pillName.innerText = charData.badgeText || 'ACTIVE';
  }

  setActiveCharacter(charId) {
    if (!['yash', 'vipul', 'anshuman'].includes(charId)) return;
    const previousCharId = this.world.controlledCharId;
    if (previousCharId !== charId) {
      // Cancel whatever walk-then-interact (or delayed approach still waiting
      // out its double-click window) was pending for the character we're
      // leaving, so it can't silently arrive/fire after control has moved on.
      this.world.stopCharacterMovement(previousCharId);
      this.world.cancelPendingApproach();
    }
    this.world.controlledCharId = charId;

    // Update switcher tabs UI
    document.querySelectorAll('.btn-char').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-char') === charId);
    });

    // Anshuman's quick actions live in the top-left HUD, not the bottom bar - only visible for him
    const anshumanHudActions = document.getElementById('anshumanHudActions');
    if (anshumanHudActions) anshumanHudActions.style.display = charId === 'anshuman' ? 'flex' : 'none';

    if (charId === 'yash') {
      this.updateCharacterHud({
        name: 'Yash',
        role: 'Regular Club Member',
        avatar: 'Y',
        badgeText: 'MEMBER',
        badgeClass: 'regular',
        password: USER_ACCOUNTS.yash.secretPhrase,
        strength: USER_ACCOUNTS.yash.passwordStrength,
        isVip: USER_ACCOUNTS.yash.isVIP,
        clubId: USER_ACCOUNTS.yash.secondFactorId,
        mfa: USER_ACCOUNTS.yash.mfaEnabled ? 'Club Security ID' : 'Disabled'
      });
      this.setDialogue(
        'Yash',
        'Y',
        'Click anywhere to move, or visit Yash’s House to manage passwords & MFA.',
        [
          {
            label: 'Enter Yash’s House',
            primary: true,
            onClick: () => this.handleBuildingClick('yash_house')
          },
          {
            label: 'Walk to Club Entrance',
            onClick: () => {
              this.world.moveCharacterTo('yash', 1300, 690);
              this.world.centerOnCharacter('yash');
            }
          }
        ]
      );
    } else if (charId === 'vipul') {
      this.updateCharacterHud({
        name: 'Vipul',
        role: 'VIP Tier Member',
        avatar: 'V',
        badgeText: 'VIP TIER',
        badgeClass: 'vip',
        password: USER_ACCOUNTS.vipul.secretPhrase,
        strength: USER_ACCOUNTS.vipul.passwordStrength,
        isVip: USER_ACCOUNTS.vipul.isVIP,
        clubId: USER_ACCOUNTS.vipul.secondFactorId,
        mfa: USER_ACCOUNTS.vipul.mfaEnabled ? 'Gold Security ID' : 'Disabled'
      });
      this.setDialogue(
        'Vipul',
        'V',
        'Vipul holds VIP credentials granting VIP Lounge access. Manage them at Vipul’s Villa.',
        [
          {
            label: 'Enter Vipul’s Villa',
            primary: true,
            onClick: () => this.handleBuildingClick('vipul_house')
          },
          {
            label: 'Walk to Club Entrance',
            onClick: () => {
              this.world.moveCharacterTo('vipul', 1300, 690);
              this.world.centerOnCharacter('vipul');
            }
          }
        ]
      );
    } else if (charId === 'anshuman') {
      const anshumanChar = this.world.characters.get('anshuman');
      const isDisguised = Boolean(anshumanChar && anshumanChar.isDisguisedAsBouncer);

      this.updateCharacterHud({
        name: isDisguised ? 'Anshuman (Disguised)' : 'Anshuman',
        role: isDisguised ? 'Bouncer Impersonator (Phishing)' : 'Threat Actor / Hacker',
        avatar: isDisguised ? 'B' : 'A',
        badgeText: isDisguised ? 'PHISHING DISGUISE' : 'ATTACKER',
        badgeClass: 'attacker',
        password: this.hackerKnownPasswords.size > 0 
          ? Array.from(this.hackerKnownPasswords.entries()).map(([k, v]) => `${k}:${v}`).join(', ')
          : 'None (Steal credentials!)',
        isVip: false,
        clubId: isDisguised ? 'FAKE-BOUNCER' : 'UNKNOWN',
        mfa: 'None'
      });
      this.setDialogue(
        isDisguised ? 'Anshuman (Disguised Bouncer)' : 'Anshuman',
        isDisguised ? 'B' : 'H',
        isDisguised
          ? 'Disguised as the Bouncer. Walk up to Yash or Vipul in town to trick them into handing over their password.'
          : 'Anshuman starts out knowing no passwords. Stand near the club door to eavesdrop on members entering, or disguise as the Bouncer to phish someone directly.',
        []
      );

      // Keep the HUD disguise toggle button in sync (label flips based on current state)
      const disguiseBtn = document.getElementById('btnAnshumanToggleDisguise');
      if (disguiseBtn) disguiseBtn.innerText = isDisguised ? 'Wear Normal Clothes' : 'Disguise as Bouncer';
    }
  }

 toggleAnshumanDisguise(forceState) {
 const anshuman = this.world.characters.get('anshuman');
 if (!anshuman) return;
 anshuman.isDisguisedAsBouncer = forceState !== undefined ? forceState : !anshuman.isDisguisedAsBouncer;
 anshuman.label = anshuman.isDisguisedAsBouncer ? 'BOUNCER?' : 'ANSHUMAN';

 if (anshuman.isDisguisedAsBouncer) {
 this.world.showBubble('anshuman', 'Disguised as the Bouncer! Walk up to Yash or Vipul to phish them.', 4500);
 } else {
 this.world.showBubble('anshuman', 'Back in hacker hoodie.', 3500);
 }
 this.setActiveCharacter('anshuman');
 }

 startPhishingEncounter(targetChar) {
 const secret = USER_ACCOUNTS[targetChar.id] ? USER_ACCOUNTS[targetChar.id].secretPhrase : 'SecretPass';
 this.startBattleEncounter({
 opponentId: targetChar.id,
 opponentName: targetChar.name.toUpperCase(),
 opponentRole: targetChar.role || 'Club Member',
 opponentBadge: 'TARGET VICTIM',
 playerId: 'anshuman',
 playerName: 'BOUNCER (DISGUISED ANSHUMAN)',
 playerRole: 'Social Engineering / Phishing',
 playerBadge: 'DISGUISED',
 speaker: 'BOUNCER (ANSHUMAN)',
 dialogue: `Attention, ${targetChar.name}! Club Bouncer here - urgent membership audit. Confirm your name and secret phrase now!`,
 actions: [
 {
 label: `Ask for credentials ("Verify account")`,
 primary: true,
 onClick: () => {
 this.setBattleDialogue(
 targetChar.name.toUpperCase(),
 `Oh! I definitely don't want my club membership cancelled, officer. My name is ${targetChar.name}, and my secret phrase is "${secret}". Please update my record!`,
 [
 {
 label: `Clone "${secret}" & Record`,
 primary: true,
 onClick: () => {
 this.hackerKnownPasswords.set(targetChar.id, secret);
 this.setActiveCharacter('anshuman'); // refresh HUD so the newly cloned password shows immediately
 this.closeBattleEncounter();
 this.showModal(`
 <div class="card-container" style="max-width: 520px;">
 <div class="card-badge danger"> PHISHING ATTACK SUCCESSFUL!</div>
 <div class="card-title danger">CREDENTIALS CLONED BY SOCIAL ENGINEERING</div>
 <p style="font-size: 13px; color: var(--muted-text-soft); line-height: 1.5; margin-bottom: 12px;">
 By impersonating trusted staff (the Bouncer) and manufacturing false urgency ("urgent security audit"), Anshuman deceived <strong>${targetChar.name}</strong> into disclosing their secret phrase:
 </p>
 <div style="background: #020617; border: 2px solid var(--danger-text-strong); border-radius: 6px; padding: 12px; text-align: center; margin-bottom: 14px;">
 <span style="color: var(--muted-text); font-size: 11px;">CLONED PHRASE:</span><br>
 <strong style="color: var(--success-teal); font-size: 18px; font-family: var(--font-mono);">"${secret}"</strong>
 </div>
 <p style="font-size: 12px; color: var(--muted-text);">
 Anshuman can now use this cloned password at the club entrance to pose as ${targetChar.name}!
 </p>
 <button class="btn btn-primary" id="btnPhishGotIt" style="width: 100%; margin-top: 14px;">Awesome, Got It!</button>
 </div>
 `);
 document.getElementById('btnPhishGotIt')?.addEventListener('click', () => {
 this.closeModal();
 this.showEducationalCard('phishing', () => {
 this.world.showBubble('anshuman', `Cloned ${targetChar.name}'s password: "${secret}"!`, 4500);
 this.setActiveCharacter('anshuman');
 });
 });
 }
 }
 ]
 );
 }
 },
 {
 label: 'Cancel Phishing',
 onClick: () => this.closeBattleEncounter()
 }
 ]
 });
 }

 showSandboxWelcomeBanner() {
 this.setDialogue(
 'Town Guide',
 '',
 'Welcome to the Open-World Cyber Town! Hold & drag mouse to pan. Click anywhere to walk (no wall phasing). Switch characters anytime at the top-left HUD!',
 [
 {
 label: 'Visit Yash’s House',
 primary: true,
 onClick: () => {
 this.handleBuildingClick('yash_house');
 }
 },
 {
 label: 'Visit Club Entrance',
 onClick: () => {
 this.world.centerOnCharacter('bouncer');
 }
 }
 ]
 );
 }

 /**
 * Classic Pokémon / RPG Black Screen Fade Transition & Teleport
 */
 fadeTeleport(charId, destX, destY, onComplete) {
 if (this.screenFadeOverlay) {
 this.screenFadeOverlay.classList.add('active');
 }

 setTimeout(() => {
 // Teleport character while screen is black
 const char = this.world.characters.get(charId);
 if (char) {
 char.x = destX;
 char.y = destY;
 char.targetX = undefined;
 char.targetY = undefined;
 char.isMoving = false;
 }
 this.world.centerOnCharacter(charId);

 setTimeout(() => {
 // Fade back in
 if (this.screenFadeOverlay) {
 this.screenFadeOverlay.classList.remove('active');
 }
 if (onComplete) onComplete();
 }, 350);
 }, 350);
 }

 handleZoneEnter(zoneId) {
 const controlledCharId = this.world.controlledCharId;

 if (zoneId === 'club_entrance') {
 // Walking onto the Club Entrance Security Mat -> Trigger Bouncer Authentication!
 this.openBouncerEncounter();
 } else if (zoneId === 'club_exit') {
 // Walking onto the exit mat inside the club -> Offer to exit back to Town Plaza
 this.setDialogue(
 'Exit Door',
 '',
 'You are at the main exit doors. Would you like to leave The Secure Club and step outside into Town Plaza?',
 [
 {
 label: 'Step Outside ◀',
 primary: true,
 onClick: () => {
 this.fadeTeleport(controlledCharId, 1260, 690, () => {
 this.setDialogue('Town Plaza', '', 'You stepped outside onto the plaza.');
 });
 }
 },
 {
 label: 'Stay Inside',
 onClick: () => {
 // Nudge back into lounge
 this.world.moveCharacterTo(controlledCharId, 1550, 690);
 }
 }
 ]
 );
 } else if (zoneId === 'vip_entrance') {
 // Walking onto the VIP Lounge checkpoint always stops you for a Guard
 // authorization check - exactly like the Bouncer always challenges every
 // approach to the club entrance, VIP members included. openGuardEncounter()
 // runs the actual authorize() check and grants or denies entry from there.
 this.world.moveCharacterTo(controlledCharId, 1850, 680);
 this.world.showBubble('guard', 'HALT! State your business at the VIP checkpoint!', 3500);
 setTimeout(() => this.openGuardEncounter(), 300);
 } else if (zoneId === 'vip_exit') {
 // Inside VIP Lounge heading back to main lounge
 this.setDialogue(
 'VIP Exit',
 '',
 'Leave VIP Lounge and return to the Club Main Lounge?',
 [
 {
 label: 'Return to Main Lounge ◀',
 primary: true,
 onClick: () => {
 this.fadeTeleport(controlledCharId, 1800, 620, () => {
 this.setDialogue('Main Lounge', '', 'Returned to the Main Lounge.');
 });
 }
 },
 {
 label: 'Stay in VIP',
 onClick: () => {
 this.world.moveCharacterTo(controlledCharId, 2060, 480);
 }
 }
 ]
 );
 } else if (zoneId === 'bar_approach') {
 this.openBartenderEncounter();
 } else if (zoneId === 'security_pc') {
 this.openSecurityTerminalModal();
 }
 }

 handleBuildingClick(buildingId) {
 const controlledCharId = this.world.controlledCharId;
 const controlledChar = this.world.characters.get(controlledCharId);

 // If character is inside club and clicks house outside, guide to exit door first
 const isInside = controlledChar && controlledChar.x >= 1390;
 if (isInside && (buildingId === 'yash_house' || buildingId === 'vipul_house' || buildingId === 'anshuman_house')) {
 this.world.showBubble(controlledCharId, 'Heading to Club Exit first...', 2500);
 const path = this.world.generatePath(controlledChar.x, controlledChar.y, 1440, 690);
 this.world.moveCharacterAlongPath(controlledCharId, path, () => {
 this.handleZoneEnter('club_exit');
 });
 return;
 }

 // Owner is authorized to enter - walk them to the front door first, then
 // open the house on arrival (never instantly, regardless of distance clicked).
 const doorTargets = {
 yash_house: { x: 350, y: 470 },
 vipul_house: { x: 780, y: 470 },
 anshuman_house: { x: 350, y: 740 }
 };
 const walkToDoorThenOpen = (openFn) => {
 const target = doorTargets[buildingId];
 const dist = controlledChar ? Math.hypot(controlledChar.x - target.x, controlledChar.y - target.y) : Infinity;
 if (!controlledChar || dist < 60) {
 openFn();
 return;
 }
 this.world.showBubble(controlledCharId, 'Walking to the front door...', 2000);
 const path = this.world.generatePath(controlledChar.x, controlledChar.y, target.x, target.y);
 this.world.moveCharacterAlongPath(controlledCharId, path, openFn);
 };

 if (buildingId === 'yash_house') {
 // Feature 6: Only Yash can access Yash's House!
 if (controlledCharId !== 'yash') {
 if (controlledChar) {
 controlledChar.targetX = undefined;
 controlledChar.targetY = undefined;
 controlledChar.isMoving = false;
 }
 this.world.showBubble(controlledCharId, "[LOCKED] Locked! Only Yash has the house key.", 4000);
 this.setDialogue("Yash's House", "", "Access Denied! The front door is secured with a physical deadbolt. Only Yash possesses the key to his personal residence.");
 return;
 }
 walkToDoorThenOpen(() => this.openYashHouseModal());
 } else if (buildingId === 'vipul_house') {
 // Feature 6: Only Vipul can access Vipul's Villa!
 if (controlledCharId !== 'vipul') {
 if (controlledChar) {
 controlledChar.targetX = undefined;
 controlledChar.targetY = undefined;
 controlledChar.isMoving = false;
 }
 this.world.showBubble(controlledCharId, "[LOCKED] VIP Only! A gold keycard is required.", 4000);
 this.setDialogue("Vipul's Villa", "", "Access Denied! A biometric gold keycard reader protects the entrance. Only Vipul possesses the key to his VIP residence.");
 return;
 }
 walkToDoorThenOpen(() => this.openVipulHouseModal());
 } else if (buildingId === 'anshuman_house') {
 // Feature 6: Only Anshuman can access his own house!
 if (controlledCharId !== 'anshuman') {
 if (controlledChar) {
 controlledChar.targetX = undefined;
 controlledChar.targetY = undefined;
 controlledChar.isMoving = false;
 }
 this.world.showBubble(controlledCharId, "[LOCKED] Locked! Only Anshuman has the house key.", 4000);
 this.setDialogue("Anshuman's House", "", "Access Denied! The front door is secured with a deadbolt. Only Anshuman possesses the key to his personal residence.");
 return;
 }
 walkToDoorThenOpen(() => this.openAnshumanHouseModal());
 } else if (buildingId === 'secure_club') {
 this.handleNpcClick(this.world.characters.get('bouncer'));
 }
 }

 handleNpcClick(npc) {
 if (!npc) return;
 const controlledCharId = this.world.controlledCharId;
 const controlledChar = this.world.characters.get(controlledCharId);
 if (!controlledChar) return;

 let targetPos = { x: npc.x, y: npc.y };
 if (npc.id === 'bouncer') {
 targetPos = { x: 1300, y: 690 };
 } else if (npc.id === 'bartender') {
 targetPos = { x: 1680, y: 450 }; // in front of bar counter
 } else if (npc.id === 'guard') {
 targetPos = { x: 1970, y: 700 }; // in front of VIP velvet ropes - clear of the doorway's flanking wall colliders
 } else if (npc.id === 'alex') {
 targetPos = { x: 1680, y: 560 }; // dance floor
 } else if (npc.id === 'dex') {
 targetPos = { x: 1800, y: 560 }; // in front of DJ booth
 } else if (npc.id === 'sophia') {
 targetPos = { x: 2100, y: 460 }; // inside VIP lounge
 }

 const triggerNpcEncounter = () => {
 if (npc.id === 'bouncer') this.openBouncerEncounter();
 else if (npc.id === 'guard') this.openGuardEncounter();
 else if (npc.id === 'bartender') this.openBartenderEncounter();
 else if (['alex', 'dex', 'sophia'].includes(npc.id)) this.openClubPatronEncounter(npc.id);
 else this.world.showBubble(npc.id, `Hello! I am ${npc.name}.`);
 };

 const dist = Math.hypot(controlledChar.x - targetPos.x, controlledChar.y - targetPos.y);

 if (dist < 75) {
 triggerNpcEncounter();
 return;
 }

 const isOutside = controlledChar.x < 1390;
 const isTargetInside = targetPos.x >= 1390;

 const activeSession = sessionManager.getActiveSession(controlledCharId);
 const isAuth = Boolean(activeSession && activeSession.active);

 // Case 1: Outside club clicking inside NPC (Bartender, Guard, Patrons)
 if (isOutside && isTargetInside) {
 this.world.showBubble(controlledCharId, `Walking to Club Entrance...`, 3000);
 const path = this.world.generatePath(controlledChar.x, controlledChar.y, 1300, 690);
 this.world.moveCharacterAlongPath(controlledCharId, path, () => {
 if (!isAuth) {
 this.world.showBubble('bouncer', 'HALT! You must authenticate before entering the club!', 4000);
 setTimeout(() => this.openBouncerEncounter(), 600);
 } else {
 this.fadeTeleport(controlledCharId, 1550, 690, () => {
 this.world.showBubble(controlledCharId, `Approaching ${npc.name}...`, 2500);
 const insidePath = this.world.generatePath(1550, 690, targetPos.x, targetPos.y);
 this.world.moveCharacterAlongPath(controlledCharId, insidePath, () => {
 triggerNpcEncounter();
 });
 });
 }
 });
 return;
 }

 // Case 2: Inside club clicking outside NPC (Bouncer or playable characters outside)
 if (!isOutside && !isTargetInside) {
 this.world.showBubble(controlledCharId, `Heading to Club Exit first...`, 2500);
 const path = this.world.generatePath(controlledChar.x, controlledChar.y, 1440, 690);
 this.world.moveCharacterAlongPath(controlledCharId, path, () => {
 this.handleZoneEnter('club_exit');
 });
 return;
 }

 this.world.showBubble(controlledCharId, `Approaching ${npc.name}...`, 2500);
 const path = this.world.generatePath(controlledChar.x, controlledChar.y, targetPos.x, targetPos.y);
 this.world.moveCharacterAlongPath(controlledCharId, path, () => {
 triggerNpcEncounter();
 });
 }

 handleSecurityPcClick() {
 const controlledCharId = this.world.controlledCharId;
 const controlledChar = this.world.characters.get(controlledCharId);
 if (!controlledChar) return;

 const targetPos = { x: 1750, y: 960 };
 const dist = Math.hypot(controlledChar.x - targetPos.x, controlledChar.y - targetPos.y);

 if (dist < 80) {
 this.openSecurityTerminalModal();
 return;
 }

 const isOutside = controlledChar.x < 1390;
 const activeSession = sessionManager.getActiveSession(controlledCharId);
 const isAuth = Boolean(activeSession && activeSession.active);

 if (isOutside) {
 if (!isAuth) {
 this.world.showBubble(controlledCharId, 'Security PC is inside. Walking to entrance...', 3000);
 const path = this.world.generatePath(controlledChar.x, controlledChar.y, 1300, 690);
 this.world.moveCharacterAlongPath(controlledCharId, path, () => {
 this.world.showBubble('bouncer', 'HALT! Authenticate before entering to use the Security PC.', 4000);
 setTimeout(() => this.openBouncerEncounter(), 600);
 });
 return;
 } else {
 this.world.showBubble(controlledCharId, 'Entering Club to access Security PC...', 3000);
 const path = this.world.generatePath(controlledChar.x, controlledChar.y, 1300, 690);
 this.world.moveCharacterAlongPath(controlledCharId, path, () => {
 this.fadeTeleport(controlledCharId, 1550, 690, () => {
 const insidePath = this.world.generatePath(1550, 690, targetPos.x, targetPos.y);
 this.world.moveCharacterAlongPath(controlledCharId, insidePath, () => {
 this.openSecurityTerminalModal();
 });
 });
 });
 return;
 }
 }

 this.world.showBubble(controlledCharId, 'Approaching Security PC...', 2500);
 const path = this.world.generatePath(controlledChar.x, controlledChar.y, targetPos.x, targetPos.y);
 this.world.moveCharacterAlongPath(controlledCharId, path, () => {
 this.openSecurityTerminalModal();
 });
 }

 // Disguised Anshuman clicking a victim on the map walks over to them first -
 // the encounter only starts on arrival, never from just standing nearby.
 handlePhishTargetClick(targetChar) {
 const controlledCharId = this.world.controlledCharId;
 const controlledChar = this.world.characters.get(controlledCharId);
 if (!controlledChar || !targetChar) return;

 if (this.world.getCharacterArea(controlledChar) !== this.world.getCharacterArea(targetChar)) {
 this.world.showBubble(controlledCharId, `Can't reach ${targetChar.name} from here.`, 2500);
 return;
 }

 const dist = Math.hypot(controlledChar.x - targetChar.x, controlledChar.y - targetChar.y);
 if (dist < 55) {
 this.startPhishingEncounter(targetChar);
 return;
 }

 this.world.showBubble(controlledCharId, `Approaching ${targetChar.name}...`, 2500);
 const path = this.world.generatePath(controlledChar.x, controlledChar.y, targetChar.x, targetChar.y);
 this.world.moveCharacterAlongPath(controlledCharId, path, () => {
 this.startPhishingEncounter(targetChar);
 });
 }

 // Undisguised Anshuman clicking another member walks up to them first, then opens
 // a pickpocket attempt on their physical MFA card - a password alone is never
 // enough to take over an MFA-protected account, so this is the other half of
 // the attack chain.
 handlePickpocketClick(targetChar) {
 const controlledCharId = this.world.controlledCharId;
 const controlledChar = this.world.characters.get(controlledCharId);
 if (!controlledChar || !targetChar) return;

 if (this.world.getCharacterArea(controlledChar) !== this.world.getCharacterArea(targetChar)) {
 this.world.showBubble(controlledCharId, `Can't reach ${targetChar.name} from here.`, 2500);
 return;
 }

 const dist = Math.hypot(controlledChar.x - targetChar.x, controlledChar.y - targetChar.y);
 if (dist < 55) {
 this.openPickpocketEncounter(targetChar);
 return;
 }

 this.world.showBubble(controlledCharId, `Approaching ${targetChar.name}...`, 2500);
 const path = this.world.generatePath(controlledChar.x, controlledChar.y, targetChar.x, targetChar.y);
 this.world.moveCharacterAlongPath(controlledCharId, path, () => {
 this.openPickpocketEncounter(targetChar);
 });
 }

 openPickpocketEncounter(targetChar) {
 const account = USER_ACCOUNTS[targetChar.id];
 if (!account) return;
 const cardId = account.secondFactorId;

 if (!account.mfaEnabled) {
 this.startBattleEncounter({
 opponentId: targetChar.id,
 opponentName: targetChar.name.toUpperCase(),
 opponentRole: 'No MFA Enrolled',
 opponentBadge: 'NOTHING TO CLONE',
 playerId: 'anshuman',
 playerName: 'ANSHUMAN',
 playerRole: 'Physical Card Cloning',
 playerBadge: 'ATTACKER',
 speaker: 'ANSHUMAN',
 dialogue: `You get close enough to skim ${targetChar.name}'s physical Security ID... but they aren't carrying one. ${targetChar.name} never enrolled in Multi-Factor Authentication, so there is no physical card here to clone.`,
 actions: [
 {
 label: 'Step Back ◀',
 onClick: () => this.closeBattleEncounter()
 },
 {
 label: 'View MFA Lesson Card',
 onClick: () => {
 this.closeBattleEncounter();
 this.showEducationalCard('mfa', () => {});
 }
 }
 ]
 });
 return;
 }

 if (this.hackerStolenMfaCards.has(targetChar.id)) {
 this.startBattleEncounter({
 opponentId: targetChar.id,
 opponentName: targetChar.name.toUpperCase(),
 opponentRole: 'MFA Enrolled',
 opponentBadge: 'CARD ALREADY CLONED',
 playerId: 'anshuman',
 playerName: 'ANSHUMAN',
 playerRole: 'Physical Card Cloning',
 playerBadge: 'ATTACKER',
 speaker: 'ANSHUMAN',
 dialogue: `You already cloned ${targetChar.name}'s Security ID #${cardId} earlier. No need to risk getting caught twice.`,
 actions: [
 { label: 'Step Back ◀', onClick: () => this.closeBattleEncounter() }
 ]
 });
 return;
 }

 // Yash is the "learn from your mistakes" character - if the player has taken
 // the deliberate step of enabling MFA on his account, he's now alert enough
 // to catch Anshuman in the act instead of getting silently cloned. This is the
 // simulation's triumphant ending, reachable only by actually hardening him.
 if (targetChar.id === 'yash' && account.mfaEnabled) {
 this.startYashCatchesAnshumanEncounter(targetChar);
 return;
 }

 this.startBattleEncounter({
 opponentId: targetChar.id,
 opponentName: targetChar.name.toUpperCase(),
 opponentRole: 'MFA Enrolled',
 opponentBadge: `CARD #${cardId}`,
 playerId: 'anshuman',
 playerName: 'ANSHUMAN',
 playerRole: 'Physical Card Cloning',
 playerBadge: 'ATTACKER',
 speaker: 'ANSHUMAN',
 dialogue: `${targetChar.name} is wearing their Club Security ID badge #${cardId} on a lanyard. Getting close enough with a hidden skimmer could clone its signal without them ever noticing...`,
 actions: [
 {
 label: `Attempt to Clone Security ID #${cardId}`,
 primary: true,
 onClick: () => {
 this.hackerStolenMfaCards.add(targetChar.id);
 auditLog.logAction('anshuman', 'mfa_theft', `Cloned ${targetChar.name.toUpperCase()}'s physical Security ID #${cardId}`, 'Compromised');
 this.setBattleDialogue(
 '● CARD CLONED!',
 `You covertly clone Security ID #${cardId} off ${targetChar.name} - they never feel a thing, and their real card still works fine! Even with MFA enabled, a physical token can still be cloned without your knowledge - you would also need their password to fully take over the account.`,
 [
 {
 label: 'View "MFA Is Not Magic" Lesson',
 primary: true,
 onClick: () => {
 this.closeBattleEncounter();
 this.showEducationalCard('mfaNotMagic', () => {});
 }
 },
 {
 label: 'Step Back ◀',
 onClick: () => this.closeBattleEncounter()
 }
 ]
 );
 }
 },
 {
 label: 'Step Back ◀',
 onClick: () => this.closeBattleEncounter()
 }
 ]
 });
 }

 /**
 * The simulation's triumphant ending: Anshuman gets the same clone opportunity as
 * always, but an MFA-hardened Yash is alert enough to catch him mid-attempt
 * instead of the clone silently succeeding.
 */
 startYashCatchesAnshumanEncounter(targetChar) {
 const cardId = USER_ACCOUNTS[targetChar.id].secondFactorId;
 this.startBattleEncounter({
 opponentId: targetChar.id,
 opponentName: targetChar.name.toUpperCase(),
 opponentRole: 'MFA Enrolled',
 opponentBadge: `CARD #${cardId}`,
 playerId: 'anshuman',
 playerName: 'ANSHUMAN',
 playerRole: 'Physical Card Cloning',
 playerBadge: 'ATTACKER',
 speaker: 'ANSHUMAN',
 dialogue: `${targetChar.name} is wearing their Club Security ID badge #${cardId} on a lanyard. Getting close enough with a hidden skimmer could clone its signal without them ever noticing...`,
 actions: [
 {
 label: `Attempt to Clone Security ID #${cardId}`,
 primary: true,
 onClick: () => this.playYashCatchesAnshumanConversation(targetChar)
 },
 {
 label: 'Step Back ◀',
 onClick: () => this.closeBattleEncounter()
 }
 ]
 });
 }

 /** The multi-beat "caught red-handed" exchange, once Anshuman actually goes for it. */
 playYashCatchesAnshumanConversation(targetChar) {
 const yashName = targetChar.name.toUpperCase();
 this.setBattleDialogue(
 yashName,
 `Hold on... why are your hands anywhere near my badge?`,
 [
 {
 label: '...',
 primary: true,
 onClick: () => {
 this.setBattleDialogue(
 yashName,
 `I set up MFA specifically so I wouldn't be fooled again and again, Anshuman. Not this time!`,
 [
 {
 label: '...',
 primary: true,
 onClick: () => {
 this.setBattleDialogue(
 'ANSHUMAN',
 `Please listen to me...`,
 [
 {
 label: '...',
 primary: true,
 onClick: () => {
 this.setBattleDialogue(
 yashName,
 `*${yashName} kicks Anshuman!*`,
 [
 {
 label: '?!',
 primary: true,
 onClick: () => this.beginAnshumanEjectionCutscene(targetChar)
 }
 ]
 );
 }
 }
 ]
 );
 }
 }
 ]
 );
 }
 }
 ]
 );
 }

 /** Closes the battle screen and plays Anshuman getting physically thrown out, then shows the victory card. */
 beginAnshumanEjectionCutscene(targetChar) {
 this.closeBattleEncounter(() => {
 auditLog.logAction('anshuman', 'capture', `Caught trying to clone ${targetChar.name.toUpperCase()}'s MFA-protected Security ID and thrown out of the club`, undefined, true);
 this.world.centerOnCharacter(targetChar.id);
 this.world.showBubble(targetChar.id, "And STAY out!", 3000);
 this.playAnshumanEjectionAnimation(targetChar, () => {
 this.showCaptureVictoryModal(targetChar);
 });
 });
 }

 /**
 * Animates Anshuman actually getting kicked, as three fixed-duration phases rather
 * than one smooth glide (which read as sliding, not being kicked) or an
 * unthrottled physics bounce simulation (which - per the "bouncing ball" real-
 * time collapse - converges to a stop almost instantly once damping shrinks
 * the bounce period, making it look like it ends way too fast):
 * 1. Windup - Anshuman flinches in place for a beat ("wait for it").
 * 2. Kick arc - a sharp pop up and outward, the impact itself.
 * 3. Roll - he comes down and skids away, decelerating with a couple of
 * shrinking bounces and slowing spin, before coming to rest.
 * Done by tweening his world position/spin each frame; the world's own render
 * loop (already running continuously) picks up the change automatically.
 */
 playAnshumanEjectionAnimation(targetChar, onComplete) {
 const anshuman = this.world.characters.get('anshuman');
 if (!anshuman) {
 if (onComplete) onComplete();
 return;
 }

 anshuman.isMoving = false;
 anshuman.targetX = undefined;
 anshuman.targetY = undefined;
 anshuman.bubbleText = '';
 anshuman.facing = targetChar.x >= anshuman.x ? 'left' : 'right';

 // Block world clicks/keyboard movement for the duration of the cutscene -
 // the battle overlay (which normally does this via onCheckInteractionBlocked)
 // is already closed at this point, so nothing else stops a stray click from
 // fighting with the tween below.
 this.cutsceneInProgress = true;

 const dir = Math.sign(anshuman.x - targetChar.x) || 1;
 const groundY = anshuman.y;
 const startX = anshuman.x;

 // Distances are large on purpose - comfortably more than the entire world
 // canvas's width even at the widest zoom level, so he's unambiguously
 // carried off past the edge of the screen rather than stopping mid-view.
 const WINDUP_MS = 350;
 const ARC_MS = 600;
 const ROLL_MS = 2200;
 const ARC_DIST = 260;
 const ARC_HEIGHT = 90;
 const ROLL_DIST = 1400;
 const ARC_SPIN = Math.PI * 2.5;
 const ROLL_SPIN = Math.PI * 6;

 const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
 const easeOutSine = (t) => Math.sin(t * Math.PI * 0.5);

 const runPhase = (durationMs, onTick, onDone) => {
 const start = performance.now();
 const step = (time) => {
 const t = Math.min((time - start) / durationMs, 1);
 onTick(t);
 if (t < 1) {
 requestAnimationFrame(step);
 } else {
 onDone();
 }
 };
 requestAnimationFrame(step);
 };

 // Phase 1: windup - a nervous little flinch, no real movement yet.
 runPhase(WINDUP_MS, (t) => {
 anshuman.ejectSpin = Math.sin(t * Math.PI * 6) * 0.08;
 }, () => {
 anshuman.ejectSpin = 0;

 // Phase 2: the kick itself - a sharp arc up and outward.
 runPhase(ARC_MS, (t) => {
 const e = easeOutCubic(t);
 anshuman.x = startX + dir * ARC_DIST * e;
 anshuman.y = groundY - Math.sin(t * Math.PI) * ARC_HEIGHT;
 anshuman.ejectSpin = dir * ARC_SPIN * t;
 }, () => {
 const arcEndX = startX + dir * ARC_DIST;
 anshuman.y = groundY;

 // Phase 3: rolling away - a long, gently-decelerating skid (easeOutSine
 // ramps down smoothly instead of front-loading the speed the way a
 // sharper ease-out would, so it never feels like it suddenly jolts
 // faster) with shrinking bounces and spin that slows to a stop.
 runPhase(ROLL_MS, (t) => {
 const e = easeOutSine(t);
 anshuman.x = arcEndX + dir * ROLL_DIST * e;
 const bounceEnvelope = (1 - t) * (1 - t);
 anshuman.y = groundY - Math.abs(Math.sin(t * Math.PI * 5)) * 22 * bounceEnvelope;
 anshuman.ejectSpin = dir * ARC_SPIN + dir * ROLL_SPIN * easeOutCubic(t);
 }, () => {
 anshuman.y = groundY;
 anshuman.ejectSpin = 0;
 this.cutsceneInProgress = false;
 if (onComplete) onComplete();
 });
 });
 });
 }

 /** Resets Anshuman back near his house (post-ejection) and shows the "simulation complete" card. */
 showCaptureVictoryModal(targetChar) {
 const anshuman = this.world.characters.get('anshuman');
 if (anshuman) {
 anshuman.x = 350;
 anshuman.y = 720;
 anshuman.facing = 'down';
 }

 this.showModal(`
 <div class="card-container" style="max-width: 560px; text-align: center;">
 <div class="card-badge" style="background: var(--success-accent); color: #04120a; border-color: var(--success-strong);">● ANSHUMAN CAPTURED!</div>
 <div class="card-title" style="color: var(--success-text);">CONGRATULATIONS!</div>
 <p style="font-size: 14px; color: var(--muted-text-soft); line-height: 1.6; margin-bottom: 14px; text-align: left;">
 ${targetChar.name} caught Anshuman trying to clone a Security ID protected by Multi-Factor Authentication - and threw him clean out of the club!
 </p>
 <div class="card-takeaway" style="text-align: left;">
 You've completed The Secure Club's Password, Authentication &amp; MFA simulation! A strong, unique password plus MFA is what finally stopped the attacker for good.
 </div>
 <button class="btn btn-primary" id="btnCaptureContinue" style="width: 100%; margin-top: 14px; justify-content: center;">Continue Exploring ▶</button>
 </div>
 `);
 document.getElementById('btnCaptureContinue')?.addEventListener('click', () => this.closeModal());
 }

 /** Security tools purchasable with cash - each ties into a real security mechanic. */
 getShopItems() {
 return [
 {
 id: 'mfa_key',
 name: 'Hardware MFA Security Key',
 price: 4000,
 desc: 'A physical second factor for your login. Even if your password leaks, an attacker still can\'t authenticate without this key.',
 owned: (id) => Boolean(USER_ACCOUNTS[id]?.mfaEnabled),
 buy: (id) => { USER_ACCOUNTS[id].mfaEnabled = true; }
 },
 {
 id: 'pw_manager',
 name: 'Password Manager License',
 price: 2500,
 desc: 'Generates and stores a high-entropy secret phrase for you, upgrading your password from WEAK to STRONG.',
 owned: (id) => USER_ACCOUNTS[id]?.passwordStrength === 'strong',
 buy: (id) => setPasswordStrength(id, 'strong')
 },
 {
 id: 'vip_membership',
 name: 'VIP Club Membership',
 price: 8000,
 desc: 'Grants permanent VIP Lounge authorization - the Security Guard will admit you on request, no exceptions needed.',
 owned: (id) => Boolean(USER_ACCOUNTS[id]?.isVIP),
 buy: (id) => { USER_ACCOUNTS[id].isVIP = true; }
 }
 ];
 }

 renderShopTab(controlledCharId) {
 const hasAccount = Boolean(USER_ACCOUNTS[controlledCharId]);
 const cash = this.getCash(controlledCharId);

 if (!hasAccount) {
 return `
 <div style="font-size: 12px; color: var(--muted-text-soft); line-height: 1.5;">
 <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger-text-strong); border-radius: 6px; padding: 14px; color: var(--danger-text-soft);">
 <strong>NO ACCOUNT ON FILE:</strong> Anshuman has no legitimate club membership, so there is nothing here to upgrade.
 Security tools protect real accounts - they can't be bought by someone with no identity to protect.
 </div>
 </div>
 `;
 }

 return `
 <div style="font-size: 11px; color: var(--muted-text); margin-bottom: 10px;">
 SECURITY SHOP — Spend cash on real protections for ${controlledCharId.toUpperCase()}'s account. Balance: <strong style="color: var(--gold-text);">${this.formatCash(cash)}</strong>
 </div>
 <div style="display: flex; flex-direction: column; gap: 10px;">
 ${this.getShopItems().map(item => {
 const owned = item.owned(controlledCharId);
 const affordable = cash >= item.price;
 return `
 <div style="background: #0f172a; border: 1px solid var(--bg-panel); border-radius: 6px; padding: 12px; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
 <div>
 <div style="font-weight: bold; color: #f8fafc; font-size: 13px;">${item.name}</div>
 <div style="font-size: 11px; color: var(--muted-text); margin-top: 2px; max-width: 380px;">${item.desc}</div>
 </div>
 <div style="text-align: right; flex-shrink: 0;">
 <div style="color: var(--gold-text); font-weight: bold; margin-bottom: 6px;">${this.formatCash(item.price)}</div>
 ${owned
 ? '<span class="session-badge-active">OWNED</span>'
 : `<button id="btnBuy_${item.id}" class="btn btn-sm ${affordable ? 'btn-primary' : ''}" ${affordable ? '' : 'disabled title="Insufficient funds"'} style="font-size: 11px;">${affordable ? 'Buy' : 'Can\'t Afford'}</button>`
 }
 </div>
 </div>
 `;
 }).join('')}
 </div>
 `;
 }

 // Regular members use the terminal to look up their own account history;
 // Anshuman sees a completely different (and much more dangerous) interface -
 // see openAnshumanHackTerminal().
 openSecurityTerminalModal(activeTab = 'transactions') {
 const controlledCharId = this.world.controlledCharId;

 if (controlledCharId === 'anshuman') {
 this.openAnshumanHackTerminal();
 return;
 }

 const identity = controlledCharId;
 const tab = activeTab === 'fines' ? 'fines' : 'transactions';
 const events = auditLog.getEventsForIdentity(identity);
 const transactions = events.filter(e => e.action === 'purchase');
 const fineEvents = events.filter(e => e.action === 'incident' || e.action === 'fine_paid');
 const currentFine = this.unpaidFines.get(identity);

 this.showModal(`
 <div class="card-container terminal-card">
 <div class="terminal-header">
 <span>THE SECURE CLUB — MEMBER SECURITY PC</span>
 <span style="color: var(--success-text);">● ONLINE</span>
 </div>

 <div class="terminal-tabs">
 <button class="terminal-tab ${tab === 'transactions' ? 'active' : ''}" id="tabTransactions">
 Transaction History (${transactions.length})
 </button>
 <button class="terminal-tab ${tab === 'fines' ? 'active' : ''}" id="tabFines">
 Fine History${currentFine ? ' (1 UNPAID)' : ''}
 </button>
 </div>

 <div class="terminal-body">
 ${tab === 'transactions' ? `
 <div style="font-size: 11px; color: var(--muted-text); margin-bottom: 10px;">
 PURCHASES CHARGED TO YOUR ACCOUNT, ${identity.toUpperCase()}
 </div>
 <div class="terminal-screen">
 ${transactions.length === 0 ? '<div style="color: var(--muted-text-dim); text-align: center; padding: 20px;">No transactions yet. Order something at the bar!</div>' : ''}
 ${transactions.map(e => `
 <div style="padding: 6px 0; border-bottom: 1px solid var(--bg-panel); color: var(--muted-text); line-height: 1.4;">
 <span style="color: var(--info-text);">[${new Date(e.timestamp).toLocaleTimeString()}]</span>
 <span style="color: #e2e8f0;">${e.details}</span>
 ${e.cost ? `<span style="color: var(--danger-text);">(-${e.cost})</span>` : ''}
 </div>
 `).join('')}
 </div>
 ` : ''}

 ${tab === 'fines' ? `
 ${currentFine ? `
 <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid var(--danger-text-strong); border-radius: 6px; padding: 12px; margin-bottom: 12px; color: var(--danger-text-soft); font-size: 12px; line-height: 1.5;">
 <strong>OUTSTANDING FINE: ₹${currentFine.amount}</strong> — ${currentFine.reason}<br>
 <span style="color: var(--muted-text);">Settle this at the club entrance before your next visit.</span>
 </div>
 ` : `
 <div style="color: var(--success-text); font-size: 12px; margin-bottom: 12px;">No outstanding fines. Your account is in good standing.</div>
 `}
 <div class="terminal-screen">
 ${fineEvents.length === 0 ? '<div style="color: var(--muted-text-dim); text-align: center; padding: 20px;">No fine history recorded.</div>' : ''}
 ${fineEvents.map(e => `
 <div style="padding: 6px 0; border-bottom: 1px solid var(--bg-panel); color: ${e.action === 'incident' ? 'var(--danger-text)' : 'var(--success-text)'}; line-height: 1.4;">
 <span style="color: var(--info-text);">[${new Date(e.timestamp).toLocaleTimeString()}]</span>
 <strong>${e.action === 'incident' ? 'FINE ISSUED' : 'FINE PAID'}:</strong>
 <span style="color: #e2e8f0;">${e.details}</span>
 </div>
 `).join('')}
 </div>
 ` : ''}

 <div style="margin-top: 18px; border-top: 1px solid var(--bg-panel); padding-top: 12px; display: flex; justify-content: flex-end;">
 <button id="btnCloseTerminal" class="btn btn-primary" style="padding: 8px 24px;">Close Terminal ✕</button>
 </div>
 </div>
 </div>
 `);

 document.getElementById('tabTransactions')?.addEventListener('click', () => this.openSecurityTerminalModal('transactions'));
 document.getElementById('tabFines')?.addEventListener('click', () => this.openSecurityTerminalModal('fines'));
 document.getElementById('btnCloseTerminal')?.addEventListener('click', () => this.closeModal());
 }

 // Anshuman finds this same terminal left logged in and unlocked - instead of an
 // account lookup, he gets a "hack the terminal" button that lets him dump
 // any member's raw credentials straight out of the server's database. This
 // is a server-side breach: the victim did nothing wrong (their password can
 // be arbitrarily strong), the failure is the server storing/exposing it.
 openAnshumanHackTerminal(view = 'menu') {
 if (view === 'pick') {
 const targets = Object.keys(USER_ACCOUNTS);
 this.showModal(`
 <div class="card-container terminal-card">
 <div class="terminal-header">
 <span>MEMBER DATABASE — RAW RECORDS</span>
 <span style="color: var(--danger-text-strong);">● BREACHED</span>
 </div>
 <div class="terminal-body">
 <div style="font-size: 11px; color: var(--muted-text); margin-bottom: 10px;">SELECT AN ACCOUNT ID TO DUMP ITS STORED CREDENTIALS</div>
 <div style="display: flex; flex-direction: column; gap: 10px;">
 ${targets.map(id => `
 <button class="btn btn-danger" id="btnDump_${id}" style="justify-content: space-between; padding: 12px;">
 <span>${USER_ACCOUNTS[id].name.toUpperCase()} — ID: ${id.toUpperCase()}</span>
 <span>${this.hackerKnownPasswords.has(id) ? 'Already Dumped' : 'Dump Record ▶'}</span>
 </button>
 `).join('')}
 </div>
 <div style="margin-top: 18px; border-top: 1px solid var(--bg-panel); padding-top: 12px; display: flex; justify-content: flex-end;">
 <button id="btnCloseTerminal" class="btn btn-primary" style="padding: 8px 24px;">Close Terminal ✕</button>
 </div>
 </div>
 </div>
 `);
 targets.forEach(id => {
 document.getElementById(`btnDump_${id}`)?.addEventListener('click', () => this.executeServerBreach(id));
 });
 document.getElementById('btnCloseTerminal')?.addEventListener('click', () => this.closeModal());
 return;
 }

 this.showModal(`
 <div class="card-container terminal-card">
 <div class="terminal-header">
 <span>THE SECURE CLUB — MAIN SECURITY PC</span>
 <span style="color: var(--success-text);">● ONLINE</span>
 </div>
 <div class="terminal-body">
 <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger-text-strong); border-radius: 6px; padding: 14px; color: var(--danger-text-soft); font-size: 12px; line-height: 1.6; margin-bottom: 14px;">
 This terminal was left logged in and unlocked. Its member database is sitting right here, completely unprotected.
 </div>
 <button id="btnHackTerminal" class="btn btn-danger" style="width: 100%; justify-content: center; font-weight: bold; padding: 12px;">
 HACK TERMINAL — Dump Member Database
 </button>
 <div style="margin-top: 18px; border-top: 1px solid var(--bg-panel); padding-top: 12px; display: flex; justify-content: flex-end;">
 <button id="btnCloseTerminal" class="btn btn-primary" style="padding: 8px 24px;">Close Terminal ✕</button>
 </div>
 </div>
 </div>
 `);
 document.getElementById('btnHackTerminal')?.addEventListener('click', () => this.openAnshumanHackTerminal('pick'));
 document.getElementById('btnCloseTerminal')?.addEventListener('click', () => this.closeModal());
 }

 executeServerBreach(userId) {
 const account = USER_ACCOUNTS[userId];
 if (!account) return;

 if (this.hackerKnownPasswords.has(userId)) {
 this.closeModal();
 this.showModal(`
 <div class="card-container" style="max-width: 520px;">
 <div class="card-badge">ALREADY DUMPED</div>
 <div class="card-title">${account.name.toUpperCase()}'S RECORD ALREADY STOLEN</div>
 <p style="font-size: 13px; color: var(--muted-text-soft); line-height: 1.5; margin-bottom: 12px;">
 You already pulled ${account.name}'s credentials from this database: "${this.hackerKnownPasswords.get(userId)}". No need to dump it twice.
 </p>
 <button class="btn btn-primary" id="btnCardContinue" style="width: 100%;">Back ▶</button>
 </div>
 `);
 document.getElementById('btnCardContinue')?.addEventListener('click', () => {
 this.closeModal();
 this.openAnshumanHackTerminal('pick');
 });
 return;
 }

 this.hackerKnownPasswords.set(userId, account.secretPhrase);
 auditLog.logAction('anshuman', 'server_breach', `Dumped ${account.name.toUpperCase()}'s credentials directly from the member database`, undefined, true);
 this.setActiveCharacter('anshuman'); // refresh HUD so the new stolen password shows immediately
 this.closeModal();

 this.showModal(`
 <div class="card-container" style="max-width: 560px;">
 <div class="card-badge danger">SERVER BREACH SUCCESSFUL</div>
 <div class="card-title danger">CREDENTIALS DUMPED FROM SERVER DATABASE</div>
 <p style="font-size: 13px; color: var(--muted-text-soft); line-height: 1.5; margin-bottom: 12px;">
 Username: <strong style="color: #f8d068;">${account.name.toUpperCase()}</strong><br>
 Password: <strong style="color: #f8d068;">"${account.secretPhrase}"</strong>
 </p>
 <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid var(--info-border); border-radius: 6px; padding: 10px; font-size: 12px; color: #bae6fd; margin-bottom: 14px;">
 <strong>${account.name.toUpperCase()} did nothing wrong here.</strong> This password was never guessed, shared, or intercepted - it was exposed because the SERVER stored it insecurely and left this terminal unlocked. This is a server-side failure, not a user mistake.
 </div>
 <button class="btn btn-primary" id="btnCardContinue" style="width: 100%;">Continue ▶</button>
 </div>
 `);
 document.getElementById('btnCardContinue')?.addEventListener('click', () => {
 this.closeModal();
 this.showEducationalCard('serverBreach', () => {});
 });
 }

 openSecurityShopModal() {
 const controlledCharId = this.world.controlledCharId;
 this.showModal(`
 <div class="card-container terminal-card">
 <div class="terminal-header">
 <span>SECURITY SHOP</span>
 <span style="color: var(--success-text);">● OPEN</span>
 </div>
 <div class="terminal-body">
 ${this.renderShopTab(controlledCharId)}
 <div style="margin-top: 18px; border-top: 1px solid var(--bg-panel); padding-top: 12px; display: flex; justify-content: flex-end;">
 <button id="btnCloseTerminal" class="btn btn-primary" style="padding: 8px 24px;">Close Shop ✕</button>
 </div>
 </div>
 </div>
 `);

 this.getShopItems().forEach(item => {
 document.getElementById(`btnBuy_${item.id}`)?.addEventListener('click', () => {
 if (!USER_ACCOUNTS[controlledCharId] || item.owned(controlledCharId)) return;
 // The Buy button is already disabled whenever unaffordable (see
 // renderShopTab), so this is just a safety net - it should never actually
 // fire, but if it somehow does, fail silently rather than a native alert().
 if (!this.spendCash(controlledCharId, item.price)) return;
 item.buy(controlledCharId);
 auditLog.logAction(controlledCharId, 'purchase', `Bought ${item.name}`, this.formatCash(item.price));
 this.setActiveCharacter(controlledCharId); // refresh HUD (MFA/strength/VIP/cash all may have changed)
 this.openSecurityShopModal();
 });
 });

 document.getElementById('btnCloseTerminal')?.addEventListener('click', () => this.closeModal());
 }

 openYashHouseModal() {
 const yash = USER_ACCOUNTS.yash;
 const isWeak = yash.passwordStrength === 'weak';

 this.showModal(`
 <div class="card-container" style="max-width: 580px;">
 <div class="card-badge" style="background: #1e3a8a; border-color: var(--info-accent); color: var(--info-text-pale);"> YASH'S HOUSE — DESKTOP WORKSTATION</div>
 <div class="card-title" style="font-size: 20px;">Personal Credential & Security Settings</div>
 <p style="color: var(--muted-text-soft); font-size: 13px; line-height: 1.5; margin-bottom: 14px;">
 Welcome inside Yash's room! Choose password complexity and configure Multi-Factor Authentication.
 </p>

 <div style="background: #0f172a; border: 2px solid #334155; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
 <!-- Password Strength Section -->
 <div style="margin-bottom: 14px;">
 <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
 <label style="font-size: 11px; color: var(--muted-text); font-weight: bold;">
 PASSWORD COMPLEXITY & STRENGTH:
 </label>
 <span class="badge-strength ${isWeak ? 'weak' : 'strong'}">
 ${isWeak ? 'WEAK (VULNERABLE )' : 'STRONG (PROTECTED )'}
 </span>
 </div>
 
 <div style="display: flex; gap: 8px; margin-bottom: 8px;">
 <button id="btnYashSetStrong" class="btn ${!isWeak ? 'btn-primary' : ''}" style="flex: 1; justify-content: center; font-size: 11px;">
 Strong: "${yash.strongPassword}"
 </button>
 <button id="btnYashSetWeak" class="btn ${isWeak ? 'btn-danger' : ''}" style="flex: 1; justify-content: center; font-size: 11px;">
 Weak: "${yash.weakPassword}"
 </button>
 </div>

 <p style="font-size: 11px; color: ${isWeak ? 'var(--danger-text-soft)' : 'var(--success-text-soft)'}; margin: 0; line-height: 1.4;">
 ${isWeak
 ? ' WARNING: Weak passwords are always cracked by Anshuman’s automated brute-force dictionary attack!'
 : '✓ SECURE: Strong phrase possesses high entropy, making automated dictionary guessing impossible!'}
 </p>
 </div>

 <!-- Desktop PC: Online Bank & Ecommerce -->
 <div style="margin-bottom: 14px; border-top: 1px solid var(--bg-panel); padding-top: 10px;">
 <div style="font-size: 12px; color: #f8fafc; font-weight: bold; margin-bottom: 6px;"> Desktop PC:</div>
 <button id="btnOpenYashPC" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 10px;">
 Use Desktop PC (Online Bank & Shopping)
 </button>
 </div>

 <!-- MFA Section -->
 <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--bg-panel); padding-top: 10px;">
 <div>
 <div style="font-size: 12px; color: #f8fafc; font-weight: bold;"> Physical Club Security ID:</div>
 <div style="font-size: 11px; color: var(--info-text-soft); font-family: var(--font-mono);">${yash.secondFactorId}</div>
 </div>
 <span style="font-size: 10px; background: var(--bg-panel); color: var(--success-emphasis); padding: 4px 8px; border-radius: 4px; font-weight: bold;">PHYSICAL CARD</span>
 </div>

 <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--bg-panel); padding-top: 10px;">
 <div>
 <div style="font-size: 12px; color: #f8fafc; font-weight: bold;"> Multi-Factor Authentication (MFA):</div>
 <div style="font-size: 11px; color: var(--muted-text);">Requires both Password + Security ID to enter Club</div>
 </div>
 <button id="btnToggleMfa" class="btn ${yash.mfaEnabled ? 'btn-success' : 'btn-danger'}" style="padding: 6px 12px; font-size: 11px;">
 ${yash.mfaEnabled ? '✓ MFA ENABLED' : '✗ MFA DISABLED'}
 </button>
 </div>
 </div>

 <div style="display: flex; gap: 10px;">
 <button id="btnWalkToClubFromHouse" class="btn btn-primary" style="flex: 1; justify-content: center;">
 Head to Club Entrance
 </button>
 <button id="btnCloseYashHouse" class="btn" style="padding: 8px 16px;">
 ✕ Leave House
 </button>
 </div>
 </div>
 `);

 document.getElementById('btnYashSetStrong')?.addEventListener('click', () => {
 setPasswordStrength('yash', 'strong');
 this.updateCharacterHud({
 name: 'Yash',
 role: 'Regular Club Member',
 avatar: '',
 badgeText: 'MEMBER',
 badgeClass: 'regular',
 password: USER_ACCOUNTS.yash.secretPhrase,
 strength: 'strong',
 isVip: USER_ACCOUNTS.yash.isVIP,
 clubId: USER_ACCOUNTS.yash.secondFactorId,
 mfa: USER_ACCOUNTS.yash.mfaEnabled ? 'Club Security ID' : 'Disabled'
 });
 this.closeModal();
 this.openYashHouseModal();
 });

 document.getElementById('btnYashSetWeak')?.addEventListener('click', () => {
 setPasswordStrength('yash', 'weak');
 this.updateCharacterHud({
 name: 'Yash',
 role: 'Regular Club Member',
 avatar: '',
 badgeText: 'MEMBER',
 badgeClass: 'regular',
 password: USER_ACCOUNTS.yash.secretPhrase,
 strength: 'weak',
 isVip: USER_ACCOUNTS.yash.isVIP,
 clubId: USER_ACCOUNTS.yash.secondFactorId,
 mfa: USER_ACCOUNTS.yash.mfaEnabled ? 'Club Security ID' : 'Disabled'
 });
 this.closeModal();
 this.openYashHouseModal();
 });

 document.getElementById('btnToggleMfa')?.addEventListener('click', () => {
 USER_ACCOUNTS.yash.mfaEnabled = !USER_ACCOUNTS.yash.mfaEnabled;
 this.updateCharacterHud({
 name: 'Yash',
 role: 'Regular Club Member',
 avatar: '',
 badgeText: 'MEMBER',
 badgeClass: 'regular',
 password: USER_ACCOUNTS.yash.secretPhrase,
 strength: USER_ACCOUNTS.yash.passwordStrength,
 isVip: USER_ACCOUNTS.yash.isVIP,
 clubId: USER_ACCOUNTS.yash.secondFactorId,
 mfa: USER_ACCOUNTS.yash.mfaEnabled ? 'Club Security ID' : 'Disabled'
 });
 this.closeModal();
 this.openYashHouseModal();
 });

 document.getElementById('btnWalkToClubFromHouse')?.addEventListener('click', () => {
 this.closeModal();
 this.world.moveCharacterTo('yash', 1300, 690);
 this.world.centerOnCharacter('yash');
 });

 document.getElementById('btnCloseYashHouse')?.addEventListener('click', () => {
 this.closeModal();
 });

 document.getElementById('btnOpenYashPC')?.addEventListener('click', () => {
 this.renderBrowserDesktop('yash');
 });
 }

 openVipulHouseModal() {
 const vipul = USER_ACCOUNTS.vipul;
 const isWeak = vipul.passwordStrength === 'weak';

 this.showModal(`
 <div class="card-container" style="max-width: 580px;">
 <div class="card-badge" style="background: #784810; border-color: var(--gold-accent); color: var(--gold-text-soft);"> VIPUL'S VILLA — EXECUTIVE WORKSTATION</div>
 <div class="card-title" style="font-size: 20px;">VIP Credential & Vault Configuration</div>
 <p style="color: var(--muted-text-soft); font-size: 13px; line-height: 1.5; margin-bottom: 14px;">
 Welcome inside Vipul’s luxury villa! As a VIP club member, your credentials grant access to the exclusive VIP Lounge.
 </p>

 <div style="background: #0f172a; border: 2px solid #b45309; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
 <div style="margin-bottom: 14px;">
 <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
 <label style="font-size: 11px; color: var(--gold-text); font-weight: bold;">
 VIP PASSWORD COMPLEXITY:
 </label>
 <span class="badge-strength ${isWeak ? 'weak' : 'strong'}">
 ${isWeak ? 'WEAK (VULNERABLE )' : 'STRONG (PROTECTED )'}
 </span>
 </div>
 
 <div style="display: flex; gap: 8px; margin-bottom: 8px;">
 <button id="btnVipulSetStrong" class="btn ${!isWeak ? 'btn-primary' : ''}" style="flex: 1; justify-content: center; font-size: 11px;">
 Strong: "${vipul.strongPassword}"
 </button>
 <button id="btnVipulSetWeak" class="btn ${isWeak ? 'btn-danger' : ''}" style="flex: 1; justify-content: center; font-size: 11px;">
 Weak: "${vipul.weakPassword}"
 </button>
 </div>

 <p style="font-size: 11px; color: ${isWeak ? 'var(--danger-text-soft)' : 'var(--success-text-soft)'}; margin: 0; line-height: 1.4;">
 ${isWeak
 ? ' WARNING: Even VIP accounts are always compromised by Anshuman’s automated brute-force attack if using a common weak password!'
 : '✓ SECURE: Unique, high-entropy password prevents brute-force dictionary attacks.'}
 </p>
 </div>

 <!-- Desktop PC: Online Bank & Ecommerce -->
 <div style="margin-bottom: 14px; border-top: 1px solid var(--bg-panel); padding-top: 10px;">
 <div style="font-size: 12px; color: #f8fafc; font-weight: bold; margin-bottom: 6px;"> Desktop PC:</div>
 <button id="btnOpenVipulPC" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 10px;">
 Use Desktop PC (Online Bank & Shopping)
 </button>
 </div>

 <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--bg-panel); padding-top: 10px;">
 <div>
 <div style="font-size: 12px; color: #f8fafc; font-weight: bold;"> VIP Membership Tier:</div>
 <div style="font-size: 11px; color: var(--gold-text);">Full Access to VIP Lounge & Private Bar</div>
 </div>
 <span style="font-size: 10px; background: #78350f; color: var(--gold-text-soft); padding: 4px 8px; border-radius: 4px; font-weight: bold;">VIP AUTHORIZED</span>
 </div>

 <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--bg-panel); padding-top: 10px;">
 <div>
 <div style="font-size: 12px; color: #f8fafc; font-weight: bold;"> Gold Security ID:</div>
 <div style="font-size: 11px; color: var(--info-text-soft); font-family: var(--font-mono);">${vipul.secondFactorId}</div>
 </div>
 <span style="font-size: 10px; background: var(--bg-panel); color: var(--info-text); padding: 4px 8px; border-radius: 4px; font-weight: bold;">ACTIVE</span>
 </div>

 <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--bg-panel); padding-top: 10px;">
 <div>
 <div style="font-size: 12px; color: #f8fafc; font-weight: bold;"> Multi-Factor Authentication (MFA):</div>
 <div style="font-size: 11px; color: var(--muted-text);">Requires Password + Gold Security ID to enter Club</div>
 </div>
 <button id="btnToggleVipulMfa" class="btn ${vipul.mfaEnabled ? 'btn-success' : 'btn-danger'}" style="padding: 6px 12px; font-size: 11px;">
 ${vipul.mfaEnabled ? '✓ MFA ENABLED' : '✗ MFA DISABLED'}
 </button>
 </div>
 </div>

 <div style="display: flex; gap: 10px;">
 <button id="btnWalkToClubFromVipul" class="btn btn-primary" style="flex: 1; justify-content: center;">
 Head to Club Entrance
 </button>
 <button id="btnCloseVipulHouse" class="btn" style="padding: 8px 16px;">
 ✕ Leave Villa
 </button>
 </div>
 </div>
 `);

 document.getElementById('btnVipulSetStrong')?.addEventListener('click', () => {
 setPasswordStrength('vipul', 'strong');
 this.updateCharacterHud({
 name: 'Vipul',
 role: 'VIP Tier Member',
 avatar: '',
 badgeText: 'VIP TIER',
 badgeClass: 'vip',
 password: USER_ACCOUNTS.vipul.secretPhrase,
 strength: 'strong',
 isVip: USER_ACCOUNTS.vipul.isVIP,
 clubId: USER_ACCOUNTS.vipul.secondFactorId,
 mfa: USER_ACCOUNTS.vipul.mfaEnabled ? 'Gold Security ID' : 'Disabled'
 });
 this.closeModal();
 this.openVipulHouseModal();
 });

 document.getElementById('btnVipulSetWeak')?.addEventListener('click', () => {
 setPasswordStrength('vipul', 'weak');
 this.updateCharacterHud({
 name: 'Vipul',
 role: 'VIP Tier Member',
 avatar: '',
 badgeText: 'VIP TIER',
 badgeClass: 'vip',
 password: USER_ACCOUNTS.vipul.secretPhrase,
 strength: 'weak',
 isVip: USER_ACCOUNTS.vipul.isVIP,
 clubId: USER_ACCOUNTS.vipul.secondFactorId,
 mfa: USER_ACCOUNTS.vipul.mfaEnabled ? 'Gold Security ID' : 'Disabled'
 });
 this.closeModal();
 this.openVipulHouseModal();
 });

 document.getElementById('btnToggleVipulMfa')?.addEventListener('click', () => {
 USER_ACCOUNTS.vipul.mfaEnabled = !USER_ACCOUNTS.vipul.mfaEnabled;
 auditLog.logAction('vipul', 'mfa_toggle', `VIP MFA ${USER_ACCOUNTS.vipul.mfaEnabled ? 'ENABLED' : 'DISABLED'} on Gold Card`);
 this.updateCharacterHud({
 name: 'Vipul',
 role: 'VIP Tier Member',
 avatar: '',
 badgeText: 'VIP TIER',
 badgeClass: 'vip',
 password: USER_ACCOUNTS.vipul.secretPhrase,
 strength: USER_ACCOUNTS.vipul.passwordStrength,
 isVip: USER_ACCOUNTS.vipul.isVIP,
 clubId: USER_ACCOUNTS.vipul.secondFactorId,
 mfa: USER_ACCOUNTS.vipul.mfaEnabled ? 'Gold Security ID' : 'Disabled'
 });
 this.closeModal();
 this.openVipulHouseModal();
 });

 document.getElementById('btnWalkToClubFromVipul')?.addEventListener('click', () => {
 this.closeModal();
 this.world.moveCharacterTo('vipul', 1300, 690);
 this.world.centerOnCharacter('vipul');
 });

 document.getElementById('btnCloseVipulHouse')?.addEventListener('click', () => {
 this.closeModal();
 });

 document.getElementById('btnOpenVipulPC')?.addEventListener('click', () => {
 this.renderBrowserDesktop('vipul');
 });
 }

 /** Builds the HTML for one online-account reuse section (or the "worried discovery" panel if compromised). */
 renderOnlineAccountHTML(userId, serviceKey, serviceLabel) {
 const account = USER_ACCOUNTS[userId];
 const service = account[serviceKey];
 const idPrefix = `svc_${userId}_${serviceKey}`;

 if (service.compromised) {
 return `
 <div style="margin-bottom: 14px; border-top: 1px solid var(--bg-panel); padding-top: 10px;">
 <div style="background: #450a0a; border: 2px solid var(--danger-text-strong); border-radius: 6px; padding: 12px; box-shadow: 3px 3px 0px #101820;">
 <div style="font-family: var(--font-retro); color: var(--danger-text); font-size: 10px; margin-bottom: 8px;">! ${serviceLabel.toUpperCase()} WAS BREACHED</div>
 <p style="font-size: 12px; color: var(--danger-text-soft); line-height: 1.5; margin: 0 0 10px;">
 "My login still works, but money is gone from this account! I reused my club password here - this is exactly what could go wrong..."
 </p>
 <button id="${idPrefix}_recover" class="btn btn-danger" style="width: 100%; justify-content: center; font-size: 11px;">
 Secure This Account: Set a New, Separate Password
 </button>
 </div>
 </div>
 `;
 }

 const usesSame = service.reusesClubPassword;
 const alreadyExposed = usesSame && this.hackerKnownPasswords.has(userId);

 return `
 <div style="margin-bottom: 14px; border-top: 1px solid var(--bg-panel); padding-top: 10px;">
 <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
 <label style="font-family: var(--font-retro); font-size: 9px; color: var(--muted-text);">${serviceLabel.toUpperCase()} LOGIN:</label>
 <span class="badge-strength ${usesSame ? 'weak' : 'strong'}">${usesSame ? 'PASSWORD REUSE' : 'SEPARATE PASSWORD'}</span>
 </div>
 <div style="display: flex; gap: 8px; margin-bottom: 8px;">
 <button id="${idPrefix}_diff" class="btn ${!usesSame ? 'btn-primary' : ''}" style="flex: 1; justify-content: center; font-size: 11px;">
 Use Different Password: "${service.password}"
 </button>
 <button id="${idPrefix}_same" class="btn ${usesSame ? 'btn-danger' : ''}" style="flex: 1; justify-content: center; font-size: 11px;">
 Reuse Club Password
 </button>
 </div>
 <p style="font-size: 11px; color: ${usesSame ? 'var(--danger-text-soft)' : 'var(--success-text-soft)'}; margin: 0; line-height: 1.4;">
 ${usesSame
 ? ` RISK: Anyone who steals your club password can log into your ${serviceLabel} and take it over!`
 : `✓ SECURE: A separate password means a stolen club password can't touch your ${serviceLabel}.`}
 </p>
 ${alreadyExposed ? `
 <p style="font-size: 11px; color: var(--danger-text); font-weight: bold; margin: 8px 0 0;">
 ⚠ Anshuman already has your club password! Your ${serviceLabel} is exposed right now - switch to a different password!
 </p>
 ` : ''}
 </div>
 `;
 }

 wireOnlineAccountSection(userId, serviceKey, reopen) {
 const idPrefix = `svc_${userId}_${serviceKey}`;
 document.getElementById(`${idPrefix}_diff`)?.addEventListener('click', () => {
 this.setOnlineAccountPolicy(userId, serviceKey, false);
 this.closeModal();
 reopen();
 });
 document.getElementById(`${idPrefix}_same`)?.addEventListener('click', () => {
 this.setOnlineAccountPolicy(userId, serviceKey, true);
 this.closeModal();
 reopen();
 });
 document.getElementById(`${idPrefix}_recover`)?.addEventListener('click', () => {
 this.recoverOnlineAccount(userId, serviceKey);
 this.closeModal();
 reopen();
 });
 }

 setOnlineAccountPolicy(userId, serviceKey, useSame) {
 const service = USER_ACCOUNTS[userId]?.[serviceKey];
 if (!service) return;
 service.reusesClubPassword = useSame;
 auditLog.logAction(userId, 'account_policy_change', `${serviceKey.toUpperCase()} login set to ${useSame ? 'REUSE club password' : 'separate password'}`);
 }

 recoverOnlineAccount(userId, serviceKey) {
 const service = USER_ACCOUNTS[userId]?.[serviceKey];
 if (!service) return;
 service.compromised = false;
 service.reusesClubPassword = false;
 auditLog.logAction(userId, 'account_recovered', `${serviceKey.toUpperCase()} account recovered and given a fresh, separate password`);
 }

 /** Anshuman's remote hacking terminal (his own home PC) - reachable from the top-left HUD, no physical visit needed. */
 openAnshumanHouseModal() {
 this.showModal(`
 <div class="card-container" style="max-width: 580px;">
 <div class="card-badge" style="background: #302838; border-color: var(--muted-text-dim); color: var(--muted-text-soft);"> ANSHUMAN'S HOUSE — PERSONAL WORKSTATION</div>
 <div class="card-title" style="font-size: 20px;">Home PC</div>
 <p style="color: var(--muted-text-soft); font-size: 13px; line-height: 1.5; margin-bottom: 14px;">
 Just a regular house. Anshuman's PC here still has a few browser tabs open to some stolen bank and ecommerce login pages...
 </p>

 <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
 <button id="btnAnshumanHomeHack" class="btn btn-danger" style="justify-content: center; padding: 10px;">
 Access Hacking Terminal
 </button>
 </div>

 <div style="display: flex; gap: 10px;">
 <button id="btnWalkToClubFromAnshuman" class="btn btn-primary" style="flex: 1; justify-content: center;">
 Head to Club Entrance
 </button>
 <button id="btnCloseAnshumanHouse" class="btn" style="padding: 8px 16px;">
 ✕ Leave House
 </button>
 </div>
 </div>
 `);

 document.getElementById('btnAnshumanHomeHack')?.addEventListener('click', () => {
 this.closeModal();
 this.openAnshumanHackingTerminal();
 });
 document.getElementById('btnWalkToClubFromAnshuman')?.addEventListener('click', () => {
 this.closeModal();
 this.world.moveCharacterTo('anshuman', 1300, 690);
 this.world.centerOnCharacter('anshuman');
 });
 document.getElementById('btnCloseAnshumanHouse')?.addEventListener('click', () => {
 this.closeModal();
 });
 }

 openAnshumanHackingTerminal() {
 this.showModal(`
 <div class="card-container" style="max-width: 480px;">
 <div class="card-badge" style="background: #581818; border-color: var(--danger-text-strong); color: var(--danger-text-soft);"> REMOTE ACCESS</div>
 <div class="card-title" style="font-size: 18px;">Whose browser session do you want to open?</div>
 <p style="color: var(--muted-text-soft); font-size: 12px; line-height: 1.5; margin-bottom: 14px;">
 Anshuman opens the same SecureBank / ShopNow sites the target uses and tries any stolen password against their saved login.
 </p>
 <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
 <button id="btnHackYash" class="btn btn-danger" style="justify-content: center; padding: 12px;">
 Access Yash's Browser${this.hackerKnownPasswords.has('yash') ? ` ("${this.hackerKnownPasswords.get('yash')}")` : ' [No Stolen Password]'}
 </button>
 <button id="btnHackVipul" class="btn btn-danger" style="justify-content: center; padding: 12px;">
 Access Vipul's Browser${this.hackerKnownPasswords.has('vipul') ? ` ("${this.hackerKnownPasswords.get('vipul')}")` : ' [No Stolen Password]'}
 </button>
 </div>
 <button id="btnCancelHack" class="btn" style="width: 100%; justify-content: center;">✕ Cancel</button>
 </div>
 `);

 document.getElementById('btnHackYash')?.addEventListener('click', () => this.renderBrowserDesktop('yash'));
 document.getElementById('btnHackVipul')?.addEventListener('click', () => this.renderBrowserDesktop('vipul'));
 document.getElementById('btnCancelHack')?.addEventListener('click', () => this.closeModal());
 }

 // =========================================================================
 // SIMULATED DESKTOP BROWSER (Online Bank + Ecommerce)
 // Used by Yash/Vipul on their own PC, and by Anshuman remotely impersonating them.
 // =========================================================================

 renderBrowserChrome(title, url, bodyHtml, backLabel) {
 return `
 <div class="card-container" style="max-width: 620px; padding: 0; overflow: hidden;">
 <div style="background: #182030; padding: 10px 14px; display: flex; align-items: center; gap: 10px; border-bottom: 3px solid #d8a038;">
 <div style="display: flex; gap: 5px;">
 <span style="width: 9px; height: 9px; background: #e05050; border: 1px solid #601818; display: inline-block;"></span>
 <span style="width: 9px; height: 9px; background: #f0b030; border: 1px solid #604818; display: inline-block;"></span>
 <span style="width: 9px; height: 9px; background: #48c868; border: 1px solid #185020; display: inline-block;"></span>
 </div>
 <div style="flex: 1; background: #0a0e17; border: 2px solid #384860; border-radius: 3px; padding: 6px 10px; font-size: 10px; color: #68d888; font-family: var(--font-mono); overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
 ${url}
 </div>
 </div>
 <div style="background: #202838; padding: 20px; max-height: 55vh; overflow-y: auto;">
 <div class="card-badge" style="margin-bottom: 14px; text-transform: uppercase;">${title}</div>
 ${bodyHtml}
 </div>
 <div style="padding: 12px 14px; border-top: 2px solid #384860; background: #182030; display: flex; gap: 10px;">
 ${backLabel ? `<button id="btnBrowserBack" class="btn" style="flex: 1; justify-content: center;">◀ ${backLabel}</button>` : ''}
 <button id="btnCloseBrowser" class="btn" style="flex: 1; justify-content: center;">✕ Close Browser</button>
 </div>
 </div>
 `;
 }

 wireBrowserNav(onBack) {
 document.getElementById('btnCloseBrowser')?.addEventListener('click', () => this.closeModal());
 if (onBack) document.getElementById('btnBrowserBack')?.addEventListener('click', onBack);
 }

 siteUrl(serviceKey, path, userId) {
 const host = serviceKey === 'bank' ? 'securebank.example' : 'shopnow.example';
 return `https://${host}/${path}?user=${userId}`;
 }

 /** The "desktop" - pick a site to open. userId is whose PC this is (or, for Anshuman, whose identity he's impersonating). */
 renderBrowserDesktop(userId) {
 const isAnshuman = this.world.controlledCharId === 'anshuman';
 const account = USER_ACCOUNTS[userId];
 const body = `
 <p style="color: var(--muted-text); font-size: 12px; margin-bottom: 16px;">
 ${isAnshuman ? `Browsing as ${account.name.toUpperCase()} using whatever stolen password works.` : 'Double-click a site to open it.'}
 </p>
 <div style="display: flex; gap: 16px;">
 <button id="btnOpenBank" class="btn" style="flex-direction: column; height: 84px; width: 130px; justify-content: center; gap: 8px; background: #0f172a; border: 2px solid #334155; box-shadow: 3px 3px 0px #101820;">
 <span style="font-family: var(--font-retro); font-size: 10px; color: var(--info-text);">[ BANK ]</span>
 <span style="font-size: 10px; color: var(--muted-text);">SecureBank Online</span>
 </button>
 <button id="btnOpenShop" class="btn" style="flex-direction: column; height: 84px; width: 130px; justify-content: center; gap: 8px; background: #0f172a; border: 2px solid #334155; box-shadow: 3px 3px 0px #101820;">
 <span style="font-family: var(--font-retro); font-size: 10px; color: var(--gold-text);">[ SHOP ]</span>
 <span style="font-size: 10px; color: var(--muted-text);">ShopNow</span>
 </button>
 </div>
 `;

 this.showModal(this.renderBrowserChrome(`${account.name}'s Desktop`, 'os://desktop', body, isAnshuman ? 'Pick Different Target' : undefined));
 this.wireBrowserNav(isAnshuman ? () => this.openAnshumanHackingTerminal() : null);
 document.getElementById('btnOpenBank')?.addEventListener('click', () => this.renderSiteLogin(userId, 'bank'));
 document.getElementById('btnOpenShop')?.addEventListener('click', () => this.renderSiteLogin(userId, 'ecommerce'));
 }

 renderSiteLogin(userId, serviceKey) {
 const account = USER_ACCOUNTS[userId];
 const service = account[serviceKey];
 const serviceLabel = serviceKey === 'bank' ? 'SecureBank Online' : 'ShopNow';
 const url = this.siteUrl(serviceKey, 'login', userId);
 const isAnshuman = this.world.controlledCharId === 'anshuman';
 let body;

 if (!isAnshuman) {
 // Login always succeeds with the account's real password, even after a breach -
 // Anshuman rode in on the reused password rather than locking the owner out, so the
 // owner's own credential still works. The damage shows up on the dashboard instead.
 const correctPassword = service.reusesClubPassword ? account.secretPhrase : service.password;
 body = `
 <p style="color: var(--muted-text-soft); font-size: 13px; margin-bottom: 14px;">Username: <strong>${account.name}</strong><br>Enter your ${serviceLabel} password to continue.</p>
 <button id="btnLoginCorrect" class="btn btn-primary" style="width: 100%; justify-content: center; margin-bottom: 8px;">
 Enter Password: "${correctPassword}"
 </button>
 <button id="btnLoginWrong" class="btn btn-danger" style="width: 100%; justify-content: center;">
 Enter Password: "WrongPass123"
 </button>
 `;
 } else {
 const knownPassword = this.hackerKnownPasswords.get(userId);
 if (!knownPassword) {
 body = `<p style="color: var(--danger-text-soft); font-size: 13px; line-height: 1.5;">ACCESS DENIED. You don't have a stolen password for ${account.name.toUpperCase()} to try here.</p>`;
 } else {
 body = `
 <p style="color: var(--muted-text-soft); font-size: 13px; margin-bottom: 14px;">Username: <strong>${account.name}</strong></p>
 <button id="btnTryStolen" class="btn btn-danger" style="width: 100%; justify-content: center;">
 Try Stolen Password: "${knownPassword}"
 </button>
 `;
 }
 }

 this.showModal(this.renderBrowserChrome(serviceLabel, url, body, 'Back to Desktop'));
 this.wireBrowserNav(() => this.renderBrowserDesktop(userId));

 document.getElementById('btnLoginCorrect')?.addEventListener('click', () => this.renderSiteDashboard(userId, serviceKey));

 document.getElementById('btnLoginWrong')?.addEventListener('click', () => {
 this.showModal(this.renderBrowserChrome(serviceLabel, url, `
 <div style="background: #450a0a; border: 2px solid var(--danger-text-strong); border-radius: 6px; padding: 14px; box-shadow: 3px 3px 0px #101820;">
 <div style="font-family: var(--font-retro); color: var(--danger-text); font-size: 11px; margin-bottom: 10px;">✗ INCORRECT PASSWORD</div>
 <p style="color: var(--danger-text-soft); font-size: 12px; line-height: 1.5; margin: 0 0 12px;">"WrongPass123" was rejected. Check your password and try again.</p>
 <button id="btnLoginRetry" class="btn" style="width: 100%; justify-content: center;">Try Again</button>
 </div>
 `, 'Back to Desktop'));
 this.wireBrowserNav(() => this.renderBrowserDesktop(userId));
 document.getElementById('btnLoginRetry')?.addEventListener('click', () => this.renderSiteLogin(userId, serviceKey));
 });

 document.getElementById('btnTryStolen')?.addEventListener('click', () => {
 const knownPassword = this.hackerKnownPasswords.get(userId);
 if (service.reusesClubPassword) {
 auditLog.logAction('anshuman', 'hijack_login', `Logged into ${account.name.toUpperCase()}'s ${serviceLabel} using their reused club password`);
 this.renderSiteDashboard(userId, serviceKey);
 } else {
 auditLog.logAction('anshuman', 'hijack_failed', `Tried ${account.name}'s stolen club password on their ${serviceLabel} - rejected (separate password in use)`);
 this.showModal(this.renderBrowserChrome(serviceLabel, url, `
 <div style="background: #450a0a; border: 2px solid var(--danger-text-strong); border-radius: 6px; padding: 14px; box-shadow: 3px 3px 0px #101820;">
 <div style="font-family: var(--font-retro); color: var(--danger-text); font-size: 11px; margin-bottom: 10px;">✗ INCORRECT PASSWORD</div>
 <p style="color: var(--danger-text-soft); font-size: 12px; line-height: 1.5; margin: 0;">"${knownPassword}" doesn't match. ${account.name.toUpperCase()} uses a SEPARATE password for ${serviceLabel} - the stolen club credential is useless here!</p>
 </div>
 `, 'Back to Desktop'));
 this.wireBrowserNav(() => this.renderBrowserDesktop(userId));
 }
 });
 }

 renderSiteDashboard(userId, serviceKey) {
 const account = USER_ACCOUNTS[userId];
 const service = account[serviceKey];
 const serviceLabel = serviceKey === 'bank' ? 'SecureBank Online' : 'ShopNow';
 const url = this.siteUrl(serviceKey, 'dashboard', userId);
 const isAnshuman = this.world.controlledCharId === 'anshuman';

 const contentBody = serviceKey === 'bank'
 ? this.renderBankDashboardBody(userId, isAnshuman)
 : this.renderShopDashboardBody(userId, isAnshuman);
 const settingsBody = !isAnshuman ? this.renderOnlineAccountHTML(userId, serviceKey, serviceLabel) : '';

 this.showModal(this.renderBrowserChrome(serviceLabel, url, contentBody + settingsBody, 'Back to Desktop'));
 this.wireBrowserNav(() => this.renderBrowserDesktop(userId));

 // The owner still logs in fine after a breach - the damage (missing money) is
 // what tips them off. The dashboard flags it with a "Continue" prompt that
 // hands off into a face-to-face breach investigation encounter, the first
 // time they see it.
 if (!isAnshuman && service.compromised && !this.breachInvestigated.has(`${userId}:${serviceKey}`)) {
 document.getElementById('btnBreachContinue')?.addEventListener('click', () => {
 this.closeModal();
 this.startBreachInvestigationEncounter(userId, serviceKey);
 });
 }

 if (serviceKey === 'bank' && isAnshuman) {
 document.getElementById('btnAnshumanWithdraw')?.addEventListener('click', () => this.executeAnshumanBankWithdraw(userId));
 }
 if (serviceKey === 'ecommerce') {
 document.querySelectorAll('.btn-shop-buy').forEach(btn => {
 btn.addEventListener('click', () => {
 this.executeShopPurchase(userId, btn.getAttribute('data-product'), isAnshuman);
 });
 });
 }
 if (!isAnshuman) {
 this.wireOnlineAccountSection(userId, serviceKey, () => this.renderSiteDashboard(userId, serviceKey));
 }
 }

 renderBankDashboardBody(userId, isAnshuman) {
 const account = USER_ACCOUNTS[userId];
 const balance = this.formatCash(this.getCash(userId));
 const investigated = this.breachInvestigated.has(`${userId}:bank`);
 const distressed = !isAnshuman && account.bank.compromised && !investigated;
 return `
 ${distressed ? `
 <div style="background: #450a0a; border: 2px solid var(--danger-text-strong); border-radius: 6px; padding: 12px; margin-bottom: 14px; box-shadow: 3px 3px 0px #101820;">
 <div style="font-family: var(--font-retro); color: var(--danger-text); font-size: 10px; margin-bottom: 6px;">! SUSPICIOUS ACTIVITY DETECTED</div>
 <p style="font-size: 12px; color: var(--danger-text-soft); line-height: 1.5; margin: 0 0 10px;">
 "That's not right... money is missing from my balance below and I never authorized this!"
 </p>
 <button id="btnBreachContinue" class="btn btn-danger" style="width: 100%; justify-content: center; font-size: 11px;">Continue ▶</button>
 </div>
 ` : ''}
 <div style="background: #0c2a1a; border: 2px solid var(--success-accent); border-radius: 6px; padding: 14px; margin-bottom: 14px; box-shadow: 3px 3px 0px #101820;">
 <div style="font-family: var(--font-retro); font-size: 9px; color: var(--success-text-soft); margin-bottom: 8px; letter-spacing: 0.5px;">${isAnshuman ? `LOGGED IN AS ${account.name.toUpperCase()}` : 'ACCOUNT BALANCE'}</div>
 <div style="font-family: var(--font-retro); font-size: 20px; color: var(--success-text);">${balance}</div>
 </div>
 ${isAnshuman ? `
 <button id="btnAnshumanWithdraw" class="btn btn-danger" style="width: 100%; justify-content: center; margin-bottom: 10px;">
 Withdraw ₹5,000 to Anshuman's Pocket
 </button>
 ` : ''}
 `;
 }

 renderShopDashboardBody(userId, isAnshuman) {
 const account = USER_ACCOUNTS[userId];
 const investigated = this.breachInvestigated.has(`${userId}:ecommerce`);
 const distressed = !isAnshuman && account.ecommerce.compromised && !investigated;
 const items = SHOP_PRODUCTS.map(p => `
 <div style="display: flex; justify-content: space-between; align-items: center; background: #0f172a; border: 2px solid #334155; border-radius: 6px; padding: 10px 12px; margin-bottom: 10px; box-shadow: 3px 3px 0px #101820;">
 <div>
 <div style="font-size: 12px; color: #f8fafc; font-weight: bold;">${p.name}</div>
 <div style="font-family: var(--font-retro); font-size: 10px; color: #f8d068; margin-top: 4px;">₹${p.price.toLocaleString('en-IN')}</div>
 </div>
 <button class="btn btn-primary btn-shop-buy" data-product="${p.id}" style="padding: 6px 14px; font-size: 11px;">Buy</button>
 </div>
 `).join('');
 return `
 ${distressed ? `
 <div style="background: #450a0a; border: 2px solid var(--danger-text-strong); border-radius: 6px; padding: 12px; margin-bottom: 14px; box-shadow: 3px 3px 0px #101820;">
 <div style="font-family: var(--font-retro); color: var(--danger-text); font-size: 10px; margin-bottom: 6px;">! SUSPICIOUS ACTIVITY DETECTED</div>
 <p style="font-size: 12px; color: var(--danger-text-soft); line-height: 1.5; margin: 0 0 10px;">
 "Wait, I don't remember buying this... someone's been shopping on my account!"
 </p>
 <button id="btnBreachContinue" class="btn btn-danger" style="width: 100%; justify-content: center; font-size: 11px;">Continue ▶</button>
 </div>
 ` : ''}
 <div style="font-size: 11px; color: var(--muted-text); margin-bottom: 12px;">
 ${isAnshuman ? `Shopping as ${account.name.toUpperCase()} - charges go to their saved payment method` : 'Saved payment method: Linked Bank Account'}
 </div>
 ${items}
 `;
 }

 /**
 * Face-to-face "how did this happen?" mystery: the breached account owner stands
 * alone in the battle screen and works out, by elimination, that password reuse
 * is what let the attacker in. Wrong guesses just loop back to the same question.
 */
 startBreachInvestigationEncounter(userId, serviceKey) {
 const account = USER_ACCOUNTS[userId];
 const serviceLabel = serviceKey === 'bank' ? 'SecureBank Online' : 'ShopNow';
 const balance = this.formatCash(this.getCash(userId));
 const questionText = `My ${serviceLabel} balance is only ${balance} now - money's missing that I never spent! How could someone possibly have gotten in here?`;

 const OPTIONS = [
 { label: 'I reused my club password on this account too', correct: true },
 { label: 'My computer must have caught a virus', correct: false },
 { label: 'The website itself must be unsafe', correct: false },
 { label: 'I forgot to log out on a public computer', correct: false }
 ];

 const showQuestion = () => {
 this.setBattleDialogue(account.name.toUpperCase(), questionText, buildOptionActions());
 };

 const buildOptionActions = () => OPTIONS.map(opt => ({
 label: opt.label,
 primary: opt.correct,
 onClick: () => {
 if (opt.correct) {
 this.setBattleDialogue(
 account.name.toUpperCase(),
 `"...Wait. Yes, that's it. I used the same password for my club membership as I did for my ${serviceLabel} account - once that got exposed, this account was wide open too."`,
 [{
 label: 'Understood ▶',
 primary: true,
 onClick: () => {
 this.breachInvestigated.add(`${userId}:${serviceKey}`);
 this.closeBattleEncounter();
 this.world.showBubble(userId, "Never reusing that password again!", 4000);
 }
 }]
 );
 } else {
 this.setBattleDialogue(
 account.name.toUpperCase(),
 `"Hmm... no, I don't think that's it."`,
 [{ label: 'Think Again ◀', onClick: () => showQuestion() }]
 );
 }
 }
 }));

 this.startBattleEncounter({
 opponentId: userId,
 opponentName: account.name.toUpperCase(),
 opponentRole: 'Breach Victim',
 opponentBadge: serviceLabel.toUpperCase(),
 playerId: null,
 speaker: account.name.toUpperCase(),
 dialogue: questionText,
 actions: buildOptionActions()
 });
 }

 executeAnshumanBankWithdraw(userId) {
 const account = USER_ACCOUNTS[userId];
 const serviceLabel = 'SecureBank Online';
 const url = this.siteUrl('bank', 'dashboard', userId);
 const victimCash = this.getCash(userId);
 const amount = Math.min(5000, victimCash);

 if (amount <= 0) {
 this.showModal(this.renderBrowserChrome(serviceLabel, url, `<p style="color: var(--danger-text-soft); font-size: 13px;">${account.name.toUpperCase()}'s balance is ₹0. Nothing to withdraw.</p>`, 'Back to Desktop'));
 this.wireBrowserNav(() => this.renderBrowserDesktop(userId));
 return;
 }

 this.userCash.set(userId, victimCash - amount);
 this.anshumanLoot += amount;
 account.bank.compromised = true;
 this.refreshCashHud();
 auditLog.logAction('anshuman', 'hijack_success', `Withdrew ₹${amount} from ${account.name.toUpperCase()}'s SecureBank Online using their reused club password, then changed the password`, `₹${amount}`, true);

 this.showModal(this.renderBrowserChrome(serviceLabel, url, `
 <div style="background: #0c2a1a; border: 2px solid var(--success-accent); border-radius: 6px; padding: 14px; box-shadow: 3px 3px 0px #101820;">
 <div style="font-family: var(--font-retro); font-size: 11px; color: var(--success-text); margin-bottom: 10px;">● WITHDRAWAL SUCCESSFUL</div>
 <p style="color: var(--muted-text-soft); font-size: 12px; line-height: 1.5; margin: 0;">Withdrew ₹${amount} and locked ${account.name.toUpperCase()} out by changing the password. (Total stolen loot: ₹${this.anshumanLoot})</p>
 </div>
 `, 'Back to Desktop'));
 this.wireBrowserNav(() => this.renderBrowserDesktop(userId));
 }

 executeShopPurchase(userId, productId, isAnshuman) {
 const product = SHOP_PRODUCTS.find(p => p.id === productId);
 if (!product) return;
 const account = USER_ACCOUNTS[userId];
 const serviceLabel = 'ShopNow';
 const url = this.siteUrl('ecommerce', 'checkout', userId);
 const balance = this.getCash(userId);

 if (balance < product.price) {
 this.showModal(this.renderBrowserChrome(serviceLabel, url, `<p style="color: var(--danger-text-soft); font-size: 13px;">Insufficient funds! ${account.name.toUpperCase()}'s balance is ${this.formatCash(balance)}, but ${product.name} costs ₹${product.price.toLocaleString('en-IN')}.</p>`, 'Back to Desktop'));
 this.wireBrowserNav(() => this.renderBrowserDesktop(userId));
 return;
 }

 this.userCash.set(userId, balance - product.price);
 if (isAnshuman) {
 this.anshumanLoot += product.price;
 account.ecommerce.compromised = true;
 auditLog.logAction('anshuman', 'hijack_success', `Bought "${product.name}" (₹${product.price}) on ${account.name.toUpperCase()}'s ShopNow using their reused club password, then changed the password`, `₹${product.price}`, true);
 } else {
 auditLog.logAction(userId, 'purchase', `Bought "${product.name}" on ShopNow`, `₹${product.price}`);
 }
 this.refreshCashHud();

 this.showModal(this.renderBrowserChrome(serviceLabel, url, `
 <div style="background: #0c2a1a; border: 2px solid var(--success-accent); border-radius: 6px; padding: 14px; box-shadow: 3px 3px 0px #101820;">
 <div style="font-family: var(--font-retro); font-size: 11px; color: var(--success-text); margin-bottom: 10px;">● ORDER CONFIRMED</div>
 <p style="color: var(--muted-text-soft); font-size: 12px; line-height: 1.5; margin: 0;">${isAnshuman ? `Charged ₹${product.price} to ${account.name.toUpperCase()}'s account for "${product.name}". (Total stolen loot: ₹${this.anshumanLoot})` : `Purchased "${product.name}" for ₹${product.price}.`}</p>
 </div>
 `, 'Back to Desktop'));
 this.wireBrowserNav(() => this.renderBrowserDesktop(userId));
 }

 showPhishingChoice() {
 const yashChar = this.world.characters.get('yash');
 const vipulChar = this.world.characters.get('vipul');

 this.showModal(`
 <div class="card-container" style="max-width: 520px;">
 <div class="card-badge danger">
 SOCIAL ENGINEERING / PHISHING DISGUISE
 </div>
 <div class="card-title danger">
 SELECT PHISHING TARGET OR ROAM DISGUISED
 </div>
 <p style="font-size: 13px; color: var(--muted-text-soft); line-height: 1.5; margin-bottom: 14px;">
 Anshuman puts on the fake Club Bouncer uniform. By impersonating authority and fabricating an "urgent security audit", Anshuman can manipulate members into surrendering their secret phrases!
 </p>

 <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
 <button id="btnPhishTargetYash" class="btn btn-primary" style="justify-content: flex-start; padding: 12px;">
 Target Yash (Regular Member) — Walk over & Phish
 </button>
 <button id="btnPhishTargetVipul" class="btn btn-primary" style="justify-content: flex-start; padding: 12px; background: #92400e; border-color: #d97706;">
 Target Vipul (VIP Member) — Walk over & Phish
 </button>
 <button id="btnPhishRoamTown" class="btn" style="justify-content: flex-start; padding: 12px; background: var(--bg-panel);">
 Put on Disguise & Roam Town Freely
 </button>
 </div>

 <button id="btnClosePhishChoice" class="btn" style="width: 100%; justify-content: center;">
 ✕ Cancel
 </button>
 </div>
 `);

 document.getElementById('btnPhishTargetYash')?.addEventListener('click', () => {
 this.closeModal();
 this.toggleAnshumanDisguise(true);
 this.setActiveCharacter('anshuman');
 if (yashChar) {
 this.world.moveCharacterTo('anshuman', yashChar.x + 35, yashChar.y);
 this.world.centerOnCharacter('anshuman');
 setTimeout(() => {
 this.startPhishingEncounter(yashChar);
 }, 800);
 }
 });

 document.getElementById('btnPhishTargetVipul')?.addEventListener('click', () => {
 this.closeModal();
 this.toggleAnshumanDisguise(true);
 this.setActiveCharacter('anshuman');
 if (vipulChar) {
 this.world.moveCharacterTo('anshuman', vipulChar.x - 35, vipulChar.y);
 this.world.centerOnCharacter('anshuman');
 setTimeout(() => {
 this.startPhishingEncounter(vipulChar);
 }, 800);
 }
 });

 document.getElementById('btnPhishRoamTown')?.addEventListener('click', () => {
 this.closeModal();
 this.toggleAnshumanDisguise(true);
 this.setActiveCharacter('anshuman');
 this.world.moveCharacterTo('anshuman', 360, 680);
 this.world.centerOnCharacter('anshuman');
 });

 document.getElementById('btnClosePhishChoice')?.addEventListener('click', () => {
 this.closeModal();
 });
 }

 // =========================================================================
 // DYNAMIC POKÉMON ENCOUNTERS (BOUNCER, GUARD, BARTENDER)
 // =========================================================================

 /** Deducts a fine from the identity's cash if affordable; otherwise shows an insufficient-funds dialogue. */
 trySettleFine(charId, fine, onPaid) {
 if (!this.spendCash(charId, fine.amount)) {
 this.setBattleDialogue(
 'BOUNCER',
 `Insufficient funds! Your account holds ${this.formatCash(this.getCash(charId))}, but the fine is ₹${fine.amount}. Come back once you can cover it.`,
 [
 { label: 'Step Away ◀', onClick: () => this.closeBattleEncounter() }
 ]
 );
 return;
 }
 this.unpaidFines.delete(charId);
 auditLog.logAction(charId, 'fine_paid', `Settled ₹${fine.amount} fine for: ${fine.reason}`);
 this.world.showBubble(charId, `Ugh, ₹${fine.amount} gone just like that... I hate paying for something I didn't even do!`, 4000);
 onPaid();
 }

 openBouncerEncounter() {
 const controlledCharId = this.world.controlledCharId || 'yash';
 const controlledChar = this.world.characters.get(controlledCharId);

 // If Anshuman is at the Bouncer, present BOTH Yash and Vipul neutrally with equal susceptibility
 if (controlledCharId === 'anshuman') {
 this.startBattleEncounter({
 opponentId: 'bouncer',
 opponentName: 'BOUNCER',
 opponentRole: 'AuthN System ("Who are you?")',
 opponentBadge: 'PORTAL GUARD',
 playerId: 'anshuman',
 playerName: 'ANSHUMAN',
 playerRole: 'Threat Actor',
 playerBadge: 'ATTACKER',
 speaker: 'BOUNCER',
 dialogue: 'HALT! State your claimed identity and secret phrase to access The Secure Club!',
 actions: [
 {
 label: `Claim Yash (Member)${this.hackerKnownPasswords.has('yash') ? ' [STOLEN]' : ''}`,
 primary: this.hackerKnownPasswords.has('yash'),
 onClick: () => this.promptCustomPasswordInput('yash')
 },
 {
 label: `Claim Vipul (VIP)${this.hackerKnownPasswords.has('vipul') ? ' [STOLEN]' : ''}`,
 primary: this.hackerKnownPasswords.has('vipul'),
 onClick: () => this.promptCustomPasswordInput('vipul')
 },
 {
 label: 'Claim Anshuman (Attacker)',
 onClick: () => this.promptCustomPasswordInput('anshuman')
 },
 {
 label: 'Leave Entrance ◀',
 onClick: () => this.closeBattleEncounter()
 }
 ]
 });
 return;
 }

 // Regular member at the door (Yash or Vipul)
 this.startBattleEncounter({
 opponentId: 'bouncer',
 opponentName: 'BOUNCER',
 opponentRole: 'AuthN System ("Who are you?")',
 opponentBadge: 'PORTAL GUARD',
 playerId: controlledCharId,
 playerName: controlledChar?.name?.toUpperCase() || 'MEMBER',
 playerRole: controlledChar?.role || 'Member',
 playerBadge: controlledCharId === 'vipul' ? 'VIP MEMBER' : 'MEMBER',
 speaker: 'BOUNCER',
 dialogue: 'HALT! This is The Secure Club. State who you claim to be and your secret phrase!',
 actions: [
 {
 label: `Say: "I am ${controlledCharId.toUpperCase()}"`,
 primary: true,
 onClick: () => {
 this.promptCustomPasswordInput(controlledCharId);
 }
 },
 {
 label: 'Claim Different Identity',
 onClick: () => {
 this.promptClaimIdentityPicker();
 }
 },
 {
 label: 'Leave Entrance ◀',
 onClick: () => {
 this.closeBattleEncounter();
 }
 }
 ]
 });
 }

 /** Automatically cycles through 3 dictionary attempts before revealing the (deterministic) outcome. */
 executePasswordGuessAttempt(targetIdentity) {
 const commonGuesses = ['123456', 'password', 'qwerty'];
 let attempt = 0;

 const runNextAttempt = () => {
 attempt++;
 if (attempt <= 3) {
 this.setBattleDialogue(
 'ANSHUMAN TERMINAL',
 `Auto-brute-force attempt ${attempt}/3: trying "${commonGuesses[attempt - 1]}"...`,
 []
 );
 setTimeout(runNextAttempt, 650);
 return;
 }
 this.revealPasswordGuessResult(targetIdentity);
 };

 runNextAttempt();
 }

 revealPasswordGuessResult(targetIdentity) {
 const result = attemptPasswordGuess(targetIdentity);
 const account = USER_ACCOUNTS[targetIdentity];

 if (result.success) {
 this.hackerKnownPasswords.set(targetIdentity, result.guessedPassword);
 auditLog.logAction('anshuman', 'compromise', `Brute force cracked weak password for ${targetIdentity.toUpperCase()}`);

 this.setBattleDialogue(
 '● CRACKED!',
 result.message + ` Password added to your database!`,
 [
 {
 label: `Authenticate as ${account.name} ▶`,
 success: true,
 primary: true,
 onClick: () => {
 this.executeAuthenticationAttempt(targetIdentity, result.guessedPassword);
 }
 },
 {
 label: 'Back to Secret Phrase ◀',
 onClick: () => this.promptCustomPasswordInput(targetIdentity)
 }
 ]
 );
 } else {
 auditLog.logAction('anshuman', 'failed_guess', `Failed guessing attempt on ${targetIdentity.toUpperCase()}`);

 this.setBattleDialogue(
 'BOUNCER / AUDIT',
 result.message,
 [
 {
 label: 'Back to Secret Phrase ◀',
 primary: true,
 onClick: () => this.promptCustomPasswordInput(targetIdentity)
 }
 ]
 );
 }
 }

 promptClaimIdentityPicker() {
 this.setBattleDialogue(
 'BOUNCER',
 'Which member account are you claiming to be?',
 [
 {
 label: 'Claim Yash',
 primary: true,
 onClick: () => this.promptCustomPasswordInput('yash')
 },
 {
 label: 'Claim Vipul',
 onClick: () => this.promptCustomPasswordInput('vipul')
 },
 {
 label: 'Claim Anshuman',
 onClick: () => this.promptCustomPasswordInput('anshuman')
 },
 {
 label: 'Back ◀',
 onClick: () => this.openBouncerEncounter()
 }
 ]
 );
 }

 promptCustomPasswordInput(claimedIdentity) {
 const account = USER_ACCOUNTS[claimedIdentity];
 const controlledCharId = this.world.controlledCharId;

 // Check if the current character actually knows the password for claimedIdentity
 // Rule: User knows their own password only. Attacker (Anshuman) only knows if stolen via recording or phishing.
 const knowsPassword = (controlledCharId === claimedIdentity) || 
 (controlledCharId === 'anshuman' && this.hackerKnownPasswords.has(claimedIdentity));
 const knownPhrase = (controlledCharId === claimedIdentity && account)
 ? account.secretPhrase
 : (controlledCharId === 'anshuman' && this.hackerKnownPasswords.has(claimedIdentity)
 ? this.hackerKnownPasswords.get(claimedIdentity)
 : null);

 const actionButtons = [];

 if (knowsPassword && knownPhrase) {
 actionButtons.push({
 label: `Say: "${knownPhrase}"` + (controlledCharId === 'anshuman' ? ' [STOLEN]' : ''),
 primary: true,
 onClick: () => {
 this.executeAuthenticationAttempt(claimedIdentity, knownPhrase);
 }
 });
 actionButtons.push({
 label: 'Say: "WrongPass123"',
 danger: true,
 onClick: () => {
 this.executeAuthenticationAttempt(claimedIdentity, 'WrongPass123');
 }
 });
 actionButtons.push({
 label: 'Say: "???"',
 onClick: () => {
 this.executeAuthenticationAttempt(claimedIdentity, '???');
 }
 });
 } else {
 // User doesn't know other user's password; show one wrong password and question mark!
 actionButtons.push({
 label: 'Say: "WrongPass123"',
 danger: true,
 onClick: () => {
 this.executeAuthenticationAttempt(claimedIdentity, 'WrongPass123');
 }
 });
 actionButtons.push({
 label: 'Say: "???" (Unknown Password)',
 danger: true,
 onClick: () => {
 this.executeAuthenticationAttempt(claimedIdentity, '???');
 }
 });
 }

 // Guess password only available for Anshuman!
  if (controlledCharId === 'anshuman' && claimedIdentity !== 'anshuman') {
    actionButtons.push({
      label: 'Guess Weak Password (Auto 3 Attempts)',
      danger: true,
      onClick: () => {
        this.executePasswordGuessAttempt(claimedIdentity);
      }
    });
  }

 actionButtons.push({
 label: 'Back ◀',
 onClick: () => this.openBouncerEncounter()
 });

 this.setBattleDialogue(
 'BOUNCER',
 `Claiming identity: "${claimedIdentity.toUpperCase()}". What is your secret phrase?`,
 actionButtons
 );
 }

 executeAuthenticationAttempt(claimedIdentity, providedPhrase) {
 const controlledCharId = this.world.controlledCharId;
 const account = USER_ACCOUNTS[claimedIdentity];

 // 1. If account requires MFA
 if (account && account.mfaEnabled) {
 const isOwner = controlledCharId === claimedIdentity;
 const cardId = account.secondFactorId;

 // Validate the password FIRST - don't tell the player "password correct"
 // before actually checking it (the MFA prompt used to show unconditionally,
 // then silently do nothing if "Scan Security ID" was clicked with a wrong
 // password, since authenticateWithMFA's failure had no handler).
 const passwordCheck = authenticate(claimedIdentity, providedPhrase);
 if (!passwordCheck.success && !passwordCheck.mfaRequired) {
 this.setBattleDialogue(
 'BOUNCER',
 `✗ ACCESS DENIED! ${passwordCheck.message}`,
 [
 {
 label: 'Try Again',
 primary: true,
 onClick: () => this.promptCustomPasswordInput(claimedIdentity)
 },
 {
 label: 'Step Away',
 onClick: () => this.closeBattleEncounter()
 }
 ]
 );
 return;
 }

 const hasClonedCard = !isOwner && this.hackerStolenMfaCards.has(claimedIdentity);
 const canScan = isOwner || hasClonedCard;

 this.setBattleDialogue(
 'BOUNCER',
 `Password correct for ${account.name}! But Multi-Factor Authentication (MFA) is enabled on this account. Scan your physical Club Security ID!`,
 [
 {
 label: canScan
 ? (hasClonedCard ? `Scan Cloned Security ID #${cardId} [CLONED]` : `Scan ${account.name}'s Security ID #${cardId}`)
 : "I don't have that card!",
 primary: canScan,
 danger: !canScan,
 onClick: () => {
 if (canScan) {
 const mfaRes = authenticateWithMFA(claimedIdentity, providedPhrase, cardId);
 if (mfaRes.success) {
 this.completeSuccessfulAuth(claimedIdentity, hasClonedCard ? 'Attacker Device (Cloned Password + MFA Card)' : `${account.name}'s Device (MFA Verified)`);
 } else {
 this.setBattleDialogue(
 'BOUNCER',
 `✗ AUTHENTICATION FAILED! ${mfaRes.message}`,
 [
 {
 label: 'Step Back ◀',
 danger: true,
 onClick: () => this.closeBattleEncounter()
 }
 ]
 );
 }
 } else {
 // Attacker missing second factor
 this.setBattleDialogue(
 'BOUNCER',
 `✗ AUTHENTICATION FAILED! You possess the secret password, but NOT ${account.name}'s physical Club Security ID (#${cardId}). Access Denied!`,
 [
 {
 label: 'Step Back ◀',
 danger: true,
 onClick: () => this.closeBattleEncounter()
 },
 {
 label: 'View MFA Lesson Card',
 onClick: () => {
 this.closeBattleEncounter();
 this.showEducationalCard('mfa', () => {});
 }
 }
 ]
 );
 }
 }
 }
 ]
 );
 return;
 }

 // 2. Standard password authentication
 const authRes = authenticate(claimedIdentity, providedPhrase);

 if (authRes.success) {
 this.completeSuccessfulAuth(claimedIdentity, `${controlledCharId.toUpperCase()}'s Device`);
 } else {
 this.setBattleDialogue(
 'BOUNCER',
 `✗ ACCESS DENIED! ${authRes.message}`,
 [
 {
 label: 'Try Again',
 primary: true,
 onClick: () => this.promptCustomPasswordInput(claimedIdentity)
 },
 {
 label: 'Step Away',
 onClick: () => this.closeBattleEncounter()
 }
 ]
 );
 }
 }

 completeSuccessfulAuth(authenticatedIdentity, deviceLabel) {
 const controlledCharId = this.world.controlledCharId;
 sessionManager.createSession(authenticatedIdentity, deviceLabel, controlledCharId);

 const isTakeover = controlledCharId === 'anshuman' && authenticatedIdentity !== 'anshuman';

 // Check eavesdropping condition:
 // If Anshuman is standing near the club door and another member enters
 const anshuman = this.world.characters.get('anshuman');
 const isAnshumanRecordingNearby = Boolean(anshuman && Math.hypot(anshuman.x - 1300, anshuman.y - 690) < 220);
 const eavesdropped = isAnshumanRecordingNearby && controlledCharId !== 'anshuman';

 if (eavesdropped) {
 const secret = USER_ACCOUNTS[authenticatedIdentity]?.secretPhrase || 'Unknown';
 this.hackerKnownPasswords.set(authenticatedIdentity, secret);
 auditLog.logAction('anshuman', 'audio_sniffing', `Captured ${authenticatedIdentity.toUpperCase()}'s secret phrase ("${secret}") via cleartext audio sniffing`, 'Compromised');
 }

 let msg = `✓ IDENTITY VERIFIED! Welcome to The Secure Club, ${authenticatedIdentity.toUpperCase()}!`;
 if (isTakeover) {
 msg = `✓ IDENTITY VERIFIED: ${authenticatedIdentity.toUpperCase()}! (CRITICAL: Physical character is Anshuman, but Club System session is tied to ${authenticatedIdentity.toUpperCase()}!)`;
 }

 const proceedIntoClub = () => {
 // Wait for the close to actually finish (its own ~240ms fade-out) before
 // doing anything else - closeBattleEncounter's fade is driven by setTimeout,
 // so firing straight into another startBattleEncounter() here (e.g. Anshuman's
 // eavesdrop reaction below) would open a new battle overlay that the OLD
 // close's pending timeout then immediately yanks the "active" class back
 // off of, making it flash and vanish before anyone can click anything.
 this.closeBattleEncounter(() => {
 const afterAuthCard = () => {
 if (eavesdropped) {
 this.showAnshumanEavesdropReaction(authenticatedIdentity, () => {
 this.showEavesdropCutscene(authenticatedIdentity, () => {
 this.fadeTeleport(controlledCharId, 1550, 690, () => {
 if (isTakeover) {
 setTimeout(() => {
 this.showIdentityMismatchModal(authenticatedIdentity);
 }, 400);
 }
 });
 });
 });
 } else {
 this.fadeTeleport(controlledCharId, 1550, 690, () => {
 if (isTakeover) {
 setTimeout(() => {
 this.showIdentityMismatchModal(authenticatedIdentity);
 }, 400);
 }
 });
 }
 };

 // The very first time anyone ever gets through the door, pause on the
 // formal Password + Authentication lesson cards - every later login just
 // proceeds straight through, this is a one-time teaching moment.
 if (!this.hasShownAuthenticationCard) {
 this.hasShownAuthenticationCard = true;
 this.showEducationalCard('password', () => {
 this.showEducationalCard('authentication', afterAuthCard);
 });
 } else {
 afterAuthCard();
 }
 });
 };

 // The real account owner logging back in after Anshuman racked up a disturbance
 // fine under their session - the fine only surfaces now that identity is proven,
 // not before, since the club has no reason to suspect a fresh unauthenticated
 // claimant until it knows who it's actually talking to.
 if (controlledCharId === authenticatedIdentity && this.unpaidFines.has(authenticatedIdentity)) {
 const fine = this.unpaidFines.get(authenticatedIdentity);
 this.setBattleDialogue(
 'BOUNCER',
 `✓ Identity verified, ${authenticatedIdentity.toUpperCase()}! Hold on though - our records show an unpaid fine of ₹${fine.amount} logged under your account: "${fine.reason}".`,
 [
 {
 label: `Pay ₹${fine.amount} Fine & Enter ▶`,
 primary: true,
 onClick: () => this.trySettleFine(authenticatedIdentity, fine, proceedIntoClub)
 },
 {
 label: 'Dispute Penalty ("I wasn\'t even here!")',
 danger: true,
 onClick: () => {
 this.setBattleDialogue(
 'BOUNCER',
 `"The terminal logs are tied to your authenticated session, ${authenticatedIdentity.toUpperCase()} - whoever used your password did so as you. That's your liability. Pay up or stay outside!"`,
 [
 {
 label: `Pay ₹${fine.amount} Fine Now`,
 primary: true,
 onClick: () => this.trySettleFine(authenticatedIdentity, fine, proceedIntoClub)
 },
 {
 label: 'Leave Entrance ◀',
 onClick: () => {
 this.world.showBubble(authenticatedIdentity, 'Someone framed me! I have to find who used my account!', 3500);
 this.closeBattleEncounter();
 }
 }
 ]
 );
 }
 },
 {
 label: 'Leave Entrance ◀',
 onClick: () => this.closeBattleEncounter()
 }
 ]
 );
 return;
 }

 this.setBattleDialogue(
 'BOUNCER',
 msg,
 [
 {
 label: 'Enter Club (Fade & Teleport) ▶',
 primary: true,
 onClick: proceedIntoClub
 }
 ]
 );
 }

 /** Anshuman's own triumphant reaction, shown solo in the battle screen the moment his sniffer catches a password - before the info card breaks down what was actually captured. */
 showAnshumanEavesdropReaction(victimIdentity, onComplete) {
 const victimName = USER_ACCOUNTS[victimIdentity]?.name || victimIdentity.toUpperCase();
 this.startBattleEncounter({
 opponentId: 'anshuman',
 opponentName: 'ANSHUMAN',
 opponentRole: 'Eavesdropping Nearby',
 opponentBadge: 'AUDIO SNIFFER ACTIVE',
 playerId: null,
 speaker: 'ANSHUMAN',
 dialogue: `Finally... I've captured ${victimName}'s password!`,
 actions: [
 {
 label: 'Continue ▶',
 primary: true,
 onClick: () => this.closeBattleEncounter(onComplete)
 }
 ]
 });
 }

 showEavesdropCutscene(victimIdentity, onComplete) {
 const victimAccount = USER_ACCOUNTS[victimIdentity];
 const phrase = victimAccount ? victimAccount.secretPhrase : 'Unknown';

 this.showModal(`
 <div class="card-container" style="max-width: 560px;">
 <div class="card-badge danger">● REC AUDIO — CREDENTIAL INTERCEPTED!</div>
 <div class="card-title danger">PASSWORD INTERCEPTED BY EAVESDROPPING</div>
 <p style="font-size: 13px; color: var(--muted-text-soft); line-height: 1.5; margin-bottom: 12px;">
 While standing near the club door, Anshuman's Audio Sniffer picked up <strong>${victimIdentity.toUpperCase()}</strong>'s secret phrase, spoken aloud to the Bouncer:
 </p>
 <div style="background: #020617; border: 2px solid var(--danger-text-strong); border-radius: 6px; padding: 12px; text-align: center; margin-bottom: 14px;">
 <span style="color: var(--muted-text); font-size: 11px;">INTERCEPTED PHRASE:</span><br>
 <strong style="color: var(--success-teal); font-size: 18px; font-family: var(--font-mono);">"${phrase}"</strong>
 </div>
 <p style="font-size: 12px; color: var(--muted-text);">
 Anshuman can now use this intercepted password at the club entrance to pose as ${victimIdentity.toUpperCase()}!
 </p>
 <div class="card-takeaway">
 <strong>SECURITY PRINCIPLE:</strong> Transmitting secrets in cleartext (spoken aloud or sent unencrypted across networks) lets nearby attackers intercept them. Secure systems mandate transport encryption (HTTPS) and MFA!
 </div>
 <button class="btn btn-primary" id="btnContinueCutscene" style="width: 100%; margin-top: 4px;">Fade Out to Club ▶</button>
 </div>
 `);

 document.getElementById('btnContinueCutscene')?.addEventListener('click', () => {
 this.closeModal();
 if (onComplete) onComplete();
 });
 }

 showIdentityMismatchModal(victimIdentity = 'yash') {
 const activeSession = sessionManager.getActiveSession();
 const sessionIdentity = (victimIdentity || (activeSession ? activeSession.identity : 'yash')).toUpperCase();

 this.showModal(`
 <div class="card-container" style="max-width: 560px; border: 2px solid var(--danger-text-strong); box-shadow: 0 0 35px rgba(239, 68, 68, 0.35);">
 <div class="card-badge danger">
 CRITICAL SECURITY LESSON: IDENTITY MISMATCH!
 </div>
 <div class="card-title danger">
 ACCOUNT TAKEOVER & SESSION HIJACKING
 </div>
 
 <div style="display: flex; gap: 12px; margin: 14px 0; background: rgba(15, 23, 42, 0.9); padding: 14px; border-radius: 6px; border: 1px solid #334155;">
 <div style="flex: 1; text-align: center; border-right: 1px solid #334155; padding-right: 8px;">
 <div style="font-size: 11px; color: var(--muted-text); text-transform: uppercase;">Physical Actor</div>
 <div style="font-size: 16px; font-weight: bold; color: var(--danger-text); margin-top: 4px;"> ANSHUMAN</div>
 <div style="font-size: 10px; color: var(--danger-text-strong);">Unauthorized Threat Actor</div>
 </div>
 <div style="flex: 1; text-align: center;">
 <div style="font-size: 11px; color: var(--muted-text); text-transform: uppercase;">Digital Session Identity</div>
 <div style="font-size: 16px; font-weight: bold; color: var(--gold-text); margin-top: 4px;"> ${sessionIdentity}</div>
 <div style="font-size: 10px; color: var(--success-emphasis);">Authenticated Club Member</div>
 </div>
 </div>

 <div class="card-takeaway" style="background: rgba(239, 68, 68, 0.08); border-left-color: var(--danger-text-strong); margin-bottom: 16px;">
 <strong>CORE PRINCIPLE:</strong> Gateway authentication proves <em>possession of credentials</em>, not <em>physical identity</em>! Because Anshuman provided ${sessionIdentity}'s password, the club issued a valid session.
 <ul style="margin: 8px 0 0 16px; padding: 0; font-size: 12px; color: var(--muted-text-soft); line-height: 1.5;">
 <li>Any drinks ordered at the Bar will be billed to <strong>${sessionIdentity}</strong>.</li>
 <li>Any disturbances or security incidents will be recorded under <strong>${sessionIdentity}</strong>'s audit record.</li>
 <li>Multi-Factor Authentication (MFA) or session device binding prevents this exploit.</li>
 </ul>
 </div>

 <button id="btnContinueMismatch" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 12px;">
 Proceed Into Club As ${sessionIdentity} ▶
 </button>
 </div>
 `);

 document.getElementById('btnContinueMismatch')?.addEventListener('click', () => {
 this.closeModal();
 this.world.showBubble('anshuman', `In the club! The system thinks I am ${sessionIdentity}!`, 4500);
 this.setActiveCharacter('anshuman');
 });
 }

 openGuardEncounter() {
 const controlledCharId = this.world.controlledCharId;
 const activeSession = sessionManager.getActiveSession(controlledCharId);
 const authenticatedIdentity = activeSession ? activeSession.identity : null;

 this.startBattleEncounter({
 opponentId: 'guard',
 opponentName: 'SECURITY GUARD',
 opponentRole: 'AuthZ System ("What can you access?")',
 opponentBadge: 'VIP CHECKPOINT',
 playerId: controlledCharId,
 playerName: controlledCharId.toUpperCase(),
 playerRole: activeSession ? `Session: ${activeSession.identity.toUpperCase()}` : 'Unauthenticated',
 playerBadge: 'REQUESTING ACCESS',
 speaker: 'SECURITY GUARD',
 dialogue: 'HALT! I guard the VIP Lounge. Authentication proves who you are; Authorization determines if you can enter!',
 actions: [
 {
 label: 'Request VIP Lounge Access',
 primary: true,
 onClick: () => {
 const authz = authorize(authenticatedIdentity, CLUB_RESOURCES.VIP_LOUNGE);
 if (authz.allowed) {
 this.setBattleDialogue(
 'SECURITY GUARD',
 `✓ ${authz.reason} You may enter the VIP Lounge!`,
 [
 {
 label: 'Enter VIP Lounge (Fade & Teleport) ▶',
 primary: true,
 onClick: () => {
 this.closeBattleEncounter();
 this.fadeTeleport(controlledCharId, 2060, 480, () => {
 this.setDialogue('VIP Lounge', '*', 'Welcome inside the exclusive VIP Lounge!');
 });
 }
 }
 ]
 );
 } else {
 this.setBattleDialogue(
 'SECURITY GUARD',
 `✗ ${authz.reason}`,
 [
 {
 label: 'Step Back ◀',
 danger: true,
 onClick: () => {
 this.closeBattleEncounter();
 // Nudge backward into main lounge
 this.world.moveCharacterTo(controlledCharId, 1800, 620);
 }
 },
 {
 label: 'View Authorization Lesson',
 onClick: () => {
 this.closeBattleEncounter();
 this.world.moveCharacterTo(controlledCharId, 1800, 620);
 this.showEducationalCard('authorization', () => {});
 }
 }
 ]
 );
 }
 }
 },
 // ONLY ANSHUMAN CAN PICK A FIGHT - forcing past a checkpoint is an attack, not a
 // normal member action, matching the same Anshuman-only rule as club brawls.
 ...(controlledCharId === 'anshuman' ? [{
 label: 'Force Your Way Past (Brawl)',
 danger: true,
 onClick: () => {
 if (authenticatedIdentity) {
 this.world.showBubble('anshuman', 'Out of my way!', 2500);
 this.world.showBubble('guard', `SECURITY BREACH! Logging this under ${authenticatedIdentity.toUpperCase()}'s session!`, 3500);
 this.closeBattleEncounter(() => {
 this.showIncidentModal(authenticatedIdentity, activeSession, {
 fineAmount: 3000,
 reason: 'Forced entry into the VIP Lounge without authorization'
 }, () => {
 this.fadeTeleport('anshuman', 2060, 480, () => {
 this.setDialogue('VIP Lounge', '*', `You forced your way in - but ${authenticatedIdentity.toUpperCase()} will be billed for it at the door!`);
 });
 });
 });
 } else {
 this.setBattleDialogue(
 'SECURITY GUARD',
 '✗ Nice try, but you have no active session to hide behind - there is no account for the club to blame this on, so I am physically removing you!',
 [
 {
 label: 'Step Back ◀',
 danger: true,
 onClick: () => {
 this.closeBattleEncounter();
 this.world.moveCharacterTo('anshuman', 1800, 620);
 }
 }
 ]
 );
 }
 }
 }] : []),
 {
 label: 'Leave Guard ◀',
 onClick: () => this.closeBattleEncounter()
 }
 ]
 });
 }

  openBartenderEncounter() {
    const controlledCharId = this.world.controlledCharId;
    const activeSession = sessionManager.getActiveSession(controlledCharId);
    const authenticatedIdentity = activeSession ? activeSession.identity : null;
    const displayName = authenticatedIdentity ? authenticatedIdentity.toUpperCase() : 'Unauthenticated Guest';

    const actions = [
      {
        label: 'Order 3x Cocktails (₹900)',
        primary: true,
        onClick: () => {
          if (!activeSession) {
            this.setBattleDialogue('BARTENDER', 'You have no active authenticated session! Please authenticate at the entrance first.', [
              { label: 'Leave Bar ◀', onClick: () => this.closeBattleEncounter() }
            ]);
            return;
          }
          if (!this.spendCash(authenticatedIdentity, 900)) {
            this.setBattleDialogue('BARTENDER', `Insufficient funds! ${displayName}'s account only holds ${this.formatCash(this.getCash(authenticatedIdentity))}.`, [
              { label: 'Back ◀', onClick: () => this.openBartenderEncounter() }
            ]);
            return;
          }
          auditLog.logAction(authenticatedIdentity, 'purchase', '3x Club Cocktails', '₹900');
          this.closeBattleEncounter();
          this.showReceiptModal(authenticatedIdentity, '3x Club Cocktails', '₹900', () => {});
        }
      },
      {
        label: 'Browse Security Shop',
        onClick: () => {
          this.closeBattleEncounter();
          this.openSecurityShopModal();
        }
      }
    ];

    // ONLY ANSHUMAN CAN CAUSE DISTURBANCE / BRAWL
    if (controlledCharId === 'anshuman') {
      actions.push({
        label: 'Cause Disturbance / Bar Brawl (₹2,000 Fine)',
        danger: true,
        onClick: () => {
          if (!activeSession) {
            this.setBattleDialogue('BARTENDER', 'You have no active authenticated session! Please authenticate at the entrance first to pin damages on a victim!', [
              { label: 'Leave Bar ◀', onClick: () => this.closeBattleEncounter() }
            ]);
            return;
          }
          this.closeBattleEncounter();
          this.executeClubBrawl('bartender', {
            name: 'Bartender',
            fine: 2000,
            reason: 'Smashing bar glasses and disorderly disturbance at Refreshment Bar'
          }, authenticatedIdentity, activeSession);
        }
      });
    }

    actions.push({
      label: 'Leave Bar ◀',
      onClick: () => this.closeBattleEncounter()
    });

    this.startBattleEncounter({
      opponentId: 'bartender',
      opponentName: 'BARTENDER',
      opponentRole: 'Club Staff',
      opponentBadge: 'REFRESHMENT BAR',
      playerId: controlledCharId,
      playerName: controlledCharId.toUpperCase(),
      playerRole: `Session: ${displayName}`,
      playerBadge: 'PATRON',
      speaker: 'BARTENDER',
      dialogue: `Welcome to the bar! Purchases are automatically charged to your active session: [${displayName}]. What can I get you?`,
      actions: actions
    });
  }

  openClubPatronEncounter(patronId) {
    const controlledCharId = this.world.controlledCharId;
    const activeSession = sessionManager.getActiveSession(controlledCharId);
    const authenticatedIdentity = activeSession ? activeSession.identity : null;
    const displayName = authenticatedIdentity ? authenticatedIdentity.toUpperCase() : 'Unauthenticated Guest';

    const patronDataMap = {
      alex: {
        name: 'ALEX',
        role: 'Partygoer',
        badge: 'DANCE FLOOR',
        fine: 1500,
        normalSpeech: "Hey! The music tonight is insane! Having a great time at The Secure Club!",
        anshumanSpeech: "Yo, what's your problem? You're glaring at me with that creepy grin!",
        fightAction: 'Shove Alex & Start Dancefloor Brawl',
        reason: 'Assault and starting a chaotic brawl on the dance floor with Alex'
      },
      dex: {
        name: 'DJ DEX',
        role: 'Club DJ',
        badge: 'DJ BOOTH',
        fine: 2500,
        normalSpeech: "What's up! DJ Dex on the decks! Dropping high-energy beats for The Secure Club all night!",
        anshumanSpeech: "Hey buddy, don't touch the soundboard! Back away from the turntables!",
        fightAction: 'Smash Soundboard & Attack DJ Dex',
        reason: 'Damaging expensive audio mixing consoles and fighting DJ Dex'
      },
      sophia: {
        name: 'SOPHIA',
        role: 'VIP Socialite',
        badge: 'LOUNGE',
        fine: 2000,
        normalSpeech: "Good evening. The ambiance here in The Secure Club is simply exquisite.",
        anshumanSpeech: "Excuse me? You're invading my personal space. Security is watching!",
        fightAction: "Throw Drink & Fight Sophia's Entourage",
        reason: 'Verbal harassment and throwing drinks at VIP Guest Sophia'
      }
    };

    const patron = patronDataMap[patronId] || {
      name: 'PATRON',
      role: 'Club Guest',
      badge: 'GUEST',
      fine: 1500,
      normalSpeech: 'Enjoying the evening at the club!',
      anshumanSpeech: 'Get away from me!',
      fightAction: 'Start Fight & Throw Punches',
      reason: 'Brawling and disorderly conduct with club guests'
    };

    if (controlledCharId === 'anshuman') {
      this.startBattleEncounter({
        opponentId: patronId,
        opponentName: patron.name,
        opponentRole: patron.role,
        opponentBadge: patron.badge,
        playerId: 'anshuman',
        playerName: 'ANSHUMAN',
        playerRole: `Session: ${displayName}`,
        playerBadge: 'INTRUDER',
        speaker: patron.name,
        dialogue: patron.anshumanSpeech,
        actions: [
          {
            label: `Fight: ${patron.fightAction}`,
            danger: true,
            primary: true,
            onClick: () => {
              if (!activeSession) {
                this.setBattleDialogue(patron.name.toUpperCase(), 'You have no active authenticated session! Please authenticate at the entrance first to pin damages on a victim!', [
                  { label: 'Walk Away ◀', onClick: () => this.closeBattleEncounter() }
                ]);
                return;
              }
              this.closeBattleEncounter();
              this.executeClubBrawl(patronId, patron, authenticatedIdentity, activeSession);
            }
          },
          {
            label: 'Walk Away ◀',
            onClick: () => this.closeBattleEncounter()
          }
        ]
      });
      return;
    }

    // Friendly interaction for Yash & Vipul
    this.startBattleEncounter({
      opponentId: patronId,
      opponentName: patron.name,
      opponentRole: patron.role,
      opponentBadge: patron.badge,
      playerId: controlledCharId,
      playerName: controlledCharId.toUpperCase(),
      playerRole: `Session: ${displayName}`,
      playerBadge: 'CLUB MEMBER',
      speaker: patron.name,
      dialogue: patron.normalSpeech,
      actions: [
        {
          label: 'Chat Friendly',
          primary: true,
          onClick: () => {
            this.world.showBubble(controlledCharId, `Great to meet you, ${patron.name}! Enjoy the night!`, 3000);
            this.closeBattleEncounter();
          }
        },
        {
          label: 'Step Away ◀',
          onClick: () => this.closeBattleEncounter()
        }
      ]
    });
  }

  executeClubBrawl(patronId, patron, authenticatedIdentity, activeSession) {
    const controlledCharId = this.world.controlledCharId;
    this.world.showBubble(controlledCharId, `*POW!* Take that! *causes total chaos with ${patron.name}*`, 3500);
    this.world.showBubble(patronId, `SECURITY! HELP! This person is out of control!`, 3500);

    this.showIncidentModal(authenticatedIdentity, activeSession, {
      fineAmount: patron.fine,
      reason: patron.reason
    });
  }


 setDialogue(speaker, avatar, text, actions = []) {
 if (this.speakerName) this.speakerName.innerText = speaker;
 if (this.speakerAvatar) this.speakerAvatar.innerText = avatar;
 if (this.dialogueText) this.dialogueText.innerText = text;

 if (this.dialogueActions) {
 this.dialogueActions.innerHTML = '';
 actions.forEach(act => {
 const btn = document.createElement('button');
 btn.className = `btn ${act.primary ? 'btn-primary' : ''}`;
 btn.innerText = act.label;
 btn.addEventListener('click', act.onClick);
 this.dialogueActions.appendChild(btn);
 });
 }
 }

 showModal(htmlContent) {
 if (this.modalContainer && this.modalOverlay) {
 this.modalContainer.innerHTML = htmlContent;
 this.modalOverlay.classList.add('active');
 }
 }

 closeModal() {
 if (this.modalOverlay) {
 this.modalOverlay.classList.remove('active');
 }
 }

 // =========================================================================
 // POKÉMON STYLE 2-SIDED BATTLE ENCOUNTER CONTROLLER
 // =========================================================================

 /**
 * Launch a 2-sided Pokémon encounter view
 * @param {Object} config
 * @param {string} config.opponentId - 'bouncer' | 'guard' | 'anshuman' | 'vipul' | 'bartender'
 * @param {string} config.opponentName - e.g. 'BOUNCER [AuthN]'
 * @param {string} config.opponentRole - e.g. 'Gateway Check'
 * @param {string} config.opponentBadge - e.g. 'SECURITY 100%'
 * @param {string} config.playerId - 'yash' | 'vipul' | 'anshuman'
 * @param {string} config.playerName - e.g. 'YASH'
 * @param {string} config.playerRole - e.g. 'Regular Member'
 * @param {string} config.playerBadge - e.g. 'CREDENTIALS READY'
 * @param {string} config.speaker - e.g. 'BOUNCER'
 * @param {string} config.dialogue - Speech text
 * @param {Array} config.actions - Command buttons [{ label, primary, danger, success, onClick }]
 */
 startBattleEncounter(config) {
 if (!this.battleOverlay || !this.battleCanvas) return;

 const setupScene = () => {
 // Update Status Plates
 if (this.battleOpponentName) this.battleOpponentName.innerText = config.opponentName || 'OPPONENT';
 if (this.battleOpponentRole) this.battleOpponentRole.innerText = config.opponentRole || 'System';
 if (this.battleOpponentBadge) this.battleOpponentBadge.innerText = config.opponentBadge || 'ONLINE';
 if (this.battlePlayerName) this.battlePlayerName.innerText = config.playerName || 'PLAYER';
 if (this.battlePlayerRole) this.battlePlayerRole.innerText = config.playerRole || 'Member';
 if (this.battlePlayerBadge) this.battlePlayerBadge.innerText = config.playerBadge || 'READY';

 // Solo encounters (config.playerId === null, e.g. a victim reflecting alone
 // on a breach) have no second sprite, so hide the player's status plate too.
 const playerPlate = document.querySelector('.player-plate');
 if (playerPlate) playerPlate.style.display = config.playerId ? '' : 'none';

 // Update Dialogue & Commands
 this.setBattleDialogue(config.speaker || config.opponentName, config.dialogue || '', config.actions || []);

 // Show Overlay cleanly without flash
 this.battleOverlay.classList.add('active');

 // Resize Battle Canvas & Start Battle Render Loop
 this.battleCanvas.width = this.battleCanvas.parentElement.clientWidth || 800;
 this.battleCanvas.height = this.battleCanvas.parentElement.clientHeight || 450;

 const bCtx = this.battleCanvas.getContext('2d');
 bCtx.imageSmoothingEnabled = false;

 if (this.battleAnimFrame) cancelAnimationFrame(this.battleAnimFrame);

 let startTime = performance.now();
 const renderBattle = (time) => {
 const elapsed = (time - startTime) / 1000;
 this.drawBattleScene(bCtx, config.opponentId, config.playerId, elapsed);
 this.battleAnimFrame = requestAnimationFrame(renderBattle);
 };
 this.battleAnimFrame = requestAnimationFrame(renderBattle);
 };

 // Simple smooth fade transition into encounter (matches club entry/exit fade)
 if (this.screenFadeOverlay && !this.battleOverlay.classList.contains('active')) {
 this.screenFadeOverlay.classList.add('active');
 setTimeout(() => {
 setupScene();
 setTimeout(() => {
 this.screenFadeOverlay.classList.remove('active');
 }, 60);
 }, 240);
 } else {
 setupScene();
 }
 }

 setBattleDialogue(speaker, text, actions = []) {
 if (this.battleSpeakerName) this.battleSpeakerName.innerText = speaker;

 // Clear any active typewriter timer
 if (this.typewriterTimer) {
 clearInterval(this.typewriterTimer);
 this.typewriterTimer = null;
 }

 const dialogueEl = this.battleDialogueText;
 const actionsEl = this.battleActions;

 const renderActions = () => {
 if (!actionsEl) return;
 actionsEl.innerHTML = '';
 actions.forEach(act => {
 const btn = document.createElement('button');
 let cls = 'btn-battle-cmd';
 if (act.primary) cls += ' primary';
 if (act.danger) cls += ' danger';
 if (act.success) cls += ' success';
 btn.className = cls;
 const badgeMatch = act.label.match(/^(.*?)\s*(\[[^\]]+\])$/);
 if (badgeMatch) {
 const mainSpan = document.createElement('span');
 mainSpan.innerText = badgeMatch[1];
 const badgeSpan = document.createElement('span');
 badgeSpan.className = 'btn-battle-cmd-badge';
 badgeSpan.innerText = badgeMatch[2];
 btn.appendChild(mainSpan);
 btn.appendChild(badgeSpan);
 } else {
 btn.innerText = act.label;
 }
 btn.addEventListener('click', act.onClick);
 actionsEl.appendChild(btn);
 });
 };

 const finishTypewriter = () => {
 if (this.typewriterTimer) {
 clearInterval(this.typewriterTimer);
 this.typewriterTimer = null;
 }
 if (dialogueEl) {
 dialogueEl.innerHTML = text + '<span class="battle-dialogue-prompt">▼</span>';
 }
 renderActions();
 };

 // Attach click-to-skip on the battle dialogue box
 const dialogueBox = dialogueEl ? dialogueEl.closest('.battle-dialogue-box') : null;
 if (dialogueBox) {
 dialogueBox.onclick = () => {
 if (this.typewriterTimer) {
 finishTypewriter();
 }
 };
 }

 if (!dialogueEl) {
 renderActions();
 return;
 }

 // Begin Pokémon-style Typewriter Effect letter by letter
 dialogueEl.innerHTML = '';
 if (actionsEl) actionsEl.innerHTML = '';

 // Reveal several characters per tick (rather than shrinking the interval below
 // the browser's ~4ms timer floor) so the "super fast" speed holds steady even
 // while the battle canvas is animating on the same thread.
 let charIdx = 0;
 const speedMs = 16;
 const charsPerTick = 2;

 this.typewriterTimer = setInterval(() => {
 charIdx += charsPerTick;
 if (charIdx < text.length) {
 dialogueEl.innerText = text.slice(0, charIdx);
 } else {
 clearInterval(this.typewriterTimer);
 this.typewriterTimer = null;
 dialogueEl.innerHTML = text + '<span class="battle-dialogue-prompt">▼</span>';
 renderActions();
 }
 }, speedMs);
 }

 drawBattleScene(ctx, opponentId, playerId, time) {
 const w = this.battleCanvas.width;
 const h = this.battleCanvas.height;
 const renderer = this.world.pixelRenderer;

 // 1. Textured Battle Arena Background - reuses the same brick wall / floor
 // tile patterns the club interior is built from, so the arena matches the
 // rest of the game's aesthetic instead of a flat color fill.
 const wallPattern = ctx.createPattern(renderer.brickWall, 'repeat');
 ctx.fillStyle = wallPattern;
 ctx.fillRect(0, 0, w, h * 0.6);

 const floorPattern = ctx.createPattern(opponentId === 'guard' ? renderer.vipFloor : renderer.floorTile, 'repeat');
 ctx.fillStyle = floorPattern;
 ctx.fillRect(0, h * 0.6, w, h * 0.4);

 // Dim overlays so the tiled textures recede behind the sprites/platforms
 ctx.fillStyle = 'rgba(10, 14, 24, 0.45)';
 ctx.fillRect(0, 0, w, h * 0.6);
 ctx.fillStyle = 'rgba(10, 14, 24, 0.3)';
 ctx.fillRect(0, h * 0.6, w, h * 0.4);

 // Wall separator line
 ctx.fillStyle = '#485870';
 ctx.fillRect(0, h * 0.6 - 4, w, 4);

 // Solo encounters (no playerId, e.g. a victim reflecting alone on a breach)
 // have only one sprite, so it stands front-and-center rather than off in
 // the usual opponent corner with an empty player corner opposite it.
 const solo = !playerId;

 // 2. Opponent Battle Platform (Top Right Ellipse normally, dead-center if solo)
 const oppBaseX = Math.round(w * (solo ? 0.5 : 0.72));
 const oppBaseY = Math.round(h * (solo ? 0.58 : 0.46));
 ctx.fillStyle = '#3c4b64';
 ctx.beginPath();
 ctx.ellipse(oppBaseX, oppBaseY, solo ? 200 : 150, solo ? 54 : 42, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.strokeStyle = '#586b88';
 ctx.lineWidth = solo ? 4 : 3;
 ctx.stroke();

 // 3. Player Battle Platform (Bottom Left Ellipse) - skipped entirely if solo
 const plyBaseX = Math.round(w * 0.28);
 const plyBaseY = Math.round(h * 0.82);
 if (!solo) {
 ctx.fillStyle = '#3c4b64';
 ctx.beginPath();
 ctx.ellipse(plyBaseX, plyBaseY, 190, 52, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.strokeStyle = '#586b88';
 ctx.lineWidth = 4;
 ctx.stroke();
 }

 // Bobbing animation
 const oppBob = Math.sin(time * 3) * 3;
 const plyBob = Math.sin(time * 2.5 + 1) * 2;

 // 4. Opponent Front Sprite - every front-view sprite's feet land 21 scale-units
 // below its anchor point, so offsetting by that amount puts the feet on the
 // platform ellipse instead of floating above it.
 const oppScale = Math.max(3, Math.round(h / (solo ? 100 : 120)));
 this.world.pixelRenderer.renderBattleFrontSprite(
 ctx,
 opponentId,
 oppBaseX,
 oppBaseY - 21 * oppScale + oppBob,
 oppScale
 );

 // 5. Player Back Sprite (Bottom Left - Classic Pokémon Back Perspective) -
 // skipped entirely if solo. Back-view sprites' feet land ~22 scale-units
 // below their anchor point.
 if (!solo) {
 const plyScale = Math.max(4, Math.round(h / 95));
 this.world.pixelRenderer.renderBattleBackSprite(
 ctx,
 playerId,
 plyBaseX,
 plyBaseY - 22 * plyScale + plyBob,
 plyScale
 );
 }
 }

 closeBattleEncounter(onClosed) {
 if (this.battleAnimFrame) {
 cancelAnimationFrame(this.battleAnimFrame);
 this.battleAnimFrame = null;
 }
 if (this.battleOverlay && this.battleOverlay.classList.contains('active')) {
 if (this.screenFadeOverlay) {
 this.screenFadeOverlay.classList.add('active');
 setTimeout(() => {
 this.battleOverlay.classList.remove('active');
 setTimeout(() => {
 this.screenFadeOverlay.classList.remove('active');
 if (onClosed) onClosed();
 }, 60);
 }, 180);
 } else {
 this.battleOverlay.classList.remove('active');
 if (onClosed) onClosed();
 }
 } else if (onClosed) {
 onClosed();
 }
 }

 resetFullGame() {
 // Restored to the default state: Yash - weak password, reused everywhere.
 // Vipul - strong password, MFA, but also reuses it everywhere like Yash.
 USER_ACCOUNTS.yash.mfaEnabled = false;
 USER_ACCOUNTS.vipul.mfaEnabled = true;
 USER_ACCOUNTS.yash.passwordStrength = 'weak';
 USER_ACCOUNTS.yash.secretPhrase = USER_ACCOUNTS.yash.weakPassword;
 USER_ACCOUNTS.vipul.passwordStrength = 'strong';
 USER_ACCOUNTS.vipul.secretPhrase = USER_ACCOUNTS.vipul.strongPassword;
 USER_ACCOUNTS.yash.isVIP = false;
 USER_ACCOUNTS.vipul.isVIP = true;
 USER_ACCOUNTS.yash.bank.reusesClubPassword = true;
 USER_ACCOUNTS.yash.bank.compromised = false;
 USER_ACCOUNTS.yash.ecommerce.reusesClubPassword = true;
 USER_ACCOUNTS.yash.ecommerce.compromised = false;
 USER_ACCOUNTS.vipul.bank.reusesClubPassword = true;
 USER_ACCOUNTS.vipul.bank.compromised = false;
 USER_ACCOUNTS.vipul.ecommerce.reusesClubPassword = true;
 USER_ACCOUNTS.vipul.ecommerce.compromised = false;
 sessionManager.reset();
 auditLog.reset();
 this.hackerKnownPasswords.clear();
 this.hackerStolenMfaCards.clear();
 this.breachInvestigated.clear();
 this.unpaidFines.clear();
 this.hasShownAuthenticationCard = false;
 this.hasShownSessionsCard = false;
 this.userCash = new Map([['yash', 20000], ['vipul', 70000], ['anshuman', 0]]);
 this.anshumanLoot = 0;
 const anshuman = this.world.characters.get('anshuman');
 if (anshuman) {
 anshuman.isDisguisedAsBouncer = false;
 anshuman.label = 'ANSHUMAN';
 }
 this.world.initCharacters();
 this.closeModal();
 this.closeBattleEncounter();
 this.setActiveCharacter('yash');
 this.world.centerOnCharacter('yash');
 this.showSandboxWelcomeBanner();
 }

 showReceiptModal(authenticatedIdentity, item = '3x Club Cocktails', price = '₹900', onComplete) {
 const controlledCharId = this.world.controlledCharId;
 const isImpersonating = controlledCharId !== authenticatedIdentity;
 const activeSession = sessionManager.getActiveSession();
 const deviceLabel = activeSession ? activeSession.device : 'Active Client';

 this.showModal(`
 <div class="card-container" style="max-width: 460px;">
 <div class="paper-receipt">
 <div style="text-align: center; font-size: 24px; margin-bottom: 4px;"> </div>
 <h3>THE SECURE CLUB — REFRESHMENT BAR</h3>
 
 <div class="receipt-row">
 <span>BILLED ACCOUNT:</span>
 <strong style="color: #0f172a;">${authenticatedIdentity.toUpperCase()}</strong>
 </div>
 <div class="receipt-row">
 <span>SESSION DEVICE:</span>
 <span style="font-size: 11px; color: var(--muted-text-dimmer); font-family: var(--font-mono);">${deviceLabel}</span>
 </div>
 <div class="receipt-row">
 <span>PHYSICAL PATRON:</span>
 <span style="color: var(--muted-text-dimmer);">${controlledCharId.toUpperCase()}</span>
 </div>
 <div class="receipt-row" style="border-top: 1px dashed var(--muted-text); padding-top: 8px; margin-top: 8px;">
 <span>${item}</span>
 <strong>${price}</strong>
 </div>
 <div class="receipt-row" style="border-top: 1px solid #0f172a; padding-top: 6px; font-weight: bold;">
 <span>TOTAL CHARGED:</span>
 <span>${price}</span>
 </div>
 <div style="font-size: 10px; color: var(--muted-text-dim); text-align: center; margin-top: 12px;">
 Transaction automatically debited via active session token.
 </div>
 </div>

 <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #334155; border-radius: 8px; padding: 12px; margin-top: 12px; font-size: 12px; line-height: 1.5; color: var(--muted-text-soft);">
 ${isImpersonating ? `
 <strong style="color: var(--danger-text);"> FINANCIAL MISATTRIBUTION:</strong><br>
 <strong>${controlledCharId.toUpperCase()}</strong> ordered and consumed the drinks, but because the authenticated session token belongs to <strong>${authenticatedIdentity.toUpperCase()}</strong>, the bill was charged to <strong>${authenticatedIdentity.toUpperCase()}</strong>'s account!
 ` : `
 <strong style="color: var(--success-text);">✓ PURCHASE RECORDED:</strong><br>
 Transaction successfully charged to your authenticated member session.
 `}
 </div>

 <button id="btnCloseReceipt" class="btn btn-primary" style="width: 100%; margin-top: 14px; justify-content: center;">
 Got It
 </button>
 </div>
 `);

 document.getElementById('btnCloseReceipt')?.addEventListener('click', () => {
 this.closeModal();
 const afterReceipt = () => {
 this.world.showBubble(controlledCharId, `Enjoyed ${item}! Charged to ${authenticatedIdentity.toUpperCase()}.`, 4000);
 if (onComplete) onComplete();
 };
 // First-ever purchase pauses on the formal Sessions lesson card - it's
 // the natural moment the "invisible club card" concept just played out.
 if (!this.hasShownSessionsCard) {
 this.hasShownSessionsCard = true;
 this.showEducationalCard('sessions', afterReceipt);
 } else {
 afterReceipt();
 }
 });
 }

  showIncidentModal(authenticatedIdentity, activeSession, incidentDetails = {}, onComplete) {
    const controlledCharId = this.world.controlledCharId;
    const isImpersonating = controlledCharId !== authenticatedIdentity;
    const fineAmount = incidentDetails.fineAmount || 2000;
    const reason = incidentDetails.reason || 'Disorderly conduct & disturbance inside club';

    // Prior unpaid fines stack rather than being overwritten - repeated incidents
    // before the victim pays up must not let the newest (possibly smaller) fine
    // silently erase what was already owed.
    const priorFine = this.unpaidFines.get(authenticatedIdentity);
    const totalOwed = (priorFine ? priorFine.amount : 0) + fineAmount;
    const combinedReason = priorFine ? `${priorFine.reason}; ${reason}` : reason;

    this.unpaidFines.set(authenticatedIdentity, {
      amount: totalOwed,
      reason: combinedReason,
      victim: authenticatedIdentity,
      timestamp: Date.now()
    });

    this.world.showBubble(controlledCharId, 'HEY! Out of my way! *causes total disturbance*', 3500);
    auditLog.logAction(authenticatedIdentity, 'incident', `${reason} (Fine: ₹${fineAmount})`, `₹${fineAmount}`, true);

    setTimeout(() => {
      this.showModal(`
        <div class="card-container" style="max-width: 520px;">
          <div style="background: #450a0a; border: 2px solid var(--danger-text-strong); border-radius: 8px; padding: 18px; color: #fff;">
            <h3 style="color: var(--danger-text); border-bottom: 1px solid var(--danger-bg-deep); padding-bottom: 6px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
              <span>THE SECURE CLUB — INCIDENT REPORT</span>
              <span style="background: var(--danger-text-strong); color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 4px;">FINED ₹${fineAmount}</span>
            </h3>
            <div class="receipt-row">
              <span>PENALIZED ACCOUNT:</span>
              <strong style="color: var(--danger-text); font-size: 16px;">${authenticatedIdentity.toUpperCase()}</strong>
            </div>
            <div class="receipt-row">
              <span>ACTIVE SESSION TOKEN:</span>
              <span style="color: var(--success-teal); font-family: var(--font-mono);">${activeSession && activeSession.token ? activeSession.token.slice(0, 12) + '...' : 'Signed Token'}</span>
            </div>
            <div class="receipt-row">
              <span>PHYSICAL ACTOR:</span>
              <span style="color: var(--muted-text-soft); font-weight: bold;">${controlledCharId.toUpperCase()}</span>
            </div>
            <div class="receipt-row">
              <span>INCIDENT DESCRIPTION:</span>
              <span style="color: var(--danger-text-soft);">${reason}</span>
            </div>
            <div class="receipt-row">
              <span>THIS INCIDENT'S FINE:</span>
              <span style="color: var(--danger-text); font-weight: bold; font-size: 15px;">₹${fineAmount}</span>
            </div>
            ${priorFine ? `
            <div class="receipt-row">
              <span>PRIOR UNPAID FINE(S):</span>
              <span style="color: var(--gold-text); font-weight: bold;">₹${priorFine.amount}</span>
            </div>
            <div class="receipt-row">
              <span>TOTAL OUTSTANDING:</span>
              <span style="color: var(--danger-text); font-weight: bold; font-size: 16px;">₹${totalOwed}</span>
            </div>
            ` : ''}
            <div class="receipt-row">
              <span>SECURITY ACTION:</span>
              <span style="color: var(--gold-text);">Account flagged at entrance! Next entry blocked until all fines are paid.</span>
            </div>
          </div>

          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #334155; border-radius: 8px; padding: 12px; margin-top: 14px; font-size: 12px; line-height: 1.5; color: var(--muted-text-soft);">
            ${isImpersonating ? `
              <strong style="color: var(--danger-text);">CRITICAL SECURITY MISATTRIBUTION:</strong><br>
              Physical intruder <strong>${controlledCharId.toUpperCase()}</strong> caused the fight/disturbance, but because the authenticated session belongs to <strong>${authenticatedIdentity.toUpperCase()}</strong>, the club system penalizes <strong>${authenticatedIdentity.toUpperCase()}</strong>!<br><br>
              <em>When ${authenticatedIdentity.toUpperCase()} tries to enter the club, the Bouncer will halt them and demand the ₹${totalOwed} total outstanding fine!</em>
            ` : `
              <strong>INCIDENT RECORDED:</strong><br>
              Security has logged a formal disturbance on <strong>${authenticatedIdentity.toUpperCase()}</strong>'s account record in the Security PC Audit Log.
            `}
          </div>

          <button class="btn btn-primary" id="btnIncOk" style="width: 100%; margin-top: 14px;">
            Continue ▶
          </button>
        </div>
      `);

      document.getElementById('btnIncOk')?.addEventListener('click', () => {
        this.closeModal();
        if (onComplete) onComplete();
      });
    }, 500);
  }


 startQuiz() {
 this.quizScore = 0;
 this.currentQuizIndex = 0;
 this.showQuizQuestion();
 }

 showQuizQuestion() {
 if (this.currentQuizIndex >= QUIZ_QUESTIONS.length) {
 this.showFinalSummary();
 return;
 }

 const q = QUIZ_QUESTIONS[this.currentQuizIndex];

 this.showModal(`
 <div class="card-container">
 <div class="card-badge">CYBERSECURITY AWARENESS QUIZ</div>
 <div style="font-size: 12px; color: var(--muted-text); margin-bottom: 4px;">Question ${this.currentQuizIndex + 1} of ${QUIZ_QUESTIONS.length}</div>
 <div class="card-title" style="font-size: 20px;">${q.question}</div>
 
 <div style="display: flex; flex-direction: column; gap: 10px; margin: 20px 0;">
 ${q.options.map((opt, i) => `
 <button class="btn quiz-opt-btn" data-index="${i}" style="text-align: left; padding: 12px 16px; justify-content: flex-start;">
 ${String.fromCharCode(65 + i)}. ${opt}
 </button>
 `).join('')}
 </div>

 <div id="quizFeedbackBox" class="card-box" style="display: none;"></div>
 <button class="btn btn-primary" id="btnNextQuestion" style="display: none; width: 100%;">
 ${this.currentQuizIndex === QUIZ_QUESTIONS.length - 1 ? 'See Final Workshop Summary ▶' : 'Next Question ▶'}
 </button>
 </div>
 `);

 const optButtons = document.querySelectorAll('.quiz-opt-btn');
 optButtons.forEach(btn => {
 btn.addEventListener('click', (e) => {
 const selected = parseInt(e.currentTarget.getAttribute('data-index'), 10);
 const fb = document.getElementById('quizFeedbackBox');
 if (fb) fb.style.display = 'block';

 optButtons.forEach(b => b.disabled = true);

 if (selected === q.correct) {
 this.quizScore++;
 if (fb) {
 fb.innerHTML = `
 <h4 style="color: var(--success-strong);">✓ CORRECT!</h4>
 <p>${q.explanation}</p>
 `;
 }
 } else {
 if (fb) {
 fb.innerHTML = `
 <h4 style="color: var(--danger-text-strong);">✗ NOT QUITE</h4>
 <p>${q.explanation}</p>
 `;
 }
 }
 document.getElementById('btnNextQuestion').style.display = 'block';
 });
 });

 document.getElementById('btnNextQuestion')?.addEventListener('click', () => {
 this.currentQuizIndex++;
 this.showQuizQuestion();
 });
 }

 showFinalSummary() {
 this.showModal(`
 <div class="card-container" style="max-width: 680px;">
 <div class="card-badge" style="color: var(--success-strong); background: rgba(16, 185, 129, 0.1);">WORKSHOP COMPLETE</div>
 <div class="card-title">CONGRATULATIONS! SCORE: ${this.quizScore} / ${QUIZ_QUESTIONS.length}</div>
 
 <div class="split-screen" style="margin-top: 16px;">
 <div class="split-box authn">
 <h5>AUTHENTICATION</h5>
 <div style="font-size: 18px; font-weight: bold; color: #fff;">"WHO ARE YOU?"</div>
 <p style="font-size: 12px; color: var(--muted-text-soft); margin-top: 6px;">Entering the club. The Bouncer verifies your password (and your MFA card too, if you've enabled one).</p>
 </div>
 <div class="split-box authz">
 <h5>AUTHORIZATION</h5>
 <div style="font-size: 18px; font-weight: bold; color: #fff;">"WHAT CAN YOU ACCESS?"</div>
 <p style="font-size: 12px; color: var(--muted-text-soft); margin-top: 6px;">Entering the VIP Lounge. Guard checks permissions.</p>
 </div>
 </div>

 <div class="card-box">
 <h4 style="color: #e2e8f0;">THE 3 GOLDEN CYBERSECURITY PILLARS</h4>
 <p style="font-size: 13px; color: var(--muted-text); line-height: 1.6;">
 1. <strong>Password:</strong> A secret you know. Never share it or reuse it.<br>
 2. <strong>MFA:</strong> Combines distinct categories (Know + Have + Are). Reject unexpected prompts.<br>
 3. <strong>Sessions:</strong> Once you're verified, the system remembers you by session, not by face - which is exactly why a stolen session gets billed to the victim, not the attacker.
 </p>
 </div>

 <button class="btn btn-primary" id="btnRestartFromEnd" style="width: 100%;">
 Play Again / Replay from Beginning
 </button>
 </div>
 `);

 document.getElementById('btnRestartFromEnd')?.addEventListener('click', () => {
 this.resetFullGame();
 });
 }

 showEducationalCard(key, onContinue) {
 const card = EDUCATIONAL_CARDS[key];
 if (!card) {
 // Defensive fallback: a stale cached copy of this file (seen in some
 // browsers, e.g. Firefox holding an old module in its disk cache) can
 // call this with a key that no longer/doesn't yet exist. Close whatever
 // modal is open instead of crashing the whole page on a null dereference.
 console.warn(`showEducationalCard: unknown card key "${key}" - closing modal instead of crashing.`);
 this.closeModal();
 onContinue();
 return;
 }
 this.showModal(`
 <div class="card-container">
 <div class="card-badge">${card.subtitle}</div>
 <div class="card-title">${card.title}</div>
 <p style="font-size: 16px; color: #f1f5f9; line-height: 1.5; margin-bottom: 16px;">
 ${card.definition}
 </p>

 <div class="card-box">
 <h4>IN THE SECURE CLUB</h4>
 <p>${card.inGame}</p>
 </div>

 <div class="card-takeaway">
 KEY TAKEAWAY: ${card.takeaway}
 </div>

 <button class="btn btn-primary" id="btnCardContinue" style="width: 100%;">
 Continue ▶
 </button>
 </div>
 `);

 document.getElementById('btnCardContinue')?.addEventListener('click', () => {
 this.closeModal();
 onContinue();
 });
 }
}

// Bootstrap Application
function initApp() {
 new SecureClubApp();
}

if (document.readyState === 'loading') {
 window.addEventListener('DOMContentLoaded', initApp);
} else {
 initApp();
}
