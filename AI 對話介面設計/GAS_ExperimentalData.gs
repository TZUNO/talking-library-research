/**
 * Google Apps Script：接收前端實驗記錄，寫入試算表分頁「ExperimentalData」
 * 欄位順序須與前端 ExperimentDataPayload 一致（見 payloadToRow）
 * 部署為「網路應用程式」：執行身份「我」、存取「任何人」→ 取得網址後設為 VITE_GAS_LOG_URL
 */

var SHEET_NAME = 'ExperimentalData';

var HEADERS = [
  '受測者代號',
  '介面類型',
  '輸入文字',
  '輸入字數',
  '思考時間',
  '輸入耗時',
  '點擊路徑',
  '提示面向',
  '時間戳記',
  '回應狀態',
  '回應字數',
  'AI 回應',
  '錯誤訊息',
  '按圖片',
  '圖片點擊停留時間'
];

/**
 * 面向代號（與前端 clickPath 一致）：
 * 1＝情境／氛圍、2＝性能／條件、3＝比較／決策
 * 保留 template-1～3 舊格式相容
 */
var TEMPLATE_CATEGORY = {
  '1': '情境／氛圍',
  '2': '性能／條件',
  '3': '比較／決策',
  'template-1': '情境／氛圍',
  'template-2': '性能／條件',
  'template-3': '比較／決策'
};

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createResponse(400, { ok: false, error: 'No request body' });
    }
    var raw = String(e.postData.contents);
    if (!raw.trim()) {
      return createResponse(400, { ok: false, error: 'Empty body' });
    }
    var payload = JSON.parse(raw);

    var sheet = getOrCreateSheet();
    var row = payloadToRow(payload);
    sheet.appendRow(row);
    return createResponse(200, { ok: true, message: '已寫入一筆記錄' });
  } catch (err) {
    return createResponse(500, { ok: false, error: String(err.message || err) });
  }
}

function doGet() {
  return createResponse(200, { ok: true, message: 'GAS 實驗記錄端點正常', version: '2.1' });
}

function testAppendOne() {
  var payload = {
    userId: 'P001',
    interfaceType: 'Template',
    inputText: '測試輸入',
    inputLength: 4,
    thoughtTime: 5.2,
    inputDuration: 12.3,
    clickPath: ['1', 'submit'],
    timestamp: new Date().toISOString(),
    responseStatus: 'success',
    responseLength: 100,
    responseText: '這是 AI 回應的測試內容。',
    imagePreviewCount: 2,
    imagePreviewDurationSeconds: 15.5
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
  } else {
    var lastCol = sheet.getLastColumn();
    if (lastCol < HEADERS.length) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }
  }
  return sheet;
}

function formatClickPathForSheet(clickPath) {
  if (clickPath == null) return '';
  return Array.isArray(clickPath) ? JSON.stringify(clickPath) : String(clickPath);
}

/** 從點擊路徑取得提示面向（供實驗分析用） */
function getPromptCategory(clickPath) {
  if (clickPath == null) return '';
  var arr = Array.isArray(clickPath) ? clickPath : [String(clickPath)];
  for (var i = arr.length - 1; i >= 0; i--) {
    var k = String(arr[i]).trim();
    if (TEMPLATE_CATEGORY[k]) return TEMPLATE_CATEGORY[k];
  }
  return '';
}

function getResponseText(p) {
  var t = p.responseText || p.response_content || p.response || '';
  return typeof t === 'string' ? t : String(t || '');
}

function payloadToRow(p) {
  var clickPathStr = formatClickPathForSheet(p.clickPath);
  var promptCategory = getPromptCategory(p.clickPath);
  var responseText = getResponseText(p);
  if (responseText.length > 50000) {
    responseText = responseText.substring(0, 50000);
  }
  return [
    p.userId || '',
    p.interfaceType || '',
    p.inputText || '',
    p.inputLength != null ? p.inputLength : '',
    p.thoughtTime != null ? p.thoughtTime : '',
    p.inputDuration != null ? p.inputDuration : '',
    clickPathStr,
    promptCategory,
    p.timestamp || '',
    p.responseStatus || '',
    p.responseLength != null ? p.responseLength : '',
    responseText,
    p.errorMessage || '',
    p.imagePreviewCount != null ? p.imagePreviewCount : '',
    p.imagePreviewDurationSeconds != null ? p.imagePreviewDurationSeconds : ''
  ];
}

function createResponse(statusCode, body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
