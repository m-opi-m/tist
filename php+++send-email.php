<?php
/**
 * MahWAY - Product Request Email Handler
 * Version: 1.0.0
 * Author: MahWAY Team
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for JSON response
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit;
}

// Get JSON data from request body
$input = json_decode(file_get_contents('php://input'), true);

// If no JSON data, check form data
if (empty($input)) {
    $input = $_POST;
}

// Validate required fields
$requiredFields = ['fullName', 'phone', 'email', 'productLink', 'paymentMethod'];
foreach ($requiredFields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Missing required field: ' . $field
        ]);
        exit;
    }
}

// Sanitize input data
$fullName = htmlspecialchars(trim($input['fullName']), ENT_QUOTES, 'UTF-8');
$phone = htmlspecialchars(trim($input['phone']), ENT_QUOTES, 'UTF-8');
$email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
$productLink = htmlspecialchars(trim($input['productLink']), ENT_QUOTES, 'UTF-8');
$couponCode = !empty($input['couponCode']) ? htmlspecialchars(trim($input['couponCode']), ENT_QUOTES, 'UTF-8') : 'لم يتم إدخال كود خصم';
$paymentMethod = htmlspecialchars(trim($input['paymentMethod']), ENT_QUOTES, 'UTF-8');
$country = !empty($input['country']) ? htmlspecialchars(trim($input['country']), ENT_QUOTES, 'UTF-8') : 'مصر';
$productQuantity = !empty($input['productQuantity']) ? intval($input['productQuantity']) : 1;
$productNotes = !empty($input['productNotes']) ? htmlspecialchars(trim($input['productNotes']), ENT_QUOTES, 'UTF-8') : 'لا توجد ملاحظات';

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email address'
    ]);
    exit;
}

// Validate product link format
if (!preg_match('/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i', $productLink)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid product link format'
    ]);
    exit;
}

// Email configuration
$to = "mahway.contact@gmail.com";
$subject = "طلب منتج جديد - MahWAY";

// Email headers
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: MahWAY <noreply@mahway.com>\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "X-Priority: 1\r\n";

// Email template
$emailTemplate = <<<HTML
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>طلب منتج جديد</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #1a2530 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 25px;
            padding-bottom: 25px;
            border-bottom: 1px solid #eee;
        }
        .section:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .section-title {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .section-title i {
            color: #e74c3c;
        }
        .field {
            margin-bottom: 10px;
            display: flex;
            flex-wrap: wrap;
        }
        .field-label {
            font-weight: bold;
            color: #555;
            min-width: 150px;
            margin-bottom: 5px;
        }
        .field-value {
            color: #333;
            flex: 1;
        }
        .highlight {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-right: 4px solid #3498db;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #eee;
        }
        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 15px;
            font-weight: bold;
            font-size: 20px;
            color: white;
        }
        .priority {
            background-color: #27ae60;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            display: inline-block;
            margin-right: 10px;
        }
        @media (max-width: 600px) {
            .container {
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .field {
                flex-direction: column;
            }
            .field-label {
                min-width: auto;
                margin-bottom: 2px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span>MahWAY</span>
            </div>
            <h1>طلب منتج جديد 📦</h1>
        </div>
        
        <div class="content">
            <div class="section">
                <h2 class="section-title">
                    <span>معلومات العميل</span>
                </h2>
                <div class="field">
                    <div class="field-label">الاسم الكامل:</div>
                    <div class="field-value">{$fullName}</div>
                </div>
                <div class="field">
                    <div class="field-label">رقم الهاتف:</div>
                    <div class="field-value">{$phone}</div>
                </div>
                <div class="field">
                    <div class="field-label">البريد الإلكتروني:</div>
                    <div class="field-value">{$email}</div>
                </div>
                <div class="field">
                    <div class="field-label">البلد:</div>
                    <div class="field-value">{$country}</div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">
                    <span>تفاصيل المنتج</span>
                </h2>
                <div class="field">
                    <div class="field-label">رابط المنتج:</div>
                    <div class="field-value">
                        <a href="{$productLink}" target="_blank">{$productLink}</a>
                    </div>
                </div>
                <div class="field">
                    <div class="field-label">الكمية المطلوبة:</div>
                    <div class="field-value">{$productQuantity} قطعة</div>
                </div>
                <div class="field">
                    <div class="field-label">كود الخصم:</div>
                    <div class="field-value">{$couponCode}</div>
                </div>
                <div class="field">
                    <div class="field-label">ملاحظات إضافية:</div>
                    <div class="field-value">{$productNotes}</div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">
                    <span>طريقة الدفع</span>
                </h2>
                <div class="highlight">
                    <div class="field">
                        <div class="field-label">الطريقة المختارة:</div>
                        <div class="field-value">
                            {$paymentMethod == '50-50' ? 'الدفع عند التواصل (50% الآن + 50% عند الاستلام)' : 'الدفع الكامل 100% (أولوية التجهيز)'}
                            {if $paymentMethod == '100'}<span class="priority">أولوية</span>{/if}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">
                    <span>معلومات الطلب</span>
                </h2>
                <div class="field">
                    <div class="field-label">وقت الطلب:</div>
                    <div class="field-value">{$currentDateTime}</div>
                </div>
                <div class="field">
                    <div class="field-label">رقم الطلب:</div>
                    <div class="field-value">MAH-{$orderNumber}</div>
                </div>
                <div class="field">
                    <div class="field-label">حالة الطلب:</div>
                    <div class="field-value" style="color: #f39c12; font-weight: bold;">بانتظار المراجعة</div>
                </div>
            </div>
            
            <div class="section">
                <div class="highlight">
                    <p style="margin: 0; color: #27ae60; font-weight: bold;">
                        <span style="color: #2c3e50;">📋 ملاحظة:</span> 
                        يرجى التواصل مع العميل خلال 24 ساعة لتأكيد الطلب وتحديد السعر النهائي.
                    </p>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>MahWAY - خدمة الاستيراد والتصدير والشحن الدولي</p>
            <p>واتساب: +62821-2872-3094 | البريد: mahway.contact@gmail.com</p>
            <p>جميع الحقوق محفوظة © 2025</p>
        </div>
    </div>
</body>
</html>
HTML;

// Replace template variables
$currentDateTime = date('Y-m-d H:i:s');
$orderNumber = date('YmdHis') . rand(100, 999);

$emailTemplate = str_replace('{$currentDateTime}', $currentDateTime, $emailTemplate);
$emailTemplate = str_replace('{$orderNumber}', $orderNumber, $emailTemplate);

// Payment method text
$paymentMethodText = ($paymentMethod == '50-50') 
    ? 'الدفع عند التواصل (50% الآن + 50% عند الاستلام)' 
    : 'الدفع الكامل 100% (أولوية التجهيز)';

$emailTemplate = str_replace('{$paymentMethod == \'100\'}<span class="priority">أولوية</span>{/if}', 
    ($paymentMethod == '100') ? '<span class="priority">أولوية</span>' : '', $emailTemplate);

// Send email
$mailSent = mail($to, $subject, $emailTemplate, $headers);

if ($mailSent) {
    // Log the request to a file (optional)
    $logData = [
        'timestamp' => $currentDateTime,
        'order_number' => 'MAH-' . $orderNumber,
        'customer_name' => $fullName,
        'customer_email' => $email,
        'customer_phone' => $phone,
        'product_link' => $productLink,
        'payment_method' => $paymentMethod,
        'status' => 'pending'
    ];
    
    $logFile = __DIR__ . '/../logs/requests-' . date('Y-m-d') . '.json';
    $logDir = dirname($logFile);
    
    // Create logs directory if it doesn't exist
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    // Read existing logs
    $logs = [];
    if (file_exists($logFile)) {
        $existingLogs = file_get_contents($logFile);
        $logs = json_decode($existingLogs, true) ?: [];
    }
    
    // Add new log
    $logs[] = $logData;
    
    // Save logs
    file_put_contents($logFile, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    // Send success response
    echo json_encode([
        'success' => true,
        'message' => 'تم إرسال طلبك بنجاح',
        'order_number' => 'MAH-' . $orderNumber,
        'data' => [
            'customer_name' => $fullName,
            'customer_email' => $email,
            'estimated_response' => '24 ساعة'
        ]
    ]);
} else {
    // Log error
    error_log('Failed to send email for order: ' . 'MAH-' . $orderNumber);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.'
    ]);
}

// Function to sanitize input
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}
?>