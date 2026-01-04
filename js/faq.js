/**
 * ملف JavaScript للأسئلة الشائعة (FAQ)
 * MahWAY - نظام الأسئلة الشائعة التفاعلي
 */

class FAQSystem {
    constructor() {
        this.init();
    }
    
    init() {
        this.elements = {
            searchInput: document.getElementById('faqSearch'),
            categoryButtons: document.querySelectorAll('.faq-category-btn'),
            sections: document.querySelectorAll('.faq-section'),
            items: document.querySelectorAll('.faq-item'),
            questions: document.querySelectorAll('.faq-question'),
            noResults: document.getElementById('noResults')
        };
        
        this.state = {
            activeCategory: 'all',
            searchTerm: '',
            savedState: null
        };
        
        this.initAccordion();
        this.initCategoryFilter();
        this.initSearch();
        this.initTouchSupport();
        this.initKeyboardShortcuts();
        this.loadSavedState();
        this.initPrintFunctionality();
        this.initAnimations();
        this.initSearchStats();
        this.initClearButton();
    }
    
    // 1. نظام التفعيل/التعطيل (Accordion)
    initAccordion() {
        this.elements.questions.forEach(question => {
            question.addEventListener('click', (e) => {
                const item = e.currentTarget.closest('.faq-item');
                const isActive = item.classList.contains('active');
                
                // إغلاق جميع الأسئلة الأخرى
                if (!isActive) {
                    this.closeAllItems();
                }
                
                // تبديل حالة السؤال الحالي
                item.classList.toggle('active');
                
                // حفظ الحالة
                this.saveState();
            });
        });
        
        // فتح أول سؤال تلقائيًا
        if (this.elements.items.length > 0) {
            this.elements.items[0].classList.add('active');
        }
    }
    
    closeAllItems() {
        document.querySelectorAll('.faq-item.active').forEach(item => {
            item.classList.remove('active');
        });
    }
    
    // 2. تصفية حسب الفئة
    initCategoryFilter() {
        this.elements.categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.currentTarget.getAttribute('data-category');
                
                // تحديث حالة الأزرار
                this.updateActiveCategory(category);
                
                // تطبيق التصفية
                this.filterItems();
                
                // حفظ الحالة
                this.saveState();
            });
        });
    }
    
    updateActiveCategory(category) {
        this.state.activeCategory = category;
        
        this.elements.categoryButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-category') === category) {
                btn.classList.add('active');
            }
        });
    }
    
    // 3. نظام البحث
    initSearch() {
        let searchTimeout;
        
        this.elements.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            
            // إظهار مؤشر التحميل
            this.showSearchIndicator(true);
            
            searchTimeout = setTimeout(() => {
                this.state.searchTerm = e.target.value.trim().toLowerCase();
                this.filterItems();
                this.saveState();
                
                // إخفاء مؤشر التحميل
                this.showSearchIndicator(false);
            }, 300);
        });
        
        // اختصار Esc لمسح البحث
        this.elements.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSearch();
            }
        });
    }
    
    showSearchIndicator(show) {
        const searchIcon = document.querySelector('.faq-search-icon');
        if (!searchIcon) return;
        
        if (show) {
            searchIcon.classList.remove('fa-search');
            searchIcon.classList.add('fa-spinner', 'fa-spin');
        } else {
            searchIcon.classList.remove('fa-spinner', 'fa-spin');
            searchIcon.classList.add('fa-search');
        }
    }
    
    clearSearch() {
        this.elements.searchInput.value = '';
        this.state.searchTerm = '';
        this.filterItems();
        this.saveState();
        this.updateClearButton();
    }
    
    // 4. وظيفة التصفية الرئيسية
    filterItems() {
        let hasVisibleItems = false;
        
        this.elements.sections.forEach(section => {
            const sectionCategory = section.getAttribute('data-category');
            let sectionHasVisibleItems = false;
            
            // التحقق من مطابقة الفئة
            const categoryMatch = this.state.activeCategory === 'all' || 
                                 sectionCategory === this.state.activeCategory;
            
            // البحث في أسئلة هذه الفئة
            const sectionItems = section.querySelectorAll('.faq-item');
            
            sectionItems.forEach(item => {
                const questionText = item.querySelector('.faq-question h3').textContent.toLowerCase();
                const answerText = item.querySelector('.faq-answer p').textContent.toLowerCase();
                const searchData = item.getAttribute('data-search')?.toLowerCase() || '';
                
                // التحقق من مطابقة البحث
                const searchMatch = !this.state.searchTerm || 
                                   questionText.includes(this.state.searchTerm) || 
                                   answerText.includes(this.state.searchTerm) ||
                                   searchData.includes(this.state.searchTerm);
                
                // إظهار/إخفاء العنصر
                if (categoryMatch && searchMatch) {
                    item.style.display = 'flex';
                    sectionHasVisibleItems = true;
                    hasVisibleItems = true;
                } else {
                    item.style.display = 'none';
                }
            });
            
            // إظهار/إخفاء القسم بأكمله
            section.style.display = sectionHasVisibleItems ? 'block' : 'none';
        });
        
        // إظهار/إخفاء رسالة "لا توجد نتائج"
        if (this.elements.noResults) {
            if (hasVisibleItems || (!this.state.searchTerm && this.state.activeCategory === 'all')) {
                this.elements.noResults.classList.remove('show');
            } else {
                this.elements.noResults.classList.add('show');
            }
        }
        
        // تحديث الإحصائيات
        this.updateSearchStats();
    }
    
    // 5. دعم اللمس
    initTouchSupport() {
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        });
        
        document.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].screenY;
            
            // التمرير لأسفل لإغلاق جميع الأسئلة
            if (touchStartY - touchEndY > 100) {
                this.closeAllItems();
            }
        });
    }
    
    // 6. اختصارات لوحة المفاتيح
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + F للبحث
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.elements.searchInput.focus();
            }
            
            // Escape لإغلاق جميع الأسئلة
            if (e.key === 'Escape' && !this.elements.searchInput.matches(':focus')) {
                this.closeAllItems();
            }
            
            // مفاتيح الأسهم للتنقل
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                this.navigateWithArrows(e.key);
            }
        });
    }
    
    navigateWithArrows(direction) {
        const visibleItems = Array.from(this.elements.items).filter(item => 
            item.style.display !== 'none' && 
            window.getComputedStyle(item).display !== 'none'
        );
        
        if (visibleItems.length === 0) return;
        
        const currentIndex = visibleItems.findIndex(item => 
            item.classList.contains('active')
        );
        
        let nextIndex;
        if (direction === 'ArrowDown') {
            nextIndex = currentIndex < visibleItems.length - 1 ? currentIndex + 1 : 0;
        } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : visibleItems.length - 1;
        }
        
        // إغلاق جميع الأسئلة
        this.closeAllItems();
        
        // فتح السؤال الجديد
        visibleItems[nextIndex].classList.add('active');
        
        // التمرير إلى السؤال
        visibleItems[nextIndex].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
    
    // 7. حفظ/تحميل الحالة
    saveState() {
        const state = {
            category: this.state.activeCategory,
            search: this.state.searchTerm,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('mahway_faq_state', JSON.stringify(state));
        } catch (e) {
            console.log('لا يمكن حفظ حالة البحث:', e);
        }
    }
    
    loadSavedState() {
        try {
            const savedState = localStorage.getItem('mahway_faq_state');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.state.savedState = state;
                
                // تحميل الفئة
                if (state.category) {
                    this.updateActiveCategory(state.category);
                }
                
                // تحميل البحث
                if (state.search && this.elements.searchInput) {
                    this.elements.searchInput.value = state.search;
                    this.state.searchTerm = state.search.toLowerCase();
                }
                
                // تطبيق التصفية
                this.filterItems();
                
                // تحديث زر المسح
                this.updateClearButton();
            }
        } catch (e) {
            console.log('لا يمكن تحميل حالة البحث:', e);
        }
    }
    
    // 8. إحصائيات البحث
    initSearchStats() {
        this.statsElement = document.createElement('div');
        this.statsElement.className = 'faq-search-stats';
        this.statsElement.style.cssText = `
            text-align: center;
            color: var(--gray-color);
            margin: 1rem 0;
            font-size: 0.9rem;
        `;
        
        const searchBox = this.elements.searchInput?.parentNode;
        if (searchBox) {
            searchBox.parentNode.insertBefore(this.statsElement, searchBox.nextSibling);
            this.updateSearchStats();
        }
    }
    
    updateSearchStats() {
        if (!this.statsElement) return;
        
        const visibleItems = document.querySelectorAll('.faq-item[style*="display: flex"], .faq-item:not([style*="display: none"])');
        const totalItems = this.elements.items.length;
        
        this.statsElement.textContent = `عرض ${visibleItems.length} من ${totalItems} سؤال`;
    }
    
    // 9. زر مسح البحث
    initClearButton() {
        this.clearButton = document.createElement('button');
        this.clearButton.innerHTML = '<i class="fas fa-times"></i>';
        this.clearButton.className = 'faq-clear-search';
        this.clearButton.setAttribute('aria-label', 'مسح البحث');
        this.clearButton.style.cssText = `
            position: absolute;
            left: 3.5rem;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--gray-color);
            cursor: pointer;
            font-size: 1.2rem;
            display: none;
        `;
        
        const searchBox = this.elements.searchInput?.parentNode;
        if (searchBox) {
            searchBox.appendChild(this.clearButton);
            
            this.clearButton.addEventListener('click', () => {
                this.clearSearch();
            });
            
            this.updateClearButton();
            
            // تحديث حالة الزر عند الكتابة
            this.elements.searchInput.addEventListener('input', () => {
                this.updateClearButton();
            });
        }
    }
    
    updateClearButton() {
        if (!this.clearButton) return;
        
        const hasText = this.elements.searchInput.value.trim().length > 0;
        this.clearButton.style.display = hasText ? 'block' : 'none';
    }
    
    // 10. الرسومات المتحركة
    initAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        this.elements.items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            item.style.transitionDelay = `${index * 0.05}s`;
            
            setTimeout(() => {
                this.observer.observe(item);
            }, 100);
        });
    }
    
    // 11. طباعة الأسئلة
    initPrintFunctionality() {
        const printButton = document.createElement('button');
        printButton.innerHTML = '<i class="fas fa-print"></i> طباعة الأسئلة';
        printButton.className = 'btn btn-outline';
        printButton.style.cssText = `
            margin: 1rem auto;
            display: block;
        `;
        
        const contactCTA = document.querySelector('.faq-contact-cta');
        if (contactCTA) {
            contactCTA.parentNode.insertBefore(printButton, contactCTA);
            
            printButton.addEventListener('click', () => {
                this.printFAQs();
            });
        }
    }
    
    printFAQs() {
        const printWindow = window.open('', '_blank');
        const activeCategory = this.state.activeCategory;
        const categoryName = document.querySelector('.faq-category-btn.active')?.textContent || 'جميع الأسئلة';
        
        let printContent = `
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>أسئلة ${categoryName} - MahWAY</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap');
                    
                    body { 
                        font-family: 'Cairo', sans-serif; 
                        line-height: 1.6; 
                        margin: 30px; 
                        color: #333; 
                        background: #fff;
                    }
                    
                    h1 { 
                        color: #2c3e50; 
                        text-align: center; 
                        margin-bottom: 30px;
                        border-bottom: 3px solid #e74c3c;
                        padding-bottom: 15px;
                    }
                    
                    h2 { 
                        color: #3498db; 
                        border-bottom: 2px solid #f39c12; 
                        padding-bottom: 10px;
                        margin-top: 30px;
                    }
                    
                    .question { 
                        margin: 25px 0; 
                        padding: 15px;
                        border-right: 4px solid #3498db;
                        background: #f8f9fa;
                    }
                    
                    .question h3 { 
                        color: #2c3e50; 
                        margin-bottom: 10px;
                        font-size: 1.2em;
                    }
                    
                    .answer { 
                        color: #555; 
                        margin-right: 20px;
                        line-height: 1.7;
                    }
                    
                    .footer { 
                        text-align: center; 
                        margin-top: 50px; 
                        color: #777; 
                        font-size: 0.9em;
                        border-top: 1px solid #ddd;
                        padding-top: 20px;
                    }
                    
                    .header-info {
                        text-align: center;
                        margin-bottom: 30px;
                        color: #666;
                    }
                    
                    @media print {
                        @page {
                            margin: 20mm;
                        }
                        
                        body {
                            margin: 0;
                        }
                        
                        .no-print { 
                            display: none; 
                        }
                        
                        .question {
                            break-inside: avoid;
                            border: 1px solid #ddd;
                            box-shadow: none;
                        }
                    }
                </style>
            </head>
            <body>
                <h1>أسئلة ${categoryName}</h1>
                <div class="header-info">
                    <p><strong>MahWAY - خدمة الاستيراد والتصدير والشحن الدولي</strong></p>
                    <p class="no-print">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</p>
                </div>
        `;
        
        // جمع الأسئلة المرئية فقط
        const visibleSections = document.querySelectorAll('.faq-section[style*="display: block"]');
        
        if (visibleSections.length === 0) {
            printContent += '<p style="text-align: center; color: #777;">لا توجد أسئلة لعرضها</p>';
        } else {
            visibleSections.forEach(section => {
                const sectionTitle = section.querySelector('.faq-section-title').textContent;
                printContent += `<h2>${sectionTitle}</h2>`;
                
                const visibleItems = section.querySelectorAll('.faq-item[style*="display: flex"]');
                
                if (visibleItems.length === 0) {
                    printContent += '<p style="color: #777; text-align: center;">لا توجد أسئلة في هذه الفئة</p>';
                } else {
                    visibleItems.forEach(item => {
                        const question = item.querySelector('.faq-question h3').textContent;
                        const answer = item.querySelector('.faq-answer p').textContent;
                        
                        printContent += `
                            <div class="question">
                                <h3>${question}</h3>
                                <div class="answer">${answer}</div>
                            </div>
                        `;
                    });
                }
            });
        }
        
        printContent += `
                <div class="footer">
                    <p><strong>معلومات التواصل:</strong></p>
                    <p>واتساب: +6282128723094 | البريد: mahway.contact@gmail.com</p>
                    <p>الموقع: https://mahway.com</p>
                    <p>© ${new Date().getFullYear()} جميع الحقوق محفوظة لشركة MahWAY</p>
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // تأخير الطباعة قليلاً لضمان تحميل المحتوى
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }
    
    // 12. وظائف مساعدة
    resetAll() {
        this.state.activeCategory = 'all';
        this.state.searchTerm = '';
        
        this.updateActiveCategory('all');
        this.elements.searchInput.value = '';
        this.filterItems();
        this.saveState();
        this.updateClearButton();
    }
    
    exportToJSON() {
        const data = {
            metadata: {
                exportedAt: new Date().toISOString(),
                totalQuestions: this.elements.items.length,
                categories: Array.from(this.elements.sections).map(s => s.getAttribute('data-category'))
            },
            questions: []
        };
        
        this.elements.sections.forEach(section => {
            const category = section.getAttribute('data-category');
            const sectionTitle = section.querySelector('.faq-section-title').textContent;
            
            const sectionItems = section.querySelectorAll('.faq-item');
            sectionItems.forEach(item => {
                const question = item.querySelector('.faq-question h3').textContent;
                const answer = item.querySelector('.faq-answer p').textContent;
                
                data.questions.push({
                    category,
                    section: sectionTitle,
                    question,
                    answer
                });
            });
        });
        
        return JSON.stringify(data, null, 2);
    }
    
    // 13. تهيئة الأحداث الإضافية
    initAdditionalEvents() {
        // تحديث الإحصائيات عند تغيير الفئة
        this.elements.categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                setTimeout(() => {
                    this.updateSearchStats();
                }, 100);
            });
        });
        
        // تحديث الإحصائيات عند البحث
        this.elements.searchInput.addEventListener('input', () => {
            setTimeout(() => {
                this.updateSearchStats();
            }, 350);
        });
        
        // إغلاق جميع الأسئلة عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.faq-item') && 
                !e.target.closest('.faq-category-btn') && 
                !e.target.closest('.faq-search-input')) {
                this.closeAllItems();
            }
        });
    }
}

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // التحقق مما إذا كانت صفحة الأسئلة الشائعة
    const faqContainer = document.querySelector('.faq-container');
    if (!faqContainer) return;
    
    // تهيئة نظام الأسئلة الشائعة
    window.faqSystem = new FAQSystem();
    
    // إضافة زر إعادة الضبط
    const resetButton = document.createElement('button');
    resetButton.innerHTML = '<i class="fas fa-redo"></i> إعادة الضبط';
    resetButton.className = 'btn btn-outline';
    resetButton.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 20px;
        z-index: 998;
        padding: 10px 15px;
        font-size: 0.9rem;
    `;
    
    document.body.appendChild(resetButton);
    
    resetButton.addEventListener('click', () => {
        window.faqSystem?.resetAll();
    });
    
    // إضافة زر التصدير (للأغراض التنموية)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const exportButton = document.createElement('button');
        exportButton.innerHTML = '<i class="fas fa-download"></i> تصدير JSON';
        exportButton.className = 'btn btn-outline';
        exportButton.style.cssText = `
            position: fixed;
            bottom: 150px;
            left: 20px;
            z-index: 998;
            padding: 10px 15px;
            font-size: 0.9rem;
            background: #27ae60;
            color: white;
            border-color: #27ae60;
        `;
        
        document.body.appendChild(exportButton);
        
        exportButton.addEventListener('click', () => {
            const data = window.faqSystem?.exportToJSON();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mahway-faq-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
    
    // تحسين تجربة الجوال
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
        
        // زيادة حجم منطقة النقر للأسئلة
        document.querySelectorAll('.faq-question').forEach(question => {
            question.style.padding = '20px 15px';
        });
    }
    
    // تحميل المزيد من الأسئلة تلقائيًا عند الوصول لنهاية الصفحة
    let isLoading = false;
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const pageHeight = document.documentElement.scrollHeight;
        
        if (scrollPosition >= pageHeight - 100 && !isLoading) {
            // يمكن إضافة هنا وظيفة لتحميل المزيد من الأسئلة
            // من خادم إذا كان هناك الكثير من الأسئلة
        }
    });
});

// تصدير الفئة للاستخدام الخارجي
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FAQSystem;
}
