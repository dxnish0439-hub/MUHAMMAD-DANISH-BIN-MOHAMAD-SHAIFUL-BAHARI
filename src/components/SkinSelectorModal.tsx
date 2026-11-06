/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Check, Lock, User } from 'lucide-react';
import { CharacterSkin } from '../types/game';
import { StorageService } from '../services/storage';

interface SkinSelectorModalProps {
  currentSkinId: string;
  onSelectSkin: (skin: CharacterSkin) => void;
  onClose: () => void;
}

export const SkinSelectorModal: React.FC<SkinSelectorModalProps> = ({
  currentSkinId,
  onSelectSkin,
  onClose,
}) => {
  const skins = StorageService.getAvailableSkins();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 animate-fade-in select-none font-cairo"
      dir="rtl"
    >
      <div className="mc-panel max-w-xl w-full max-h-[90vh] overflow-y-auto no-scrollbar p-5 sm:p-7 rounded-lg border-4 border-amber-600 shadow-2xl flex flex-col gap-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-neutral-700 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-yellow-300 text-pixel-shadow">
              اخْتِيَارُ شَخْصِيَّةِ مَاينكِرَافت
            </h2>
          </div>
          <button
            onClick={onClose}
            className="mc-button p-1.5 text-neutral-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Skin Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-1">
          {skins.map((skin) => {
            const isSelected = skin.id === currentSkinId;
            return (
              <div
                key={skin.id}
                onClick={() => {
                  if (skin.unlocked) {
                    onSelectSkin(skin);
                  }
                }}
                className={`mc-card p-3.5 rounded flex flex-col justify-between border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-yellow-400 bg-neutral-800/90 ring-2 ring-yellow-400/60'
                    : skin.unlocked
                    ? 'border-neutral-700 hover:border-amber-400 bg-neutral-900/60'
                    : 'border-neutral-800 opacity-55 cursor-not-allowed bg-neutral-950/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white">
                      {skin.name}
                    </span>
                    {isSelected ? (
                      <span className="text-[11px] font-bold text-yellow-300 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> مُفَعَّلٌ
                      </span>
                    ) : !skin.unlocked ? (
                      <span className="text-[11px] font-bold text-neutral-400 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-red-400" /> مُقْفَلٌ
                      </span>
                    ) : null}
                  </div>

                  {/* Character color badge representation */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-7 h-7 rounded border-2 border-black"
                      style={{ backgroundColor: `#${skin.shirtColor.toString(16).padStart(6, '0')}` }}
                      title="لَوْنُ الْقَمِيصِ"
                    />
                    <div
                      className="w-7 h-7 rounded border-2 border-black"
                      style={{ backgroundColor: `#${skin.pantsColor.toString(16).padStart(6, '0')}` }}
                      title="لَوْنُ السِّرْوَالِ"
                    />
                    <div
                      className="w-7 h-7 rounded border-2 border-black"
                      style={{ backgroundColor: `#${skin.skinColor.toString(16).padStart(6, '0')}` }}
                      title="لَوْنُ الْبَشَرَةِ"
                    />
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {skin.description}
                  </p>
                </div>

                {!skin.unlocked && skin.requiredStreak && (
                  <div className="mt-2 text-xs font-bold text-amber-400">
                    🔒 يُفْتَحُ عِنْدَ التَّتَابُعِ لِمُدَّةِ {skin.requiredStreak} أَيَّام!
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="mc-button mc-button-green w-full py-2.5 px-4 font-bold text-xs sm:text-sm text-white mt-1"
        >
          تَأْكِيدُ الِاخْتِيَارِ
        </button>
      </div>
    </div>
  );
};
