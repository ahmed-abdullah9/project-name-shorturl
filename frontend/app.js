class URLShortener {
    constructor() {
        this.form = document.getElementById('shortenForm');
        this.originalUrlInput = document.getElementById('originalUrl');
        this.resultDiv = document.getElementById('result');
        this.shortUrlInput = document.getElementById('shortUrl');
        this.copyBtn = document.getElementById('copyBtn');
        this.errorDiv = document.getElementById('error');
        this.loadingDiv = document.getElementById('loading');
        this.clickCountSpan = document.getElementById('clickCount');
        
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const originalUrl = this.originalUrlInput.value.trim();
        if (!originalUrl) {
            this.showError('Please enter a URL');
            return;
        }
        
        if (!this.isValidUrl(originalUrl)) {
            this.showError('Please enter a valid URL');
            return;
        }
        
        this.showLoading(true);
        this.hideError();
        this.hideResult();
        
        try {
            const response = await fetch('/api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: originalUrl })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to shorten URL');
            }
            
            this.showResult(data);
            
        } catch (error) {
            console.error('Error:', error);
            this.showError(error.message || 'Failed to shorten URL. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }
    
    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }
    
    showResult(data) {
        const shortUrl = `${window.location.origin}/${data.shortCode}`;
        this.shortUrlInput.value = shortUrl;
        this.clickCountSpan.textContent = `${data.clickCount || 0} clicks`;
        
        this.resultDiv.classList.remove('hidden');
        this.resultDiv.classList.add('fade-in');
    }
    
    hideResult() {
        this.resultDiv.classList.add('hidden');
        this.resultDiv.classList.remove('fade-in');
    }
    
    showError(message) {
        this.errorDiv.textContent = message;
        this.errorDiv.classList.remove('hidden');
        this.errorDiv.classList.add('fade-in');
    }
    
    hideError() {
        this.errorDiv.classList.add('hidden');
        this.errorDiv.classList.remove('fade-in');
    }
    
    showLoading(show) {
        if (show) {
            this.loadingDiv.classList.remove('hidden');
        } else {
            this.loadingDiv.classList.add('hidden');
        }
    }
    
    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.shortUrlInput.value);
            
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = 'Copied!';
            this.copyBtn.style.background = '#10b981';
            
            setTimeout(() => {
                this.copyBtn.textContent = originalText;
                this.copyBtn.style.background = '';
            }, 2000);
            
        } catch (err) {
            // Fallback for older browsers
            this.shortUrlInput.select();
            document.execCommand('copy');
            
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = 'Copied!';
            
            setTimeout(() => {
                this.copyBtn.textContent = originalText;
            }, 2000);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new URLShortener();
});