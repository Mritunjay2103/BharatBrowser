const { useState, useEffect } = React;

function ConsentManager() {
    const [consents, setConsents] = useState({
        aiCopilot: true,
        pageAnalysis: true,
        chatHistory: true,
        identityVerification: false,
        paymentProcessing: false,
        dataSharing: false,
        telemetry: true,
        cookies: true
    });

    const [consentLogs, setConsentLogs] = useState([]);

    useEffect(() => {
        // Initialize consent service
        if (!window.consentService) {
            window.consentService = {
                getConsents: () => consents,
                updateConsent: (key, value) => {
                    const timestamp = new Date().toISOString();
                    const logEntry = {
                        timestamp,
                        action: 'consent_changed',
                        consentType: key,
                        previousValue: consents[key],
                        newValue: value,
                        userAgent: navigator.userAgent
                    };
                    
                    setConsentLogs(prev => [...prev, logEntry]);
                    setConsents(prev => ({ ...prev, [key]: value }));
                },
                getConsentLogs: () => consentLogs
            };
        }
    }, [consents, consentLogs]);

    const handleConsentChange = (consentType, value) => {
        if (window.consentService) {
            window.consentService.updateConsent(consentType, value);
        }
    };

    const exportLogs = async () => {
        if (window.electronAPI) {
            const result = await window.electronAPI.saveConsentLogs(consentLogs);
            if (result.success) {
                alert('Consent logs exported successfully!');
            } else {
                alert('Failed to export logs: ' + result.error);
            }
        }
    };

    const clearLogs = () => {
        if (confirm('Are you sure you want to clear all consent logs?')) {
            setConsentLogs([]);
        }
    };

    const consentCategories = [
        {
            title: 'AI Features',
            items: [
                {
                    key: 'aiCopilot',
                    label: 'AI Copilot',
                    description: 'Enable AI-powered page analysis and assistance'
                },
                {
                    key: 'pageAnalysis',
                    label: 'Page Analysis',
                    description: 'Allow AI to analyze webpage content for summaries'
                },
                {
                    key: 'chatHistory',
                    label: 'Chat History',
                    description: 'Store AI chat conversations for better assistance'
                }
            ]
        },
        {
            title: 'Digital Identity',
            items: [
                {
                    key: 'identityVerification',
                    label: 'Identity Verification',
                    description: 'Enable Aadhaar/DigiLocker integration for KYC'
                }
            ]
        },
        {
            title: 'Payments',
            items: [
                {
                    key: 'paymentProcessing',
                    label: 'UPI Payments',
                    description: 'Allow UPI payment processing and app integration'
                }
            ]
        },
        {
            title: 'Data & Privacy',
            items: [
                {
                    key: 'dataSharing',
                    label: 'Data Sharing',
                    description: 'Share anonymized usage data for service improvement'
                },
                {
                    key: 'telemetry',
                    label: 'Telemetry',
                    description: 'Collect performance and usage statistics'
                },
                {
                    key: 'cookies',
                    label: 'Cookies',
                    description: 'Allow websites to store cookies and local data'
                }
            ]
        }
    ];

    return React.createElement('div', { className: 'consent-manager h-100 d-flex flex-column' },
        // Header
        React.createElement('div', { className: 'consent-header p-3 bg-info text-white' },
            React.createElement('div', { className: 'd-flex align-items-center mb-2' },
                React.createElement('i', { className: 'fas fa-shield-alt me-2' }),
                React.createElement('h6', { className: 'mb-0' }, 'Consent Manager')
            ),
            React.createElement('small', null, 'Manage your privacy and data preferences')
        ),

        // Consent Controls
        React.createElement('div', { 
            className: 'consent-controls flex-grow-1 p-3',
            style: { overflowY: 'auto' }
        },
            consentCategories.map(category =>
                React.createElement('div', { key: category.title, className: 'mb-4' },
                    React.createElement('h6', { className: 'mb-3 text-primary' }, category.title),
                    category.items.map(item =>
                        React.createElement('div', { key: item.key, className: 'consent-item mb-3 p-3 border rounded' },
                            React.createElement('div', { className: 'd-flex justify-content-between align-items-start mb-2' },
                                React.createElement('div', { className: 'flex-grow-1' },
                                    React.createElement('strong', null, item.label),
                                    React.createElement('p', { className: 'text-muted small mb-0' }, item.description)
                                ),
                                React.createElement('div', { className: 'form-check form-switch' },
                                    React.createElement('input', {
                                        className: 'form-check-input',
                                        type: 'checkbox',
                                        checked: consents[item.key],
                                        onChange: (e) => handleConsentChange(item.key, e.target.checked)
                                    })
                                )
                            )
                        )
                    )
                )
            )
        ),

        // Consent Logs Section
        React.createElement('div', { className: 'consent-logs border-top' },
            React.createElement('div', { className: 'p-3 bg-light' },
                React.createElement('div', { className: 'd-flex justify-content-between align-items-center mb-2' },
                    React.createElement('h6', { className: 'mb-0' }, 'Consent Activity Log'),
                    React.createElement('div', null,
                        React.createElement('button', {
                            className: 'btn btn-sm btn-outline-primary me-2',
                            onClick: exportLogs
                        }, React.createElement('i', { className: 'fas fa-download me-1' }), 'Export'),
                        React.createElement('button', {
                            className: 'btn btn-sm btn-outline-danger',
                            onClick: clearLogs
                        }, React.createElement('i', { className: 'fas fa-trash me-1' }), 'Clear')
                    )
                ),
                React.createElement('small', { className: 'text-muted' },
                    consentLogs.length, ' consent changes recorded'
                )
            ),
            
            React.createElement('div', { 
                className: 'log-entries p-3',
                style: { maxHeight: '200px', overflowY: 'auto' }
            },
                consentLogs.length === 0 ?
                    React.createElement('div', { className: 'text-center text-muted' },
                        React.createElement('i', { className: 'fas fa-history me-1' }),
                        React.createElement('small', null, 'No consent changes recorded yet')
                    ) :
                    consentLogs.slice(-10).reverse().map((log, index) =>
                        React.createElement('div', { key: index, className: 'log-entry mb-2 p-2 bg-light rounded' },
                            React.createElement('div', { className: 'd-flex justify-content-between' },
                                React.createElement('small', { className: 'fw-bold' }, log.consentType),
                                React.createElement('small', { className: 'text-muted' },
                                    new Date(log.timestamp).toLocaleString()
                                )
                            ),
                            React.createElement('small', { className: 'text-muted' },
                                `Changed from ${log.previousValue} to ${log.newValue}`
                            )
                        )
                    )
            )
        )
    );
}

window.ConsentManager = ConsentManager;
