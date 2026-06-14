"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ReflexGameStatus } from "@/components/tests/reflex/reflex-score-card";

const BASE_WIDTH = 450;
const BASE_HEIGHT = 350;
const PLAYER_SIZE = 28;

type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type Obstacle = Rect & {
  vx: number;
  vy: number;
};

type ReflexGameProps = {
  status: ReflexGameStatus;
  onStatusChange: (status: ReflexGameStatus) => void;
  onElapsedChange: (elapsed: number) => void;
  onGameOver: (elapsed: number) => void;
  resetToken: number;
};

function rectsOverlap(a: Rect, b: Rect) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function createObstacles(width: number, height: number): Obstacle[] {
  const scaleX = width / BASE_WIDTH;
  const scaleY = height / BASE_HEIGHT;

  return [
    {
      x: width * 0.15,
      y: height * 0.2,
      w: 50 * scaleX,
      h: 18 * scaleY,
      vx: 95 * scaleX,
      vy: 60 * scaleY,
    },
    {
      x: width * 0.55,
      y: height * 0.12,
      w: 28 * scaleX,
      h: 28 * scaleY,
      vx: -75 * scaleX,
      vy: 110 * scaleY,
    },
    {
      x: width * 0.1,
      y: height * 0.62,
      w: 70 * scaleX,
      h: 16 * scaleY,
      vx: 120 * scaleX,
      vy: -55 * scaleY,
    },
    {
      x: width * 0.62,
      y: height * 0.58,
      w: 22 * scaleX,
      h: 42 * scaleY,
      vx: -90 * scaleX,
      vy: 85 * scaleY,
    },
  ];
}

function getInitialPlayer(width: number, height: number): Rect {
  return {
    x: (width - PLAYER_SIZE) / 2,
    y: (height - PLAYER_SIZE) / 2,
    w: PLAYER_SIZE,
    h: PLAYER_SIZE,
  };
}

export function ReflexGame({
  status,
  onStatusChange,
  onElapsedChange,
  onGameOver,
  resetToken,
}: ReflexGameProps) {
  const arenaRef = useRef<HTMLDivElement>(null);
  const playAreaRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const statusRef = useRef(status);

  const [arenaSize, setArenaSize] = useState({ width: BASE_WIDTH, height: BASE_HEIGHT });
  const [player, setPlayer] = useState<Rect>(() =>
    getInitialPlayer(BASE_WIDTH, BASE_HEIGHT)
  );
  const [obstacles, setObstacles] = useState<Obstacle[]>(() =>
    createObstacles(BASE_WIDTH, BASE_HEIGHT)
  );

  const playerRef = useRef(player);
  const obstaclesRef = useRef(obstacles);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);

  const resetGameState = useCallback((width: number, height: number) => {
    const nextPlayer = getInitialPlayer(width, height);
    const nextObstacles = createObstacles(width, height);
    playerRef.current = nextPlayer;
    obstaclesRef.current = nextObstacles;
    elapsedRef.current = 0;
    lastFrameRef.current = null;
    setPlayer(nextPlayer);
    setObstacles(nextObstacles);
    onElapsedChange(0);
  }, [onElapsedChange]);

  useEffect(() => {
    const element = playAreaRef.current;
    if (!element) return;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      setArenaSize({ width, height });
      if (statusRef.current !== "playing") {
        resetGameState(width, height);
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [resetGameState]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      resetGameState(arenaSize.width, arenaSize.height);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [resetToken, resetGameState, arenaSize.width, arenaSize.height]);

  const endGame = useCallback(() => {
    statusRef.current = "gameover";
    onStatusChange("gameover");
    onGameOver(elapsedRef.current);
  }, [onGameOver, onStatusChange]);

  const updatePointerPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (statusRef.current !== "playing") return;

      const rect = playAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = clientX - rect.left - PLAYER_SIZE / 2;
      const y = clientY - rect.top - PLAYER_SIZE / 2;

      if (
        x < 0 ||
        y < 0 ||
        x + PLAYER_SIZE > rect.width ||
        y + PLAYER_SIZE > rect.height
      ) {
        endGame();
        return;
      }

      const nextPlayer = { x, y, w: PLAYER_SIZE, h: PLAYER_SIZE };
      playerRef.current = nextPlayer;
      setPlayer(nextPlayer);
    },
    [endGame]
  );

  const handlePointerLeave = () => {
    if (statusRef.current === "playing") {
      endGame();
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    updatePointerPosition(event.clientX, event.clientY);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    event.preventDefault();
    updatePointerPosition(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    const step = (timestamp: number) => {
      if (statusRef.current === "playing") {
        if (lastFrameRef.current === null) {
          lastFrameRef.current = timestamp;
        }

        const delta = (timestamp - lastFrameRef.current) / 1000;
        lastFrameRef.current = timestamp;
        elapsedRef.current += delta;
        onElapsedChange(elapsedRef.current);

        const width = arenaSize.width;
        const height = arenaSize.height;
        const nextObstacles = obstaclesRef.current.map((obstacle) => {
          let { x, y, vx, vy } = obstacle;

          x += vx * delta;
          y += vy * delta;

          if (x <= 0) {
            x = 0;
            vx = Math.abs(vx);
          } else if (x + obstacle.w >= width) {
            x = width - obstacle.w;
            vx = -Math.abs(vx);
          }

          if (y <= 0) {
            y = 0;
            vy = Math.abs(vy);
          } else if (y + obstacle.h >= height) {
            y = height - obstacle.h;
            vy = -Math.abs(vy);
          }

          return { ...obstacle, x, y, vx, vy };
        });

        obstaclesRef.current = nextObstacles;
        setObstacles(nextObstacles);

        const currentPlayer = playerRef.current;
        const hitObstacle = nextObstacles.some((obstacle) =>
          rectsOverlap(currentPlayer, obstacle)
        );

        if (hitObstacle) {
          endGame();
        }
      } else {
        lastFrameRef.current = null;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [arenaSize.width, arenaSize.height, endGame, onElapsedChange]);

  useEffect(() => {
    if (status === "playing") {
      lastFrameRef.current = null;
      elapsedRef.current = 0;
      onElapsedChange(0);
    }
  }, [status, onElapsedChange]);

  return (
    <div
      ref={arenaRef}
      className="mx-auto w-full max-w-[490px] rounded-2xl bg-black p-4 shadow-lg shadow-slate-900/30 sm:p-5"
    >
      <div
        ref={playAreaRef}
        className="relative mx-auto w-full touch-none select-none bg-white"
        style={{
          aspectRatio: `${BASE_WIDTH} / ${BASE_HEIGHT}`,
          maxWidth: `${BASE_WIDTH}px`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handlePointerLeave}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchMove}
        onTouchEnd={handlePointerLeave}
        role="application"
        aria-label="Kırmızı kare refleks oyun alanı"
      >
        {obstacles.map((obstacle, index) => (
          <div
            key={index}
            className="absolute bg-blue-500"
            style={{
              left: obstacle.x,
              top: obstacle.y,
              width: obstacle.w,
              height: obstacle.h,
            }}
          />
        ))}

        <div
          className="absolute bg-red-500 shadow-sm"
          style={{
            left: player.x,
            top: player.y,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
          }}
        />
      </div>

      <p className="mt-4 text-center text-sm leading-relaxed text-white/90">
        Ortadaki kırmızı kareyi fare ile kontrol ederek, engellere çarpmadan
        bakalım ne kadar dayanabileceksin!
      </p>
    </div>
  );
}
