import React from 'react';
import { GameLog } from '../types/game';
import { X, Scroll, Flame, Zap, Shield, Trophy } from 'lucide-react';

interface HistoryModalProps {
  logs: GameLog[];
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ logs, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 max-w-lg w-full h-[80vh] flex flex-col text-slate-100 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Historique des Actions</h2>
              <p className="text-xs text-slate-400">Toutes les actions et mouvements du combat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto space-y-2 py-4 pr-1">
          {logs.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-8">
              Aucune action enregistrée pour l'instant.
            </div>
          ) : (
            logs.slice().reverse().map(log => (
              <div
                key={log.id}
                className={`p-3 rounded-xl border text-xs md:text-sm leading-relaxed ${
                  log.type === 'VICTORY'
                    ? 'bg-amber-950/60 border-amber-500/40 text-amber-200 font-bold'
                    : log.type === 'PRISM'
                    ? 'bg-purple-950/50 border-purple-800/40 text-purple-200'
                    : log.type === 'COMBAT'
                    ? 'bg-red-950/40 border-red-900/30 text-red-200'
                    : log.type === 'SPELL'
                    ? 'bg-blue-950/40 border-blue-900/30 text-blue-200'
                    : log.type === 'GOD_POWER'
                    ? 'bg-teal-950/40 border-teal-900/30 text-teal-200'
                    : 'bg-slate-800/40 border-slate-700/30 text-slate-300'
                }`}
              >
                {log.text}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
