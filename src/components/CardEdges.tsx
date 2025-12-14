// Immersive 3D textured card borders that wrap around the entire card

export const CardEdges = {
  // Sharp geometric edges - default/common
  sharp: (glowColor: string) => (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 opacity-60" style={{ borderColor: glowColor }} />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 opacity-60" style={{ borderColor: glowColor }} />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 opacity-60" style={{ borderColor: glowColor }} />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 opacity-60" style={{ borderColor: glowColor }} />
    </div>
  ),

  // Raging fire edges - actual fire texture wrapping the border
  flame: (glowColor: string) => (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {/* Top fire border - thick textured */}
      <div className="absolute top-0 left-0 right-0 h-12 overflow-visible">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, 
              ${glowColor}dd 0%, 
              ${glowColor}aa 30%,
              ${glowColor}66 60%,
              transparent 100%)`,
            filter: 'blur(4px)',
            animation: 'flameFlicker 0.6s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, 
              ${glowColor} 0%, 
              ${glowColor}cc 20%,
              transparent 60%)`,
            filter: 'blur(8px)',
            animation: 'flameFlicker 0.8s ease-in-out infinite reverse',
          }}
        />
        {/* Flame spikes */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0"
            style={{
              left: `${i * 5}%`,
              width: '8%',
              height: '140%',
              background: `linear-gradient(to top, ${glowColor}ee, ${glowColor}88 40%, transparent)`,
              clipPath: 'polygon(30% 100%, 50% 0%, 70% 100%)',
              filter: 'blur(1px)',
              opacity: 0.8,
              animation: `flameFlicker ${0.3 + (i % 3) * 0.1}s ease-in-out infinite`,
              animationDelay: `${i * 0.02}s`,
            }}
          />
        ))}
      </div>

      {/* Bottom fire border */}
      <div className="absolute bottom-0 left-0 right-0 h-12 overflow-visible">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, 
              ${glowColor}dd 0%, 
              ${glowColor}aa 30%,
              ${glowColor}66 60%,
              transparent 100%)`,
            filter: 'blur(4px)',
            animation: 'flameFlicker 0.7s ease-in-out infinite',
          }}
        />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0"
            style={{
              left: `${i * 5}%`,
              width: '8%',
              height: '140%',
              background: `linear-gradient(to bottom, ${glowColor}ee, ${glowColor}88 40%, transparent)`,
              clipPath: 'polygon(30% 0%, 50% 100%, 70% 0%)',
              filter: 'blur(1px)',
              opacity: 0.8,
              animation: `flameFlicker ${0.3 + (i % 3) * 0.1}s ease-in-out infinite`,
              animationDelay: `${i * 0.02 + 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Left fire border */}
      <div className="absolute left-0 top-0 bottom-0 w-12 overflow-visible">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, 
              ${glowColor}dd 0%, 
              ${glowColor}aa 30%,
              transparent 100%)`,
            filter: 'blur(4px)',
            animation: 'flameFlicker 0.65s ease-in-out infinite',
          }}
        />
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute right-0"
            style={{
              top: `${i * 6.66}%`,
              height: '10%',
              width: '140%',
              background: `linear-gradient(to right, ${glowColor}ee, ${glowColor}88 40%, transparent)`,
              clipPath: 'polygon(100% 30%, 0% 50%, 100% 70%)',
              filter: 'blur(1px)',
              opacity: 0.8,
              animation: `flameFlicker ${0.3 + (i % 3) * 0.1}s ease-in-out infinite`,
              animationDelay: `${i * 0.02 + 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* Right fire border */}
      <div className="absolute right-0 top-0 bottom-0 w-12 overflow-visible">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to left, 
              ${glowColor}dd 0%, 
              ${glowColor}aa 30%,
              transparent 100%)`,
            filter: 'blur(4px)',
            animation: 'flameFlicker 0.75s ease-in-out infinite',
          }}
        />
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute left-0"
            style={{
              top: `${i * 6.66}%`,
              height: '10%',
              width: '140%',
              background: `linear-gradient(to left, ${glowColor}ee, ${glowColor}88 40%, transparent)`,
              clipPath: 'polygon(0% 30%, 100% 50%, 0% 70%)',
              filter: 'blur(1px)',
              opacity: 0.8,
              animation: `flameFlicker ${0.3 + (i % 3) * 0.1}s ease-in-out infinite`,
              animationDelay: `${i * 0.02 + 0.45}s`,
            }}
          />
        ))}
      </div>
    </div>
  ),

  // Ice shard edges - frozen texture wrapping the border (like reference image)
  ice: (glowColor: string) => (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {/* Top ice border - thick frozen texture */}
      <div className="absolute top-0 left-0 right-0 h-16 overflow-visible">
        {/* Base ice layer */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom,
              ${glowColor}ee 0%,
              ${glowColor}cc 30%,
              ${glowColor}88 60%,
              transparent 100%)`,
            opacity: 0.9,
          }}
        />
        {/* Crystalline texture overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 4px,
              ${glowColor}44 4px,
              ${glowColor}44 6px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 4px,
              ${glowColor}33 4px,
              ${glowColor}33 6px
            )`,
            filter: 'blur(0.5px)',
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />
        {/* Hanging icicles */}
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${i * 4}%`,
              bottom: '-8px',
              width: '0',
              height: '0',
              borderLeft: `${4 + (i % 3) * 2}px solid transparent`,
              borderRight: `${4 + (i % 3) * 2}px solid transparent`,
              borderTop: `${20 + (i % 5) * 8}px solid ${glowColor}`,
              opacity: 0.85,
              filter: `drop-shadow(0 0 8px ${glowColor}) blur(0.5px)`,
              animation: `shimmer ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
        {/* Frost particles */}
        {[...Array(40)].map((_, i) => (
          <div
            key={`frost-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${i * 2.5}%`,
              top: `${Math.random() * 70}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              background: glowColor,
              boxShadow: `0 0 6px ${glowColor}`,
              opacity: 0.6,
              animation: `float ${2 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>

      {/* Bottom ice border */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-visible">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top,
              ${glowColor}ee 0%,
              ${glowColor}cc 30%,
              ${glowColor}88 60%,
              transparent 100%)`,
            opacity: 0.9,
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 4px,
              ${glowColor}44 4px,
              ${glowColor}44 6px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 4px,
              ${glowColor}33 4px,
              ${glowColor}33 6px
            )`,
            filter: 'blur(0.5px)',
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />
        {/* Upward icicles */}
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${i * 4}%`,
              top: '-8px',
              width: '0',
              height: '0',
              borderLeft: `${4 + (i % 3) * 2}px solid transparent`,
              borderRight: `${4 + (i % 3) * 2}px solid transparent`,
              borderBottom: `${20 + (i % 5) * 8}px solid ${glowColor}`,
              opacity: 0.85,
              filter: `drop-shadow(0 0 8px ${glowColor}) blur(0.5px)`,
              animation: `shimmer ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.08 + 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Left ice border */}
      <div className="absolute left-0 top-0 bottom-0 w-16 overflow-visible">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right,
              ${glowColor}ee 0%,
              ${glowColor}cc 30%,
              ${glowColor}88 60%,
              transparent 100%)`,
            opacity: 0.9,
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(
              135deg,
              transparent,
              transparent 4px,
              ${glowColor}44 4px,
              ${glowColor}44 6px
            )`,
            filter: 'blur(0.5px)',
          }}
        />
        {/* Horizontal icicles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: `${i * 5}%`,
              right: '-8px',
              width: '0',
              height: '0',
              borderTop: `${4 + (i % 3) * 2}px solid transparent`,
              borderBottom: `${4 + (i % 3) * 2}px solid transparent`,
              borderLeft: `${20 + (i % 5) * 8}px solid ${glowColor}`,
              opacity: 0.85,
              filter: `drop-shadow(0 0 8px ${glowColor})`,
              animation: `shimmer ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
      </div>

      {/* Right ice border */}
      <div className="absolute right-0 top-0 bottom-0 w-16 overflow-visible">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to left,
              ${glowColor}ee 0%,
              ${glowColor}cc 30%,
              ${glowColor}88 60%,
              transparent 100%)`,
            opacity: 0.9,
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 4px,
              ${glowColor}44 4px,
              ${glowColor}44 6px
            )`,
            filter: 'blur(0.5px)',
          }}
        />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: `${i * 5}%`,
              left: '-8px',
              width: '0',
              height: '0',
              borderTop: `${4 + (i % 3) * 2}px solid transparent`,
              borderBottom: `${4 + (i % 3) * 2}px solid transparent`,
              borderRight: `${20 + (i % 5) * 8}px solid ${glowColor}`,
              opacity: 0.85,
              filter: `drop-shadow(0 0 8px ${glowColor})`,
              animation: `shimmer ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.08 + 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  ),

  // Shadow/dark energy edges - purple flames engulfing border (like reference image)
  shadow: (glowColor: string) => (
    <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }}>
      {/* Top shadow flames border - thick engulfing effect */}
      <div className="absolute top-0 left-0 right-0 h-20 overflow-visible">
        {/* Base shadow smoke layer */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at bottom,
              ${glowColor}ff 0%,
              ${glowColor}dd 20%,
              ${glowColor}99 40%,
              ${glowColor}55 60%,
              transparent 100%)`,
            filter: 'blur(8px)',
            animation: 'shadowPulse 1.5s ease-in-out infinite',
          }}
        />
        {/* Mid layer for depth */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at bottom,
              ${glowColor}ee 0%,
              ${glowColor}aa 30%,
              transparent 70%)`,
            filter: 'blur(4px)',
            animation: 'shadowPulse 1.2s ease-in-out infinite reverse',
          }}
        />
        {/* Flame tendrils */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0"
            style={{
              left: `${i * 3.33}%`,
              width: '5%',
              height: `${120 + Math.sin(i * 0.5) * 40}%`,
              background: `radial-gradient(ellipse at bottom, 
                ${glowColor}ff 0%, 
                ${glowColor}cc 20%,
                ${glowColor}66 50%, 
                transparent 100%)`,
              filter: `blur(${2 + (i % 3)}px)`,
              opacity: 0.85,
              animation: `shadowPulse ${0.8 + (i % 4) * 0.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.03}s`,
            }}
          />
        ))}
        {/* Shadow particles */}
        {[...Array(50)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute"
            style={{
              left: `${i * 2}%`,
              bottom: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              borderRadius: '50%',
              background: glowColor,
              boxShadow: `0 0 10px ${glowColor}`,
              opacity: 0.7,
              animation: `float ${2 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.04}s`,
            }}
          />
        ))}
      </div>

      {/* Bottom shadow flames border */}
      <div className="absolute bottom-0 left-0 right-0 h-20 overflow-visible">
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at top,
              ${glowColor}ff 0%,
              ${glowColor}dd 20%,
              ${glowColor}99 40%,
              transparent 100%)`,
            filter: 'blur(8px)',
            animation: 'shadowPulse 1.6s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at top,
              ${glowColor}ee 0%,
              ${glowColor}aa 30%,
              transparent 70%)`,
            filter: 'blur(4px)',
            animation: 'shadowPulse 1.3s ease-in-out infinite reverse',
          }}
        />
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0"
            style={{
              left: `${i * 3.33}%`,
              width: '5%',
              height: `${120 + Math.sin(i * 0.5 + 2) * 40}%`,
              background: `radial-gradient(ellipse at top, 
                ${glowColor}ff 0%, 
                ${glowColor}cc 20%,
                ${glowColor}66 50%, 
                transparent 100%)`,
              filter: `blur(${2 + (i % 3)}px)`,
              opacity: 0.85,
              animation: `shadowPulse ${0.8 + (i % 4) * 0.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.03 + 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Left shadow flames border */}
      <div className="absolute left-0 top-0 bottom-0 w-20 overflow-visible">
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at right,
              ${glowColor}ff 0%,
              ${glowColor}dd 20%,
              ${glowColor}99 40%,
              transparent 100%)`,
            filter: 'blur(8px)',
            animation: 'shadowPulse 1.4s ease-in-out infinite',
          }}
        />
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute right-0"
            style={{
              top: `${i * 4}%`,
              height: '6%',
              width: `${120 + Math.sin(i * 0.5 + 1) * 40}%`,
              background: `radial-gradient(ellipse at right, 
                ${glowColor}ff 0%, 
                ${glowColor}cc 20%,
                ${glowColor}66 50%, 
                transparent 100%)`,
              filter: `blur(${2 + (i % 3)}px)`,
              opacity: 0.85,
              animation: `shadowPulse ${0.8 + (i % 4) * 0.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.03 + 0.25}s`,
            }}
          />
        ))}
      </div>

      {/* Right shadow flames border */}
      <div className="absolute right-0 top-0 bottom-0 w-20 overflow-visible">
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at left,
              ${glowColor}ff 0%,
              ${glowColor}dd 20%,
              ${glowColor}99 40%,
              transparent 100%)`,
            filter: 'blur(8px)',
            animation: 'shadowPulse 1.7s ease-in-out infinite',
          }}
        />
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute left-0"
            style={{
              top: `${i * 4}%`,
              height: '6%',
              width: `${120 + Math.sin(i * 0.5 + 3) * 40}%`,
              background: `radial-gradient(ellipse at left, 
                ${glowColor}ff 0%, 
                ${glowColor}cc 20%,
                ${glowColor}66 50%, 
                transparent 100%)`,
              filter: `blur(${2 + (i % 3)}px)`,
              opacity: 0.85,
              animation: `shadowPulse ${0.8 + (i % 4) * 0.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.03 + 0.75}s`,
            }}
          />
        ))}
      </div>
    </div>
  ),

  // Ornate decorative edges - for celestial/divine themes
  ornate: (glowColor: string) => (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {/* Ornate border with divine patterns */}
      {/* Top ornate border */}
      <div className="absolute top-0 left-0 right-0 h-10">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${glowColor}aa, transparent)`,
            opacity: 0.8,
          }}
        />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ornate-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: glowColor, stopOpacity: 0.8 }} />
              <stop offset="50%" style={{ stopColor: glowColor, stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: glowColor, stopOpacity: 0.8 }} />
            </linearGradient>
          </defs>
          <path
            d="M 0,20 Q 50,10 100,20 T 200,20 T 300,20 T 400,20 L 400,40 L 0,40 Z"
            fill="url(#ornate-grad)"
            opacity="0.6"
          />
        </svg>
        {/* Decorative stars */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${i * 12.5}%`,
              top: '5px',
              width: '16px',
              height: '16px',
            }}
          >
            <svg viewBox="0 0 20 20" className="w-full h-full">
              <path
                d="M 10,0 L 12,8 L 20,10 L 12,12 L 10,20 L 8,12 L 0,10 L 8,8 Z"
                fill={glowColor}
                opacity="0.9"
                style={{
                  filter: `drop-shadow(0 0 6px ${glowColor})`,
                }}
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 10 10"
                  to="360 10 10"
                  dur="10s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          </div>
        ))}
      </div>

      {/* Bottom ornate border */}
      <div className="absolute bottom-0 left-0 right-0 h-10">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${glowColor}aa, transparent)`,
            opacity: 0.8,
          }}
        />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 40" preserveAspectRatio="none">
          <path
            d="M 0,20 Q 50,30 100,20 T 200,20 T 300,20 T 400,20 L 400,0 L 0,0 Z"
            fill="url(#ornate-grad)"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Corner ornaments */}
      {[
        { top: '4px', left: '4px', rotate: '0deg' },
        { top: '4px', right: '4px', rotate: '90deg' },
        { bottom: '4px', left: '4px', rotate: '-90deg' },
        { bottom: '4px', right: '4px', rotate: '180deg' },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            ...pos,
            width: '40px',
            height: '40px',
            transform: `rotate(${pos.rotate})`,
          }}
        >
          <svg viewBox="0 0 40 40" className="w-full h-full">
            <path
              d="M 20,0 L 22,10 L 30,8 L 25,15 L 35,20 L 25,25 L 30,32 L 22,30 L 20,40 L 18,30 L 10,32 L 15,25 L 5,20 L 15,15 L 10,8 L 18,10 Z"
              fill={glowColor}
              opacity="0.9"
              style={{
                filter: `drop-shadow(0 0 8px ${glowColor})`,
              }}
            />
          </svg>
        </div>
      ))}
    </div>
  ),

  // Electric/Storm edges - lightning bolts wrapping border
  electric: (glowColor: string) => (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {/* Top electric border */}
      <div className="absolute top-0 left-0 right-0 h-12">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${glowColor}dd, ${glowColor}66 50%, transparent)`,
            filter: 'blur(2px)',
            animation: 'electricSpark 0.3s ease-in-out infinite',
          }}
        />
        {/* Lightning bolts */}
        {[...Array(12)].map((_, i) => (
          <svg
            key={i}
            className="absolute"
            style={{
              left: `${i * 8.33}%`,
              top: 0,
              width: '40px',
              height: '48px',
              opacity: 0.9,
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          >
            <path
              d={`M ${15 + Math.sin(i) * 3},0 L ${18},${12 + i % 3} L ${22},${8 + i % 4} L ${20},${20 + i % 5} L ${25},${18 + i % 3} L ${17},48`}
              stroke={glowColor}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            >
              <animate 
                attributeName="opacity" 
                values="0.7;1;0.7" 
                dur={`${0.15 + (i % 3) * 0.05}s`} 
                repeatCount="indefinite" 
              />
            </path>
          </svg>
        ))}
      </div>

      {/* Bottom electric border */}
      <div className="absolute bottom-0 left-0 right-0 h-12">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${glowColor}dd, ${glowColor}66 50%, transparent)`,
            filter: 'blur(2px)',
            animation: 'electricSpark 0.35s ease-in-out infinite',
          }}
        />
        {[...Array(12)].map((_, i) => (
          <svg
            key={i}
            className="absolute"
            style={{
              left: `${i * 8.33}%`,
              bottom: 0,
              width: '40px',
              height: '48px',
              opacity: 0.9,
              filter: `drop-shadow(0 0 6px ${glowColor})`,
              transform: 'scaleY(-1)',
            }}
          >
            <path
              d={`M ${15 + Math.sin(i + 1) * 3},0 L ${18},${12 + i % 3} L ${22},${8 + i % 4} L ${20},${20 + i % 5} L ${25},${18 + i % 3} L ${17},48`}
              stroke={glowColor}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            >
              <animate 
                attributeName="opacity" 
                values="0.7;1;0.7" 
                dur={`${0.15 + (i % 3) * 0.05}s`} 
                repeatCount="indefinite"
                begin={`${i * 0.02}s`}
              />
            </path>
          </svg>
        ))}
      </div>

      {/* Electric particles */}
      {[...Array(60)].map((_, i) => {
        const side = i % 4;
        const pos = (i / 4) * (100 / 15);
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: '3px',
              height: '3px',
              background: glowColor,
              boxShadow: `0 0 8px ${glowColor}`,
              ...(side === 0 && { top: '8px', left: `${pos}%` }),
              ...(side === 1 && { bottom: '8px', left: `${pos}%` }),
              ...(side === 2 && { left: '8px', top: `${pos}%` }),
              ...(side === 3 && { right: '8px', top: `${pos}%` }),
              animation: `electricSpark ${0.2 + (i % 3) * 0.1}s ease-in-out infinite`,
              animationDelay: `${i * 0.02}s`,
            }}
          />
        );
      })}
    </div>
  ),

  // Nature/Forest edges - organic vines and leaves wrapping border
  nature: (glowColor: string) => (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {/* Top nature border */}
      <div className="absolute top-0 left-0 right-0 h-14">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${glowColor}cc, ${glowColor}88 50%, transparent)`,
            opacity: 0.8,
          }}
        />
        {/* Vine path */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 56" preserveAspectRatio="none">
          <defs>
            <filter id="nature-glow">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>
          <path
            d="M 0,28 Q 50,15 100,28 T 200,28 T 300,28 T 400,28"
            stroke={glowColor}
            strokeWidth="4"
            fill="none"
            opacity="0.9"
            filter="url(#nature-glow)"
          />
        </svg>
        {/* Leaves */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${i * 5}%`,
              top: `${20 + Math.sin(i) * 15}px`,
              width: '20px',
              height: '20px',
            }}
          >
            <svg viewBox="0 0 20 20" className="w-full h-full">
              <ellipse
                cx="10"
                cy="10"
                rx="6"
                ry="10"
                fill={glowColor}
                opacity="0.85"
                style={{
                  filter: `drop-shadow(0 0 4px ${glowColor})`,
                }}
                transform={`rotate(${(i % 3) * 30 - 30} 10 10)`}
              >
                <animate
                  attributeName="opacity"
                  values="0.7;0.95;0.7"
                  dur={`${2 + (i % 3) * 0.5}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.1}s`}
                />
              </ellipse>
            </svg>
          </div>
        ))}
      </div>

      {/* Bottom nature border */}
      <div className="absolute bottom-0 left-0 right-0 h-14">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${glowColor}cc, ${glowColor}88 50%, transparent)`,
            opacity: 0.8,
          }}
        />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 56" preserveAspectRatio="none">
          <path
            d="M 0,28 Q 50,41 100,28 T 200,28 T 300,28 T 400,28"
            stroke={glowColor}
            strokeWidth="4"
            fill="none"
            opacity="0.9"
            filter="url(#nature-glow)"
          />
        </svg>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${i * 5}%`,
              bottom: `${20 + Math.sin(i + 2) * 15}px`,
              width: '20px',
              height: '20px',
            }}
          >
            <svg viewBox="0 0 20 20" className="w-full h-full">
              <ellipse
                cx="10"
                cy="10"
                rx="6"
                ry="10"
                fill={glowColor}
                opacity="0.85"
                style={{
                  filter: `drop-shadow(0 0 4px ${glowColor})`,
                }}
                transform={`rotate(${(i % 3) * 30 - 30} 10 10)`}
              >
                <animate
                  attributeName="opacity"
                  values="0.7;0.95;0.7"
                  dur={`${2 + (i % 3) * 0.5}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.1 + 0.5}s`}
                />
              </ellipse>
            </svg>
          </div>
        ))}
      </div>

      {/* Side nature borders with organic patterns */}
      <div className="absolute left-0 top-0 bottom-0 w-14">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, ${glowColor}cc, ${glowColor}88 50%, transparent)`,
            opacity: 0.8,
          }}
        />
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-14">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to left, ${glowColor}cc, ${glowColor}88 50%, transparent)`,
            opacity: 0.8,
          }}
        />
      </div>
    </div>
  ),

  // Cosmic/Space edges - nebula and stars wrapping border
  cosmic: (glowColor: string) => (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {/* Top cosmic border - nebula effect */}
      <div className="absolute top-0 left-0 right-0 h-16 overflow-visible">
        {/* Nebula layers */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at bottom,
              ${glowColor}ff 0%,
              hsl(280 80% 60%) 30%,
              hsl(200 80% 60%) 60%,
              transparent 100%)`,
            filter: 'blur(10px)',
            opacity: 0.8,
            animation: 'cosmicPulse 4s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 20% 50%,
              hsl(320 80% 60%) 0%,
              transparent 40%),
            radial-gradient(circle at 80% 50%,
              hsl(240 80% 60%) 0%,
              transparent 40%)`,
            filter: 'blur(6px)',
            opacity: 0.6,
            animation: 'cosmicPulse 3s ease-in-out infinite reverse',
          }}
        />
        {/* Stars */}
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${i * 2.5}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
              borderRadius: '50%',
              background: 'white',
              boxShadow: `0 0 ${4 + Math.random() * 8}px ${glowColor}`,
              opacity: 0.9,
              animation: `twinkle ${1 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
        {/* Shooting stars */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`shooting-${i}`}
            className="absolute"
            style={{
              left: `${i * 33}%`,
              top: '10%',
              width: '40px',
              height: '2px',
              background: `linear-gradient(to right, white, ${glowColor}, transparent)`,
              boxShadow: `0 0 8px ${glowColor}`,
              opacity: 0,
              animation: `shootingStar ${2 + i}s linear infinite`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}
      </div>

      {/* Bottom cosmic border */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-visible">
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at top,
              ${glowColor}ff 0%,
              hsl(280 80% 60%) 30%,
              hsl(200 80% 60%) 60%,
              transparent 100%)`,
            filter: 'blur(10px)',
            opacity: 0.8,
            animation: 'cosmicPulse 3.5s ease-in-out infinite',
          }}
        />
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${i * 2.5}%`,
              bottom: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
              borderRadius: '50%',
              background: 'white',
              boxShadow: `0 0 ${4 + Math.random() * 8}px ${glowColor}`,
              opacity: 0.9,
              animation: `twinkle ${1 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.05 + 1}s`,
            }}
          />
        ))}
      </div>

      {/* Left cosmic border */}
      <div className="absolute left-0 top-0 bottom-0 w-16 overflow-visible">
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at right,
              ${glowColor}ff 0%,
              hsl(280 80% 60%) 30%,
              transparent 80%)`,
            filter: 'blur(10px)',
            opacity: 0.8,
            animation: 'cosmicPulse 4.2s ease-in-out infinite',
          }}
        />
      </div>

      {/* Right cosmic border */}
      <div className="absolute right-0 top-0 bottom-0 w-16 overflow-visible">
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at left,
              ${glowColor}ff 0%,
              hsl(280 80% 60%) 30%,
              transparent 80%)`,
            filter: 'blur(10px)',
            opacity: 0.8,
            animation: 'cosmicPulse 3.8s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  ),

  // Demon/Dark edges - dark flames and smoke wrapping border
  demon: (glowColor: string) => (
    <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }}>
      {/* Top demon border - dark fire and smoke */}
      <div className="absolute top-0 left-0 right-0 h-20 overflow-visible">
        {/* Dark smoke base */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at bottom,
              ${glowColor}ff 0%,
              hsl(0 0% 10%) 30%,
              hsl(0 100% 5%) 50%,
              transparent 100%)`,
            filter: 'blur(12px)',
            opacity: 0.95,
            animation: 'demonSmoke 2s ease-in-out infinite',
          }}
        />
        {/* Red glow layer */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at bottom,
              ${glowColor}ee 0%,
              ${glowColor}66 40%,
              transparent 80%)`,
            filter: 'blur(6px)',
            opacity: 0.9,
            animation: 'shadowPulse 1.5s ease-in-out infinite',
          }}
        />
        {/* Dark flame tendrils */}
        {[...Array(35)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0"
            style={{
              left: `${i * 2.85}%`,
              width: '4%',
              height: `${130 + Math.sin(i * 0.4) * 50}%`,
              background: `linear-gradient(to top,
                ${glowColor}ff 0%,
                hsl(0 0% 5%) 40%,
                transparent 100%)`,
              filter: `blur(${3 + (i % 4)}px)`,
              opacity: 0.9,
              animation: `flameFlicker ${0.6 + (i % 5) * 0.15}s ease-in-out infinite`,
              animationDelay: `${i * 0.025}s`,
              mixBlendMode: 'screen',
            }}
          />
        ))}
        {/* Embers */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`ember-${i}`}
            className="absolute"
            style={{
              left: `${i * 3.33}%`,
              bottom: `${Math.random() * 120}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              borderRadius: '50%',
              background: glowColor,
              boxShadow: `0 0 12px ${glowColor}`,
              opacity: 0.8,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.06}s`,
            }}
          />
        ))}
      </div>

      {/* Bottom demon border */}
      <div className="absolute bottom-0 left-0 right-0 h-20 overflow-visible">
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at top,
              ${glowColor}ff 0%,
              hsl(0 0% 10%) 30%,
              hsl(0 100% 5%) 50%,
              transparent 100%)`,
            filter: 'blur(12px)',
            opacity: 0.95,
            animation: 'demonSmoke 2.2s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at top,
              ${glowColor}ee 0%,
              ${glowColor}66 40%,
              transparent 80%)`,
            filter: 'blur(6px)',
            opacity: 0.9,
            animation: 'shadowPulse 1.6s ease-in-out infinite',
          }}
        />
        {[...Array(35)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0"
            style={{
              left: `${i * 2.85}%`,
              width: '4%',
              height: `${130 + Math.sin(i * 0.4 + 3) * 50}%`,
              background: `linear-gradient(to bottom,
                ${glowColor}ff 0%,
                hsl(0 0% 5%) 40%,
                transparent 100%)`,
              filter: `blur(${3 + (i % 4)}px)`,
              opacity: 0.9,
              animation: `flameFlicker ${0.6 + (i % 5) * 0.15}s ease-in-out infinite`,
              animationDelay: `${i * 0.025 + 0.5}s`,
              mixBlendMode: 'screen',
            }}
          />
        ))}
      </div>

      {/* Left demon border */}
      <div className="absolute left-0 top-0 bottom-0 w-20 overflow-visible">
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at right,
              ${glowColor}ff 0%,
              hsl(0 0% 10%) 30%,
              transparent 80%)`,
            filter: 'blur(12px)',
            opacity: 0.95,
            animation: 'demonSmoke 1.8s ease-in-out infinite',
          }}
        />
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute right-0"
            style={{
              top: `${i * 3.33}%`,
              height: '5%',
              width: `${130 + Math.sin(i * 0.4 + 1) * 50}%`,
              background: `linear-gradient(to right,
                ${glowColor}ff 0%,
                hsl(0 0% 5%) 40%,
                transparent 100%)`,
              filter: `blur(${3 + (i % 4)}px)`,
              opacity: 0.9,
              animation: `flameFlicker ${0.6 + (i % 5) * 0.15}s ease-in-out infinite`,
              animationDelay: `${i * 0.025 + 0.25}s`,
              mixBlendMode: 'screen',
            }}
          />
        ))}
      </div>

      {/* Right demon border */}
      <div className="absolute right-0 top-0 bottom-0 w-20 overflow-visible">
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at left,
              ${glowColor}ff 0%,
              hsl(0 0% 10%) 30%,
              transparent 80%)`,
            filter: 'blur(12px)',
            opacity: 0.95,
            animation: 'demonSmoke 2.5s ease-in-out infinite',
          }}
        />
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute left-0"
            style={{
              top: `${i * 3.33}%`,
              height: '5%',
              width: `${130 + Math.sin(i * 0.4 + 2) * 50}%`,
              background: `linear-gradient(to left,
                ${glowColor}ff 0%,
                hsl(0 0% 5%) 40%,
                transparent 100%)`,
              filter: `blur(${3 + (i % 4)}px)`,
              opacity: 0.9,
              animation: `flameFlicker ${0.6 + (i % 5) * 0.15}s ease-in-out infinite`,
              animationDelay: `${i * 0.025 + 0.75}s`,
              mixBlendMode: 'screen',
            }}
          />
        ))}
      </div>
    </div>
  ),
};
