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

// ============================================
// OUTRO SCENE - Clean, impactful ending
// Only: Coin + Title + Arcade + PLAY NOW
// ============================================

// Gold particle burst effect
const ParticleBurst: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const particles = Array.from({ length: 30 }).map((_, i) => {
    const angle = (i / 30) * Math.PI * 2;
    const speed = 2 + (i % 3) * 1.5;
    const delay = i * 2;
    const progress = Math.max(0, (frame - delay) / (fps * 2));
    const distance = progress * speed * 100;
    const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 0], {});
    const size = 4 + (i % 4) * 2;

    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: "50%",
          top: "35%",
          width: size,
          height: size,
          borderRadius: "50%",
          background: i % 2 === 0 ? COLORS.gold : COLORS.goldLight,
          boxShadow: `0 0 ${size * 2}px ${COLORS.gold}`,
          opacity,
          transform: `translate(-50%, -50%) translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`,
        }}
      />
    );
  });

  return <>{particles}</>;
};

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Coin animation - dramatic entrance
  const coinScale = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 50 },
  });

  const coinRotation = interpolate(
    frame,
    [0, fps * 1.5],
    [720, 0],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Pulsing glow
  const glowIntensity = interpolate(
    frame,
    [fps * 1, fps * 1.5, fps * 2.5, fps * 3, fps * 4, fps * 4.5],
    [0.3, 1, 0.7, 1, 0.8, 1],
    { extrapolateRight: "clamp" }
  );

  // Title animation
  const titleOpacity = interpolate(
    frame,
    [fps * 0.8, fps * 1.3],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  const titleY = interpolate(
    frame,
    [fps * 0.8, fps * 1.5],
    [40, 0],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.2)) }
  );

  // Arcade subtitle
  const arcadeOpacity = interpolate(
    frame,
    [fps * 1.3, fps * 1.8],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  const arcadeScale = spring({
    frame: frame - fps * 1.3,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // CTA button
  const ctaOpacity = interpolate(
    frame,
    [fps * 2, fps * 2.5],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  const ctaScale = spring({
    frame: frame - fps * 2,
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  // Button pulse
  const buttonPulse = 1 + Math.sin(frame * 0.15) * 0.03;

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
      {/* Background radial glow */}
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,215,0,${glowIntensity * 0.25}) 0%, rgba(255,215,0,0.05) 40%, transparent 70%)`,
          left: "50%",
          top: "35%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Particle burst */}
      <ParticleBurst />

      {/* Gold coin - large and prominent */}
      <div
        style={{
          transform: `scale(${coinScale}) rotateY(${coinRotation}deg)`,
          marginBottom: 40,
          filter: `drop-shadow(0 0 ${glowIntensity * 80}px ${COLORS.gold})`,
        }}
      >
        <svg width="220" height="220" viewBox="0 0 80 80">
          <defs>
            <linearGradient id="outroCoinGrad" x1="5" y1="5" x2="75" y2="75">
              <stop offset="0%" stopColor="#FFE44D" />
              <stop offset="30%" stopColor="#FFD700" />
              <stop offset="70%" stopColor="#DAA520" />
              <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
            <linearGradient id="outroCoinInner" x1="10" y1="10" x2="70" y2="70">
              <stop offset="0%" stopColor="#FFF8DC" />
              <stop offset="50%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#CD9B1D" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="38" fill="url(#outroCoinGrad)" stroke="#8B6914" strokeWidth="2" />
          <circle cx="40" cy="40" r="34" fill="none" stroke="#CD9B1D" strokeWidth="1" opacity="0.6" />
          <circle cx="40" cy="40" r="30" fill="url(#outroCoinInner)" />
          <circle cx="40" cy="40" r="26" fill="none" stroke="#DAA520" strokeWidth="1" opacity="0.5" />
          <circle cx="40" cy="40" r="22" fill="url(#outroCoinGrad)" />
          {/* Text removed to prevent twitching during 3D rotation */}
          <ellipse cx="28" cy="26" rx="10" ry="6" fill="rgba(255,255,255,0.35)" />
          <circle cx="40" cy="8" r="2" fill="#DAA520" opacity="0.7" />
          <circle cx="72" cy="40" r="2" fill="#DAA520" opacity="0.7" />
          <circle cx="40" cy="72" r="2" fill="#DAA520" opacity="0.7" />
          <circle cx="8" cy="40" r="2" fill="#DAA520" opacity="0.7" />
        </svg>
      </div>

      {/* Title: GOLDCOIN PONG */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 90,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            color: COLORS.gold,
            letterSpacing: "0.08em",
            textShadow: `0 0 50px ${COLORS.gold}80, 0 0 100px ${COLORS.gold}40`,
            lineHeight: 1,
          }}
        >
          GOLDCOIN PONG
        </div>
      </div>

      {/* Subtitle: GOLDCOIN ARCADE */}
      <div
        style={{
          opacity: arcadeOpacity,
          transform: `scale(${Math.max(0, arcadeScale)})`,
          marginTop: 16,
        }}
      >
        <span
          style={{
            fontSize: 32,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            color: COLORS.gold,
            letterSpacing: "0.5em",
            opacity: 0.8,
          }}
        >
          GOLDCOIN ARCADE
        </span>
      </div>

      {/* PLAY NOW Button - clean, prominent */}
      <div
        style={{
          opacity: ctaOpacity,
          transform: `scale(${Math.max(0, ctaScale) * buttonPulse})`,
          marginTop: 50,
        }}
      >
        <div
          style={{
            padding: "24px 80px",
            background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldDark} 100%)`,
            borderRadius: 16,
            fontSize: 36,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            color: "#1A1209",
            letterSpacing: "0.15em",
            boxShadow: `0 0 60px ${COLORS.gold}60, 0 10px 40px rgba(0,0,0,0.4)`,
          }}
        >
          PLAY NOW
        </div>
      </div>

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
