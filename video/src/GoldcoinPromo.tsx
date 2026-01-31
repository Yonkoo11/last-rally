import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
  staticFile,
} from "remotion";
import { IntroScene } from "./scenes/IntroScene";
import { LogoReveal } from "./scenes/LogoReveal";
import { GameplayScene } from "./scenes/GameplayScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { OutroScene } from "./scenes/OutroScene";
import { COLORS } from "./colors";

// ============================================
// WORLD-CLASS PROMO VIDEO
// Professional audio, transitions, and effects
// ============================================

// Background Music - FULL VOLUME
const BackgroundMusic: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();

  const fadeInEnd = fps * 1.5;
  const fadeOutStart = durationInFrames - fps * 2;

  return (
    <Audio
      src={staticFile("bgm.mp3")}
      volume={(frame) => {
        // Quick fade in
        if (frame < fadeInEnd) {
          return interpolate(frame, [0, fadeInEnd], [0, 1]);
        }
        // Fade out at end
        if (frame > fadeOutStart) {
          return interpolate(frame, [fadeOutStart, durationInFrames], [1, 0]);
        }
        // Full volume
        return 1;
      }}
    />
  );
};

// Cinematic scan lines overlay
const ScanLines: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `repeating-linear-gradient(
          0deg,
          rgba(0, 0, 0, 0.03) 0px,
          rgba(0, 0, 0, 0.03) 1px,
          transparent 1px,
          transparent 3px
        )`,
        pointerEvents: "none",
        zIndex: 100,
      }}
    />
  );
};

// Film grain effect
const FilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = frame % 10;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' seed='${seed}' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: "150px 150px",
        pointerEvents: "none",
        zIndex: 101,
      }}
    />
  );
};

// Cinematic letterbox bars
const LetterBox: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Bars slide in during first second
  const barHeight = interpolate(
    frame,
    [0, fps * 0.8],
    [0, 60],
    { extrapolateRight: "clamp" }
  );

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: barHeight,
          background: "#000",
          zIndex: 99,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: barHeight,
          background: "#000",
          zIndex: 99,
        }}
      />
    </>
  );
};

// Cross-fade transition overlay
const SceneTransition: React.FC<{ at: number; duration?: number }> = ({
  at,
  duration = 15
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [at - duration/2, at, at + duration/2],
    [0, 0.6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: COLORS.background,
        opacity,
        zIndex: 50,
        pointerEvents: "none",
      }}
    />
  );
};

// Golden flash effect at key moments
const GoldenFlash: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [at, at + 3, at + 15],
    [0, 0.4, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(circle at center, ${COLORS.gold}40 0%, transparent 70%)`,
        opacity,
        zIndex: 51,
        pointerEvents: "none",
      }}
    />
  );
};

// Vignette overlay
const Vignette: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
        pointerEvents: "none",
        zIndex: 98,
      }}
    />
  );
};

export const GoldcoinPromo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* === AUDIO === */}
      <BackgroundMusic />

      {/* === SCENES === */}

      {/* Scene 1: Intro - Dark mine, light flickers (0-3s) */}
      <Sequence from={0} durationInFrames={fps * 3}>
        <IntroScene />
      </Sequence>

      {/* Scene 2: Logo Reveal - Gold coin spins in (3-7s) */}
      <Sequence from={fps * 3} durationInFrames={fps * 4}>
        <LogoReveal />
      </Sequence>

      {/* Scene 3: Gameplay showcase (7-18s) */}
      <Sequence from={fps * 7} durationInFrames={fps * 11}>
        <GameplayScene />
      </Sequence>

      {/* Scene 4: Features highlight (18-25s) */}
      <Sequence from={fps * 18} durationInFrames={fps * 7}>
        <FeaturesScene />
      </Sequence>

      {/* Scene 5: Outro with CTA (25-30s) */}
      <Sequence from={fps * 25} durationInFrames={fps * 5}>
        <OutroScene />
      </Sequence>

      {/* === TRANSITIONS === */}
      <SceneTransition at={fps * 3} />
      <SceneTransition at={fps * 7} />
      <SceneTransition at={fps * 18} />
      <SceneTransition at={fps * 25} />

      {/* === GOLDEN FLASHES at key moments === */}
      <GoldenFlash at={fps * 3.5} />
      <GoldenFlash at={fps * 25.5} />

      {/* === CINEMATIC OVERLAYS === */}
      <Vignette />
      <ScanLines />
      <FilmGrain />
      <LetterBox />
    </AbsoluteFill>
  );
};
