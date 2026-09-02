import React from 'react';
import { CreatureOnBoard, Dofus, Prism } from '../types/game';
import { Heart, Zap, Footprints, Target, EyeOff, Layers, Swords } from 'lucide-react';
import { soundEffects } from '../utils/audio';

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
    <div className="w-full h-full max-h-[100%] flex items-center justify-center p-1 md:p-2 bg-gradient-to-b from-slate-900/95 via-slate-950/90 to-slate-900/95 rounded-2xl border border-amber-600/30 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* 5 Lanes x 7 Tiles + Dofus Columns Container */}
      <div className="grid grid-cols-[auto_repeat(7,1fr)_auto] gap-1 md:gap-1.5 items-center w-full max-w-5xl h-full max-h-[100%]">

        {/* PLAYER DOFUS COLUMN (Col 0 - Left side) */}
        <div className="flex flex-col justify-between h-full py-0.5 gap-1">
          {playerDofuses.map(dofus => (
            <div
              key={dofus.id}
              onClick={() => {
                soundEffects.playClick();
                onDofusClick(dofus);
              }}
              className={`relative flex flex-col items-center justify-center w-9 sm:w-11 md:w-13 h-full max-h-[18vh] rounded-xl border-2 transition-all cursor-pointer shadow-md ${
                dofus.hp <= 0
                  ? 'bg-slate-950 border-red-950 opacity-40 grayscale'
                  : dofus.isRevealed
                  ? dofus.isReal
                    ? 'bg-gradient-to-b from-amber-600 to-amber-900 border-amber-400 text-amber-200 kros-glow-gold'
                    : 'bg-gradient-to-b from-slate-700 to-slate-900 border-slate-500 text-slate-300'
                  : 'bg-gradient-to-b from-indigo-900 to-slate-900 border-indigo-500/70 text-indigo-200 hover:border-indigo-400'
              }`}
              title={`Dofus Joueur Ligne ${dofus.laneIndex + 1}`}
            >
              <div className="text-sm sm:text-lg md:text-xl filter drop-shadow">
                {dofus.hp <= 0 ? '💥' : dofus.isRevealed ? (dofus.isReal ? '🥚' : '🪨') : '🥚'}
              </div>
              <div className="text-[9px] sm:text-[10px] font-extrabold flex items-center gap-0.5 mt-0.5">
                <Heart className="w-2.5 h-2.5 text-red-400 fill-red-400" />
                <span>{Math.max(0, dofus.hp)}</span>
              </div>
              {!dofus.isRevealed && dofus.hp > 0 && (
                <EyeOff className="w-2.5 h-2.5 text-indigo-300 absolute top-0.5 right-0.5 opacity-70" />
              )}
            </div>
          ))}
        </div>

        {/* 5x7 GRID TILES */}
        <div className="col-span-7 grid grid-rows-5 gap-1 md:gap-1.5 h-full max-h-[100%]">
          {[0, 1, 2, 3, 4].map(laneIndex => (
            <div key={`lane_${laneIndex}`} className="grid grid-cols-7 gap-1 md:gap-1.5 h-full">
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
                      soundEffects.playClick();
                      if (creature) onCreatureClick(creature);
                      else onTileClick(laneIndex, position);
                    }}
                    className={`relative rounded-xl border transition-all flex flex-col items-center justify-center cursor-pointer select-none h-full overflow-hidden ${
                      isHighlightSummon
                        ? 'border-emerald-400 bg-emerald-500/25 animate-pulse kros-glow-teal'
                        : creature
                        ? creature.owner === 'PLAYER'
                          ? 'border-indigo-500/80 bg-gradient-to-b from-indigo-900/90 to-slate-900/90 kros-glow-blue'
                          : 'border-red-500/80 bg-gradient-to-b from-red-950/90 to-slate-900/90 kros-glow-red'
                        : isPlayerSummonTile
                        ? 'border-indigo-500/40 bg-indigo-950/30 hover:border-indigo-400/80 hover:bg-indigo-900/40'
                        : isAiSummonTile
                        ? 'border-red-500/40 bg-red-950/30'
                        : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    {/* Tile Coordinate Badge */}
                    <span className="absolute top-0.5 left-1 text-[7px] md:text-[8px] text-slate-500 font-bold opacity-80">
                      {laneIndex + 1}-{position + 1}
                    </span>

                    {/* PRISM DISPLAY ON TILE (pos=3) */}
                    {prism && !creature && (
                      <div className="flex flex-col items-center justify-center animate-bounce">
                        {prism.type === 'PA' ? (
                          <div className="p-0.5 sm:p-1 rounded-full bg-blue-500/30 border border-blue-400 text-blue-300 shadow-md">
                            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-blue-400" />
                          </div>
                        ) : (
                          <div className="p-0.5 sm:p-1 rounded-full bg-amber-500/30 border border-amber-400 text-amber-300 shadow-md">
                            <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </div>
                        )}
                        <span className="text-[7px] sm:text-[8px] font-black text-amber-300 mt-0.5">
                          {prism.type === 'PA' ? '+1 PA' : '+1 Carte'}
                        </span>
                      </div>
                    )}

                    {/* CREATURE ON TILE WITH COMBAT ANIMATIONS */}
                    {creature && (
                      <div className={`flex flex-col items-center justify-between w-full h-full p-0.5 transition-all duration-300 ${
                        creature.isDamaged ? 'animate-hit' : creature.isAttacking ? 'animate-attack' : 'animate-summon'
                      }`}>
                        {creature.isAttacking && (
                          <Swords className="w-3 h-3 text-red-400 absolute top-0.5 right-0.5 animate-ping" />
                        )}

                        <div className="text-base sm:text-xl md:text-2xl filter drop-shadow-md my-auto">
                          {creature.illustration}
                        </div>

                        <div className="text-[8px] sm:text-[9px] font-bold text-slate-100 truncate w-full text-center px-0.5">
                          {creature.name}
                        </div>

                        {/* Creature Stats Pill */}
                        <div className="flex items-center justify-around w-full bg-slate-950/90 rounded border border-slate-800/80 px-0.5 py-0.5 text-[7px] sm:text-[8px] md:text-[9px] font-black">
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
        <div className="flex flex-col justify-between h-full py-0.5 gap-1">
          {aiDofuses.map(dofus => (
            <div
              key={dofus.id}
              onClick={() => {
                soundEffects.playClick();
                onDofusClick(dofus);
              }}
              className={`relative flex flex-col items-center justify-center w-9 sm:w-11 md:w-13 h-full max-h-[18vh] rounded-xl border-2 transition-all cursor-pointer shadow-md ${
                dofus.hp <= 0
                  ? 'bg-slate-950 border-red-950 opacity-40 grayscale'
                  : dofus.isRevealed
                  ? dofus.isReal
                    ? 'bg-gradient-to-b from-amber-600 to-amber-900 border-amber-400 text-amber-200 kros-glow-gold'
                    : 'bg-gradient-to-b from-slate-700 to-slate-900 border-slate-500 text-slate-300'
                  : 'bg-gradient-to-b from-red-900 to-slate-900 border-red-500/70 text-red-200 hover:border-red-400'
              }`}
              title={`Dofus IA Ligne ${dofus.laneIndex + 1}`}
            >
              <div className="text-sm sm:text-lg md:text-xl filter drop-shadow">
                {dofus.hp <= 0 ? '💥' : dofus.isRevealed ? (dofus.isReal ? '🥚' : '🪨') : '🥚'}
              </div>
              <div className="text-[9px] sm:text-[10px] font-extrabold flex items-center gap-0.5 mt-0.5">
                <Heart className="w-2.5 h-2.5 text-red-400 fill-red-400" />
                <span>{Math.max(0, dofus.hp)}</span>
              </div>
              {!dofus.isRevealed && dofus.hp > 0 && (
                <EyeOff className="w-2.5 h-2.5 text-red-300 absolute top-0.5 right-0.5 opacity-70" />
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
