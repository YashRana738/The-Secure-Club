/**
 * The Secure Club - Content Subsystem
 *
 * Contains educational cards, security concepts, and quiz questions.
 * Strictly decoupled from rendering components.
 */

export const EDUCATIONAL_CARDS = {
  password: {
    title: 'WHAT IS A PASSWORD?',
    subtitle: 'SOMETHING YOU KNOW',
    definition: 'A password is a secret piece of information used to help prove your identity.',
    inGame: 'Yash gives his secret phrase to the Bouncer at the door to prove he\'s really Yash.',
    takeaway: 'THE KEY WORD IS SECRET: If someone knows your password, they can claim to be you.',
    icon: '[SECRET]'
  },
  authentication: {
    title: 'AUTHENTICATION',
    subtitle: 'WHO ARE YOU?',
    definition: 'Authentication is the process of verifying that someone really is who they claim to be.',
    inGame: 'The Bouncer checks your name and secret phrase at the front door.',
    takeaway: 'ENTERING THE CLUB = AUTHENTICATION. The bouncer checks credentials, not VIP permissions.',
    icon: '[AUTHN]'
  },
  authorization: {
    title: 'AUTHORIZATION',
    subtitle: 'WHAT CAN YOU ACCESS?',
    definition: 'Authorization determines what an already-authenticated identity is permitted to access or do.',
    inGame: 'The Security Guard checks if your account has VIP Lounge privileges.',
    takeaway: 'AUTHENTICATION ≠ AUTHORIZATION! Being inside the club does not grant access to everything.',
    icon: '[AUTHZ]'
  },
  sessions: {
    title: 'THE INVISIBLE CLUB CARD',
    subtitle: 'HOW SESSIONS WORK',
    definition: 'Once authenticated, a system creates a session so you do not have to re-enter your password for every single action.',
    inGame: 'The bartender charges drinks to your invisible club card automatically.',
    takeaway: 'Sessions link your actions to your authenticated identity behind the scenes - which is exactly why a stolen session gets billed to the victim, not the attacker.',
    icon: '[SESSION]'
  },
  mfa: {
    title: 'MULTI-FACTOR AUTHENTICATION (MFA)',
    subtitle: 'MORE THAN ONE FACTOR',
    definition: 'MFA requires credentials from two or more DISTINCT categories before granting access.',
    inGame: 'Password (Something you know) + Club Security ID (Something you have).',
    takeaway: 'TWO PASSWORDS DO NOT EQUAL MFA! MFA stops attackers who only have your password.',
    icon: '[MFA]'
  },
  mfaNotMagic: {
    title: 'MFA IS NOT MAGIC',
    subtitle: 'HUMAN VIGILANCE REQUIRED',
    definition: 'MFA significantly enhances security, but it does not stop users who blindly approve unexpected prompts or fall for tricks.',
    inGame: 'Rejecting unexpected phone/push prompts keeps the account safe.',
    takeaway: 'Never approve an MFA prompt you did not personally trigger!',
    icon: '[HUMAN]'
  },
  phishing: {
    title: 'PHISHING & SOCIAL ENGINEERING',
    subtitle: 'DECEPTIVE IMPERSONATION',
    definition: 'Attackers disguise themselves as trusted figures (e.g. club staff, bouncers, IT support) to trick victims into voluntarily surrendering their secret keys and personal data.',
    inGame: 'Anshuman puts on a fake Bouncer uniform and requests credentials under the guise of an "urgent membership update".',
    takeaway: 'NEVER share your secret keys or passwords, even if someone claims to be authority or staff. Real staff never ask for your secret password!',
    icon: '[PHISH]'
  },
  serverBreach: {
    title: 'SERVER-SIDE DATA BREACH',
    subtitle: 'NOT YOUR MISTAKE',
    definition: 'Sometimes an attacker never touches the victim at all - they compromise the SERVER storing everyone\'s credentials and read them directly from its database.',
    inGame: 'Anshuman hacks the unlocked club Security PC and dumps a member\'s username and password straight from its records.',
    takeaway: 'A strong password, careful habits, and MFA all protect you from attacks ON you - but they cannot stop a breach of the server holding your data. That responsibility belongs to whoever runs the server.',
    icon: '[BREACH]'
  },
};

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Yash enters the club after the bouncer verifies his secret phrase. What cybersecurity concept was performed at the door?',
    options: [
      'Authorization',
      'Authentication',
      'Data Encryption',
      'Firewall Filtering'
    ],
    correct: 1,
    explanation: 'Authentication answers "Who are you?" by verifying claimed credentials at the boundary.'
  },
  {
    id: 2,
    question: 'Yash tries to walk into the VIP Lounge, but the security guard checks permissions and stops him. What is being checked?',
    options: [
      'Authentication',
      'Authorization',
      'Session Expiration',
      'Password Strength'
    ],
    correct: 1,
    explanation: 'Authorization answers "What are you allowed to access or do?" based on permissions.'
  },
  {
    id: 3,
    question: 'Which factor category does a password or PIN belong to?',
    options: [
      'Something you know',
      'Something you have',
      'Something you are',
      'Somewhere you are'
    ],
    correct: 0,
    explanation: 'Passwords and PINs are secrets stored in your memory, making them "Something you know".'
  },
  {
    id: 4,
    question: 'The fictional "Club Security ID" card or a hardware security key belongs to which MFA factor category?',
    options: [
      'Something you know',
      'Something you have',
      'Something you are',
      'Something you do'
    ],
    correct: 1,
    explanation: 'A physical card, smartphone, or hardware token is a physical possession ("Something you have").'
  },
  {
    id: 5,
    question: 'Biometric identifiers such as a fingerprint scan or facial recognition belong to which category?',
    options: [
      'Something you know',
      'Something you have',
      'Something you are',
      'Something you remember'
    ],
    correct: 2,
    explanation: 'Biological and physical characteristics inherent to a person are "Something you are".'
  },
  {
    id: 6,
    question: 'Anshuman knows Yash’s password. If MFA is enabled requiring a physical Club Security ID, can Anshuman authenticate?',
    options: [
      'Yes, because the password was 100% correct.',
      'No, because the required second factor (Something you have) is missing.',
      'Yes, if Anshuman enters the password three times quickly.',
      'No, but only if Yash is already inside the club.'
    ],
    correct: 1,
    explanation: 'MFA requires all required factors. Having only the password causes authentication to fail.'
  },
  {
    id: 7,
    question: 'Does requiring a password followed by another secret security question count as genuine MFA?',
    options: [
      'Yes, because there are two questions.',
      'No, because both are in the same factor category ("Something you know").',
      'Yes, if the second question is very long.',
      'Only if the website says it is MFA.'
    ],
    correct: 1,
    explanation: 'MFA requires multiple DISTINCT categories (e.g. Know + Have). Two things you know is not true MFA.'
  },
  {
    id: 8,
    question: 'Anshuman authenticates using Yash’s stolen password. Who does the club system believe made the subsequent bar purchases?',
    options: [
      'Anshuman, because the camera saw him.',
      'Yash, because the session is bound to Yash’s authenticated identity.',
      'The Bouncer.',
      'Nobody, the drinks were free.'
    ],
    correct: 1,
    explanation: 'The system binds session activity to the authenticated identity (Yash), not the physical person at the keyboard.'
  },
  {
    id: 9,
    question: 'Does successfully authenticating as a regular member automatically grant access to the VIP Lounge?',
    options: [
      'Yes, authentication gives complete access.',
      'No, authorization permissions still govern what specific resources you can access.',
      'Only if the password was very strong.',
      'Yes, if you enter during off-peak hours.'
    ],
    correct: 1,
    explanation: 'Authentication ≠ Authorization. Proving your identity does not alter your account privileges.'
  },
  {
    id: 10,
    question: 'You receive an unexpected push notification on your phone asking you to approve a login request you did not start. What should you do?',
    options: [
      'Approve it to make the buzzing stop.',
      'Deny and Report it, and change your password because someone likely knows it.',
      'Ignore all computer security forever.',
      'Forward the notification to a friend.'
    ],
    correct: 1,
    explanation: 'An unexpected prompt means someone has your password! Deny immediately and update your credentials.'
  }
];
