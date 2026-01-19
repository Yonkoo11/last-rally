// ============================================
// LAST RALLY - Touch Controller
// Handles touch input for mobile devices
// ============================================

import { CANVAS_HEIGHT, PADDLE_HEIGHT, PADDLE_MARGIN } from './constants';

interface TouchZone {
  identifier: number;
  side: 'left' | 'right';
  startY: number;
  currentY: number;
}

// Convert touch Y position to paddle Y position
// Touch is relative to canvas, paddle Y is top of paddle
function touchToPaddleY(touchY: number, canvasRect: DOMRect): number {
  // Map touch position to canvas coordinates
  const relativeY = (touchY - canvasRect.top) / canvasRect.height * CANVAS_HEIGHT;

  // Clamp paddle to stay within bounds
  const minY = PADDLE_MARGIN;
  const maxY = CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_MARGIN;

  // Center paddle on touch position
  const paddleY = relativeY - PADDLE_HEIGHT / 2;

  return Math.max(minY, Math.min(maxY, paddleY));
}

export class TouchController {
  private activeTouches: Map<number, TouchZone> = new Map();
  private canvasRect: DOMRect | null = null;
  private leftPaddleY: number | null = null;
  private rightPaddleY: number | null = null;

  // Track touch indicator positions for visual feedback
  public touchIndicators: { x: number; y: number; side: 'left' | 'right' }[] = [];

  setCanvasRect(rect: DOMRect): void {
    this.canvasRect = rect;
  }

  handleTouchStart(e: TouchEvent): void {
    if (!this.canvasRect) return;
    e.preventDefault(); // Prevent scrolling

    const canvasMidX = this.canvasRect.left + this.canvasRect.width / 2;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const side: 'left' | 'right' = touch.clientX < canvasMidX ? 'left' : 'right';

      this.activeTouches.set(touch.identifier, {
        identifier: touch.identifier,
        side,
        startY: touch.clientY,
        currentY: touch.clientY,
      });

      // Update paddle position immediately
      const paddleY = touchToPaddleY(touch.clientY, this.canvasRect);
      if (side === 'left') {
        this.leftPaddleY = paddleY;
      } else {
        this.rightPaddleY = paddleY;
      }
    }

    this.updateIndicators();
  }

  handleTouchMove(e: TouchEvent): void {
    if (!this.canvasRect) return;
    e.preventDefault(); // Prevent scrolling

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const zone = this.activeTouches.get(touch.identifier);

      if (zone) {
        zone.currentY = touch.clientY;

        const paddleY = touchToPaddleY(touch.clientY, this.canvasRect);
        if (zone.side === 'left') {
          this.leftPaddleY = paddleY;
        } else {
          this.rightPaddleY = paddleY;
        }
      }
    }

    this.updateIndicators();
  }

  handleTouchEnd(e: TouchEvent): void {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const zone = this.activeTouches.get(touch.identifier);

      if (zone) {
        // Clear the paddle position for this side if no other touch on same side
        this.activeTouches.delete(touch.identifier);

        // Check if there's another touch on the same side
        let hasOtherTouch = false;
        this.activeTouches.forEach((z) => {
          if (z.side === zone.side) hasOtherTouch = true;
        });

        if (!hasOtherTouch) {
          if (zone.side === 'left') {
            this.leftPaddleY = null;
          } else {
            this.rightPaddleY = null;
          }
        }
      }
    }

    this.updateIndicators();
  }

  private updateIndicators(): void {
    if (!this.canvasRect) {
      this.touchIndicators = [];
      return;
    }

    this.touchIndicators = [];
    this.activeTouches.forEach((zone) => {
      // Convert to canvas-relative coordinates for rendering
      const relativeX = zone.side === 'left'
        ? this.canvasRect!.width * 0.1
        : this.canvasRect!.width * 0.9;
      const relativeY = (zone.currentY - this.canvasRect!.top) / this.canvasRect!.height * CANVAS_HEIGHT;

      this.touchIndicators.push({
        x: relativeX,
        y: relativeY,
        side: zone.side,
      });
    });
  }

  // Get paddle Y position for a side, returns null if no touch active
  getPaddleY(side: 'left' | 'right'): number | null {
    return side === 'left' ? this.leftPaddleY : this.rightPaddleY;
  }

  // Check if touch is active on either side
  isActive(): boolean {
    return this.activeTouches.size > 0;
  }

  // Check if touch is active on a specific side
  isSideActive(side: 'left' | 'right'): boolean {
    for (const zone of this.activeTouches.values()) {
      if (zone.side === side) return true;
    }
    return false;
  }

  // Reset all touches (useful when game restarts)
  reset(): void {
    this.activeTouches.clear();
    this.leftPaddleY = null;
    this.rightPaddleY = null;
    this.touchIndicators = [];
  }
}

// Singleton instance for easy access
let touchControllerInstance: TouchController | null = null;

export function getTouchController(): TouchController {
  if (!touchControllerInstance) {
    touchControllerInstance = new TouchController();
  }
  return touchControllerInstance;
}

// Check if device supports touch
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
