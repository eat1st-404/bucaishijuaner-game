import React from 'react';
import { OptionType, AnswerSheet, QUESTIONS } from '../types';
import { AlertCircle, CheckCircle2, Circle, XCircle } from 'lucide-react';

interface QuestionSheetProps {
  answerSheet: AnswerSheet;
  onBubbleDown: (qId: number, opt: OptionType) => void;
  onBubbleEnter: (qId: number, opt: OptionType) => void;
  onBubbleMove: (qId: number, opt: OptionType) => void;
}

export function QuestionSheet({ answerSheet, onBubbleDown, onBubbleEnter, onBubbleMove }: QuestionSheetProps) {
  const getQuestionStatus = (qId: number) => {
    const state = answerSheet[qId];
    if (!state) return { code: 'blank', text: '空白', points: 0 };

    const correctOpt = QUESTIONS.find((q) => q.id === qId)?.correctAnswer || 'A';
    const activeOpts: string[] = [];
    const smudgeOpts: string[] = [];

    (Object.keys(state) as OptionType[]).forEach((opt) => {
      const val = state[opt];
      if (val >= 0.5) activeOpts.push(opt);
      else if (val >= 0.25) smudgeOpts.push(opt);
    });

    if (smudgeOpts.length > 0) return { code: 'smudge', text: '残留', points: 0 };
    if (activeOpts.length > 1) return { code: 'double', text: '多涂', points: 0 };
    if (activeOpts.length === 1 && activeOpts[0] === correctOpt) return { code: 'correct', text: '正确', points: 5 };
    if (activeOpts.length === 1 && activeOpts[0] !== correctOpt) return { code: 'wrong', text: '改错', points: 0 };
    return { code: 'blank', text: '空白', points: 0 };
  };

  const columns = [
    QUESTIONS.filter((q) => q.id >= 1 && q.id <= 10),
    QUESTIONS.filter((q) => q.id >= 11 && q.id <= 20),
  ];

  return (
    <div className="sheet-shell">
      <div className="sheet-banner">
        <span>注意：填涂请用 2B 铅笔，修改请用橡皮，脏了就全完。</span>
        <span className="hidden sm:inline">答题卡扫描线 █▐█▌▐█</span>
      </div>

      <div className="sheet-titlebar">
        <div>
          <div className="sheet-kicker">挑战主场</div>
          <h3>普通高等学校招生全国统一考试 · 答题卡</h3>
        </div>
        <div className="sheet-side-tag">改卡中</div>
      </div>

      <div className="sheet-columns">
        {columns.map((columnQuestions, colIndex) => (
          <div key={colIndex} className="question-column">
            <div className="column-head">
              <span>第 {colIndex * 10 + 1} - {colIndex * 10 + 10} 题</span>
              <span>判定</span>
            </div>

            {columnQuestions.map((q) => {
              const status = getQuestionStatus(q.id);
              const qState = answerSheet[q.id] || { A: 0, B: 0, C: 0, D: 0 };

              return (
                <div key={q.id} className={`question-row ${status.code}`}>
                  <div className="question-meta">
                    <span className="question-no">{String(q.id).padStart(2, '0')}</span>
                    {status.code === 'correct' && <span className="status-pill green"><CheckCircle2 className="w-3.5 h-3.5" /> 5分</span>}
                    {status.code === 'wrong' && <span className="status-pill gray"><Circle className="w-3.5 h-3.5" /> 改错</span>}
                    {status.code === 'blank' && <span className="status-pill white">空白</span>}
                    {status.code === 'smudge' && <span className="status-pill pink"><AlertCircle className="w-3.5 h-3.5" /> 残留</span>}
                    {status.code === 'double' && <span className="status-pill yellow"><XCircle className="w-3.5 h-3.5" /> 多涂</span>}
                  </div>

                  <div className="bubble-row">
                    {(['A', 'B', 'C', 'D'] as OptionType[]).map((opt) => {
                      const fillValue = qState[opt] || 0;
                      const isCorrectChoice = opt === q.correctAnswer;
                      const bubbleClass =
                        fillValue >= 0.5
                          ? 'answer-bubble filled'
                          : fillValue >= 0.25
                            ? 'answer-bubble smudge'
                            : isCorrectChoice
                              ? 'answer-bubble correct-ref'
                              : 'answer-bubble wrong-ref';

                      return (
                        <div
                          key={opt}
                          onPointerDown={() => onBubbleDown(q.id, opt)}
                          onPointerEnter={() => onBubbleEnter(q.id, opt)}
                          onPointerMove={() => onBubbleMove(q.id, opt)}
                          className={bubbleClass}
                          style={{ touchAction: 'none' }}
                        >
                          {fillValue > 0 && (
                            <div
                              className="absolute inset-[1.5px] rounded-full graphite-shading pointer-events-none"
                              style={{ '--fill-opacity': fillValue, opacity: fillValue } as React.CSSProperties}
                            />
                          )}
                          <span>{opt}</span>
                          {fillValue > 0 && fillValue < 0.95 && <small>{Math.round(fillValue * 100)}%</small>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="sheet-footer">
        <span>#擦不干净也算死</span>
        <span>#多涂一样零分</span>
        <span>#70分才是正解</span>
      </div>
    </div>
  );
}
