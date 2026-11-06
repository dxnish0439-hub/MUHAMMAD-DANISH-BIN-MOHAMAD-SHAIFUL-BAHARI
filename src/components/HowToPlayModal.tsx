/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Keyboard, Smartphone, CheckSquare } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 animate-fade-in select-none font-cairo"
      dir="rtl"
    >
      <div className="mc-panel max-w-xl w-full max-h-[90vh] overflow-y-auto no-scrollbar p-5 sm:p-7 rounded-lg border-4 border-amber-600 shadow-2xl flex flex-col gap-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-neutral-700 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎮</span>
            <h2 className="text-base sm:text-lg font-bold text-yellow-300 text-pixel-shadow">
              دَلِيلُ وَكَيْفِيَّةُ اللَّعِبِ
            </h2>
          </div>
          <button
            onClick={onClose}
            className="mc-button p-1.5 text-neutral-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-1.5">
            <Keyboard className="w-4 h-4" /> طَرِيقَةُ التَّحَكُّمِ عَلَى الْحَاسُوبِ وَالْهَاتِفِ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* PC Controls */}
            <div className="mc-card p-3 rounded border border-neutral-700">
              <div className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                <Keyboard className="w-4 h-4" /> الْحَاسُوبُ / لَابْتُوب:
              </div>
              <ul className="text-xs space-y-1.5 text-neutral-200">
                <li>⬅️ أَوْ <strong>A</strong> : التَّحَرُّكُ لِلْمَسَارِ الأَيْسَرِ</li>
                <li>➡️ أَوْ <strong>D</strong> : التَّحَرُّكُ لِلْمَسَارِ الأَيْمَنِ</li>
                <li>⬆️ أَوْ <strong>W</strong> أَوْ <strong>المسافة</strong> : الْقَفْزُ لِلأَعْلَى</li>
                <li>⬇️ أَوْ <strong>S</strong> : الِانْزِلَاقُ لِلأَسْفَلِ</li>
              </ul>
            </div>

            {/* Mobile Controls */}
            <div className="mc-card p-3 rounded border border-neutral-700">
              <div className="text-xs font-bold text-teal-400 mb-2 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" /> الْهَوَاتِفُ الذَّكِيَّةُ (أَنْدْرُويْد / iOS):
              </div>
              <ul className="text-xs space-y-1.5 text-neutral-200">
                <li>👈 <strong>سَحْبٌ لِلْيَمِينِ</strong> : التَّحَرُّكُ يَمِينًا</li>
                <li>👉 <strong>سَحْبٌ لِلْيَسَارِ</strong> : التَّحَرُّكُ يَسَارًا</li>
                <li>⬆️ <strong>سَحْبٌ لِلأَعْلَى</strong> : الْقَفْزُ</li>
                <li>⬇️ <strong>سَحْبٌ لِلأَسْفَلِ</strong> : الِانْزِلَاقُ</li>
                <li>📱 <strong>لَوْحَةُ اللَّمْسِ</strong> : أَزْرَارٌ شَفَّافَةٌ فِي الشَّاشَةِ!</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mechanics Section */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4" /> قَوَاعِدُ اللَّعِبِ وَالْمُسَابَقَةِ
          </h3>
          <div className="mc-card p-3 rounded border border-neutral-700 text-xs space-y-2 text-neutral-200 leading-relaxed">
            <p>
              🏃‍♂️ <strong>٣ مَسَارَاتٍ لِلرَّكْضِ:</strong> تَفَادَ عَرَبَاتِ الْقِطَارِ، وَالْجُدْرَانَ الْحَجَرِيَّةَ، وَحُفَرَ الْحِمَمِ الْبُرْكَانِيَّةِ (اللَّافَا).
            </p>
            <p>
              ❤️ <strong>٧ قُلُوبٍ:</strong> تَبْدَأُ الْمُغَامَرَةَ بِـ <strong>٧ قُلُوبٍ</strong>. يُنْقَصُ قَلْبٌ وَاحِدٌ عِنْدَ الِاصْطِدَامِ أَوْ عِنْدَ الإِجَابَةِ الْخَاطِئَةِ.
            </p>
            <p>
              💥 <strong>خَطَرُ الـ CREEPER:</strong> كُلُّ إِجَابَةٍ خَاطِئَةٍ تَجْلِبُ كَائِنَ الـ Creeper لِيَفْجُرَ قَلْبًا وَاحِدًا!
            </p>
            <p>
              🌀 <strong>١٠ مَحَطَّاتِ تَفَتُّشٍ:</strong> ادْخُلْ بَوَّابَاتِ النِّيزَر لِلإِجَابَةِ عَنْ أَسْئِلَةِ آدَابِ التَّوَاصُلِ الرَّقْمِيِّ.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mc-button mc-button-green w-full py-3 px-4 font-bold text-xs sm:text-sm text-white mt-1"
        >
          فَهِمْتُ ذَلِكَ، أَنَا مُسْتَعِدٌّ لِلْبَدْءِ!
        </button>
      </div>
    </div>
  );
};
