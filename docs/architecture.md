# System Architecture & Design Specification

## Overview
**The Secure Club** is a 2D top-down cybersecurity simulation game designed to teach foundational security concepts through interactive scenarios.

## Core Subsystems
1. **Game Engine (`src/game/`)**:
   - `gameWorld.js`: Manages entity coordinates, movement vectors, collision bounding boxes, and interaction zones.
   - `pixelRenderer.js`: Direct HTML5 2D Canvas renderer responsible for dynamic floor tiles, club lighting, disco lights, character sprites, and smooth viewport camera tracking.

2. **Security Subsystems (`src/security/`)**:
   - `authentication.js`: Credential validation against account registries, password entropy calculations, and Multi-Factor Authentication (MFA) challenges.
   - `authorization.js`: Role-based privilege checks (e.g. VIP access validation).
   - `sessions.js`: In-memory session tracking, token issuance, and revocation.
   - `auditLog.js`: Event ledger verifying forensic attribution of actions to active sessions.

3. **Story & Educational Content (`src/content/`)**:
   - `contentData.js`: Centralized repository of educational flashcards, theoretical definitions, and the 10-question cyber awareness quiz.
