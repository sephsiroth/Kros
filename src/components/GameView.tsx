import React, { useState } from 'react';
import { GameState, Card, CreatureOnBoard, Dofus } from '../types/game';
import { Board } from './Board';
import { CardItem } from './CardItem';
import { CardDetailModal } from './CardDetailModal';
import { Flame, Wind, Shield, Zap, RefreshCw, Trophy, Skull, Scroll, Play, Maximize, Minimize } from 'lucide-react';

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

  const toggleFullscreen = () => {
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

      {/* TOP BAR - AI STATUS & FULLSCREEN */}
      <header className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400">
            {ai.god === 'PYROS' ? <Flame className="w-4 h-4 md:w-5 md:h-5" /> : <Wind className="w-4 h-4 md:w-5 md:h-5" />}
          </div>
          <div>
            <div className="text-xs font-bold text-red-400">IA ({ai.god})</div>
            <div className="text-[10px] md:text-[11px] text-slate-400">
              Deck: {ai.deck.length} | Main: {ai.hand.length}
            </div>
          </div>
        </div>

        {/* Phase / Turn Banner */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold">
          <span>Tour {gameState.turn}</span>
          <span className="text-slate-500">•</span>
          <span className={isPlayerTurn ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}>
            {isPlayerTurn ? 'Votre Tour' : 'Tour de l\'IA...'}
          </span>
        </div>

        {/* AI PA & Fullscreen Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-blue-950/60 border border-blue-500/40 px-2.5 py-1 rounded-xl text-blue-300 font-bold text-xs md:text-sm">
            <Zap className="w-3.5 h-3.5 fill-blue-400 text-blue-400" />
            <span>{ai.pa} / {ai.maxPa} PA</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Plein écran Mobile"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA - BOARD + LOGS */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_260px] gap-2 p-2 overflow-hidden items-center">

        {/* GAME BOARD */}
        <div className="flex items-center justify-center h-full w-full overflow-auto">
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

        {/* GAME LOGS PANEL */}
        <div className="hidden md:flex flex-col h-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 overflow-hidden backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
            <Scroll className="w-4 h-4 text-amber-400" />
            <span>Journal de combat</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5 text-[11px] pr-1">
            {logs.slice().reverse().map(log => (
              <div
                key={log.id}
                className={`p-2 rounded-lg border ${
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
            ))}
          </div>
        </div>

      </main>

      {/* BOTTOM BAR - PLAYER CONTROLS & HAND */}
      <footer className="bg-slate-900/95 border-t border-slate-800 p-2 md:p-3 backdrop-blur-lg flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 max-w-5xl mx-auto w-full">

          {/* Player God & Power Button */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-400">
              {player.god === 'PYROS' ? <Flame className="w-4 h-4 md:w-5 md:h-5" /> : <Wind className="w-4 h-4 md:w-5 md:h-5" />}
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-300">{player.god} (Vous)</div>
              <div className="text-[10px] text-slate-400">Deck: {player.deck.length}</div>
            </div>

            {/* God Power Button */}
            <button
              onClick={onUseGodPower}
              disabled={!isPlayerTurn || player.pa < player.godPowerCost || player.godPowerUsedThisTurn}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-bold text-xs transition-all ${
                !isPlayerTurn || player.pa < player.godPowerCost || player.godPowerUsedThisTurn
                  ? 'opacity-40 grayscale cursor-not-allowed border-slate-800 bg-slate-900'
                  : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 border-teal-400/50 shadow-md text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Pouvoir ({player.godPowerCost} PA)</span>
            </button>
          </div>

          {/* PA BAR */}
          <div className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-500/50 px-3 py-1.5 rounded-xl text-blue-300 font-extrabold text-xs md:text-sm shadow-md">
            <Zap className="w-4 h-4 fill-blue-400 text-blue-400" />
            <span>{player.pa} / {player.maxPa} PA</span>
          </div>

          {/* END TURN BUTTON */}
          <button
            onClick={onEndTurn}
            disabled={!isPlayerTurn}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs md:text-sm transition-all shadow-lg ${
              !isPlayerTurn
                ? 'opacity-40 grayscale cursor-not-allowed border border-slate-800 bg-slate-900'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 border border-amber-300 text-slate-950 animate-pulse'
            }`}
          >
            <span>Fin du Tour</span>
            <Play className="w-4 h-4 fill-slate-950" />
          </button>
        </div>

        {/* PLAYER HAND CARDS */}
        <div className="flex items-center justify-center gap-2 md:gap-3 overflow-x-auto py-1 px-2 max-w-5xl mx-auto w-full min-h-[120px]">
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
            onSelectCard(detailedCard);
            setDetailedCard(null);
          }}
        />
      )}

      {/* GAME OVER MODAL */}
      {winner && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl space-y-6">
            <div className="flex justify-center">
              {winner === 'PLAYER' ? (
                <div className="p-4 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-400">
                  <Trophy className="w-16 h-16 animate-bounce" />
                </div>
              ) : (
                <div className="p-4 rounded-full bg-red-500/20 border-2 border-red-500 text-red-500">
                  <Skull className="w-16 h-16" />
                </div>
              )}
            </div>

            <div>
              <h2 className={`text-3xl font-black ${winner === 'PLAYER' ? 'text-amber-400' : 'text-red-400'}`}>
                {winner === 'PLAYER' ? 'VICTOIRE !' : 'DÉFAITE !'}
              </h2>
              <p className="text-slate-300 text-sm mt-2">
                {winner === 'PLAYER'
                  ? 'Félicitations ! Vous avez détruit 2 Vrais Dofus de l\'adversaire !'
                  : 'L\'IA a réussi à détruire 2 de vos Vrais Dofus. Réessayez !'}
              </p>
            </div>

            <button
              onClick={onRestart}
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Recommencer une Partie
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
