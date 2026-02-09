/**
 * Google Apps Script：接收前端實驗記錄，寫入試算表分頁「ExperimentalData」
 * 部署為「網路應用程式」：執行身份「我」、存取「任何人」→ 取得網址後設為 VITE_GAS_LOG_URL
 */

const SHEET_NAME = 'ExperimentalData';

/** 點擊路徑代碼 → 試算表顯示文字 */
var CLICK_PATH_LABELS = {
  'template-1': '金屬材質篩選',
  'template-2': '塑膠橡膠比較',
  'template-3': '複合材質分析',
  'template-4': '環保材質推薦',
  'template-5': '應用場景匹配',
  'template-6': '規格標準查詢'
};

/** 欄位標題（與順序） */
const HEADERS = [
  '受測者代號',
  '介面類型',
  '輸入文字',
  '輸入字數',
  '思考時間',
  '輸入耗時',
  '點擊路徑',
  '時間戳記',
  '回應狀態',
  '回應字數',
  '錯誤訊息'
];

/**
 * 處理 POST 請求：解析 JSON，寫入 ExperimentalData 分頁
 */
function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '';
    var payload = JSON.parse(raw);

    var sheet = getOrCreateSheet();
    var row = payloadToRow(payload);
    sheet.appendRow(row);

    return createResponse(200, { ok: true, message: '已寫入一筆記錄' });
  } catch (err) {
    return createResponse(200, { ok: false, error: String(err.message || err) });
  }
}

/**
 * 僅供測試：在編輯器中執行，用假資料寫入一筆
 */
function testAppendOne() {
  var payload = {
    userId: 'P001',
    interfaceType: 'Template',
    inputText: '測試輸入',
    inputLength: 4,
    thoughtTime: 5.2,
    inputDuration: 12.3,
    clickPath: ['template-metal', 'submit'],
    timestamp: new Date().toISOString(),
    responseStatus: 'success',
    responseLength: 100
  };
  var sheet = getOrCreateSheet();
  sheet.appendRow(payloadToRow(payload));
  Logger.log('testAppendOne done');
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange('1:1').setFontWeight('bold');
  }
  return sheet;
}

/**
 * 將點擊路徑代碼轉成試算表顯示文字（template-1～6 對應中文，其餘保留原樣）
 */
function formatClickPathForSheet(clickPath) {
  if (clickPath == null) return '';
  var arr = Array.isArray(clickPath) ? clickPath : [String(clickPath)];
  var labels = arr.map(function (key) {
    var k = String(key).trim();
    return CLICK_PATH_LABELS[k] || k;
  });
  return labels.join(', ');
}

/**
 * 將前端 payload 轉成與 HEADERS 對應的一列陣列
 */
function payloadToRow(p) {
  var clickPathStr = formatClickPathForSheet(p.clickPath);

  return [
    p.userId || '',
    p.interfaceType || '',
    p.inputText || '',
    p.inputLength != null ? p.inputLength : '',
    p.thoughtTime != null ? p.thoughtTime : '',
    p.inputDuration != null ? p.inputDuration : '',
    clickPathStr,
    p.timestamp || '',
    p.responseStatus || '',
    p.responseLength != null ? p.responseLength : '',
    p.errorMessage || ''
  ];
}

function createResponse(statusCode, body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
