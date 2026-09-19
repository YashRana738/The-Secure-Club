"""
Security Subsystem Test Suite for The Secure Club
Verifies:
1. Authentication:
   - Yash + correct password -> success
   - Yash + wrong password -> failure
   - Vipul + correct password -> success
   - Anshuman without credentials -> failure
   - Anshuman with Yash password -> authenticated identity is Yash
2. Authorization:
   - Yash -> VIP -> denied
   - Vipul -> VIP -> allowed
   - Anshuman (authenticated as Yash) -> VIP -> denied (takeover does not grant VIP!)
3. MFA:
   - Yash with password + correct 2nd factor -> success
   - Yash with password + missing 2nd factor -> failure
   - Anshuman with Yash password + missing 2nd factor -> failure
4. Sessions:
   - Authentication creates session
   - Revocation disconnects unauthorized sessions
5. Audit:
   - Anshuman buying drinks while authenticated as Yash -> logged under Yash
   - Incident report logged under Yash
"""

import unittest
import time

USER_ACCOUNTS = {
    'yash': {
        'id': 'yash',
        'name': 'Yash',
        'secretPhrase': 'Blue Mango',
        'isVIP': False,
        'mfaEnabled': False,
        'secondFactorId': 'SC-10482'
    },
    'vipul': {
        'id': 'vipul',
        'name': 'Vipul',
        'secretPhrase': 'Golden Tiger',
        'isVIP': True,
        'mfaEnabled': False,
        'secondFactorId': 'SC-99201'
    }
}

def authenticate(claimed_identity, provided_phrase, accounts=USER_ACCOUNTS):
    norm = claimed_identity.strip().lower()
    acc = accounts.get(norm)
    if not acc:
        return {'success': False, 'identity': None, 'mfaRequired': False, 'msg': 'Unknown member'}
    if acc['secretPhrase'].lower() != provided_phrase.strip().lower():
        return {'success': False, 'identity': None, 'mfaRequired': False, 'msg': 'Incorrect phrase'}
    if acc['mfaEnabled']:
        return {'success': False, 'identity': None, 'mfaRequired': True, 'msg': 'MFA required'}
    return {'success': True, 'identity': acc['id'], 'mfaRequired': False, 'msg': 'Verified'}

def authenticate_with_mfa(claimed_identity, provided_phrase, second_factor_id=None, accounts=USER_ACCOUNTS):
    norm = claimed_identity.strip().lower()
    acc = accounts.get(norm)
    if not acc:
        return {'success': False, 'identity': None}
    if acc['secretPhrase'].lower() != provided_phrase.strip().lower():
        return {'success': False, 'identity': None}
    if not acc['mfaEnabled']:
        return {'success': True, 'identity': acc['id']}
    if not second_factor_id or second_factor_id != acc['secondFactorId']:
        return {'success': False, 'identity': None, 'msg': '2nd factor missing'}
    return {'success': True, 'identity': acc['id'], 'msg': 'MFA verified'}

def authorize(authenticated_identity, resource, accounts=USER_ACCOUNTS):
    if not authenticated_identity:
        return {'allowed': False, 'reason': 'Unauthenticated'}
    acc = accounts.get(authenticated_identity.lower())
    if not acc:
        return {'allowed': False, 'reason': 'Unknown identity'}
    if resource == 'vip_lounge':
        if acc['isVIP']:
            return {'allowed': True, 'reason': 'VIP authorized'}
        else:
            return {'allowed': False, 'reason': 'Regular member not authorized for VIP'}
    return {'allowed': True, 'reason': 'Access allowed'}

class SessionManager:
    def __init__(self):
        self.sessions = {}

    def create_session(self, identity, device):
        sid = f"sess_{len(self.sessions) + 1}"
        self.sessions[sid] = {
            'id': sid,
            'identity': identity,
            'device': device,
            'active': True
        }
        return self.sessions[sid]

    def revoke_other_sessions(self, current_session_id):
        curr = self.sessions.get(current_session_id)
        if not curr:
            return 0
        revoked = 0
        for sid, s in self.sessions.items():
            if s['identity'] == curr['identity'] and sid != current_session_id and s['active']:
                s['active'] = False
                revoked += 1
        return revoked

class AuditLog:
    def __init__(self):
        self.logs = []

    def record(self, authenticated_identity, action, details):
        self.logs.append({
            'identity': authenticated_identity,
            'action': action,
            'details': details
        })

class TestTheSecureClubSecurity(unittest.TestCase):
    def test_authentication_basic(self):
        # Yash + correct password -> success
        res = authenticate("Yash", "Blue Mango")
        self.assertTrue(res['success'])
        self.assertEqual(res['identity'], 'yash')

        # Yash + wrong password -> failure
        res_fail = authenticate("Yash", "WrongPassword")
        self.assertFalse(res_fail['success'])
        self.assertIsNone(res_fail['identity'])

        # Vipul + correct password -> success
        res_vipul = authenticate("Vipul", "Golden Tiger")
        self.assertTrue(res_vipul['success'])
        self.assertEqual(res_vipul['identity'], 'vipul')

        # Anshuman without credentials -> failure
        res_anshuman_no_creds = authenticate("Anshuman", "")
        self.assertFalse(res_anshuman_no_creds['success'])

    def test_account_takeover_identity_mapping(self):
        # Physical character: Anshuman
        # Claimed identity: Yash, provided phrase: "Blue Mango"
        res = authenticate("Yash", "Blue Mango")
        self.assertTrue(res['success'])
        # The system MUST believe the identity is Yash, NEVER Anshuman
        self.assertEqual(res['identity'], 'yash')

    def test_authorization_distinction(self):
        # Yash -> VIP -> denied
        auth_yash = authorize('yash', 'vip_lounge')
        self.assertFalse(auth_yash['allowed'])

        # Vipul -> VIP -> allowed
        auth_vipul = authorize('vipul', 'vip_lounge')
        self.assertTrue(auth_vipul['allowed'])

        # Anshuman authenticated as Yash attempting VIP access -> DENIED!
        # Demonstrates that account takeover does NOT escalate authorization privileges
        takeover_identity = 'yash'
        auth_anshuman_as_yash = authorize(takeover_identity, 'vip_lounge')
        self.assertFalse(auth_anshuman_as_yash['allowed'], "Takeover of Yash must not grant VIP access")

    def test_mfa_flow(self):
        accounts = {
            'yash': dict(USER_ACCOUNTS['yash'], mfaEnabled=True)
        }
        # Password alone when MFA enabled -> fails
        res_pwd_only = authenticate("yash", "Blue Mango", accounts)
        self.assertFalse(res_pwd_only['success'])
        self.assertTrue(res_pwd_only['mfaRequired'])

        # Password + correct 2nd factor -> success
        res_mfa_success = authenticate_with_mfa("yash", "Blue Mango", "SC-10482", accounts)
        self.assertTrue(res_mfa_success['success'])
        self.assertEqual(res_mfa_success['identity'], 'yash')

        # Password + missing 2nd factor (Anshuman with password only) -> FAILS
        res_anshuman_blocked = authenticate_with_mfa("yash", "Blue Mango", None, accounts)
        self.assertFalse(res_anshuman_blocked['success'])

        # Password + wrong 2nd factor -> FAILS
        res_wrong_card = authenticate_with_mfa("yash", "Blue Mango", "FAKE-CARD", accounts)
        self.assertFalse(res_wrong_card['success'])

        # Vipul MFA test:
        accounts_vipul = {
            'vipul': dict(USER_ACCOUNTS['vipul'], mfaEnabled=True)
        }
        res_vipul_pwd_only = authenticate("vipul", "Golden Tiger", accounts_vipul)
        self.assertFalse(res_vipul_pwd_only['success'])
        self.assertTrue(res_vipul_pwd_only['mfaRequired'])

        # Vipul with Gold Card -> success
        res_vipul_mfa_ok = authenticate_with_mfa("vipul", "Golden Tiger", "SC-99201", accounts_vipul)
        self.assertTrue(res_vipul_mfa_ok['success'])
        self.assertEqual(res_vipul_mfa_ok['identity'], 'vipul')

        # Anshuman with Vipul password but no Gold Card -> blocked
        res_anshuman_blocked_vipul = authenticate_with_mfa("vipul", "Golden Tiger", None, accounts_vipul)
        self.assertFalse(res_anshuman_blocked_vipul['success'])

    def test_session_and_revocation(self):
        sm = SessionManager()
        s_yash = sm.create_session('yash', "Yash's Laptop")
        s_anshuman = sm.create_session('yash', "Unknown Device (Attacker)")

        self.assertTrue(s_yash['active'])
        self.assertTrue(s_anshuman['active'])

        # Yash clicks "Sign out all other devices"
        revoked = sm.revoke_other_sessions(s_yash['id'])
        self.assertEqual(revoked, 1)
        self.assertTrue(s_yash['active'])
        self.assertFalse(s_anshuman['active'], "Attacker session must be revoked")

    def test_audit_log_attribution(self):
        # Attacker physical person is Anshuman, but session is authenticated as Yash
        audit = AuditLog()
        active_identity = 'yash'
        audit.record(active_identity, 'purchase_drinks', '3x Club Drink ₹900')
        audit.record(active_identity, 'club_disturbance', 'Cartoonish argument')

        # All events must be attributed to Yash
        for item in audit.logs:
            self.assertEqual(item['identity'], 'yash')
            self.assertNotEqual(item['identity'], 'anshuman')

    def test_password_knowledge_rules(self):
        # Yash knows Yash's password
        self.assertEqual(USER_ACCOUNTS['yash']['secretPhrase'], 'Blue Mango')
        
        # When Yash claims Vipul, Yash does NOT know Vipul's password
        hacker_known = {}
        def get_known_password(controlled_char, claimed):
            if controlled_char == claimed:
                return USER_ACCOUNTS[claimed]['secretPhrase']
            if controlled_char == 'anshuman' and claimed in hacker_known:
                return hacker_known[claimed]
            return None

        self.assertIsNone(get_known_password('yash', 'vipul'))
        self.assertIsNone(get_known_password('vipul', 'yash'))
        self.assertIsNone(get_known_password('anshuman', 'yash'))

    def test_eavesdropping_and_phishing_mechanics(self):
        hacker_known = {}
        
        # Anshuman records near door: Yash enters
        anshuman_near_door = True
        if anshuman_near_door:
            hacker_known['yash'] = USER_ACCOUNTS['yash']['secretPhrase']
        
        self.assertEqual(hacker_known.get('yash'), 'Blue Mango')

        # Anshuman disguises as Bouncer and phishes Vipul
        anshuman_disguised = True
        self.assertTrue(anshuman_disguised)
        hacker_known['vipul'] = USER_ACCOUNTS['vipul']['secretPhrase']
        self.assertEqual(hacker_known.get('vipul'), 'Golden Tiger')

    def test_bartender_session_character_binding(self):
        class MultiDeviceSessionManager:
            def __init__(self):
                self.sessions = {}
            def create(self, identity, device, char_id):
                sid = f"sess_{char_id}_{len(self.sessions)}"
                sess = {'id': sid, 'identity': identity, 'char_id': char_id, 'active': True}
                self.sessions[sid] = sess
                return sess
            def get_active(self, char_id):
                for s in reversed(list(self.sessions.values())):
                    if s['active'] and s['char_id'] == char_id:
                        return s
                return None

        sm = MultiDeviceSessionManager()
        # Yash authenticates
        sm.create('yash', "Yash Device", 'yash')
        # Vipul authenticates
        sm.create('vipul', "Vipul Device", 'vipul')
        # Anshuman authenticates as Vipul (stolen)
        sm.create('vipul', "Anshuman Device", 'anshuman')

        # Bartender checks session of active controlled character
        self.assertEqual(sm.get_active('yash')['identity'], 'yash')
        self.assertEqual(sm.get_active('vipul')['identity'], 'vipul')
        self.assertEqual(sm.get_active('anshuman')['identity'], 'vipul')

if __name__ == '__main__':
    unittest.main()
