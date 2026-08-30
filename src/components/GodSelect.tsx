import React from 'react';
import { GodId } from '../types/game';
import { Flame, Wind, Shield, Zap, Sparkles } from 'lucide-react';

interface GodSelectProps {
  onSelectGod: (god: GodId) => void;
}

export const GodSelect: React.FC<GodSelectProps> = ({ onSelectGod }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="text-center mb-8 max-w-xl">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-wider bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-md mb-2">
          KROS-LEGENDS
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Jeu de cartes tactique 5x5 sur navigateur et mobile
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* PYROS CARD */}
        <div
          onClick={() => onSelectGod('PYROS')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-red-900/40 bg-gradient-to-b from-red-950/60 to-slate-900/80 p-6 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-red-500/80 hover:shadow-2xl hover:shadow-red-500/20 active:scale-[0.98]"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Flame className="w-32 h-32 text-red-500" />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Flame className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-400">PYROS</h2>
              <span className="text-xs uppercase font-semibold text-red-300/70 tracking-widest">
                Guerrier du Feu
              </span>
            </div>
          </div>

          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Spécialiste de la force brute, des dégâts directs et des explosions de zone. Brûlez les défenseurs adverses et forcez le passage vers leurs Dofus !
          </p>

          <div className="space-y-2 text-xs text-slate-400 border-t border-red-900/30 pt-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Pouvoir Divin : Inflige 2 dégâts directs à un ennemi (2 PA)</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-400" />
              <span>Style : Créatures lourdes & Sorts dévastateurs</span>
            </div>
          </div>

          <button className="mt-6 w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-lg shadow-red-950/50 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Jouer Pyros
          </button>
        </div>

        {/* ZEPHIRA CARD */}
        <div
          onClick={() => onSelectGod('ZEPHIRA')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-teal-900/40 bg-gradient-to-b from-teal-950/60 to-slate-900/80 p-6 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-teal-400/80 hover:shadow-2xl hover:shadow-teal-500/20 active:scale-[0.98]"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wind className="w-32 h-32 text-teal-400" />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-teal-600/20 text-teal-300 border border-teal-500/30">
              <Wind className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-teal-300">ZEPHIRA</h2>
              <span className="text-xs uppercase font-semibold text-teal-200/70 tracking-widest">
                Archère du Vent
              </span>
            </div>
          </div>

          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Maîtresse de l'agilité, du tir à distance (Portée 2 et 3) et de la pioche. Contrôlez les lignes, repoussez les assaillants et frappez de loin !
          </p>

          <div className="space-y-2 text-xs text-slate-400 border-t border-teal-900/30 pt-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-teal-400" />
              <span>Pouvoir Divin : +1 PM à un allié + Piocher 1 carte (2 PA)</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Style : Attaques à portée, Repousse & Agilité</span>
            </div>
          </div>

          <button className="mt-6 w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-lg shadow-teal-950/50 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Jouer Zephira
          </button>
        </div>
      </div>
    </div>
  );
};
