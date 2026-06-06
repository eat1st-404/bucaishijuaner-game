import React, { useEffect, useState } from 'react';
import { Sparkles, Undo2, Eraser, Pencil, ScanSearch, ChevronRight } from 'lucide-react';
import { OptionType, AnswerState } from '../types';
import { audioEngine } from '../utils/AudioEngine';

interface IntroScreenProps {
  onStartGame: () => void;
}

export function IntroScreen({ onStartGame }: IntroScreenProps) {
  const [practiceState, setPracticeState] = useState<AnswerState>({
    A: 1.0,
    B: 0.0,
    C: 0.0,
    D: 0.0,
  });
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [activeTab, setActiveTab] = useState<'story' | 'guide'>('story');

  const handleStartPractice = () => {
    audioEngine.init();
    audioEngine.resume();
  };

  const handleOptionDrag = (option: OptionType) => {
    if (!isPointerDown) return;
    setPracticeState((prev) => {
      const current = prev[option];
      if (current === 0) return prev;
      const next = Math.max(0, current - 0.15);
      if (next > 0) audioEngine.playErase();
      return { ...prev, [option]: next };
    });
  };

  const handlePointerDown = (option: OptionType) => {
    setIsPointerDown(true);
    handleStartPractice();
    if (practiceState[option] < 0.5) {
      setPracticeState((prev) => ({ ...prev, [option]: 1.0 }));
      audioEngine.playScribble();
    }
  };

  const resetPractice = () => {
    setPracticeState({ A: 1.0, B: 0.0, C: 0.0, D: 0.0 });
  };

  useEffect(() => {
    const handleGlobalPointerUp = () => setIsPointerDown(false);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
  }, []);

  const machineText =
    practiceState.A >= 0.5 && practiceState.B < 0.25 && practiceState.C < 0.25 && practiceState.D < 0.25
      ? '机读通过：A 选项保留，得 5 分'
      : practiceState.A < 0.25 && practiceState.B < 0.25 && practiceState.C < 0.25 && practiceState.D < 0.25
        ? '机读结果：空白卡，0 分'
        : (practiceState.A >= 0.25 && practiceState.A < 0.5) ||
            (practiceState.B >= 0.25 && practiceState.B < 0.5) ||
            (practiceState.C >= 0.25 && practiceState.C < 0.5) ||
            (practiceState.D >= 0.25 && practiceState.D < 0.5)
          ? '机读警告：墨迹残留，直接 0 分'
          : '机读警告：多重填涂，直接 0 分';

  return (
    <div className="intro-shell">
      <div className="intro-topline">
        <span className="intro-badge">别做对的</span>
        <span className="intro-badge">要改到刚好</span>
        <span className="intro-badge">15 秒结束</span>
      </div>

      <div className="intro-tabs">
        <button className={`intro-tab ${activeTab === 'story' ? 'active' : ''}`} onClick={() => setActiveTab('story')}>
          开场剧情
        </button>
        <button className={`intro-tab ${activeTab === 'guide' ? 'active' : ''}`} onClick={() => { setActiveTab('guide'); handleStartPractice(); }}>
          改卡练习
        </button>
      </div>

      {activeTab === 'story' && (
        <div className="intro-panel story-panel">
          <div className="burst-card white">
            <div className="burst-kicker">高考最后 15 秒</div>
            <h3>你面前是一张已经能拿满分的答题卡。</h3>
            <p>但满分不是今天的目标。你得在老师收卷前，把它改到刚刚好，既别太高，也别太低。</p>
          </div>

          <div className="story-grid">
            <div className="story-box yellow">
              <strong>起始分数</strong>
              <span>100 分满卡</span>
            </div>
            <div className="story-box blue">
              <strong>目标分数</strong>
              <span>刚好 70 分</span>
            </div>
            <div className="story-box pink">
              <strong>失败方式</strong>
              <span>擦不干净 / 改过头</span>
            </div>
          </div>

          <div className="instruction-ribbon">
            <span>记住：涂黑太多不行，擦得太脏也不行。</span>
            <button className="jump-link" onClick={() => setActiveTab('guide')}>
              先摸一下手感 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'guide' && (
        <div className="intro-panel guide-panel">
          <div className="guide-grid">
            <div className="guide-box">
              <Eraser className="w-5 h-5" />
              <strong>滑动擦除</strong>
              <p>按住已涂黑气泡，来回摩擦，浓度会逐渐变淡。</p>
            </div>
            <div className="guide-box">
              <Pencil className="w-5 h-5" />
              <strong>点击回填</strong>
              <p>直接点空白气泡，会瞬间重新填黑到 100%。</p>
            </div>
            <div className="guide-box wide">
              <ScanSearch className="w-5 h-5" />
              <strong>机读规则</strong>
              <p>低于 25% 算擦干净。25% 到 50% 算残留污迹，阅卷机会直接判 0 分。</p>
            </div>
          </div>

          <div className="practice-card">
            <div className="practice-head">
              <span className="practice-sticker">练习题 01</span>
              <button onClick={resetPractice} className="mini-reset">
                <Undo2 className="w-3 h-3" /> 重置
              </button>
            </div>

            <div className="practice-row">
              {(['A', 'B', 'C', 'D'] as OptionType[]).map((opt) => {
                const fillValue = practiceState[opt];
                const bubbleClass =
                  fillValue === 0
                    ? 'practice-bubble idle'
                    : fillValue < 0.25
                      ? 'practice-bubble faint'
                      : fillValue < 0.5
                        ? 'practice-bubble warning'
                        : 'practice-bubble full';

                return (
                  <div
                    key={opt}
                    onPointerDown={() => handlePointerDown(opt)}
                    onPointerEnter={() => handleOptionDrag(opt)}
                    onPointerMove={() => handleOptionDrag(opt)}
                    className={bubbleClass}
                    style={{ touchAction: 'none' }}
                  >
                    {fillValue > 0 && (
                      <div
                        className="absolute inset-0.5 rounded-full graphite-shading"
                        style={{ '--fill-opacity': fillValue, opacity: fillValue } as React.CSSProperties}
                      />
                    )}
                    <span>{opt}</span>
                    <small>{Math.round(fillValue * 100)}%</small>
                  </div>
                );
              })}
            </div>

            <div className="practice-status">{machineText}</div>
          </div>
        </div>
      )}

      <div className="start-wrap">
        <button onClick={onStartGame} className="start-button">
          <Sparkles className="w-5 h-5" />
          <span>开局改卡</span>
        </button>
        <p className="start-note">建议开声音，心跳和擦卡音效会更带劲。</p>
      </div>
    </div>
  );
}
