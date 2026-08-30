import { GameState } from '../types/game';
import { playCreatureCard, playSpellCard, useGodPower } from './gameEngine';

export function executeAiTurn(state: GameState): GameState {
  if (state.phase !== 'AI_TURN' || state.winner) return state;

  let currentState = { ...state };
  let actionsTaken = 0;
  const maxActions = 10;

  while (actionsTaken < maxActions) {
    actionsTaken++;
    const aiHand = currentState.ai.hand;
    const aiPa = currentState.ai.pa;
    const board = currentState.board;

    // 1. Check playable creatures
    const playableCreatures = aiHand.filter(c => c.type === 'CREATURE' && c.paCost <= aiPa);

    if (playableCreatures.length > 0) {
      // Pick best creature (highest PA cost possible)
      playableCreatures.sort((a, b) => b.paCost - a.paCost);
      const chosenCreature = playableCreatures[0];

      // Find available lanes where tile x=4 is empty
      const availableLanes = [0, 1, 2, 3, 4].filter(lane =>
        !board.some(c => c.laneIndex === lane && c.position === 4)
      );

      if (availableLanes.length > 0) {
        // Prioritize lanes with enemy player creatures approaching
        const playerThreats = board.filter(c => c.owner === 'PLAYER');
        let targetLane = availableLanes[0];

        const laneThreatScores = availableLanes.map(lane => {
          const threatsOnLane = playerThreats.filter(c => c.laneIndex === lane);
          const maxEnemyPos = threatsOnLane.reduce((max, c) => Math.max(max, c.position), -1);
          return { lane, threatLevel: maxEnemyPos };
        });

        laneThreatScores.sort((a, b) => b.threatLevel - a.threatLevel);
        targetLane = laneThreatScores[0].lane;

        currentState = playCreatureCard(currentState, 'AI', chosenCreature, targetLane);
        continue;
      }
    }

    // 2. Check playable spells
    const playableSpells = aiHand.filter(c => c.type === 'SPELL' && c.paCost <= aiPa);

    if (playableSpells.length > 0) {
      const spell = playableSpells[0];

      if (spell.spellEffect?.type === 'DAMAGE_TARGET' || spell.spellEffect?.type === 'PUSH') {
        // Target strongest player creature
        const playerCreatures = currentState.board.filter(c => c.owner === 'PLAYER');
        if (playerCreatures.length > 0) {
          playerCreatures.sort((a, b) => b.atk - a.atk);
          currentState = playSpellCard(currentState, 'AI', spell, undefined, playerCreatures[0].id);
          continue;
        }
      } else if (spell.spellEffect?.type === 'DAMAGE_ALL_LINE') {
        // Find lane with most player creatures
        let bestLane = 0;
        let maxCount = 0;
        for (let l = 0; l < 5; l++) {
          const count = currentState.board.filter(c => c.owner === 'PLAYER' && c.laneIndex === l).length;
          if (count > maxCount) {
            maxCount = count;
            bestLane = l;
          }
        }
        if (maxCount > 0) {
          currentState = playSpellCard(currentState, 'AI', spell, bestLane);
          continue;
        }
      } else if (spell.spellEffect?.type === 'DRAW_CARDS') {
        currentState = playSpellCard(currentState, 'AI', spell);
        continue;
      } else if (spell.spellEffect?.type === 'BUFF_ATK' || spell.spellEffect?.type === 'HEAL_TARGET') {
        const aiCreatures = currentState.board.filter(c => c.owner === 'AI');
        if (aiCreatures.length > 0) {
          currentState = playSpellCard(currentState, 'AI', spell, undefined, aiCreatures[0].id);
          continue;
        }
      }
    }

    // 3. Check God Power usage
    if (aiPa >= currentState.ai.godPowerCost && !currentState.ai.godPowerUsedThisTurn) {
      currentState = useGodPower(currentState, 'AI');
      continue;
    }

    // No more meaningful actions can be taken
    break;
  }

  return currentState;
}
