import React, { useEffect, useState } from 'react';
import { GameHeader } from './components/GameHeader';
import { IntroScreen } from './components/IntroScreen';
import { ResultScreen } from './components/ResultScreen';
import { QuestionSheet } from './components/QuestionSheet';
import { AnswerSheet, GameStatus, QUESTIONS, OptionType } from './types';
import { audioEngine } from './utils/AudioEngine';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [timeRemaining, setTimeRemaining] = useState<number>(15.0);
  const [stressLevel, setStressLevel] = useState<number>(30.0);
  const [isPointerDown, setIsPointerDown] = useState<boolean>(false);

  const targetScore = 70;

  const getInitialSheet = (): AnswerSheet => {
    const sheet: AnswerSheet = {};
    QUESTIONS.forEach((q) => {
      sheet[q.id] = {
        A: q.correctAnswer === 'A' ? 1.0 : 0.0,
        B: q.correctAnswer === 'B' ? 1.0 : 0.0,
        C: q.correctAnswer === 'C' ? 1.0 : 0.0,
        D: q.correctAnswer === 'D' ? 1.0 : 0.0,
      };
    });
    return sheet;
  };

  const [answerSheet, setAnswerSheet] = useState<AnswerSheet>(getInitialSheet);

  const handleRestart = () => {
    setAnswerSheet(getInitialSheet());
    setTimeRemaining(15.0);
    setStressLevel(30.0);
    setStatus('idle');
  };

  const calculateScore = (sheet: AnswerSheet): number => {
    let score = 0;
    QUESTIONS.forEach((q) => {
      const qState = sheet[q.id];
      if (!qState) return;

      const filledOptions: OptionType[] = [];
      const smudgeOptions: OptionType[] = [];

      (Object.keys(qState) as OptionType[]).forEach((opt) => {
        const val = qState[opt];
        if (val >= 0.5) {
          filledOptions.push(opt);
        } else if (val >= 0.25) {
          smudgeOptions.push(opt);
        }
      });

      if (filledOptions.length === 1 && filledOptions[0] === q.correctAnswer && smudgeOptions.length === 0) {
        score += 5;
      }
    });
    return score;
  };

  const currentScore = calculateScore(answerSheet);
  const panicRatio = stressLevel / 100;

  useEffect(() => {
    if (status !== 'playing') return;

    let timerId: NodeJS.Timeout;

    const tickHeartbeat = () => {
      const ratio = stressLevel / 100;
      const bpm = 64 + ratio * 106;
      audioEngine.playHeartbeat(ratio);
      const interval = (60 * 1000) / bpm;
      timerId = setTimeout(tickHeartbeat, interval);
    };

    tickHeartbeat();
    return () => clearTimeout(timerId);
  }, [status, stressLevel]);

  useEffect(() => {
    if (status !== 'playing') return;

    const intervalId = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 0.02;
        if (next <= 0) {
          clearInterval(intervalId);
          handleTimeOut();
          return 0;
        }
        return next;
      });

      setStressLevel((prev) => {
        const timeRatio = (15 - timeRemaining) / 15;
        const stressDelta = 0.15 + timeRatio * 0.18;
        return Math.min(100, prev + stressDelta);
      });
    }, 20);

    return () => clearInterval(intervalId);
  }, [status, timeRemaining]);

  useEffect(() => {
    const handleGlobalUp = () => setIsPointerDown(false);
    window.addEventListener('pointerup', handleGlobalUp);
    return () => window.removeEventListener('pointerup', handleGlobalUp);
  }, []);

  const handleTimeOut = () => {
    setIsPointerDown(false);
    const finalScore = calculateScore(answerSheet);

    let smudges = 0;
    QUESTIONS.forEach((q) => {
      const state = answerSheet[q.id];
      if (!state) return;
      (Object.values(state) as number[]).forEach((opacity) => {
        if (opacity >= 0.25 && opacity < 0.5) smudges += 1;
      });
    });

    if (finalScore === targetScore && smudges === 0) {
      setStatus('success');
      audioEngine.playSuccess();
    } else {
      setStatus('failure');
      audioEngine.playFailure();
    }
  };

  const handleEarlyHandIn = () => {
    handleTimeOut();
  };

  const handleStartExam = () => {
    audioEngine.init();
    audioEngine.resume();
    setAnswerSheet(getInitialSheet());
    setTimeRemaining(15.0);
    setStressLevel(30.0);
    setStatus('playing');
  };

  const handleBubbleDown = (qId: number, opt: OptionType) => {
    setIsPointerDown(true);
    audioEngine.init();
    audioEngine.resume();

    setAnswerSheet((prev) => {
      const qState = prev[qId];
      if (!qState) return prev;

      const currentVal = qState[opt];

      if (currentVal === 0) {
        audioEngine.playScribble();
        return {
          ...prev,
          [qId]: { ...qState, [opt]: 1.0 },
        };
      }

      if (currentVal >= 0.5) {
        audioEngine.playErase();
        return {
          ...prev,
          [qId]: { ...qState, [opt]: 0.3 },
        };
      }

      audioEngine.playErase();
      return {
        ...prev,
        [qId]: { ...qState, [opt]: 0 },
      };
    });

    setStressLevel((prev) => Math.min(100, prev + 0.5));
  };

  const handleBubbleEnter = (_qId: number, _opt: OptionType) => {};

  const handleBubbleMove = (_qId: number, _opt: OptionType) => {};

  return (
    <div className="app-shell" style={{ '--panic-alpha': panicRatio } as React.CSSProperties}>
      <div className="comic-noise" />
      <div className="comic-rays" />
      <div className="panic-vignette" />

      {status === 'idle' && (
        <div className="scene-wrap">
          <div className="hero-kicker">#反向高考 #15秒生死局 #改卡挑战</div>
          <div className="hero-title-wrap">
            <h1 className="hero-title">别踩试卷儿</h1>
            <p className="hero-subtitle">这次不是考高分，是把分数改到刚刚好。</p>
          </div>
          <IntroScreen onStartGame={handleStartExam} />
        </div>
      )}

      {status === 'playing' && (
        <div className={`scene-wrap game-scene ${timeRemaining <= 7 ? 'animate-tremble' : ''}`}>
          <GameHeader
            timeRemaining={timeRemaining}
            currentScore={currentScore}
            stressLevel={stressLevel}
            targetScore={targetScore}
            bpm={Math.round(64 + panicRatio * 106)}
          />

          <QuestionSheet
            answerSheet={answerSheet}
            onBubbleDown={handleBubbleDown}
            onBubbleEnter={handleBubbleEnter}
            onBubbleMove={handleBubbleMove}
          />

          <div className="control-bar">
            <div className="control-tip">
              <span className="tip-dot" />
              <p>
                <span className="tip-strong">操作：</span>
                点击已涂黑选项两次擦除，点击空白选项重新填黑。目标是把 <b>100 分</b> 改到 <b>70 分</b>。
              </p>
            </div>

            <button onClick={handleEarlyHandIn} className="submit-button">
              <Sparkles className="w-4 h-4" />
              <span>立刻交卷</span>
            </button>
          </div>
        </div>
      )}

      {(status === 'success' || status === 'failure') && (
        <div className="scene-wrap">
          <ResultScreen
            score={currentScore}
            targetScore={targetScore}
            answerSheet={answerSheet}
            timeOut={timeRemaining <= 0}
            onRestart={handleRestart}
          />
        </div>
      )}

      <footer className="app-footer">GAOKAO VIBE GAME · 15 SECOND PAPER HACK</footer>
    </div>
  );
}
