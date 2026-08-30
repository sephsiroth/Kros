import { GameState, GodId, Dofus, Card, CreatureOnBoard, GameLog } from '../types/game';
import { generateDeck } from '../data/cards';

export function createInitialGameState(playerGod: GodId): GameState {
  const aiGod: GodId = playerGod === 'PYROS' ? 'ZEPHIRA' : 'PYROS';

  // Generate Dofuses (3 Real with 5 HP, 2 Fake with 5 HP)
  const createDofuses = (owner: 'PLAYER' | 'AI'): Dofus[] => {
    // Randomize indices for 3 real dofuses among 0..4
    const indices = [0, 1, 2, 3, 4];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const realIndices = new Set(indices.slice(0, 3));

    return [0, 1, 2, 3, 4].map(laneIndex => ({
      id: `${owner.toLowerCase()}_dofus_${laneIndex}`,
      laneIndex,
      owner,
      isReal: realIndices.has(laneIndex),
      hp: 5,
      maxHp: 5,
      isRevealed: false,
    }));
  };

  const playerDeck = generateDeck(playerGod);
  const aiDeck = generateDeck(aiGod);

  // Draw initial 3 cards
  const playerHand = playerDeck.splice(0, 3);
  const aiHand = aiDeck.splice(0, 3);

  return {
    turn: 1,
    phase: 'PLAYER_TURN',
    activePlayer: 'PLAYER',
    player: {
      god: playerGod,
      pa: 3,
      maxPa: 3,
      deck: playerDeck,
      hand: playerHand,
      discard: [],
      godPowerUsedThisTurn: false,
      godPowerCost: 2,
    },
    ai: {
      god: aiGod,
      pa: 3,
      maxPa: 3,
      deck: aiDeck,
      hand: aiHand,
      discard: [],
      godPowerUsedThisTurn: false,
      godPowerCost: 2,
    },
    dofuses: {
      player: createDofuses('PLAYER'),
      ai: createDofuses('AI'),
    },
    board: [],
    selectedCardId: null,
    selectedTargetType: null,
    winner: null,
    logs: [
      { id: '1', text: `Début du combat ! Vous jouez ${playerGod} contre l'IA (${aiGod}).`, type: 'INFO' }
    ],
  };
}

export function drawCard(state: GameState, target: 'PLAYER' | 'AI', count: number = 1): GameState {
  const newState = { ...state };
  const playerState = { ...newState[target === 'PLAYER' ? 'player' : 'ai'] };

  for (let i = 0; i < count; i++) {
    if (playerState.deck.length > 0) {
      const card = playerState.deck[0];
      playerState.deck = playerState.deck.slice(1);
      playerState.hand = [...playerState.hand, card];
    }
  }

  newState[target === 'PLAYER' ? 'player' : 'ai'] = playerState;
  return newState;
}

export function playCreatureCard(
  state: GameState,
  owner: 'PLAYER' | 'AI',
  card: Card,
  laneIndex: number
): GameState {
  const playerState = owner === 'PLAYER' ? state.player : state.ai;
  if (playerState.pa < card.paCost) return state;

  const summonPosition = owner === 'PLAYER' ? 0 : 4;
  // Check if initial tile is occupied
  const occupied = state.board.some(c => c.laneIndex === laneIndex && c.position === summonPosition);
  if (occupied) return state;

  // Deduct PA and remove card from hand
  const updatedPlayer = {
    ...playerState,
    pa: playerState.pa - card.paCost,
    hand: playerState.hand.filter(c => c.id !== card.id),
  };

  const newCreature: CreatureOnBoard = {
    id: `creature_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    cardId: card.id,
    owner,
    name: card.name,
    atk: card.atk || 1,
    hp: card.hp || 1,
    maxHp: card.hp || 1,
    pm: card.pm || 1,
    range: card.range || 1,
    laneIndex,
    position: summonPosition,
    canAct: true,
    illustration: card.illustration,
  };

  let newBoard = [...state.board, newCreature];
  let logs: GameLog[] = [
    ...state.logs,
    { id: Date.now().toString(), text: `${owner === 'PLAYER' ? 'Vous invoquez' : 'L\'IA invoque'} ${card.name} sur la ligne ${laneIndex + 1}.`, type: 'INFO' }
  ];

  // Handle CHARGE effect (advances 1 position immediately if free)
  if (card.creatureEffect?.type === 'CHARGE') {
    const nextPos = owner === 'PLAYER' ? summonPosition + 1 : summonPosition - 1;
    if (!newBoard.some(c => c.laneIndex === laneIndex && c.position === nextPos)) {
      newCreature.position = nextPos;
    }
  }

  // Handle ON_SUMMON_DAMAGE
  if (card.creatureEffect?.type === 'ON_SUMMON_DAMAGE' && card.creatureEffect.value) {
    const val = card.creatureEffect.value;
    const enemyOwner = owner === 'PLAYER' ? 'AI' : 'PLAYER';
    // Damage enemy creature on same lane if exists
    const enemy = newBoard.find(c => c.owner === enemyOwner && c.laneIndex === laneIndex);
    if (enemy) {
      enemy.hp -= val;
      logs.push({ id: (Date.now() + 1).toString(), text: `${card.name} inflige ${val} dégâts à ${enemy.name} à l'invocation !`, type: 'SPELL' });
      if (enemy.hp <= 0) {
        newBoard = newBoard.filter(c => c.id !== enemy.id);
      }
    }
  }

  let newState: GameState = {
    ...state,
    [owner === 'PLAYER' ? 'player' : 'ai']: updatedPlayer,
    board: newBoard,
    logs,
  };

  return newState;
}

export function playSpellCard(
  state: GameState,
  owner: 'PLAYER' | 'AI',
  card: Card,
  targetLaneIndex?: number,
  targetCreatureId?: string,
  targetDofusId?: string
): GameState {
  const playerState = owner === 'PLAYER' ? state.player : state.ai;
  if (playerState.pa < card.paCost || !card.spellEffect) return state;

  const updatedPlayer = {
    ...playerState,
    pa: playerState.pa - card.paCost,
    hand: playerState.hand.filter(c => c.id !== card.id),
    discard: [...playerState.discard, card],
  };

  let newBoard = [...state.board];
  let logs: GameLog[] = [
    ...state.logs,
    { id: Date.now().toString(), text: `${owner === 'PLAYER' ? 'Vous jouez' : 'L\'IA joue'} le sort ${card.name}.`, type: 'SPELL' }
  ];
  let newDofuses = { ...state.dofuses };

  const effect = card.spellEffect;

  switch (effect.type) {
    case 'DAMAGE_TARGET': {
      if (targetCreatureId) {
        const target = newBoard.find(c => c.id === targetCreatureId);
        if (target) {
          target.hp -= effect.value;
          logs.push({ id: Date.now().toString(), text: `${card.name} inflige ${effect.value} dégâts à ${target.name}.`, type: 'SPELL' });
          if (target.hp <= 0) newBoard = newBoard.filter(c => c.id !== target.id);
        }
      } else if (targetDofusId) {
        // Damage Dofus
        newStateDofusDamage(newDofuses, targetDofusId, effect.value, logs);
      }
      break;
    }
    case 'DAMAGE_ALL_LINE': {
      if (targetLaneIndex !== undefined) {
        newBoard.forEach(c => {
          if (c.laneIndex === targetLaneIndex) {
            c.hp -= effect.value;
          }
        });
        logs.push({ id: Date.now().toString(), text: `${card.name} inflige ${effect.value} dégâts à toutes les créatures de la ligne ${targetLaneIndex + 1}.`, type: 'SPELL' });
        newBoard = newBoard.filter(c => c.hp > 0);
      }
      break;
    }
    case 'BUFF_ATK': {
      if (targetCreatureId) {
        const target = newBoard.find(c => c.id === targetCreatureId);
        if (target) {
          target.atk += effect.value;
          logs.push({ id: Date.now().toString(), text: `${target.name} gagne +${effect.value} d'ATK !`, type: 'SPELL' });
        }
      }
      break;
    }
    case 'HEAL_TARGET': {
      if (targetCreatureId) {
        const target = newBoard.find(c => c.id === targetCreatureId);
        if (target) {
          target.hp = Math.min(target.maxHp, target.hp + effect.value);
          logs.push({ id: Date.now().toString(), text: `${target.name} récupère ${effect.value} PV.`, type: 'SPELL' });
        }
      }
      break;
    }
    case 'PUSH': {
      if (targetCreatureId) {
        const target = newBoard.find(c => c.id === targetCreatureId);
        if (target) {
          const pushDirection = target.owner === 'PLAYER' ? -1 : 1;
          const newPos = Math.max(0, Math.min(4, target.position + pushDirection));
          if (!newBoard.some(c => c.laneIndex === target.laneIndex && c.position === newPos && c.id !== target.id)) {
            target.position = newPos;
            logs.push({ id: Date.now().toString(), text: `${target.name} est repoussé d'une case !`, type: 'SPELL' });
          }
        }
      }
      break;
    }
    case 'DRAW_CARDS': {
      let tempState: GameState = {
        ...state,
        [owner === 'PLAYER' ? 'player' : 'ai']: updatedPlayer,
        board: newBoard,
        dofuses: newDofuses,
        logs,
      };
      return drawCard(tempState, owner, effect.value);
    }
  }

  let finalState: GameState = {
    ...state,
    [owner === 'PLAYER' ? 'player' : 'ai']: updatedPlayer,
    board: newBoard,
    dofuses: newDofuses,
    logs,
  };

  return checkVictoryConditions(finalState);
}

export function useGodPower(state: GameState, owner: 'PLAYER' | 'AI', targetLaneIndex?: number): GameState {
  const playerState = owner === 'PLAYER' ? state.player : state.ai;
  if (playerState.pa < playerState.godPowerCost || playerState.godPowerUsedThisTurn) return state;

  const updatedPlayer = {
    ...playerState,
    pa: playerState.pa - playerState.godPowerCost,
    godPowerUsedThisTurn: true,
  };

  let logs = [
    ...state.logs,
    { id: Date.now().toString(), text: `${owner === 'PLAYER' ? 'Vous utilisez' : 'L\'IA utilise'} le Pouvoir Divin de ${playerState.god} !`, type: 'GOD_POWER' as const }
  ];

  let newBoard = [...state.board];

  if (playerState.god === 'PYROS') {
    // PYROS: Inflige 2 dégâts à la première créature ennemie rencontrée
    const enemyOwner = owner === 'PLAYER' ? 'AI' : 'PLAYER';
    const targets = newBoard.filter(c => c.owner === enemyOwner);
    if (targets.length > 0) {
      // Pick first target
      const target = targets[0];
      target.hp -= 2;
      logs.push({ id: (Date.now() + 1).toString(), text: `Pouvoir Pyros inflige 2 dégâts à ${target.name}.`, type: 'GOD_POWER' });
      newBoard = newBoard.filter(c => c.hp > 0);
    } else {
      logs.push({ id: (Date.now() + 1).toString(), text: `Aucune cible pour le Pouvoir Pyros.`, type: 'GOD_POWER' });
    }
  } else {
    // ZEPHIRA: Piocher 1 carte et octroyer +1 PM à une créature alliée
    const allies = newBoard.filter(c => c.owner === owner);
    if (allies.length > 0) {
      allies[0].pm += 1;
      logs.push({ id: (Date.now() + 1).toString(), text: `Pouvoir Zephira donne +1 PM à ${allies[0].name}.`, type: 'GOD_POWER' });
    }
  }

  let tempState: GameState = {
    ...state,
    [owner === 'PLAYER' ? 'player' : 'ai']: updatedPlayer,
    board: newBoard,
    logs,
  };

  if (playerState.god === 'ZEPHIRA') {
    tempState = drawCard(tempState, owner, 1);
  }

  return tempState;
}

export function endTurnAndResolveMovement(state: GameState): GameState {
  let logs = [...state.logs];
  let board = [...state.board.map(c => ({ ...c }))];
  let dofuses = {
    player: state.dofuses.player.map(d => ({ ...d })),
    ai: state.dofuses.ai.map(d => ({ ...d })),
  };

  logs.push({ id: Date.now().toString(), text: `--- Fin du tour : Déplacement & Combats ---`, type: 'INFO' });

  // Move and combat for active player's creatures first, then opponent's
  const currentOwner = state.activePlayer;

  // Process movement per lane (0 to 4)
  for (let lane = 0; lane < 5; lane++) {
    // Get creatures in this lane, sorted by proximity to target
    const laneCreatures = board.filter(c => c.laneIndex === lane);

    for (const creature of laneCreatures) {
      if (creature.hp <= 0) continue;

      const direction = creature.owner === 'PLAYER' ? 1 : -1;
      let pmLeft = creature.pm;

      while (pmLeft > 0 && creature.hp > 0) {
        const nextPos = creature.position + direction;

        // Check if hitting Dofus line
        if ((creature.owner === 'PLAYER' && nextPos > 4) || (creature.owner === 'AI' && nextPos < 0)) {
          // Attacking opponent Dofus
          const targetDofusOwner = creature.owner === 'PLAYER' ? 'ai' : 'player';
          const targetDofus = dofuses[targetDofusOwner].find(d => d.laneIndex === lane);

          if (targetDofus && targetDofus.hp > 0) {
            targetDofus.hp -= creature.atk;
            targetDofus.isRevealed = true;
            logs.push({
              id: Date.now().toString(),
              text: `${creature.name} frappe le Dofus de la ligne ${lane + 1} pour ${creature.atk} dégâts ! (${targetDofus.isReal ? 'VRAI DOFUS !' : 'Faux Dofus !'})`,
              type: 'COMBAT'
            });
            // Creature dies upon hitting Dofus
            creature.hp = 0;
          }
          break;
        }

        // Check range combat before moving
        const enemyOwner = creature.owner === 'PLAYER' ? 'AI' : 'PLAYER';
        const inRangeEnemies = board.filter(other =>
          other.owner === enemyOwner &&
          other.laneIndex === lane &&
          other.hp > 0 &&
          Math.abs(other.position - creature.position) <= creature.range
        );

        if (inRangeEnemies.length > 0) {
          // Engage in combat with the closest enemy
          inRangeEnemies.sort((a, b) => Math.abs(a.position - creature.position) - Math.abs(b.position - creature.position));
          const enemy = inRangeEnemies[0];

          logs.push({
            id: Date.now().toString(),
            text: `Combat : ${creature.name} (${creature.atk} ATK) combat ${enemy.name} (${enemy.atk} ATK) !`,
            type: 'COMBAT'
          });

          // Simultaneous damage exchange
          enemy.hp -= creature.atk;
          creature.hp -= enemy.atk;
          pmLeft = 0; // Stop moving this turn after combat
          break;
        }

        // Check if next tile is occupied by ANY creature
        const tileOccupied = board.some(other => other.laneIndex === lane && other.position === nextPos && other.hp > 0 && other.id !== creature.id);
        if (tileOccupied) {
          // Blocked
          break;
        }

        // Move 1 tile forward
        creature.position = nextPos;
        pmLeft--;
      }
    }
  }

  // Remove dead creatures from board
  board = board.filter(c => c.hp > 0);

  // Switch turn
  const nextPlayer = state.activePlayer === 'PLAYER' ? 'AI' : 'PLAYER';
  const newTurn = nextPlayer === 'PLAYER' ? state.turn + 1 : state.turn;

  // Recharge PA
  const updatePlayerState = (pState: typeof state.player) => {
    const newMax = Math.min(10, pState.maxPa + (nextPlayer === (pState.god === state.player.god ? 'PLAYER' : 'AI') ? 1 : 0));
    return {
      ...pState,
      maxPa: newMax,
      pa: newMax,
      godPowerUsedThisTurn: false,
    };
  };

  let nextState: GameState = {
    ...state,
    turn: newTurn,
    phase: nextPlayer === 'PLAYER' ? 'PLAYER_TURN' : 'AI_TURN',
    activePlayer: nextPlayer,
    player: updatePlayerState(state.player),
    ai: updatePlayerState(state.ai),
    board,
    dofuses,
    logs,
  };

  // Draw card for the starting player of new turn
  nextState = drawCard(nextState, nextPlayer, 1);

  return checkVictoryConditions(nextState);
}

function newStateDofusDamage(dofuses: GameState['dofuses'], dofusId: string, damage: number, logs: GameLog[]) {
  const allDofuses = [...dofuses.player, ...dofuses.ai];
  const dofus = allDofuses.find(d => d.id === dofusId);
  if (dofus) {
    dofus.hp -= damage;
    dofus.isRevealed = true;
    logs.push({
      id: Date.now().toString(),
      text: `Dofus subit ${damage} dégâts ! (${dofus.isReal ? 'VRAI DOFUS !' : 'Faux Dofus !'})`,
      type: 'COMBAT'
    });
  }
}

export function checkVictoryConditions(state: GameState): GameState {
  const destroyedPlayerRealDofuses = state.dofuses.player.filter(d => d.isReal && d.hp <= 0).length;
  const destroyedAiRealDofuses = state.dofuses.ai.filter(d => d.isReal && d.hp <= 0).length;

  if (destroyedAiRealDofuses >= 2) {
    return {
      ...state,
      phase: 'GAME_OVER',
      winner: 'PLAYER',
      logs: [
        ...state.logs,
        { id: Date.now().toString(), text: '🎉 VICTOIRE ! Vous avez détruit 2 Vrais Dofus adverses !', type: 'VICTORY' }
      ]
    };
  }

  if (destroyedPlayerRealDofuses >= 2) {
    return {
      ...state,
      phase: 'GAME_OVER',
      winner: 'AI',
      logs: [
        ...state.logs,
        { id: Date.now().toString(), text: '💀 DÉFAITE ! L\'IA a détruit 2 de vos Vrais Dofus.', type: 'VICTORY' }
      ]
    };
  }

  return state;
}
