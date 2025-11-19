import React, { useState, useEffect, useRef } from "react";

const COLS = 10;
const ROWS = 20;
const CELL = 28;

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [
    [1, 1],
    [1, 1],
  ], // O
  [
    [0, 1, 0],
    [1, 1, 1],
  ], // T
  [
    [0, 1, 1],
    [1, 1, 0],
  ], // S
  [
    [1, 1, 0],
    [0, 1, 1],
  ], // Z
  [
    [1, 0, 0],
    [1, 1, 1],
  ], // J
  [
    [0, 0, 1],
    [1, 1, 1],
  ], // L
];

const COLORS = [
  "#0f172a", // empty
  "#06b6d4",
  "#22c55e",
  "#facc15",
  "#ef4444",
  "#8b5cf6",
  "#3b82f6",
  "#f97316",
];

const getRandomShape = () => {
  const index = Math.floor(Math.random() * SHAPES.length);
  return { shape: SHAPES[index], color: index + 1 };
};

const TetrisBoard = () => {
  const [board, setBoard] = useState(Array(ROWS).fill(Array(COLS).fill(0)));
  const [current, setCurrent] = useState(getRandomShape());
  const [position, setPosition] = useState({ x: 3, y: 0 });
  const [nextPiece, setNextPiece] = useState(getRandomShape());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem("tetrisHighScore")) || 0
  );
  const [speed, setSpeed] = useState(1000);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const intervalRef = useRef();

  // 🟢 Restart Game
  const restartGame = () => {
    setBoard(Array(ROWS).fill(Array(COLS).fill(0)));
    setCurrent(getRandomShape());
    setNextPiece(getRandomShape());
    setPosition({ x: 3, y: 0 });
    setScore(0);
    setSpeed(1000);
    setGameOver(false);
    setPaused(false);
  };

  // ✅ Collision detection
  const isValidMove = (shape, offsetX, offsetY) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = x + offsetX;
          const newY = y + offsetY;
          if (
            newX < 0 ||
            newX >= COLS ||
            newY >= ROWS ||
            (newY >= 0 && board[newY][newX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const merge = (shape, offsetX, offsetY, color) => {
    const newBoard = board.map((r) => r.slice());
    shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val && offsetY + y >= 0) {
          newBoard[offsetY + y][offsetX + x] = color;
        }
      });
    });
    return newBoard;
  };

  const rotate = () => {
    const rotated = current.shape[0].map((_, i) =>
      current.shape.map((row) => row[i]).reverse()
    );
    if (isValidMove(rotated, position.x, position.y)) {
      setCurrent({ ...current, shape: rotated });
    }
  };

  // 🧱 Drop functions
  const drop = () => {
    const newY = position.y + 1;
    if (isValidMove(current.shape, position.x, newY)) {
      setPosition((p) => ({ ...p, y: newY }));
    } else {
      const newBoard = merge(current.shape, position.x, position.y, current.color);
      const cleared = newBoard.filter((r) => r.some((c) => !c));
      const linesCleared = ROWS - cleared.length;
      const newRows = Array(linesCleared)
        .fill(Array(COLS).fill(0))
        .concat(cleared);

      if (position.y <= 0) {
        setGameOver(true);
        clearInterval(intervalRef.current);
        if (score > highScore) {
          localStorage.setItem("tetrisHighScore", score);
          setHighScore(score);
        }
        return;
      }

      setBoard(newRows);
      setScore((s) => s + linesCleared * 100);
      setCurrent(nextPiece);
      setNextPiece(getRandomShape());
      setPosition({ x: 3, y: 0 });

      if (linesCleared > 0) {
        setSpeed((s) => Math.max(100, s - 30));
      }
    }
  };

  // 💥 Hard Drop
  const hardDrop = () => {
    let newY = position.y;
    while (isValidMove(current.shape, position.x, newY + 1)) {
      newY++;
    }
    setPosition((p) => ({ ...p, y: newY }));
    drop();
  };

  // 👻 Ghost Piece Position
  const getGhostY = () => {
    let ghostY = position.y;
    while (isValidMove(current.shape, position.x, ghostY + 1)) {
      ghostY++;
    }
    return ghostY;
  };

  // ⏸ Pause / Resume
  const togglePause = () => {
    setPaused((p) => !p);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      if (e.key === "p" || e.key === "P") return togglePause();
      if (paused) return;
      if (e.key === "ArrowLeft" && isValidMove(current.shape, position.x - 1, position.y))
        setPosition((p) => ({ ...p, x: p.x - 1 }));
      else if (e.key === "ArrowRight" && isValidMove(current.shape, position.x + 1, position.y))
        setPosition((p) => ({ ...p, x: p.x + 1 }));
      else if (e.key === "ArrowDown") drop();
      else if (e.key === "ArrowUp") rotate();
      else if (e.key === " ") hardDrop();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [position, current, paused, gameOver]);

  useEffect(() => {
    if (paused || gameOver) return;
    intervalRef.current = setInterval(drop, speed);
    return () => clearInterval(intervalRef.current);
  }, [speed, position, current, paused, gameOver]);

  // 🪄 Display board + ghost
  const ghostY = getGhostY();
  const displayBoard = board.map((row, y) =>
    row.map((cell, x) => {
      const relY = y - position.y;
      const relX = x - position.x;
      const ghostRelY = y - ghostY;

      // Ghost piece
      if (
        ghostRelY >= 0 &&
        ghostRelY < current.shape.length &&
        relX >= 0 &&
        relX < current.shape[0].length &&
        current.shape[ghostRelY][relX]
      ) {
        return cell || -1; // mark as ghost
      }

      if (
        relY >= 0 &&
        relY < current.shape.length &&
        relX >= 0 &&
        relX < current.shape[0].length &&
        current.shape[relY][relX]
      ) {
        return current.color;
      }
      return cell;
    })
  );

  return (
    <div className="flex justify-center items-start gap-8 p-4 bg-[#0f172a] min-h-screen text-white font-semibold">
      <div>
        {/* MAIN BOARD */}
        <div
          style={{
            width: COLS * CELL + 8,
            height: ROWS * CELL + 8,
            background: "#071328",
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
            border: "4px solid #0891b2",
            boxShadow: "0 0 20px #0891b2",
          }}
        >
          {displayBoard.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                style={{
                  width: CELL,
                  height: CELL,
                  background:
                    cell === -1
                      ? "rgba(255,255,255,0.1)"
                      : COLORS[cell] || COLORS[0],
                  border: "0.5px solid rgba(255,255,255,0.05)",
                }}
              />
            ))
          )}
        </div>

        {/* SCORE & STATUS */}
        <div className="mt-3 text-lg">
          <span className="text-sky-400">Score:</span> {score}
        </div>
        <div className="text-lg text-amber-400">High Score: {highScore}</div>

        {paused && <div className="mt-2 text-yellow-400">⏸ Paused</div>}
        {gameOver && (
          <div className="mt-3 text-red-400 text-xl flex items-center gap-3">
            <span>Game Over 💀</span>
            <button
              onClick={restartGame}
              className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded-md font-semibold shadow-md"
            >
              Restart
            </button>
          </div>
        )}
        {!gameOver && (
          <button
            onClick={togglePause}
            className="mt-3 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-md"
          >
            {paused ? "Resume" : "Pause"}
          </button>
        )}
      </div>

      {/* NEXT PIECE PANEL */}
      <div className="flex flex-col items-center">
        <div className="text-xl mb-2">Next</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, ${CELL}px)`,
            gridTemplateRows: `repeat(${nextPiece.shape.length}, ${CELL}px)`,
            gap: 1,
          }}
        >
          {nextPiece.shape.map((row, i) =>
            row.map((val, j) => (
              <div
                key={`${i}-${j}`}
                style={{
                  width: CELL,
                  height: CELL,
                  background: val ? COLORS[nextPiece.color] : "transparent",
                  border: val ? "0.5px solid rgba(255,255,255,0.05)" : "none",
                }}
              />
            ))
          )}
        </div>
        <div className="mt-3 text-sm text-gray-300">
          Speed: {(1000 / speed).toFixed(2)}x
        </div>
        <div className="text-xs mt-2 text-gray-400 text-center leading-tight">
          Controls:  
          <br />← → ↓ ↑ (rotate)
          <br />Space = Hard Drop  
          <br />P = Pause / Resume
        </div>
      </div>
    </div>
  );
};

export default TetrisBoard;
