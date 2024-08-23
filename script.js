document.getElementById('attendance-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    // إخفاء رسائل الخطأ والنجاح في البداية
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');

    // الحصول على القيم المدخلة
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();

    // التحقق من صحة البيانات المدخلة
    if (!name || !phone || !email) {
        errorMessage.textContent = 'جميع الحقول مطلوبة!';
        errorMessage.classList.remove('hidden');
        return;
    }

    if (!validatePhone(phone)) {
        errorMessage.textContent = 'رقم الهاتف غير صحيح!';
        errorMessage.classList.remove('hidden');
        return;
    }

    if (!validateEmail(email)) {
        errorMessage.textContent = 'البريد الإلكتروني غير صحيح!';
        errorMessage.classList.remove('hidden');
        return;
    }

    // إرسال البيانات إلى Google Apps Script
    try {
        const response = await fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', {
            method: 'POST',
            body: JSON.stringify({ name, phone, email })
        });

        if (!response.ok) {
            throw new Error('HTTP error, status = ' + response.status);
        }

        const result = await response.json();
        if (result.success) {
            successMessage.textContent = 'تم تسجيل الحضور بنجاح!';
            successMessage.classList.remove('hidden');
            document.getElementById('attendance-form').reset();
        } else {
            throw new Error(result.message || 'حدث خطأ غير معروف');
        }
    } catch (error) {
        errorMessage.textContent = 'لم تتم عملية التسجيل! يرجى محاولة التسجيل مرة اخرى: ' + error.message;
        errorMessage.classList.remove('hidden');
    }
});

// دوال التحقق من صحة البيانات
function validatePhone(phone) {
    const phonePattern = /^[0-9]{10}$/;  // تأكد من تعديل النمط حسب رقم هاتفك المحلي
    return phonePattern.test(phone);
}

function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}
