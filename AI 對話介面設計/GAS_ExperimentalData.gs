/**
 * Google Apps Script：接收前端實驗記錄，寫入試算表分頁「ExperimentalData」
 * 部署為「網路應用程式」：執行身份「我」、存取「任何人」→ 取得網址後設為 VITE_GAS_LOG_URL
 */

const SHEET_NAME = 'ExperimentalData';

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
  'AI 回應',
  '錯誤訊息'
];

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
  return createResponse(200, { ok: true, message: 'GAS 實驗記錄端點正常', version: '1.0' });
}

function testAppendOne() {
  var payload = {
    userId: 'P001',
    interfaceType: 'Template',
    inputText: '測試輸入',
    inputLength: 4,
    thoughtTime: 5.2,
    inputDuration: 12.3,
    clickPath: ['template-1', 'submit'],
    timestamp: new Date().toISOString(),
    responseStatus: 'success',
    responseLength: 100,
    responseText: '這是 AI 回應的測試內容。'
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

function getResponseText(p) {
  var t = p.responseText || p.response_content || p.response || '';
  return typeof t === 'string' ? t : String(t || '');
}

function payloadToRow(p) {
  var clickPathStr = formatClickPathForSheet(p.clickPath);
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
    p.timestamp || '',
    p.responseStatus || '',
    p.responseLength != null ? p.responseLength : '',
    responseText,
    p.errorMessage || ''
  ];
}

function createResponse(statusCode, body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
