import React, { useState, useRef, useEffect } from 'react';
import { PersonProfile } from '../types';
import { Star } from 'lucide-react';

interface AnnotatedImageProps {
  imageUrl: string;
  people: PersonProfile[];
  highlightedId: number | null;
  onHover: (id: number | null) => void;
  getColor: (id: number) => string;
}

const AnnotatedImage: React.FC<AnnotatedImageProps> = ({ 
  imageUrl, 
  people, 
  highlightedId, 
  onHover,
  getColor 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Convert normalized 0-1000 coordinates to percentage styles
  const getBoxStyle = (box: PersonProfile['box2d']) => {
    const top = box.ymin / 10;
    const left = box.xmin / 10;
    const height = (box.ymax - box.ymin) / 10;
    const width = (box.xmax - box.xmin) / 10;

    return {
      top: `${top}%`,
      left: `${left}%`,
      height: `${height}%`,
      width: `${width}%`,
    };
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-slate-900 shadow-lg group select-none">
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-800 min-h-[300px]">
          Loading Image...
        </div>
      )}
      <img
        src={imageUrl}
        alt="Analyzed Target"
        className={`w-full h-auto block transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImageLoaded(true)}
      />
      
      {imageLoaded && people.map((person) => {
        const color = getColor(person.id);
        const isHighlighted = highlightedId === person.id;
        const displayName = person.isCelebrity && person.celebrityName ? person.celebrityName : person.label;
        
        return (
          <div
            key={person.id}
            className={`absolute border-2 transition-all duration-200 cursor-pointer
              ${isHighlighted ? 'z-20 border-[3px] shadow-[0_0_15px_rgba(0,0,0,0.5)]' : 'z-10 opacity-70 hover:opacity-100'}
            `}
            style={{
              ...getBoxStyle(person.box2d),
              borderColor: color,
              backgroundColor: isHighlighted ? `${color}33` : 'transparent', // 20% opacity hex
            }}
            onMouseEnter={() => onHover(person.id)}
            onMouseLeave={() => onHover(null)}
          >
            {/* Label Tag on top of box */}
            <div 
              className={`absolute -top-8 left-0 flex items-center gap-1 px-2 py-1 text-xs font-bold text-white rounded shadow-sm whitespace-nowrap transition-opacity
                ${isHighlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
              `}
              style={{ backgroundColor: color }}
            >
              {person.isCelebrity && <Star className="w-3 h-3 fill-current" />}
              <span>#{person.id} {displayName}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnnotatedImage;