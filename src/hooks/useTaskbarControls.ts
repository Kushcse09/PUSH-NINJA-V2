import { useEffect, useCallback } from 'react';
import type { GameState } from '@/types/index';

interface Shortcut {
  key: string;
  action: string;
}

interface UseTaskbarControlsReturn {
  shortcuts: Shortcut[];
}

export const useTaskbarControls = (
  gameState: GameState,
  onTogglePause: () => void
): UseTaskbarControlsReturn => {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent): void => {
      if (gameState.screen !== 'game' || !gameState.isGameRunning) return;
      
      // Disable pause in multiplayer games
      if (gameState.isMultiplayer) return;

      if (event.code === 'Space' || event.key.toLowerCase() === 'p') {
        event.preventDefault();
        onTogglePause();
      }
    },
    [gameState.screen, gameState.isGameRunning, gameState.isMultiplayer, onTogglePause]
  );

  const handleVisibilityChange = useCallback((): void => {
    if (typeof document === 'undefined') return;
    
    // Disable auto-pause in multiplayer games
    if (gameState.isMultiplayer) return;
    
    if (
      document.hidden &&
      gameState.screen === 'game' &&
      gameState.isGameRunning &&
      !gameState.isPaused
    ) {
      onTogglePause();
    }
  }, [gameState.screen, gameState.isGameRunning, gameState.isPaused, gameState.isMultiplayer, onTogglePause]);

  const handleWindowBlur = useCallback((): void => {
    // Disable auto-pause in multiplayer games
    if (gameState.isMultiplayer) return;
    
    if (
      gameState.screen === 'game' &&
      gameState.isGameRunning &&
      !gameState.isPaused
    ) {
      onTogglePause();
    }
  }, [gameState.screen, gameState.isGameRunning, gameState.isPaused, gameState.isMultiplayer, onTogglePause]);

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [handleKeyPress, handleVisibilityChange, handleWindowBlur]);

  return {
    shortcuts: [
      { key: 'Space', action: 'Toggle Pause' },
      { key: 'P', action: 'Toggle Pause' },
    ],
  };
};
