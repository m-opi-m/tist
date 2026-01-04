<?php
/**
 * MahWAY Configuration File
 * DO NOT SHARE THIS FILE PUBLICLY
 */

// Database Configuration (if using database)
define('DB_HOST', 'localhost');
define('DB_NAME', 'mahway_db');
define('DB_USER', 'mahway_user');
define('DB_PASS', 'your_secure_password_here');

// Email Configuration
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'mahway.contact@gmail.com');
define('SMTP_PASS', 'your_email_password_here');
define('EMAIL_FROM', 'MahWAY <noreply@mahway.com>');

// Site Configuration
define('SITE_URL', 'https://mahway.com');
define('SITE_NAME', 'MahWAY');
define('SITE_DESCRIPTION', 'خدمة استيراد وتصدير وشحن دولي');

// Security Configuration
define('SECRET_KEY', 'your_secret_key_here');
define('ENCRYPTION_KEY', 'your_encryption_key_here');
define('ALLOWED_ORIGINS', ['https://mahway.com', 'https://www.mahway.com']);

// API Configuration
define('API_KEY', 'your_api_key_here');
define('API_SECRET', 'your_api_secret_here');

// Payment Configuration
define('PAYMENT_GATEWAY', 'stripe'); // stripe, paypal, etc.
define('CURRENCY', 'EGP');
define('TAX_RATE', 0.14); // 14% VAT

// Shipping Configuration
define('SHIPPING_PARTNER', 'aramex'); // aramex, dhl, etc.
define('DEFAULT_COUNTRY', 'EG');
define('WAREHOUSE_LOCATION', 'Cairo, Egypt');

// Error Reporting
if (ENVIRONMENT === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Timezone
date_default_timezone_set('Africa/Cairo');

// Character Set
header('Content-Type: text/html; charset=utf-8');

// CORS Headers
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], ALLOWED_ORIGINS)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
}

// Start Session
session_start([
    'cookie_lifetime' => 86400, // 24 hours
    'cookie_secure' => true,
    'cookie_httponly' => true,
    'cookie_samesite' => 'Strict'
]);

// CSRF Protection
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Rate Limiting
function rateLimit($key, $limit = 60, $timeout = 3600) {
    $ip = $_SERVER['REMOTE_ADDR'];
    $key = "rate_limit_{$key}_{$ip}";
    
    if (!isset($_SESSION[$key])) {
        $_SESSION[$key] = [
            'count' => 1,
            'time' => time()
        ];
        return true;
    }
    
    $data = $_SESSION[$key];
    
    if (time() - $data['time'] > $timeout) {
        $_SESSION[$key] = [
            'count' => 1,
            'time' => time()
        ];
        return true;
    }
    
    if ($data['count'] < $limit) {
        $_SESSION[$key]['count']++;
        return true;
    }
    
    return false;
}

// Database Connection
function getDBConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return null;
    }
}

// Sanitize Input
function sanitize($input) {
    if (is_array($input)) {
        return array_map('sanitize', $input);
    }
    
    $input = trim($input);
    $input = stripslashes($input);
    $input = htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    
    return $input;
}

// Validate Email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Validate Phone
function validatePhone($phone) {
    return preg_match('/^[\+]?[0-9\s\-\(\)]{8,}$/', $phone);
}

// Validate URL
function validateURL($url) {
    return filter_var($url, FILTER_VALIDATE_URL);
}

// Generate Order Number
function generateOrderNumber() {
    return 'MAH-' . date('YmdHis') . rand(100, 999);
}

// Log Activity
function logActivity($action, $details = []) {
    $logFile = __DIR__ . '/logs/activity-' . date('Y-m-d') . '.log';
    $logDir = dirname($logFile);
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'],
        'user_agent' => $_SERVER['HTTP_USER_AGENT'],
        'action' => $action,
        'details' => $details
    ];
    
    file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND);
}

// Send Email with SMTP
function sendEmailSMTP($to, $subject, $body, $attachments = []) {
    require_once __DIR__ . '/PHPMailer/PHPMailer.php';
    require_once __DIR__ . '/PHPMailer/SMTP.php';
    require_once __DIR__ . '/PHPMailer/Exception.php';
    
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    
    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USER;
        $mail->Password = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = SMTP_PORT;
        
        // Recipients
        $mail->setFrom(EMAIL_FROM);
        $mail->addAddress($to);
        
        // Attachments
        foreach ($attachments as $attachment) {
            $mail->addAttachment($attachment['path'], $attachment['name']);
        }
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->AltBody = strip_tags($body);
        $mail->CharSet = 'UTF-8';
        
        return $mail->send();
    } catch (Exception $e) {
        error_log("Email could not be sent. Error: {$mail->ErrorInfo}");
        return false;
    }
}

// API Response Helper
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// Error Response
function errorResponse($message, $statusCode = 400) {
    jsonResponse([
        'success' => false,
        'message' => $message,
        'timestamp' => time()
    ], $statusCode);
}

// Success Response
function successResponse($data = [], $message = 'Success') {
    jsonResponse([
        'success' => true,
        'message' => $message,
        'data' => $data,
        'timestamp' => time()
    ]);
}

// Check if request is AJAX
function isAjaxRequest() {
    return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}

// Get Client IP
function getClientIP() {
    $ip = $_SERVER['REMOTE_ADDR'];
    
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    }
    
    return $ip;
}

// Generate CSRF Token
function generateCSRFToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// Verify CSRF Token
function verifyCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && 
           hash_equals($_SESSION['csrf_token'], $token);
}

// Encrypt Data
function encryptData($data, $key = ENCRYPTION_KEY) {
    $cipher = "AES-256-CBC";
    $iv_length = openssl_cipher_iv_length($cipher);
    $iv = openssl_random_pseudo_bytes($iv_length);
    $encrypted = openssl_encrypt($data, $cipher, $key, 0, $iv);
    return base64_encode($encrypted . '::' . $iv);
}

// Decrypt Data
function decryptData($data, $key = ENCRYPTION_KEY) {
    $cipher = "AES-256-CBC";
    list($encrypted_data, $iv) = explode('::', base64_decode($data), 2);
    return openssl_decrypt($encrypted_data, $cipher, $key, 0, $iv);
}

// Compress Image
function compressImage($source, $destination, $quality = 75) {
    $info = getimagesize($source);
    
    if ($info['mime'] == 'image/jpeg') {
        $image = imagecreatefromjpeg($source);
    } elseif ($info['mime'] == 'image/png') {
        $image = imagecreatefrompng($source);
    } elseif ($info['mime'] == 'image/gif') {
        $image = imagecreatefromgif($source);
    } else {
        return false;
    }
    
    imagejpeg($image, $destination, $quality);
    imagedestroy($image);
    
    return true;
}

// Generate Sitemap
function generateSitemap() {
    $pages = [
        '' => date('Y-m-d'),
        'about.html' => date('Y-m-d'),
        'services.html' => date('Y-m-d'),
        'payment.html' => date('Y-m-d'),
        'contact.html' => date('Y-m-d'),
        'faq.html' => date('Y-m-d'),
        'request-form.html' => date('Y-m-d'),
        'privacy.html' => date('Y-m-d'),
        'terms.html' => date('Y-m-d')
    ];
    
    $sitemap = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
    $sitemap .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;
    
    foreach ($pages as $page => $lastmod) {
        $sitemap .= '  <url>' . PHP_EOL;
        $sitemap .= '    <loc>' . SITE_URL . '/' . $page . '</loc>' . PHP_EOL;
        $sitemap .= '    <lastmod>' . $lastmod . '</lastmod>' . PHP_EOL;
        $sitemap .= '    <changefreq>weekly</changefreq>' . PHP_EOL;
        $sitemap .= '    <priority>' . ($page == '' ? '1.0' : '0.8') . '</priority>' . PHP_EOL;
        $sitemap .= '  </url>' . PHP_EOL;
    }
    
    $sitemap .= '</urlset>';
    
    file_put_contents(__DIR__ . '/sitemap.xml', $sitemap);
}

// Auto-load classes
spl_autoload_register(function ($class) {
    $file = __DIR__ . '/classes/' . str_replace('\\', '/', $class) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

// Maintenance Mode
if (file_exists(__DIR__ . '/maintenance.lock') && !isset($_SESSION['admin'])) {
    http_response_code(503);
    include __DIR__ . '/maintenance.html';
    exit;
}

// Environment Detection
function isLocalhost() {
    return in_array($_SERVER['REMOTE_ADDR'], ['127.0.0.1', '::1']) || 
           strpos($_SERVER['HTTP_HOST'], 'localhost') !== false;
}

// Cache Control
header("Cache-Control: public, max-age=3600");
header("Expires: " . gmdate('D, d M Y H:i:s', time() + 3600) . ' GMT');

// Security Headers
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: strict-origin-when-cross-origin");
header("Permissions-Policy: geolocation=(), microphone=(), camera=()");

// Check for required PHP extensions
$required_extensions = ['pdo', 'pdo_mysql', 'openssl', 'mbstring', 'json'];
foreach ($required_extensions as $extension) {
    if (!extension_loaded($extension)) {
        error_log("Missing required PHP extension: $extension");
        if (ENVIRONMENT === 'development') {
            die("Missing required PHP extension: $extension");
        }
    }
}

// Load environment-specific configuration
$env_file = __DIR__ . '/.env';
if (file_exists($env_file)) {
    $env_vars = parse_ini_file($env_file);
    foreach ($env_vars as $key => $value) {
        putenv("$key=$value");
        $_ENV[$key] = $value;
    }
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
?>