import React, { useState, useEffect } from 'react';
import { GameState, Card, CreatureOnBoard, Dofus } from '../types/game';
import { Board } from './Board';
import { CardItem } from './CardItem';
import { CardDetailModal } from './CardDetailModal';
import { GodPowerModal } from './GodPowerModal';
import { HistoryModal } from './HistoryModal';
import { Flame, Wind, Zap, RefreshCw, Trophy, Skull, Scroll, Play, Maximize, Minimize, History } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface GameViewProps {
  gameState: GameState;
  selectedCard: Card | null;
  onSelectCard: (card: Card) => void;
  onTileClick: (laneIndex: number, position: number) => void;
  onCreatureClick: (creature: CreatureOnBoard) => void;
  onDofusClick: (dofus: Dofus) => void;
  onUseGodPower: () => void;
  onEndTurn: () => void;
  onRestart: () => void;
}

export const GameView: React.FC<GameViewProps> = ({
  gameState,
  selectedCard,
  onSelectCard,
  onTileClick,
  onCreatureClick,
  onDofusClick,
  onUseGodPower,
  onEndTurn,
  onRestart,
}) => {
  const { player, ai, board, dofuses, prisms, phase, activePlayer, logs, winner } = gameState;
  const isPlayerTurn = phase === 'PLAYER_TURN' && activePlayer === 'PLAYER';

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [detailedCard, setDetailedCard] = useState<Card | null>(null);
  const [showGodPowerModal, setShowGodPowerModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Play audio on victory/defeat
  useEffect(() => {
    if (winner === 'PLAYER') {
      soundEffects.playVictory();
    } else if (winner === 'AI') {
      soundEffects.playDefeat();
    }
  }, [winner]);

  const toggleFullscreen = () => {
    soundEffects.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">

      {/* TOP HEADER - AI & QUICK CONTROLS */}
      <header className="flex items-center justify-between px-2 sm:px-3 py-1 bg-slate-900/90 border-b border-amber-600/30 backdrop-blur-md h-[44px] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-red-950/80 border border-red-500/50 text-red-400">
            {ai.god === 'PYROS' ? <Flame className="w-4 h-4" /> : <Wind className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-xs font-black text-red-400">IA ({ai.god})</div>
            <div className="text-[10px] text-slate-400">
              Deck: {ai.deck.length} | Main: {ai.hand.length}
            </div>
          </div>
        </div>

        {/* Phase / Turn Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-black shadow-inner">
          <span className="text-amber-400">Tour {gameState.turn}</span>
          <span className="text-slate-500">•</span>
          <span className={isPlayerTurn ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}>
            {isPlayerTurn ? 'Votre Tour' : 'IA en réflexion...'}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-1 bg-blue-950/80 border border-blue-500/50 px-2 py-1 rounded-xl text-blue-300 font-black text-xs">
            <Zap className="w-3.5 h-3.5 fill-blue-400 text-blue-400" />
            <span>{ai.pa}/{ai.maxPa} PA</span>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              setShowHistoryModal(true);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-xs font-bold"
            title="Historique des Actions"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Log</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Plein écran"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA - FIT TO SCREEN BOARD */}
      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-2 p-1.5 overflow-hidden items-center">

        {/* GAME BOARD */}
        <div className="flex items-center justify-center h-full w-full overflow-hidden">
          <Board
            board={board}
            playerDofuses={dofuses.player}
            aiDofuses={dofuses.ai}
            prisms={prisms}
            selectedCardType={selectedCard ? selectedCard.type : null}
            onTileClick={onTileClick}
            onCreatureClick={onCreatureClick}
            onDofusClick={onDofusClick}
          />
        </div>

        {/* DESKTOP COMBAT LOGS PANEL */}
        <div className="hidden lg:flex flex-col h-full bg-slate-900/80 border border-slate-800/90 rounded-2xl p-2.5 overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-xs font-black text-slate-300">
            <div className="flex items-center gap-1.5">
              <Scroll className="w-3.5 h-3.5 text-amber-400" />
              <span>Journal de combat</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 text-[10px] pr-1">
            {logs.slice().reverse().map(log => (
              <div
                key={log.id}
                className={`p-1.5 rounded-lg border leading-snug ${
                  log.type === 'VICTORY'
                    ? 'bg-amber-950/60 border-amber-500/50 text-amber-200 font-bold'
                    : log.type === 'PRISM'
                    ? 'bg-purple-950/50 border-purple-800/50 text-purple-200'
                    : log.type === 'COMBAT'
                    ? 'bg-red-950/40 border-red-900/40 text-red-200'
                    : log.type === 'SPELL'
                    ? 'bg-blue-950/40 border-blue-900/40 text-blue-200'
                    : log.type === 'GOD_POWER'
                    ? 'bg-teal-950/40 border-teal-900/40 text-teal-200'
                    : 'bg-slate-800/40 border-slate-700/40 text-slate-300'
                }`}
              >
                {log.text}
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* FOOTER - PLAYER HUD & HAND */}
      <footer className="bg-slate-900/95 border-t border-amber-600/30 p-1.5 sm:p-2 backdrop-blur-lg flex flex-col gap-1.5 flex-shrink-0 h-[155px]">

        {/* HUD Controls */}
        <div className="flex items-center justify-between gap-2 w-full max-w-5xl mx-auto flex-shrink-0">

          {/* Player God & Power Button */}
          <div className="flex items-center gap-1.5">
            <div
              onClick={() => {
                soundEffects.playClick();
                setShowGodPowerModal(true);
              }}
              className="p-1 rounded-xl bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 cursor-pointer hover:border-indigo-400 transition-colors"
            >
              {player.god === 'PYROS' ? <Flame className="w-4 h-4 text-amber-400" /> : <Wind className="w-4 h-4 text-cyan-400" />}
            </div>
            <div>
              <div className="text-xs font-black text-indigo-300">{player.god}</div>
              <div className="text-[9px] text-slate-400">Deck: {player.deck.length}</div>
            </div>

            {/* God Power Button */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setShowGodPowerModal(true);
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-xl border font-extrabold text-xs transition-all ${
                !isPlayerTurn || player.pa < player.godPowerCost || player.godPowerUsedThisTurn
                  ? 'bg-slate-900 border-slate-800 text-slate-400'
                  : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 border-teal-400/60 shadow-md text-white'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-300" />
              <span>Pouvoir ({player.godPowerCost} PA)</span>
            </button>
          </div>

          {/* Player PA Gauge */}
          <div className="flex items-center gap-1 bg-blue-950/90 border border-blue-500/60 px-3 py-1 rounded-xl text-blue-300 font-black text-xs sm:text-sm kros-glow-blue">
            <Zap className="w-4 h-4 fill-blue-400 text-blue-400" />
            <span>{player.pa} / {player.maxPa} PA</span>
          </div>

          {/* END TURN BUTTON */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onEndTurn();
            }}
            disabled={!isPlayerTurn}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all shadow-lg ${
              !isPlayerTurn
                ? 'opacity-40 grayscale cursor-not-allowed border border-slate-800 bg-slate-900'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 border border-amber-300 text-slate-950 animate-pulse kros-glow-gold'
            }`}
          >
            <span>Fin du Tour</span>
            <Play className="w-3.5 h-3.5 fill-slate-950" />
          </button>
        </div>

        {/* PLAYER HAND SCROLL AREA */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto px-1 max-w-5xl mx-auto w-full flex-1 items-center">
          {player.hand.length === 0 ? (
            <div className="text-xs text-slate-500 italic">Votre main est vide.</div>
          ) : (
            player.hand.map(card => (
              <CardItem
                key={card.id}
                card={card}
                isSelected={selectedCard?.id === card.id}
                isDisabled={!isPlayerTurn || player.pa < card.paCost}
                onClick={() => setDetailedCard(card)}
                size="sm"
              />
            ))
          )}
        </div>
      </footer>

      {/* CARD DETAIL MODAL */}
      {detailedCard && (
        <CardDetailModal
          card={detailedCard}
          canPlay={isPlayerTurn && player.pa >= detailedCard.paCost}
          onClose={() => setDetailedCard(null)}
          onPlay={() => {
            soundEffects.playSummon();
            onSelectCard(detailedCard);
            setDetailedCard(null);
          }}
        />
      )}

      {/* GOD POWER MODAL */}
      {showGodPowerModal && (
        <GodPowerModal
          god={player.god}
          cost={player.godPowerCost}
          canUse={isPlayerTurn && player.pa >= player.godPowerCost && !player.godPowerUsedThisTurn}
          usedThisTurn={player.godPowerUsedThisTurn}
          onClose={() => setShowGodPowerModal(false)}
          onUse={() => {
            soundEffects.playSpell();
            onUseGodPower();
          }}
        />
      )}

      {/* HISTORY MODAL */}
      {showHistoryModal && (
        <HistoryModal
          logs={logs}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      {/* GAME OVER MODAL */}
      {winner && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 max-w-md w-full text-center shadow-2xl space-y-5 animate-summon">
            <div className="flex justify-center">
              {winner === 'PLAYER' ? (
                <div className="p-4 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-400 kros-glow-gold">
                  <Trophy className="w-16 h-16 animate-bounce" />
                </div>
              ) : (
                <div className="p-4 rounded-full bg-red-500/20 border-2 border-red-500 text-red-500 kros-glow-red">
                  <Skull className="w-16 h-16" />
                </div>
              )}
            </div>

            <div>
              <h2 className={`text-3xl font-black tracking-wide ${winner === 'PLAYER' ? 'text-amber-400' : 'text-red-400'}`}>
                {winner === 'PLAYER' ? 'VICTOIRE !' : 'DÉFAITE !'}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
                {winner === 'PLAYER'
                  ? 'Félicitations ! Vous avez détruit 2 Vrais Dofus de l\'adversaire !'
                  : 'L\'IA a réussi à détruire 2 de vos Vrais Dofus. Réessayez !'}
              </p>
            </div>

            <button
              onClick={() => {
                soundEffects.playClick();
                onRestart();
              }}
              className="w-full py-3 rounded-xl font-black text-white bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 shadow-lg flex items-center justify-center gap-2 kros-glow-gold"
            >
              <RefreshCw className="w-4 h-4" /> Recommencer une Partie
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
