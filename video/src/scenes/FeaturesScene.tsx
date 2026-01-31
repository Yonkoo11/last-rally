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
// FEATURES SCENE - Cinematic showcase
// ============================================

interface FeatureItem {
  icon: string;
  title: string;
  value: string;
  color: string;
}

const features: FeatureItem[] = [
  { icon: "🎮", title: "GAME MODES", value: "4", color: COLORS.cyan },
  { icon: "🏆", title: "ACHIEVEMENTS", value: "21", color: COLORS.gold },
  { icon: "🎨", title: "COSMETICS", value: "30+", color: COLORS.magenta },
  { icon: "📜", title: "QUESTS", value: "13", color: "#00FF88" },
];

// Animated counter component
const AnimatedNumber: React.FC<{ value: string; delay: number; color: string }> = ({
  value,
  delay,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(
    frame,
    [delay, delay + fps * 0.8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // For numeric values, animate the count
  const numericValue = parseInt(value.replace("+", ""));
  const displayValue = isNaN(numericValue)
    ? value
    : Math.round(numericValue * progress) + (value.includes("+") ? "+" : "");

  return (
    <span
      style={{
        fontSize: 120,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 800,
        color: color,
        textShadow: `0 0 40px ${color}80, 0 0 80px ${color}40`,
        lineHeight: 1,
      }}
    >
      {displayValue}
    </span>
  );
};

// Feature card with dramatic reveal
const FeatureCard: React.FC<{
  feature: FeatureItem;
  index: number;
  startFrame: number;
}> = ({ feature, index, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = startFrame + index * fps * 0.3;

  // Scale and opacity animation
  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const opacity = interpolate(
    frame,
    [delay, delay + fps * 0.3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Slide direction based on index
  const slideX = interpolate(
    frame,
    [delay, delay + fps * 0.5],
    [index % 2 === 0 ? -100 : 100, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Glow pulse
  const glowPulse = 0.5 + Math.sin((frame - delay) * 0.1) * 0.3;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${Math.max(0, scale)}) translateX(${slideX}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 60px",
        background: `linear-gradient(135deg, rgba(26, 18, 9, 0.9) 0%, rgba(13, 9, 6, 0.95) 100%)`,
        borderRadius: 24,
        border: `2px solid ${feature.color}40`,
        boxShadow: `0 0 ${40 * glowPulse}px ${feature.color}30, inset 0 0 60px rgba(0,0,0,0.5)`,
        minWidth: 280,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${feature.color}20 0%, transparent 70%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Icon */}
      <span style={{ fontSize: 48, marginBottom: 16, position: "relative" }}>
        {feature.icon}
      </span>

      {/* Value */}
      <AnimatedNumber value={feature.value} delay={delay + fps * 0.2} color={feature.color} />

      {/* Title */}
      <span
        style={{
          fontSize: 20,
          fontFamily: "system-ui",
          fontWeight: 600,
          color: "rgba(255,255,255,0.7)",
          letterSpacing: "0.2em",
          marginTop: 12,
          position: "relative",
        }}
      >
        {feature.title}
      </span>
    </div>
  );
};

// Floating gold particle
const GoldParticle: React.FC<{ x: number; y: number; delay: number; size: number }> = ({
  x,
  y,
  delay,
  size,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const floatY = Math.sin((frame + delay) * 0.05) * 20;
  const opacity = interpolate(
    (frame + delay) % (fps * 3),
    [0, fps, fps * 2, fps * 3],
    [0, 0.6, 0.6, 0],
    {}
  );

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${COLORS.gold} 0%, ${COLORS.goldDark} 70%, transparent 100%)`,
        opacity,
        transform: `translateY(${floatY}px)`,
        boxShadow: `0 0 ${size * 2}px ${COLORS.gold}60`,
      }}
    />
  );
};

export const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const titleY = interpolate(
    frame,
    [0, fps * 0.6],
    [-80, 0],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
  );

  // Tagline at end
  const taglineOpacity = interpolate(
    frame,
    [fps * 5.5, fps * 6],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  const taglineScale = spring({
    frame: frame - fps * 5.5,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Generate particles
  const particles = Array.from({ length: 25 }).map((_, i) => ({
    x: 5 + (i * 41) % 90,
    y: 10 + (i * 37) % 80,
    delay: i * 7,
    size: 3 + (i % 4) * 2,
  }));

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
      {/* Animated background gradient */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: `radial-gradient(ellipse at 50% 30%, rgba(255,215,0,0.08) 0%, transparent 50%),
                       radial-gradient(ellipse at 20% 80%, rgba(0,212,255,0.05) 0%, transparent 40%),
                       radial-gradient(ellipse at 80% 70%, rgba(255,51,102,0.05) 0%, transparent 40%)`,
        }}
      />

      {/* Gold particles */}
      {particles.map((p, i) => (
        <GoldParticle key={i} {...p} />
      ))}

      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `scale(${Math.max(0, titleScale)}) translateY(${titleY}px)`,
          marginBottom: 80,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            color: COLORS.gold,
            letterSpacing: "0.05em",
            textShadow: `0 0 40px ${COLORS.gold}60`,
          }}
        >
          PACKED WITH FEATURES
        </span>
      </div>

      {/* Features grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 40,
          maxWidth: 1400,
          padding: "0 60px",
        }}
      >
        {features.map((f, i) => (
          <FeatureCard
            key={i}
            feature={f}
            index={i}
            startFrame={fps * 0.8}
          />
        ))}
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          transform: `scale(${Math.max(0, taglineScale)})`,
          marginTop: 80,
        }}
      >
        <span
          style={{
            fontSize: 42,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
            letterSpacing: "0.4em",
          }}
        >
          DIG. STRIKE. WIN.
        </span>
      </div>

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
