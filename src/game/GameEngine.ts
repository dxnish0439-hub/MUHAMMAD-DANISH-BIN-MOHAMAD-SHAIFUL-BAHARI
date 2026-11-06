/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CharacterSkin } from '../types/game';
import {
  CharacterRig,
  createCharacterRig,
  createTrainCarriage,
  createCobblestoneBarrier,
  createLowWoodenFence,
  createOverheadBeam,
  createLavaPit,
  createGoldCoin,
  createCheckpointPortal,
  createMinecraftTree,
  createVoxelCloud,
} from './voxelModels';
import {
  createRailTrackTexture,
  createGrassTopTexture,
} from './proceduralTextures';
import { soundManager } from '../services/audio';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number, coins: number, distance: number) => void;
  onLivesUpdate: (lives: number) => void;
  onCheckpointReached: (checkpointIndex: number) => void;
  onGameOver: () => void;
  onVictory: () => void;
}

export type ObstacleType =
  | 'train'
  | 'cobblestone'
  | 'low_fence'
  | 'overhead_beam'
  | 'lava_pit';

interface ObstacleItem {
  id: number;
  type: ObstacleType;
  lane: number; // 0, 1, 2
  z: number;
  mesh: THREE.Group;
  hit: boolean;
  box: THREE.Box3;
}

interface CoinItem {
  id: number;
  lane: number;
  x: number;
  y: number;
  z: number;
  mesh: THREE.Group;
  collected: boolean;
}

interface TrackChunk {
  zStart: number;
  zEnd: number;
  group: THREE.Group;
}

interface Particle {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
}

const LANE_WIDTH = 2.6;
const LANE_X = [-LANE_WIDTH, 0, LANE_WIDTH]; // Left, Center, Right
const CHUNK_LENGTH = 60;
const CHECKPOINT_DISTANCE = 140; // meters per checkpoint

export class GameEngine {
  private container: HTMLElement;
  private callbacks: GameEngineCallbacks;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;

  // Character
  private playerRig: CharacterRig;
  private playerX: number = 0;
  private targetLane: number = 1; // 0: left, 1: center, 2: right
  private playerY: number = 0;
  private playerVY: number = 0;
  private isJumping: boolean = false;
  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private runTime: number = 0;
  private playerZ: number = 0;

  // Game state
  private isRunning: boolean = false;
  private lives: number = 7;
  private coins: number = 0;
  private score: number = 0;
  private distanceRun: number = 0;
  private speed: number = 18; // units per second
  private currentCheckpoint: number = 0;
  private isInvulnerable: boolean = false;
  private invulnerableTimer: number = 0;
  private cameraShake: number = 0;
  private hitstopTimer: number = 0;

  // World chunks & objects
  private trackChunks: TrackChunk[] = [];
  private obstacles: ObstacleItem[] = [];
  private coinsList: CoinItem[] = [];
  private particles: Particle[] = [];
  private checkpointPortal: THREE.Group | null = null;
  private nextCheckpointZ: number = -CHECKPOINT_DISTANCE;

  // Materials & reusable textures
  private railTrackTex: THREE.CanvasTexture;
  private grassTex: THREE.CanvasTexture;
  private particleGeo: THREE.BoxGeometry;
  private goldParticleMat: THREE.MeshBasicMaterial;
  private hitParticleMat: THREE.MeshBasicMaterial;

  // Loop & software GL
  private frameId: number = 0;
  private isSoftwareGl: boolean = false;
  private isDisposed: boolean = false;

  constructor(
    container: HTMLElement,
    skin: CharacterSkin,
    callbacks: GameEngineCallbacks
  ) {
    this.container = container;
    this.callbacks = callbacks;

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Fog (Minecraft Horizon Sky)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x70a5ff); // Minecraft daylight sky blue
    this.scene.fog = new THREE.Fog(0x70a5ff, 45, 120);

    // 4. Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    );
    this.camera.position.set(0, 3.5, 6.0);

    // 5. Lighting (Warm Sun key light + Cool Hemisphere Fill)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x445544, 0.7);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
    sunLight.position.set(20, 40, 20);
    sunLight.castShadow = !this.isSoftwareGl;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // 6. Mandatory Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 7. Textures & Shared Assets
    this.railTrackTex = createRailTrackTexture();
    this.railTrackTex.wrapS = THREE.RepeatWrapping;
    this.railTrackTex.wrapT = THREE.RepeatWrapping;
    this.railTrackTex.repeat.set(1, 20);

    this.grassTex = createGrassTopTexture();
    this.grassTex.wrapS = THREE.RepeatWrapping;
    this.grassTex.wrapT = THREE.RepeatWrapping;
    this.grassTex.repeat.set(8, 20);

    this.particleGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    this.goldParticleMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    this.hitParticleMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    // 8. Player Rig
    this.playerRig = createCharacterRig(skin);
    this.playerRig.group.position.set(0, 0, 0);
    this.scene.add(this.playerRig.group);

    // 9. Floating Voxel Clouds
    for (let c = 0; c < 8; c++) {
      const cloud = createVoxelCloud();
      cloud.position.set(
        (Math.random() - 0.5) * 80,
        20 + Math.random() * 8,
        -c * 25
      );
      this.scene.add(cloud);
    }

    // 10. Clock
    this.clock = new THREE.Clock();

    // 11. Initial World Generation (Generate 4 chunks ahead)
    for (let i = 0; i < 4; i++) {
      this.spawnTrackChunk(-i * CHUNK_LENGTH);
    }

    // Spawn Checkpoint Portal for #1
    this.spawnCheckpointPortal(1, this.nextCheckpointZ);

    // 12. Prewarm Shaders
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    // Resize listener
    window.addEventListener('resize', this.onResize);

    // Start loop
    this.tick();
  }

  // --- World Generation ---

  private spawnTrackChunk(zStart: number) {
    const chunkGroup = new THREE.Group();
    const length = CHUNK_LENGTH;
    const zCenter = zStart - length / 2;

    // Ground: Grass terrain outside rails
    const groundGeo = new THREE.PlaneGeometry(36, length);
    const groundMat = new THREE.MeshStandardMaterial({
      map: this.grassTex,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, zCenter);
    ground.receiveShadow = !this.isSoftwareGl;
    chunkGroup.add(ground);

    // Track Bed (Cobblestone / Gravel foundation under rails)
    const trackBedGeo = new THREE.BoxGeometry(9.2, 0.2, length);
    const trackBedMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      roughness: 0.95,
    });
    const trackBed = new THREE.Mesh(trackBedGeo, trackBedMat);
    trackBed.position.set(0, 0.05, zCenter);
    trackBed.receiveShadow = !this.isSoftwareGl;
    chunkGroup.add(trackBed);

    // 3 Railway Tracks (Left, Center, Right)
    LANE_X.forEach((lx) => {
      const railGeo = new THREE.PlaneGeometry(2.2, length);
      const railMat = new THREE.MeshStandardMaterial({
        map: this.railTrackTex,
        roughness: 0.6,
        metalness: 0.4,
      });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.rotation.x = -Math.PI / 2;
      rail.position.set(lx, 0.16, zCenter);
      chunkGroup.add(rail);
    });

    // Side Scenery: Trees and Stone lamp posts
    const numDecorations = 4;
    for (let d = 0; d < numDecorations; d++) {
      const zOffset = zStart - (d * (length / numDecorations)) - 5;

      // Left tree / building
      const treeL = createMinecraftTree();
      treeL.position.set(-6.8 - Math.random() * 4, 0, zOffset);
      chunkGroup.add(treeL);

      // Right tree
      const treeR = createMinecraftTree();
      treeR.position.set(6.8 + Math.random() * 4, 0, zOffset - 8);
      chunkGroup.add(treeR);

      // Blocky Street Redstone Lamp
      const lampGeo = new THREE.BoxGeometry(0.3, 3.2, 0.3);
      const lampMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(-5.0, 1.6, zOffset + 6);
      chunkGroup.add(lamp);

      const lampHeadGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
      const lampHeadMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.8,
      });
      const lampHead = new THREE.Mesh(lampHeadGeo, lampHeadMat);
      lampHead.position.set(-5.0, 3.4, zOffset + 6);
      chunkGroup.add(lampHead);
    }

    this.scene.add(chunkGroup);
    this.trackChunks.push({
      zStart,
      zEnd: zStart - length,
      group: chunkGroup,
    });

    // Spawn obstacles and coins in this chunk (only if past start area)
    if (zStart < -25) {
      this.populateChunkContent(zStart, length);
    }
  }

  private populateChunkContent(zStart: number, length: number) {
    const spacing = 18;
    const count = Math.floor(length / spacing);

    for (let i = 0; i < count; i++) {
      const z = zStart - i * spacing - 8;

      // Don't spawn obstacle right on top of checkpoint portal
      if (Math.abs(z - this.nextCheckpointZ) < 16) {
        continue;
      }

      const patternType = Math.floor(Math.random() * 5);
      const freeLane = Math.floor(Math.random() * 3);

      if (patternType === 0) {
        // Train carriage on one lane, coins on other lanes
        const trainLane = (freeLane + 1) % 3;
        this.addObstacle('train', trainLane, z);
        this.spawnCoinRow(freeLane, z - 4, 5);
      } else if (patternType === 1) {
        // Low fence (jumpable) with arched coins over it
        const fenceLane = Math.floor(Math.random() * 3);
        this.addObstacle('low_fence', fenceLane, z);
        this.spawnCoinArc(fenceLane, z);
        // Another lane has cobblestone
        const blockLane = (fenceLane + 1) % 3;
        this.addObstacle('cobblestone', blockLane, z);
      } else if (patternType === 2) {
        // Overhead beam (slide under) on 1 or 2 lanes
        const beamLane = freeLane;
        this.addObstacle('overhead_beam', beamLane, z);
        this.spawnCoinRow(beamLane, z - 3, 4, 0.4); // low coins for slide!
        // Another lane has train
        const trainLane = (freeLane + 1) % 3;
        this.addObstacle('train', trainLane, z);
      } else if (patternType === 3) {
        // Lava pit (jumpable)
        const lavaLane = Math.floor(Math.random() * 3);
        this.addObstacle('lava_pit', lavaLane, z);
        this.spawnCoinArc(lavaLane, z);
      } else {
        // Cobblestone barriers leaving freeLane open with coins
        for (let l = 0; l < 3; l++) {
          if (l !== freeLane) {
            this.addObstacle('cobblestone', l, z);
          }
        }
        this.spawnCoinRow(freeLane, z - 4, 5);
      }
    }
  }

  private addObstacle(type: ObstacleType, lane: number, z: number) {
    let mesh: THREE.Group;
    if (type === 'train') {
      mesh = createTrainCarriage();
    } else if (type === 'cobblestone') {
      mesh = createCobblestoneBarrier();
    } else if (type === 'low_fence') {
      mesh = createLowWoodenFence();
    } else if (type === 'overhead_beam') {
      mesh = createOverheadBeam();
    } else {
      mesh = createLavaPit();
    }

    mesh.position.set(LANE_X[lane], 0, z);
    this.scene.add(mesh);

    const box = new THREE.Box3().setFromObject(mesh);

    this.obstacles.push({
      id: Math.random(),
      type,
      lane,
      z,
      mesh,
      hit: false,
      box,
    });
  }

  private spawnCoinRow(lane: number, startZ: number, count: number, height: number = 0.9) {
    for (let c = 0; c < count; c++) {
      const z = startZ - c * 2.2;
      const coinMesh = createGoldCoin();
      coinMesh.position.set(LANE_X[lane], height, z);
      this.scene.add(coinMesh);

      this.coinsList.push({
        id: Math.random(),
        lane,
        x: LANE_X[lane],
        y: height,
        z,
        mesh: coinMesh,
        collected: false,
      });
    }
  }

  private spawnCoinArc(lane: number, centerZ: number) {
    // 5 coins forming an arc over a hurdle
    const offsets = [-3, -1.5, 0, 1.5, 3];
    const heights = [0.8, 1.6, 2.2, 1.6, 0.8];

    offsets.forEach((oz, idx) => {
      const coinMesh = createGoldCoin();
      const z = centerZ + oz;
      const y = heights[idx];
      coinMesh.position.set(LANE_X[lane], y, z);
      this.scene.add(coinMesh);

      this.coinsList.push({
        id: Math.random(),
        lane,
        x: LANE_X[lane],
        y,
        z,
        mesh: coinMesh,
        collected: false,
      });
    });
  }

  private spawnCheckpointPortal(num: number, zPos: number) {
    if (this.checkpointPortal) {
      this.scene.remove(this.checkpointPortal);
    }
    this.checkpointPortal = createCheckpointPortal(num);
    this.checkpointPortal.position.set(0, 0, zPos);
    this.scene.add(this.checkpointPortal);
  }

  // --- Input Controls ---

  public moveLeft() {
    if (!this.isRunning) return;
    if (this.targetLane > 0) {
      this.targetLane--;
    }
  }

  public moveRight() {
    if (!this.isRunning) return;
    if (this.targetLane < 2) {
      this.targetLane++;
    }
  }

  public jump() {
    if (!this.isRunning) return;
    if (!this.isJumping) {
      this.isJumping = true;
      this.playerVY = 12.0;
      soundManager.playJump();
    }
  }

  public slide() {
    if (!this.isRunning) return;
    this.isSliding = true;
    this.slideTimer = 0.68;
    // If airborne, fast dive
    if (this.isJumping) {
      this.playerVY = -12.0;
    }
    soundManager.playSlide();
  }

  // --- Game Loop ---

  private tick = () => {
    if (this.isDisposed) return;

    const rawDt = this.clock.getDelta();
    const dt = Math.min(rawDt, 0.05); // clamp delta time

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
    } else {
      this.updateSimulation(dt);
    }

    this.render();

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 60);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private updateSimulation(dt: number) {
    // Animate coins rotation and floating
    this.coinsList.forEach((coin) => {
      if (!coin.collected) {
        coin.mesh.rotation.y += dt * 3.5;
      }
    });

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.position.z += p.vz * dt;
      p.vy -= 15 * dt; // gravity
      const scale = 1 - p.life / p.maxLife;
      p.mesh.scale.set(scale, scale, scale);

      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }

    if (!this.isRunning) {
      // Idle character animation on start menu or celebration
      this.runTime += dt;
      this.playerRig.updateAnimation(this.runTime, false, false, this.currentCheckpoint >= 10);
      return;
    }

    // 1. Advance Player forward along -Z
    this.playerZ -= this.speed * dt;
    this.distanceRun = Math.abs(this.playerZ);
    this.runTime += dt;
    this.score = Math.floor(this.distanceRun * 2 + this.coins * 10);

    // Speed up gradually as runner progresses
    this.speed = Math.min(26, 18 + (this.distanceRun / 300) * 2.5);

    // 2. Smooth Lane Transition (X axis)
    const targetX = LANE_X[this.targetLane];
    this.playerX = THREE.MathUtils.damp(this.playerX, targetX, 16, dt);

    // 3. Jump Physics (Y axis)
    if (this.isJumping) {
      this.playerY += this.playerVY * dt;
      this.playerVY -= 34 * dt; // gravity
      if (this.playerY <= 0) {
        this.playerY = 0;
        this.playerVY = 0;
        this.isJumping = false;
      }
    }

    // 4. Slide duration
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // 5. Invulnerability flash timer
    if (this.isInvulnerable) {
      this.invulnerableTimer -= dt;
      this.playerRig.group.visible = Math.floor(this.invulnerableTimer * 12) % 2 === 0;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
        this.playerRig.group.visible = true;
      }
    }

    // 6. Update Player Rig Position & Anim
    this.playerRig.group.position.set(this.playerX, this.playerY, this.playerZ);
    // Slight body lean on lane switch
    const laneDelta = targetX - this.playerX;
    this.playerRig.group.rotation.z = -laneDelta * 0.12;
    this.playerRig.group.rotation.y = laneDelta * 0.08;

    this.playerRig.updateAnimation(this.runTime, this.isJumping, this.isSliding, false);

    // 7. Dynamic Camera Follow with Smooth Spring & Shake
    if (this.cameraShake > 0) {
      this.cameraShake -= dt * 4;
    }
    const shakeX = (Math.random() - 0.5) * this.cameraShake * 0.4;
    const shakeY = (Math.random() - 0.5) * this.cameraShake * 0.4;

    this.camera.position.x = THREE.MathUtils.damp(
      this.camera.position.x,
      this.playerX * 0.45 + shakeX,
      12,
      dt
    );
    this.camera.position.y = THREE.MathUtils.damp(
      this.camera.position.y,
      this.playerY * 0.4 + 3.4 + shakeY,
      12,
      dt
    );
    this.camera.position.z = this.playerZ + 6.2;
    this.camera.lookAt(this.playerX * 0.3, this.playerY * 0.3 + 1.3, this.playerZ - 6.0);

    // 8. Track Recycling
    const lastChunk = this.trackChunks[this.trackChunks.length - 1];
    if (this.playerZ - 100 < lastChunk.zEnd) {
      this.spawnTrackChunk(lastChunk.zEnd);
    }
    // Clean up old track chunks behind player
    if (this.trackChunks.length > 5 && this.trackChunks[0].zEnd > this.playerZ + 40) {
      const old = this.trackChunks.shift();
      if (old) this.scene.remove(old.group);
    }

    // 9. Coin Collections
    for (let i = this.coinsList.length - 1; i >= 0; i--) {
      const c = this.coinsList[i];
      if (c.collected) continue;

      // Distance check
      const dz = c.z - this.playerZ;
      const dx = c.x - this.playerX;
      const dy = c.y - (this.playerY + 0.9);

      if (Math.abs(dz) < 1.4 && Math.abs(dx) < 1.1 && Math.abs(dy) < 1.5) {
        c.collected = true;
        this.scene.remove(c.mesh);
        this.coins++;
        soundManager.playCoin();
        this.spawnBurstParticles(c.x, c.y, c.z, this.goldParticleMat, 6);
      } else if (c.z > this.playerZ + 15) {
        // Despawn past coin
        this.scene.remove(c.mesh);
        this.coinsList.splice(i, 1);
      }
    }

    // 10. Obstacle Collisions
    if (!this.isInvulnerable) {
      // Define player effective collision box
      const pBox = new THREE.Box3();
      const pHeight = this.isSliding ? 0.75 : 1.7;
      pBox.min.set(this.playerX - 0.4, this.playerY, this.playerZ - 0.35);
      pBox.max.set(this.playerX + 0.4, this.playerY + pHeight, this.playerZ + 0.35);

      for (let i = 0; i < this.obstacles.length; i++) {
        const obs = this.obstacles[i];
        if (obs.hit) continue;

        // Proximity optimization
        if (Math.abs(obs.z - this.playerZ) > 4.5) continue;

        obs.box.setFromObject(obs.mesh);

        // Check AABB collision
        if (pBox.intersectsBox(obs.box)) {
          // Check specific bypasses:
          if ((obs.type === 'low_fence' || obs.type === 'lava_pit') && this.playerY > 0.85) {
            // Cleared by jumping over!
            continue;
          }
          if (obs.type === 'overhead_beam' && this.isSliding) {
            // Cleared by sliding under!
            continue;
          }

          // Real Collision!
          obs.hit = true;
          this.handleHit();
          break;
        }
      }
    }

    // Clean up past obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      if (this.obstacles[i].z > this.playerZ + 20) {
        this.scene.remove(this.obstacles[i].mesh);
        this.obstacles.splice(i, 1);
      }
    }

    // 11. Checkpoint Reach Trigger
    if (this.currentCheckpoint < 10 && this.playerZ <= this.nextCheckpointZ + 1.0) {
      this.triggerCheckpoint();
    }

    // 12. Notify HUD
    this.callbacks.onScoreUpdate(this.score, this.coins, Math.floor(this.distanceRun));
  }

  private handleHit() {
    this.lives -= 1;
    soundManager.playCrash();
    this.cameraShake = 0.8;
    this.hitstopTimer = 0.06; // 60ms hitstop impact feel
    this.isInvulnerable = true;
    this.invulnerableTimer = 1.4;

    this.spawnBurstParticles(this.playerX, this.playerY + 0.8, this.playerZ, this.hitParticleMat, 12);
    this.callbacks.onLivesUpdate(this.lives);

    if (this.lives <= 0) {
      this.isRunning = false;
      this.callbacks.onGameOver();
    }
  }

  private triggerCheckpoint() {
    this.currentCheckpoint += 1;
    soundManager.playPortal();
    this.isRunning = false;

    // Call quiz modal callback with current question index (0-based)
    this.callbacks.onCheckpointReached(this.currentCheckpoint - 1);
  }

  public resumeAfterCheckpoint(isAllCompleted: boolean) {
    if (isAllCompleted || this.currentCheckpoint >= 10) {
      this.isRunning = false;
      soundManager.playVictory();
      this.callbacks.onVictory();
      return;
    }

    // Prepare next checkpoint
    this.nextCheckpointZ -= CHECKPOINT_DISTANCE;
    this.spawnCheckpointPortal(this.currentCheckpoint + 1, this.nextCheckpointZ);
    this.isRunning = true;
  }

  private spawnBurstParticles(
    x: number,
    y: number,
    z: number,
    material: THREE.MeshBasicMaterial,
    count: number
  ) {
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.particleGeo, material);
      mesh.position.set(x, y, z);
      this.scene.add(mesh);

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 4.0;
      this.particles.push({
        mesh,
        vx: Math.cos(angle) * speed,
        vy: 2.0 + Math.random() * 4.0,
        vz: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.3,
      });
    }
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  // --- Public Control APIs ---

  public start() {
    this.isRunning = true;
    soundManager.startBgm();
  }

  public pause() {
    this.isRunning = false;
  }

  public resume() {
    this.isRunning = true;
  }

  public reset(skin: CharacterSkin) {
    this.playerX = 0;
    this.targetLane = 1;
    this.playerY = 0;
    this.playerVY = 0;
    this.playerZ = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.isRunning = false;
    this.lives = 7;
    this.coins = 0;
    this.score = 0;
    this.distanceRun = 0;
    this.currentCheckpoint = 0;
    this.speed = 18;
    this.nextCheckpointZ = -CHECKPOINT_DISTANCE;
    this.isInvulnerable = false;
    this.playerRig.group.visible = true;

    // Update skin
    this.playerRig.updateSkin(skin);
    this.playerRig.group.position.set(0, 0, 0);
    this.playerRig.group.rotation.set(0, 0, 0);

    // Clear obstacles
    this.obstacles.forEach((o) => this.scene.remove(o.mesh));
    this.obstacles = [];

    // Clear coins
    this.coinsList.forEach((c) => this.scene.remove(c.mesh));
    this.coinsList = [];

    // Clear particles
    this.particles.forEach((p) => this.scene.remove(p.mesh));
    this.particles = [];

    // Clear and respawn track chunks
    this.trackChunks.forEach((tc) => this.scene.remove(tc.group));
    this.trackChunks = [];

    for (let i = 0; i < 4; i++) {
      this.spawnTrackChunk(-i * CHUNK_LENGTH);
    }
    this.spawnCheckpointPortal(1, this.nextCheckpointZ);

    this.callbacks.onLivesUpdate(this.lives);
    this.callbacks.onScoreUpdate(0, 0, 0);
  }

  public setSkin(skin: CharacterSkin) {
    this.playerRig.updateSkin(skin);
  }

  public deductLife() {
    this.lives = Math.max(0, this.lives - 1);
    this.callbacks.onLivesUpdate(this.lives);
    return this.lives;
  }

  public getLives() {
    return this.lives;
  }

  public getCoins() {
    return this.coins;
  }

  public getScore() {
    return this.score;
  }

  public dispose() {
    this.isDisposed = true;
    window.removeEventListener('resize', this.onResize);
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    soundManager.stopBgm();

    this.renderer.dispose();
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
