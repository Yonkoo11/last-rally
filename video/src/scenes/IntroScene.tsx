import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { COLORS } from "../colors";

// ============================================
// INTRO SCENE - Dramatic mine atmosphere
// ============================================

// Flickering lantern light
const LanternGlow: React.FC<{ x: number; y: number; delay: number }> = ({ x, y, delay }) => {
  const frame = useCurrentFrame();

  // Realistic flame flicker
  const flicker1 = Math.sin((frame + delay) * 0.3) * 0.15;
  const flicker2 = Math.sin((frame + delay) * 0.7) * 0.1;
  const flicker3 = Math.sin((frame + delay) * 1.1) * 0.05;
  const intensity = 0.6 + flicker1 + flicker2 + flicker3;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: 300,
        height: 300,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,180,50,${intensity * 0.4}) 0%, rgba(255,140,20,${intensity * 0.2}) 30%, transparent 70%)`,
        transform: "translate(-50%, -50%)",
        filter: "blur(20px)",
      }}
    />
  );
};

// Rising gold dust particle
const GoldDust: React.FC<{ x: number; delay: number; speed: number; size: number }> = ({
  x,
  delay,
  speed,
  size,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const cycleLength = fps * 3;
  const cycleFrame = (frame + delay) % cycleLength;

  const y = interpolate(cycleFrame, [0, cycleLength], [110, -10], {});
  const opacity = interpolate(
    cycleFrame,
    [0, cycleLength * 0.2, cycleLength * 0.8, cycleLength],
    [0, 0.8, 0.8, 0],
    {}
  );

  // Slight horizontal drift
  const drift = Math.sin((frame + delay) * 0.05) * 10;

  return (
    <div
      style={{
        position: "absolute",
        left: `calc(${x}% + ${drift}px)`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${COLORS.goldLight} 0%, ${COLORS.gold} 50%, transparent 100%)`,
        opacity,
        boxShadow: `0 0 ${size * 2}px ${COLORS.gold}80`,
      }}
    />
  );
};

// Mine shaft wood beam
const WoodBeam: React.FC<{ x: number; opacity: number }> = ({ x, opacity }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: 0,
        width: 8,
        height: "100%",
        background: `linear-gradient(180deg,
          rgba(60,40,20,${opacity}) 0%,
          rgba(80,50,25,${opacity * 1.2}) 20%,
          rgba(60,40,20,${opacity}) 50%,
          rgba(40,25,15,${opacity * 0.8}) 100%)`,
        transform: "translateX(-50%)",
      }}
    />
  );
};

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade from complete black
  const fadeIn = interpolate(frame, [0, fps * 0.8], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Ambient light builds up
  const ambientGlow = interpolate(
    frame,
    [fps * 0.5, fps * 1.5, fps * 2.5],
    [0, 0.4, 0.6],
    { extrapolateRight: "clamp" }
  );

  // Text animation - dramatic reveal
  const textOpacity = interpolate(
    frame,
    [fps * 1.2, fps * 1.8],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  const textY = interpolate(
    frame,
    [fps * 1.2, fps * 2],
    [30, 0],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const textScale = interpolate(
    frame,
    [fps * 1.2, fps * 2],
    [0.9, 1],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
  );

  // Text glow pulse
  const textGlow = 20 + Math.sin(frame * 0.1) * 10;

  // Generate dust particles
  const dustParticles = Array.from({ length: 40 }).map((_, i) => ({
    x: 5 + (i * 47) % 90,
    delay: i * 12,
    speed: 0.5 + (i % 3) * 0.3,
    size: 2 + (i % 4) * 2,
  }));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        opacity: fadeIn,
      }}
    >
      {/* Deep mine background */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: `linear-gradient(180deg,
            #050302 0%,
            #0A0604 30%,
            #1A1209 60%,
            #0D0906 100%)`,
        }}
      />

      {/* Lantern glows - warm mine lighting */}
      <LanternGlow x={20} y={30} delay={0} />
      <LanternGlow x={80} y={40} delay={30} />
      <LanternGlow x={50} y={70} delay={60} />

      {/* Center ambient glow */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: `radial-gradient(ellipse at 50% 60%, rgba(139,105,20,${ambientGlow * 0.3}) 0%, transparent 50%)`,
        }}
      />

      {/* Mine shaft beams */}
      {[15, 30, 45, 55, 70, 85].map((x, i) => (
        <WoodBeam key={i} x={x} opacity={0.15 + (i % 2) * 0.1} />
      ))}

      {/* Gold ore vein highlights */}
      <svg style={{ position: "absolute", width: "100%", height: "100%", opacity: ambientGlow * 0.5 }}>
        <line x1="10%" y1="40%" x2="25%" y2="45%" stroke={COLORS.gold} strokeWidth="3" strokeLinecap="round" />
        <line x1="75%" y1="55%" x2="90%" y2="50%" stroke={COLORS.gold} strokeWidth="2" strokeLinecap="round" />
        <line x1="5%" y1="70%" x2="15%" y2="75%" stroke={COLORS.goldDark} strokeWidth="2" strokeLinecap="round" />
        <line x1="85%" y1="25%" x2="95%" y2="30%" stroke={COLORS.goldDark} strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* Gold dust particles floating up */}
      {dustParticles.map((p, i) => (
        <GoldDust key={i} {...p} />
      ))}

      {/* Center text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translateY(${textY}px) scale(${textScale})`,
          opacity: textOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            color: COLORS.gold,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            textShadow: `0 0 ${textGlow}px ${COLORS.gold}80, 0 0 ${textGlow * 2}px ${COLORS.gold}40`,
          }}
        >
          Deep in the mines...
        </div>
      </div>

      {/* Heavy vignette for cinematic feel */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.95) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Top and bottom letterbox bars for cinematic ratio */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: "linear-gradient(to bottom, #000000 0%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background: "linear-gradient(to top, #000000 0%, transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
