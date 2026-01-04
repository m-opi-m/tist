// ===== Form Validation Utility =====

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;
        
        this.init();
    }
    
    init() {
        // Add real-time validation
        this.addRealTimeValidation();
        
        // Add form submission handler
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }
    
    addRealTimeValidation() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Validate on blur
            input.addEventListener('blur', () => this.validateField(input));
            
            // Clear error on input
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Required validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'هذا الحقل مطلوب';
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'البريد الإلكتروني غير صحيح';
            }
        }
        
        // Phone validation
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'رقم الهاتف غير صحيح';
            }
        }
        
        // URL validation
        if (field.type === 'url' && value) {
            try {
                new URL(value);
            } catch (error) {
                isValid = false;
                errorMessage = 'الرابط غير صحيح';
            }
        }
        
        // Number validation
        if (field.type === 'number' && value) {
            const min = field.getAttribute('min');
            const max = field.getAttribute('max');
            
            if (min && parseInt(value) < parseInt(min)) {
                isValid = false;
                errorMessage = `القيمة يجب أن تكون ${min} أو أكثر`;
            }
            
            if (max && parseInt(value) > parseInt(max)) {
                isValid = false;
                errorMessage = `القيمة يجب أن تكون ${max} أو أقل`;
            }
        }
        
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }
        
        return isValid;
    }
    
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        
        field.classList.add('error');
        field.parentNode.appendChild(errorElement);
        
        // Add ARIA attributes
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', `error-${field.id}`);
        errorElement.id = `error-${field.id}`;
    }
    
    clearFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
    }
    
    validateAllFields() {
        const fields = this.form.querySelectorAll('input, textarea, select');
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        
        // Validate all fields
        if (!this.validateAllFields()) {
            // Scroll to first error
            const firstError = this.form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                firstError.focus();
            }
            
            // Show notification
            this.showNotification('يرجى تصحيح الأخطاء في النموذج', 'error');
            return;
        }
        
        // Disable submit button
        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
        submitButton.disabled = true;
        
        try {
            // Prepare form data
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData);
            
            // Send request
            const response = await this.sendRequest(data);
            
            if (response.success) {
                // Show success message
                this.showNotification(response.message, 'success');
                
                // Reset form
                this.form.reset();
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Dispatch custom event
                this.form.dispatchEvent(new CustomEvent('formSuccess', { 
                    detail: response 
                }));
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            // Show error message
            this.showNotification(error.message || 'حدث خطأ أثناء إرسال النموذج', 'error');
            
            // Dispatch custom event
            this.form.dispatchEvent(new CustomEvent('formError', { 
                detail: { error: error.message } 
            }));
        } finally {
            // Restore submit button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    }
    
    async sendRequest(data) {
        // Check if using PHP endpoint
        const isPhpEndpoint = this.form.action.includes('.php');
        
        if (isPhpEndpoint) {
            // Send to PHP endpoint
            const response = await fetch(this.form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            return await response.json();
        } else {
            // Simulate API call for demo
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        message: 'تم إرسال النموذج بنجاح!',
                        data: data
                    });
                }, 2000);
            });
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        // Set icon based on type
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" aria-label="إغلاق">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Show with animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Auto remove after 5 seconds
        const autoRemove = setTimeout(() => {
            this.removeNotification(notification);
        }, 5000);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemove);
            this.removeNotification(notification);
        });
        
        return notification;
    }
    
    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// Initialize form validators
document.addEventListener('DOMContentLoaded', () => {
    // Product request form
    const productForm = document.getElementById('productRequestForm');
    if (productForm) {
        new FormValidator('productRequestForm');
    }
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        new FormValidator('contactForm');
    }
    
    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        new FormValidator('newsletterForm');
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}
