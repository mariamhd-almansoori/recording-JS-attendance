// تحديد الأعمدة للورقة
const TIMESTAMP_COLUMN = 6;
const EMAIL_COLUMN = 3;
const ATTENDANCE_COLUMN = 7; // "الوصول"
const DEPARTURE_COLUMN = 8; // "المغادرة"
const SHEET_NAME = "Report"; // اسم جدول بيانات Google
const REPORTS_SHEET_NAME = "Report"; // اسم جدول بيانات التّقارير
const AI_API_KEY = 'AIzaSyAD_MNUJyieSx3HLK1eCiFqWz8jgG0WsXY'; // API KEY الخاص بك 
const AI_MODEL = 'gemini-1.5-flash-latest'; // نموذج Google AI
// مُعرّف جدول البيانات
const SPREADSHEET_ID = '1Acqo1JTU-lYs9Kfb5IkT1wRW87FBpKe3D02BCk0kVME'; // ***استبدل هذا بمُعرّف جدول البيانات الفعلي***

let oauth2Service; // Declare the OAuth2 object globally

function initializeOAuth2() {
  // Initialize the OAuth2 service only once
  if (!oauth2Service) {
    oauth2Service = OAuth2.createService('Drive')
        .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
        .setTokenUrl('https://accounts.google.com/o/oauth2/token')
        .setClientId('734022270147-rfc3a93eigbn3d8jmme1e5s8tbv7jtrk.apps.googleusercontent.com')
        .setClientSecret('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')
        .setScope(['https://www.googleapis.com/auth/drive.readonly'])
        .setCallbackFunction('authCallback');
  }
}

// ...  الكود  الآخر  ...

function doGet(e) {
  let currentDate = new Date();
  let currentDateString = currentDate.toISOString().split('T')[0];

  // تحقق من أن الكائن e والخاصية parameter موجودان
  if (!e || !e.parameter || !e.parameter.date || !e.parameter.linkId) {
    return HtmlService.createHtmlOutput('الرابط غير صالح أو منتهي الصلاحية.');
  }

  // التحقق من صلاحية الرابط باستخدام التاريخ والرمز المميز
  let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  let range = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  let isValidLink = range.some(row => {
    return (row[0] instanceof Date && row[0].toISOString().split('T')[0] === e.parameter.date && row[2] === e.parameter.linkId);
  });

  if (!isValidLink) {
    return HtmlService.createHtmlOutput('الرابط غير صالح أو منتهي الصلاحية.');
  }

  return HtmlService.createHtmlOutputFromFile('index');  // تأكد من أن 'index' هو اسم ملف HTML الخاص بك
}

// ...  الكود  الآخر  ... 

function doPost(e) {
Logger.log("Execution started");
try {
// التحقق من أن postData موجودة في الطلب
if (!e.postData || !e.postData.contents) {
throw new Error("Missing postData in the request.");
}
let postData = JSON.parse(e.postData.contents);

// التحقق من البيانات المطلوبة في postData
if (!postData.phoneNumber) {
  throw new Error("phoneNumber is missing in postData.");
}

if (!postData.qualification) {
  throw new Error("qualification is missing in postData.");
}

if (!postData.email) {
  throw new Error("email is missing in postData.");
}

// الآن يمكنك استخدام postData كما تريد
Logger.log("Received postData: { \"phoneNumber\": \"1234567890\", \"qualification\": \"Bachelor\", \"email\": \"example@example.com\" }");
Logger.log("Execution completed successfully");

} catch (error) {
Logger.log("Error in doPost: phoneNumber is missing in postData.");
Logger.log("Execution completed with errors");
return ContentService.createTextOutput("Error: " + error.message);
  }
}

function validateData(postData, phoneNumber) {
  try {
    if (!postData || !phoneNumber) {
      throw new Error("postData أو phoneNumber غير موجودين.");
    }

    let isPhoneValid = checkPhoneNumberInDrive(postData.phoneNumber);
    if (!isPhoneValid) {
      return false;
    }

    let isQualificationValid = checkQualificationInDrive(postData.qualification);
    if (!isQualificationValid) {
      return false;
    }

    let isEmailValid = validateEmail(postData.email);
    if (!isEmailValid) {
      return false;
    }

    return true;

  } catch (error) {
    Logger.log("Error in validateData: " + error.message);
    return false;
  }
}