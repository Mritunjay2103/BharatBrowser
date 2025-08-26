const { useState, useEffect } = React;

function App() {
    const [sidebarComponent, setSidebarComponent] = useState('ai');
    const [showSidebar, setShowSidebar] = useState(true);

    useEffect(() => {
        // Set up IPC listeners
        if (window.electronAPI) {
            window.electronAPI.onToggleAICopilot(() => {
                setSidebarComponent('ai');
                setShowSidebar(true);
            });

            window.electronAPI.onToggleConsentManager(() => {
                setSidebarComponent('consent');
                setShowSidebar(true);
            });

            window.electronAPI.onOpenDigitalIdentity(() => {
                setSidebarComponent('identity');
                setShowSidebar(true);
            });

            window.electronAPI.onOpenUPIPayments(() => {
                setSidebarComponent('upi');
                setShowSidebar(true);
            });

            window.electronAPI.onExportConsentLogs(() => {
                if (window.consentService) {
                    const logs = window.consentService.getConsentLogs();
                    window.electronAPI.saveConsentLogs(logs);
                }
            });
        }

        return () => {
            if (window.electronAPI) {
                window.electronAPI.removeAllListeners('toggle-ai-copilot');
                window.electronAPI.removeAllListeners('toggle-consent-manager');
                window.electronAPI.removeAllListeners('open-digital-identity');
                window.electronAPI.removeAllListeners('open-upi-payments');
                window.electronAPI.removeAllListeners('export-consent-logs');
            }
        };
    }, []);

    const renderSidebarComponent = () => {
        switch (sidebarComponent) {
            case 'ai':
                return React.createElement(AICopilot);
            case 'consent':
                return React.createElement(ConsentManager);
            case 'identity':
                return React.createElement(DigitalIdentity);
            case 'upi':
                return React.createElement(UPIPayments);
            default:
                return React.createElement(AICopilot);
        }
    };

    return React.createElement('div', { className: 'app-container' },
        React.createElement('div', { className: 'browser-content' },
            React.createElement(Browser, { 
                onSidebarToggle: () => setShowSidebar(!showSidebar),
                onSidebarChange: setSidebarComponent 
            }),
            showSidebar && React.createElement('div', { className: 'sidebar' },
                React.createElement('div', { className: 'sidebar-header p-3 border-bottom' },
                    React.createElement('div', { className: 'd-flex justify-content-between align-items-center' },
                        React.createElement('h6', { className: 'mb-0' },
                            sidebarComponent === 'ai' ? 'AI Copilot' :
                            sidebarComponent === 'consent' ? 'Consent Manager' :
                            sidebarComponent === 'identity' ? 'Digital Identity' :
                            sidebarComponent === 'upi' ? 'UPI Payments' : 'AI Copilot'
                        ),
                        React.createElement('button', {
                            className: 'btn btn-sm btn-outline-secondary',
                            onClick: () => setShowSidebar(false)
                        }, React.createElement('i', { className: 'fas fa-times' }))
                    )
                ),
                React.createElement('div', { className: 'sidebar-content flex-grow-1' },
                    renderSidebarComponent()
                )
            )
        )
    );
}

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
