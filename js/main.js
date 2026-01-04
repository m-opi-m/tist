// ===== MahWAY Main JavaScript =====

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== Mobile Menu Toggle =====
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            
            // Toggle aria-expanded attribute
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            
            // Prevent scrolling when menu is open
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }
    
    // ===== Back to Top Button =====
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ===== Header Scroll Effect =====
    const header = document.getElementById('header');
    
    if (header) {
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                header.style.backgroundColor = 'var(--light-color)';
                header.style.backdropFilter = 'none';
            }
            
            // Hide/show header on scroll
            if (scrollTop > lastScrollTop && scrollTop > 200) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
    }
    
    // ===== Smooth Scrolling for Anchor Links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ===== Form Validation Helper =====
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Basic validation
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    showError(field, 'هذا الحقل مطلوب');
                } else {
                    clearError(field);
                }
                
                // Email validation
                if (field.type === 'email' && field.value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(field.value)) {
                        isValid = false;
                        showError(field, 'البريد الإلكتروني غير صحيح');
                    }
                }
                
                // Phone validation
                if (field.type === 'tel' && field.value.trim()) {
                    const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
                    if (!phoneRegex.test(field.value)) {
                        isValid = false;
                        showError(field, 'رقم الهاتف غير صحيح');
                    }
                }
                
                // URL validation for product links
                if (field.name === 'productLink' && field.value.trim()) {
                    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                    if (!urlRegex.test(field.value)) {
                        isValid = false;
                        showError(field, 'الرابط غير صحيح');
                    }
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                
                // Scroll to first error
                const firstError = form.querySelector('.error');
                if (firstError) {
                    const headerHeight = header ? header.offsetHeight : 0;
                    const errorPosition = firstError.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                    
                    window.scrollTo({
                        top: errorPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    function showError(field, message) {
        clearError(field);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error';
        errorElement.textContent = message;
        errorElement.style.color = 'var(--danger-color)';
        errorElement.style.fontSize = '0.9rem';
        errorElement.style.marginTop = '0.25rem';
        
        field.style.borderColor = 'var(--danger-color)';
        field.parentNode.appendChild(errorElement);
    }
    
    function clearError(field) {
        field.style.borderColor = '';
        
        const existingError = field.parentNode.querySelector('.error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    // ===== Real-time Input Validation =====
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                showError(this, 'هذا الحقل مطلوب');
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                clearError(this);
            }
        });
    });
    
    // ===== Lazy Loading Images =====
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        lazyImages.forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    }
    
    // ===== Counter Animation =====
    const counters = document.querySelectorAll('.counter');
    
    if (counters.length > 0) {
        const observerOptions = {
            threshold: 0.5
        };
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.dataset.target);
                    const duration = parseInt(counter.dataset.duration) || 2000;
                    
                    animateCounter(counter, target, duration);
                    counterObserver.unobserve(counter);
                }
            });
        }, observerOptions);
        
        counters.forEach(counter => counterObserver.observe(counter));
    }
    
    function animateCounter(element, target, duration) {
        let start = 0;
        const increment = target / (duration / 16); // 60fps
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start).toLocaleString();
            }
        }, 16);
    }
    
    // ===== FAQ Accordion =====
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const answer = item.querySelector('.faq-answer');
            const icon = question.querySelector('i');
            
            // Close other items
            document.querySelectorAll('.faq-item.active').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.maxHeight = null;
                    otherItem.querySelector('i').classList.remove('fa-minus');
                    otherItem.querySelector('i').classList.add('fa-plus');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
            
            if (item.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-minus');
            } else {
                answer.style.maxHeight = null;
                icon.classList.remove('fa-minus');
                icon.classList.add('fa-plus');
            }
        });
    });
    
    // ===== Newsletter Subscription =====
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
            submitBtn.disabled = true;
            
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Success
                showNotification('تم الاشتراك بنجاح! شكراً لك.', 'success');
                this.reset();
            } catch (error) {
                // Error
                showNotification('حدث خطأ. يرجى المحاولة مرة أخرى.', 'error');
            } finally {
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // ===== Notification System =====
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" aria-label="إغلاق">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto remove after 5 seconds
        const autoRemove = setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemove);
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }
    
    // ===== Cookie Consent =====
    if (!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => {
            const cookieConsent = document.createElement('div');
            cookieConsent.className = 'cookie-consent';
            cookieConsent.innerHTML = `
                <div class="cookie-content">
                    <p>نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا. باستخدامك لموقعنا، فإنك توافق على <a href="privacy.html">سياسة الخصوصية</a>.</p>
                    <div class="cookie-buttons">
                        <button class="btn btn-primary accept-cookies">موافق</button>
                        <button class="btn btn-outline reject-cookies">رفض</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(cookieConsent);
            
            // Show after a delay
            setTimeout(() => {
                cookieConsent.classList.add('show');
            }, 1000);
            
            // Accept cookies
            cookieConsent.querySelector('.accept-cookies').addEventListener('click', () => {
                localStorage.setItem('cookiesAccepted', 'true');
                cookieConsent.classList.remove('show');
                setTimeout(() => {
                    if (cookieConsent.parentNode) {
                        cookieConsent.parentNode.removeChild(cookieConsent);
                    }
                }, 300);
            });
            
            // Reject cookies
            cookieConsent.querySelector('.reject-cookies').addEventListener('click', () => {
                localStorage.setItem('cookiesAccepted', 'false');
                cookieConsent.classList.remove('show');
                setTimeout(() => {
                    if (cookieConsent.parentNode) {
                        cookieConsent.parentNode.removeChild(cookieConsent);
                    }
                }, 300);
            });
        }, 2000);
    }
    
    // ===== Add CSS for Notifications and Cookie Consent =====
    const dynamicStyles = document.createElement('style');
    dynamicStyles.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            max-width: 400px;
            transform: translateX(calc(100% + 20px));
            transition: transform 0.3s ease;
            z-index: 10000;
            border-right: 4px solid var(--info-color);
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification-success {
            border-right-color: var(--success-color);
        }
        
        .notification-error {
            border-right-color: var(--danger-color);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--gray-color);
            cursor: pointer;
            padding: 0.25rem;
            font-size: 1.2rem;
            transition: var(--transition-fast);
        }
        
        .notification-close:hover {
            color: var(--dark-color);
        }
        
        .cookie-consent {
            position: fixed;
            bottom: 0;
            right: 0;
            left: 0;
            background: var(--primary-color);
            color: white;
            padding: 1.5rem;
            box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.2);
            transform: translateY(100%);
            transition: transform 0.3s ease;
            z-index: 10000;
        }
        
        .cookie-consent.show {
            transform: translateY(0);
        }
        
        .cookie-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
        }
        
        .cookie-content p {
            flex: 1;
            min-width: 300px;
            margin: 0;
            color: rgba(255, 255, 255, 0.9);
        }
        
        .cookie-content a {
            color: var(--accent-color);
            text-decoration: underline;
        }
        
        .cookie-buttons {
            display: flex;
            gap: 0.5rem;
        }
        
        @media (max-width: 767px) {
            .notification {
                top: auto;
                bottom: 20px;
                right: 20px;
                left: 20px;
                max-width: none;
            }
            
            .cookie-content {
                flex-direction: column;
                text-align: center;
            }
            
            .cookie-content p {
                min-width: auto;
            }
        }
    `;
    
    document.head.appendChild(dynamicStyles);
    
    // ===== Initialize AOS (Animate On Scroll) =====
    function initAOS() {
        const elements = document.querySelectorAll('.feature-card, .step, .country, .service-card');
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);
        
        elements.forEach(el => observer.observe(el));
    }
    
    initAOS();
    
    // ===== Add Loading State to All Forms =====
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
                submitBtn.disabled = true;
            }
        });
    });
    
    // ===== Theme Toggle (Optional) =====
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.setAttribute('aria-label', 'تبديل الوضع الليلي');
    themeToggle.style.position = 'fixed';
    themeToggle.style.bottom = '100px';
    themeToggle.style.right = '20px';
    themeToggle.style.width = '50px';
    themeToggle.style.height = '50px';
    themeToggle.style.borderRadius = '50%';
    themeToggle.style.backgroundColor = 'var(--secondary-color)';
    themeToggle.style.color = 'white';
    themeToggle.style.border = 'none';
    themeToggle.style.cursor = 'pointer';
    themeToggle.style.zIndex = '999';
    themeToggle.style.boxShadow = 'var(--shadow-md)';
    themeToggle.style.display = 'flex';
    themeToggle.style.alignItems = 'center';
    themeToggle.style.justifyContent = 'center';
    themeToggle.style.fontSize = '1.2rem';
    
    // Check for saved theme
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    themeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });
    
    document.body.appendChild(themeToggle);
    
    // ===== Dark Theme Styles =====
    const darkThemeStyles = document.createElement('style');
    darkThemeStyles.textContent = `
        [data-theme="dark"] {
            --light-color: #1a1a1a;
            --dark-color: #ffffff;
            --light-gray: #2d2d2d;
            --gray-color: #b0b0b0;
            --border-color: #404040;
        }
        
        [data-theme="dark"] body {
            background-color: #121212;
            color: #e0e0e0;
        }
        
        [data-theme="dark"] .header {
            background-color: rgba(26, 26, 26, 0.95);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        [data-theme="dark"] .feature-card,
        [data-theme="dark"] .step,
        [data-theme="dark"] .country {
            background-color: #2d2d2d;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        [data-theme="dark"] .notification {
            background-color: #2d2d2d;
            color: #e0e0e0;
        }
    `;
    document.head.appendChild(darkThemeStyles);
});

// ===== Service Worker Registration =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registered:', registration);
        }).catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}

// ===== Performance Monitoring =====
if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            console.log(`[Performance] ${entry.name}: ${entry.duration}ms`);
        }
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
}

// ===== Error Tracking =====
window.addEventListener('error', (event) => {
    console.error('[Error]', event.error);
    
    // You can send this to your error tracking service
    // Example: sendToAnalytics('error', { message: event.message, filename: event.filename });
});

// ===== Unhandled Promise Rejection =====
window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise Rejection]', event.reason);
});

// ===== Export functions for module usage =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showNotification,
        animateCounter
    };
}
    // ===== الأسئلة الشائعة (FAQ) =====
    const faqContainer = document.querySelector('.faq-container');
    
    if (faqContainer) {
        // تهيئة نظام الأسئلة الشائعة البسيط
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                const item = this.closest('.faq-item');
                const isActive = item.classList.contains('active');
                
                // إغلاق جميع الأسئلة الأخرى
                if (!isActive) {
                    document.querySelectorAll('.faq-item.active').forEach(otherItem => {
                        otherItem.classList.remove('active');
                    });
                }
                
                // تبديل حالة السؤال الحالي
                item.classList.toggle('active');
                
                // تحريك الأيقونة
                const icon = this.querySelector('i');
                if (item.classList.contains('active')) {
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                } else {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                }
            });
        });
        
        // فتح أول سؤال تلقائيًا
        if (faqQuestions.length > 0) {
            const firstItem = faqQuestions[0].closest('.faq-item');
            firstItem.classList.add('active');
            const firstIcon = faqQuestions[0].querySelector('i');
            firstIcon.classList.remove('fa-chevron-down');
            firstIcon.classList.add('fa-chevron-up');
        }
        
        // البحث في الأسئلة (إذا كان هناك حقل بحث)
        const faqSearch = document.getElementById('faqSearch');
        if (faqSearch) {
            faqSearch.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const items = document.querySelectorAll('.faq-item');
                
                items.forEach(item => {
                    const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
                    const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
                    
                    if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
    }
