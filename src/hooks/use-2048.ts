import { useState, useCallback, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useHighScores } from './use-high-scores';

export interface Tile {
  id: string;
  value: number;
  row: number;
  col: number;
}

const GRID_SIZE = 4;
const GAME_ID = '2048';

export const use2048 = () => {
  const { getHighScore, updateHighScore } = useHighScores();
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Initialize high score from persistence
  useEffect(() => {
    setBestScore(getHighScore(GAME_ID));
  }, [getHighScore]);

  // Generate a unique ID for each tile
  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Initial tiles
  const initGame = useCallback(() => {
    const tile1 = { id: generateId(), value: 2, row: Math.floor(Math.random() * 4), col: Math.floor(Math.random() * 4) };
    let tile2;
    do {
      tile2 = { id: generateId(), value: 2, row: Math.floor(Math.random() * 4), col: Math.floor(Math.random() * 4) };
    } while (tile1.row === tile2.row && tile1.col === tile2.col);

    setTiles([tile1, tile2]);
    setScore(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Helper to add a random tile
  const addRandomTile = (currentTiles: Tile[]) => {
    const occupied = new Set(currentTiles.map(t => `${t.row}-${t.col}`));
    const empty = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!occupied.has(`${r}-${c}`)) empty.push({ r, c });
      }
    }

    if (empty.length > 0) {
      const pos = empty[Math.floor(Math.random() * empty.length)];
      return [
        ...currentTiles,
        { id: generateId(), value: Math.random() > 0.9 ? 4 : 2, row: pos.r, col: pos.c }
      ];
    }
    return currentTiles;
  };

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right', startRow: number, startCol: number) => {
    if (gameOver) return;

    setTiles(prevTiles => {
      const tile = prevTiles.find(t => t.row === startRow && t.col === startCol);
      if (!tile) return prevTiles;

      let moved = false;
      let scoreGain = 0;
      let newRow = tile.row;
      let newCol = tile.col;
      let mergedTileId: string | null = null;

      const dr = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
      const dc = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;

      // Find the furthest possible position
      let curR = tile.row + dr;
      let curC = tile.col + dc;

      while (curR >= 0 && curR < GRID_SIZE && curC >= 0 && curC < GRID_SIZE) {
        const neighbor = prevTiles.find(t => t.row === curR && t.col === curC);
        
        if (neighbor) {
          if (neighbor.value === tile.value) {
            // MERGE
            mergedTileId = neighbor.id;
            newRow = curR;
            newCol = curC;
            scoreGain = neighbor.value * 2;
            moved = true;
          }
          break; // Hit something, stop searching
        }

        newRow = curR;
        newCol = curC;
        moved = true;
        curR += dr;
        curC += dc;
      }

      if (moved) {

        let nextTiles: Tile[];
        if (mergedTileId) {
          // Remove the moving tile and update the neighbor
          nextTiles = prevTiles
            .filter(t => t.id !== tile.id)
            .map(t => t.id === mergedTileId ? { ...t, value: t.value * 2 } : t);
        } else {
          // Just update tile position
          nextTiles = prevTiles.map(t => t.id === tile.id ? { ...t, row: newRow, col: newCol } : t);
        }

        const withRandom = addRandomTile(nextTiles);
        setScore(s => {
          const nextScore = s + scoreGain;
          if (nextScore > bestScore) {
            setBestScore(nextScore);
            updateHighScore(GAME_ID, nextScore);
          }
          return nextScore;
        });

        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Check Game Over
        if (withRandom.length === 16) {
           const hasMove = () => {
             for (let r = 0; r < GRID_SIZE; r++) {
               for (let c = 0; c < GRID_SIZE; c++) {
                 const t = withRandom.find(tile => tile.row === r && tile.col === c);
                 if (!t) return true;
                 
                 const neighbors = [
                   withRandom.find(tile => tile.row === r + 1 && tile.col === c),
                   withRandom.find(tile => tile.row === r && tile.col === c + 1),
                 ];
                 
                 if (neighbors.some(n => n && n.value === t.value)) return true;
               }
             }
             return false;
           };
           
           if (!hasMove()) {
             setGameOver(true);
           }
        }

        return withRandom;
      }

      return prevTiles;
    });
  }, [gameOver, score, bestScore]);


  return {
    tiles,
    score,
    bestScore,
    gameOver,
    move,
    restart: initGame,
  };
};
