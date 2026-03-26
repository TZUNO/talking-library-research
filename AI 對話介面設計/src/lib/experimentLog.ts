/**
 * 實驗數據記錄系統 - The Talking Library 人因研究
 * 透過 fetch POST 將資料送至 Google Apps Script (GAS) 端點
 */

export type InterfaceType = 'Template' | 'Free-form';

export interface ExperimentDataPayload {
  userId: string;
  interfaceType: InterfaceType;
  inputText: string;
  /** 受試者輸入字數（字元數） */
  inputLength?: number;
  thoughtTime: number;
  inputDuration: number;
  clickPath: string[];
  timestamp: string;
  /** 回應狀態：success | error */
  responseStatus?: 'success' | 'error';
  /** Chatbot 回應字數（成功時為實際字數，失敗時為 0） */
  responseLength?: number;
  /** AI 回應完整內容（成功時；失敗時為空；Sheets 單格上限 50000 字元） */
  responseText?: string;
  /** 錯誤訊息（失敗時） */
  errorMessage?: string;
  /** 受測者在研究控制面板填寫的最終選定材料（用於確認是否達成目標） */
  finalSelectedMaterial?: string;
}

const GAS_URL = import.meta.env.VITE_GAS_LOG_URL ?? '';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 將單次實驗回合的資料 POST 到 GAS 網址（含重試）
 * @param payload 實驗資料
 * @returns 是否成功送出（不拋錯，失敗時回傳 false）
 */
export async function logExperimentData(
  payload: ExperimentDataPayload
): Promise<boolean> {
  if (!GAS_URL) {
    console.warn('[ExperimentLog] VITE_GAS_LOG_URL 未設定，跳過記錄');
    return false;
  }

  const safePayload = { ...payload };
  if (typeof safePayload.responseText === 'string' && safePayload.responseText.length > 50000) {
    safePayload.responseText = safePayload.responseText.slice(0, 50000);
  }
  const body = JSON.stringify(safePayload);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body,
      });

      const text = await res.text();
      if (res.ok) return true;

      console.error(`[ExperimentLog] GAS 回傳非 2xx (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`, res.status, text);
      if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS);
    } catch (err) {
      console.error(`[ExperimentLog] 送出失敗 (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`, err);
      if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS);
    }
  }
  return false;
}
