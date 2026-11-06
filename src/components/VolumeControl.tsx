/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, X, Sliders } from 'lucide-react';
import { soundManager } from '../services/audio';

interface VolumeControlProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  isMuted,
  onToggleMute,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(() => soundManager.getVolume());
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync external mute changes
    setVolume(soundManager.getVolume());
  }, [isMuted]);

  // Handle outside click to close popover
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('pointerdown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
    soundManager.setVolume(newVol);
  };

  return (
    <div
      ref={panelRef}
      className="fixed top-3 left-3 sm:top-4 sm:left-4 z-[70] select-none text-white pointer-events-auto"
      dir="rtl"
    >
      {/* Floating Speaker Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`mc-button p-2.5 rounded flex items-center justify-center transition-transform active:scale-90 shadow-xl border-2 ${
          isOpen
            ? 'mc-button-gold border-yellow-300 ring-2 ring-yellow-400'
            : isMuted
            ? 'border-red-500 bg-red-950/70'
            : 'border-neutral-600 bg-neutral-800/90 hover:border-amber-400'
        }`}
        title={isMuted ? 'تَشْغِيلُ الصَّوْتِ' : 'مُسْتَوَى الصَّوْتِ'}
        aria-label="التحكم في الصوت"
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-red-400" />
        ) : (
          <Volume2 className="w-5 h-5 text-emerald-400" />
        )}
      </button>

      {/* Floating Popover Panel */}
      {isOpen && (
        <div className="absolute top-12 left-0 w-72 sm:w-80 mc-panel p-4 rounded-lg shadow-2xl border-4 border-amber-500 bg-[#242424] animate-fade-in flex flex-col gap-3.5">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-neutral-700 pb-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span className="font-cairo font-bold text-sm text-yellow-300 text-pixel-shadow">
                مُسْتَوَى الصَّوْتِ
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="mc-button p-1 text-neutral-300 hover:text-white"
              title="إِغْلَاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Volume Percentage Display */}
          <div className="flex items-center justify-between font-cairo">
            <span className="text-xs text-neutral-300">النِّسْبَةُ الْمِئَوِيَّةُ:</span>
            <span className="font-pixel text-xs sm:text-sm text-yellow-300 bg-neutral-900 px-2 py-1 rounded border border-neutral-700 tabular-nums">
              {isMuted ? '٠٪ (مَكْتُوم)' : `${volume}٪`}
            </span>
          </div>

          {/* Horizontal Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-pixel text-neutral-400">٠</span>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleSliderChange}
              className="mc-slider flex-1 rounded-sm"
            />
            <span className="text-xs font-pixel text-neutral-400">١٠٠</span>
          </div>

          {/* Mute / Unmute Button */}
          <button
            onClick={onToggleMute}
            className={`mc-button w-full py-2.5 px-3 rounded flex items-center justify-center gap-2 font-cairo font-bold text-xs transition-colors ${
              isMuted ? 'mc-button-green text-white' : 'mc-button-gold text-white'
            }`}
          >
            {isMuted ? (
              <>
                <Volume2 className="w-4 h-4" />
                <span>تَشْغِيلُ الصَّوْتِ</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span>كَتْمُ الصَّوْتِ</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
