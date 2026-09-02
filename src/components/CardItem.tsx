import React from 'react';
import { Card } from '../types/game';
import { Heart, Zap, Footprints, Target } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface CardItemProps {
  card: Card;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  isSelected = false,
  isDisabled = false,
  onClick,
  size = 'md',
}) => {
  const isCreature = card.type === 'CREATURE';

  const sizeClasses = {
    sm: 'w-20 h-28 text-[10px] p-1.5',
    md: 'w-28 h-38 text-xs p-2',
    lg: 'w-36 h-48 text-xs p-2.5',
  }[size];

  return (
    <div
      onClick={() => {
        if (!isDisabled) {
          soundEffects.playClick();
          if (onClick) onClick();
        }
      }}
      className={`relative flex flex-col justify-between rounded-xl transition-all duration-200 select-none cursor-pointer flex-shrink-0 ${sizeClasses} ${
        isSelected
          ? 'ring-4 ring-amber-400 border-amber-400 scale-105 shadow-xl shadow-amber-500/40 bg-gradient-to-b from-indigo-900 to-slate-900'
          : isDisabled
          ? 'opacity-40 grayscale cursor-not-allowed border-slate-800 bg-slate-900/60'
          : 'kros-card-border kros-card-playable hover:-translate-y-1'
      }`}
    >
      {/* PA Cost Badge */}
      <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-blue-600 border-2 border-blue-300 text-white font-black text-[10px] flex items-center justify-center shadow-lg z-10">
        {card.paCost}
      </div>

      {/* Card Header */}
      <div className="pt-1 text-center">
        <div className="font-bold text-slate-100 truncate px-0.5" title={card.name}>
          {card.name}
        </div>
        <div className="text-[8px] text-amber-400 uppercase tracking-widest font-extrabold">
          {card.type}
        </div>
      </div>

      {/* Card Illustration */}
      <div className="my-0.5 flex items-center justify-center text-2xl sm:text-3xl filter drop-shadow">
        {card.illustration}
      </div>

      {/* Description */}
      <div className="text-[8px] text-slate-300 text-center leading-tight line-clamp-2 px-0.5">
        {card.description}
      </div>

      {/* Creature Stats */}
      {isCreature && (
        <div className="flex items-center justify-between border-t border-slate-700/60 pt-0.5 mt-0.5 text-[8px] sm:text-[9px] font-black">
          <div className="flex items-center gap-0.5 text-amber-400">
            <Zap className="w-2.5 h-2.5" />
            <span>{card.atk}</span>
          </div>
          {card.range && card.range > 1 && (
            <div className="flex items-center gap-0.5 text-cyan-400">
              <Target className="w-2.5 h-2.5" />
              <span>{card.range}</span>
            </div>
          )}
          <div className="flex items-center gap-0.5 text-emerald-400">
            <Footprints className="w-2.5 h-2.5" />
            <span>{card.pm}</span>
          </div>
          <div className="flex items-center gap-0.5 text-red-400">
            <Heart className="w-2.5 h-2.5" />
            <span>{card.hp}</span>
          </div>
        </div>
      )}
    </div>
  );
};
