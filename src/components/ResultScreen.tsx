import React from 'react';
import { RotateCcw, AlertTriangle, Trophy, Siren, ScanSearch } from 'lucide-react';
import { AnswerSheet, QUESTIONS } from '../types';

interface ResultScreenProps {
  score: number;
  targetScore: number;
  answerSheet: AnswerSheet;
  timeOut: boolean;
  onRestart: () => void;
}

export function ResultScreen({ score, targetScore, answerSheet, onRestart }: ResultScreenProps) {
  const getSmudgeCount = () => {
    let smudges = 0;
    QUESTIONS.forEach((q) => {
      const state = answerSheet[q.id];
      if (!state) return;
      (Object.values(state) as number[]).forEach((opacity) => {
        if (opacity >= 0.25 && opacity < 0.5) smudges += 1;
      });
    });
    return smudges;
  };

  const smudgeCount = getSmudgeCount();
  const isExcellentSuccess = score === targetScore && smudgeCount === 0;
  const isSmudgeFail = score === targetScore && smudgeCount > 0;

  const title = isExcellentSuccess
    ? '刚刚好，神级控分。'
    : isSmudgeFail
      ? '分数对了，卡面脏了。'
      : score > targetScore
        ? '你改得还不够狠。'
        : '你下手太重，直接改崩。';

  const subtitle = isExcellentSuccess
    ? '这一局真的把满分卡改成了目标分。'
    : isSmudgeFail
      ? '阅卷机不认脏卡，残留一样算出局。'
      : score > targetScore
        ? `现在还是 ${score} 分，离 ${targetScore} 还差最后一脚。`
        : `现在只剩 ${score} 分，已经低过目标线了。`;

  const badge = isExcellentSuccess ? '完美改卡' : isSmudgeFail ? '脏卡出局' : score > targetScore ? '改得不够' : '改过头了';
  const icon = isExcellentSuccess ? <Trophy className="w-12 h-12" /> : isSmudgeFail ? <ScanSearch className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />;

  return (
    <div className="result-shell">
      <div className="result-topline">
        <span className="result-chip">扫描完毕</span>
        <span className="result-chip">立即判卷</span>
        <span className="result-chip">结果生效</span>
      </div>

      <div className="result-head">
        <div className="result-icon-wrap">{icon}</div>
        <div className="result-badge">{badge}</div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="result-stats">
        <div className="result-stat yellow">
          <span>最终分数</span>
          <strong>{score}<small>分</small></strong>
        </div>
        <div className="result-stat blue">
          <span>目标分数</span>
          <strong>{targetScore}<small>分</small></strong>
        </div>
        <div className="result-stat pink">
          <span>残留污迹</span>
          <strong>{smudgeCount}<small>处</small></strong>
        </div>
      </div>

      <div className="result-panel">
        {isExcellentSuccess && (
          <>
            <div className="result-callout green">你没有考满分，也没有失手过头，而是把整张卡精确压到了目标线。</div>
            <p>这不是乱改，这是手稳到离谱。每一道题都擦得够狠，但又没留下要命残影。阅卷机扫过去，只能认。</p>
          </>
        )}

        {isSmudgeFail && (
          <>
            <div className="result-callout yellow"><Siren className="w-4 h-4" /> 机器警告：分数虽然到了，但脏污残留过多。</div>
            <p>你把分数控到了目标线，但有几道题擦得不够干净。25% 到 50% 的灰影会被机器当成异常，整题直接作废。</p>
          </>
        )}

        {!isExcellentSuccess && !isSmudgeFail && score > targetScore && (
          <>
            <div className="result-callout blue">卡面还太完整，说明你下手慢了。</div>
            <p>15 秒还是不够你犹豫。想把 100 分硬改到 70 分，就得更快找到该擦的题，少留情面。</p>
          </>
        )}

        {!isExcellentSuccess && !isSmudgeFail && score < targetScore && (
          <>
            <div className="result-callout pink">你擦得太猛，直接把底线以下也一起抹没了。</div>
            <p>控分不是越低越好。你把原本能保住的题也一起干掉了，结果反而掉出目标区。</p>
          </>
        )}
      </div>

      <div className="leaderboard-placeholder">
        <span>排行榜区域预留</span>
        <strong>以后这里会放“最低分最稳”的前排名单。</strong>
      </div>

      <div className="result-actions">
        <button onClick={onRestart} className="restart-button">
          <RotateCcw className="w-4 h-4" />
          <span>重新开局</span>
        </button>
      </div>
    </div>
  );
}
