import React from 'react';
import { CreatureOnBoard, Dofus, Prism } from '../types/game';
import { Heart, Zap, Footprints, Target, EyeOff, Layers, Swords } from 'lucide-react';

interface BoardProps {
  board: CreatureOnBoard[];
  playerDofuses: Dofus[];
  aiDofuses: Dofus[];
  prisms: Prism[];
  selectedCardType: 'CREATURE' | 'SPELL' | null;
  onTileClick: (laneIndex: number, position: number) => void;
  onCreatureClick: (creature: CreatureOnBoard) => void;
  onDofusClick: (dofus: Dofus) => void;
}

export const Board: React.FC<BoardProps> = ({
  board,
  playerDofuses,
  aiDofuses,
  prisms,
  selectedCardType,
  onTileClick,
  onCreatureClick,
  onDofusClick,
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto p-2 md:p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md overflow-x-auto">
      {/* 5 Lanes x 7 Tiles + Dofus Columns */}
      <div className="grid grid-cols-[auto_repeat(7,1fr)_auto] gap-1 md:gap-2 items-center min-w-[700px]">

        {/* PLAYER DOFUS COLUMN (Col 0 - Left side) */}
        <div className="flex flex-col justify-around h-full py-1 space-y-1.5">
          {playerDofuses.map(dofus => (
            <div
              key={dofus.id}
              onClick={() => onDofusClick(dofus)}
              className={`relative flex flex-col items-center justify-center w-11 h-14 md:w-14 md:h-18 rounded-xl border-2 transition-all cursor-pointer shadow-md ${
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
              <div className="text-lg md:text-2xl">
                {dofus.hp <= 0 ? '💥' : dofus.isRevealed ? (dofus.isReal ? '🥚' : '🪨') : '🥚'}
              </div>
              <div className="text-[9px] md:text-xs font-bold flex items-center gap-0.5 mt-0.5">
                <Heart className="w-2.5 h-2.5 text-red-400 fill-red-400" />
                <span>{Math.max(0, dofus.hp)}</span>
              </div>
              {!dofus.isRevealed && dofus.hp > 0 && (
                <EyeOff className="w-2.5 h-2.5 text-indigo-300 absolute top-1 right-1 opacity-70" />
              )}
            </div>
          ))}
        </div>

        {/* 5x7 GRID TILES */}
        <div className="col-span-7 grid grid-rows-5 gap-1 md:gap-2">
          {[0, 1, 2, 3, 4].map(laneIndex => (
            <div key={`lane_${laneIndex}`} className="grid grid-cols-7 gap-1 md:gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map(position => {
                const creature = board.find(
                  c => c.laneIndex === laneIndex && c.position === position
                );
                const prism = prisms.find(
                  p => p.laneIndex === laneIndex && p.position === position
                );

                const isPlayerSummonTile = position === 0;
                const isAiSummonTile = position === 6;

                const isHighlightSummon = selectedCardType === 'CREATURE' && isPlayerSummonTile && !creature;

                return (
                  <div
                    key={`tile_${laneIndex}_${position}`}
                    onClick={() => {
                      if (creature) onCreatureClick(creature);
                      else onTileClick(laneIndex, position);
                    }}
                    className={`relative aspect-square md:h-18 rounded-xl border transition-all flex flex-col items-center justify-center cursor-pointer select-none ${
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
                    {/* Tile Coordinate Helper */}
                    <span className="absolute top-0.5 left-1 text-[8px] text-slate-600 font-semibold">
                      {laneIndex + 1}-{position + 1}
                    </span>

                    {/* PRISM DISPLAY ON TILE (pos=3) */}
                    {prism && !creature && (
                      <div className="flex flex-col items-center justify-center animate-bounce">
                        {prism.type === 'PA' ? (
                          <div className="p-1 rounded-full bg-blue-500/20 border border-blue-400 text-blue-400 shadow-md flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 fill-blue-400" />
                          </div>
                        ) : (
                          <div className="p-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-400 shadow-md flex items-center justify-center">
                            <Layers className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="text-[8px] font-bold text-slate-300 mt-0.5">
                          {prism.type === 'PA' ? '+1 PA' : '+1 Carte'}
                        </span>
                      </div>
                    )}

                    {/* CREATURE ON TILE WITH COMBAT ANIMATIONS */}
                    {creature && (
                      <div className={`flex flex-col items-center justify-center w-full h-full p-0.5 transition-all duration-300 ${
                        creature.isDamaged ? 'animate-hit' : creature.isAttacking ? 'animate-attack' : 'animate-summon'
                      }`}>
                        {creature.isAttacking && (
                          <Swords className="w-3 h-3 text-red-400 absolute top-0.5 right-0.5 animate-ping" />
                        )}

                        <div className="text-xl md:text-2xl filter drop-shadow-md">
                          {creature.illustration}
                        </div>
                        <div className="text-[9px] md:text-[10px] font-bold text-slate-100 truncate max-w-full px-0.5">
                          {creature.name}
                        </div>

                        {/* Creature Stats Pill */}
                        <div className="flex items-center justify-around w-full mt-0.5 bg-slate-950/80 rounded px-0.5 py-0.5 text-[8px] md:text-[9px] font-bold">
                          <span className="text-amber-400 flex items-center gap-0.5">
                            <Zap className="w-2 h-2" />
                            {creature.atk}
                          </span>
                          {creature.range > 1 && (
                            <span className="text-cyan-400 flex items-center gap-0.5">
                              <Target className="w-2 h-2" />
                              {creature.range}
                            </span>
                          )}
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <Footprints className="w-2 h-2" />
                            {creature.pm}
                          </span>
                          <span className="text-red-400 flex items-center gap-0.5">
                            <Heart className="w-2 h-2 fill-red-400" />
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

        {/* AI DOFUS COLUMN (Col 8 - Right side) */}
        <div className="flex flex-col justify-around h-full py-1 space-y-1.5">
          {aiDofuses.map(dofus => (
            <div
              key={dofus.id}
              onClick={() => onDofusClick(dofus)}
              className={`relative flex flex-col items-center justify-center w-11 h-14 md:w-14 md:h-18 rounded-xl border-2 transition-all cursor-pointer shadow-md ${
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
              <div className="text-lg md:text-2xl">
                {dofus.hp <= 0 ? '💥' : dofus.isRevealed ? (dofus.isReal ? '🥚' : '🪨') : '🥚'}
              </div>
              <div className="text-[9px] md:text-xs font-bold flex items-center gap-0.5 mt-0.5">
                <Heart className="w-2.5 h-2.5 text-red-400 fill-red-400" />
                <span>{Math.max(0, dofus.hp)}</span>
              </div>
              {!dofus.isRevealed && dofus.hp > 0 && (
                <EyeOff className="w-2.5 h-2.5 text-red-300 absolute top-1 right-1 opacity-70" />
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
