import React, { useRef, useEffect, useState } from "react";

export default function GameCanvas() {
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);

  // Grid settings
  const COLS = 10;
  const ROWS = 20;
  const BLOCK_SIZE = 30;

  // Initialize grid
  const [grid, setGrid] = useState(
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  );

  const [current, setCurrent] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [dropInterval] = useState(500);

  // 🎨 Draw the entire game
  const draw = (ctx) => {
    ctx.clearRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);

    // Draw grid cells
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.fillStyle = grid[r][c] ? grid[r][c] : "#0f172a"; // dark blue bg
        ctx.fillRect(
          c * BLOCK_SIZE,
          r * BLOCK_SIZE,
          BLOCK_SIZE - 1,
          BLOCK_SIZE - 1
        );
      }
    }

    // Draw current shape
    if (current) {
      ctx.fillStyle = current.color;
      current.shape.forEach(([x, y]) => {
        ctx.fillRect(
          (current.x + x) * BLOCK_SIZE,
          (current.y + y) * BLOCK_SIZE,
          BLOCK_SIZE - 1,
          BLOCK_SIZE - 1
        );
      });
    }
  };

  // 🎲 Generate random shape
  const randomShape = () => {
    const shapes = [
      [[0, 0], [1, 0], [0, 1], [1, 1]], // O
      [[0, 0], [0, 1], [0, 2], [0, 3]], // I
      [[0, 0], [1, 0], [2, 0], [1, 1]], // T
      [[0, 0], [1, 0], [1, 1], [2, 1]], // S
      [[0, 1], [1, 1], [1, 0], [2, 0]], // Z
      [[0, 0], [0, 1], [1, 1], [2, 1]], // L
      [[2, 0], [0, 1], [1, 1], [2, 1]], // J
    ];

    const colors = ["cyan", "red", "yellow", "green", "blue", "purple", "orange"];
    const index = Math.floor(Math.random() * shapes.length);
    return { shape: shapes[index], color: colors[index] };
  };

  // 🧱 Check collision
  const hasCollision = (shape, offsetX, offsetY) => {
    return shape.some(([x, y]) => {
      const newX = x + offsetX;
      const newY = y + offsetY;
      return (
        newX < 0 ||
        newX >= COLS ||
        newY >= ROWS ||
        (newY >= 0 && grid[newY][newX])
      );
    });
  };

  // ⬇️ Drop logic
  useEffect(() => {
    if (!context || gameOver) return;
    const interval = setInterval(() => {
      setCurrent((prev) => {
        if (!prev) return prev;
        const nextY = prev.y + 1;
        if (hasCollision(prev.shape, prev.x, nextY)) {
          // Merge shape into grid
          const newGrid = grid.map((row) => [...row]);
          prev.shape.forEach(([x, y]) => {
            if (prev.y + y >= 0) newGrid[prev.y + y][prev.x + x] = prev.color;
          });

          clearLines(newGrid);
          setGrid(newGrid);

          // Create new shape
          const next = { ...randomShape(), x: 3, y: 0 };
          const collisionAtSpawn = hasCollision(next.shape, next.x, next.y + 1);

          if (collisionAtSpawn) {
            setGameOver(true);
          } else {
            setCurrent(next);
          }
          return null;
        }
        return { ...prev, y: nextY };
      });
    }, dropInterval);

    return () => clearInterval(interval);
  }, [context, grid, gameOver]);

  // 🔥 Clear full lines
  const clearLines = (grid) => {
    let cleared = 0;
    for (let r = grid.length - 1; r >= 0; r--) {
      if (grid[r].every((cell) => cell)) {
        grid.splice(r, 1);
        grid.unshift(Array(COLS).fill(null));
        cleared++;
      }
    }
    if (cleared > 0) setScore((prev) => prev + cleared * 100);
  };

  // 🎮 Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      if (!current || gameOver) return;

      if (e.key === "ArrowLeft" && !hasCollision(current.shape, current.x - 1, current.y))
        setCurrent({ ...current, x: current.x - 1 });
      else if (e.key === "ArrowRight" && !hasCollision(current.shape, current.x + 1, current.y))
        setCurrent({ ...current, x: current.x + 1 });
      else if (e.key === "ArrowDown")
        setCurrent({ ...current, y: current.y + 1 });
      else if (e.key === "ArrowUp") {
        const rotated = current.shape.map(([x, y]) => [y, -x]);
        if (!hasCollision(rotated, current.x, current.y))
          setCurrent({ ...current, shape: rotated });
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [current, gameOver]);

  // 🧠 Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    setContext(ctx);

    // Start first block
    const first = { ...randomShape(), x: 3, y: 0 };
    setCurrent(first);
  }, []);

  // 🖼️ Redraw
  useEffect(() => {
    if (context) draw(context);
  }, [context, current, grid]);

  // 🔁 Restart Game
  const restartGame = () => {
    setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
    setScore(0);
    setGameOver(false);
    const newBlock = { ...randomShape(), x: 3, y: 0 };
    setCurrent(newBlock);
  };

  return (
    <div className="flex flex-col items-center text-white space-y-3">
      <h2 className="text-lg font-bold">Score: {score}</h2>
      {gameOver && (
        <div className="text-red-400 font-semibold">
          Game Over 😢
          <button
            className="ml-4 bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
            onClick={restartGame}
          >
            Restart
          </button>
        </div>
      )}
      <div className="border-4 border-cyan-400 rounded-lg shadow-lg">
        <canvas
          ref={canvasRef}
          width={COLS * BLOCK_SIZE}
          height={ROWS * BLOCK_SIZE}
        />
      </div>
    </div>
  );
}
