/**
 * The Secure Club - 2D Canvas Game World & Engine (8-Bit Nintendo DS Retro Aesthetic)
 *
 * Implements 2.5D top-down perspective depth, rich 8-bit textured floors,
 * neon nightclub lighting, and distinct expressive characters.
 */

import { PixelRenderer } from './pixelRenderer.js';

export class GameWorld {
  constructor(canvas) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to get 2D context');
    this.ctx = context;

    this.pixelRenderer = new PixelRenderer();
    this.characters = new Map();
    this.animFrameId = null;
    this.lastTime = performance.now();
    this.totalTime = 0;

    // Virtual world dimensions (Expanded RPG World: Streets, Yash's House, Anshuman's House, Secure Club)
    this.worldWidth = 2600;
    this.worldHeight = 1400;

    // Camera Pan Offset for Hold-and-Drag
    this.camX = 0;
    this.camY = 0;
    this.zoom = 1.7; // Closer, more Pokémon-style camera distance
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.camStartX = 0;
    this.camStartY = 0;
    this.totalDragDist = 0;
    this.lastCharClickId = null; // Double-click-to-switch tracking
    this.lastCharClickTime = 0;
    this.pendingApproachTimer = null; // Delayed Anshuman approach, armed by a first click

    // Active Controlled Character (Default: Yash)
    this.controlledCharId = 'yash';

    // Keyboard Movement State (WASD & Arrow Keys)
    this.keysDown = new Set();

    // Click Callback for building interactions & NPCs
    this.onBuildingClick = null;
    this.onNpcClick = null;
    this.onCharacterSwitch = null; // Click character to switch
    this.onPhishTargetClick = null; // Disguised Anshuman phishing callback
    this.onAnshumanPickpocketClick = null; // Undisguised Anshuman clicking a victim - steal their MFA card
    this.onSecurityPcClick = null; // Security PC click callback
    this.onZoneEnter = null; // Area Trigger Callback
    this.activeTriggerZone = null;
    this.zoneTriggerCooldown = 0;

    // Define Collision Boundaries (Walls & Obstacles: player cannot phase through)
    this.initColliders();

    // Responsive Canvas Resizing
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    // Setup Hold-and-Drag & Click-to-Move Listeners
    this.initInteractionControls();
    this.initKeyboardControls();

    this.initCharacters();
    this.startLoop();
  }

  initColliders() {
    this.colliders = [
      // --- THE SECURE CLUB WALLS ---
      // Outer Dividing Brick Wall North of Entrance Doorway
      { x: 1390, y: 300, w: 28, h: 340 },
      // Outer Dividing Brick Wall South of Entrance Doorway
      { x: 1390, y: 740, w: 28, h: 440 },
      // Security Entrance Doorway Barrier (blocks unauthenticated entry)
      { id: 'club_door_barrier', x: 1390, y: 640, w: 28, h: 100 },
      // Club North Wall
      { x: 1390, y: 300, w: 1000, h: 24 },
      // Club South Wall
      { x: 1390, y: 1180, w: 1000, h: 24 },
      // Club East Wall
      { x: 2380, y: 300, w: 24, h: 900 },
      // VIP Lounge West Wall
      { x: 1900, y: 300, w: 20, h: 360 },
      // VIP Lounge South Wall - Left of velvet rope doorway
      { x: 1900, y: 660, w: 45, h: 24 },
      // VIP Lounge South Wall - Right of velvet rope doorway (x: 1945-2040 is doorway)
      { x: 2040, y: 660, w: 340, h: 24 },

      // Bar Counter Obstacle
      { x: 1520, y: 390, w: 320, h: 36 },

      // Security PC Desk Station Obstacle (Physical desk in bottom right of club)
      { x: 1640, y: 1000, w: 220, h: 140 },

      // --- YASH'S HOUSE (Top Left) ---
      { x: 180, y: 200, w: 360, h: 24 }, // North
      { x: 180, y: 200, w: 24, h: 260 }, // West
      { x: 516, y: 200, w: 24, h: 260 }, // East
      { x: 180, y: 440, w: 360, h: 20 }, // South Sealed Door

      // --- VIPUL'S VILLA (Top Center: x: 600, y: 200, w: 360, h: 260) ---
      { x: 600, y: 200, w: 360, h: 24 }, // North
      { x: 600, y: 200, w: 24, h: 260 }, // West
      { x: 936, y: 200, w: 24, h: 260 }, // East
      { x: 600, y: 440, w: 360, h: 20 }, // South Sealed Door

      // --- ANSHUMAN'S HOUSE (Bottom Left) --- Sealed on all sides, same as Yash's/Vipul's
      // houses: it's a click-to-open modal (Access Hacking Terminal), not a walk-in room,
      // so there is no door gap - walking never takes you inside or through it.
      { x: 180, y: 760, w: 360, h: 24 }, // North Wall Solid
      { x: 180, y: 760, w: 24, h: 260 }, // West Wall
      { x: 516, y: 760, w: 24, h: 260 }, // East Wall
      { x: 180, y: 1000, w: 360, h: 20 } // South Wall Solid
    ];
  }

  handleResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.clampCamera();
  }

  initInteractionControls() {
    const el = this.canvas;

    el.addEventListener('pointerdown', (e) => {
      if (this.onCheckInteractionBlocked && this.onCheckInteractionBlocked()) {
        return;
      }
      if (e.target.closest && (e.target.closest('.character-hud') || e.target.closest('.hud-action-bar') || e.target.closest('.floating-menu-btn') || e.target.closest('.esc-menu-overlay') || e.target.closest('.battle-overlay') || e.target.closest('.modal-overlay') || e.target.closest('.dialogue-container') || e.target.closest('.dialogue-box'))) {
        return;
      }
      this.isDragging = true;
      this.totalDragDist = 0;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.camStartX = this.camX;
      this.camStartY = this.camY;
      el.setPointerCapture(e.pointerId);
    });

    el.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.dragStartX;
      const dy = e.clientY - this.dragStartY;
      this.totalDragDist += Math.hypot(e.movementX || dx, e.movementY || dy);
      this.camX = this.camStartX + dx;
      this.camY = this.camStartY + dy;
      this.clampCamera();
    });

    const endDrag = (e) => {
      if (this.isDragging) {
        this.isDragging = false;
        try { el.releasePointerCapture(e.pointerId); } catch (err) {}

        // If mouse barely moved (< 8px), treat as CLICK-TO-MOVE or BUILDING CLICK!
        if (this.totalDragDist < 8) {
          const worldClickX = (e.clientX - this.camX) / this.zoom;
          const worldClickY = (e.clientY - this.camY) / this.zoom;
          this.handleWorldClick(worldClickX, worldClickY);
        }
      }
    };

    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    el.addEventListener('wheel', (e) => {
      if (this.onCheckInteractionBlocked && this.onCheckInteractionBlocked()) return;
      e.preventDefault();
      const ZOOM_STEP = 0.1;
      const MIN_ZOOM = 1.0;
      const MAX_ZOOM = 3.0;
      const direction = e.deltaY > 0 ? -1 : 1;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, this.zoom + direction * ZOOM_STEP));
      if (newZoom === this.zoom) return;

      // Keep the world point under the cursor fixed in place while zooming
      const worldX = (e.clientX - this.camX) / this.zoom;
      const worldY = (e.clientY - this.camY) / this.zoom;
      this.zoom = newZoom;
      this.camX = e.clientX - worldX * this.zoom;
      this.camY = e.clientY - worldY * this.zoom;
      this.clampCamera();
    }, { passive: false });
  }

  initKeyboardControls() {
    window.addEventListener('keydown', (e) => {
      // Don't capture when typing in text inputs or textareas
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        this.keysDown.add(key);
        // Cancel mouse target path when using direct keyboard controls
        const controlled = this.characters.get(this.controlledCharId);
        if (controlled) {
          controlled.targetX = undefined;
          controlled.targetY = undefined;
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      this.keysDown.delete(key);
    });

    window.addEventListener('blur', () => {
      this.keysDown.clear();
    });
  }

  handleWorldClick(wx, wy) {
    if (this.onCheckInteractionBlocked && this.onCheckInteractionBlocked()) {
      return;
    }

    // 1. Check Character Clicks first (switch playable character or interact with NPC)
    // Pick the CLOSEST character within range, not just the first one iterated -
    // the player's own avatar and an NPC (e.g. the bouncer) often stand within
    // a few pixels of each other during an active zone trigger, so a click aimed
    // squarely at the NPC must not be swallowed by the player's own hit radius.
    let closestChar = null;
    let closestDist = 42;
    for (const char of this.characters.values()) {
      const dist = Math.hypot(wx - char.x, wy - char.y);
      if (dist < closestDist) {
        closestDist = dist;
        closestChar = char;
      }
    }

    if (closestChar) {
      const char = closestChar;
      // If clicking a playable character other than active, switch to them immediately!
      if (['yash', 'vipul', 'anshuman'].includes(char.id)) {
        if (char.id !== this.controlledCharId) {
          const controlled = this.characters.get(this.controlledCharId);
          const now = performance.now();
          const isDoubleClick = this.lastCharClickId === char.id && (now - this.lastCharClickTime) < 400;

          if (isDoubleClick) {
            // Second click within the window: switch immediately and drop
            // whatever delayed approach the first click armed below.
            this.cancelPendingApproach();
            this.lastCharClickId = null;
            if (this.onCharacterSwitch) {
              this.onCharacterSwitch(char.id);
            }
            return;
          }

          // First click: don't act yet - wait out the double-click window in
          // case a second click follows (which switches instead, above). If
          // it doesn't, Anshuman's phishing/pickpocket approach fires once the
          // delay elapses uninterrupted.
          this.lastCharClickId = char.id;
          this.lastCharClickTime = now;
          this.cancelPendingApproach();
          this.pendingApproachTimer = setTimeout(() => {
            this.pendingApproachTimer = null;
            if (this.lastCharClickId !== char.id) return; // superseded by a later click
            this.lastCharClickId = null;
            if (this.controlledCharId === 'anshuman' && controlled && (char.id === 'yash' || char.id === 'vipul')) {
              if (controlled.isDisguisedAsBouncer) {
                if (this.onPhishTargetClick) this.onPhishTargetClick(char);
              } else if (this.onAnshumanPickpocketClick) {
                this.onAnshumanPickpocketClick(char);
              }
            }
          }, 400);
          return;
        }
        return; // Prevent clicking active playable character from doing anything or falling through to NPC encounters
      }
      // If clicking an NPC (bouncer, guard, bartender)
      if (this.onNpcClick) {
        this.onNpcClick(char);
        return;
      }
    }

    // 2. Check Security PC Terminal click
    if (wx >= 1630 && wx <= 1870 && wy >= 990 && wy <= 1150) {
      if (this.onSecurityPcClick) {
        this.onSecurityPcClick();
        return;
      }
    }

    // 3. Check Building Doorway / Building clicks
    // Yash's House (Door is near x: 350, y: 440)
    if (wx >= 180 && wx <= 540 && wy >= 200 && wy <= 460) {
      if (this.onBuildingClick) {
        this.onBuildingClick('yash_house');
        return;
      }
    }

    // Vipul's Villa (Door is near x: 780, y: 440)
    if (wx >= 600 && wx <= 960 && wy >= 200 && wy <= 460) {
      if (this.onBuildingClick) {
        this.onBuildingClick('vipul_house');
        return;
      }
    }

    // Anshuman's House (Door is near x: 350, y: 760)
    if (wx >= 180 && wx <= 540 && wy >= 760 && wy <= 1020) {
      if (this.onBuildingClick) {
        this.onBuildingClick('anshuman_house');
        return;
      }
    }

    // The Secure Club Building Entrance Door / Bouncer Area
    if (Math.hypot(wx - 1360, wy - 690) < 60) {
      const bouncer = this.characters.get('bouncer');
      if (this.onNpcClick && bouncer) {
        this.onNpcClick(bouncer);
        return;
      }
    }

    // 4. Move active controlled character towards clicked point using smart pathfinding
    const controlledChar = this.characters.get(this.controlledCharId);
    if (controlledChar) {
      let targetX = wx;
      let targetY = wy;
      // If clicking outdoor grass, clamp to nearest paved avenue
      if (wx < 1390 && !this.isWalkableTerrain(wx, wy, 8)) {
        if (wx >= 250 && wx <= 470) {
          targetY = Math.max(420, Math.min(1000, wy));
        } else if (wx >= 680 && wx <= 880 && wy < 480) {
          targetY = Math.max(420, Math.min(470, wy));
        } else {
          targetY = Math.max(470, Math.min(710, wy));
        }
      }
      const path = this.generatePath(controlledChar.x, controlledChar.y, targetX, targetY);
      this.moveCharacterAlongPath(this.controlledCharId, path);
    }
  }

  generatePath(startX, startY, targetX, targetY) {
    const isStartInside = startX >= 1380;
    const isTargetInside = targetX >= 1380;
    const waypoints = [];

    // Case 1: Crossing from Outside to Inside
    if (!isStartInside && isTargetInside) {
      if (startY < 460) waypoints.push({ x: 350, y: 590 });
      else if (startY > 720) waypoints.push({ x: 350, y: 590 });

      // Path ends at Club Entrance Security Mat / Bouncer (cannot walk past into club without auth)
      waypoints.push({ x: 1300, y: 690 });
      return waypoints;
    }

    // Case 2: Crossing from Inside to Outside
    if (isStartInside && !isTargetInside) {
      if (startX >= 1910 && startY <= 640) {
        waypoints.push({ x: 1970, y: 700 });
      }
      // Path ends at the Club Exit Door inside the club (must confirm exit transition to step outside)
      waypoints.push({ x: 1440, y: 690 });
      return waypoints;
    }

    // Case 3: Both outside
    if (!isStartInside && !isTargetInside) {
      if ((startY < 460 && targetY > 500) || (startY > 720 && targetY < 680)) {
        waypoints.push({ x: 350, y: 590 });
      }
      waypoints.push({ x: targetX, y: targetY });
      return waypoints;
    }

    // Case 4: Both inside
    if (isStartInside && isTargetInside) {
      const isStartVip = startX >= 1910 && startY <= 640;
      const isTargetVip = targetX >= 1910 && targetY <= 640;

      if (isStartVip && !isTargetVip) {
        waypoints.push({ x: 1970, y: 700 });
      } else if (!isStartVip && isTargetVip) {
        waypoints.push({ x: 1970, y: 700 });
      }
      waypoints.push({ x: targetX, y: targetY });
      return waypoints;
    }

    return [{ x: targetX, y: targetY }];
  }

  moveCharacterAlongPath(charId, waypoints, onArrived) {
    const char = this.characters.get(charId);
    if (!char) return;
    if (!waypoints || waypoints.length === 0) {
      if (onArrived) onArrived();
      return;
    }
    char.waypoints = [...waypoints];
    char.onArriveCallback = onArrived || null;
    const first = char.waypoints.shift();
    this.moveCharacterTo(charId, first.x, first.y);
  }

  // Cancels a first-click's delayed approach (see handleWorldClick) before it
  // fires - used when a second click turns it into a switch instead, and when
  // switching control away some other way while one is still pending.
  cancelPendingApproach() {
    if (this.pendingApproachTimer) {
      clearTimeout(this.pendingApproachTimer);
      this.pendingApproachTimer = null;
    }
  }

  // Halts a character in place and drops any in-flight path/arrival-callback -
  // used when switching control away from a character mid-walk (e.g. Anshuman
  // approaching a pickpocket/phishing target) so the interaction doesn't fire
  // later behind the player's back once a different character is in control.
  stopCharacterMovement(charId) {
    const char = this.characters.get(charId);
    if (!char) return;
    char.targetX = undefined;
    char.targetY = undefined;
    char.isMoving = false;
    char.waypoints = [];
    char.onArriveCallback = null;
  }

  // Classifies a character's current position into a coarse map area, using
  // the same x/y thresholds generatePath() already uses to route between
  // them (club interior starts at x>=1380, the VIP lounge at x>=1910/y<=640).
  // Used to block Anshuman from "approaching" a target who is behind a checkpoint
  // in a different area than him (e.g. he's out in town, they're inside the club).
  getCharacterArea(char) {
    if (!char) return 'town';
    if (char.x >= 1910 && char.y <= 640) return 'vip';
    if (char.x >= 1380) return 'club';
    return 'town';
  }

  centerOnCharacter(charId) {
    const char = this.characters.get(charId);
    if (!char) return;
    this.camX = Math.round(this.width / 2 - char.x * this.zoom);
    this.camY = Math.round(this.height / 2 - char.y * this.zoom);
    this.clampCamera();
  }

  isWalkableTerrain(x, y, radius = 12) {
    // 1. Inside The Secure Club (Paved tile flooring)
    if (x >= 1390 && x <= 2390 && y >= 300 && y <= 1180) {
      return true;
    }

    // 2. Main West-East Avenue (x: 0 all the way to Club Entrance x: 1400)
    if (x >= 0 && x <= 1400 && y >= 450 && y <= 730) {
      return true;
    }

    // 3. Yash & Anshuman North-South Boulevard
    if (x >= 250 && x <= 470 && y >= 410 && y <= 1020) {
      return true;
    }

    // 4. Vipul's Villa Walkway
    if (x >= 680 && x <= 880 && y >= 410 && y <= 480) {
      return true;
    }

    // 5. Yash's House Interior
    if (x >= 180 && x <= 540 && y >= 200 && y <= 460) {
      return true;
    }

    // 6. Vipul's Villa Interior
    if (x >= 600 && x <= 960 && y >= 200 && y <= 460) {
      return true;
    }

    // 7. Cyber Town Signboard Surroundings
    if (x >= 1010 && x <= 1210 && y >= 390 && y <= 460) {
      return true;
    }

    // 8. Anshuman's House Interior
    if (x >= 180 && x <= 540 && y >= 760 && y <= 1020) {
      return true;
    }

    // Any other ground is GRASS -> Unwalkable!
    return false;
  }

  isPointColliding(x, y, radius = 14) {
    // Check if on grass (unwalkable!)
    if (!this.isWalkableTerrain(x, y, radius)) {
      return true;
    }

    for (const box of this.colliders) {
      if (
        x + radius > box.x &&
        x - radius < box.x + box.w &&
        y + radius > box.y &&
        y - radius < box.h + box.y
      ) {
        return true;
      }
    }
    return false;
  }

  clampCamera() {
    const minX = Math.min(0, this.width - this.worldWidth * this.zoom);
    const maxX = 0;
    const minY = Math.min(0, this.height - this.worldHeight * this.zoom);
    const maxY = 0;

    this.camX = Math.max(minX, Math.min(maxX, this.camX));
    this.camY = Math.max(minY, Math.min(maxY, this.camY));
  }

  initCharacters() {
    this.characters.clear();

    // Yash: Normal club member (Starts outside his house)
    this.characters.set('yash', {
      id: 'yash',
      name: 'Yash',
      x: 350,
      y: 490,
      role: 'Regular Member',
      label: 'YASH',
      facing: 'down'
    });

    // Vipul: VIP member (Starts outside his luxury villa on north avenue)
    this.characters.set('vipul', {
      id: 'vipul',
      name: 'Vipul',
      x: 780,
      y: 490,
      role: 'VIP Member',
      label: 'VIPUL',
      facing: 'down'
    });

    // Anshuman: Attacker (Starts outside his lair on the north side facing the road)
    this.characters.set('anshuman', {
      id: 'anshuman',
      name: 'Anshuman',
      x: 350,
      y: 720,
      role: 'Threat Actor',
      label: 'ANSHUMAN',
      facing: 'down'
    });

    // Bouncer: Authentication system (Guarding Club Entrance at x: 1360, y: 690)
    this.characters.set('bouncer', {
      id: 'bouncer',
      name: 'Bouncer',
      x: 1360,
      y: 690,
      role: 'Authentication System',
      label: 'BOUNCER',
      facing: 'left'
    });

    // Security Guard: Authorization system (Guarding VIP Entrance at x: 1970, y: 640)
    this.characters.set('guard', {
      id: 'guard',
      name: 'Security Guard',
      x: 1970,
      y: 620,
      role: 'Authorization Guard',
      label: 'GUARD',
      facing: 'down'
    });

    // Bartender NPC (Inside Club Bar at x: 1680, y: 350)
    this.characters.set('bartender', {
      id: 'bartender',
      name: 'Bartender',
      x: 1680,
      y: 350,
      role: 'Club Staff',
      label: 'BARTENDER',
      facing: 'down'
    });

    // Club Patron NPCs with proper positions
    this.characters.set('alex', {
      id: 'alex',
      name: 'Partygoer Alex',
      x: 1680,
      y: 560,
      role: 'Club Patron',
      label: 'ALEX',
      facing: 'down'
    });

    this.characters.set('dex', {
      id: 'dex',
      name: 'DJ Dex',
      x: 1840,
      y: 560,
      role: 'Club DJ',
      label: 'DJ DEX',
      facing: 'left'
    });

    this.characters.set('sophia', {
      id: 'sophia',
      name: 'VIP Guest Sophia',
      x: 2160,
      y: 460,
      role: 'VIP Socialite',
      label: 'SOPHIA',
      facing: 'down'
    });
  }

  showBubble(charId, text, durationMs = 4500) {
    const char = this.characters.get(charId);
    if (char) {
      char.bubbleText = text;
      char.bubbleTimer = Date.now() + durationMs;
    }
  }

  moveCharacterTo(charId, targetX, targetY) {
    const char = this.characters.get(charId);
    if (char) {
      char.targetX = targetX;
      char.targetY = targetY;
      char.isMoving = true;
      if (Math.abs(targetX - char.x) > Math.abs(targetY - char.y)) {
        char.facing = targetX > char.x ? 'right' : 'left';
      } else {
        char.facing = targetY > char.y ? 'down' : 'up';
      }
    }
  }

  startLoop() {
    const render = (time) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;
      this.totalTime += dt;

      this.update(dt || 0.016);
      this.draw();

      this.animFrameId = requestAnimationFrame(render);
    };
    this.animFrameId = requestAnimationFrame(render);
  }

  update(dt) {
    const interactionBlocked = Boolean(this.onCheckInteractionBlocked && this.onCheckInteractionBlocked());

    // 1. Direct Keyboard Movement (WASD / Arrow Keys)
    const controlledChar = this.characters.get(this.controlledCharId);
    let keyDx = 0;
    let keyDy = 0;

    if (controlledChar && !interactionBlocked) {
      if (this.keysDown.has('w') || this.keysDown.has('arrowup')) keyDy -= 1;
      if (this.keysDown.has('s') || this.keysDown.has('arrowdown')) keyDy += 1;
      if (this.keysDown.has('a') || this.keysDown.has('arrowleft')) keyDx -= 1;
      if (this.keysDown.has('d') || this.keysDown.has('arrowright')) keyDx += 1;

      if (keyDx !== 0 || keyDy !== 0) {
        controlledChar.targetX = undefined;
        controlledChar.targetY = undefined;

        // Normalize diagonal movement speed
        const len = Math.hypot(keyDx, keyDy);
        const speed = 240 * dt;
        const moveStepX = (keyDx / len) * speed;
        const moveStepY = (keyDy / len) * speed;

        // Update facing direction
        if (Math.abs(keyDx) > Math.abs(keyDy)) {
          controlledChar.facing = keyDx > 0 ? 'right' : 'left';
        } else {
          controlledChar.facing = keyDy > 0 ? 'down' : 'up';
        }

        // Check collision with sliding
        const nextX = controlledChar.x + moveStepX;
        const nextY = controlledChar.y + moveStepY;

        let moved = false;
        if (!this.isPointColliding(nextX, nextY, 12)) {
          controlledChar.x = nextX;
          controlledChar.y = nextY;
          moved = true;
        } else {
          // Slide along X if possible
          if (!this.isPointColliding(nextX, controlledChar.y, 12)) {
            controlledChar.x = nextX;
            moved = true;
          }
          // Slide along Y if possible
          if (!this.isPointColliding(controlledChar.x, nextY, 12)) {
            controlledChar.y = nextY;
            moved = true;
          }
        }
        controlledChar.isMoving = moved;
      } else if (controlledChar.targetX === undefined) {
        controlledChar.isMoving = false;
      }
    }

    // 2. Smooth Click-to-Move / Waypoint Movement with Obstacle Sliding
    for (const char of this.characters.values()) {
      if (char.targetX !== undefined && char.targetY !== undefined) {
        const dx = char.targetX - char.x;
        const dy = char.targetY - char.y;
        const dist = Math.hypot(dx, dy);
        const speed = 220 * dt;

        if (dist <= speed) {
          char.x = char.targetX;
          char.y = char.targetY;
          
          // Check if there are more waypoints in queue
          if (char.waypoints && char.waypoints.length > 0) {
            const next = char.waypoints.shift();
            char.targetX = next.x;
            char.targetY = next.y;
            char.isMoving = true;
            if (Math.abs(next.x - char.x) > Math.abs(next.y - char.y)) {
              char.facing = next.x > char.x ? 'right' : 'left';
            } else {
              char.facing = next.y > char.y ? 'down' : 'up';
            }
          } else {
            char.targetX = undefined;
            char.targetY = undefined;
            char.isMoving = false;
            if (char.onArriveCallback) {
              const cb = char.onArriveCallback;
              char.onArriveCallback = null;
              cb();
            }
          }
        } else {
          const nextX = char.x + (dx / dist) * speed;
          const nextY = char.y + (dy / dist) * speed;

          // Check both axes with wall-sliding capability
          let moved = false;
          if (!this.isPointColliding(nextX, nextY, 12)) {
            char.x = nextX;
            char.y = nextY;
            moved = true;
          } else {
            // Can slide horizontally
            if (Math.abs(dx) > 2 && !this.isPointColliding(nextX, char.y, 12)) {
              char.x = nextX;
              moved = true;
            }
            // Can slide vertically
            if (Math.abs(dy) > 2 && !this.isPointColliding(char.x, nextY, 12)) {
              char.y = nextY;
              moved = true;
            }
          }

          if (moved) {
            char.isMoving = true;
          } else {
            // Blocked, skip to next waypoint if available - but if this was the
            // final leg, the character simply stops here WITHOUT firing the
            // arrival callback. Being stuck against a wall/collider is not the
            // same as arriving at the destination; treating them as equivalent
            // let a click on an NPC standing behind an unreachable barrier (e.g.
            // an unauthorized VIP lounge patron) silently pop that NPC's
            // encounter while the character was still stuck outside.
            if (char.waypoints && char.waypoints.length > 0) {
              const next = char.waypoints.shift();
              char.targetX = next.x;
              char.targetY = next.y;
            } else {
              char.targetX = undefined;
              char.targetY = undefined;
              char.isMoving = false;
              char.onArriveCallback = null;
            }
          }
        }
      }

      if (char.bubbleTimer && Date.now() > char.bubbleTimer) {
        char.bubbleText = null;
        char.bubbleTimer = undefined;
      }
    }

    // Phishing encounters no longer fire from mere proximity - disguised Anshuman must be
    // clicked-and-walked to a victim (see handleWorldClick -> onPhishTargetClick) so
    // standing near someone with the encounter open never re-triggers it.

    // Area Trigger Zones (Step on zone -> triggers authentication / entry)
    // Skipped entirely while a dialogue/battle/modal is open, so the zone
    // flag can't be mutated out from under an interaction that's still active.
    if (!interactionBlocked) {
      if (this.zoneTriggerCooldown > 0) {
        this.zoneTriggerCooldown -= dt;
      } else {
        this.checkZoneTriggers();
      }
    }
  }

  checkZoneTriggers() {
    const controlledChar = this.characters.get(this.controlledCharId);
    if (!controlledChar) return;
    const { x, y } = controlledChar;

    // Defined interactive area trigger zones
    const zones = [
      // 1. Club Entrance Security Mat (Outside Bouncer)
      { id: 'club_entrance', x: 1300, y: 640, w: 90, h: 100 },
      // 2. Club Exit Mat (Inside Club near entrance doorway)
      { id: 'club_exit', x: 1420, y: 640, w: 70, h: 100 },
      // 3. VIP Lounge Entrance Checkpoint (Guarded by Security Guard at velvet ropes) -
      // always challenges every approach, VIP members included, same as the Bouncer
      // always challenging the club entrance. This is the only way into the lounge,
      // so no separate "inside the lounge" safety-net zone is needed.
      { id: 'vip_entrance', x: 1900, y: 640, w: 140, h: 90 },
      // 4. VIP Lounge Exit
      { id: 'vip_exit', x: 1900, y: 590, w: 120, h: 60 }
      // Bartender chat and the Security PC terminal are click-to-walk-to only
      // (see handleNpcClick / handleSecurityPcClick in app.js) - no longer
      // fire just from walking near them.
    ];

    let foundZone = null;
    for (const z of zones) {
      if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) {
        foundZone = z.id;
        break;
      }
    }

    if (foundZone && foundZone !== this.activeTriggerZone) {
      this.activeTriggerZone = foundZone;
      // Stop moving immediately on zone trigger - and drop any queued waypoints/
      // arrival callback from whatever multi-step walk was in progress (e.g. a
      // click-to-walk toward an NPC deeper in the club). Leaving those behind
      // meant a subsequent moveCharacterTo() (like the guard's halt nudge) would
      // arrive, then immediately resume popping the stale waypoints and walk the
      // character straight back into/through the checkpoint toward the original
      // destination instead of staying put for the encounter.
      controlledChar.targetX = undefined;
      controlledChar.targetY = undefined;
      controlledChar.isMoving = false;
      controlledChar.waypoints = [];
      controlledChar.onArriveCallback = null;
      this.zoneTriggerCooldown = 2.0; // 2s cooldown before retriggering same spot
      if (this.onZoneEnter) {
        this.onZoneEnter(foundZone);
      }
    } else if (!foundZone) {
      this.activeTriggerZone = null;
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;

    // Clear entire screen
    ctx.fillStyle = '#101820';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    // Apply camera hold-and-drag translation, then zoom in on the world
    ctx.translate(Math.round(this.camX), Math.round(this.camY));
    ctx.scale(this.zoom, this.zoom);

    // 1. Cobblestone Plaza & Town Grass / Streets
    this.drawTownPlaza(ctx);

    // 2. Yash's House (Top Left)
    this.drawYashHouse(ctx);

    // 2.5 Vipul's Villa (Top Center)
    this.drawVipulHouse(ctx);

    // 3. Anshuman's House (Bottom Left)
    this.drawAnshumanHouse(ctx);

    // 4. The Secure Club Building (Right Half of World)
    this.drawClubBuilding(ctx);

    // 5. Anshuman Recording Radar Circle (pulses whenever he's near the club door)
    const anshumanChar = this.characters.get('anshuman');
    if (anshumanChar && Math.hypot(anshumanChar.x - 1300, anshumanChar.y - 690) < 220) {
      ctx.save();
      const pulse = 48 + Math.sin(this.totalTime * 6) * 8;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.arc(anshumanChar.x, anshumanChar.y, pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(239, 68, 68, 0.14)';
      ctx.fill();

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('● REC AUDIO', anshumanChar.x, anshumanChar.y - 52);
      ctx.restore();
    }

    // 6. 8-Bit Characters sorted by Y for authentic top-down depth with bouncing selection arrow
    const sorted = Array.from(this.characters.values()).sort((a, b) => a.y - b.y);
    for (const char of sorted) {
      this.pixelRenderer.drawCharacter(ctx, char, this.totalTime, this.controlledCharId);
    }

    ctx.restore();
  }

  drawTownPlaza(ctx) {
    // 1. Natural Town Grass Base - Lush 8-bit Pokémon GBA Emerald Grass Pattern
    const gPat = ctx.createPattern(this.pixelRenderer.grassTile, 'repeat');
    ctx.fillStyle = gPat;
    ctx.fillRect(0, 0, this.worldWidth, this.worldHeight);

    // 2. Cobblestone Town Roads & Main Square - FULLY EXTENDED TO LEFT EDGE (x: 0)
    const pat = ctx.createPattern(this.pixelRenderer.streetTile, 'repeat');
    ctx.fillStyle = pat;

    // Main Avenue completely extended to left edge across full width
    ctx.fillRect(0, 460, 1400, 260); // West-East Main Road from x: 0
    ctx.fillRect(260, 420, 200, 600); // North-South Yash/Anshuman Boulevard (ends flush with Anshuman's south wall - no dead-end ghost strip beyond it)
    ctx.fillRect(690, 420, 180, 60);  // Pathway leading to Vipul's Villa

    // Plaza Stone Curbs & Wooden Fences along Grass Borders
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 456, 1400, 4);
    ctx.fillRect(0, 720, 1400, 4);

    // Decorative Pokémon-style wooden fence posts along grass edge
    ctx.fillStyle = '#78350f';
    for (let fx = 20; fx < 1380; fx += 50) {
      if ((fx >= 240 && fx <= 480) || (fx >= 670 && fx <= 890)) continue; // gaps for pathways
      ctx.fillRect(fx, 448, 6, 12);
      ctx.fillRect(fx - 2, 450, 10, 3);
      ctx.fillRect(fx, 718, 6, 12);
      ctx.fillRect(fx - 2, 720, 10, 3);
    }

    // Town Square Signboard - ON TOP OF ROAD (y: 395 to 441, placed at x: 1020)
    ctx.save();
    ctx.fillStyle = '#603810';
    ctx.fillRect(1034, 441, 8, 17);
    ctx.fillRect(1186, 441, 8, 17);
    ctx.fillStyle = '#d0b888';
    ctx.fillRect(1020, 395, 180, 46);
    ctx.strokeStyle = '#603810';
    ctx.lineWidth = 3;
    ctx.strokeRect(1020, 395, 180, 46);

    ctx.fillStyle = '#381808';
    ctx.font = 'bold 10px "Press Start 2P", monospace';
    ctx.fillText('CYBER TOWN', 1040, 417);
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = '#603810';
    ctx.fillText('← RESIDENCES | CLUB →', 1030, 433);
    ctx.restore();
  }

  drawYashHouse(ctx) {
    const x = 180;
    const y = 200;
    const w = 360;
    const h = 260;

    ctx.save();
    // House Floor (Cozy Pokémon Wood Planks)
    const pat = ctx.createPattern(this.pixelRenderer.vipFloor, 'repeat');
    ctx.fillStyle = pat;
    ctx.fillRect(x, y, w, h);

    // Blue GBA Shingle Roof with dark eaves
    const rPat = ctx.createPattern(this.pixelRenderer.blueRoofTile, 'repeat');
    ctx.fillStyle = rPat;
    ctx.fillRect(x - 10, y - 40, w + 20, 50);
    ctx.strokeStyle = '#182848';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 10, y - 40, w + 20, 50);
    this.drawRoofGable(ctx, x, y, w, '#204070', '#4880c8');

    // 8-Bit Brick Chimney with subtle smoke
    ctx.fillStyle = '#883030';
    ctx.fillRect(x + 280, y - 56, 26, 22);
    ctx.strokeStyle = '#401818';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 280, y - 56, 26, 22);
    ctx.fillStyle = 'rgba(240, 240, 250, 0.5)';
    ctx.beginPath();
    ctx.arc(x + 293, y - 62, 5, 0, Math.PI * 2);
    ctx.fill();

    // Outer Wooden House Walls with corner pillars
    ctx.strokeStyle = '#483828';
    ctx.lineWidth = 6;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#604838'; // corner pillars
    ctx.fillRect(x, y, 14, h);
    ctx.fillRect(x + w - 14, y, 14, h);

    // 8-Bit Glass Windows with reflection glint
    this.drawWindow(ctx, x + 30, y + 15, 40, 30);
    this.drawWindow(ctx, x + w - 70, y + 15, 40, 30);

    // Yash House Front Door (Open at bottom)
    ctx.fillStyle = '#2860a8';
    ctx.fillRect(x + 140, y + h - 16, 60, 20);
    ctx.strokeStyle = '#d8a038';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 140, y + h - 16, 60, 20);

    // House Banner / Mailbox
    ctx.fillStyle = '#2860a8';
    ctx.fillRect(x + 85, y + 16, 190, 30);
    ctx.strokeStyle = '#d8a038';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 85, y + 16, 190, 30);
    ctx.fillStyle = '#f8d068';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText("YASH'S HOUSE", x + 116, y + 36);

    // Interior Bed & Cozy Pillow
    ctx.fillStyle = '#782020'; // Bed
    ctx.fillRect(x + 30, y + 70, 70, 100);
    ctx.fillStyle = '#ffffff'; // Pillow
    ctx.fillRect(x + 35, y + 75, 60, 25);
    ctx.strokeStyle = '#401010';
    ctx.strokeRect(x + 30, y + 70, 70, 100);

    // Desk & Laptop (Where Yash manages passwords & MFA)
    ctx.fillStyle = '#603810';
    ctx.fillRect(x + 230, y + 80, 90, 50);
    ctx.fillStyle = '#a0a8b8'; // Laptop
    ctx.fillRect(x + 255, y + 90, 40, 30);
    ctx.fillStyle = '#3878c8'; // Laptop screen
    ctx.fillRect(x + 260, y + 94, 30, 16);

    ctx.restore();
  }

  drawAnshumanHouse(ctx) {
    const x = 180;
    const y = 760;
    const w = 360;
    const h = 260;

    ctx.save();
    // House Floor (Same cozy plank flooring as the other residences)
    const pat = ctx.createPattern(this.pixelRenderer.vipFloor, 'repeat');
    ctx.fillStyle = pat;
    ctx.fillRect(x, y, w, h);

    // Dark Charcoal Shingle Roof
    const rPat = ctx.createPattern(this.pixelRenderer.darkRoofTile, 'repeat');
    ctx.fillStyle = rPat;
    ctx.fillRect(x - 10, y - 40, w + 20, 50);
    ctx.strokeStyle = '#100810';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 10, y - 40, w + 20, 50);
    // No gable here (unlike the other two houses): this house's entrance faces
    // north on this same edge, so a peaked roof would collide with the door.

    // Outer Wooden House Walls with corner pillars
    ctx.strokeStyle = '#483828';
    ctx.lineWidth = 6;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#403040';
    ctx.fillRect(x, y, 14, h);
    ctx.fillRect(x + w - 14, y, 14, h);

    // 8-Bit Glass Windows with reflection glint
    this.drawWindow(ctx, x + 30, y + 15, 40, 30);
    this.drawWindow(ctx, x + w - 70, y + 15, 40, 30);

    // North Doorway Facing the Boulevard
    ctx.fillStyle = '#383848';
    ctx.fillRect(x + 140, y - 10, 60, 24);
    ctx.strokeStyle = '#d8a038';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 140, y - 10, 60, 24);

    // House Banner
    ctx.fillStyle = '#383848';
    ctx.fillRect(x + 85, y + 40, 190, 30);
    ctx.strokeStyle = '#d8a038';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 85, y + 40, 190, 30);
    ctx.fillStyle = '#f8d068';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText("ANSHUMAN'S HOUSE", x + 108, y + 60);

    // Interior Bed & Pillow
    ctx.fillStyle = '#303040';
    ctx.fillRect(x + 30, y + 110, 70, 100);
    ctx.fillStyle = '#c0c0d0';
    ctx.fillRect(x + 35, y + 115, 60, 25);
    ctx.strokeStyle = '#181820';
    ctx.strokeRect(x + 30, y + 110, 70, 100);

    // Desk & PC (Where Anshuman manages his own accounts)
    ctx.fillStyle = '#603810';
    ctx.fillRect(x + 230, y + 120, 90, 50);
    ctx.fillStyle = '#a0a8b8'; // Monitor
    ctx.fillRect(x + 255, y + 130, 40, 30);
    ctx.fillStyle = '#38b058'; // Screen glow
    ctx.fillRect(x + 260, y + 134, 30, 16);

    ctx.restore();
  }

  drawVipulHouse(ctx) {
    const x = 600;
    const y = 200;
    const w = 360;
    const h = 260;

    ctx.save();
    // Luxury VIP Polished Parquet Floor
    const pat = ctx.createPattern(this.pixelRenderer.vipFloor, 'repeat');
    ctx.fillStyle = pat;
    ctx.fillRect(x, y, w, h);

    // Amber / Golden Glazed Tile Roof
    const rPat = ctx.createPattern(this.pixelRenderer.amberRoofTile, 'repeat');
    ctx.fillStyle = rPat;
    ctx.fillRect(x - 10, y - 40, w + 20, 50);
    ctx.strokeStyle = '#502808';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 10, y - 40, w + 20, 50);
    this.drawRoofGable(ctx, x, y, w, '#784810', '#f8b038');

    // Outer White Marble Walls with Golden Trim
    ctx.strokeStyle = '#d8a038';
    ctx.lineWidth = 6;
    ctx.strokeRect(x, y, w, h);

    // Marble Corner Columns
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x, y, 16, h);
    ctx.fillRect(x + w - 16, y, 16, h);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 16, h);
    ctx.strokeRect(x + w - 16, y, 16, h);

    // 8-Bit Arched Glass Windows
    this.drawWindow(ctx, x + 30, y + 15, 40, 30, '#f8b038');
    this.drawWindow(ctx, x + w - 70, y + 15, 40, 30, '#f8b038');

    // VIP Front Door (Golden Frame & Marble Step)
    ctx.fillStyle = '#b87820';
    ctx.fillRect(x + 140, y + h - 16, 60, 20);
    ctx.strokeStyle = '#f8d038';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 140, y + h - 16, 60, 20);

    // Front Door Welcome Mat
    ctx.fillStyle = '#781818';
    ctx.fillRect(x + 145, y + h + 2, 50, 10);

    // VIP Banner
    ctx.fillStyle = '#784810';
    ctx.fillRect(x + 85, y + 16, 190, 30);
    ctx.strokeStyle = '#f8d038';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 85, y + 16, 190, 30);
    ctx.fillStyle = '#f8d038';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText("VIPUL'S VILLA", x + 114, y + 36);

    // Luxury Red Velvet Sofa
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(x + 30, y + 70, 80, 90);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 30, y + 70, 80, 90);
    ctx.fillStyle = '#fef3c7'; // silk cushions
    ctx.fillRect(x + 38, y + 80, 64, 20);

    // Polished Mahogany Desk & Gold Laptop
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x + 230, y + 80, 95, 50);
    ctx.fillStyle = '#f59e0b'; // Gold Laptop
    ctx.fillRect(x + 258, y + 88, 40, 32);
    ctx.fillStyle = '#38bdf8'; // Screen
    ctx.fillRect(x + 263, y + 92, 30, 16);

    // VIP Wall Safe / Vault
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 245, y + 150, 60, 50);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 245, y + 150, 60, 50);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(x + 275, y + 175, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Triangular pitched-roof gable drawn above a flat roof band, for the
  // classic Pokémon-style house silhouette instead of a flat colored bar.
  drawRoofGable(ctx, x, y, w, darkColor, lightColor) {
    const roofTop = y - 40;
    const apexY = roofTop - 30;
    const leftX = x - 22;
    const rightX = x + w + 22;
    const midX = x + w / 2;

    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(leftX, roofTop);
    ctx.lineTo(midX, apexY);
    ctx.lineTo(midX, roofTop);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = lightColor;
    ctx.beginPath();
    ctx.moveTo(midX, apexY);
    ctx.lineTo(rightX, roofTop);
    ctx.lineTo(midX, roofTop);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#101820';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftX, roofTop);
    ctx.lineTo(midX, apexY);
    ctx.lineTo(rightX, roofTop);
    ctx.stroke();
  }

  drawWindow(ctx, wx, wy, ww, wh, trimColor = '#603810') {
    // Window glass
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(wx, wy, ww, wh);
    // Dark frame
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(wx, wy, ww, wh);
    // Panes cross
    ctx.fillStyle = trimColor;
    ctx.fillRect(wx + ww / 2 - 1, wy, 2, wh);
    ctx.fillRect(wx, wy + wh / 2 - 1, ww, 2);
    // Diagonal white reflection glint
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(wx + 4, wy + 4, 6, 2);
    ctx.fillRect(wx + 8, wy + 6, 4, 2);
  }

  drawClubBuilding(ctx) {
    const x = 1390;
    const y = 300;
    const w = 1000;
    const h = 880;

    // 1. Checkerboard Tiled Floor inside Club
    const fPat = ctx.createPattern(this.pixelRenderer.floorTile, 'repeat');
    ctx.fillStyle = fPat;
    ctx.fillRect(x, y, w, h);

    // 2. Brick Walls Boundary
    const wPat = ctx.createPattern(this.pixelRenderer.brickWall, 'repeat');
    ctx.fillStyle = wPat;
    // North Wall
    ctx.fillRect(x, y, w, 24);
    // South Wall
    ctx.fillRect(x, y + h - 24, w, 24);
    // East Wall
    ctx.fillRect(x + w - 24, y, 24, h);
    // West Wall (Outer Brick Wall)
    ctx.fillRect(x, y, 24, 340);
    ctx.fillRect(x, y + 440, 24, h - 440);

    // Neon Marquee Sign above the entrance (visible approaching from the street)
    ctx.save();
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(x - 150, y + 250, 150, 50);
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 150, y + 250, 150, 50);
    ctx.fillStyle = '#f472b6';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★ THE SECURE', x - 75, y + 270);
    ctx.fillText('CLUB ★', x - 75, y + 288);
    ctx.restore();

    // CLOSED SECURITY DOUBLE DOORS (Physical barrier: Requires authentication to enter)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 4, y + 340, 32, 100);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 4, y + 340, 32, 100);
    // Door split seam & security lock lights
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 4, y + 389, 32, 2);
    ctx.fillStyle = '#ef4444'; // Red lock indicator
    ctx.fillRect(x + 10, y + 360, 4, 4);
    ctx.fillRect(x + 10, y + 416, 4, 4);
    // "LOCKED" plate mounted beside the doors
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 32, y + 384, 58, 14);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 32, y + 384, 58, 14);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('LOCKED', x + 37, y + 394);

    // Red Carpet leading to the security doors
    ctx.fillStyle = '#982828';
    ctx.fillRect(x - 140, y + 340, 136, 100);
    ctx.strokeStyle = '#d84848';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 140, y + 340, 136, 100);

    // Authentication Security Trigger Zone Mat (Golden / Green illuminated scanner pad)
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(x - 90, y + 360, 70, 60);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 90, y + 360, 70, 60);
    ctx.fillStyle = '#67e8f9';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('STEP HERE', x - 55, y + 386);
    ctx.fillText('TO AUTH', x - 55, y + 402);
    ctx.textAlign = 'left';

    // 3. Central Club Arena Mat
    ctx.save();
    ctx.fillStyle = '#384860';
    ctx.fillRect(x + 160, y + 160, 320, 260);
    ctx.strokeStyle = '#506880';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 160, y + 160, 320, 260);
    ctx.fillStyle = '#90a8c8';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CLUB MAIN LOUNGE', x + 320, y + 295);
    ctx.restore();

    // 4. Bar Area (Top Center of Club)
    this.drawBarArea(ctx, x + 160, y + 30);

    // 5. Security PC Terminal (Bottom Right)
    this.drawTerminalArea(ctx, x + 250, y + 700);

    // 5.5 DJ Booth Stand (Next to dance floor)
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 420, y + 236, 56, 40);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 420, y + 236, 56, 40);
    // Dual Turntables & Mixer
    ctx.fillStyle = '#18181b';
    ctx.fillRect(x + 424, y + 242, 18, 18);
    ctx.fillRect(x + 454, y + 242, 18, 18);
    ctx.fillStyle = '#22c55e'; // neon turntable records
    ctx.beginPath();
    ctx.arc(x + 433, y + 251, 7, 0, Math.PI * 2);
    ctx.arc(x + 463, y + 251, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText('DJ DECK', x + 424, y + 270);
    ctx.restore();

    // 6. VIP Lounge (East Room with Velvet Posts & Parquet Floor)
    this.drawVIPLounge(ctx, x + 530, y + 30);
  }

  drawVIPLounge(ctx, vx = 1920, vy = 330) {
    const vw = 440;
    // Room floor must stop exactly at the south wall collider (y: 660) -
    // it previously ran 30px past it, so the drawn rope/checkpoint marker
    // didn't line up with where the invisible trigger zones actually fire.
    const vh = 330;

    ctx.save();
    // Parquet Wood Floor
    const pat = ctx.createPattern(this.pixelRenderer.vipFloor, 'repeat');
    ctx.fillStyle = pat;
    ctx.fillRect(vx, vy, vw, vh);

    // Illuminated VIP Checkpoint Scanner Mat in doorway
    ctx.fillStyle = '#781818';
    ctx.fillRect(vx + 26, vy + vh - 26, 94, 24);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(vx + 26, vy + vh - 26, 94, 24);
    ctx.fillStyle = '#fef08a';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText('VIP MAT', vx + 42, vy + vh - 10);

    // Solid Wood Border
    ctx.strokeStyle = '#503010';
    ctx.lineWidth = 4;
    ctx.strokeRect(vx, vy, vw, vh);

    // Header Banner
    ctx.fillStyle = '#603810';
    ctx.fillRect(vx, vy, vw, 36);
    ctx.fillStyle = '#f0c050';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('★ VIP LOUNGE ★ (AUTHORIZATION ONLY)', vx + 40, vy + 24);

    // Velvet Armchairs
    ctx.fillStyle = '#781818';
    ctx.fillRect(vx + 50, vy + 70, 90, 50);
    ctx.fillRect(vx + 270, vy + 70, 90, 50);
    ctx.strokeStyle = '#a82828';
    ctx.lineWidth = 2;
    ctx.strokeRect(vx + 50, vy + 70, 90, 50);
    ctx.strokeRect(vx + 270, vy + 70, 90, 50);

    // Oak Table
    ctx.fillStyle = '#804818';
    ctx.fillRect(vx + 160, vy + 150, 120, 50);
    ctx.strokeStyle = '#b87838';
    ctx.strokeRect(vx + 160, vy + 150, 120, 50);

    // Velvet Rope Closed Barrier (Doorway at vx + 30 to vx + 120, vy + vh - 20)
    // Brass security stanchions
    ctx.fillStyle = '#d97706';
    ctx.fillRect(vx + 30, vy + vh - 24, 8, 28);
    ctx.fillRect(vx + 120, vy + vh - 24, 8, 28);
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(vx + 28, vy + vh - 28, 12, 6);
    ctx.fillRect(vx + 118, vy + vh - 28, 12, 6);

    // Double closed crimson velvet security ropes
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(vx + 34, vy + vh - 18);
    ctx.bezierCurveTo(vx + 60, vy + vh - 6, vx + 90, vy + vh - 6, vx + 124, vy + vh - 18);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(vx + 34, vy + vh - 10);
    ctx.bezierCurveTo(vx + 60, vy + vh + 2, vx + 90, vy + vh + 2, vx + 124, vy + vh - 10);
    ctx.stroke();

    // Checkpoint Trigger Zone Tile outside VIP rope
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(vx + 35, vy + vh + 10, 80, 50);
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(vx + 35, vy + vh + 10, 80, 50);
    ctx.fillStyle = '#c7d2fe';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText('AUTHZ', vx + 52, vy + vh + 30);
    ctx.fillText('CHECK', vx + 52, vy + vh + 46);

    ctx.restore();
  }

  drawBarArea(ctx, bx = 1550, by = 330) {
    const bw = 320;
    ctx.save();
    ctx.fillStyle = '#402008';
    ctx.fillRect(bx, by, bw, 50);
    ctx.strokeStyle = '#603810';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, 50);

    const bottleColors = ['#e83838', '#3878e8', '#e8a820', '#38b058', '#9848d8'];
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = bottleColors[i % bottleColors.length];
      ctx.fillRect(bx + 20 + i * 32, by + 14, 14, 26);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx + 23 + i * 32, by + 10, 8, 5);
    }

    // Bar Counter
    ctx.fillStyle = '#583010';
    ctx.fillRect(bx, by + 70, bw, 32);
    ctx.strokeStyle = '#804818';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by + 70, bw, 32);

    ctx.fillStyle = '#f8d068';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText('REFRESHMENT BAR', bx + 70, by + 91);
    ctx.restore();
  }

  drawTerminalArea(ctx, tx = 1640, ty = 1000) {
    ctx.save();
    ctx.fillStyle = '#384048';
    ctx.fillRect(tx, ty, 220, 140);
    ctx.strokeStyle = '#202830';
    ctx.lineWidth = 3;
    ctx.strokeRect(tx, ty, 220, 140);

    ctx.fillStyle = '#c8d0d8';
    ctx.fillRect(tx + 25, ty + 16, 170, 95);
    ctx.strokeStyle = '#808890';
    ctx.lineWidth = 2;
    ctx.strokeRect(tx + 25, ty + 16, 170, 95);

    ctx.fillStyle = '#183820';
    ctx.fillRect(tx + 35, ty + 24, 150, 75);

    ctx.fillStyle = '#68d888';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText('SECURITY PC', tx + 45, ty + 50);
    ctx.fillStyle = '#a0f0b8';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText('[AUDIT LOGS]', tx + 45, ty + 72);
    ctx.fillText('STATUS: ONLINE', tx + 45, ty + 88);

    ctx.restore();
  }

}
