'use client';

/**
 * SSR-safe wrapper for the 3D robot scene.
 *
 * CRITICAL: This file MUST NOT import three, @react-three/fiber,
 * or @react-three/drei at the top level. The dynamic import with
 * ssr: false creates the browser-only boundary.
 */

import dynamic from 'next/dynamic';
import {RobotLoadingIndicator} from './RobotLoadingIndicator';

const RobotScene = dynamic(() => import('./RobotScene'), {
  ssr: false,
  loading: () => <RobotLoadingIndicator />,
});

export function RobotCanvas() {
  return (
    <div className="relative h-[400px] w-full md:h-[600px]">
      <RobotScene />
    </div>
  );
}
