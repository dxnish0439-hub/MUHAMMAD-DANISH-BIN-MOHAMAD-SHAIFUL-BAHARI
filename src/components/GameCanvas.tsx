/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { GameEngine, GameEngineCallbacks } from '../game/GameEngine';
import { CharacterSkin } from '../types/game';

interface GameCanvasProps {
  skin: CharacterSkin;
  callbacks: GameEngineCallbacks;
  onEngineReady: (engine: GameEngine) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  skin,
  callbacks,
  onEngineReady,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Swipe gesture tracking for Android & mobile
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize 3D Engine
    const engine = new GameEngine(mountRef.current, skin, callbacks);
    engineRef.current = engine;
    onEngineReady(engine);

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field (e.g. leaderboard name input)
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          engine.moveLeft();
          break;
        case 'ArrowRight':
        case 'KeyD':
          engine.moveRight();
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          e.preventDefault();
          engine.jump();
          break;
        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          engine.slide();
          break;
      }
    };

    // Touch swipe handlers for Android / Mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now(),
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length === 0) return;

      const touchEnd = e.changedTouches[0];
      const dx = touchEnd.clientX - touchStartRef.current.x;
      const dy = touchEnd.clientY - touchStartRef.current.y;
      const elapsed = Date.now() - touchStartRef.current.time;

      const minSwipeDistance = 30; // pixels

      // If gesture was relatively quick
      if (elapsed < 600) {
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal swipe
          if (Math.abs(dx) > minSwipeDistance) {
            if (dx < 0) {
              engine.moveLeft();
            } else {
              engine.moveRight();
            }
          }
        } else {
          // Vertical swipe
          if (Math.abs(dy) > minSwipeDistance) {
            if (dy < 0) {
              engine.jump();
            } else {
              engine.slide();
            }
          }
        }
      }

      touchStartRef.current = null;
    };

    window.addEventListener('keydown', handleKeyDown);
    const element = mountRef.current;
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      engine.dispose();
      engineRef.current = null;
    };
  }, []); // Run once on mount

  // Update skin if changed
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSkin(skin);
    }
  }, [skin]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden bg-[#121214]"
      style={{ touchAction: 'none' }}
    />
  );
};
