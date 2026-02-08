import { useRef, useCallback } from 'react';

/**
 * 實驗追蹤：載入時間、首次打字、輸入開始、點擊序列
 * - thoughtTime = 從載入到開始打字（秒）
 * - inputDuration = 從第一個字到按下送出（秒）
 * - clickPath = 點擊過的按鈕 id 序列
 */
export function useExperimentTracking() {
  const pageLoadTimeRef = useRef<number>(Date.now());
  const firstKeystrokeTimeRef = useRef<number | null>(null);
  const firstCharTimeRef = useRef<number | null>(null);
  const clickPathRef = useRef<string[]>([]);

  const recordFirstKeystroke = useCallback(() => {
    if (firstKeystrokeTimeRef.current === null) {
      firstKeystrokeTimeRef.current = Date.now();
    }
  }, []);

  const recordFirstChar = useCallback(() => {
    if (firstCharTimeRef.current === null) {
      firstCharTimeRef.current = Date.now();
    }
  }, []);

  const recordClick = useCallback((buttonId: string) => {
    clickPathRef.current.push(buttonId);
  }, []);

  /** 取得本次回合的 thoughtTime（秒），從載入到首次打字；若尚未打字則為到目前的秒數或 0 */
  const getThoughtTimeSeconds = useCallback(() => {
    const first = firstKeystrokeTimeRef.current ?? Date.now();
    return (first - pageLoadTimeRef.current) / 1000;
  }, []);

  /** 取得本次回合的 inputDuration（秒），從第一個字到現在；若尚未輸入則為 0 */
  const getInputDurationSeconds = useCallback(() => {
    const start = firstCharTimeRef.current;
    if (start === null) return 0;
    return (Date.now() - start) / 1000;
  }, []);

  /** 取得目前 clickPath 的複本 */
  const getClickPath = useCallback(() => [...clickPathRef.current], []);

  /** 送出後重置本回合計時（保留 pageLoad 可選：新回合視為新載入則設 true） */
  const resetForNextTurn = useCallback((resetPageLoad = false) => {
    firstKeystrokeTimeRef.current = null;
    firstCharTimeRef.current = null;
    clickPathRef.current = [];
    if (resetPageLoad) {
      pageLoadTimeRef.current = Date.now();
    }
  }, []);

  return {
    recordFirstKeystroke,
    recordFirstChar,
    recordClick,
    getThoughtTimeSeconds,
    getInputDurationSeconds,
    getClickPath,
    resetForNextTurn,
  };
}
