import React from 'react';

const PromoCard = ({ tag, title, subtitle, icon, variant = 'big', buttonText = 'Shop Now', image, imageClass, onButtonClick }) => {
  const getGradient = () => {
    switch (variant) {
      case 'small':
        return "bg-[linear-gradient(135deg,#1A0A2E,#2D1B69)]"; // purple tile
      case 'small2':
        return "bg-[linear-gradient(135deg,#2D1810,#4A2C00)]"; // warm brown/gold tile
      default:
        return "bg-[linear-gradient(120deg,#0D2137,#0D2137,#1a3a5c)]"; // navy/teal tile
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'small':
        return 'border-[rgba(139,92,246,0.2)]';
      case 'small2':
        return 'border-[rgba(251,191,36,0.2)]';
      default:
        return 'border-[rgba(0,201,167,0.2)]';
    }
  };

  const getButtonBg = () => {
    switch (variant) {
      case 'small':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'small2':
        return 'bg-amber-500 text-navy hover:bg-amber-400 font-bold';
      default:
        return 'bg-teal text-navy hover:bg-teal2 font-bold';
    }
  };

  return (
    <div
      className={`rounded-sm overflow-hidden relative p-6 sm:p-8 flex flex-col justify-end min-h-48 border ${getGradient()} ${getBorderColor()}`}
    >
      {/* BACKGROUND ICON (Only if no image) */}
      {!image && (
        <span className="absolute -top-4 -right-2 text-9xl opacity-10 select-none pointer-events-none">{icon}</span>
      )}

      {/* BACKGROUND IMAGE */}
      {image && (
        <img 
          src={image} 
          alt={title}
          className={`absolute right-0 bottom-0 pointer-events-none select-none z-0 ${imageClass || 'h-[90%] w-auto max-w-[50%] object-contain object-bottom-right'}`}
        />
      )}

      {/* CONTENT */}
      <div className="relative z-10 max-w-[65%]">
        <p className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${variant === 'small2' ? 'text-amber-400' : 'text-teal'}`}>{tag}</p>
        <h3 className="font-['Syne'] text-xl sm:text-2xl font-bold text-white mb-1.5 leading-tight">{title}</h3>
        <p className="text-sm text-gray mb-4 font-medium">{subtitle}</p>
        <button
          onClick={onButtonClick}
          className={`text-xs px-5 py-2.5 rounded transition-transform active:scale-95 shadow-lg ${getButtonBg()}`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default PromoCard;
