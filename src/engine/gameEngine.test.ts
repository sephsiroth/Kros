import { describe, it, expect } from 'vitest';
import { createInitialGameState, playCreatureCard, playSpellCard, useGodPower, endTurnAndResolveMovement } from '../engine/gameEngine';
import { executeAiTurn } from '../engine/aiEngine';
import { PYROS_CARDS, ZEPHIRA_CARDS } from '../data/cards';

describe('KROS-LEGENDS Game Engine 5x7 with Prisms', () => {
  it('should initialize prisms on center column x=3 for 5x7 board', () => {
    const state = createInitialGameState('PYROS');
    expect(state.prisms.length).toBe(5);
    state.prisms.forEach(p => {
      expect(p.position).toBe(3);
    });
  });

  it('should collect prism when creature steps on position x=3 on 5x7 board', () => {
    let state = createInitialGameState('PYROS');
    const creatureCard = PYROS_CARDS[0]; // Bouftou de Feu (PM 1)

    state.player.pa = 10;
    state.player.hand = [creatureCard];

    // Player summons creature on lane 0, pos 0
    state = playCreatureCard(state, 'PLAYER', creatureCard, 0);

    // Turn 1 end: moves to pos 1
    state = endTurnAndResolveMovement(state);
    expect(state.board[0].position).toBe(1);

    // Turn 2 end (AI turn resolution): moves to pos 2
    state = endTurnAndResolveMovement(state);
    expect(state.board[0].position).toBe(2);

    // Turn 3 end (Player turn resolution): moves to pos 3 (Prism collected!)
    state = endTurnAndResolveMovement(state);
    expect(state.board[0].position).toBe(3);

    // Prism collected on lane 0
    expect(state.prisms.some(p => p.laneIndex === 0 && p.position === 3)).toBe(false);
  });
});
