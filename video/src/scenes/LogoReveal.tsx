import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { COLORS } from "../colors";

// Animated gold coin SVG
const GoldCoin: React.FC<{ scale: number; rotation: number; glow: number }> = ({
  scale,
  rotation,
  glow,
}) => {
  return (
    <div
      style={{
        transform: `scale(${scale}) rotateY(${rotation}deg)`,
        filter: `drop-shadow(0 0 ${glow * 60}px ${COLORS.gold})`,
      }}
    >
      <svg width="300" height="300" viewBox="0 0 80 80" fill="none">
        <defs>
          <linearGradient
            id="coinOuter"
            x1="5"
            y1="5"
            x2="75"
            y2="75"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="30%" stopColor="#FFC107" />
            <stop offset="70%" stopColor="#DAA520" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
          <linearGradient
            id="coinMiddle"
            x1="10"
            y1="10"
            x2="70"
            y2="70"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFE44D" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#DAA520" />
          </linearGradient>
          <linearGradient
            id="coinInner"
            x1="18"
            y1="18"
            x2="62"
            y2="62"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFF8DC" />
            <stop offset="30%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#CD9B1D" />
          </linearGradient>
        </defs>
        <circle
          cx="40"
          cy="40"
          r="38"
          fill="url(#coinOuter)"
          stroke="#8B6914"
          strokeWidth="2"
        />
        <circle
          cx="40"
          cy="40"
          r="34"
          fill="none"
          stroke="#CD9B1D"
          strokeWidth="1"
          opacity="0.6"
        />
        <circle cx="40" cy="40" r="30" fill="url(#coinMiddle)" />
        <circle
          cx="40"
          cy="40"
          r="26"
          fill="none"
          stroke="#DAA520"
          strokeWidth="1"
          opacity="0.5"
        />
        <circle cx="40" cy="40" r="22" fill="url(#coinInner)" />
        {/* Text removed to prevent twitching during 3D rotation */}
        <ellipse
          cx="28"
          cy="26"
          rx="10"
          ry="6"
          fill="rgba(255,255,255,0.35)"
        />
        <circle cx="40" cy="8" r="2" fill="#DAA520" opacity="0.7" />
        <circle cx="72" cy="40" r="2" fill="#DAA520" opacity="0.7" />
        <circle cx="40" cy="72" r="2" fill="#DAA520" opacity="0.7" />
        <circle cx="8" cy="40" r="2" fill="#DAA520" opacity="0.7" />
      </svg>
    </div>
  );
};

export const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Coin spin in from the side
  const coinScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const coinRotation = interpolate(
    frame,
    [0, fps * 1.5],
    [720, 0],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const coinY = interpolate(
    frame,
    [0, fps * 1],
    [-200, 0],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
  );

  const glowIntensity = interpolate(
    frame,
    [fps * 1, fps * 1.5, fps * 2, fps * 2.5],
    [0, 1, 0.6, 1],
    { extrapolateRight: "clamp" }
  );

  // Title text animation
  const titleOpacity = interpolate(
    frame,
    [fps * 1.5, fps * 2],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  const titleY = interpolate(
    frame,
    [fps * 1.5, fps * 2.2],
    [50, 0],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Subtitle
  const subtitleOpacity = interpolate(
    frame,
    [fps * 2.2, fps * 2.7],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  const subtitleScale = spring({
    frame: frame - fps * 2.2,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // "PONG" text
  const pongOpacity = interpolate(
    frame,
    [fps * 2.8, fps * 3.3],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  const pongX = interpolate(
    frame,
    [fps * 2.8, fps * 3.5],
    [100, 0],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Radial glow behind coin */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,215,0,${glowIntensity * 0.3}) 0%, transparent 70%)`,
          transform: `translate(-50%, -50%)`,
          left: "50%",
          top: "40%",
        }}
      />

      {/* Coin */}
      <div
        style={{
          transform: `translateY(${coinY}px)`,
          marginBottom: 40,
        }}
      >
        <GoldCoin
          scale={coinScale}
          rotation={coinRotation}
          glow={glowIntensity}
        />
      </div>

      {/* Title: GOLD */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <span
          style={{
            fontSize: 140,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            color: COLORS.gold,
            letterSpacing: "0.15em",
            textShadow: `0 0 40px ${COLORS.gold}`,
          }}
        >
          GOLD
        </span>
        <span
          style={{
            fontSize: 140,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            color: COLORS.gold,
            letterSpacing: "0.15em",
            textShadow: `0 0 40px ${COLORS.gold}`,
            opacity: pongOpacity,
            marginLeft: 20,
            display: "inline-block",
            transform: `translateX(${pongX}px)`,
          }}
        >
          COIN
        </span>
      </div>

      {/* Subtitle: ARCADE */}
      <div
        style={{
          opacity: subtitleOpacity,
          transform: `scale(${Math.max(0, subtitleScale)})`,
          marginTop: 10,
        }}
      >
        <span
          style={{
            fontSize: 36,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            color: COLORS.gold,
            letterSpacing: "0.5em",
            opacity: 0.8,
          }}
        >
          ARCADE
        </span>
      </div>

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
