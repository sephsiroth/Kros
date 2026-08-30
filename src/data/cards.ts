import { Card, GodId } from '../types/game';

// PYROS CARDS - Fire / Heavy Hitters / Direct Damage
export const PYROS_CARDS: Card[] = [
  {
    id: 'pyr_c1',
    name: 'Bouftou de Feu',
    god: 'PYROS',
    type: 'CREATURE',
    paCost: 2,
    atk: 3,
    hp: 3,
    pm: 1,
    range: 1,
    description: 'Une créature robuste de début de partie.',
    illustration: '🐗'
  },
  {
    id: 'pyr_c2',
    name: 'Guerrier Pyromane',
    god: 'PYROS',
    type: 'CREATURE',
    paCost: 4,
    atk: 5,
    hp: 4,
    pm: 1,
    range: 1,
    description: 'Inflige 2 dégâts lorsqu\'il est invoqué.',
    creatureEffect: { type: 'ON_SUMMON_DAMAGE', value: 2 },
    illustration: '⚔️'
  },
  {
    id: 'pyr_c3',
    name: 'Dragon de Cendres',
    god: 'PYROS',
    type: 'CREATURE',
    paCost: 6,
    atk: 7,
    hp: 6,
    pm: 2,
    range: 1,
    description: 'Charge rapide (avance immédiatement d\'une case).',
    creatureEffect: { type: 'CHARGE' },
    illustration: '🐉'
  },
  {
    id: 'pyr_s1',
    name: 'Flamme Magmatique',
    god: 'PYROS',
    type: 'SPELL',
    paCost: 2,
    description: 'Inflige 3 dégâts à une créature ciblée.',
    spellEffect: { type: 'DAMAGE_TARGET', value: 3 },
    illustration: '🔥'
  },
  {
    id: 'pyr_s2',
    name: 'Eruption Terrestre',
    god: 'PYROS',
    type: 'SPELL',
    paCost: 4,
    description: 'Inflige 2 dégâts à TOUTES les créatures sur une ligne.',
    spellEffect: { type: 'DAMAGE_ALL_LINE', value: 2 },
    illustration: '💥'
  },
  {
    id: 'pyr_s3',
    name: 'Fureur de Pyros',
    god: 'PYROS',
    type: 'SPELL',
    paCost: 3,
    description: 'Confère +3 ATK à une créature alliée.',
    spellEffect: { type: 'BUFF_ATK', value: 3 },
    illustration: '⚡'
  }
];

// ZEPHIRA CARDS - Wind / Ranged / Agility / Draw
export const ZEPHIRA_CARDS: Card[] = [
  {
    id: 'zep_c1',
    name: 'Archer Bourrasque',
    god: 'ZEPHIRA',
    type: 'CREATURE',
    paCost: 3,
    atk: 2,
    hp: 3,
    pm: 1,
    range: 2,
    description: 'Attaque à distance (Portée 2).',
    illustration: '🏹'
  },
  {
    id: 'zep_c2',
    name: 'Voltigeur des Cimes',
    god: 'ZEPHIRA',
    type: 'CREATURE',
    paCost: 4,
    atk: 3,
    hp: 4,
    pm: 2,
    range: 1,
    description: 'Très mobile (PM 2).',
    illustration: '🦅'
  },
  {
    id: 'zep_c3',
    name: 'Sniper Éolien',
    god: 'ZEPHIRA',
    type: 'CREATURE',
    paCost: 5,
    atk: 4,
    hp: 3,
    pm: 1,
    range: 3,
    description: 'Portée de tir extrême (Portée 3).',
    illustration: '🎯'
  },
  {
    id: 'zep_s1',
    name: 'Flèche Ciblée',
    god: 'ZEPHIRA',
    type: 'SPELL',
    paCost: 2,
    description: 'Inflige 2 dégâts à une cible.',
    spellEffect: { type: 'DAMAGE_TARGET', value: 2 },
    illustration: '🏹'
  },
  {
    id: 'zep_s2',
    name: 'Rafale Poussante',
    god: 'ZEPHIRA',
    type: 'SPELL',
    paCost: 3,
    description: 'Repousse une créature ennemie d\'une case vers son camp.',
    spellEffect: { type: 'PUSH', value: 1 },
    illustration: '💨'
  },
  {
    id: 'zep_s3',
    name: 'Vent de Sagesse',
    god: 'ZEPHIRA',
    type: 'SPELL',
    paCost: 2,
    description: 'Piocher 2 cartes.',
    spellEffect: { type: 'DRAW_CARDS', value: 2 },
    illustration: '📜'
  }
];

// NEUTRAL CARDS
export const NEUTRAL_CARDS: Card[] = [
  {
    id: 'neu_c1',
    name: 'Graslin Gardien',
    god: 'NEUTRAL',
    type: 'CREATURE',
    paCost: 2,
    atk: 2,
    hp: 4,
    pm: 1,
    range: 1,
    description: 'Défenseur équilibré.',
    illustration: '🛡️'
  },
  {
    id: 'neu_c2',
    name: 'Explorateur Tofu',
    god: 'NEUTRAL',
    type: 'CREATURE',
    paCost: 1,
    atk: 1,
    hp: 2,
    pm: 2,
    range: 1,
    description: 'Créature rapide et économique.',
    illustration: '🐤'
  },
  {
    id: 'neu_s1',
    name: 'Potion de Soin',
    god: 'NEUTRAL',
    type: 'SPELL',
    paCost: 2,
    description: 'Restaure 3 PV à une créature alliée ou un Dofus.',
    spellEffect: { type: 'HEAL_TARGET', value: 3 },
    illustration: '🧪'
  }
];

export function generateDeck(god: GodId): Card[] {
  const godSpecific = god === 'PYROS' ? PYROS_CARDS : ZEPHIRA_CARDS;
  const rawDeck: Card[] = [];

  // Generate 15 cards deck (doubles of most cards)
  godSpecific.forEach(card => {
    rawDeck.push({ ...card, id: `${card.id}_1` });
    rawDeck.push({ ...card, id: `${card.id}_2` });
  });

  NEUTRAL_CARDS.forEach(card => {
    rawDeck.push({ ...card, id: `${card.id}_1` });
  });

  // Take first 15 cards and shuffle
  const deck = rawDeck.slice(0, 15);
  return shuffle(deck);
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
