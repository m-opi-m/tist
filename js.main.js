// وظائف التنقل للموبايل
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

if (hamburger) {
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });
}

// إغلاق القائمة عند النقر على أي رابط
document.querySelectorAll(".nav-menu a").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}));

// تأكيد إرسال النموذج
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // يمكن إضافة التحقق من المدخلات هنا
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = 'red';
                } else {
                    field.style.borderColor = '#ddd';
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                alert('يرجى ملء جميع الحقول المطلوبة');
                return false;
            }
            
            // في التطبيق الحقيقي، سيتم إرسال النموذج إلى الخادم
            // هذا مجرد عرض تجريبي
            return true;
        });
    });
});

// إظهار/إخفاء تفاصيل إضافية عند الحاجة
document.addEventListener('DOMContentLoaded', function() {
    // يمكن إضافة وظائف تفاعلية إضافية هنا
    console.log('تم تحميل MahWAY بنجاح');
});