import React from 'react';
import { GodId } from '../types/game';
import { X, Zap, Flame, Wind, Sparkles } from 'lucide-react';

interface GodPowerModalProps {
  god: GodId;
  cost: number;
  canUse: boolean;
  usedThisTurn: boolean;
  onClose: () => void;
  onUse: () => void;
}

export const GodPowerModal: React.FC<GodPowerModalProps> = ({
  god,
  cost,
  canUse,
  usedThisTurn,
  onClose,
  onUse,
}) => {
  const isPyros = god === 'PYROS';

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-teal-500/60 rounded-3xl p-6 max-w-sm w-full text-slate-100 shadow-2xl space-y-4">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pt-2">
          <div className={`p-3 rounded-2xl border ${isPyros ? 'bg-red-950/60 border-red-500/40 text-red-400' : 'bg-teal-950/60 border-teal-500/40 text-teal-300'}`}>
            {isPyros ? <Flame className="w-8 h-8" /> : <Wind className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-100">Pouvoir Divin : {god}</h2>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 mt-0.5">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              <span>Coût : {cost} PA</span>
            </div>
          </div>
        </div>

        {/* Description Box */}
        <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs md:text-sm leading-relaxed">
          <div className="font-bold text-slate-200">
            {isPyros ? '🔥 Colère Infernale' : '🌪️ Souffle Éolien'}
          </div>
          <p className="text-slate-300">
            {isPyros
              ? 'Inflige 2 dégâts directs à la première créature ennemie présente sur le plateau.'
              : 'Octroie +1 PM (Point de Mouvement) à une créature alliée ET vous fait piocher 1 carte immédiatement.'}
          </p>
          {usedThisTurn && (
            <p className="text-amber-400 text-xs italic font-semibold pt-1 border-t border-slate-800">
              ⚠️ Ce pouvoir a déjà été utilisé ce tour-ci.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={() => {
              onUse();
              onClose();
            }}
            disabled={!canUse}
            className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all ${
              canUse
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Utiliser le Pouvoir</span>
          </button>
        </div>

      </div>
    </div>
  );
};
