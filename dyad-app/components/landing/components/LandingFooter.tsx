'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronUp, BookOpen, RotateCcw } from 'lucide-react';

type Player = 'P' | 'S' | null; // P = Player (Station ●), S = Swarm AI (Cross ✕)

const WINNING_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function LandingFooter() {
  // 3x3 Transit Alignment Game State
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isSwarmTurn, setIsSwarmTurn] = useState<boolean>(false);
  const [winner, setWinner] = useState<'P' | 'S' | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  // Check game outcome
  const checkWinner = (currentBoard: Player[]) => {
    for (const combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], combo };
      }
    }
    if (currentBoard.every((cell) => cell !== null)) {
      return { winner: 'draw', combo: null };
    }
    return null;
  };

  // Swarm AI Move Logic
  useEffect(() => {
    if (!isSwarmTurn || winner) return;

    const timer = setTimeout(() => {
      // 1. Check if Swarm can win
      for (const [a, b, c] of WINNING_COMBOS) {
        if (board[a] === 'S' && board[b] === 'S' && board[c] === null) { makeMove(c, 'S'); return; }
        if (board[a] === 'S' && board[c] === 'S' && board[b] === null) { makeMove(b, 'S'); return; }
        if (board[b] === 'S' && board[c] === 'S' && board[a] === null) { makeMove(a, 'S'); return; }
      }

      // 2. Block player if they are about to win
      for (const [a, b, c] of WINNING_COMBOS) {
        if (board[a] === 'P' && board[b] === 'P' && board[c] === null) { makeMove(c, 'S'); return; }
        if (board[a] === 'P' && board[c] === 'P' && board[b] === null) { makeMove(b, 'S'); return; }
        if (board[b] === 'P' && board[c] === 'P' && board[a] === null) { makeMove(a, 'S'); return; }
      }

      // 3. Take center if free
      if (board[4] === null) {
        makeMove(4, 'S');
        return;
      }

      // 4. Otherwise pick any open corner or random available slot
      const available = board
        .map((val, idx) => (val === null ? idx : null))
        .filter((val): val is number => val !== null);

      if (available.length > 0) {
        const corners = [0, 2, 6, 8].filter((c) => available.includes(c));
        const chosen = corners.length > 0
          ? corners[Math.floor(Math.random() * corners.length)]
          : available[Math.floor(Math.random() * available.length)];
        makeMove(chosen, 'S');
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [isSwarmTurn, board, winner]);

  const makeMove = (index: number, player: 'P' | 'S') => {
    const nextBoard = [...board];
    nextBoard[index] = player;
    setBoard(nextBoard);

    const result = checkWinner(nextBoard);
    if (result) {
      setWinner(result.winner as 'P' | 'S' | 'draw');
      setWinningLine(result.combo);
      setIsSwarmTurn(false);
    } else {
      setIsSwarmTurn(player === 'P');
    }
  };

  const handleCellClick = (index: number) => {
    if (board[index] !== null || isSwarmTurn || winner) return;
    makeMove(index, 'P');
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsSwarmTurn(false);
    setWinner(null);
    setWinningLine(null);
  };

  const scrollToTop = () => {
    const container = document.getElementById('landing-scroll-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative z-20 border-t border-white/[0.06] bg-[#0c0c0e] shadow-[0_-12px_32px_rgba(0,0,0,0.9)] px-6 sm:px-12 lg:px-20 pt-12 sm:pt-14 pb-6 sm:pb-8 select-none">
      {/* Upward ambient shadow shade to visually lift footer above preceding sections */}
      <div className="absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

      {/* TOP SECTION: LEFT INFO + RIGHT 3X3 GAME */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-10 lg:gap-14 relative z-10">
        
        {/* =========================================================================
            LEFT COLUMN: BRANDING, TAGLINE, SOCIAL LINKS
            ========================================================================= */}
        <div className="flex-1 flex flex-col justify-between max-w-lg">
          <div>
            {/* BRAND WORDMARK + PATH */}
            <div className="flex items-baseline gap-2">
              <span className="font-sans text-2xl sm:text-3xl font-black tracking-[-0.06em] text-white">
                DYAD
              </span>
              <span className="size-2 sm:size-2.5 rounded-xs bg-[#0ab1ba] inline-block shadow-[0_0_12px_#0ab1ba]" />
              <span className="font-mono text-zinc-500 text-lg sm:text-xl font-normal ml-0.5">/</span>
            </div>

            {/* PROJECT DESCRIPTION */}
            <p className="text-zinc-400 text-xs sm:text-sm mt-3 leading-relaxed max-w-sm">
              Autonomous multi-agent intelligence for transit corridor simulation &amp; DPR feasibility.
            </p>

            {/* MONOCHROME SOCIAL & PORTAL LINKS */}
            <div className="flex items-center gap-5 mt-5 text-zinc-400">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                {/* LinkedIn SVG */}
                <svg className="size-4.5 sm:size-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                </svg>
              </a>

              <a
                href="#specs"
                className="hover:text-white transition-colors"
                aria-label="Documentation / Insights"
              >
                <BookOpen className="size-4.5 sm:size-5" />
              </a>

              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
                aria-label="X (Twitter)"
              >
                {/* Clean X icon */}
                <svg className="size-4 sm:size-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
                aria-label="GitHub Repository"
              >
                {/* GitHub SVG */}
                <svg className="size-4.5 sm:size-5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: INTERACTIVE 3X3 CORRIDOR ALIGNMENT GAME
            ========================================================================= */}
        <div className="flex flex-col items-start md:items-end w-full md:w-auto">
          <div className="flex flex-col items-start md:items-start">
            {/* PLAYFUL PROMPT */}
            <p className="text-zinc-300 text-xs sm:text-sm font-medium mb-3">
              Test your transit instincts :)
            </p>

            {/* 3X3 TRANSIT SECTOR MATRIX */}
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 select-none my-1">
              
              {/* AUTHENTIC EXTENDED TIC-TAC-TOE CROSSING LINES */}
              <div className="absolute left-1/3 -top-3 -bottom-3 w-[1.5px] bg-zinc-700/70 pointer-events-none" />
              <div className="absolute left-2/3 -top-3 -bottom-3 w-[1.5px] bg-zinc-700/70 pointer-events-none" />
              <div className="absolute top-1/3 -left-3 -right-3 h-[1.5px] bg-zinc-700/70 pointer-events-none" />
              <div className="absolute top-2/3 -left-3 -right-3 h-[1.5px] bg-zinc-700/70 pointer-events-none" />

              {/* INTERACTIVE 3X3 CELLS */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                {board.map((cell, idx) => {
                  const isWinningCell = winningLine?.includes(idx);

                  return (
                    <button
                      key={idx}
                      onClick={() => handleCellClick(idx)}
                      disabled={cell !== null || isSwarmTurn || !!winner}
                      className={`relative flex items-center justify-center transition-colors focus:outline-none ${
                        !cell && !winner && !isSwarmTurn ? 'hover:bg-white/[0.04] cursor-pointer' : ''
                      }`}
                      aria-label={`Transit cell ${idx}`}
                    >
                      {/* PLAYER MOVE: GLOWING TURQUOISE METRO STATION */}
                      {cell === 'P' && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                          className="relative flex items-center justify-center"
                        >
                          <span
                            className={`size-3.5 sm:size-4 rounded-full bg-[#0ab1ba] ${
                              isWinningCell
                                ? 'shadow-[0_0_16px_#0ab1ba] ring-2 ring-white'
                                : 'shadow-[0_0_10px_#0ab1ba]'
                            }`}
                          />
                          <span className="absolute size-6 sm:size-7 rounded-full border border-[#0ab1ba]/40 animate-pulse" />
                        </motion.div>
                      )}

                      {/* SWARM MOVE: CRISP WHITE VIADUCT NODE */}
                      {cell === 'S' && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                          className="flex items-center justify-center"
                        >
                          <span
                            className={`font-mono text-lg sm:text-xl font-light text-zinc-300 leading-none ${
                              isWinningCell ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''
                            }`}
                          >
                            ✕
                          </span>
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* GAME STATUS FEEDBACK & RESET ACTION */}
            <div className="mt-2.5 flex items-center justify-between w-full min-h-[22px]">
              {winner === 'P' && (
                <div className="text-[11px] font-mono text-[#0ab1ba] flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-[#0ab1ba]" />
                  <span>Corridor Approved! (48k PPHPD)</span>
                </div>
              )}
              {winner === 'S' && (
                <div className="text-[11px] font-mono text-zinc-300 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-zinc-400" />
                  <span>Swarm out-optimized route</span>
                </div>
              )}
              {winner === 'draw' && (
                <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-zinc-500" />
                  <span>Geodesic equilibrium reached</span>
                </div>
              )}
              {!winner && isSwarmTurn && (
                <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-zinc-500 animate-ping" />
                  <span>Swarm analyzing path...</span>
                </div>
              )}
              {!winner && !isSwarmTurn && (
                <div className="text-[11px] font-mono text-zinc-500">
                  Click to place station (●)
                </div>
              )}

              {(winner || board.some((c) => c !== null)) && (
                <button
                  onClick={resetGame}
                  className="ml-auto text-[11px] font-mono text-zinc-500 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  title="Reset alignment"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* =========================================================================
          BOTTOM BAR: METRIC COUNTER (LEFT) + CIRCULAR BACK-TO-TOP BUTTON (RIGHT)
          Directly aligned on the same horizontal baseline with zero dead space below
          ========================================================================= */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mt-8 pt-4 border-t border-white/[0.04]">
        {/* SIMULATION COUNTER */}
        <p className="text-xs sm:text-sm text-zinc-400 font-sans tracking-wide">
          Candidate corridors evaluated{' '}
          <span className="font-mono font-black text-white text-sm sm:text-base tracking-tight ml-1">
            558,776
          </span>
        </p>

        {/* CIRCULAR BACK-TO-TOP BUTTON */}
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="size-10 sm:size-11 rounded-full border border-white/20 hover:border-[#0ab1ba] bg-black/60 hover:bg-[#08080a] flex items-center justify-center text-zinc-400 hover:text-white hover:shadow-[0_0_16px_rgba(10,177,186,0.35)] transition-all cursor-pointer group shrink-0"
        >
          <ChevronUp className="size-4.5 sm:size-5 transition-transform group-hover:-translate-y-0.5" />
        </button>
      </div>

    </footer>
  );
}

export default LandingFooter;
