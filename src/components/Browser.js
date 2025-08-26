const { useState, useEffect, useRef } = React;

function Browser({ onSidebarToggle, onSidebarChange }) {
    const [tabs, setTabs] = useState([
        { id: 1, title: 'New Tab', url: 'about:blank', isActive: true }
    ]);
    const [currentUrl, setCurrentUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const webviewRef = useRef(null);

    useEffect(() => {
        // Set up IPC listeners for browser controls
        if (window.electronAPI) {
            window.electronAPI.onNewTab(() => {
                addNewTab();
            });

            window.electronAPI.onCloseTab(() => {
                closeCurrentTab();
            });

            window.electronAPI.onReloadPage(() => {
                reloadCurrentTab();
            });
        }

        return () => {
            if (window.electronAPI) {
                window.electronAPI.removeAllListeners('new-tab');
                window.electronAPI.removeAllListeners('close-tab');
                window.electronAPI.removeAllListeners('reload-page');
            }
        };
    }, []);

    const addNewTab = () => {
        const newTab = {
            id: Date.now(),
            title: 'New Tab',
            url: 'about:blank',
            isActive: false
        };
        setTabs(prevTabs => [
            ...prevTabs.map(tab => ({ ...tab, isActive: false })),
            { ...newTab, isActive: true }
        ]);
        setCurrentUrl('');
    };

    const closeTab = (tabId) => {
        setTabs(prevTabs => {
            const newTabs = prevTabs.filter(tab => tab.id !== tabId);
            if (newTabs.length === 0) {
                return [{ id: Date.now(), title: 'New Tab', url: 'about:blank', isActive: true }];
            }
            
            const closedTab = prevTabs.find(tab => tab.id === tabId);
            if (closedTab && closedTab.isActive && newTabs.length > 0) {
                newTabs[0].isActive = true;
                setCurrentUrl(newTabs[0].url);
            }
            
            return newTabs;
        });
    };

    const closeCurrentTab = () => {
        const activeTab = tabs.find(tab => tab.isActive);
        if (activeTab) {
            closeTab(activeTab.id);
        }
    };

    const selectTab = (tabId) => {
        setTabs(prevTabs => prevTabs.map(tab => ({
            ...tab,
            isActive: tab.id === tabId
        })));
        
        const selectedTab = tabs.find(tab => tab.id === tabId);
        if (selectedTab) {
            setCurrentUrl(selectedTab.url);
        }
    };

    const updateTabUrl = (url) => {
        setTabs(prevTabs => prevTabs.map(tab => 
            tab.isActive ? { ...tab, url, title: getPageTitle(url) } : tab
        ));
    };

    const getPageTitle = (url) => {
        if (!url || url === 'about:blank') return 'New Tab';
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '');
        } catch {
            return 'Invalid URL';
        }
    };

    const navigateToUrl = (url) => {
        if (!url.trim()) return;
        
        let formattedUrl = url.trim();
        
        // Detect if it's a URL or search term
        if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
            // Check if it looks like a domain (contains dot, no spaces, reasonable length)
            if (formattedUrl.includes('.') && 
                !formattedUrl.includes(' ') && 
                formattedUrl.length > 4 && 
                !formattedUrl.startsWith('.') &&
                !formattedUrl.endsWith('.')) {
                formattedUrl = 'https://' + formattedUrl;
            } else {
                // It's a search query - use Google search
                formattedUrl = 'https://www.google.com/search?q=' + encodeURIComponent(formattedUrl);
            }
        }

        setIsLoading(true);
        setCurrentUrl(formattedUrl);
        updateTabUrl(formattedUrl);
        
        // Simulate loading with more realistic timing
        setTimeout(() => setIsLoading(false), 1500);
    };

    const reloadCurrentTab = () => {
        const activeTab = tabs.find(tab => tab.isActive);
        if (activeTab && activeTab.url !== 'about:blank') {
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 1000);
        }
    };

    const goBack = () => {
        // Mock back functionality
        console.log('Going back');
    };

    const goForward = () => {
        // Mock forward functionality
        console.log('Going forward');
    };

    return React.createElement('div', { className: 'main-browser' },
        // Tab bar
        React.createElement('div', { className: 'tab-bar d-flex bg-light border-bottom' },
            tabs.map(tab =>
                React.createElement('div', {
                    key: tab.id,
                    className: `tab d-flex align-items-center px-3 py-2 border-end ${tab.isActive ? 'bg-white' : 'bg-light'}`,
                    style: { minWidth: '200px', maxWidth: '250px', cursor: 'pointer' },
                    onClick: () => selectTab(tab.id)
                },
                    React.createElement('span', { 
                        className: 'tab-title flex-grow-1 text-truncate',
                        style: { fontSize: '14px' }
                    }, tab.title),
                    tabs.length > 1 && React.createElement('button', {
                        className: 'btn btn-sm ms-2',
                        style: { fontSize: '12px', padding: '2px 6px' },
                        onClick: (e) => {
                            e.stopPropagation();
                            closeTab(tab.id);
                        }
                    }, React.createElement('i', { className: 'fas fa-times' }))
                )
            ),
            React.createElement('button', {
                className: 'btn btn-light border-0 px-3',
                onClick: addNewTab,
                title: 'New Tab'
            }, React.createElement('i', { className: 'fas fa-plus' }))
        ),

        // Navigation bar
        React.createElement(NavigationBar, {
            currentUrl,
            isLoading,
            onNavigate: navigateToUrl,
            onBack: goBack,
            onForward: goForward,
            onReload: reloadCurrentTab,
            onSidebarToggle,
            onSidebarChange
        }),

        // Webview container
        React.createElement('div', { className: 'webview-container' },
            currentUrl && currentUrl !== 'about:blank' ?
                React.createElement('iframe', {
                    ref: webviewRef,
                    className: 'webview',
                    src: currentUrl,
                    title: 'Browser Content'
                }) :
                React.createElement('div', { className: 'empty-state d-flex align-items-center justify-content-center h-100' },
                    React.createElement('div', { className: 'text-center' },
                        React.createElement('i', { className: 'fas fa-globe fa-4x text-muted mb-3' }),
                        React.createElement('h4', { className: 'text-muted' }, 'Start browsing'),
                        React.createElement('p', { className: 'text-muted' }, 'Enter a URL or search term in the address bar')
                    )
                )
        )
    );
}

window.Browser = Browser;
