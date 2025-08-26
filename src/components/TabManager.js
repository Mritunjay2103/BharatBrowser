function TabManager({ tabs, onTabSelect, onTabClose, onNewTab }) {
    return React.createElement('div', { className: 'tab-manager d-flex bg-light' },
        tabs.map(tab =>
            React.createElement('div', {
                key: tab.id,
                className: `tab d-flex align-items-center px-3 py-2 ${tab.isActive ? 'bg-white border-bottom-0' : 'bg-light'}`,
                style: { 
                    cursor: 'pointer',
                    borderLeft: '1px solid #dee2e6',
                    borderTop: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    maxWidth: '200px'
                },
                onClick: () => onTabSelect(tab.id)
            },
                React.createElement('i', { 
                    className: 'fas fa-globe me-2',
                    style: { fontSize: '12px' }
                }),
                React.createElement('span', { 
                    className: 'tab-title flex-grow-1 text-truncate',
                    style: { fontSize: '13px' }
                }, tab.title),
                tabs.length > 1 && React.createElement('button', {
                    className: 'btn btn-sm ms-2',
                    style: { fontSize: '10px', padding: '1px 4px' },
                    onClick: (e) => {
                        e.stopPropagation();
                        onTabClose(tab.id);
                    }
                }, React.createElement('i', { className: 'fas fa-times' }))
            )
        ),
        React.createElement('button', {
            className: 'btn btn-light border-0 px-2',
            onClick: onNewTab,
            style: { fontSize: '12px' }
        }, React.createElement('i', { className: 'fas fa-plus' }))
    );
}

window.TabManager = TabManager;
