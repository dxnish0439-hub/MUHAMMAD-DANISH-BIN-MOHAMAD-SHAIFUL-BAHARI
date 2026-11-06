/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

// Helper to create a pixelated CanvasTexture
function createPixelTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  draw(ctx);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

// 1. Grass block top texture (16x16 pixels)
export function createGrassTopTexture(): THREE.CanvasTexture {
  return createPixelTexture(16, 16, (ctx) => {
    const greens = ['#4c8d2c', '#569b32', '#417d26', '#3b7022', '#5ea637'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const c = greens[Math.floor(Math.random() * greens.length)];
        ctx.fillStyle = c;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
}

// 2. Dirt texture (16x16 pixels)
export function createDirtTexture(): THREE.CanvasTexture {
  return createPixelTexture(16, 16, (ctx) => {
    const browns = ['#866043', '#795438', '#6a472c', '#8d6849', '#5c3d24'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const c = browns[Math.floor(Math.random() * browns.length)];
        ctx.fillStyle = c;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
}

// 3. Cobblestone texture (16x16 pixels)
export function createCobblestoneTexture(): THREE.CanvasTexture {
  return createPixelTexture(16, 16, (ctx) => {
    const grays = ['#7c7c7c', '#626262', '#4b4b4b', '#959595', '#383838'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const c = grays[Math.floor(Math.random() * grays.length)];
        ctx.fillStyle = c;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Border mortar lines
    ctx.fillStyle = '#2f2f2f';
    ctx.fillRect(0, 0, 16, 1);
    ctx.fillRect(0, 8, 16, 1);
    ctx.fillRect(8, 0, 1, 8);
    ctx.fillRect(4, 8, 1, 8);
    ctx.fillRect(12, 8, 1, 8);
  });
}

// 4. Railway Track texture (32x32 pixels)
export function createRailTrackTexture(): THREE.CanvasTexture {
  return createPixelTexture(32, 32, (ctx) => {
    // Gravel ballast background
    const gravel = ['#555555', '#484848', '#636363', '#3d3d3d'];
    for (let x = 0; x < 32; x++) {
      for (let y = 0; y < 32; y++) {
        ctx.fillStyle = gravel[Math.floor(Math.random() * gravel.length)];
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Wooden cross ties (sleepers) every 8 pixels
    const woodDark = '#4a2f13';
    const woodMid = '#68431e';
    const woodLight = '#7d5226';

    for (let y = 2; y < 32; y += 8) {
      ctx.fillStyle = woodDark;
      ctx.fillRect(4, y, 24, 4);
      ctx.fillStyle = woodMid;
      ctx.fillRect(5, y + 1, 22, 2);
      ctx.fillStyle = woodLight;
      ctx.fillRect(6, y + 1, 20, 1);
    }

    // Two parallel steel rails
    const railX1 = 7;
    const railX2 = 23;

    [railX1, railX2].forEach((rx) => {
      // Rail shadow
      ctx.fillStyle = '#1e1e1e';
      ctx.fillRect(rx - 1, 0, 4, 32);
      // Rail base
      ctx.fillStyle = '#7a7a7a';
      ctx.fillRect(rx, 0, 2, 32);
      // Rail shine
      ctx.fillStyle = '#dcdcdc';
      ctx.fillRect(rx, 0, 1, 32);
      // Rail golden-redstone sparks / ties clips
      for (let y = 3; y < 32; y += 8) {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(rx - 1, y, 1, 2);
        ctx.fillRect(rx + 2, y, 1, 2);
      }
    });
  });
}

// 5. Wood Planks texture (16x16)
export function createWoodPlanksTexture(): THREE.CanvasTexture {
  return createPixelTexture(16, 16, (ctx) => {
    const oak = ['#9c7849', '#8a6538', '#aa8556', '#7b572a'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        ctx.fillStyle = oak[Math.floor(Math.random() * oak.length)];
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Plank grooves
    ctx.fillStyle = '#563a19';
    ctx.fillRect(0, 0, 16, 1);
    ctx.fillRect(0, 4, 16, 1);
    ctx.fillRect(0, 8, 16, 1);
    ctx.fillRect(0, 12, 16, 1);
  });
}

// 6. Lava / Magma texture (16x16)
export function createLavaTexture(): THREE.CanvasTexture {
  return createPixelTexture(16, 16, (ctx) => {
    const lavaColors = ['#e63900', '#ff5722', '#ff9800', '#ffc107', '#991b1b', '#3a0909'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        ctx.fillStyle = lavaColors[Math.floor(Math.random() * lavaColors.length)];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
}

// 7. Gold Coin / Ingot texture (16x16)
export function createGoldTexture(): THREE.CanvasTexture {
  return createPixelTexture(16, 16, (ctx) => {
    const golds = ['#fbbf24', '#f59e0b', '#d97706', '#fef08a', '#b45309'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        ctx.fillStyle = golds[Math.floor(Math.random() * golds.length)];
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Center bright emblem
    ctx.fillStyle = '#fffbeb';
    ctx.fillRect(5, 5, 6, 6);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(6, 6, 4, 4);
  });
}

// 8. Steve Face Texture (8x8 pixel face)
export function createSteveFaceTexture(): THREE.CanvasTexture {
  return createPixelTexture(8, 8, (ctx) => {
    const skin = '#db9979';
    const darkSkin = '#c78261';
    const hair = '#3d271d';
    const eyeWhite = '#ffffff';
    const eyeBlue = '#2b4b9b';
    const mouth = '#7a3e2e';
    const nose = '#bd7454';

    // Base skin
    ctx.fillStyle = skin;
    ctx.fillRect(0, 0, 8, 8);

    // Hair top 2 rows
    ctx.fillStyle = hair;
    ctx.fillRect(0, 0, 8, 2);
    ctx.fillRect(0, 2, 1, 1);
    ctx.fillRect(7, 2, 1, 1);

    // Eyes at row 3 & 4
    ctx.fillStyle = eyeWhite;
    ctx.fillRect(1, 3, 2, 1);
    ctx.fillRect(5, 3, 2, 1);

    ctx.fillStyle = eyeBlue;
    ctx.fillRect(2, 3, 1, 1);
    ctx.fillRect(5, 3, 1, 1);

    // Nose
    ctx.fillStyle = nose;
    ctx.fillRect(3, 4, 2, 1);

    // Mouth / Goatee
    ctx.fillStyle = mouth;
    ctx.fillRect(2, 5, 4, 1);
    ctx.fillStyle = hair;
    ctx.fillRect(2, 6, 4, 1);
  });
}

// 9. Nether / Checkpoint Portal Shimmer Texture
export function createPortalTexture(): THREE.CanvasTexture {
  return createPixelTexture(32, 32, (ctx) => {
    const purples = ['#4c1d95', '#6d28d9', '#8b5cf6', '#a78bfa', '#2e1065', '#c084fc'];
    for (let x = 0; x < 32; x++) {
      for (let y = 0; y < 32; y++) {
        ctx.fillStyle = purples[Math.floor(Math.random() * purples.length)];
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Swirl lines
    ctx.fillStyle = '#e9d5ff';
    for (let i = 4; i < 28; i += 6) {
      ctx.fillRect(i, (i * 2) % 32, 3, 2);
    }
  });
}
