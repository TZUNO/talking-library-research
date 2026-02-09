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
  /** 錯誤訊息（失敗時） */
  errorMessage?: string;
}

const GAS_URL = import.meta.env.VITE_GAS_LOG_URL ?? '';

/**
 * 將單次實驗回合的資料 POST 到 GAS 網址
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

  try {
    // 使用 text/plain 避免 CORS 預檢（OPTIONS），GAS 不支援 doOptions
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('[ExperimentLog] GAS 回傳非 2xx:', res.status, await res.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error('[ExperimentLog] 送出失敗:', err);
    return false;
  }
}
