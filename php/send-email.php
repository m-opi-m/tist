<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // جمع بيانات النموذج
    $fullName = htmlspecialchars($_POST['fullName']);
    $phone = htmlspecialchars($_POST['phone']);
    $email = htmlspecialchars($_POST['email']);
    $productLink = htmlspecialchars($_POST['productLink']);
    $couponCode = htmlspecialchars($_POST['couponCode']);
    $paymentMethod = htmlspecialchars($_POST['paymentMethod']);
    
    // عنوان البريد الإلكتروني للشركة
    $to = "mahway.contact@gmail.com";
    
    // موضوع البريد
    $subject = "طلب منتج جديد - MahWAY";
    
    // محتوى البريد
    $message = "
    <html>
    <head>
        <title>طلب منتج جديد</title>
        <style>
            body { font-family: Arial, sans-serif; direction: rtl; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
            .header { background-color: #2c3e50; color: white; padding: 15px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 20px; }
            .field { margin-bottom: 15px; }
            .field-label { font-weight: bold; color: #2c3e50; }
            .field-value { padding: 5px 0; }
            .highlight { background-color: #f9f9f9; padding: 10px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>طلب منتج جديد - MahWAY</h2>
            </div>
            <div class='content'>
                <div class='field'>
                    <div class='field-label'>الاسم الكامل:</div>
                    <div class='field-value'>$fullName</div>
                </div>
                
                <div class='field'>
                    <div class='field-label'>رقم الهاتف:</div>
                    <div class='field-value'>$phone</div>
                </div>
                
                <div class='field'>
                    <div class='field-label'>البريد الإلكتروني:</div>
                    <div class='field-value'>$email</div>
                </div>
                
                <div class='field'>
                    <div class='field-label'>رابط المنتج:</div>
                    <div class='field-value'><a href='$productLink'>$productLink</a></div>
                </div>
                
                <div class='field'>
                    <div class='field-label'>كود الخصم:</div>
                    <div class='field-value'>" . (!empty($couponCode) ? $couponCode : "لم يتم إدخال كود خصم") . "</div>
                </div>
                
                <div class='field highlight'>
                    <div class='field-label'>طريقة الدفع المختارة:</div>
                    <div class='field-value'>$paymentMethod</div>
                </div>
                
                <p>يرجى التواصل مع العميل خلال 24 ساعة لتأكيد الطلب وتحديد السعر النهائي.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // رأس البريد
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: MahWAY Contact <noreply@mahway.com>" . "\r\n";
    $headers .= "Reply-To: $email" . "\r\n";
    
    // إرسال البريد
    if (mail($to, $subject, $message, $headers)) {
        // إعادة توجيه مع رسالة نجاح
        header('Location: ../request-form.html?status=success');
        exit();
    } else {
        // إعادة توجيه مع رسالة خطأ
        header('Location: ../request-form.html?status=error');
        exit();
    }
} else {
    // إذا لم يتم الوصول إلى الصفحة عبر POST
    header('Location: ../request-form.html');
    exit();
}
?>
