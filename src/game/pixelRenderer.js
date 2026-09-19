/**
 * The Secure Club - 8-bit Pixel Texture & Sprite Generator
 * 
 * Generates retro 8-bit / Nintendo DS-style tile textures and character sprites:
 * - Checkerboard retro club tiles
 * - Brick outside walls with 2.5D top-down perspective depth
 * - Sidewalk curbs, cobblestones, neon ropes
 * - Bar stools, arcade machines, velvet lounge sofas
 * - Distinctive 8-bit character sprites with eyes, hair, jackets, and accessories
 */

export class PixelRenderer {
  constructor() {
    this.patterns = {};
    this.initPatterns();
  }

  initPatterns() {
    // 1. Authentic Pokémon Gym/Building Checkerboard Tile (32x32)
    // Inspired by classic Pokémon Gen 3/4 interior flooring: warm beige & terracotta / slate checkered tiles
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 32;
    floorCanvas.height = 32;
    const fCtx = floorCanvas.getContext('2d');
    fCtx.imageSmoothingEnabled = false;
    // Base tile 1: Warm Pokémon interior slate #485060
    fCtx.fillStyle = '#485060';
    fCtx.fillRect(0, 0, 32, 32);
    // Base tile 2: Contrasting tile #586878
    fCtx.fillStyle = '#586878';
    fCtx.fillRect(0, 0, 16, 16);
    fCtx.fillRect(16, 16, 16, 16);
    // Dark pixel grout lines (authentic 1px Game Freak style)
    fCtx.fillStyle = '#283040';
    fCtx.fillRect(0, 15, 32, 1);
    fCtx.fillRect(0, 31, 32, 1);
    fCtx.fillRect(15, 0, 1, 32);
    fCtx.fillRect(31, 0, 1, 32);
    // Top-left pixel highlight on each tile
    fCtx.fillStyle = '#687888';
    fCtx.fillRect(1, 1, 14, 1);
    fCtx.fillRect(1, 1, 1, 14);
    fCtx.fillRect(17, 17, 14, 1);
    fCtx.fillRect(17, 17, 1, 14);
    this.floorTile = floorCanvas;

    // 2. Authentic Pokémon Golden/Oak Wood Parquet Floor (VIP Lounge)
    // Classic Pokémon building parquet: warm polished honey wood tones (#b88040, #986028, #784818)
    const vipCanvas = document.createElement('canvas');
    vipCanvas.width = 32;
    vipCanvas.height = 32;
    const vCtx = vipCanvas.getContext('2d');
    vCtx.imageSmoothingEnabled = false;
    vCtx.fillStyle = '#a06830';
    vCtx.fillRect(0, 0, 32, 32);
    // Plank pattern
    vCtx.fillStyle = '#b87838';
    vCtx.fillRect(0, 0, 16, 8);
    vCtx.fillRect(0, 16, 16, 8);
    vCtx.fillRect(16, 8, 16, 8);
    vCtx.fillRect(16, 24, 16, 8);
    // Plank dark outlines
    vCtx.fillStyle = '#603810';
    vCtx.fillRect(0, 7, 32, 1);
    vCtx.fillRect(0, 15, 32, 1);
    vCtx.fillRect(0, 23, 32, 1);
    vCtx.fillRect(0, 31, 32, 1);
    vCtx.fillRect(15, 0, 1, 16);
    vCtx.fillRect(31, 8, 1, 16);
    vCtx.fillRect(15, 24, 1, 8);
    // Grain highlight
    vCtx.fillStyle = '#d09050';
    vCtx.fillRect(1, 1, 14, 1);
    vCtx.fillRect(17, 9, 14, 1);
    vCtx.fillRect(1, 17, 14, 1);
    vCtx.fillRect(17, 25, 14, 1);
    this.vipFloor = vipCanvas;

    // 3. Authentic Pokémon Town Cobblestone Path / Sidewalk
    // Natural town pavement with warm grey-green tones (#788078, #909890, #586058)
    const streetCanvas = document.createElement('canvas');
    streetCanvas.width = 32;
    streetCanvas.height = 32;
    const sCtx = streetCanvas.getContext('2d');
    sCtx.imageSmoothingEnabled = false;
    sCtx.fillStyle = '#687068';
    sCtx.fillRect(0, 0, 32, 32);
    // Cobblestone blocks
    const drawStone = (ctx, x, y, w, h) => {
      ctx.fillStyle = '#889088';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#a0a8a0';
      ctx.fillRect(x, y, w - 1, 1);
      ctx.fillRect(x, y, 1, h - 1);
      ctx.fillStyle = '#485048';
      ctx.fillRect(x + w - 1, y, 1, h);
      ctx.fillRect(x, y + h - 1, w, 1);
    };
    drawStone(sCtx, 1, 1, 14, 14);
    drawStone(sCtx, 17, 1, 14, 14);
    drawStone(sCtx, 1, 17, 14, 14);
    drawStone(sCtx, 17, 17, 14, 14);
    // Dark mortar
    sCtx.fillStyle = '#384038';
    sCtx.fillRect(0, 0, 32, 1);
    sCtx.fillRect(0, 16, 32, 1);
    sCtx.fillRect(0, 0, 1, 32);
    sCtx.fillRect(16, 0, 1, 32);
    this.streetTile = streetCanvas;

    // 4. Authentic Pokémon Building Exterior Red/Burgundy Brick Wall
    // Classic Pokémon Silph Co. / Gym exterior brick (#883030, #a04040, #581818)
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 32;
    wallCanvas.height = 16;
    const wCtx = wallCanvas.getContext('2d');
    wCtx.imageSmoothingEnabled = false;
    wCtx.fillStyle = '#381818'; // dark mortar
    wCtx.fillRect(0, 0, 32, 16);
    // Brick row 1
    wCtx.fillStyle = '#883030';
    wCtx.fillRect(1, 1, 14, 6);
    wCtx.fillRect(17, 1, 14, 6);
    // Highlights & shadows row 1
    wCtx.fillStyle = '#a84848';
    wCtx.fillRect(1, 1, 14, 1);
    wCtx.fillRect(1, 1, 1, 6);
    wCtx.fillRect(17, 1, 14, 1);
    wCtx.fillRect(17, 1, 1, 6);
    wCtx.fillStyle = '#581818';
    wCtx.fillRect(1, 6, 14, 1);
    wCtx.fillRect(17, 6, 14, 1);

    // Brick row 2 (offset)
    wCtx.fillStyle = '#883030';
    wCtx.fillRect(9, 9, 14, 6);
    wCtx.fillRect(0, 9, 7, 6);
    wCtx.fillRect(25, 9, 7, 6);
    // Highlights row 2
    wCtx.fillStyle = '#a84848';
    wCtx.fillRect(9, 9, 14, 1);
    wCtx.fillRect(9, 9, 1, 6);
    wCtx.fillRect(0, 9, 7, 1);
    wCtx.fillRect(25, 9, 7, 1);
    wCtx.fillRect(25, 9, 1, 6);
    wCtx.fillStyle = '#581818';
    wCtx.fillRect(9, 14, 14, 1);
    wCtx.fillRect(0, 14, 7, 1);
    wCtx.fillRect(25, 14, 7, 1);
    this.brickWall = wallCanvas;

    // 5. Authentic Pokémon GBA Blue Roof Tile (Yash's House Roof)
    const blueRoof = document.createElement('canvas');
    blueRoof.width = 16;
    blueRoof.height = 16;
    const brCtx = blueRoof.getContext('2d');
    brCtx.imageSmoothingEnabled = false;
    brCtx.fillStyle = '#204070';
    brCtx.fillRect(0, 0, 16, 16);
    brCtx.fillStyle = '#3060a8';
    brCtx.fillRect(1, 1, 14, 12);
    brCtx.fillStyle = '#4880c8';
    brCtx.fillRect(1, 1, 14, 2);
    brCtx.fillStyle = '#182848';
    brCtx.fillRect(0, 14, 16, 2);
    this.blueRoofTile = blueRoof;

    // 6. Authentic Pokémon GBA Dark Charcoal / Red Roof Tile (Anshuman's House Roof)
    const darkRoof = document.createElement('canvas');
    darkRoof.width = 16;
    darkRoof.height = 16;
    const drCtx = darkRoof.getContext('2d');
    drCtx.imageSmoothingEnabled = false;
    drCtx.fillStyle = '#201820';
    drCtx.fillRect(0, 0, 16, 16);
    drCtx.fillStyle = '#502028';
    drCtx.fillRect(1, 1, 14, 12);
    drCtx.fillStyle = '#783038';
    drCtx.fillRect(1, 1, 14, 2);
    drCtx.fillStyle = '#100810';
    drCtx.fillRect(0, 14, 16, 2);
    this.darkRoofTile = darkRoof;

    // 7. Authentic Pokémon GBA Emerald Lush Grass Tile (32x32)
    const grassCanvas = document.createElement('canvas');
    grassCanvas.width = 32;
    grassCanvas.height = 32;
    const gCtx = grassCanvas.getContext('2d');
    gCtx.imageSmoothingEnabled = false;
    // Base lush emerald green
    gCtx.fillStyle = '#489838';
    gCtx.fillRect(0, 0, 32, 32);
    // Subtle checker tones
    gCtx.fillStyle = '#408830';
    gCtx.fillRect(0, 0, 16, 16);
    gCtx.fillRect(16, 16, 16, 16);
    // Highlights & blades of grass
    gCtx.fillStyle = '#60b048';
    gCtx.fillRect(4, 4, 3, 2);
    gCtx.fillRect(5, 2, 1, 2);
    gCtx.fillRect(20, 8, 3, 2);
    gCtx.fillRect(21, 6, 1, 2);
    gCtx.fillRect(8, 22, 3, 2);
    gCtx.fillRect(9, 20, 1, 2);
    gCtx.fillRect(24, 24, 3, 2);
    gCtx.fillRect(25, 22, 1, 2);
    // Dark grass accents
    gCtx.fillStyle = '#306820';
    gCtx.fillRect(4, 6, 3, 1);
    gCtx.fillRect(20, 10, 3, 1);
    gCtx.fillRect(8, 24, 3, 1);
    gCtx.fillRect(24, 26, 3, 1);
    // Occasional tiny wild flower dot
    gCtx.fillStyle = '#f8f080';
    gCtx.fillRect(14, 12, 2, 2);
    this.grassTile = grassCanvas;

    // 8. Authentic Pokémon Amber/Golden Glazed Roof Tile (Vipul's Villa)
    const amberRoof = document.createElement('canvas');
    amberRoof.width = 16;
    amberRoof.height = 16;
    const arCtx = amberRoof.getContext('2d');
    arCtx.imageSmoothingEnabled = false;
    arCtx.fillStyle = '#784810';
    arCtx.fillRect(0, 0, 16, 16);
    arCtx.fillStyle = '#c88020';
    arCtx.fillRect(1, 1, 14, 12);
    arCtx.fillStyle = '#f8b038';
    arCtx.fillRect(1, 1, 14, 2);
    arCtx.fillStyle = '#502808';
    arCtx.fillRect(0, 14, 16, 2);
    this.amberRoofTile = amberRoof;
  }

  /**
   * Draw 8-bit retro character with 2.5D top-down perspective depth,
   * animated walking bob, distinct expressive face, hair, and clothing.
   */
  drawCharacter(ctx, char, time, controlledCharId = null) {
    const { x, y, id, label, facing, bubbleText, isMoving, ejectSpin } = char;
    const p = 2; // Pixel unit scale (2x retro scale)
    const bob = isMoving ? Math.sin(time * 12) * 2 : Math.sin(time * 2.5) * 0.8;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Comic "kicked out" spin (see playAnshumanEjectionAnimation in app.js) - rotates
    // the whole sprite, shadow included, around its own position while airborne.
    if (ejectSpin) {
      ctx.translate(x, y);
      ctx.rotate(ejectSpin);
      ctx.translate(-x, -y);
    }

    // --- 1. Isometric / 2.5D Shadow ---
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y + 18, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const cx = Math.round(x);
    const cy = Math.round(y + bob);

    // --- 2. 8-Bit Character Rendering Based on Identity ---
    switch (id) {
      case 'yash':
        this.renderYash(ctx, cx, cy, p, facing, time, isMoving);
        break;
      case 'vipul':
        this.renderVipul(ctx, cx, cy, p, facing, time, isMoving);
        break;
      case 'anshuman':
        if (char.isDisguisedAsBouncer) {
          this.renderBouncer(ctx, cx, cy, p, facing, time);
        } else {
          this.renderAnshuman(ctx, cx, cy, p, facing, time, isMoving);
        }
        break;
      case 'bouncer':
        this.renderBouncer(ctx, cx, cy, p, facing, time);
        break;
      case 'guard':
        this.renderGuard(ctx, cx, cy, p, facing, time);
        break;
      case 'bartender':
        this.renderBartender(ctx, cx, cy, p, facing, time);
        break;
      case 'alex':
        this.renderAlex(ctx, cx, cy, p, facing, time);
        break;
      case 'dex':
        this.renderDex(ctx, cx, cy, p, facing, time);
        break;
      case 'sophia':
        this.renderSophia(ctx, cx, cy, p, facing, time);
        break;
      default:
        this.renderGenericNPC(ctx, cx, cy, p);
    }

    // --- 3. Pixel Floating Name Badge (Dynamic Size & Clean Pokémon Label) ---
    const displayLabel = (id === 'anshuman' && char.isDisguisedAsBouncer) ? 'BOUNCER?' : label;
    ctx.save();
    ctx.font = 'bold 8px "Press Start 2P", monospace, sans-serif';
    const textMetrics = ctx.measureText(displayLabel);
    const textWidth = Math.ceil(textMetrics.width);
    const tagPaddingX = 10;
    const tagW = textWidth + tagPaddingX * 2;
    const tagH = 18;
    const tagX = Math.round(cx - tagW / 2);
    const tagY = Math.round(cy - 46);

    // Solid dark slate tag box
    ctx.fillStyle = '#182030';
    ctx.fillRect(tagX, tagY, tagW, tagH);
    ctx.strokeStyle = '#d8a038';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(tagX, tagY, tagW, tagH);

    // Text centered cleanly inside box
    ctx.fillStyle = '#f8f8f8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayLabel, cx, tagY + tagH / 2 + 1);
    ctx.restore();

    // --- 3.5 Bouncing Arrow Indicator for Active Controlled Character ---
    if (controlledCharId && char.id === controlledCharId) {
      ctx.save();
      const bounce = Math.sin(time * 8) * 4;
      const arrowTipY = tagY - 6 + bounce;
      const arrowX = cx;

      // Drop shadow
      ctx.fillStyle = 'rgba(16, 24, 32, 0.45)';
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowTipY + 2);
      ctx.lineTo(arrowX - 7, arrowTipY - 11);
      ctx.lineTo(arrowX + 7, arrowTipY - 11);
      ctx.closePath();
      ctx.fill();

      // Golden arrow fill
      ctx.fillStyle = '#f8d030';
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowTipY);
      ctx.lineTo(arrowX - 7, arrowTipY - 13);
      ctx.lineTo(arrowX + 7, arrowTipY - 13);
      ctx.closePath();
      ctx.fill();

      // Inner highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowTipY - 3);
      ctx.lineTo(arrowX - 3, arrowTipY - 11);
      ctx.lineTo(arrowX + 3, arrowTipY - 11);
      ctx.closePath();
      ctx.fill();

      // Dark retro outline
      ctx.strokeStyle = '#101820';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowTipY);
      ctx.lineTo(arrowX - 7, arrowTipY - 13);
      ctx.lineTo(arrowX + 7, arrowTipY - 13);
      ctx.closePath();
      ctx.stroke();

      ctx.restore();
    }

    // --- 4. 8-Bit Speech Bubble ---
    if (bubbleText) {
      ctx.save();
      const fontStr = 'bold 12px "Outfit", system-ui, -apple-system, sans-serif';
      ctx.font = fontStr;

      // Wrap words so long text forms a clean multi-line bubble instead of stretching or overflowing
      const maxLineWidth = 220;
      const words = String(bubbleText).split(' ');
      const lines = [];
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxLineWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }

      // Measure max width of actual wrapped lines using exact font
      let maxTextW = 0;
      for (const line of lines) {
        const w = ctx.measureText(line).width;
        if (w > maxTextW) maxTextW = w;
      }

      const padX = 14;
      const padY = 8;
      const lineHeight = 16;
      const bW = Math.max(70, Math.ceil(maxTextW + padX * 2));
      const bH = Math.ceil(lines.length * lineHeight + padY * 2);
      const bx = Math.round(cx - bW / 2);
      const by = Math.round(cy - 52 - bH);

      // Drop shadow for 8-bit depth
      ctx.fillStyle = 'rgba(16, 24, 32, 0.35)';
      ctx.fillRect(bx + 2, by + 2, bW, bH);

      // Pixel box bubble background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx, by, bW, bH);

      // Pixel box bubble border
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bW, bH);

      // Pixel triangle pointer
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx - 5, by + bH);
      ctx.lineTo(cx + 5, by + bH);
      ctx.lineTo(cx, by + bH + 6);
      ctx.closePath();
      ctx.fill();

      // Triangle pointer border
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 5, by + bH);
      ctx.lineTo(cx, by + bH + 6);
      ctx.lineTo(cx + 5, by + bH);
      ctx.stroke();

      // Text centered cleanly inside box
      ctx.fillStyle = '#0f172a';
      ctx.font = fontStr;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textStartY = by + padY + lineHeight / 2;
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], cx, textStartY + i * lineHeight);
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // --- YASH: Regular Club Member (Spiky chestnut hair, red/white cap or cyan hoodie, denim, sneakers) ---
  renderYash(ctx, x, y, p, facing = 'down', time = 0, isMoving = false) {
    const isBack = facing === 'up';
    const isLeft = facing === 'left';
    const isRight = facing === 'right';
    const walkSwing = isMoving ? Math.sin(time * 14) * 2 * p : 0;

    // 1. Black/Slate Outline / Drop Silhouette
    // Sneakers (White soles, red accents)
    ctx.fillStyle = '#101820'; // outline
    ctx.fillRect(x - 5 * p, y + 6 * p + (isMoving ? walkSwing : 0), 4 * p, 4 * p);
    ctx.fillRect(x + 1 * p, y + 6 * p - (isMoving ? walkSwing : 0), 4 * p, 4 * p);
    // Sneaker base
    ctx.fillStyle = '#dc2626'; // vibrant red sneakers
    ctx.fillRect(x - 4 * p, y + 7 * p + (isMoving ? walkSwing : 0), 3 * p, 2 * p);
    ctx.fillRect(x + 2 * p, y + 7 * p - (isMoving ? walkSwing : 0), 3 * p, 2 * p);
    ctx.fillStyle = '#ffffff'; // rubber toe
    ctx.fillRect(x - 4 * p, y + 8 * p + (isMoving ? walkSwing : 0), 3 * p, p);
    ctx.fillRect(x + 2 * p, y + 8 * p - (isMoving ? walkSwing : 0), 3 * p, p);

    // 2. Denim Jeans (Indigo with crease shading)
    ctx.fillStyle = '#101820'; // outline
    ctx.fillRect(x - 5 * p - 1, y + p, 10 * p + 2, 6 * p);
    ctx.fillStyle = '#1e3a8a'; // denim base
    ctx.fillRect(x - 5 * p, y + p, 10 * p, 5 * p);
    ctx.fillStyle = '#3b82f6'; // denim highlight
    ctx.fillRect(x - 4 * p, y + 2 * p, 2 * p, 4 * p);
    ctx.fillRect(x + 2 * p, y + 2 * p, 2 * p, 4 * p);
    ctx.fillStyle = '#0f172a'; // seam line
    ctx.fillRect(x - p / 2, y + 2 * p, p, 4 * p);

    // 3. Jacket / Torso (Vibrant Cyan Bomber with White Trim & Pocket Seams)
    ctx.fillStyle = '#101820'; // outline
    ctx.fillRect(x - 6 * p - 1, y - 7 * p - 1, 12 * p + 2, 9 * p + 2);
    ctx.fillStyle = '#0284c7'; // cyan jacket
    ctx.fillRect(x - 6 * p, y - 7 * p, 12 * p, 8 * p);
    ctx.fillStyle = '#38bdf8'; // shoulder highlights
    ctx.fillRect(x - 5 * p, y - 6 * p, 3 * p, 2 * p);
    ctx.fillRect(x + 2 * p, y - 6 * p, 3 * p, 2 * p);

    if (!isBack) {
      // White inner shirt & gold zipper
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x - 2 * p, y - 6 * p, 4 * p, 7 * p);
      ctx.fillStyle = '#f59e0b'; // gold zipper
      ctx.fillRect(x - 1, y - 5 * p, 2, 6 * p);
      // Member card lanyard peeking out
      ctx.fillStyle = '#10b981';
      ctx.fillRect(x + p, y - 3 * p, 2 * p, 3 * p);
    } else {
      // Back of jacket: Club emblem printed on back
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(x - 3 * p, y - 4 * p, 6 * p, 4 * p);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x - 1 * p, y - 3 * p, 2 * p, 2 * p);
    }

    // 3.5 Arms (cyan sleeves with skin-tone hands, so the silhouette isn't a flat torso block)
    const armSwing = isMoving ? Math.sin(time * 14) * p : 0;
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 8 * p - 1, y - 6 * p - 1 + armSwing, 3 * p + 2, 6 * p + 2);
    ctx.fillRect(x + 5 * p - 1, y - 6 * p - 1 - armSwing, 3 * p + 2, 6 * p + 2);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x - 8 * p, y - 6 * p + armSwing, 3 * p, 5 * p);
    ctx.fillRect(x + 5 * p, y - 6 * p - armSwing, 3 * p, 5 * p);
    ctx.fillStyle = '#fed7aa'; // hands
    ctx.fillRect(x - 7 * p, y - 2 * p + armSwing, 2 * p, 2 * p);
    ctx.fillRect(x + 5 * p, y - 2 * p - armSwing, 2 * p, 2 * p);

    // 4. Head & Face (Rich warm skin tone, cheeks, anime expressive eyes)
    ctx.fillStyle = '#101820'; // head outline
    ctx.fillRect(x - 5 * p, y - 16 * p, 10 * p, 10 * p);
    ctx.fillStyle = '#fed7aa'; // warm skin tone
    ctx.fillRect(x - 4 * p, y - 15 * p, 8 * p, 8 * p);
    ctx.fillStyle = '#fdba74'; // cheek / chin shadow
    ctx.fillRect(x - 4 * p, y - 9 * p, 8 * p, 2 * p);

    if (!isBack) {
      // Anime Eyes with Highlights
      const eyeX1 = isLeft ? x - 4 * p : x - 3 * p;
      const eyeX2 = isRight ? x + 2 * p : x + p;

      if (!isRight) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(eyeX1, y - 12 * p, 2 * p, 3 * p);
        ctx.fillStyle = '#38bdf8'; // iris shine
        ctx.fillRect(eyeX1, y - 11 * p, 2 * p, p);
        ctx.fillStyle = '#ffffff'; // pupil twinkle
        ctx.fillRect(eyeX1, y - 12 * p, p, p);
      }
      if (!isLeft) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(eyeX2, y - 12 * p, 2 * p, 3 * p);
        ctx.fillStyle = '#38bdf8'; // iris shine
        ctx.fillRect(eyeX2, y - 11 * p, 2 * p, p);
        ctx.fillStyle = '#ffffff'; // pupil twinkle
        ctx.fillRect(eyeX2, y - 12 * p, p, p);
      }

      // Friendly Anime Smile
      ctx.fillStyle = '#c2410c';
      ctx.fillRect(x - p, y - 8 * p, 2 * p, p);
      ctx.fillRect(x - p / 2, y - 7 * p, p, p);
    }

    // 5. Spiky Chestnut Brown Anime Hair (Pokémon Trainer Gen 3 style)
    ctx.fillStyle = '#451a03'; // deep shadow hair outline
    ctx.fillRect(x - 6 * p, y - 18 * p, 12 * p, 5 * p);
    ctx.fillStyle = '#78350f'; // rich brown hair
    ctx.fillRect(x - 5 * p, y - 17 * p, 10 * p, 5 * p);
    ctx.fillStyle = '#b45309'; // hair highlights / bangs
    ctx.fillRect(x - 4 * p, y - 17 * p, 3 * p, 2 * p);
    ctx.fillRect(x + p, y - 17 * p, 3 * p, 2 * p);
    // Spiky Tufts
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 6 * p, y - 15 * p, 2 * p, 4 * p);
    ctx.fillRect(x + 4 * p, y - 15 * p, 2 * p, 4 * p);
    ctx.fillRect(x - 2 * p, y - 19 * p, 4 * p, 2 * p);
    ctx.fillRect(x + 2 * p, y - 18 * p, 3 * p, 2 * p);
  }

  // --- VIPUL: VIP Member (Polished amber velvet suit, gold aviators, silk red tie, slicked hair) ---
  renderVipul(ctx, x, y, p, facing = 'down', time = 0, isMoving = false) {
    const isBack = facing === 'up';
    const isLeft = facing === 'left';
    const isRight = facing === 'right';
    const walkSwing = isMoving ? Math.sin(time * 14) * 2 * p : 0;

    // 1. Italian Polished Leather Oxfords
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 5 * p, y + 6 * p + (isMoving ? walkSwing : 0), 4 * p, 4 * p);
    ctx.fillRect(x + 1 * p, y + 6 * p - (isMoving ? walkSwing : 0), 4 * p, 4 * p);
    ctx.fillStyle = '#3f3f46'; // shiny toe cap reflection
    ctx.fillRect(x - 4 * p, y + 7 * p + (isMoving ? walkSwing : 0), 2 * p, p);
    ctx.fillRect(x + 2 * p, y + 7 * p - (isMoving ? walkSwing : 0), 2 * p, p);

    // 2. Tailored Charcoal Slacks with Crease
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 5 * p - 1, y + p, 10 * p + 2, 6 * p);
    ctx.fillStyle = '#27272a'; // dark slate slacks
    ctx.fillRect(x - 5 * p, y + p, 10 * p, 5 * p);
    ctx.fillStyle = '#52525b'; // pressed leg crease
    ctx.fillRect(x - 3 * p, y + 2 * p, p, 4 * p);
    ctx.fillRect(x + 2 * p, y + 2 * p, p, 4 * p);

    // 3. Luxurious Amber / Gold Velvet Blazer & Silk Red Tie
    ctx.fillStyle = '#101820'; // outline
    ctx.fillRect(x - 6 * p - 1, y - 7 * p - 1, 12 * p + 2, 9 * p + 2);
    ctx.fillStyle = '#b45309'; // velvet blazer base
    ctx.fillRect(x - 6 * p, y - 7 * p, 12 * p, 8 * p);
    ctx.fillStyle = '#f59e0b'; // golden velvet sheen
    ctx.fillRect(x - 5 * p, y - 6 * p, 3 * p, 3 * p);
    ctx.fillRect(x + 2 * p, y - 6 * p, 3 * p, 3 * p);

    if (!isBack) {
      // Crisp White Dress Shirt & Red Silk Tie
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 2 * p, y - 6 * p, 4 * p, 7 * p);
      ctx.fillStyle = '#dc2626'; // ruby red tie
      ctx.fillRect(x - p, y - 5 * p, 2 * p, 5 * p);
      ctx.fillStyle = '#f87171'; // tie knot highlight
      ctx.fillRect(x - p, y - 5 * p, 2 * p, p);
      // Gold Lapel VIP Pin
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x + 3 * p, y - 4 * p, 2 * p, 2 * p);
    }

    // 3.5 Arms (velvet blazer sleeves with fair-skin hands)
    const armSwing = isMoving ? Math.sin(time * 14) * p : 0;
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 8 * p - 1, y - 6 * p - 1 + armSwing, 3 * p + 2, 6 * p + 2);
    ctx.fillRect(x + 5 * p - 1, y - 6 * p - 1 - armSwing, 3 * p + 2, 6 * p + 2);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x - 8 * p, y - 6 * p + armSwing, 3 * p, 5 * p);
    ctx.fillRect(x + 5 * p, y - 6 * p - armSwing, 3 * p, 5 * p);
    ctx.fillStyle = '#fde68a'; // hands
    ctx.fillRect(x - 7 * p, y - 2 * p + armSwing, 2 * p, 2 * p);
    ctx.fillRect(x + 5 * p, y - 2 * p - armSwing, 2 * p, 2 * p);

    // 4. Head & Face
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 5 * p, y - 16 * p, 10 * p, 10 * p);
    ctx.fillStyle = '#fde68a'; // fair skin tone
    ctx.fillRect(x - 4 * p, y - 15 * p, 8 * p, 8 * p);

    if (!isBack) {
      // Signature Gold Aviator Sunglasses with Mirror Glint
      ctx.fillStyle = '#78350f'; // frame outline
      ctx.fillRect(x - 5 * p, y - 13 * p, 10 * p, 4 * p);
      ctx.fillStyle = '#fbbf24'; // gold mirrored lenses
      ctx.fillRect(x - 4 * p, y - 12 * p, 3 * p, 3 * p);
      ctx.fillRect(x + p, y - 12 * p, 3 * p, 3 * p);
      ctx.fillStyle = '#ffffff'; // lens glare glint
      ctx.fillRect(x - 4 * p, y - 12 * p, p, p);
      ctx.fillRect(x + p, y - 12 * p, p, p);
      // Confident smirk
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x - p, y - 8 * p, 2 * p, p);
      ctx.fillRect(x + p, y - 9 * p, p, p);
    }

    // 5. Sleek Styled Jet Black Pompadour Hair
    ctx.fillStyle = '#09090b';
    ctx.fillRect(x - 5 * p, y - 19 * p, 10 * p, 5 * p);
    ctx.fillRect(x - 6 * p, y - 17 * p, 2 * p, 4 * p);
    ctx.fillRect(x + 4 * p, y - 17 * p, 2 * p, 4 * p);
    ctx.fillStyle = '#27272a'; // hair shine line
    ctx.fillRect(x - 3 * p, y - 18 * p, 6 * p, 2 * p);
  }

  // --- ANSHUMAN: Threat Actor (Crimson oversized cowl hoodie, glitch matrix face shadow, red cyber optic eyes) ---
  renderAnshuman(ctx, x, y, p, facing = 'down', time = 0, isMoving = false) {
    const isBack = facing === 'up';
    const isLeft = facing === 'left';
    const isRight = facing === 'right';
    const walkSwing = isMoving ? Math.sin(time * 14) * 2 * p : 0;

    // 1. Dark Combat Treads / Boots
    ctx.fillStyle = '#09090b';
    ctx.fillRect(x - 5 * p, y + 6 * p + (isMoving ? walkSwing : 0), 4 * p, 4 * p);
    ctx.fillRect(x + 1 * p, y + 6 * p - (isMoving ? walkSwing : 0), 4 * p, 4 * p);
    ctx.fillStyle = '#dc2626'; // red boot lace neon trace
    ctx.fillRect(x - 4 * p, y + 7 * p + (isMoving ? walkSwing : 0), 2 * p, p);
    ctx.fillRect(x + 2 * p, y + 7 * p - (isMoving ? walkSwing : 0), 2 * p, p);

    // 2. Dark Charcoal Cargo Pants with Straps
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 5 * p - 1, y + p, 10 * p + 2, 6 * p);
    ctx.fillStyle = '#27272a';
    ctx.fillRect(x - 5 * p, y + p, 10 * p, 5 * p);
    // Red utility strap
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(x - 4 * p, y + 3 * p, 8 * p, p);

    // 3. Oversized Crimson Hacker Hoodie with Shrouded Shoulders
    ctx.fillStyle = '#101820'; // outline
    ctx.fillRect(x - 7 * p - 1, y - 7 * p - 1, 14 * p + 2, 9 * p + 2);
    ctx.fillStyle = '#991b1b'; // crimson hoodie
    ctx.fillRect(x - 7 * p, y - 7 * p, 14 * p, 8 * p);
    ctx.fillStyle = '#dc2626'; // sleeve highlights
    ctx.fillRect(x - 6 * p, y - 6 * p, 2 * p, 6 * p);
    ctx.fillRect(x + 4 * p, y - 6 * p, 2 * p, 6 * p);
    // Fingerless gloved hands peeking out of the oversized sleeves
    ctx.fillStyle = '#18181b';
    ctx.fillRect(x - 6 * p, y, 2 * p, 2 * p);
    ctx.fillRect(x + 4 * p, y, 2 * p, 2 * p);
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(x - 6 * p, y + 2 * p, 2 * p, p);
    ctx.fillRect(x + 4 * p, y + 2 * p, 2 * p, p);
    // Dark chest zip & hacker badge
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(x - p, y - 6 * p, 2 * p, 7 * p);
    ctx.fillStyle = '#22c55e'; // miniature green terminal logo on chest
    ctx.fillRect(x - 3 * p, y - 4 * p, 2 * p, 2 * p);

    // 4. Large Pointed Hood & Shadowed Face
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 7 * p, y - 20 * p, 14 * p, 14 * p);
    ctx.fillStyle = '#7f1d1d'; // hood outer frame
    ctx.fillRect(x - 6 * p, y - 19 * p, 12 * p, 12 * p);
    ctx.fillStyle = '#b91c1c'; // hood rim highlight
    ctx.fillRect(x - 5 * p, y - 19 * p, 10 * p, 2 * p);

    if (!isBack) {
      // Deep Void Face Shadow (Cyberpunk assassin / hacker anonymity)
      ctx.fillStyle = '#09090b';
      ctx.fillRect(x - 4 * p, y - 16 * p, 8 * p, 8 * p);

      // Glowing Neon Red Threat Optic Eyes (with subtle scanline blink)
      const blink = Math.sin(time * 6) > 0.95;
      if (!blink) {
        ctx.fillStyle = '#ef4444'; // glowing red
        ctx.fillRect(x - 3 * p, y - 13 * p, 2 * p, 2 * p);
        ctx.fillRect(x + 1 * p, y - 13 * p, 2 * p, 2 * p);
        ctx.fillStyle = '#fee2e2'; // hot white laser center
        ctx.fillRect(x - 2 * p, y - 13 * p, p, p);
        ctx.fillRect(x + 2 * p, y - 13 * p, p, p);
      }
      // Smug cyber grin / voice modulator grill
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(x - 2 * p, y - 9 * p, 4 * p, p);
    }
  }

  // --- BOUNCER: Security Gateway (Imposing muscular frame, midnight navy suit, gold shield, headset) ---
  renderBouncer(ctx, x, y, p, facing = 'down', time = 0) {
    const isBack = facing === 'up';
    // Broad, heavy military boots
    ctx.fillStyle = '#090d16';
    ctx.fillRect(x - 8 * p, y + 7 * p, 7 * p, 4 * p);
    ctx.fillRect(x + 1 * p, y + 7 * p, 7 * p, 4 * p);
    ctx.fillStyle = '#334155';
    ctx.fillRect(x - 7 * p, y + 8 * p, 5 * p, p);
    ctx.fillRect(x + 2 * p, y + 8 * p, 5 * p, p);

    // Suit trousers (Midnight navy)
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 8 * p - 1, y + 2 * p, 16 * p + 2, 6 * p);
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(x - 8 * p, y + 2 * p, 16 * p, 5 * p);

    // Broad Muscular Suit Torso (Heavy V-taper)
    ctx.fillStyle = '#101820'; // outline
    ctx.fillRect(x - 11 * p - 1, y - 10 * p - 1, 22 * p + 2, 13 * p + 2);
    ctx.fillStyle = '#0f172a'; // midnight navy suit
    ctx.fillRect(x - 11 * p, y - 10 * p, 22 * p, 12 * p);
    ctx.fillStyle = '#1e293b'; // shoulder pads & muscular shading
    ctx.fillRect(x - 10 * p, y - 9 * p, 4 * p, 8 * p);
    ctx.fillRect(x + 6 * p, y - 9 * p, 4 * p, 8 * p);
    // Fists peeking out from the broad sleeves
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(x - 10 * p, y - 2 * p, 3 * p, 3 * p);
    ctx.fillRect(x + 7 * p, y - 2 * p, 3 * p, 3 * p);
    ctx.fillStyle = '#fdba74';
    ctx.fillRect(x - 10 * p, y, 3 * p, p);
    ctx.fillRect(x + 7 * p, y, 3 * p, p);

    if (!isBack) {
      // White dress shirt & Black tie
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x - 3 * p, y - 10 * p, 6 * p, 8 * p);
      ctx.fillStyle = '#09090b';
      ctx.fillRect(x - p, y - 9 * p, 2 * p, 8 * p);
      // Heavy Gold Authentication Gateway Shield Badge
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + 4 * p, y - 6 * p, 4 * p, 4 * p);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 5 * p, y - 5 * p, 2 * p, 2 * p);
    }

    // Head / Strong Square Jawline
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 6 * p, y - 20 * p, 12 * p, 11 * p);
    ctx.fillStyle = '#fed7aa'; // skin
    ctx.fillRect(x - 5 * p, y - 19 * p, 10 * p, 9 * p);

    if (!isBack) {
      // Stern eyes & heavy brow
      ctx.fillStyle = '#451a03'; // heavy brows
      ctx.fillRect(x - 5 * p, y - 16 * p, 3 * p, p);
      ctx.fillRect(x + 2 * p, y - 16 * p, 3 * p, p);
      ctx.fillStyle = '#0f172a'; // eyes
      ctx.fillRect(x - 4 * p, y - 15 * p, 2 * p, 2 * p);
      ctx.fillRect(x + 2 * p, y - 15 * p, 2 * p, 2 * p);
      // Firm neutral mouth
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(x - 2 * p, y - 12 * p, 4 * p, p);
      // Radio Security Headset & Earpiece
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + 5 * p, y - 17 * p, 2 * p, 4 * p);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x + 4 * p, y - 14 * p, p, 5 * p);
    }

    // Clean Military High-and-Tight Buzzcut
    ctx.fillStyle = '#334155';
    ctx.fillRect(x - 6 * p, y - 22 * p, 12 * p, 4 * p);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x - 4 * p, y - 22 * p, 8 * p, 2 * p);
  }

  // --- GUARD: Authorization Guard (Tactical green uniform, beret, heavy authorization shield) ---
  renderGuard(ctx, x, y, p, facing = 'down', time = 0) {
    const isBack = facing === 'up';
    // Combat Boots
    ctx.fillStyle = '#09090b';
    ctx.fillRect(x - 6 * p, y + 6 * p, 5 * p, 4 * p);
    ctx.fillRect(x + 1 * p, y + 6 * p, 5 * p, 4 * p);

    // Forest Camo Slacks
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 6 * p - 1, y + p, 12 * p + 2, 6 * p);
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(x - 6 * p, y + p, 12 * p, 5 * p);

    // Tactical Kevlar Vest & Belt Rig
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 8 * p - 1, y - 8 * p - 1, 16 * p + 2, 10 * p + 2);
    ctx.fillStyle = '#047857'; // emerald tactical jacket
    ctx.fillRect(x - 8 * p, y - 8 * p, 16 * p, 9 * p);
    ctx.fillStyle = '#065f46'; // armored chest plate
    ctx.fillRect(x - 5 * p, y - 6 * p, 10 * p, 6 * p);
    // Hands at the sleeve cuffs
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(x - 8 * p, y - 2 * p, 3 * p, 3 * p);
    ctx.fillRect(x + 5 * p, y - 2 * p, 3 * p, 3 * p);

    if (!isBack) {
      // Golden Authorization Crest
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x - 2 * p, y - 5 * p, 4 * p, 4 * p);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - p, y - 4 * p, 2 * p, 2 * p);
      // Radio Mic Clip on shoulder
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x - 6 * p, y - 7 * p, 2 * p, 3 * p);
    }

    // Head
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 5 * p, y - 17 * p, 10 * p, 10 * p);
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(x - 4 * p, y - 16 * p, 8 * p, 8 * p);

    if (!isBack) {
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(x - 3 * p, y - 13 * p, 2 * p, 2 * p);
      ctx.fillRect(x + p, y - 13 * p, 2 * p, 2 * p);
    }

    // Classic Military Green Beret angled stylishly
    ctx.fillStyle = '#022c22';
    ctx.fillRect(x - 6 * p, y - 20 * p, 14 * p, 5 * p);
    ctx.fillStyle = '#059669';
    ctx.fillRect(x - 5 * p, y - 20 * p, 12 * p, 3 * p);
    ctx.fillStyle = '#fbbf24'; // Beret Brass Badge
    ctx.fillRect(x - 3 * p, y - 19 * p, 2 * p, 2 * p);
  }

  // --- BARTENDER: Purple Bowtie & Crisp Bar Apron ---
  renderBartender(ctx, x, y, p, facing = 'down', time = 0) {
    // Shoes & Trousers
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 5 * p, y + 4 * p, 10 * p, 5 * p);

    // Crisp White Shirt & Plum Velvet Waistcoat
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 6 * p, y - 7 * p, 12 * p, 11 * p);
    ctx.fillStyle = '#6b21a8'; // purple waistcoat
    ctx.fillRect(x - 6 * p, y - 6 * p, 3 * p, 9 * p);
    ctx.fillRect(x + 3 * p, y - 6 * p, 3 * p, 9 * p);
    // Hands (polishing a glass)
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(x - 6 * p, y, 3 * p, 3 * p);
    ctx.fillRect(x + 3 * p, y, 3 * p, 3 * p);
    // Red Bowtie
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x - 2 * p, y - 6 * p, 4 * p, 2 * p);
    ctx.fillStyle = '#f87171';
    ctx.fillRect(x - p, y - 6 * p, 2 * p, 2 * p);

    // Head & Mustache
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(x - 4 * p, y - 15 * p, 8 * p, 8 * p);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 3 * p, y - 12 * p, 2 * p, 2 * p);
    ctx.fillRect(x + p, y - 12 * p, 2 * p, 2 * p);
    // Classic French Bartender Mustache
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(x - 3 * p, y - 9 * p, 6 * p, p);
    ctx.fillRect(x - 4 * p, y - 8 * p, 2 * p, p);
    ctx.fillRect(x + 2 * p, y - 8 * p, 2 * p, p);

    // Neatly Parted Hair
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(x - 5 * p, y - 18 * p, 10 * p, 4 * p);
  }

// --- CLUB PATRON NPCS (Alex, Dex, Sophia) ---
  renderAlex(ctx, x, y, p, facing = 'down', time = 0, isMoving = false) {
    const isBack = facing === 'up';
    const isLeft = facing === 'left';
    const isRight = facing === 'right';
    const walkSwing = isMoving ? Math.sin(time * 14) * 2 * p : 0;
    const danceBounce = Math.sin(time * 8) * 1.5 * p;
    const cy = y + (isMoving ? 0 : danceBounce);

    // 1. Chunky Streetwear Sneakers (Magenta accents, white rubber toes)
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 5 * p, cy + 6 * p + (isMoving ? walkSwing : 0), 4 * p, 4 * p);
    ctx.fillRect(x + 1 * p, cy + 6 * p - (isMoving ? walkSwing : 0), 4 * p, 4 * p);
    ctx.fillStyle = '#ec4899'; // hot pink sneakers
    ctx.fillRect(x - 4 * p, cy + 7 * p + (isMoving ? walkSwing : 0), 3 * p, 2 * p);
    ctx.fillRect(x + 2 * p, cy + 7 * p - (isMoving ? walkSwing : 0), 3 * p, 2 * p);
    ctx.fillStyle = '#ffffff'; // toe cap
    ctx.fillRect(x - 4 * p, cy + 8 * p + (isMoving ? walkSwing : 0), 3 * p, p);
    ctx.fillRect(x + 2 * p, cy + 8 * p - (isMoving ? walkSwing : 0), 3 * p, p);

    // 2. Distressed Indigo Jeans with Neon Cyan Belt
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 5 * p - 1, cy + p, 10 * p + 2, 6 * p);
    ctx.fillStyle = '#1e293b'; // dark denim
    ctx.fillRect(x - 5 * p, cy + p, 10 * p, 5 * p);
    ctx.fillStyle = '#06b6d4'; // glowing cyan rave belt
    ctx.fillRect(x - 5 * p, cy + p, 10 * p, p);

    // 3. Oversized Magenta Rave Hoodie with Cyan Accents
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 6 * p - 1, cy - 7 * p - 1, 12 * p + 2, 9 * p + 2);
    ctx.fillStyle = '#db2777'; // magenta hoodie
    ctx.fillRect(x - 6 * p, cy - 7 * p, 12 * p, 8 * p);
    ctx.fillStyle = '#f472b6'; // shoulder highlights
    ctx.fillRect(x - 5 * p, cy - 6 * p, 3 * p, 2 * p);
    ctx.fillRect(x + 2 * p, cy - 6 * p, 3 * p, 2 * p);

    if (!isBack) {
      // Rave Graphic on Chest
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(x - 2 * p, cy - 4 * p, 4 * p, 3 * p);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - p, cy - 3 * p, 2 * p, p);
      // Cyan wristbands
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(x - 6 * p, cy - p, 2 * p, 2 * p);
      ctx.fillRect(x + 4 * p, cy - p, 2 * p, 2 * p);
    }

    // 3.5 Arms (magenta hoodie sleeves with peach hands)
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 8 * p - 1, cy - 6 * p - 1, 3 * p + 2, 6 * p + 2);
    ctx.fillRect(x + 5 * p - 1, cy - 6 * p - 1, 3 * p + 2, 6 * p + 2);
    ctx.fillStyle = '#db2777';
    ctx.fillRect(x - 8 * p, cy - 6 * p, 3 * p, 5 * p);
    ctx.fillRect(x + 5 * p, cy - 6 * p, 3 * p, 5 * p);
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(x - 7 * p, cy - 2 * p, 2 * p, 2 * p);
    ctx.fillRect(x + 5 * p, cy - 2 * p, 2 * p, 2 * p);

    // 4. Head & Expressive Anime Face
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 5 * p, cy - 16 * p, 10 * p, 10 * p);
    ctx.fillStyle = '#fed7aa'; // warm peach skin
    ctx.fillRect(x - 4 * p, cy - 15 * p, 8 * p, 8 * p);
    ctx.fillStyle = '#fdba74'; // cheek blush
    ctx.fillRect(x - 4 * p, cy - 10 * p, 2 * p, p);
    ctx.fillRect(x + 2 * p, cy - 10 * p, 2 * p, p);

    if (!isBack) {
      // Anime Eyes with Glint
      const eyeX1 = isLeft ? x - 4 * p : x - 3 * p;
      const eyeX2 = isRight ? x + 2 * p : x + p;
      if (!isRight) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(eyeX1, cy - 12 * p, 2 * p, 3 * p);
        ctx.fillStyle = '#ec4899'; // magenta iris shine
        ctx.fillRect(eyeX1, cy - 11 * p, 2 * p, p);
        ctx.fillStyle = '#ffffff'; // twinkle
        ctx.fillRect(eyeX1, cy - 12 * p, p, p);
      }
      if (!isLeft) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(eyeX2, cy - 12 * p, 2 * p, 3 * p);
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(eyeX2, cy - 11 * p, 2 * p, p);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(eyeX2, cy - 12 * p, p, p);
      }
      // Cheerful Open Party Smile
      ctx.fillStyle = '#be185d';
      ctx.fillRect(x - p, cy - 8 * p, 2 * p, 2 * p);
    }

    // 5. Backwards Teal Baseball Cap & Messy Brown Tuft Bangs
    ctx.fillStyle = '#0891b2'; // cap crown
    ctx.fillRect(x - 5 * p, cy - 18 * p, 10 * p, 4 * p);
    ctx.fillStyle = '#06b6d4'; // cap highlight
    ctx.fillRect(x - 4 * p, cy - 18 * p, 8 * p, 2 * p);
    ctx.fillStyle = '#0e7490'; // backwards snap brim
    ctx.fillRect(x - 6 * p, cy - 16 * p, 2 * p, 2 * p);
    // Spiky brown hair tufts peeking under cap
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 5 * p, cy - 14 * p, 2 * p, 2 * p);
    ctx.fillRect(x + 3 * p, cy - 14 * p, 2 * p, 2 * p);
  }

  renderDex(ctx, x, y, p, facing = 'left', time = 0, isMoving = false) {
    const isBack = facing === 'up';
    const isLeft = facing === 'left';
    const isRight = facing === 'right';
    const walkSwing = isMoving ? Math.sin(time * 14) * 2 * p : 0;
    const djBob = Math.sin(time * 10) * 1.8 * p;
    const cy = y + (isMoving ? 0 : djBob);

    // 1. High-top DJ Skate Sneakers (Neon green soles)
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 5 * p, cy + 6 * p + (isMoving ? walkSwing : 0), 4 * p, 4 * p);
    ctx.fillRect(x + 1 * p, cy + 6 * p - (isMoving ? walkSwing : 0), 4 * p, 4 * p);
    ctx.fillStyle = '#22c55e'; // neon green soles
    ctx.fillRect(x - 5 * p, cy + 8 * p + (isMoving ? walkSwing : 0), 4 * p, 2 * p);
    ctx.fillRect(x + 1 * p, cy + 8 * p - (isMoving ? walkSwing : 0), 4 * p, 2 * p);

    // 2. Techwear Cargo Pants with Utility Straps
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 5 * p - 1, cy + p, 10 * p + 2, 6 * p);
    ctx.fillStyle = '#18181b'; // dark charcoal
    ctx.fillRect(x - 5 * p, cy + p, 10 * p, 5 * p);
    ctx.fillStyle = '#27272a'; // knee pads
    ctx.fillRect(x - 4 * p, cy + 3 * p, 2 * p, 2 * p);
    ctx.fillRect(x + 2 * p, cy + 3 * p, 2 * p, 2 * p);

    // 3. Charcoal DJ Tee with Pulsing Green Equalizer Bars
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 6 * p - 1, cy - 7 * p - 1, 12 * p + 2, 9 * p + 2);
    ctx.fillStyle = '#0f172a'; // midnight black tee
    ctx.fillRect(x - 6 * p, cy - 7 * p, 12 * p, 8 * p);

    if (!isBack) {
      // Audio Equalizer visualizer bars (animated heights!)
      const b1 = Math.abs(Math.sin(time * 8)) * 3 * p + p;
      const b2 = Math.abs(Math.cos(time * 9)) * 4 * p + p;
      const b3 = Math.abs(Math.sin(time * 11)) * 3 * p + p;
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(x - 3 * p, cy - 2 * p - b1, p, b1);
      ctx.fillRect(x - p, cy - 2 * p - b2, p, b2);
      ctx.fillRect(x + p, cy - 2 * p - b3, p, b3);
      // Silver chain necklace
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x - 2 * p, cy - 6 * p, 4 * p, p);
    }

    // 3.5 Arms (charcoal tee sleeves with skin-tone hands)
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 8 * p - 1, cy - 6 * p - 1, 3 * p + 2, 6 * p + 2);
    ctx.fillRect(x + 5 * p - 1, cy - 6 * p - 1, 3 * p + 2, 6 * p + 2);
    ctx.fillStyle = '#18181b';
    ctx.fillRect(x - 8 * p, cy - 6 * p, 3 * p, 5 * p);
    ctx.fillRect(x + 5 * p, cy - 6 * p, 3 * p, 5 * p);
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(x - 7 * p, cy - 2 * p, 2 * p, 2 * p);
    ctx.fillRect(x + 5 * p, cy - 2 * p, 2 * p, 2 * p);

    // 4. Head & Expressive Anime Face
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 5 * p, cy - 16 * p, 10 * p, 10 * p);
    ctx.fillStyle = '#fed7aa'; // warm skin tone
    ctx.fillRect(x - 4 * p, cy - 15 * p, 8 * p, 8 * p);

    if (!isBack) {
      // Anime Eyes with Glint
      const eyeX1 = isLeft ? x - 4 * p : x - 3 * p;
      const eyeX2 = isRight ? x + 2 * p : x + p;
      if (!isRight) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(eyeX1, cy - 12 * p, 2 * p, 3 * p);
        ctx.fillStyle = '#22c55e'; // green iris
        ctx.fillRect(eyeX1, cy - 11 * p, 2 * p, p);
        ctx.fillStyle = '#ffffff'; // twinkle
        ctx.fillRect(eyeX1, cy - 12 * p, p, p);
      }
      if (!isLeft) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(eyeX2, cy - 12 * p, 2 * p, 3 * p);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(eyeX2, cy - 11 * p, 2 * p, p);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(eyeX2, cy - 12 * p, p, p);
      }
      // Confident DJ Smirk
      ctx.fillStyle = '#c2410c';
      ctx.fillRect(x - p, cy - 8 * p, 2 * p, p);
      ctx.fillRect(x, cy - 9 * p, p, p); // smirk upturn
    }

    // 5. Spiky Blonde Anime Hair with Shading
    ctx.fillStyle = '#ca8a04'; // dark blonde shadow
    ctx.fillRect(x - 5 * p, cy - 19 * p, 10 * p, 5 * p);
    ctx.fillStyle = '#fde047'; // bright golden blonde bangs
    ctx.fillRect(x - 4 * p, cy - 18 * p, 8 * p, 4 * p);
    ctx.fillRect(x - 2 * p, cy - 20 * p, 4 * p, 2 * p); // spiky tuft
    ctx.fillRect(x + 2 * p, cy - 19 * p, 3 * p, 2 * p);

    // 6. Professional Neon Green DJ Headphones (Large padded cans around ears)
    ctx.fillStyle = '#15803d'; // headband arc
    ctx.fillRect(x - 6 * p, cy - 18 * p, 12 * p, 2 * p);
    ctx.fillStyle = '#22c55e'; // left ear cup
    ctx.fillRect(x - 6 * p, cy - 14 * p, 2 * p, 5 * p);
    ctx.fillStyle = '#22c55e'; // right ear cup
    ctx.fillRect(x + 4 * p, cy - 14 * p, 2 * p, 5 * p);
    ctx.fillStyle = '#0f172a'; // cushion inside
    ctx.fillRect(x - 5 * p, cy - 13 * p, p, 3 * p);
    ctx.fillRect(x + 4 * p, cy - 13 * p, p, 3 * p);
  }

  renderSophia(ctx, x, y, p, facing = 'up', time = 0, isMoving = false) {
    const isBack = facing === 'up';
    const isLeft = facing === 'left';
    const isRight = facing === 'right';
    const walkSwing = isMoving ? Math.sin(time * 14) * 2 * p : 0;
    const sway = Math.sin(time * 4) * 1.0 * p;
    const cy = y + (isMoving ? 0 : sway);

    // 1. Sleek Gold Stiletto Heels
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 4 * p, cy + 7 * p + (isMoving ? walkSwing : 0), 3 * p, 3 * p);
    ctx.fillRect(x + 1 * p, cy + 7 * p - (isMoving ? walkSwing : 0), 3 * p, 3 * p);
    ctx.fillStyle = '#fbbf24'; // gold stilettos
    ctx.fillRect(x - 3 * p, cy + 7 * p + (isMoving ? walkSwing : 0), 2 * p, 2 * p);
    ctx.fillRect(x + 2 * p, cy + 7 * p - (isMoving ? walkSwing : 0), 2 * p, 2 * p);

    // 2. Sparkling Gold Evening Cocktail Gown with Velvet Drape & Slit
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 5 * p - 1, cy - 7 * p - 1, 10 * p + 2, 15 * p + 2);
    ctx.fillStyle = '#b45309'; // rich gold base
    ctx.fillRect(x - 5 * p, cy - 7 * p, 10 * p, 14 * p);
    ctx.fillStyle = '#f59e0b'; // amber satin sheen
    ctx.fillRect(x - 4 * p, cy - 6 * p, 8 * p, 12 * p);
    // Gown Shimmer Sequins
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x - 2 * p, cy - 3 * p, p, p);
    ctx.fillRect(x + 2 * p, cy + p, p, p);
    ctx.fillRect(x - p, cy + 4 * p, p, p);

    if (!isBack) {
      // Diamond Necklace & Gold Bangle
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 2 * p, cy - 6 * p, 4 * p, p);
      ctx.fillStyle = '#fbbf24'; // gold bangle on right wrist
      ctx.fillRect(x + 4 * p, cy - p, 2 * p, p);
      // Crystal Champagne Flute held gracefully in left hand
      ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
      ctx.fillRect(x - 6 * p, cy - 3 * p, 2 * p, 4 * p);
      ctx.fillStyle = '#fef08a'; // champagne inside glass
      ctx.fillRect(x - 6 * p, cy - 2 * p, 2 * p, 2 * p);
      // Bare arms resting elegantly at the sides
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(x - 6 * p, cy - 5 * p, 2 * p, 2 * p);
      ctx.fillRect(x + 4 * p, cy - 5 * p, 2 * p, 4 * p);
    }

    // 3. Head & Beautiful Anime Face
    ctx.fillStyle = '#101820';
    ctx.fillRect(x - 5 * p, cy - 16 * p, 10 * p, 10 * p);
    ctx.fillStyle = '#fde68a'; // porcelain fair skin
    ctx.fillRect(x - 4 * p, cy - 15 * p, 8 * p, 8 * p);
    ctx.fillStyle = '#fca5a5'; // soft blush
    ctx.fillRect(x - 4 * p, cy - 10 * p, 2 * p, p);
    ctx.fillRect(x + 2 * p, cy - 10 * p, 2 * p, p);

    if (!isBack) {
      // Elegant Anime Eyes with Eyelashes & Violet Shine
      const eyeX1 = isLeft ? x - 4 * p : x - 3 * p;
      const eyeX2 = isRight ? x + 2 * p : x + p;
      if (!isRight) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(eyeX1, cy - 12 * p, 2 * p, 3 * p);
        ctx.fillRect(eyeX1 - p, cy - 13 * p, 3 * p, p); // top lash
        ctx.fillStyle = '#8b5cf6'; // violet iris shine
        ctx.fillRect(eyeX1, cy - 11 * p, 2 * p, p);
        ctx.fillStyle = '#ffffff'; // twinkle
        ctx.fillRect(eyeX1, cy - 12 * p, p, p);
      }
      if (!isLeft) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(eyeX2, cy - 12 * p, 2 * p, 3 * p);
        ctx.fillRect(eyeX2, cy - 13 * p, 3 * p, p); // top lash
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(eyeX2, cy - 11 * p, 2 * p, p);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(eyeX2, cy - 12 * p, p, p);
      }
      // Ruby Red Lips
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(x - p, cy - 8 * p, 2 * p, p);
    }

    // 4. Elegant High Auburn Hair Bun & Gold Tiara Pin
    ctx.fillStyle = '#451a03'; // auburn dark shadow
    ctx.fillRect(x - 5 * p, cy - 19 * p, 10 * p, 5 * p);
    ctx.fillStyle = '#78350f'; // auburn hair
    ctx.fillRect(x - 4 * p, cy - 18 * p, 8 * p, 4 * p);
    // High chic hair bun
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x - 3 * p, cy - 22 * p, 6 * p, 4 * p);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 2 * p, cy - 21 * p, 4 * p, 3 * p);
    // Sparkling Gold Tiara Pin
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x - p, cy - 22 * p, 2 * p, 2 * p);
    ctx.fillStyle = '#ffffff'; // diamond sparkle
    ctx.fillRect(x - p, cy - 22 * p, p, p);
  }

  renderGenericNPC(ctx, x, y, p) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 5 * p, y + 4 * p, 10 * p, 4 * p);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x - 5 * p, y - 6 * p, 10 * p, 10 * p);
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(x - 4 * p, y - 14 * p, 8 * p, 8 * p);
  }

  // =========================================================================
  // POKÉMON BATTLE SCREEN SPRITES (Side/Front View & Player Back View)
  // =========================================================================

  /**
   * Draw Opponent Front View Sprite (Bouncer, Guard, Anshuman, Vipul, Bartender, Yash, Alex, Dex, Sophia)
   */
  renderBattleFrontSprite(ctx, charId, x, y, scale = 4) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const p = scale;

    switch (charId) {
      case 'bouncer': {
        // Muscular Bouncer Front View (Broad navy suit, white cuffs, heavy clenched fists, gold badge)
        // Body and arms with transparent background

        // Navy Suit Jacket - Torso
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - 9 * p, y - 11 * p, 18 * p, 24 * p);

        // Broad Shoulder Lapels & Chest Structure
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x - 9 * p, y - 11 * p, 4 * p, 18 * p);
        ctx.fillRect(x + 5 * p, y - 11 * p, 4 * p, 18 * p);

        // White Crisp Dress Shirt & Black Tie
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x - 4 * p, y - 11 * p, 8 * p, 16 * p);
        ctx.fillStyle = '#09090b'; // black tie
        ctx.fillRect(x - 2 * p, y - 9 * p, 4 * p, 15 * p);
        ctx.fillStyle = '#e2e8f0'; // tie clip
        ctx.fillRect(x - 2 * p, y - p, 4 * p, p);

        // Gold Authentication Shield Badge
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x + 4 * p, y - 6 * p, 5 * p, 6 * p);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x + 5 * p, y - 5 * p, 3 * p, 4 * p);

        // Left Arm (Viewer's Left) - Muscular Navy Sleeve
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - 16 * p, y - 11 * p, 7 * p, 19 * p);
        ctx.fillStyle = '#1e293b'; // shoulder highlight
        ctx.fillRect(x - 16 * p, y - 11 * p, 6 * p, 3 * p);
        ctx.fillStyle = '#020617'; // inner arm seam separating from torso
        ctx.fillRect(x - 10 * p, y - 9 * p, p, 17 * p);

        // Right Arm (Viewer's Right) - Muscular Navy Sleeve
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 9 * p, y - 11 * p, 7 * p, 19 * p);
        ctx.fillStyle = '#1e293b'; // shoulder highlight
        ctx.fillRect(x + 10 * p, y - 11 * p, 6 * p, 3 * p);
        ctx.fillStyle = '#020617'; // inner arm seam
        ctx.fillRect(x + 9 * p, y - 9 * p, p, 17 * p);

        // White Shirt Cuffs peeking from sleeves
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 15 * p, y + 8 * p, 5 * p, 2 * p);
        ctx.fillRect(x + 10 * p, y + 8 * p, 5 * p, 2 * p);

        // Left Hand - Heavy Muscular Fist
        // Left Hand
        ctx.fillStyle = '#fed7aa'; // skin tone
        ctx.fillRect(x - 15 * p, y + 10 * p, 5 * p, 6 * p);
        ctx.fillStyle = '#fdba74'; // knuckle shading
        ctx.fillRect(x - 15 * p, y + 12 * p, 4 * p, p);
        ctx.fillRect(x - 15 * p, y + 14 * p, 4 * p, p);
        ctx.fillStyle = '#ea580c'; // thumb crease
        ctx.fillRect(x - 11 * p, y + 11 * p, p, 3 * p);

        // Right Hand - Heavy Muscular Fist
        // Right Hand
        ctx.fillStyle = '#fed7aa'; // skin tone
        ctx.fillRect(x + 10 * p, y + 10 * p, 5 * p, 6 * p);
        ctx.fillStyle = '#fdba74'; // knuckle shading
        ctx.fillRect(x + 11 * p, y + 12 * p, 4 * p, p);
        ctx.fillRect(x + 11 * p, y + 14 * p, 4 * p, p);
        ctx.fillStyle = '#ea580c'; // thumb crease
        ctx.fillRect(x + 10 * p, y + 11 * p, p, 3 * p);

        // Navy Trousers & Belt
        ctx.fillStyle = '#020617'; // belt
        ctx.fillRect(x - 9 * p, y + 13 * p, 18 * p, 2 * p);
        ctx.fillStyle = '#d97706'; // gold buckle
        ctx.fillRect(x - 2 * p, y + 13 * p, 4 * p, 2 * p);
        ctx.fillStyle = '#090d16'; // trousers
        ctx.fillRect(x - 8 * p, y + 15 * p, 16 * p, 6 * p);

        // Strong Jawline Head
        ctx.fillStyle = '#101820'; // head outline
        ctx.fillRect(x - 9 * p, y - 29 * p, 18 * p, 19 * p);
        ctx.fillStyle = '#fed7aa'; // skin
        ctx.fillRect(x - 8 * p, y - 28 * p, 16 * p, 17 * p);
        ctx.fillStyle = '#fdba74'; // jaw shadow
        ctx.fillRect(x - 8 * p, y - 15 * p, 16 * p, 4 * p);

        // Heavy Stern Eyebrows & Eyes
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x - 7 * p, y - 23 * p, 5 * p, 2 * p);
        ctx.fillRect(x + 2 * p, y - 23 * p, 5 * p, 2 * p);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - 6 * p, y - 20 * p, 3 * p, 3 * p);
        ctx.fillRect(x + 3 * p, y - 20 * p, 3 * p, 3 * p);
        ctx.fillStyle = '#ffffff'; // eye gleam
        ctx.fillRect(x - 5 * p, y - 20 * p, p, p);
        ctx.fillRect(x + 4 * p, y - 20 * p, p, p);

        // Firm Mouth
        ctx.fillStyle = '#9a3412';
        ctx.fillRect(x - 4 * p, y - 14 * p, 8 * p, 2 * p);

        // Headset & Wire
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 8 * p, y - 24 * p, 3 * p, 6 * p);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x + 7 * p, y - 18 * p, p, 12 * p);

        // Military High-and-Tight Buzzcut Hair
        ctx.fillStyle = '#334155';
        ctx.fillRect(x - 9 * p, y - 32 * p, 18 * p, 5 * p);
        ctx.fillStyle = '#475569';
        ctx.fillRect(x - 7 * p, y - 32 * p, 14 * p, 2 * p);
        break;
      }
      case 'guard': {
        // Security Guard in Beret & Kevlar Tactical Rig with Tactical Gloves

        // Forest Camo/Olive Uniform - Torso
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(x - 8 * p, y - 9 * p, 16 * p, 23 * p);

        // Tactical Kevlar Vest
        ctx.fillStyle = '#022c22';
        ctx.fillRect(x - 7 * p, y - 8 * p, 14 * p, 18 * p);
        ctx.fillStyle = '#064e3b'; // vest strap grooves
        ctx.fillRect(x - 5 * p, y - 2 * p, 10 * p, p);
        ctx.fillRect(x - 5 * p, y + 3 * p, 10 * p, p);

        // Gold Authorization Star Shield
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x - 3 * p, y - 4 * p, 6 * p, 7 * p);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - p, y - 2 * p, 2 * p, 3 * p);

        // Left Arm - Olive Sleeve & Tactical Elbow Pad
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(x - 15 * p, y - 9 * p, 7 * p, 18 * p);
        ctx.fillStyle = '#047857'; // shoulder highlight
        ctx.fillRect(x - 15 * p, y - 9 * p, 6 * p, 3 * p);
        ctx.fillStyle = '#022c22'; // reinforced elbow tactical pad
        ctx.fillRect(x - 15 * p, y + 2 * p, 5 * p, 4 * p);
        ctx.fillStyle = '#011c14'; // inner arm seam
        ctx.fillRect(x - 9 * p, y - 7 * p, p, 16 * p);

        // Right Arm - Olive Sleeve & Elbow Pad
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(x + 8 * p, y - 9 * p, 7 * p, 18 * p);
        ctx.fillStyle = '#047857'; // shoulder highlight
        ctx.fillRect(x + 9 * p, y - 9 * p, 6 * p, 3 * p);
        ctx.fillStyle = '#022c22'; // reinforced elbow tactical pad
        ctx.fillRect(x + 10 * p, y + 2 * p, 5 * p, 4 * p);
        ctx.fillStyle = '#011c14'; // inner arm seam
        ctx.fillRect(x + 8 * p, y - 7 * p, p, 16 * p);

        // Tactical Watch on Left Wrist
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - 14 * p, y + 8 * p, 5 * p, 2 * p);
        ctx.fillStyle = '#38bdf8'; // digital watch face
        ctx.fillRect(x - 13 * p, y + 8 * p, 2 * p, p);

        // Right Wrist Strap
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 9 * p, y + 8 * p, 5 * p, 2 * p);

        // Left Tactical Combat Glove
        ctx.fillStyle = '#1e293b'; // glove body
        ctx.fillRect(x - 14 * p, y + 10 * p, 5 * p, 6 * p);
        ctx.fillStyle = '#475569'; // padded knuckle ridge
        ctx.fillRect(x - 14 * p, y + 12 * p, 4 * p, 2 * p);
        ctx.fillStyle = '#0f172a'; // finger separation
        ctx.fillRect(x - 12 * p, y + 14 * p, p, 2 * p);

        // Right Tactical Combat Glove
        ctx.fillStyle = '#1e293b'; // glove body
        ctx.fillRect(x + 9 * p, y + 10 * p, 5 * p, 6 * p);
        ctx.fillStyle = '#475569'; // padded knuckle ridge
        ctx.fillRect(x + 10 * p, y + 12 * p, 4 * p, 2 * p);
        ctx.fillStyle = '#0f172a'; // finger separation
        ctx.fillRect(x + 11 * p, y + 14 * p, p, 2 * p);

        // Tactical Utility Belt & Pants
        ctx.fillStyle = '#022c22';
        ctx.fillRect(x - 8 * p, y + 14 * p, 16 * p, 3 * p);
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(x - 7 * p, y + 17 * p, 14 * p, 4 * p);

        // Head
        ctx.fillStyle = '#101820';
        ctx.fillRect(x - 8 * p, y - 27 * p, 16 * p, 18 * p);
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(x - 7 * p, y - 26 * p, 14 * p, 16 * p);
        // Alert Eyes
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(x - 5 * p, y - 18 * p, 3 * p, 3 * p);
        ctx.fillRect(x + 2 * p, y - 18 * p, 3 * p, 3 * p);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 4 * p, y - 18 * p, p, p);
        ctx.fillRect(x + 3 * p, y - 18 * p, p, p);

        // Angled Green Military Beret with Brass Badge
        ctx.fillStyle = '#022c22';
        ctx.fillRect(x - 11 * p, y - 33 * p, 22 * p, 8 * p);
        ctx.fillStyle = '#059669';
        ctx.fillRect(x - 9 * p, y - 32 * p, 18 * p, 5 * p);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x - 6 * p, y - 30 * p, 4 * p, 4 * p);
        break;
      }
      case 'anshuman': {
        // Anshuman Front View: Oversized Crimson Hoodie, techwear cuffs, cyber wristband, hacker fingerless gloves with skin fingers

        // Crimson Hoodie - Torso
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(x - 8 * p, y - 9 * p, 16 * p, 23 * p);
        ctx.fillStyle = '#7f1d1d'; // kangaroo pocket shadow
        ctx.fillRect(x - 7 * p, y + 4 * p, 14 * p, 8 * p);
        ctx.fillStyle = '#dc2626'; // pocket seam highlight
        ctx.fillRect(x - 7 * p, y + 4 * p, 14 * p, p);

        // Hood Folds framing head
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(x - 12 * p, y - 30 * p, 24 * p, 22 * p);

        // Left Arm - Oversized Baggy Hoodie Sleeve
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(x - 15 * p, y - 9 * p, 7 * p, 18 * p);
        ctx.fillStyle = '#dc2626'; // sleeve fold highlight
        ctx.fillRect(x - 15 * p, y - 8 * p, 5 * p, 3 * p);
        ctx.fillStyle = '#7f1d1d'; // elbow fabric crease
        ctx.fillRect(x - 15 * p, y + 3 * p, 6 * p, 2 * p);
        ctx.fillStyle = '#450a0a'; // inner shadow separating arm from body
        ctx.fillRect(x - 9 * p, y - 7 * p, p, 16 * p);

        // Right Arm - Oversized Baggy Hoodie Sleeve
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(x + 8 * p, y - 9 * p, 7 * p, 18 * p);
        ctx.fillStyle = '#dc2626'; // sleeve fold highlight
        ctx.fillRect(x + 10 * p, y - 8 * p, 5 * p, 3 * p);
        ctx.fillStyle = '#7f1d1d'; // elbow fabric crease
        ctx.fillRect(x + 9 * p, y + 3 * p, 6 * p, 2 * p);
        ctx.fillStyle = '#450a0a'; // inner shadow
        ctx.fillRect(x + 8 * p, y - 7 * p, p, 16 * p);

        // Ribbed Sleeve Cuffs
        ctx.fillStyle = '#590d0d';
        ctx.fillRect(x - 15 * p, y + 8 * p, 6 * p, 2 * p);
        ctx.fillRect(x + 9 * p, y + 8 * p, 6 * p, 2 * p);

        // Glowing Cyan Cyber Hacker Wristband on Left Wrist
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(x - 14 * p, y + 9 * p, 4 * p, p);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 13 * p, y + 9 * p, 2 * p, p);

        // Left Hand - Fingerless Tactical Hacker Glove with Exposed Fingers & Thumb
        ctx.fillStyle = '#18181b'; // fingerless glove body
        ctx.fillRect(x - 14 * p, y + 10 * p, 5 * p, 3 * p);
        ctx.fillStyle = '#fed7aa'; // exposed fingers skin
        ctx.fillRect(x - 14 * p, y + 13 * p, 4 * p, 3 * p);
        ctx.fillStyle = '#ea580c'; // knuckles & thumb
        ctx.fillRect(x - 10 * p, y + 11 * p, p, 3 * p);
        ctx.fillRect(x - 13 * p, y + 14 * p, p, 2 * p);
        ctx.fillRect(x - 11 * p, y + 14 * p, p, 2 * p);

        // Right Hand - Fingerless Tactical Hacker Glove
        ctx.fillStyle = '#18181b'; // fingerless glove body
        ctx.fillRect(x + 9 * p, y + 10 * p, 5 * p, 3 * p);
        ctx.fillStyle = '#fed7aa'; // exposed fingers skin
        ctx.fillRect(x + 10 * p, y + 13 * p, 4 * p, 3 * p);
        ctx.fillStyle = '#ea580c'; // knuckles & thumb
        ctx.fillRect(x + 9 * p, y + 11 * p, p, 3 * p);
        ctx.fillRect(x + 11 * p, y + 14 * p, p, 2 * p);
        ctx.fillRect(x + 13 * p, y + 14 * p, p, 2 * p);

        // Dark Cargo Pants
        ctx.fillStyle = '#18181b';
        ctx.fillRect(x - 8 * p, y + 14 * p, 16 * p, 7 * p);

        // Dark Shadowed Void Mask
        ctx.fillStyle = '#09090b';
        ctx.fillRect(x - 8 * p, y - 26 * p, 16 * p, 16 * p);

        // Glowing Red Optic Sensors / Cyber Eyes
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x - 6 * p, y - 19 * p, 4 * p, 3 * p);
        ctx.fillRect(x + 2 * p, y - 19 * p, 4 * p, 3 * p);
        ctx.fillStyle = '#fee2e2'; // hot white laser pupil
        ctx.fillRect(x - 4 * p, y - 19 * p, 2 * p, 2 * p);
        ctx.fillRect(x + 3 * p, y - 19 * p, 2 * p, 2 * p);

        // Mischievous smirk
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x - 3 * p, y - 13 * p, 6 * p, 2 * p);
        ctx.fillRect(x + 2 * p, y - 14 * p, 2 * p, 2 * p);
        break;
      }
      case 'vipul': {
        // Vipul Front View: Velvet Amber Blazer, White Shirt, Red Silk Tie, Gold Rolex Watch, Manicured Hands

        // Velvet Blazer - Torso
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x - 8 * p, y - 9 * p, 16 * p, 23 * p);

        // White Shirt & Silk Red Tie
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 4 * p, y - 9 * p, 8 * p, 16 * p);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x - 2 * p, y - 7 * p, 4 * p, 14 * p);
        ctx.fillStyle = '#991b1b'; // tie knot
        ctx.fillRect(x - 2 * p, y - 8 * p, 4 * p, 3 * p);

        // Velvet Blazer Lapels
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x - 8 * p, y - 8 * p, 4 * p, 16 * p);
        ctx.fillRect(x + 4 * p, y - 8 * p, 4 * p, 16 * p);

        // Left Arm - Amber Velvet Sleeve
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x - 15 * p, y - 9 * p, 7 * p, 18 * p);
        ctx.fillStyle = '#f59e0b'; // shoulder highlight
        ctx.fillRect(x - 15 * p, y - 9 * p, 5 * p, 3 * p);
        ctx.fillStyle = '#78350f'; // inner arm seam
        ctx.fillRect(x - 9 * p, y - 7 * p, p, 16 * p);

        // Right Arm - Amber Velvet Sleeve
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + 8 * p, y - 9 * p, 7 * p, 18 * p);
        ctx.fillStyle = '#f59e0b'; // shoulder highlight
        ctx.fillRect(x + 10 * p, y - 9 * p, 5 * p, 3 * p);
        ctx.fillStyle = '#78350f'; // inner arm seam
        ctx.fillRect(x + 8 * p, y - 7 * p, p, 16 * p);

        // French Cuffs & Luxury Gold Rolex Watch on Left Wrist
        ctx.fillStyle = '#ffffff'; // white cuff peeking out (right wrist only - left is fully covered by the Rolex below)
        ctx.fillRect(x + 9 * p, y + 8 * p, 5 * p, 2 * p);
        ctx.fillStyle = '#fbbf24'; // Gold Rolex Watch Bezel & Strap
        ctx.fillRect(x - 14 * p, y + 8 * p, 5 * p, 2 * p);
        ctx.fillStyle = '#ffffff'; // Rolex diamond glint
        ctx.fillRect(x - 13 * p, y + 8 * p, 2 * p, p);
        ctx.fillStyle = '#fbbf24'; // Gold cufflink on right wrist
        ctx.fillRect(x + 10 * p, y + 9 * p, 2 * p, p);

        // Left Hand - Manicured VIP Hand with articulated fingers & thumb
        ctx.fillStyle = '#fde68a'; // skin
        ctx.fillRect(x - 14 * p, y + 10 * p, 5 * p, 6 * p);
        ctx.fillStyle = '#f59e0b'; // knuckles & finger separation
        ctx.fillRect(x - 13 * p, y + 12 * p, 3 * p, p);
        ctx.fillRect(x - 10 * p, y + 11 * p, p, 3 * p); // thumb
        ctx.fillRect(x - 13 * p, y + 14 * p, 3 * p, p);

        // Right Hand - Manicured VIP Hand
        ctx.fillStyle = '#fde68a'; // skin
        ctx.fillRect(x + 9 * p, y + 10 * p, 5 * p, 6 * p);
        ctx.fillStyle = '#f59e0b'; // knuckles & finger separation
        ctx.fillRect(x + 10 * p, y + 12 * p, 3 * p, p);
        ctx.fillRect(x + 9 * p, y + 11 * p, p, 3 * p); // thumb
        ctx.fillRect(x + 10 * p, y + 14 * p, 3 * p, p);

        // Charcoal Tailored Slacks & Designer Belt
        ctx.fillStyle = '#18181b'; // belt
        ctx.fillRect(x - 8 * p, y + 13 * p, 16 * p, 2 * p);
        ctx.fillStyle = '#fbbf24'; // gold designer buckle
        ctx.fillRect(x - 2 * p, y + 13 * p, 4 * p, 2 * p);
        ctx.fillStyle = '#27272a'; // slacks
        ctx.fillRect(x - 7 * p, y + 15 * p, 14 * p, 6 * p);

        // Head
        ctx.fillStyle = '#101820';
        ctx.fillRect(x - 8 * p, y - 27 * p, 16 * p, 18 * p);
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(x - 7 * p, y - 26 * p, 14 * p, 16 * p);

        // Gold Aviators
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x - 7 * p, y - 20 * p, 14 * p, 7 * p);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x - 6 * p, y - 19 * p, 5 * p, 5 * p);
        ctx.fillRect(x + p, y - 19 * p, 5 * p, 5 * p);
        ctx.fillStyle = '#ffffff'; // glare
        ctx.fillRect(x - 6 * p, y - 19 * p, 2 * p, 2 * p);
        ctx.fillRect(x + p, y - 19 * p, 2 * p, 2 * p);

        // Sleek styled black hair
        ctx.fillStyle = '#09090b';
        ctx.fillRect(x - 9 * p, y - 32 * p, 18 * p, 7 * p);
        ctx.fillStyle = '#27272a';
        ctx.fillRect(x - 6 * p, y - 31 * p, 12 * p, 2 * p);
        break;
      }
      case 'bartender': {
        // Bartender Front View: White shirt with rolled-up sleeves, velvet waistcoat, red bowtie, curled mustache, poised hands

        // Crisp White Dress Shirt Torso
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x - 8 * p, y - 9 * p, 16 * p, 23 * p);

        // Plum / Purple Velvet Waistcoat
        ctx.fillStyle = '#581c87'; // rich plum shadow
        ctx.fillRect(x - 8 * p, y - 9 * p, 5 * p, 22 * p);
        ctx.fillRect(x + 3 * p, y - 9 * p, 5 * p, 22 * p);
        ctx.fillStyle = '#7e22ce'; // bright purple waistcoat fabric
        ctx.fillRect(x - 7 * p, y - 8 * p, 3 * p, 20 * p);
        ctx.fillRect(x + 4 * p, y - 8 * p, 3 * p, 20 * p);

        // Gold Waistcoat Buttons
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x - 5 * p, y - 3 * p, 2 * p, 2 * p);
        ctx.fillRect(x - 5 * p, y + 2 * p, 2 * p, 2 * p);
        ctx.fillRect(x - 5 * p, y + 7 * p, 2 * p, 2 * p);

        // Left Arm - White Shirt Sleeve Rolled Up + Sleeve Garter + Forearm
        ctx.fillStyle = '#f8fafc'; // upper sleeve
        ctx.fillRect(x - 15 * p, y - 9 * p, 7 * p, 9 * p);
        ctx.fillStyle = '#4c1d95'; // sleeve garter
        ctx.fillRect(x - 15 * p, y, 6 * p, 2 * p);
        ctx.fillStyle = '#f1f5f9'; // rolled-up shirt cuff
        ctx.fillRect(x - 15 * p, y + 2 * p, 6 * p, 3 * p);
        // Exposed Forearm & Skin
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(x - 14 * p, y + 5 * p, 5 * p, 5 * p);
        ctx.fillStyle = '#090d16'; // inner arm seam
        ctx.fillRect(x - 9 * p, y - 7 * p, p, 16 * p);

        // Right Arm - White Shirt Sleeve Rolled Up + Forearm
        ctx.fillStyle = '#f8fafc'; // upper sleeve
        ctx.fillRect(x + 8 * p, y - 9 * p, 7 * p, 9 * p);
        ctx.fillStyle = '#4c1d95'; // sleeve garter
        ctx.fillRect(x + 9 * p, y, 6 * p, 2 * p);
        ctx.fillStyle = '#f1f5f9'; // rolled-up cuff
        ctx.fillRect(x + 9 * p, y + 2 * p, 6 * p, 3 * p);
        // Exposed Forearm & Skin
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(x + 9 * p, y + 5 * p, 5 * p, 5 * p);
        ctx.fillStyle = '#090d16'; // inner arm seam
        ctx.fillRect(x + 8 * p, y - 7 * p, p, 16 * p);

        // Left Hand - Poised Hand Holding Crystal Cocktail Shaker
        ctx.fillStyle = '#090d16'; // outline
        ctx.fillRect(x - 16 * p, y + 9 * p, 7 * p, 9 * p);
        ctx.fillStyle = '#94a3b8'; // stainless steel shaker top
        ctx.fillRect(x - 16 * p, y + 9 * p, 4 * p, 9 * p);
        ctx.fillStyle = '#cbd5e1'; // metallic shine highlight
        ctx.fillRect(x - 15 * p, y + 10 * p, p, 7 * p);
        ctx.fillStyle = '#fed7aa'; // fingers wrapped around shaker
        ctx.fillRect(x - 13 * p, y + 11 * p, 3 * p, 2 * p);
        ctx.fillRect(x - 13 * p, y + 14 * p, 3 * p, 2 * p);
        ctx.fillStyle = '#ea580c'; // knuckles
        ctx.fillRect(x - 11 * p, y + 12 * p, p, p);
        ctx.fillRect(x - 11 * p, y + 15 * p, p, p);

        // Right Hand - Welcoming Poised Bartender Hand with Fingers
        ctx.fillStyle = '#fed7aa'; // skin
        ctx.fillRect(x + 9 * p, y + 10 * p, 5 * p, 6 * p);
        ctx.fillStyle = '#fdba74'; // knuckles & fingers
        ctx.fillRect(x + 9 * p, y + 11 * p, p, 3 * p); // thumb
        ctx.fillRect(x + 10 * p, y + 12 * p, 3 * p, p);
        ctx.fillRect(x + 10 * p, y + 14 * p, 3 * p, p);

        // Apron / Dark Slacks
        ctx.fillStyle = '#18181b';
        ctx.fillRect(x - 8 * p, y + 14 * p, 16 * p, 7 * p);

        // Elegant Silk Red Bowtie
        ctx.fillStyle = '#991b1b'; // bowtie knot outline
        ctx.fillRect(x - 4 * p, y - 9 * p, 8 * p, 4 * p);
        ctx.fillStyle = '#dc2626'; // ruby red wings
        ctx.fillRect(x - 5 * p, y - 9 * p, 3 * p, 4 * p);
        ctx.fillRect(x + 2 * p, y - 9 * p, 3 * p, 4 * p);
        ctx.fillStyle = '#fca5a5'; // silk sheen highlight
        ctx.fillRect(x - 4 * p, y - 8 * p, p, 2 * p);
        ctx.fillRect(x + 3 * p, y - 8 * p, p, 2 * p);
        ctx.fillStyle = '#b91c1c'; // center knot
        ctx.fillRect(x - p, y - 8 * p, 2 * p, 3 * p);

        // Head & Neck
        ctx.fillStyle = '#101820'; // head outline
        ctx.fillRect(x - 8 * p, y - 28 * p, 16 * p, 19 * p);
        ctx.fillStyle = '#fed7aa'; // skin
        ctx.fillRect(x - 7 * p, y - 27 * p, 14 * p, 17 * p);
        ctx.fillStyle = '#fbcfe8'; // gentle cheek blush
        ctx.fillRect(x - 6 * p, y - 17 * p, 2 * p, p);
        ctx.fillRect(x + 4 * p, y - 17 * p, 2 * p, p);

        // Calm Welcoming Bartender Eyes
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(x - 5 * p, y - 20 * p, 3 * p, 3 * p);
        ctx.fillRect(x + 2 * p, y - 20 * p, 3 * p, 3 * p);
        ctx.fillStyle = '#ffffff'; // eye gleam
        ctx.fillRect(x - 5 * p, y - 20 * p, p, p);
        ctx.fillRect(x + 2 * p, y - 20 * p, p, p);

        // Dapper Curled French Mustache
        ctx.fillStyle = '#3b0764'; // dark plum/auburn mustache
        ctx.fillRect(x - 5 * p, y - 15 * p, 10 * p, 2 * p);
        ctx.fillRect(x - 6 * p, y - 14 * p, 2 * p, 2 * p);
        ctx.fillRect(x + 4 * p, y - 14 * p, 2 * p, 2 * p);
        ctx.fillRect(x - 7 * p, y - 16 * p, 2 * p, 2 * p); // curled tips
        ctx.fillRect(x + 5 * p, y - 16 * p, 2 * p, 2 * p);

        // Friendly Smile under mustache
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(x - 2 * p, y - 12 * p, 4 * p, p);

        // Neatly Pomaded Side-Parted Hair
        ctx.fillStyle = '#3b0764'; // hair base
        ctx.fillRect(x - 9 * p, y - 33 * p, 18 * p, 8 * p);
        ctx.fillStyle = '#581c87'; // hair highlights
        ctx.fillRect(x - 7 * p, y - 32 * p, 13 * p, 3 * p);
        ctx.fillStyle = '#a855f7'; // pomade shine line
        ctx.fillRect(x - 4 * p, y - 31 * p, 8 * p, p);
        break;
      }
      case 'alex': {
        // Partygoer Alex Front View: Neon magenta tee, cyan wristbands, backward cap, dancing hands

        // Neon Magenta Club Tee - Torso
        ctx.fillStyle = '#db2777';
        ctx.fillRect(x - 8 * p, y - 9 * p, 16 * p, 22 * p);
        ctx.fillStyle = '#be185d';
        ctx.fillRect(x - 7 * p, y - 8 * p, 4 * p, 16 * p);

        // Left Arm - Magenta short sleeve, exposed skin forearm, cyan wristband, party hand
        ctx.fillStyle = '#db2777';
        ctx.fillRect(x - 14 * p, y - 9 * p, 6 * p, 8 * p);
        ctx.fillStyle = '#fed7aa'; // skin forearm
        ctx.fillRect(x - 14 * p, y - p, 5 * p, 9 * p);
        ctx.fillStyle = '#06b6d4'; // cyan wristband
        ctx.fillRect(x - 14 * p, y + 6 * p, 5 * p, 2 * p);
        ctx.fillStyle = '#090d16'; // inner arm seam
        ctx.fillRect(x - 9 * p, y - 7 * p, p, 15 * p);

        // Right Arm - Magenta sleeve, cyan wristband, dancing hand
        ctx.fillStyle = '#db2777';
        ctx.fillRect(x + 8 * p, y - 9 * p, 6 * p, 8 * p);
        ctx.fillStyle = '#fed7aa'; // skin forearm
        ctx.fillRect(x + 9 * p, y - p, 5 * p, 9 * p);
        ctx.fillStyle = '#06b6d4'; // cyan wristband
        ctx.fillRect(x + 9 * p, y + 6 * p, 5 * p, 2 * p);
        ctx.fillStyle = '#090d16'; // inner arm seam
        ctx.fillRect(x + 8 * p, y - 7 * p, p, 15 * p);

        // Left Hand - Fingers in relaxed party pose
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(x - 14 * p, y + 8 * p, 5 * p, 6 * p);
        ctx.fillStyle = '#fdba74';
        ctx.fillRect(x - 13 * p, y + 10 * p, 3 * p, p);
        ctx.fillRect(x - 10 * p, y + 9 * p, p, 3 * p);

        // Right Hand - Dancing gesture
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(x + 9 * p, y + 8 * p, 5 * p, 6 * p);
        ctx.fillStyle = '#fdba74';
        ctx.fillRect(x + 10 * p, y + 10 * p, 3 * p, p);
        ctx.fillRect(x + 9 * p, y + 9 * p, p, 3 * p);

        // Dark Jeans
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x - 8 * p, y + 13 * p, 16 * p, 7 * p);

        // Head & Backward Teal Cap
        ctx.fillStyle = '#101820';
        ctx.fillRect(x - 8 * p, y - 27 * p, 16 * p, 18 * p);
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(x - 7 * p, y - 26 * p, 14 * p, 16 * p);
        // Enthusiastic Eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - 5 * p, y - 18 * p, 3 * p, 3 * p);
        ctx.fillRect(x + 2 * p, y - 18 * p, 3 * p, 3 * p);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 5 * p, y - 18 * p, p, p);
        ctx.fillRect(x + 2 * p, y - 18 * p, p, p);
        // Smile
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(x - 3 * p, y - 12 * p, 6 * p, 2 * p);
        // Teal Cap
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(x - 9 * p, y - 32 * p, 18 * p, 7 * p);
        ctx.fillStyle = '#0891b2'; // cap brim backwards
        ctx.fillRect(x - 11 * p, y - 28 * p, 3 * p, 4 * p);
        break;
      }
      case 'dex': {
        // DJ Dex Front View: Dark audio tee with green equalizer bars, large green DJ headphones around neck, hands poised

        // Dark Soundboard Hoodie - Torso
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - 8 * p, y - 9 * p, 16 * p, 23 * p);
        // Neon Green Equalizer Bars graphic
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x - 5 * p, y - 3 * p, 2 * p, 6 * p);
        ctx.fillRect(x - 2 * p, y - 6 * p, 2 * p, 9 * p);
        ctx.fillRect(x + p, y - 4 * p, 2 * p, 7 * p);
        ctx.fillRect(x + 4 * p, y - 2 * p, 2 * p, 5 * p);

        // Left Arm - Dark Sleeve, Green Festival Wristband, Hands ready
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - 15 * p, y - 9 * p, 7 * p, 18 * p);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x - 15 * p, y - 9 * p, 6 * p, 3 * p);
        ctx.fillStyle = '#22c55e'; // neon green wristband
        ctx.fillRect(x - 14 * p, y + 8 * p, 5 * p, 2 * p);
        ctx.fillStyle = '#020617';
        ctx.fillRect(x - 9 * p, y - 7 * p, p, 16 * p);

        // Right Arm
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 8 * p, y - 9 * p, 7 * p, 18 * p);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 9 * p, y - 9 * p, 6 * p, 3 * p);
        ctx.fillStyle = '#22c55e'; // wristband
        ctx.fillRect(x + 9 * p, y + 8 * p, 5 * p, 2 * p);
        ctx.fillStyle = '#020617';
        ctx.fillRect(x + 8 * p, y - 7 * p, p, 16 * p);

        // Left Hand - Poised at mixer
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(x - 14 * p, y + 10 * p, 5 * p, 6 * p);
        ctx.fillStyle = '#fdba74';
        ctx.fillRect(x - 13 * p, y + 12 * p, 3 * p, p);
        ctx.fillRect(x - 10 * p, y + 11 * p, p, 3 * p);

        // Right Hand - Poised at mixer
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(x + 9 * p, y + 10 * p, 5 * p, 6 * p);
        ctx.fillStyle = '#fdba74';
        ctx.fillRect(x + 10 * p, y + 12 * p, 3 * p, p);
        ctx.fillRect(x + 9 * p, y + 11 * p, p, 3 * p);

        // Cargo Pants
        ctx.fillStyle = '#18181b';
        ctx.fillRect(x - 8 * p, y + 14 * p, 16 * p, 7 * p);

        // Head & Neon Green Headphones around neck
        ctx.fillStyle = '#101820';
        ctx.fillRect(x - 8 * p, y - 27 * p, 16 * p, 18 * p);
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(x - 7 * p, y - 26 * p, 14 * p, 16 * p);

        // Neon Green DJ Headphones framing jaw
        ctx.fillStyle = '#15803d'; // headphone band
        ctx.fillRect(x - 8 * p, y - 14 * p, 16 * p, 3 * p);
        ctx.fillStyle = '#22c55e'; // large green ear pads
        ctx.fillRect(x - 10 * p, y - 18 * p, 3 * p, 7 * p);
        ctx.fillRect(x + 7 * p, y - 18 * p, 3 * p, 7 * p);

        // Focused DJ Eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - 5 * p, y - 20 * p, 3 * p, 3 * p);
        ctx.fillRect(x + 2 * p, y - 20 * p, 3 * p, 3 * p);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 5 * p, y - 20 * p, p, p);
        ctx.fillRect(x + 2 * p, y - 20 * p, p, p);

        // Spiky Blonde Hair
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(x - 9 * p, y - 32 * p, 18 * p, 7 * p);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(x - 7 * p, y - 33 * p, 14 * p, 3 * p);
        break;
      }
      case 'sophia': {
        // VIP Guest Sophia Front View: Sparkling gold gown, gold bracelets, holding sparkling glass, manicured hands

        // Gold Evening Gown - Torso
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x - 8 * p, y - 9 * p, 16 * p, 24 * p);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x - 7 * p, y - 8 * p, 14 * p, 22 * p);
        ctx.fillStyle = '#fef08a'; // sparkles
        ctx.fillRect(x - 3 * p, y - 4 * p, 2 * p, 2 * p);
        ctx.fillRect(x + 2 * p, y + 3 * p, 2 * p, 2 * p);

        // Left Arm - Bare skin arm with gold bangles & sparkling glass
        ctx.fillStyle = '#fde68a'; // skin arm
        ctx.fillRect(x - 14 * p, y - 9 * p, 6 * p, 18 * p);
        ctx.fillStyle = '#fbbf24'; // gold bangles
        ctx.fillRect(x - 14 * p, y + 6 * p, 5 * p, 3 * p);
        ctx.fillStyle = '#78350f'; // inner arm seam
        ctx.fillRect(x - 9 * p, y - 7 * p, p, 16 * p);

        // Right Arm - Bare skin arm with gold bangles
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(x + 8 * p, y - 9 * p, 6 * p, 18 * p);
        ctx.fillStyle = '#fbbf24'; // bangles
        ctx.fillRect(x + 9 * p, y + 6 * p, 5 * p, 3 * p);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x + 8 * p, y - 7 * p, p, 16 * p);

        // Left Hand - Holding crystal champagne flute
        ctx.fillStyle = '#38bdf8'; // crystal glass stem & cup
        ctx.fillRect(x - 15 * p, y + 5 * p, 3 * p, 8 * p);
        ctx.fillStyle = '#ffffff'; // glass shimmer
        ctx.fillRect(x - 15 * p, y + 6 * p, p, 4 * p);
        ctx.fillStyle = '#fde68a'; // fingers holding glass
        ctx.fillRect(x - 13 * p, y + 9 * p, 3 * p, 5 * p);

        // Right Hand - Manicured VIP Hand
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(x + 9 * p, y + 9 * p, 5 * p, 6 * p);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x + 10 * p, y + 11 * p, 3 * p, p);
        ctx.fillRect(x + 9 * p, y + 10 * p, p, 3 * p);

        // Head & Auburn Hair Updo
        ctx.fillStyle = '#101820';
        ctx.fillRect(x - 8 * p, y - 27 * p, 16 * p, 18 * p);
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(x - 7 * p, y - 26 * p, 14 * p, 16 * p);
        // Glamorous Eyes with Lashes
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x - 5 * p, y - 18 * p, 3 * p, 3 * p);
        ctx.fillRect(x + 2 * p, y - 18 * p, 3 * p, 3 * p);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 5 * p, y - 18 * p, p, p);
        ctx.fillRect(x + 2 * p, y - 18 * p, p, p);
        ctx.fillStyle = '#be123c'; // red lipstick
        ctx.fillRect(x - 2 * p, y - 12 * p, 4 * p, 2 * p);

        // Auburn High Updo & Tiara Hairpin
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x - 9 * p, y - 32 * p, 18 * p, 8 * p);
        ctx.fillRect(x - 5 * p, y - 36 * p, 10 * p, 5 * p);
        ctx.fillStyle = '#fbbf24'; // gold hair clip
        ctx.fillRect(x - 2 * p, y - 34 * p, 4 * p, 2 * p);
        break;
      }
      default: {
        // Yash Front View: Classic Pokémon Trainer with Cyan Bomber Jacket, Red Smartwatch, Trainer Hands

        // Cyan Bomber Jacket - Torso
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x - 8 * p, y - 9 * p, 16 * p, 23 * p);

        // White inner shirt & gold zip
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x - 4 * p, y - 9 * p, 8 * p, 16 * p);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x - p, y - 7 * p, 2 * p, 14 * p);

        // Jacket Lapels / White Trim
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x - 8 * p, y - 8 * p, 3 * p, 16 * p);
        ctx.fillRect(x + 5 * p, y - 8 * p, 3 * p, 16 * p);

        // Left Arm - Cyan Bomber Sleeve with White Racing Stripe
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x - 15 * p, y - 9 * p, 7 * p, 18 * p);
        ctx.fillStyle = '#ffffff'; // athletic stripe down sleeve
        ctx.fillRect(x - 15 * p, y - 6 * p, 2 * p, 12 * p);
        ctx.fillStyle = '#38bdf8'; // shoulder highlight
        ctx.fillRect(x - 15 * p, y - 9 * p, 6 * p, 3 * p);
        ctx.fillStyle = '#0369a1'; // inner arm seam
        ctx.fillRect(x - 9 * p, y - 7 * p, p, 16 * p);

        // Right Arm - Cyan Bomber Sleeve with White Racing Stripe
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x + 8 * p, y - 9 * p, 7 * p, 18 * p);
        ctx.fillStyle = '#ffffff'; // athletic stripe
        ctx.fillRect(x + 13 * p, y - 6 * p, 2 * p, 12 * p);
        ctx.fillStyle = '#38bdf8'; // shoulder highlight
        ctx.fillRect(x + 9 * p, y - 9 * p, 6 * p, 3 * p);
        ctx.fillStyle = '#0369a1'; // inner arm seam
        ctx.fillRect(x + 8 * p, y - 7 * p, p, 16 * p);

        // Red Smartwatch on Left Wrist
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x - 14 * p, y + 8 * p, 5 * p, 2 * p);
        ctx.fillStyle = '#ffffff'; // digital screen glint
        ctx.fillRect(x - 13 * p, y + 8 * p, 2 * p, p);

        // White Ribbed Cuff on Right Wrist
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x + 9 * p, y + 8 * p, 5 * p, 2 * p);

        // Left Hand - Pokémon Trainer Hand with defined knuckles & thumb
        ctx.fillStyle = '#fed7aa'; // skin
        ctx.fillRect(x - 14 * p, y + 10 * p, 5 * p, 6 * p);
        ctx.fillStyle = '#fdba74'; // knuckles & fingers
        ctx.fillRect(x - 10 * p, y + 11 * p, p, 3 * p); // thumb pointing inward
        ctx.fillRect(x - 13 * p, y + 13 * p, 3 * p, p);
        ctx.fillRect(x - 13 * p, y + 15 * p, 3 * p, p);

        // Right Hand - Pokémon Trainer Hand
        ctx.fillStyle = '#fed7aa'; // skin
        ctx.fillRect(x + 9 * p, y + 10 * p, 5 * p, 6 * p);
        ctx.fillStyle = '#fdba74'; // knuckles & fingers
        ctx.fillRect(x + 9 * p, y + 11 * p, p, 3 * p); // thumb pointing inward
        ctx.fillRect(x + 10 * p, y + 13 * p, 3 * p, p);
        ctx.fillRect(x + 10 * p, y + 15 * p, 3 * p, p);

        // Dark Jeans
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(x - 8 * p, y + 14 * p, 16 * p, 7 * p);

        // Head
        ctx.fillStyle = '#101820';
        ctx.fillRect(x - 8 * p, y - 27 * p, 16 * p, 18 * p);
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(x - 7 * p, y - 26 * p, 14 * p, 16 * p);
        // Expressive Eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - 5 * p, y - 18 * p, 3 * p, 4 * p);
        ctx.fillRect(x + 2 * p, y - 18 * p, 3 * p, 4 * p);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x - 5 * p, y - 16 * p, 3 * p, p);
        ctx.fillRect(x + 2 * p, y - 16 * p, 3 * p, p);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 5 * p, y - 18 * p, p, p);
        ctx.fillRect(x + 2 * p, y - 18 * p, p, p);

        // Smile
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(x - 2 * p, y - 12 * p, 4 * p, 2 * p);

        // Spiky Brown Anime Hair
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x - 9 * p, y - 32 * p, 18 * p, 8 * p);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x - 8 * p, y - 31 * p, 16 * p, 7 * p);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x - 6 * p, y - 31 * p, 6 * p, 3 * p);
        ctx.fillRect(x + 2 * p, y - 31 * p, 5 * p, 3 * p);
        break;
      }
    }
    ctx.restore();
  }

  /**
   * Draw Player Back View Sprite (Classic Pokémon Trainer Back Sprite with Arms & Hands)
   */
  renderBattleBackSprite(ctx, charId, x, y, scale = 5) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const p = scale;

    if (charId === 'anshuman') {
      // Anshuman Back Sprite: Red Oversized Hoodie from behind with distinct sleeves, cuffs & fingerless gloved hands

      // Hoodie Central Back Panel
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(x - 9 * p, y - 11 * p, 18 * p, 24 * p);
      ctx.fillStyle = '#7f1d1d'; // central back spinal seam
      ctx.fillRect(x - p, y - 11 * p, 2 * p, 24 * p);

      // Left Arm - Draped Baggy Hoodie Sleeve
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(x - 17 * p, y - 11 * p, 8 * p, 21 * p);
      ctx.fillStyle = '#dc2626'; // shoulder fold highlight
      ctx.fillRect(x - 17 * p, y - 11 * p, 7 * p, 3 * p);
      ctx.fillStyle = '#7f1d1d'; // elbow crease from behind
      ctx.fillRect(x - 17 * p, y + 2 * p, 7 * p, 3 * p);
      ctx.fillStyle = '#450a0a'; // inner shadow separating arm from back torso
      ctx.fillRect(x - 10 * p, y - 8 * p, p, 18 * p);

      // Right Arm - Draped Baggy Hoodie Sleeve
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(x + 9 * p, y - 11 * p, 8 * p, 21 * p);
      ctx.fillStyle = '#dc2626'; // shoulder fold highlight
      ctx.fillRect(x + 10 * p, y - 11 * p, 7 * p, 3 * p);
      ctx.fillStyle = '#7f1d1d'; // elbow crease from behind
      ctx.fillRect(x + 10 * p, y + 2 * p, 7 * p, 3 * p);
      ctx.fillStyle = '#450a0a'; // inner shadow
      ctx.fillRect(x + 9 * p, y - 8 * p, p, 18 * p);

      // Ribbed Cuffs
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(x - 17 * p, y + 10 * p, 7 * p, 2 * p);
      ctx.fillRect(x + 10 * p, y + 10 * p, 7 * p, 2 * p);

      // Cyan Cyber LED band glow on left wrist
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(x - 16 * p, y + 11 * p, 5 * p, p);

      // Left Hand - Fingerless Hacker Glove Back View
      ctx.fillStyle = '#18181b'; // black glove back
      ctx.fillRect(x - 16 * p, y + 12 * p, 6 * p, 5 * p);
      ctx.fillStyle = '#fed7aa'; // fingertips curling forward
      ctx.fillRect(x - 16 * p, y + 17 * p, 5 * p, 2 * p);
      ctx.fillStyle = '#ea580c'; // knuckle joints
      ctx.fillRect(x - 15 * p, y + 14 * p, 4 * p, p);

      // Right Hand - Fingerless Hacker Glove Back View
      ctx.fillStyle = '#18181b'; // black glove back
      ctx.fillRect(x + 10 * p, y + 12 * p, 6 * p, 5 * p);
      ctx.fillStyle = '#fed7aa'; // fingertips curling forward
      ctx.fillRect(x + 11 * p, y + 17 * p, 5 * p, 2 * p);
      ctx.fillStyle = '#ea580c'; // knuckle joints
      ctx.fillRect(x + 11 * p, y + 14 * p, 4 * p, p);

      // Dark Cargo jeans & pockets
      ctx.fillStyle = '#27272a';
      ctx.fillRect(x - 10 * p, y + 13 * p, 20 * p, 15 * p);
      ctx.fillStyle = '#3f3f46'; // cargo pockets
      ctx.fillRect(x - 9 * p, y + 15 * p, 6 * p, 8 * p);
      ctx.fillRect(x + 3 * p, y + 15 * p, 6 * p, 8 * p);

      // Oversized Hood Back View & Seam
      ctx.fillStyle = '#101820'; // hood outline
      ctx.fillRect(x - 14 * p, y - 33 * p, 28 * p, 25 * p);
      ctx.fillStyle = '#7f1d1d'; // hood base
      ctx.fillRect(x - 13 * p, y - 32 * p, 26 * p, 23 * p);
      ctx.fillStyle = '#b91c1c'; // hood center ridge
      ctx.fillRect(x - p, y - 30 * p, 2 * p, 20 * p);
      ctx.fillStyle = '#991b1b'; // hood highlights
      ctx.fillRect(x - 10 * p, y - 28 * p, 8 * p, 15 * p);
      ctx.fillRect(x + 2 * p, y - 28 * p, 8 * p, 15 * p);
    } else if (charId === 'vipul') {
      // Vipul Back Sprite: Velvet Amber Blazer & Slicked Black Hair with Arms, Cuffs & Hands

      // Velvet Blazer Central Back Panel & Tailored Vent
      ctx.fillStyle = '#b45309'; // gold velvet
      ctx.fillRect(x - 9 * p, y - 10 * p, 18 * p, 23 * p);
      ctx.fillStyle = '#78350f'; // tailored center seam
      ctx.fillRect(x - p, y - 10 * p, 2 * p, 23 * p);
      ctx.fillStyle = '#f59e0b'; // sheen highlights
      ctx.fillRect(x - 7 * p, y - 8 * p, 4 * p, 18 * p);
      ctx.fillRect(x + 3 * p, y - 8 * p, 4 * p, 18 * p);

      // Left Arm - Velvet Blazer Sleeve
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x - 16 * p, y - 10 * p, 7 * p, 20 * p);
      ctx.fillStyle = '#f59e0b'; // shoulder highlight
      ctx.fillRect(x - 16 * p, y - 10 * p, 6 * p, 3 * p);
      ctx.fillStyle = '#78350f'; // inner arm seam separating from torso
      ctx.fillRect(x - 10 * p, y - 8 * p, p, 18 * p);

      // Right Arm - Velvet Blazer Sleeve
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x + 9 * p, y - 10 * p, 7 * p, 20 * p);
      ctx.fillStyle = '#f59e0b'; // shoulder highlight
      ctx.fillRect(x + 10 * p, y - 10 * p, 6 * p, 3 * p);
      ctx.fillStyle = '#78350f'; // inner arm seam
      ctx.fillRect(x + 9 * p, y - 8 * p, p, 18 * p);

      // Cuffs & Gold Rolex Watch visible from behind
      ctx.fillStyle = '#ffffff'; // white French cuff (right wrist only - left is fully covered by the Rolex below)
      ctx.fillRect(x + 10 * p, y + 10 * p, 5 * p, 2 * p);
      ctx.fillStyle = '#fbbf24'; // Gold Rolex Watch strap & case on left wrist
      ctx.fillRect(x - 15 * p, y + 10 * p, 5 * p, 2 * p);
      ctx.fillStyle = '#ffffff'; // gold glint
      ctx.fillRect(x - 14 * p, y + 10 * p, 2 * p, p);

      // Left Hand Back View - VIP Manicured Hand
      ctx.fillStyle = '#fde68a'; // skin
      ctx.fillRect(x - 15 * p, y + 12 * p, 5 * p, 6 * p);
      ctx.fillStyle = '#f59e0b'; // knuckles & tendons from back
      ctx.fillRect(x - 14 * p, y + 14 * p, 3 * p, p);
      ctx.fillRect(x - 11 * p, y + 13 * p, p, 3 * p); // thumb forward

      // Right Hand Back View - VIP Manicured Hand
      ctx.fillStyle = '#fde68a'; // skin
      ctx.fillRect(x + 10 * p, y + 12 * p, 5 * p, 6 * p);
      ctx.fillStyle = '#f59e0b'; // knuckles & tendons
      ctx.fillRect(x + 11 * p, y + 14 * p, 3 * p, p);
      ctx.fillRect(x + 10 * p, y + 13 * p, p, 3 * p); // thumb forward

      // Formal Slacks & Pockets
      ctx.fillStyle = '#27272a';
      ctx.fillRect(x - 9 * p, y + 13 * p, 18 * p, 15 * p);
      ctx.fillStyle = '#18181b'; // slacks back pocket welts
      ctx.fillRect(x - 8 * p, y + 15 * p, 5 * p, p);
      ctx.fillRect(x + 3 * p, y + 15 * p, 5 * p, p);

      // Slicked Black Hair Back View
      ctx.fillStyle = '#09090b';
      ctx.fillRect(x - 11 * p, y - 30 * p, 22 * p, 22 * p);
      ctx.fillStyle = '#27272a';
      ctx.fillRect(x - 8 * p, y - 28 * p, 16 * p, 4 * p);
    } else {
      // Yash Back Sprite: Cyan Jacket & Messy Chestnut Hair with Arms, Cuffs & Hands

      // Cyan Jacket Central Back Panel
      ctx.fillStyle = '#0284c7'; // cyan jacket
      ctx.fillRect(x - 9 * p, y - 10 * p, 18 * p, 23 * p);
      ctx.fillStyle = '#0369a1'; // central seam
      ctx.fillRect(x - p, y - 10 * p, 2 * p, 23 * p);
      ctx.fillStyle = '#38bdf8'; // highlights
      ctx.fillRect(x - 7 * p, y - 8 * p, 4 * p, 18 * p);
      ctx.fillRect(x + 3 * p, y - 8 * p, 4 * p, 18 * p);

      // Left Arm - Cyan Bomber Sleeve with White Racing Stripe
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x - 16 * p, y - 10 * p, 7 * p, 20 * p);
      ctx.fillStyle = '#ffffff'; // racing stripe
      ctx.fillRect(x - 16 * p, y - 7 * p, 2 * p, 14 * p);
      ctx.fillStyle = '#38bdf8'; // shoulder highlight
      ctx.fillRect(x - 16 * p, y - 10 * p, 6 * p, 3 * p);
      ctx.fillStyle = '#0369a1'; // inner arm seam separating from torso
      ctx.fillRect(x - 10 * p, y - 8 * p, p, 18 * p);

      // Right Arm - Cyan Bomber Sleeve with White Racing Stripe
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x + 9 * p, y - 10 * p, 7 * p, 20 * p);
      ctx.fillStyle = '#ffffff'; // racing stripe
      ctx.fillRect(x + 14 * p, y - 7 * p, 2 * p, 14 * p);
      ctx.fillStyle = '#38bdf8'; // shoulder highlight
      ctx.fillRect(x + 10 * p, y - 10 * p, 6 * p, 3 * p);
      ctx.fillStyle = '#0369a1'; // inner arm seam
      ctx.fillRect(x + 9 * p, y - 8 * p, p, 18 * p);

      // Red Smartwatch on Left Wrist from behind
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x - 15 * p, y + 10 * p, 5 * p, 2 * p);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 14 * p, y + 10 * p, 2 * p, p);

      // White Ribbed Cuff on Right Wrist
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x + 10 * p, y + 10 * p, 5 * p, 2 * p);

      // Left Hand Back View - Trainer Hand
      ctx.fillStyle = '#fed7aa'; // skin
      ctx.fillRect(x - 15 * p, y + 12 * p, 5 * p, 6 * p);
      ctx.fillStyle = '#fdba74'; // knuckles & back of hand
      ctx.fillRect(x - 14 * p, y + 14 * p, 3 * p, p);
      ctx.fillRect(x - 11 * p, y + 13 * p, p, 3 * p); // thumb

      // Right Hand Back View - Trainer Hand
      ctx.fillStyle = '#fed7aa'; // skin
      ctx.fillRect(x + 10 * p, y + 12 * p, 5 * p, 6 * p);
      ctx.fillStyle = '#fdba74'; // knuckles & back of hand
      ctx.fillRect(x + 11 * p, y + 14 * p, 3 * p, p);
      ctx.fillRect(x + 10 * p, y + 13 * p, p, 3 * p); // thumb

      // Indigo Trainer Jeans & back pockets
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(x - 9 * p, y + 13 * p, 18 * p, 15 * p);
      ctx.fillStyle = '#172554'; // pockets
      ctx.fillRect(x - 8 * p, y + 15 * p, 5 * p, 6 * p);
      ctx.fillRect(x + 3 * p, y + 15 * p, 5 * p, 6 * p);

      // Back of Head & Spiky Chestnut Hair
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x - 12 * p, y - 32 * p, 24 * p, 24 * p);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x - 11 * p, y - 31 * p, 22 * p, 22 * p);
      ctx.fillStyle = '#b45309'; // hair spikes & tufts
      ctx.fillRect(x - 13 * p, y - 28 * p, 4 * p, 8 * p);
      ctx.fillRect(x + 9 * p, y - 28 * p, 4 * p, 8 * p);
      ctx.fillRect(x - 7 * p, y - 34 * p, 14 * p, 5 * p);
    }

    ctx.restore();
  }
}
