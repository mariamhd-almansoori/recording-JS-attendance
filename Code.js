// تحديد الأعمدة للورقة
const TIMESTAMP_COLUMN = 6;
const EMAIL_COLUMN = 3;
const ATTENDANCE_COLUMN = 7; // "الوصول"
const DEPARTURE_COLUMN = 8; // "المغادرة"
const SHEET_NAME = "Report"; // اسم جدول بيانات Google
const REPORTS_SHEET_NAME = "Report"; // اسم جدول بيانات التّقارير

// ** ملاحظة **: لا تقم بتضمين مفاتيح API مباشرة في الكود لتجنب مشكلات الأمان
// const AI_API_KEY = 'AIzaSy...'; // يجب الحفاظ على سرية المفتاح
// const AI_MODEL = 'gemini-1.5-flash-latest'; // نموذج Google AI

// مُعرّف جدول البيانات
const SPREADSHEET_ID = '1Acqo1JTU-lYs9Kfb5IkT1wRW87FBpKe3D02BCk0kVME'; // ***استبدل هذا بمُعرّف جدول البيانات الفعلي***

function initializeOAuth2() {
  // إذا كنت بحاجة للوصول إلى ملفات في Google Drive، استخدم OAuth2. وإلا، يمكنك إزالة هذه الوظيفة.
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

function doGet(e) {
  let currentDate = new Date();
  let currentDateString = currentDate.toISOString().split('T')[0];

  if (!e || !e.parameter || !e.parameter.date || !e.parameter.linkId) {
    return HtmlService.createHtmlOutput('الرابط غير صالح أو منتهي الصلاحية.');
  }

  let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  let range = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  
  // التحقق من صلاحية الرابط باستخدام التاريخ والرمز المميز
  let isValidLink = range.some(row => {
    return (row[0] instanceof Date && row[0].toISOString().split('T')[0] === e.parameter.date && row[2] === e.parameter.linkId);
  });

  if (!isValidLink) {
    return HtmlService.createHtmlOutput('الرابط غير صالح أو منتهي الصلاحية.');
  }

  return HtmlService.createHtmlOutputFromFile('index');  // تأكد من أن 'index' هو اسم ملف HTML الخاص بك
}

function doPost(e) {
  Logger.log("Execution started");

  try {
    if (!e.postData || !e.postData.contents) {
      throw new Error("Missing postData in the request.");
    }
    
    let postData = JSON.parse(e.postData.contents);

    // التحقق من البيانات المطلوبة في postData
    if (!postData.phoneNumber) {
      throw new Error("phoneNumber is missing in postData.");
    }

    if (!postData.qualification) {  // تأكد من إضافة 'qualification' في النموذج المرسل
      throw new Error("qualification is missing in postData.");
    }

    if (!postData.email) {
      throw new Error("email is missing in postData.");
    }

    // الآن يمكنك استخدام postData كما تريد
    Logger.log(`Received postData: ${JSON.stringify(postData)}`);
    Logger.log("Execution completed successfully");

  } catch (error) {
    Logger.log(`Error in doPost: ${error.message}`);
    return ContentService.createTextOutput("Error: " + error.message);
  }
}

function validateData(postData) {
  try {
    if (!postData || !postData.phoneNumber) {
      throw new Error("postData أو phoneNumber غير موجودين.");
    }

    // تأكد من وجود دوال التحقق هذه في الكود
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
