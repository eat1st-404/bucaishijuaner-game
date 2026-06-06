import React from 'react';
import { Target, TimerReset, Activity, ShieldCheck } from 'lucide-react';

interface GameHeaderProps {
  timeRemaining: number;
  currentScore: number;
  stressLevel: number;
  targetScore: number;
  bpm: number;
}

export function GameHeader({
  timeRemaining,
  currentScore,
  stressLevel,
  targetScore,
  bpm,
}: GameHeaderProps) {
  const formattedTime = Math.max(0, timeRemaining).toFixed(2);
  const isDangerTime = timeRemaining <= 5;

  return (
    <div className="hud-shell">
      <div className="hud-headline">
        <div className="hud-chip blue">绝密模式</div>
        <div className="hud-chip pink">15秒改卡</div>
        <div className="hud-chip green">满分出局</div>
      </div>

      <div className="hud-title-wrap">
        <h2 className="hud-title">普通高等学校招生全国统一考试 · 修改专用局</h2>
        <p className="hud-copy">目标：把已经涂满的完美答题卡，硬改到刚好 70 分。</p>
      </div>

      <div className="hud-grid">
        <div className="hud-card yellow">
          <div className="hud-icon"><Target className="w-5 h-5" /></div>
          <div>
            <div className="hud-label">目标分数</div>
            <div className="hud-value">{targetScore}<span>分</span></div>
          </div>
        </div>

        <div className={`hud-card ${currentScore === targetScore ? 'green' : currentScore > targetScore ? 'blue' : 'pink'}`}>
          <div className="hud-icon"><ShieldCheck className="w-5 h-5" /></div>
          <div>
            <div className="hud-label">当前卡面分</div>
            <div className="hud-value">{currentScore}<span>分</span></div>
          </div>
        </div>

        <div className={`hud-card ${isDangerTime ? 'pink flash' : 'white'}`}>
          <div className="hud-icon"><TimerReset className="w-5 h-5" /></div>
          <div>
            <div className="hud-label">收卷倒计时</div>
            <div className="hud-value">{formattedTime}<span>秒</span></div>
          </div>
        </div>

        <div className="hud-card black">
          <div className="hud-icon"><Activity className="w-5 h-5" /></div>
          <div className="hud-label-row">
            <span className="hud-label">手抖指数</span>
            <span className="hud-bpm">{bpm} BPM</span>
          </div>
          <div className="hud-meter">
            <div className="hud-meter-fill" style={{ width: `${Math.min(100, stressLevel)}%` }} />
          </div>
          <div className="hud-percent">{Math.round(stressLevel)}%</div>
        </div>
      </div>
    </div>
  );
}
