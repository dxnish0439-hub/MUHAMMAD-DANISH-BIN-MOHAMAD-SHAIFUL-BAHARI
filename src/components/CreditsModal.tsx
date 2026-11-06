/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, BookOpen, ShieldCheck, HeartHandshake } from 'lucide-react';

interface CreditsModalProps {
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 animate-fade-in select-none font-cairo"
      dir="rtl"
    >
      <div className="mc-panel max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar p-5 sm:p-7 rounded-lg border-4 border-amber-600 shadow-2xl flex flex-col gap-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-neutral-700 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📜</span>
            <h2 className="text-base sm:text-lg font-bold text-yellow-300 text-pixel-shadow">
              الأَهْدَافُ التَّرْبَوِيَّةُ وَالْمَعْلُومَاتُ
            </h2>
          </div>
          <button
            onClick={onClose}
            className="mc-button p-1.5 text-neutral-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3 text-xs sm:text-sm text-neutral-200">
          <div className="mc-card p-3 rounded border border-neutral-700">
            <div className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> الْمَوْضُوعُ التَّعْلِيمِيُّ
            </div>
            <p className="font-bold text-white text-sm">
              آدَابُ التَّوَاصُلِ فِي الْعَالَمِ الرَّقْمِيِّ
            </p>
            <p className="text-neutral-300 text-xs mt-1 leading-relaxed">
              مُسْتَوْحَاةٌ مِنْ قِصَّةِ أَمِيرٍ حَوْلَ احْتِرَامِ خُصُوصِيَّةِ صُوَرِ الآخَرِينَ، وَطَلَبِ الإِذْنِ الْمُسْبَقِ، وَشَجَاعَةِ الِاعْتِذَارِ الصَّادِقِ عِنْدَ ارْتِكَابِ الْخَطَأِ.
            </p>
          </div>

          <div className="mc-card p-3 rounded border border-neutral-700">
            <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> الأَهْدَافُ السُّلُوكِيَّةُ
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-neutral-300 leading-relaxed">
              <li>غَرْسُ احْتِرَامِ خُصُوصِيَّةِ الأَفْرَادِ فِي الْفَضَاءِ الرَّقْمِيِّ.</li>
              <li>مَنْعُ التَّنَمُّرِ الإِلِكْتْرُونِيِّ وَالسُّخْرِيَةِ مِنْ صُوَرِ الزُّمَلَاءِ.</li>
              <li>تَعْزِيزُ قِيمَةِ الِاعْتِذَارِ وَالتَّسَامُحِ بَيْنَ الأَصْدِقَاءِ.</li>
              <li>بِنَاءُ جِيلٍ وَاعٍ يَسْتَخْدِمُ الإِنْتَرْنِت بِأَخْلَاقٍ رَفِيعَةٍ.</li>
            </ul>
          </div>

          <div className="mc-card p-3 rounded border border-neutral-700">
            <div className="text-xs font-bold text-teal-400 mb-1 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4" /> الرِّسَالَةُ الْخِتَامِيَّةُ
            </div>
            <p className="text-xs text-neutral-300 italic leading-relaxed">
              "نَحْنُ جِيلٌ رَقْمِيٌّ، وَوَاجِبُنَا اسْتِخْدَامُ التِّكْنُولُوجْيَا بِكُلِّ أَدَبٍ، وَأَخْلَاقٍ، وَمَسْؤُولِيَّةٍ."
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mc-button w-full py-2.5 px-4 font-bold text-xs text-white mt-1"
        >
          إِغْلَاق
        </button>
      </div>
    </div>
  );
};
