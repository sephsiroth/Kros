import React from 'react';
import { Card } from '../types/game';
import { Shield, Heart, Zap, Footprints, Target } from 'lucide-react';

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
    sm: 'w-24 h-36 text-xs p-1.5',
    md: 'w-32 h-44 text-xs p-2',
    lg: 'w-40 h-56 text-sm p-3',
  }[size];

  return (
    <div
      onClick={!isDisabled ? onClick : undefined}
      className={`relative flex flex-col justify-between rounded-xl border transition-all duration-200 select-none cursor-pointer ${sizeClasses} ${
        isSelected
          ? 'ring-4 ring-amber-400 border-amber-400 scale-105 shadow-xl shadow-amber-500/30'
          : isDisabled
          ? 'opacity-40 grayscale cursor-not-allowed border-slate-700 bg-slate-900/60'
          : 'border-slate-700/80 bg-gradient-to-b from-slate-800 to-slate-900 hover:border-amber-500/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-950/50'
      }`}
    >
      {/* PA Cost Badge */}
      <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-blue-600 border-2 border-blue-400 text-white font-black flex items-center justify-center shadow-md">
        {card.paCost}
      </div>

      {/* Card Header */}
      <div className="pt-2 text-center">
        <div className="font-bold text-slate-100 truncate px-1" title={card.name}>
          {card.name}
        </div>
        <div className="text-[10px] text-amber-400/80 uppercase tracking-widest font-semibold">
          {card.type}
        </div>
      </div>

      {/* Card Illustration */}
      <div className="my-1 flex items-center justify-center text-3xl md:text-4xl">
        {card.illustration}
      </div>

      {/* Description */}
      <div className="text-[10px] text-slate-300 text-center leading-tight line-clamp-2 px-1">
        {card.description}
      </div>

      {/* Creature Stats */}
      {isCreature && (
        <div className="flex items-center justify-between border-t border-slate-700/50 pt-1 mt-1 text-[11px] font-bold">
          <div className="flex items-center gap-0.5 text-amber-400">
            <Zap className="w-3 h-3" />
            <span>{card.atk}</span>
          </div>
          {card.range && card.range > 1 && (
            <div className="flex items-center gap-0.5 text-cyan-400">
              <Target className="w-3 h-3" />
              <span>{card.range}</span>
            </div>
          )}
          <div className="flex items-center gap-0.5 text-emerald-400">
            <Footprints className="w-3 h-3" />
            <span>{card.pm}</span>
          </div>
          <div className="flex items-center gap-0.5 text-red-400">
            <Heart className="w-3 h-3" />
            <span>{card.hp}</span>
          </div>
        </div>
      )}
    </div>
  );
};
