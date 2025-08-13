// Shared feedback utilities for consistent user interactions across all tools

export class FeedbackManager {
  constructor() {
    this.toastContainer = null;
    this.createToastContainer();
  }

  createToastContainer() {
    // Create toast container if it doesn't exist
    this.toastContainer = document.getElementById('toast-container');
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'toast-container';
      this.toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
      document.body.appendChild(this.toastContainer);
    }
  }

  showToast(message, type = 'success', duration = 2000) {
    const toast = document.createElement('div');
    
    const baseClasses = 'px-4 py-3 rounded-lg shadow-lg border flex items-center gap-2 text-sm font-medium transform transition-all duration-300 ease-in-out opacity-0 translate-x-full';
    let typeClasses = '';
    let icon = '';

    switch (type) {
      case 'success':
        typeClasses = 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300';
        icon = '✓';
        break;
      case 'error':
        typeClasses = 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300';
        icon = '✕';
        break;
      case 'warning':
        typeClasses = 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300';
        icon = '⚠';
        break;
      case 'info':
        typeClasses = 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300';
        icon = 'ℹ';
        break;
    }

    toast.className = `${baseClasses} ${typeClasses}`;
    toast.innerHTML = `<span class="text-lg">${icon}</span><span>${message}</span>`;

    this.toastContainer.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('opacity-0', 'translate-x-full');
    });

    // Auto-remove after duration
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-full');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);

    return toast;
  }

  showCopySuccess(customMessage = 'Copied to clipboard') {
    this.showToast(customMessage, 'success', 1500);
  }

  showCopyError(customMessage = 'Failed to copy') {
    this.showToast(customMessage, 'error', 2000);
  }

  // Standardized copy function with consistent feedback
  async copyToClipboard(text, successMessage = 'Copied to clipboard', errorMessage = 'Failed to copy') {
    try {
      await navigator.clipboard.writeText(text);
      this.showCopySuccess(successMessage);
      return true;
    } catch (err) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showCopySuccess(successMessage);
        return true;
      } catch (fallbackErr) {
        this.showCopyError(errorMessage);
        return false;
      }
    }
  }

  // Visual feedback for clickable elements
  highlightElement(element, color = '#10B981', duration = 1000) {
    const originalBg = element.style.backgroundColor;
    const originalBorder = element.style.borderColor;
    const originalColor = element.style.color;

    element.style.backgroundColor = color;
    element.style.borderColor = color;
    element.style.color = 'white';
    element.style.transition = 'all 0.15s ease-in-out';

    setTimeout(() => {
      element.style.backgroundColor = originalBg;
      element.style.borderColor = originalBorder;
      element.style.color = originalColor;
    }, duration);
  }

  // Button state management
  setButtonState(button, state, originalContent = null) {
    const states = {
      loading: {
        content: '⏳ Loading...',
        disabled: true,
        classes: 'opacity-75 cursor-not-allowed'
      },
      success: {
        content: '✓ Success',
        disabled: false,
        classes: 'bg-green-600 hover:bg-green-700'
      },
      error: {
        content: '✕ Error',
        disabled: false,
        classes: 'bg-red-600 hover:bg-red-700'
      },
      normal: {
        content: originalContent,
        disabled: false,
        classes: ''
      }
    };

    const stateConfig = states[state];
    if (!stateConfig) return;

    if (stateConfig.content && stateConfig.content !== originalContent) {
      button.textContent = stateConfig.content;
    } else if (originalContent) {
      button.textContent = originalContent;
    }
    
    button.disabled = stateConfig.disabled;
    
    // Reset classes and add new ones
    button.className = button.className.split(' ').filter(cls => 
      !cls.includes('opacity-') && 
      !cls.includes('cursor-') && 
      !cls.includes('bg-green-') && 
      !cls.includes('bg-red-') &&
      !cls.includes('hover:bg-green-') &&
      !cls.includes('hover:bg-red-')
    ).join(' ');
    
    if (stateConfig.classes) {
      button.className += ` ${stateConfig.classes}`;
    }
  }
}

// Create a global instance
export const feedback = new FeedbackManager();