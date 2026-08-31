import { GameState, GodId, Dofus, Card, CreatureOnBoard, GameLog, Prism } from '../types/game';
import { generateDeck } from '../data/cards';

export function createInitialGameState(playerGod: GodId): GameState {
  const aiGod: GodId = playerGod === 'PYROS' ? 'ZEPHIRA' : 'PYROS';

  // Generate Dofuses (3 Real with 5 HP, 2 Fake with 5 HP)
  const createDofuses = (owner: 'PLAYER' | 'AI'): Dofus[] => {
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

  // Generate Initial Prisms on Column x=3 (center column on 7-tile board)
  const createInitialPrisms = (): Prism[] => {
    const types: ('PA' | 'DRAW')[] = ['PA', 'PA', 'DRAW', 'DRAW', 'DRAW'];
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    return [0, 1, 2, 3, 4].map(laneIndex => ({
      id: `prism_lane_${laneIndex}`,
      laneIndex,
      position: 3,
      type: types[laneIndex],
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
    prisms: createInitialPrisms(),
    board: [],
    selectedCardId: null,
    selectedTargetType: null,
    winner: null,
    logs: [
      { id: '1', text: `Début du combat sur plateau 5x7 ! Vous jouez ${playerGod} contre l'IA (${aiGod}).`, type: 'INFO' }
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

  const summonPosition = owner === 'PLAYER' ? 0 : 6;
  const occupied = state.board.some(c => c.laneIndex === laneIndex && c.position === summonPosition);
  if (occupied) return state;

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

  let newState: GameState = {
    ...state,
    [owner === 'PLAYER' ? 'player' : 'ai']: updatedPlayer,
    board: newBoard,
    logs,
  };

  if (card.creatureEffect?.type === 'ON_SUMMON_DRAW' && card.creatureEffect.value) {
    newState = drawCard(newState, owner, card.creatureEffect.value);
  }

  if (card.creatureEffect?.type === 'CHARGE') {
    const nextPos = owner === 'PLAYER' ? summonPosition + 1 : summonPosition - 1;
    if (!newBoard.some(c => c.laneIndex === laneIndex && c.position === nextPos)) {
      newCreature.position = nextPos;
    }
  }

  if (card.creatureEffect?.type === 'ON_SUMMON_DAMAGE' && card.creatureEffect.value) {
    const val = card.creatureEffect.value;
    const enemyOwner = owner === 'PLAYER' ? 'AI' : 'PLAYER';
    const enemy = newBoard.find(c => c.owner === enemyOwner && c.laneIndex === laneIndex);
    if (enemy) {
      enemy.hp -= val;
      logs.push({ id: (Date.now() + 1).toString(), text: `${card.name} inflige ${val} dégâts à ${enemy.name} à l'invocation !`, type: 'SPELL' });
      if (enemy.hp <= 0) {
        newBoard = newBoard.filter(c => c.id !== enemy.id);
      }
    }
  }

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
          target.isDamaged = true;
          logs.push({ id: Date.now().toString(), text: `${card.name} inflige ${effect.value} dégâts à ${target.name}.`, type: 'SPELL' });
          if (target.hp <= 0) newBoard = newBoard.filter(c => c.id !== target.id);
        }
      } else if (targetDofusId) {
        newStateDofusDamage(newDofuses, targetDofusId, effect.value, logs);
      }
      break;
    }
    case 'DAMAGE_ALL_LINE': {
      if (targetLaneIndex !== undefined) {
        newBoard.forEach(c => {
          if (c.laneIndex === targetLaneIndex) {
            c.hp -= effect.value;
            c.isDamaged = true;
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
          const newPos = Math.max(0, Math.min(6, target.position + pushDirection));
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

export function useGodPower(state: GameState, owner: 'PLAYER' | 'AI'): GameState {
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
    const enemyOwner = owner === 'PLAYER' ? 'AI' : 'PLAYER';
    const targets = newBoard.filter(c => c.owner === enemyOwner);
    if (targets.length > 0) {
      const target = targets[0];
      target.hp -= 2;
      target.isDamaged = true;
      logs.push({ id: (Date.now() + 1).toString(), text: `Pouvoir Pyros inflige 2 dégâts à ${target.name}.`, type: 'GOD_POWER' });
      newBoard = newBoard.filter(c => c.hp > 0);
    } else {
      logs.push({ id: (Date.now() + 1).toString(), text: `Aucune cible pour le Pouvoir Pyros.`, type: 'GOD_POWER' });
    }
  } else {
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
  let board = [...state.board.map(c => ({ ...c, isAttacking: false, isDamaged: false }))];
  let dofuses = {
    player: state.dofuses.player.map(d => ({ ...d })),
    ai: state.dofuses.ai.map(d => ({ ...d })),
  };
  let prisms = [...state.prisms];

  let playerState = { ...state.player };
  let aiState = { ...state.ai };

  let tempDraws = { PLAYER: 0, AI: 0 };

  logs.push({ id: Date.now().toString(), text: `--- Fin du tour : Déplacement & Combats ---`, type: 'INFO' });

  for (let lane = 0; lane < 5; lane++) {
    const laneCreatures = board.filter(c => c.laneIndex === lane);

    for (const creature of laneCreatures) {
      if (creature.hp <= 0) continue;

      const direction = creature.owner === 'PLAYER' ? 1 : -1;
      let pmLeft = creature.pm;

      while (pmLeft > 0 && creature.hp > 0) {
        const nextPos = creature.position + direction;

        if ((creature.owner === 'PLAYER' && nextPos > 6) || (creature.owner === 'AI' && nextPos < 0)) {
          const targetDofusOwner = creature.owner === 'PLAYER' ? 'ai' : 'player';
          const targetDofus = dofuses[targetDofusOwner].find(d => d.laneIndex === lane);

          if (targetDofus && targetDofus.hp > 0) {
            targetDofus.hp -= creature.atk;
            targetDofus.isRevealed = true;
            creature.isAttacking = true;
            logs.push({
              id: Date.now().toString(),
              text: `${creature.name} frappe le Dofus de la ligne ${lane + 1} pour ${creature.atk} dégâts ! (${targetDofus.isReal ? 'VRAI DOFUS !' : 'Faux Dofus !'})`,
              type: 'COMBAT'
            });
            creature.hp = 0;
          }
          break;
        }

        const enemyOwner = creature.owner === 'PLAYER' ? 'AI' : 'PLAYER';
        const inRangeEnemies = board.filter(other =>
          other.owner === enemyOwner &&
          other.laneIndex === lane &&
          other.hp > 0 &&
          Math.abs(other.position - creature.position) <= creature.range
        );

        if (inRangeEnemies.length > 0) {
          inRangeEnemies.sort((a, b) => Math.abs(a.position - creature.position) - Math.abs(b.position - creature.position));
          const enemy = inRangeEnemies[0];

          creature.isAttacking = true;
          enemy.isAttacking = true;
          creature.isDamaged = true;
          enemy.isDamaged = true;

          logs.push({
            id: Date.now().toString(),
            text: `Combat : ${creature.name} (${creature.atk} ATK) combat ${enemy.name} (${enemy.atk} ATK) !`,
            type: 'COMBAT'
          });

          enemy.hp -= creature.atk;
          creature.hp -= enemy.atk;
          pmLeft = 0;
          break;
        }

        const tileOccupied = board.some(other => other.laneIndex === lane && other.position === nextPos && other.hp > 0 && other.id !== creature.id);
        if (tileOccupied) break;

        creature.position = nextPos;
        pmLeft--;

        // Check PRISM COLLECTION on position x=3
        const prismIdx = prisms.findIndex(p => p.laneIndex === lane && p.position === creature.position);
        if (prismIdx !== -1) {
          const prism = prisms[prismIdx];
          prisms.splice(prismIdx, 1);

          const ownerIsPlayer = creature.owner === 'PLAYER';
          if (prism.type === 'PA') {
            if (ownerIsPlayer) playerState.pa = Math.min(10, playerState.pa + 1);
            else aiState.pa = Math.min(10, aiState.pa + 1);

            logs.push({
              id: Date.now().toString(),
              text: `${creature.name} ramasse un Prisme de PA (+1 PA) !`,
              type: 'PRISM'
            });
          } else if (prism.type === 'DRAW') {
            tempDraws[creature.owner] += 1;
            logs.push({
              id: Date.now().toString(),
              text: `${creature.name} ramasse un Prisme de Pioche (+1 Carte) !`,
              type: 'PRISM'
            });
          }
        }
      }
    }
  }

  if (prisms.length < 3) {
    const emptyPrismLanes = [0, 1, 2, 3, 4].filter(lane => !prisms.some(p => p.laneIndex === lane));
    if (emptyPrismLanes.length > 0) {
      const respawnLane = emptyPrismLanes[Math.floor(Math.random() * emptyPrismLanes.length)];
      const newType: 'PA' | 'DRAW' = Math.random() > 0.5 ? 'PA' : 'DRAW';
      prisms.push({
        id: `prism_${Date.now()}`,
        laneIndex: respawnLane,
        position: 3,
        type: newType,
      });
    }
  }

  board = board.filter(c => c.hp > 0);

  const nextPlayer = state.activePlayer === 'PLAYER' ? 'AI' : 'PLAYER';
  const newTurn = nextPlayer === 'PLAYER' ? state.turn + 1 : state.turn;

  const updatePA = (pState: typeof state.player, isNext: boolean) => {
    const newMax = Math.min(10, pState.maxPa + (isNext ? 1 : 0));
    return {
      ...pState,
      maxPa: newMax,
      pa: isNext ? newMax : pState.pa,
      godPowerUsedThisTurn: false,
    };
  };

  let nextState: GameState = {
    ...state,
    turn: newTurn,
    phase: nextPlayer === 'PLAYER' ? 'PLAYER_TURN' : 'AI_TURN',
    activePlayer: nextPlayer,
    player: updatePA(playerState, nextPlayer === 'PLAYER'),
    ai: updatePA(aiState, nextPlayer === 'AI'),
    board,
    dofuses,
    prisms,
    logs,
  };

  if (tempDraws.PLAYER > 0) nextState = drawCard(nextState, 'PLAYER', tempDraws.PLAYER);
  if (tempDraws.AI > 0) nextState = drawCard(nextState, 'AI', tempDraws.AI);

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
