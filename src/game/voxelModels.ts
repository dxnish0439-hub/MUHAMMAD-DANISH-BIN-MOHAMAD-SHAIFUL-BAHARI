/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CharacterSkin } from '../types/game';
import {
  createSteveFaceTexture,
  createCobblestoneTexture,
  createWoodPlanksTexture,
  createLavaTexture,
  createGoldTexture,
  createPortalTexture,
} from './proceduralTextures';

// Shared Materials & Textures
const steveFaceTex = createSteveFaceTexture();
const cobblestoneTex = createCobblestoneTexture();
const woodTex = createWoodPlanksTexture();
const lavaTex = createLavaTexture();
const goldTex = createGoldTexture();
const portalTex = createPortalTexture();

export interface CharacterRig {
  group: THREE.Group;
  head: THREE.Mesh;
  torso: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  shadow: THREE.Mesh;
  updateAnimation: (runTime: number, isJumping: boolean, isSliding: boolean, isCelebrating: boolean) => void;
  updateSkin: (skin: CharacterSkin) => void;
}

export function createCharacterRig(skin: CharacterSkin): CharacterRig {
  const root = new THREE.Group();

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: skin.skinColor,
    roughness: 0.8,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: skin.hairColor,
    roughness: 0.9,
  });

  const shirtMat = new THREE.MeshStandardMaterial({
    color: skin.shirtColor,
    roughness: 0.7,
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: skin.pantsColor,
    roughness: 0.8,
  });

  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.9,
  });

  // Head materials: face on front (index 4 in BoxGeometry materials array), skin/hair on other faces
  const headMaterials = [
    hairMat, // right (+X)
    hairMat, // left (-X)
    hairMat, // top (+Y)
    skinMat, // bottom (-Y)
    new THREE.MeshStandardMaterial({ map: steveFaceTex, roughness: 0.8 }), // front (+Z)
    hairMat, // back (-Z)
  ];

  // Head (0.5 x 0.5 x 0.5)
  const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const head = new THREE.Mesh(headGeo, headMaterials);
  head.position.y = 1.45;
  head.castShadow = true;
  root.add(head);

  // Torso (0.5 x 0.7 x 0.28)
  const torsoGeo = new THREE.BoxGeometry(0.5, 0.7, 0.28);
  const torso = new THREE.Mesh(torsoGeo, shirtMat);
  torso.position.y = 0.95;
  torso.castShadow = true;
  root.add(torso);

  // Collar accent
  const collarGeo = new THREE.BoxGeometry(0.2, 0.1, 0.04);
  const collar = new THREE.Mesh(collarGeo, skinMat);
  collar.position.set(0, 1.25, 0.14);
  root.add(collar);

  // Left Arm (pivot at shoulder)
  const leftArm = new THREE.Group();
  leftArm.position.set(0.36, 1.25, 0);

  const armGeo = new THREE.BoxGeometry(0.22, 0.7, 0.24);
  const leftArmMesh = new THREE.Mesh(armGeo, shirtMat);
  leftArmMesh.position.y = -0.35;
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);

  // Left hand
  const handGeo = new THREE.BoxGeometry(0.22, 0.22, 0.24);
  const leftHandMesh = new THREE.Mesh(handGeo, skinMat);
  leftHandMesh.position.y = -0.58;
  leftArm.add(leftHandMesh);

  root.add(leftArm);

  // Right Arm (pivot at shoulder)
  const rightArm = new THREE.Group();
  rightArm.position.set(-0.36, 1.25, 0);

  const rightArmMesh = new THREE.Mesh(armGeo, shirtMat);
  rightArmMesh.position.y = -0.35;
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);

  const rightHandMesh = new THREE.Mesh(handGeo, skinMat);
  rightHandMesh.position.y = -0.58;
  rightArm.add(rightHandMesh);

  root.add(rightArm);

  // Left Leg (pivot at hip)
  const leftLeg = new THREE.Group();
  leftLeg.position.set(0.14, 0.6, 0);

  const legGeo = new THREE.BoxGeometry(0.22, 0.6, 0.24);
  const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
  leftLegMesh.position.y = -0.3;
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);

  // Left Boot
  const bootGeo = new THREE.BoxGeometry(0.23, 0.16, 0.26);
  const leftBootMesh = new THREE.Mesh(bootGeo, shoeMat);
  leftBootMesh.position.set(0, -0.52, 0.01);
  leftLeg.add(leftBootMesh);

  root.add(leftLeg);

  // Right Leg (pivot at hip)
  const rightLeg = new THREE.Group();
  rightLeg.position.set(-0.14, 0.6, 0);

  const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
  rightLegMesh.position.y = -0.3;
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);

  const rightBootMesh = new THREE.Mesh(bootGeo, shoeMat);
  rightBootMesh.position.set(0, -0.52, 0.01);
  rightLeg.add(rightBootMesh);

  root.add(rightLeg);

  // Soft Contact Shadow plane directly beneath
  const shadowGeo = new THREE.PlaneGeometry(0.9, 0.9);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  // Animation update function
  const updateAnimation = (
    runTime: number,
    isJumping: boolean,
    isSliding: boolean,
    isCelebrating: boolean
  ) => {
    if (isCelebrating) {
      // Victory celebration: waving arms up high, head bob
      const wave = Math.sin(runTime * 10);
      leftArm.rotation.x = -Math.PI + 0.3 * wave;
      leftArm.rotation.z = 0.3 + 0.2 * wave;
      rightArm.rotation.x = -Math.PI - 0.3 * wave;
      rightArm.rotation.z = -0.3 - 0.2 * wave;
      leftLeg.rotation.x = 0.1;
      rightLeg.rotation.x = -0.1;
      head.rotation.y = Math.sin(runTime * 3) * 0.2;
      head.position.y = 1.45 + Math.abs(Math.sin(runTime * 8)) * 0.1;
      return;
    }

    if (isSliding) {
      // Sliding posture: tilt character back, tuck legs forward, arms forward
      torso.position.y = 0.45;
      torso.rotation.x = 0.65;
      head.position.y = 0.85;
      head.rotation.x = -0.3;
      leftArm.rotation.x = -1.2;
      rightArm.rotation.x = -1.2;
      leftArm.position.y = 0.75;
      rightArm.position.y = 0.75;
      leftLeg.rotation.x = -1.1;
      rightLeg.rotation.x = -1.1;
      leftLeg.position.y = 0.35;
      rightLeg.position.y = 0.35;
      shadow.scale.set(1.4, 0.8, 1);
      return;
    }

    // Reset slide offsets
    torso.position.y = 0.95;
    torso.rotation.x = 0;
    head.position.y = 1.45;
    head.rotation.x = 0;
    head.rotation.y = 0;
    leftArm.position.y = 1.25;
    rightArm.position.y = 1.25;
    leftLeg.position.y = 0.6;
    rightLeg.position.y = 0.6;
    shadow.scale.set(1, 1, 1);

    if (isJumping) {
      // Jumping: arms up/forward, legs bent slightly back
      leftArm.rotation.x = -1.4;
      leftArm.rotation.z = 0.2;
      rightArm.rotation.x = -1.4;
      rightArm.rotation.z = -0.2;
      leftLeg.rotation.x = 0.5;
      rightLeg.rotation.x = 0.3;
      return;
    }

    // Running cycle
    const swingSpeed = 14;
    const armAngle = Math.sin(runTime * swingSpeed) * 0.9;
    const legAngle = Math.sin(runTime * swingSpeed) * 0.9;

    leftArm.rotation.x = armAngle;
    leftArm.rotation.z = 0;
    rightArm.rotation.x = -armAngle;
    rightArm.rotation.z = 0;

    leftLeg.rotation.x = -legAngle;
    rightLeg.rotation.x = legAngle;

    // Subtle head & torso bounce
    torso.position.y = 0.95 + Math.abs(Math.sin(runTime * swingSpeed)) * 0.06;
    head.position.y = 1.45 + Math.abs(Math.sin(runTime * swingSpeed)) * 0.06;
  };

  const updateSkin = (newSkin: CharacterSkin) => {
    skinMat.color.setHex(newSkin.skinColor);
    hairMat.color.setHex(newSkin.hairColor);
    shirtMat.color.setHex(newSkin.shirtColor);
    pantsMat.color.setHex(newSkin.pantsColor);
  };

  return {
    group: root,
    head,
    torso,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    shadow,
    updateAnimation,
    updateSkin,
  };
}

// Procedural Minecraft Train / Minecart Wagon Model
export function createTrainCarriage(): THREE.Group {
  const train = new THREE.Group();

  // 1. Lower Iron Chassis / Undercarriage
  const chassisGeo = new THREE.BoxGeometry(2.1, 0.4, 6.2);
  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x2d3748,
    metalness: 0.8,
    roughness: 0.3,
  });
  const chassis = new THREE.Mesh(chassisGeo, chassisMat);
  chassis.position.y = 0.45;
  chassis.castShadow = true;
  train.add(chassis);

  // 2. Main Body (Iron & Colored Stripes)
  const bodyGeo = new THREE.BoxGeometry(2.0, 2.2, 5.8);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.6,
    roughness: 0.4,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.6;
  body.castShadow = true;
  train.add(body);

  // 3. Side Windows (Dark reflective glass blocks)
  const windowGeo = new THREE.BoxGeometry(2.08, 0.8, 1.2);
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    roughness: 0.1,
    metalness: 0.9,
    emissive: 0x1e3a8a,
    emissiveIntensity: 0.2,
  });

  const win1 = new THREE.Mesh(windowGeo, windowMat);
  win1.position.set(0, 1.8, 1.2);
  train.add(win1);

  const win2 = new THREE.Mesh(windowGeo, windowMat);
  win2.position.set(0, 1.8, -1.2);
  train.add(win2);

  // 4. Roof Plate & Smokestack / Vents
  const roofGeo = new THREE.BoxGeometry(2.1, 0.2, 5.9);
  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.7,
    roughness: 0.4,
  });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 2.75;
  roof.castShadow = true;
  train.add(roof);

  // 5. Smokestack / Exhaust chimney
  const chimneyGeo = new THREE.BoxGeometry(0.6, 0.7, 0.6);
  const chimney = new THREE.Mesh(chimneyGeo, chassisMat);
  chimney.position.set(0, 3.1, 2.0);
  chimney.castShadow = true;
  train.add(chimney);

  // 6. Front Gold Headlight & Grille
  const lightGeo = new THREE.BoxGeometry(0.4, 0.4, 0.2);
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfacc15,
    emissiveIntensity: 1.0,
    roughness: 0.2,
  });
  const headlight = new THREE.Mesh(lightGeo, lightMat);
  headlight.position.set(0, 1.6, 2.92);
  train.add(headlight);

  // Red rear markers
  const redLightMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 0.8,
  });
  const redMarker1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.1), redLightMat);
  redMarker1.position.set(0.7, 1.8, -2.92);
  train.add(redMarker1);

  const redMarker2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.1), redLightMat);
  redMarker2.position.set(-0.7, 1.8, -2.92);
  train.add(redMarker2);

  // 7. Four Blocky Iron Wheels
  const wheelGeo = new THREE.BoxGeometry(0.18, 0.5, 0.5);
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    metalness: 0.9,
    roughness: 0.2,
  });

  const wheelPositions = [
    [-1.02, 0.25, 1.8],
    [1.02, 0.25, 1.8],
    [-1.02, 0.25, -1.8],
    [1.02, 0.25, -1.8],
  ];

  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(wx, wy, wz);
    train.add(wheel);
  });

  return train;
}

// Obstacle 1: Cobblestone Block Barrier (Height ~1.6, requires lane switch or jumping if short)
export function createCobblestoneBarrier(): THREE.Group {
  const group = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({
    map: cobblestoneTex,
    roughness: 0.9,
    metalness: 0.1,
  });

  // Base blocks
  const blockGeo = new THREE.BoxGeometry(1.9, 1.5, 0.8);
  const mainBlock = new THREE.Mesh(blockGeo, stoneMat);
  mainBlock.position.y = 0.75;
  mainBlock.castShadow = true;
  mainBlock.receiveShadow = true;
  group.add(mainBlock);

  // Top accent ridge
  const topGeo = new THREE.BoxGeometry(2.0, 0.3, 0.9);
  const topMesh = new THREE.Mesh(topGeo, stoneMat);
  topMesh.position.y = 1.6;
  topMesh.castShadow = true;
  group.add(topMesh);

  // Redstone Warning Torch on top corner
  const torchPoleGeo = new THREE.BoxGeometry(0.08, 0.4, 0.08);
  const torchPoleMat = new THREE.MeshStandardMaterial({ color: 0x4a2f13 });
  const torchPole = new THREE.Mesh(torchPoleGeo, torchPoleMat);
  torchPole.position.set(0.65, 1.9, 0);
  group.add(torchPole);

  const torchHeadGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
  const torchHeadMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 1.2,
  });
  const torchHead = new THREE.Mesh(torchHeadGeo, torchHeadMat);
  torchHead.position.set(0.65, 2.12, 0);
  group.add(torchHead);

  return group;
}

// Obstacle 2: Low Wooden Fence Gate (Height ~0.7, jumpable or switch lane)
export function createLowWoodenFence(): THREE.Group {
  const group = new THREE.Group();

  const woodMat = new THREE.MeshStandardMaterial({
    map: woodTex,
    roughness: 0.85,
  });

  // Left Post
  const postGeo = new THREE.BoxGeometry(0.24, 0.75, 0.24);
  const postL = new THREE.Mesh(postGeo, woodMat);
  postL.position.set(-0.85, 0.375, 0);
  postL.castShadow = true;
  group.add(postL);

  // Right Post
  const postR = new THREE.Mesh(postGeo, woodMat);
  postR.position.set(0.85, 0.375, 0);
  postR.castShadow = true;
  group.add(postR);

  // Center Post
  const postC = new THREE.Mesh(postGeo, woodMat);
  postC.position.set(0, 0.375, 0);
  postC.castShadow = true;
  group.add(postC);

  // Horizontal Rails
  const railGeo = new THREE.BoxGeometry(1.8, 0.16, 0.12);
  const rail1 = new THREE.Mesh(railGeo, woodMat);
  rail1.position.set(0, 0.55, 0);
  rail1.castShadow = true;
  group.add(rail1);

  const rail2 = new THREE.Mesh(railGeo, woodMat);
  rail2.position.set(0, 0.25, 0);
  rail2.castShadow = true;
  group.add(rail2);

  return group;
}

// Obstacle 3: High Overhead Beam / Tunnel Arch (Must slide under or switch lane)
export function createOverheadBeam(): THREE.Group {
  const group = new THREE.Group();

  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x374151,
    metalness: 0.8,
    roughness: 0.3,
  });

  const cautionMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.5,
  });

  // Left Pillar (tall)
  const pillarGeo = new THREE.BoxGeometry(0.25, 3.2, 0.25);
  const pillarL = new THREE.Mesh(pillarGeo, ironMat);
  pillarL.position.set(-1.0, 1.6, 0);
  pillarL.castShadow = true;
  group.add(pillarL);

  // Right Pillar (tall)
  const pillarR = new THREE.Mesh(pillarGeo, ironMat);
  pillarR.position.set(1.0, 1.6, 0);
  pillarR.castShadow = true;
  group.add(pillarR);

  // Overhead Clearance Beam (leaves gap of ~0.8m at bottom, requiring duck/slide)
  const beamGeo = new THREE.BoxGeometry(2.2, 1.5, 0.4);
  const beam = new THREE.Mesh(beamGeo, cautionMat);
  beam.position.set(0, 2.05, 0); // bottom edge at Y = 1.3
  beam.castShadow = true;
  group.add(beam);

  // Caution stripe accent
  const stripeGeo = new THREE.BoxGeometry(2.0, 0.3, 0.42);
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.position.set(0, 1.6, 0);
  group.add(stripe);

  return group;
}

// Obstacle 4: Lava / Magma hazard block (Jumpable)
export function createLavaPit(): THREE.Group {
  const group = new THREE.Group();

  // Obsidian border
  const borderMat = new THREE.MeshStandardMaterial({
    color: 0x1e152a,
    roughness: 0.9,
  });
  const borderGeo = new THREE.BoxGeometry(2.0, 0.15, 1.6);
  const border = new THREE.Mesh(borderGeo, borderMat);
  border.position.y = 0.08;
  group.add(border);

  // Lava pool
  const lavaMat = new THREE.MeshStandardMaterial({
    map: lavaTex,
    emissive: 0xff3d00,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });
  const lavaGeo = new THREE.BoxGeometry(1.6, 0.18, 1.2);
  const lava = new THREE.Mesh(lavaGeo, lavaMat);
  lava.position.y = 0.1;
  group.add(lava);

  return group;
}

// Collectible 3D Gold Coin / Ingot
export function createGoldCoin(): THREE.Group {
  const group = new THREE.Group();

  const goldMat = new THREE.MeshStandardMaterial({
    map: goldTex,
    color: 0xffd700,
    metalness: 0.85,
    roughness: 0.25,
    emissive: 0xb45309,
    emissiveIntensity: 0.3,
  });

  // Blocky coin shape (8-sided flat cylinder / cube)
  const coinGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.12, 8);
  const coinMesh = new THREE.Mesh(coinGeo, goldMat);
  coinMesh.rotation.x = Math.PI / 2;
  coinMesh.castShadow = true;
  group.add(coinMesh);

  // Golden core accent
  const coreGeo = new THREE.BoxGeometry(0.18, 0.18, 0.16);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xfffbeb,
    metalness: 0.9,
    roughness: 0.1,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Soft small shadow below
  const shadowGeo = new THREE.PlaneGeometry(0.4, 0.4);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.55;
  group.add(shadow);

  return group;
}

// Giant Checkpoint Portal Arch (Nether/End Portal)
export function createCheckpointPortal(checkpointNumber: number): THREE.Group {
  const portal = new THREE.Group();

  // 1. Obsidian Frame (Black/Purple crystal blocks)
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x170b24,
    roughness: 0.6,
    metalness: 0.5,
  });

  // Left & Right Pillars
  const pillarGeo = new THREE.BoxGeometry(0.8, 6.0, 0.8);
  const pillarL = new THREE.Mesh(pillarGeo, frameMat);
  pillarL.position.set(-4.2, 3.0, 0);
  pillarL.castShadow = true;
  portal.add(pillarL);

  const pillarR = new THREE.Mesh(pillarGeo, frameMat);
  pillarR.position.set(4.2, 3.0, 0);
  pillarR.castShadow = true;
  portal.add(pillarR);

  // Top Crossbeam
  const topGeo = new THREE.BoxGeometry(9.2, 0.8, 0.8);
  const top = new THREE.Mesh(topGeo, frameMat);
  top.position.set(0, 5.6, 0);
  top.castShadow = true;
  portal.add(top);

  // 2. Swirling Translucent Portal Field
  const fieldGeo = new THREE.PlaneGeometry(7.6, 4.8);
  const fieldMat = new THREE.MeshStandardMaterial({
    map: portalTex,
    color: 0x8b5cf6,
    emissive: 0x7c3aed,
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
  });
  const field = new THREE.Mesh(fieldGeo, fieldMat);
  field.position.set(0, 2.8, 0);
  portal.add(field);

  // 3. Golden Banner Sign: "CHECKPOINT X"
  const bannerGeo = new THREE.BoxGeometry(5.0, 1.0, 0.3);
  const bannerMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.6,
    roughness: 0.3,
  });
  const banner = new THREE.Mesh(bannerGeo, bannerMat);
  banner.position.set(0, 6.4, 0);
  portal.add(banner);

  // Redstone torches on portal
  const torchMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 1.5,
  });
  const tL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 0.2), torchMat);
  tL.position.set(-4.2, 6.2, 0.5);
  portal.add(tL);

  const tR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 0.2), torchMat);
  tR.position.set(4.2, 6.2, 0.5);
  portal.add(tR);

  return portal;
}

// Procedural Minecraft Tree (3-tier stepped foliage)
export function createMinecraftTree(): THREE.Group {
  const tree = new THREE.Group();

  // Wood Trunk
  const trunkGeo = new THREE.BoxGeometry(0.8, 3.5, 0.8);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x5a3d20,
    roughness: 0.9,
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.75;
  trunk.castShadow = true;
  tree.add(trunk);

  // Leaves Tier 1 (bottom wide)
  const leavesMat = new THREE.MeshStandardMaterial({
    color: 0x2e7d32,
    roughness: 0.8,
  });
  const leaves1Geo = new THREE.BoxGeometry(2.6, 1.2, 2.6);
  const leaves1 = new THREE.Mesh(leaves1Geo, leavesMat);
  leaves1.position.y = 3.6;
  leaves1.castShadow = true;
  tree.add(leaves1);

  // Leaves Tier 2 (middle)
  const leaves2Geo = new THREE.BoxGeometry(2.0, 1.0, 2.0);
  const leaves2 = new THREE.Mesh(leaves2Geo, leavesMat);
  leaves2.position.y = 4.7;
  leaves2.castShadow = true;
  tree.add(leaves2);

  // Leaves Tier 3 (top peak)
  const leaves3Geo = new THREE.BoxGeometry(1.2, 0.8, 1.2);
  const leaves3 = new THREE.Mesh(leaves3Geo, leavesMat);
  leaves3.position.y = 5.6;
  leaves3.castShadow = true;
  tree.add(leaves3);

  return tree;
}

// Procedural Voxel Cloud
export function createVoxelCloud(): THREE.Group {
  const cloud = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
    roughness: 0.3,
  });

  const b1 = new THREE.Mesh(new THREE.BoxGeometry(12, 1.5, 8), cloudMat);
  cloud.add(b1);

  const b2 = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 12), cloudMat);
  b2.position.set(2, 0.2, 1);
  cloud.add(b2);

  return cloud;
}
