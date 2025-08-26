class ConsentService {
    constructor() {
        this.consents = this.loadConsents();
        this.logs = this.loadLogs();
        this.listeners = new Map();
    }

    loadConsents() {
        try {
            const stored = localStorage.getItem('browser_consents');
            return stored ? JSON.parse(stored) : this.getDefaultConsents();
        } catch (error) {
            console.error('Error loading consents:', error);
            return this.getDefaultConsents();
        }
    }

    getDefaultConsents() {
        return {
            aiCopilot: true,
            pageAnalysis: true,
            chatHistory: true,
            identityVerification: false,
            paymentProcessing: false,
            dataSharing: false,
            telemetry: true,
            cookies: true
        };
    }

    loadLogs() {
        try {
            const stored = localStorage.getItem('consent_logs');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading consent logs:', error);
            return [];
        }
    }

    saveConsents() {
        try {
            localStorage.setItem('browser_consents', JSON.stringify(this.consents));
        } catch (error) {
            console.error('Error saving consents:', error);
        }
    }

    saveLogs() {
        try {
            localStorage.setItem('consent_logs', JSON.stringify(this.logs));
        } catch (error) {
            console.error('Error saving consent logs:', error);
        }
    }

    getConsent(consentType) {
        return this.consents[consentType] || false;
    }

    getAllConsents() {
        return { ...this.consents };
    }

    updateConsent(consentType, value, reason = '') {
        const previousValue = this.consents[consentType];
        
        if (previousValue !== value) {
            this.consents[consentType] = value;
            
            const logEntry = {
                timestamp: new Date().toISOString(),
                action: 'consent_changed',
                consentType,
                previousValue,
                newValue: value,
                reason,
                userAgent: navigator.userAgent,
                sessionId: this.getSessionId()
            };
            
            this.logs.push(logEntry);
            
            this.saveConsents();
            this.saveLogs();
            
            // Notify listeners
            this.notifyListeners(consentType, value, previousValue);
            
            return true;
        }
        
        return false;
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('browser_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('browser_session_id', sessionId);
        }
        return sessionId;
    }

    logConsentAction(action, details = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            action,
            details,
            sessionId: this.getSessionId(),
            userAgent: navigator.userAgent
        };
        
        this.logs.push(logEntry);
        this.saveLogs();
    }

    getConsentLogs(filter = {}) {
        let filteredLogs = [...this.logs];
        
        if (filter.consentType) {
            filteredLogs = filteredLogs.filter(log => log.consentType === filter.consentType);
        }
        
        if (filter.action) {
            filteredLogs = filteredLogs.filter(log => log.action === filter.action);
        }
        
        if (filter.startDate) {
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(filter.startDate));
        }
        
        if (filter.endDate) {
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(filter.endDate));
        }
        
        return filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    exportLogs(format = 'json') {
        const exportData = {
            exportTimestamp: new Date().toISOString(),
            consentLogs: this.getConsentLogs(),
            currentConsents: this.getAllConsents(),
            metadata: {
                browserVersion: navigator.userAgent,
                totalLogs: this.logs.length,
                exportedBy: 'Chromium AI Browser'
            }
        };
        
        switch (format) {
            case 'json':
                return JSON.stringify(exportData, null, 2);
            case 'csv':
                return this.convertToCSV(exportData.consentLogs);
            default:
                return JSON.stringify(exportData, null, 2);
        }
    }

    convertToCSV(logs) {
        if (logs.length === 0) return 'No logs to export';
        
        const headers = Object.keys(logs[0]).join(',');
        const rows = logs.map(log => 
            Object.values(log).map(value => 
                typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
            ).join(',')
        );
        
        return [headers, ...rows].join('\n');
    }

    clearLogs() {
        const clearedCount = this.logs.length;
        this.logs = [];
        this.saveLogs();
        
        this.logConsentAction('logs_cleared', { clearedCount });
        
        return clearedCount;
    }

    addListener(consentType, callback) {
        if (!this.listeners.has(consentType)) {
            this.listeners.set(consentType, new Set());
        }
        this.listeners.get(consentType).add(callback);
    }

    removeListener(consentType, callback) {
        if (this.listeners.has(consentType)) {
            this.listeners.get(consentType).delete(callback);
        }
    }

    notifyListeners(consentType, newValue, previousValue) {
        if (this.listeners.has(consentType)) {
            this.listeners.get(consentType).forEach(callback => {
                try {
                    callback(newValue, previousValue);
                } catch (error) {
                    console.error('Error in consent listener:', error);
                }
            });
        }
    }

    // Utility methods for checking specific consent combinations
    canUseAI() {
        return this.getConsent('aiCopilot') && this.getConsent('pageAnalysis');
    }

    canProcessPayments() {
        return this.getConsent('paymentProcessing');
    }

    canVerifyIdentity() {
        return this.getConsent('identityVerification');
    }

    canShareData() {
        return this.getConsent('dataSharing');
    }

    canUseTelemetry() {
        return this.getConsent('telemetry');
    }

    canUseCookies() {
        return this.getConsent('cookies');
    }
}

// Export for use in other modules
window.consentService = new ConsentService();
