'use client';

/**
 * Static loading placeholder for the 3D robot model.
 *
 * Used as the `loading` fallback for the dynamic import of RobotScene.
 * Does NOT import drei/three/R3F -- safe outside the SSR boundary.
 */
export function RobotLoadingIndicator() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-surface-base">
      <div className="text-center">
        <div className="animate-pulse font-display text-lg text-accent">
          Loading 3D Model...
        </div>
        <div className="mt-3 h-1 w-48 overflow-hidden rounded bg-surface-overlay">
          <div className="h-full w-1/3 animate-pulse rounded bg-accent" />
        </div>
      </div>
    </div>
  );
}
