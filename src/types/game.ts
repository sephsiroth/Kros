export type GodId = 'PYROS' | 'ZEPHIRA';

export type CardType = 'CREATURE' | 'SPELL';

export interface SpellEffect {
  type: 'DAMAGE_TARGET' | 'DAMAGE_ALL_LINE' | 'BUFF_ATK' | 'HEAL_TARGET' | 'PUSH' | 'DRAW_CARDS' | 'DAMAGE_DOFU';
  value: number;
}

export interface CreatureEffect {
  type: 'CHARGE' | 'ON_SUMMON_DAMAGE' | 'ON_SUMMON_DRAW' | 'RANGE_ATTACK';
  value?: number;
}

export interface Card {
  id: string;
  name: string;
  god: GodId | 'NEUTRAL';
  type: CardType;
  paCost: number;
  atk?: number;
  hp?: number;
  pm?: number;
  range?: number; // 1 for melee, 2-3 for ranged
  description: string;
  spellEffect?: SpellEffect;
  creatureEffect?: CreatureEffect;
  illustration: string; // Icon or emoji identifier
}

export interface Dofus {
  id: string;
  laneIndex: number; // 0 to 4
  owner: 'PLAYER' | 'AI';
  isReal: boolean;
  hp: number; // default 5
  maxHp: number;
  isRevealed: boolean;
}

export interface Prism {
  id: string;
  laneIndex: number; // 0 to 4
  position: number;  // Always 3 (center column on 7-tile board: 0..6)
  type: 'PA' | 'DRAW';
}

export interface CreatureOnBoard {
  id: string; // Unique instance ID
  cardId: string;
  owner: 'PLAYER' | 'AI';
  name: string;
  atk: number;
  hp: number;
  maxHp: number;
  pm: number;
  range: number;
  laneIndex: number; // 0 to 4
  position: number;  // 0 to 6 (0 = Player summon tile, 6 = AI summon tile)
  canAct: boolean;
  illustration: string;
  isAttacking?: boolean;
  isDamaged?: boolean;
}

export interface PlayerState {
  god: GodId;
  pa: number;
  maxPa: number;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  godPowerUsedThisTurn: boolean;
  godPowerCost: number;
}

export type GamePhase = 'PLAYER_TURN' | 'AI_TURN' | 'RESOLVING' | 'GAME_OVER';

export interface GameLog {
  id: string;
  text: string;
  type: 'INFO' | 'COMBAT' | 'SPELL' | 'GOD_POWER' | 'PRISM' | 'VICTORY';
}

export interface GameState {
  turn: number;
  phase: GamePhase;
  activePlayer: 'PLAYER' | 'AI';
  player: PlayerState;
  ai: PlayerState;
  dofuses: {
    player: Dofus[]; // 5 Dofuses at col 0
    ai: Dofus[];     // 5 Dofuses at col 6
  };
  prisms: Prism[];   // Prisms on center column x=3
  board: CreatureOnBoard[];
  selectedCardId: string | null;
  selectedTargetType: 'TILE' | 'CREATURE' | 'ENEMY_LINE' | 'NONE' | null;
  winner: 'PLAYER' | 'AI' | null;
  logs: GameLog[];
}
