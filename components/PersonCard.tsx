import React from 'react';
import { Shirt, Calendar, Star, BadgeCheck } from 'lucide-react';
import { PersonProfile } from '../types';

interface PersonCardProps {
  person: PersonProfile;
  isHighlighted: boolean;
  onHover: (id: number | null) => void;
  color: string;
}

const PersonCard: React.FC<PersonCardProps> = ({ person, isHighlighted, onHover, color }) => {
  return (
    <div 
      className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden
        ${isHighlighted ? 'ring-2 ring-offset-2 shadow-lg scale-[1.02]' : 'border-slate-200 shadow-sm hover:border-indigo-300'}
      `}
      style={{ 
        borderColor: isHighlighted ? color : undefined,
        '--tw-ring-color': color 
      } as React.CSSProperties}
      onMouseEnter={() => onHover(person.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Celebrity Header Banner if applicable */}
      {person.isCelebrity && (
        <div className="bg-gradient-to-r from-amber-100 to-yellow-100 px-5 py-2 flex items-center gap-2 border-b border-yellow-200">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">有名人を検出</span>
        </div>
      )}

      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-full text-white font-bold shadow-sm shrink-0"
              style={{ backgroundColor: color }}
            >
              {person.id}
            </div>
            <div>
              {person.isCelebrity ? (
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{person.celebrityName}</h3>
                    <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-50" />
                  </div>
                  <span className="text-xs text-slate-500">{person.label}</span>
                </div>
              ) : (
                <h3 className="font-bold text-slate-900">{person.label}</h3>
              )}
              
              {!person.isCelebrity && (
                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {person.gender}
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          {person.description}
        </p>

        <div className="grid grid-cols-1 gap-3 pt-2">
           {/* Age & Gender (if celebrity, gender might be obvious but still good data) */}
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
            <span>
              <span className="font-medium text-slate-700">推定年齢:</span> {person.estimatedAge}
            </span>
          </div>

          {/* Fashion */}
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <Shirt className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
            <span>
              <span className="font-medium text-slate-700">服装:</span> {person.fashion}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonCard;