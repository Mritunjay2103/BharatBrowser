const { useState, useRef } = React;

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
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef(null);

    // Popular search shortcuts
    const searchEngines = [
        { name: 'Google', url: 'https://www.google.com/search?q=', icon: 'fab fa-google' },
        { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'fas fa-search' },
        { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: 'fas fa-mask' },
        { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=', icon: 'fab fa-youtube' }
    ];

    // Popular website shortcuts
    const popularSites = [
        { name: 'GitHub', url: 'https://github.com', icon: 'fab fa-github' },
        { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: 'fab fa-stack-overflow' },
        { name: 'Wikipedia', url: 'https://wikipedia.org', icon: 'fab fa-wikipedia-w' },
        { name: 'Reddit', url: 'https://reddit.com', icon: 'fab fa-reddit' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Check for website shortcuts first
        const shortcutUrl = getWebsiteShortcut(urlInput.trim());
        if (shortcutUrl) {
            onNavigate(shortcutUrl);
        } else {
            onNavigate(urlInput);
        }
        setShowSuggestions(false);
    };

    const handleUrlChange = (e) => {
        setUrlInput(e.target.value);
        setShowSuggestions(e.target.value.length > 0);
    };

    const handleSuggestionClick = (url, searchTerm = null) => {
        const finalUrl = searchTerm ? url + encodeURIComponent(searchTerm) : url;
        setUrlInput(finalUrl);
        onNavigate(finalUrl);
        setShowSuggestions(false);
    };

    const handleInputFocus = () => {
        if (urlInput.length > 0) {
            setShowSuggestions(true);
        }
    };

    const handleInputBlur = () => {
        // Delay hiding suggestions to allow clicking
        setTimeout(() => setShowSuggestions(false), 200);
    };

    const handleKeyDown = (e) => {
        // Handle keyboard shortcuts
        if (e.key === 'Escape') {
            setShowSuggestions(false);
            inputRef.current?.blur();
        }
        // Ctrl+L or Cmd+L to focus address bar
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            inputRef.current?.focus();
            inputRef.current?.select();
        }
        // Ctrl+T or Cmd+T for new tab (handled by parent)
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
            e.preventDefault();
            // This would need to be passed from parent component
        }
    };

    // Handle common website shortcuts
    const getWebsiteShortcut = (input) => {
        const shortcuts = {
            'gh': 'https://github.com',
            'so': 'https://stackoverflow.com',
            'reddit': 'https://reddit.com',
            'wiki': 'https://wikipedia.org',
            'yt': 'https://youtube.com',
            'tw': 'https://twitter.com',
            'fb': 'https://facebook.com',
            'li': 'https://linkedin.com',
            'ig': 'https://instagram.com'
        };
        return shortcuts[input.toLowerCase()] || null;
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

            // URL input with suggestions
            React.createElement('div', { 
                className: 'flex-grow-1 mx-3 position-relative'
            },
                React.createElement('form', { 
                    onSubmit: handleSubmit
                },
                    React.createElement('div', { className: 'input-group' },
                        React.createElement('span', { className: 'input-group-text' },
                            React.createElement('i', { className: 'fas fa-lock text-success' })
                        ),
                        React.createElement('input', {
                            ref: inputRef,
                            type: 'text',
                            className: 'form-control',
                            placeholder: 'Enter URL, search term, or shortcut (e.g., "gh" for GitHub)...',
                            value: urlInput,
                            onChange: handleUrlChange,
                            onFocus: handleInputFocus,
                            onBlur: handleInputBlur,
                            onKeyDown: handleKeyDown
                        }),
                        React.createElement('button', {
                            className: 'btn btn-outline-secondary',
                            type: 'submit'
                        }, React.createElement('i', { className: 'fas fa-search' }))
                    )
                ),
                
                // Search suggestions dropdown
                showSuggestions && urlInput.trim() && React.createElement('div', {
                    className: 'position-absolute w-100 bg-white border border-top-0 shadow-sm',
                    style: { top: '100%', zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }
                },
                    // Search engines section
                    urlInput.trim() && !urlInput.includes('.') && React.createElement('div', null,
                        React.createElement('div', { className: 'px-3 py-2 bg-light border-bottom' },
                            React.createElement('small', { className: 'text-muted fw-bold' }, 'Search with')
                        ),
                        searchEngines.map(engine =>
                            React.createElement('div', {
                                key: engine.name,
                                className: 'px-3 py-2 suggestion-item',
                                style: { cursor: 'pointer' },
                                onMouseDown: () => handleSuggestionClick(engine.url, urlInput),
                                onMouseEnter: (e) => e.target.style.backgroundColor = '#f8f9fa',
                                onMouseLeave: (e) => e.target.style.backgroundColor = 'transparent'
                            },
                                React.createElement('i', { className: `${engine.icon} me-2` }),
                                `Search ${engine.name} for "${urlInput}"`
                            )
                        )
                    ),
                    
                    // Popular sites section
                    React.createElement('div', null,
                        React.createElement('div', { className: 'px-3 py-2 bg-light border-bottom' },
                            React.createElement('small', { className: 'text-muted fw-bold' }, 'Popular sites')
                        ),
                        popularSites.map(site =>
                            React.createElement('div', {
                                key: site.name,
                                className: 'px-3 py-2 suggestion-item',
                                style: { cursor: 'pointer' },
                                onMouseDown: () => handleSuggestionClick(site.url),
                                onMouseEnter: (e) => e.target.style.backgroundColor = '#f8f9fa',
                                onMouseLeave: (e) => e.target.style.backgroundColor = 'transparent'
                            },
                                React.createElement('i', { className: `${site.icon} me-2` }),
                                site.name
                            )
                        )
                    ),
                    
                    // Shortcuts section
                    urlInput.length <= 3 && React.createElement('div', null,
                        React.createElement('div', { className: 'px-3 py-2 bg-light border-bottom' },
                            React.createElement('small', { className: 'text-muted fw-bold' }, 'Quick shortcuts')
                        ),
                        React.createElement('div', { className: 'px-3 py-2 text-muted' },
                            React.createElement('small', null, 
                                'Type: gh (GitHub), so (Stack Overflow), yt (YouTube), wiki (Wikipedia), reddit, tw (Twitter)'
                            )
                        )
                    )
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
