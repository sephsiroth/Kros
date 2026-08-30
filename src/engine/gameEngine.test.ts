import { describe, it, expect } from 'vitest';
import { createInitialGameState, playCreatureCard, playSpellCard, useGodPower, endTurnAndResolveMovement } from '../engine/gameEngine';
import { executeAiTurn } from '../engine/aiEngine';
import { PYROS_CARDS, ZEPHIRA_CARDS } from '../data/cards';

describe('KROS-LEGENDS Game Engine', () => {
  it('should initialize game state correctly', () => {
    const state = createInitialGameState('PYROS');
    expect(state.player.god).toBe('PYROS');
    expect(state.ai.god).toBe('ZEPHIRA');
    expect(state.player.pa).toBe(3);
    expect(state.player.hand.length).toBe(3);
    expect(state.dofuses.player.length).toBe(5);
    expect(state.dofuses.ai.length).toBe(5);
    expect(state.dofuses.player.filter(d => d.isReal).length).toBe(3);
  });

  it('should play a creature card on lane tile x=0', () => {
    let state = createInitialGameState('PYROS');
    const creatureCard = PYROS_CARDS.find(c => c.type === 'CREATURE')!;

    // Give enough PA and card in hand
    state.player.pa = 10;
    state.player.hand = [creatureCard];

    const newState = playCreatureCard(state, 'PLAYER', creatureCard, 2);
    expect(newState.board.length).toBe(1);
    expect(newState.board[0].laneIndex).toBe(2);
    expect(newState.board[0].position).toBe(0);
    expect(newState.player.hand.length).toBe(0);
  });

  it('should move creature forward and engage in combat on end turn', () => {
    let state = createInitialGameState('PYROS');
    const playerCreatureCard = PYROS_CARDS[0]; // Bouftou de Feu (PM 1)

    state.player.pa = 10;
    state.player.hand = [playerCreatureCard];

    // Player summons creature on lane 0, pos 0
    state = playCreatureCard(state, 'PLAYER', playerCreatureCard, 0);
    expect(state.board[0].position).toBe(0);

    // End turn -> creature moves to pos 1
    state = endTurnAndResolveMovement(state);
    expect(state.board[0].position).toBe(1);
  });

  it('should execute AI turn effectively', () => {
    let state = createInitialGameState('PYROS');
    state.phase = 'AI_TURN';
    state.activePlayer = 'AI';
    state.ai.pa = 10;

    const stateAfterAi = executeAiTurn(state);
    expect(stateAfterAi.board.filter(c => c.owner === 'AI').length).toBeGreaterThan(0);
  });
});
