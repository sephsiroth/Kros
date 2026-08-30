import React from 'react';
import { Card } from '../types/game';
import { Heart, Zap, Footprints, Target, Play, X, Sparkles, Shield } from 'lucide-react';

interface CardDetailModalProps {
  card: Card;
  canPlay: boolean;
  onClose: () => void;
  onPlay: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  canPlay,
  onClose,
  onPlay,
}) => {
  const isCreature = card.type === 'CREATURE';

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 max-w-sm w-full text-slate-100 shadow-2xl space-y-4">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pt-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 border border-amber-500/40 text-amber-300">
            {card.god} • {card.type}
          </span>
          <h2 className="text-2xl font-black text-slate-100 mt-2">{card.name}</h2>
        </div>

        {/* Large Illustration */}
        <div className="flex items-center justify-center h-32 bg-slate-950/50 rounded-2xl border border-slate-800 text-6xl shadow-inner my-2">
          {card.illustration}
        </div>

        {/* Description */}
        <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 leading-relaxed text-center">
          {card.description}
        </div>

        {/* Creature Stats Breakdown */}
        {isCreature && (
          <div className="grid grid-cols-4 gap-2 bg-slate-950/60 rounded-2xl p-3 border border-slate-800 text-center">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-semibold">PA</span>
              <span className="text-sm font-bold text-blue-400 flex items-center gap-0.5">
                <Zap className="w-3 h-3 fill-blue-400" /> {card.paCost}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-semibold">ATK</span>
              <span className="text-sm font-bold text-amber-400 flex items-center gap-0.5">
                <Zap className="w-3 h-3" /> {card.atk}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-semibold">PM</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-0.5">
                <Footprints className="w-3 h-3" /> {card.pm}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-semibold">PV</span>
              <span className="text-sm font-bold text-red-400 flex items-center gap-0.5">
                <Heart className="w-3 h-3 fill-red-400" /> {card.hp}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={onPlay}
            disabled={!canPlay}
            className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all ${
              canPlay
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Sélectionner / Jouer</span>
          </button>
        </div>

      </div>
    </div>
  );
};
