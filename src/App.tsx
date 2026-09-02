import React, { useState, useEffect } from 'react';
import { GodId, GameState, Card, CreatureOnBoard, Dofus } from './types/game';
import { createInitialGameState, playCreatureCard, playSpellCard, useGodPower, endTurnAndResolveMovement } from './engine/gameEngine';
import { executeAiTurn } from './engine/aiEngine';
import { GodSelect } from './components/GodSelect';
import { GameView } from './components/GameView';
import { soundEffects } from './utils/audio';

export default function App() {
  const [selectedGod, setSelectedGod] = useState<GodId | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const handleSelectGod = (god: GodId) => {
    soundEffects.playClick();
    setSelectedGod(god);
    const initialState = createInitialGameState(god);
    setGameState(initialState);
  };

  const handleSelectCard = (card: Card) => {
    soundEffects.playClick();
    if (selectedCard?.id === card.id) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  };

  const handleTileClick = (laneIndex: number, position: number) => {
    if (!gameState || !selectedCard || gameState.phase !== 'PLAYER_TURN') return;

    if (selectedCard.type === 'CREATURE') {
      if (position === 0) {
        soundEffects.playSummon();
        const newState = playCreatureCard(gameState, 'PLAYER', selectedCard, laneIndex);
        setGameState(newState);
        setSelectedCard(null);
      }
    } else if (selectedCard.type === 'SPELL') {
      if (selectedCard.spellEffect?.type === 'DAMAGE_ALL_LINE') {
        soundEffects.playSpell();
        const newState = playSpellCard(gameState, 'PLAYER', selectedCard, laneIndex);
        setGameState(newState);
        setSelectedCard(null);
      }
    }
  };

  const handleCreatureClick = (creature: CreatureOnBoard) => {
    if (!gameState || !selectedCard || gameState.phase !== 'PLAYER_TURN') return;

    if (selectedCard.type === 'SPELL') {
      soundEffects.playSpell();
      const newState = playSpellCard(gameState, 'PLAYER', selectedCard, creature.laneIndex, creature.id);
      setGameState(newState);
      setSelectedCard(null);
    }
  };

  const handleDofusClick = (dofus: Dofus) => {
    if (!gameState || !selectedCard || gameState.phase !== 'PLAYER_TURN') return;

    if (selectedCard.type === 'SPELL' && dofus.owner === 'AI') {
      soundEffects.playSpell();
      const newState = playSpellCard(gameState, 'PLAYER', selectedCard, dofus.laneIndex, undefined, dofus.id);
      setGameState(newState);
      setSelectedCard(null);
    }
  };

  const handleUseGodPower = () => {
    if (!gameState || gameState.phase !== 'PLAYER_TURN') return;
    soundEffects.playSpell();
    const newState = useGodPower(gameState, 'PLAYER');
    setGameState(newState);
  };

  const handleEndTurn = () => {
    if (!gameState || gameState.phase !== 'PLAYER_TURN') return;
    soundEffects.playAttack();
    setSelectedCard(null);
    const newState = endTurnAndResolveMovement(gameState);
    setGameState(newState);
  };

  // AI Turn Effect
  useEffect(() => {
    if (gameState && gameState.phase === 'AI_TURN' && !gameState.winner) {
      const timer = setTimeout(() => {
        let afterAiActionsState = executeAiTurn(gameState);
        let finalTurnState = endTurnAndResolveMovement(afterAiActionsState);
        setGameState(finalTurnState);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [gameState?.phase]);

  const handleRestart = () => {
    if (selectedGod) {
      soundEffects.playClick();
      setGameState(createInitialGameState(selectedGod));
      setSelectedCard(null);
    }
  };

  if (!selectedGod || !gameState) {
    return <GodSelect onSelectGod={handleSelectGod} />;
  }

  return (
    <GameView
      gameState={gameState}
      selectedCard={selectedCard}
      onSelectCard={handleSelectCard}
      onTileClick={handleTileClick}
      onCreatureClick={handleCreatureClick}
      onDofusClick={handleDofusClick}
      onUseGodPower={handleUseGodPower}
      onEndTurn={handleEndTurn}
      onRestart={handleRestart}
    />
  );
}
