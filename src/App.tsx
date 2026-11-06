/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { QuizModal } from './components/QuizModal';
import { AnswerResultModal } from './components/AnswerResultModal';
import { CreeperWrongAnswerModal } from './components/CreeperWrongAnswerModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { CreditsModal } from './components/CreditsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { DailyRewardModal } from './components/DailyRewardModal';
import { SkinSelectorModal } from './components/SkinSelectorModal';
import { VolumeControl } from './components/VolumeControl';
import { QUESTIONS_DATA } from './data/questions';
import { GameStatus, CharacterSkin } from './types/game';
import { soundManager } from './services/audio';
import { StorageService, SKINS_DATA } from './services/storage';

export default function App() {
  const [gameStatus, setGameStatus] = useState<GameStatus>('menu');
  const [score, setScore] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [lives, setLives] = useState<number>(7); // Starts with 7 lives
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionKey, setSelectedOptionKey] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);

  // Applet state
  const [highScore, setHighScore] = useState<number>(() => StorageService.getHighScore());
  const [totalCoins, setTotalCoins] = useState<number>(() => StorageService.getTotalCoins());
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getMuted());
  const [showMobileControls, setShowMobileControls] = useState<boolean>(true);

  // Modals
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showCredits, setShowCredits] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showDailyReward, setShowDailyReward] = useState<boolean>(false);
  const [showSkinSelector, setShowSkinSelector] = useState<boolean>(false);

  // Skin
  const [currentSkin, setCurrentSkin] = useState<CharacterSkin>(() => {
    const skinId = StorageService.getSelectedSkinId();
    return SKINS_DATA.find((s) => s.id === skinId) || SKINS_DATA[0];
  });

  const engineRef = useRef<GameEngine | null>(null);

  const handleEngineReady = useCallback((engine: GameEngine) => {
    engineRef.current = engine;
  }, []);

  // Callbacks from Game Engine
  const handleScoreUpdate = useCallback((newScore: number, newCoins: number, newDistance: number) => {
    setScore(newScore);
    setCoins(newCoins);
    setDistance(newDistance);
  }, []);

  const handleLivesUpdate = useCallback((newLives: number) => {
    setLives(newLives);
  }, []);

  const handleCheckpointReached = useCallback((checkpointIndex: number) => {
    setCurrentQuestionIndex(checkpointIndex);
    setGameStatus('quiz');
  }, []);

  const handleGameOver = useCallback(() => {
    setGameStatus('game_over');
    soundManager.stopBgm();
  }, []);

  const handleVictory = useCallback(() => {
    setGameStatus('victory');
    soundManager.stopBgm();
  }, []);

  // Controls
  const handleStartGame = () => {
    if (!engineRef.current) return;
    engineRef.current.reset(currentSkin);
    engineRef.current.start();
    setScore(0);
    setCoins(0);
    setDistance(0);
    setLives(7); // Reset to 7 lives
    setCurrentQuestionIndex(0);
    setGameStatus('playing');
  };

  const handleTogglePause = () => {
    if (!engineRef.current) return;
    if (gameStatus === 'playing') {
      engineRef.current.pause();
      setGameStatus('paused');
    } else if (gameStatus === 'paused') {
      engineRef.current.resume();
      setGameStatus('playing');
    }
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleMoveLeft = () => engineRef.current?.moveLeft();
  const handleMoveRight = () => engineRef.current?.moveRight();
  const handleJump = () => engineRef.current?.jump();
  const handleSlide = () => engineRef.current?.slide();

  // Deduct exactly 1 life upon Creeper explosion or collision
  const handleDeductLife = useCallback(() => {
    if (engineRef.current) {
      const remaining = engineRef.current.deductLife();
      setLives(remaining);
      return remaining;
    }
    const remaining = Math.max(0, lives - 1);
    setLives(remaining);
    return remaining;
  }, [lives]);

  // Quiz submission logic
  const handleSelectQuizOption = (optionKey: 'A' | 'B' | 'C' | 'D') => {
    const question = QUESTIONS_DATA[currentQuestionIndex];
    setSelectedOptionKey(optionKey);

    if (optionKey === question.correctAnswer) {
      // CORRECT ANSWER
      setIsAnswerCorrect(true);
      soundManager.playCorrect();
      setGameStatus('quiz_correct');
    } else {
      // WRONG ANSWER: trigger 3D/Voxel Creeper animation sequence!
      setIsAnswerCorrect(false);
      setGameStatus('quiz_creeper_wrong');
    }
  };

  const handleContinueAfterCorrect = () => {
    const nextQIndex = currentQuestionIndex + 1;
    if (nextQIndex >= QUESTIONS_DATA.length) {
      // Completed all 10 questions!
      setGameStatus('victory');
      soundManager.playVictory();
    } else {
      setCurrentQuestionIndex(nextQIndex);
      setGameStatus('playing');
      engineRef.current?.resumeAfterCheckpoint(false);
    }
  };

  const handleTryAgainAfterWrong = () => {
    // Show same question again
    setGameStatus('quiz');
  };

  const handleRestartGame = () => {
    handleStartGame();
  };

  const handleExitToMenu = () => {
    if (engineRef.current) {
      engineRef.current.reset(currentSkin);
    }
    setHighScore(StorageService.getHighScore());
    setTotalCoins(StorageService.getTotalCoins());
    setGameStatus('menu');
  };

  const handleSelectSkin = (skin: CharacterSkin) => {
    setCurrentSkin(skin);
    StorageService.setSelectedSkinId(skin.id);
    if (engineRef.current) {
      engineRef.current.setSkin(skin);
    }
  };

  const handleRewardClaimed = (bonus: number) => {
    setTotalCoins((prev) => prev + bonus);
  };

  // Auto-detect mobile devices for showing touch controls by default
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) || window.innerWidth < 768;
    setShowMobileControls(isMobile);
  }, []);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#121214] font-cairo select-none"
      dir="rtl"
    >
      {/* 3D WebGL Canvas Viewport */}
      <GameCanvas
        skin={currentSkin}
        callbacks={{
          onScoreUpdate: handleScoreUpdate,
          onLivesUpdate: handleLivesUpdate,
          onCheckpointReached: handleCheckpointReached,
          onGameOver: handleGameOver,
          onVictory: handleVictory,
        }}
        onEngineReady={handleEngineReady}
      />

      {/* Persistent Master Volume Control (Always accessible on top-left in RTL / top-right in standard viewport) */}
      <VolumeControl isMuted={isMuted} onToggleMute={handleToggleMute} />

      {/* Main Menu Overlay (when in 'menu' state) */}
      {gameStatus === 'menu' && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenCredits={() => setShowCredits(true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenDailyReward={() => setShowDailyReward(true)}
          onOpenSkinSelector={() => setShowSkinSelector(true)}
          currentSkin={currentSkin}
          highScore={highScore}
          totalCoins={totalCoins}
        />
      )}

      {/* In-Game HUD (when playing or paused) */}
      {(gameStatus === 'playing' || gameStatus === 'paused') && (
        <HUD
          score={score}
          coins={coins}
          lives={lives}
          currentQuestionIndex={currentQuestionIndex}
          isPaused={gameStatus === 'paused'}
          onTogglePause={handleTogglePause}
          onMoveLeft={handleMoveLeft}
          onMoveRight={handleMoveRight}
          onJump={handleJump}
          onSlide={handleSlide}
          showMobileControls={showMobileControls}
          onToggleMobileControls={() => setShowMobileControls((prev) => !prev)}
        />
      )}

      {/* Quiz Modal (Active at checkpoint) */}
      {gameStatus === 'quiz' && (
        <QuizModal
          question={QUESTIONS_DATA[currentQuestionIndex]}
          lives={lives}
          onSelectOption={handleSelectQuizOption}
        />
      )}

      {/* Correct Answer Result Modal */}
      {gameStatus === 'quiz_correct' && (
        <AnswerResultModal
          isCorrect={true}
          question={QUESTIONS_DATA[currentQuestionIndex]}
          selectedOptionKey={selectedOptionKey}
          lives={lives}
          onContinue={handleContinueAfterCorrect}
          onTryAgain={handleTryAgainAfterWrong}
        />
      )}

      {/* Creeper Wrong Answer Animation & Feedback Modal */}
      {gameStatus === 'quiz_creeper_wrong' && (
        <CreeperWrongAnswerModal
          question={QUESTIONS_DATA[currentQuestionIndex]}
          selectedOptionKey={selectedOptionKey}
          lives={lives}
          onTryAgain={handleTryAgainAfterWrong}
          onGameOver={() => setGameStatus('game_over')}
          onDeductLife={handleDeductLife}
        />
      )}

      {/* Game Over Screen */}
      {gameStatus === 'game_over' && (
        <GameOverModal
          score={score}
          coins={coins}
          questionsAnswered={currentQuestionIndex}
          onRestart={handleRestartGame}
          onExitMenu={handleExitToMenu}
        />
      )}

      {/* Victory Screen */}
      {gameStatus === 'victory' && (
        <VictoryModal
          score={score}
          coins={coins}
          lives={lives}
          onRestart={handleRestartGame}
          onExitMenu={handleExitToMenu}
        />
      )}

      {/* Info Modals */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {showCredits && (
        <CreditsModal onClose={() => setShowCredits(false)} />
      )}

      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      {showDailyReward && (
        <DailyRewardModal
          onClose={() => setShowDailyReward(false)}
          onRewardClaimed={handleRewardClaimed}
        />
      )}

      {showSkinSelector && (
        <SkinSelectorModal
          currentSkinId={currentSkin.id}
          onSelectSkin={handleSelectSkin}
          onClose={() => setShowSkinSelector(false)}
        />
      )}
    </div>
  );
}
