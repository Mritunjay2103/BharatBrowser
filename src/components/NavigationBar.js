const { useState } = React;

function NavigationBar({ 
    currentUrl, 
    isLoading, 
    onNavigate, 
    onBack, 
    onForward, 
    onReload, 
    onSidebarToggle, 
    onSidebarChange 
}) {
    const [urlInput, setUrlInput] = useState(currentUrl || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onNavigate(urlInput);
    };

    const handleUrlChange = (e) => {
        setUrlInput(e.target.value);
    };

    React.useEffect(() => {
        setUrlInput(currentUrl || '');
    }, [currentUrl]);

    return React.createElement('div', { className: 'navigation-bar bg-light border-bottom p-2' },
        React.createElement('div', { className: 'd-flex align-items-center gap-2' },
            // Navigation buttons
            React.createElement('div', { className: 'd-flex gap-1' },
                React.createElement('button', {
                    className: 'btn btn-outline-secondary btn-sm',
                    onClick: onBack,
                    title: 'Go Back'
                }, React.createElement('i', { className: 'fas fa-arrow-left' })),
                
                React.createElement('button', {
                    className: 'btn btn-outline-secondary btn-sm',
                    onClick: onForward,
                    title: 'Go Forward'
                }, React.createElement('i', { className: 'fas fa-arrow-right' })),
                
                React.createElement('button', {
                    className: 'btn btn-outline-secondary btn-sm',
                    onClick: onReload,
                    title: 'Reload'
                }, isLoading ? 
                    React.createElement('i', { className: 'fas fa-spinner fa-spin' }) :
                    React.createElement('i', { className: 'fas fa-sync-alt' })
                )
            ),

            // URL input
            React.createElement('form', { 
                className: 'flex-grow-1 mx-3',
                onSubmit: handleSubmit
            },
                React.createElement('div', { className: 'input-group' },
                    React.createElement('span', { className: 'input-group-text' },
                        React.createElement('i', { className: 'fas fa-lock text-success' })
                    ),
                    React.createElement('input', {
                        type: 'text',
                        className: 'form-control',
                        placeholder: 'Enter URL or search term...',
                        value: urlInput,
                        onChange: handleUrlChange
                    }),
                    React.createElement('button', {
                        className: 'btn btn-outline-secondary',
                        type: 'submit'
                    }, React.createElement('i', { className: 'fas fa-search' }))
                )
            ),

            // Sidebar controls
            React.createElement('div', { className: 'd-flex gap-1' },
                React.createElement('button', {
                    className: 'btn btn-outline-primary btn-sm',
                    onClick: () => {
                        onSidebarChange('ai');
                        onSidebarToggle();
                    },
                    title: 'AI Copilot'
                }, React.createElement('i', { className: 'fas fa-robot' })),
                
                React.createElement('button', {
                    className: 'btn btn-outline-success btn-sm',
                    onClick: () => {
                        onSidebarChange('identity');
                        onSidebarToggle();
                    },
                    title: 'Digital Identity'
                }, React.createElement('i', { className: 'fas fa-id-card' })),
                
                React.createElement('button', {
                    className: 'btn btn-outline-warning btn-sm',
                    onClick: () => {
                        onSidebarChange('upi');
                        onSidebarToggle();
                    },
                    title: 'UPI Payments'
                }, React.createElement('i', { className: 'fas fa-credit-card' })),
                
                React.createElement('button', {
                    className: 'btn btn-outline-info btn-sm',
                    onClick: () => {
                        onSidebarChange('consent');
                        onSidebarToggle();
                    },
                    title: 'Consent Manager'
                }, React.createElement('i', { className: 'fas fa-shield-alt' }))
            )
        )
    );
}

window.NavigationBar = NavigationBar;
