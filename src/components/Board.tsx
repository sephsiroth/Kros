import React from 'react';
import { CreatureOnBoard, Dofus } from '../types/game';
import { Heart, Zap, Footprints, Target, Shield, Flame, EyeOff } from 'lucide-react';

interface BoardProps {
  board: CreatureOnBoard[];
  playerDofuses: Dofus[];
  aiDofuses: Dofus[];
  selectedCardType: 'CREATURE' | 'SPELL' | null;
  onTileClick: (laneIndex: number, position: number) => void;
  onCreatureClick: (creature: CreatureOnBoard) => void;
  onDofusClick: (dofus: Dofus) => void;
}

export const Board: React.FC<BoardProps> = ({
  board,
  playerDofuses,
  aiDofuses,
  selectedCardType,
  onTileClick,
  onCreatureClick,
  onDofusClick,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-2 md:p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
      {/* 5 Lanes x 5 Tiles + Dofus Columns */}
      <div className="grid grid-cols-[auto_repeat(5,1fr)_auto] gap-1.5 md:gap-3 items-center">

        {/* PLAYER DOFUS COLUMN (Col 0 - Left side) */}
        <div className="flex flex-col justify-around h-full py-1 space-y-2">
          {playerDofuses.map(dofus => (
            <div
              key={dofus.id}
              onClick={() => onDofusClick(dofus)}
              className={`relative flex flex-col items-center justify-center w-12 h-14 md:w-16 md:h-20 rounded-xl border-2 transition-all cursor-pointer shadow-md ${
                dofus.hp <= 0
                  ? 'bg-slate-950 border-red-950 opacity-50 grayscale'
                  : dofus.isRevealed
                  ? dofus.isReal
                    ? 'bg-gradient-to-b from-amber-600 to-amber-900 border-amber-400 text-amber-200'
                    : 'bg-gradient-to-b from-slate-700 to-slate-900 border-slate-500 text-slate-300'
                  : 'bg-gradient-to-b from-indigo-900 to-slate-900 border-indigo-500/60 text-indigo-200'
              }`}
              title={`Dofus Joueur Ligne ${dofus.laneIndex + 1}`}
            >
              <div className="text-xl md:text-2xl">
                {dofus.hp <= 0 ? '💥' : dofus.isRevealed ? (dofus.isReal ? '🥚' : '🪨') : '🥚'}
              </div>
              <div className="text-[10px] md:text-xs font-bold flex items-center gap-0.5 mt-0.5">
                <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                <span>{Math.max(0, dofus.hp)}</span>
              </div>
              {!dofus.isRevealed && dofus.hp > 0 && (
                <EyeOff className="w-3 h-3 text-indigo-300 absolute top-1 right-1 opacity-70" />
              )}
            </div>
          ))}
        </div>

        {/* 5x5 GRID TILES */}
        <div className="col-span-5 grid grid-rows-5 gap-1.5 md:gap-2">
          {[0, 1, 2, 3, 4].map(laneIndex => (
            <div key={`lane_${laneIndex}`} className="grid grid-cols-5 gap-1.5 md:gap-2">
              {[0, 1, 2, 3, 4].map(position => {
                const creature = board.find(
                  c => c.laneIndex === laneIndex && c.position === position
                );
                const isPlayerSummonTile = position === 0;
                const isAiSummonTile = position === 4;

                const isHighlightSummon = selectedCardType === 'CREATURE' && isPlayerSummonTile && !creature;

                return (
                  <div
                    key={`tile_${laneIndex}_${position}`}
                    onClick={() => {
                      if (creature) onCreatureClick(creature);
                      else onTileClick(laneIndex, position);
                    }}
                    className={`relative aspect-square md:h-20 rounded-xl border transition-all flex flex-col items-center justify-center cursor-pointer select-none ${
                      isHighlightSummon
                        ? 'border-emerald-400 bg-emerald-500/20 animate-pulse shadow-lg shadow-emerald-500/20'
                        : creature
                        ? creature.owner === 'PLAYER'
                          ? 'border-indigo-500 bg-gradient-to-b from-indigo-900/80 to-slate-900'
                          : 'border-red-500 bg-gradient-to-b from-red-950/80 to-slate-900'
                        : isPlayerSummonTile
                        ? 'border-indigo-500/30 bg-indigo-950/30 hover:border-indigo-400/60'
                        : isAiSummonTile
                        ? 'border-red-500/30 bg-red-950/30'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    {/* Position indicator line helper */}
                    <span className="absolute top-1 left-1.5 text-[9px] text-slate-600 font-semibold">
                      {laneIndex + 1}-{position + 1}
                    </span>

                    {/* CREATURE ON TILE */}
                    {creature && (
                      <div className="flex flex-col items-center justify-center w-full h-full p-1">
                        <div className="text-2xl md:text-3xl filter drop-shadow-md">
                          {creature.illustration}
                        </div>
                        <div className="text-[10px] md:text-xs font-bold text-slate-100 truncate max-w-full px-1">
                          {creature.name}
                        </div>

                        {/* Creature Stats Pill */}
                        <div className="flex items-center justify-around w-full mt-0.5 bg-slate-950/80 rounded px-1 py-0.5 text-[9px] md:text-[11px] font-bold">
                          <span className="text-amber-400 flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5" />
                            {creature.atk}
                          </span>
                          {creature.range > 1 && (
                            <span className="text-cyan-400 flex items-center gap-0.5">
                              <Target className="w-2.5 h-2.5" />
                              {creature.range}
                            </span>
                          )}
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <Footprints className="w-2.5 h-2.5" />
                            {creature.pm}
                          </span>
                          <span className="text-red-400 flex items-center gap-0.5">
                            <Heart className="w-2.5 h-2.5 fill-red-400" />
                            {creature.hp}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* AI DOFUS COLUMN (Col 6 - Right side) */}
        <div className="flex flex-col justify-around h-full py-1 space-y-2">
          {aiDofuses.map(dofus => (
            <div
              key={dofus.id}
              onClick={() => onDofusClick(dofus)}
              className={`relative flex flex-col items-center justify-center w-12 h-14 md:w-16 md:h-20 rounded-xl border-2 transition-all cursor-pointer shadow-md ${
                dofus.hp <= 0
                  ? 'bg-slate-950 border-red-950 opacity-50 grayscale'
                  : dofus.isRevealed
                  ? dofus.isReal
                    ? 'bg-gradient-to-b from-amber-600 to-amber-900 border-amber-400 text-amber-200'
                    : 'bg-gradient-to-b from-slate-700 to-slate-900 border-slate-500 text-slate-300'
                  : 'bg-gradient-to-b from-red-900 to-slate-900 border-red-500/60 text-red-200'
              }`}
              title={`Dofus IA Ligne ${dofus.laneIndex + 1}`}
            >
              <div className="text-xl md:text-2xl">
                {dofus.hp <= 0 ? '💥' : dofus.isRevealed ? (dofus.isReal ? '🥚' : '🪨') : '🥚'}
              </div>
              <div className="text-[10px] md:text-xs font-bold flex items-center gap-0.5 mt-0.5">
                <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                <span>{Math.max(0, dofus.hp)}</span>
              </div>
              {!dofus.isRevealed && dofus.hp > 0 && (
                <EyeOff className="w-3 h-3 text-red-300 absolute top-1 right-1 opacity-70" />
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
