import React from "react";
import {
  AbsoluteFill,
  Video,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  staticFile,
} from "remotion";
import { COLORS } from "../colors";

// ============================================
// GOLDCOIN PONG - REAL GAMEPLAY FOOTAGE
// Using actual screen recording for authenticity
// ============================================

export const GameplayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in
  const opacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Subtle zoom effect
  const scale = interpolate(
    frame,
    [0, fps * 0.5, fps * 10, fps * 11],
    [1.05, 1, 1, 1.02],
    { extrapolateRight: "clamp" }
  );

  // Title animation
  const titleY = interpolate(
    frame,
    [0, fps * 0.5],
    [-50, 0],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.2)) }
  );

  const titleOpacity = interpolate(
    frame,
    [0, fps * 0.5],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, opacity }}>
      {/* Video container with subtle vignette */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${scale})`,
        }}
      >
        {/* Real gameplay footage */}
        <Video
          src={staticFile("gameplay.mov")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Title overlay */}
      <div
        style={{
          position: "absolute",
          top: 30,
          left: "50%",
          transform: `translateX(-50%) translateY(${titleY}px)`,
          opacity: titleOpacity,
        }}
      >
        <span
          style={{
            fontSize: 56,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            color: COLORS.gold,
            letterSpacing: "0.15em",
            textShadow: `0 0 30px ${COLORS.gold}80, 0 4px 8px rgba(0,0,0,0.8)`,
          }}
        >
          GOLDCOIN PONG
        </span>
      </div>

      {/* Vignette overlay */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
