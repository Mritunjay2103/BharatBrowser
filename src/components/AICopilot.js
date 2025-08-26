const { useState, useEffect } = React;

function AICopilot() {
    const [summary, setSummary] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [userInput, setUserInput] = useState('');

    useEffect(() => {
        // Auto-analyze page when component mounts
        analyzePage();
    }, []);

    const analyzePage = async () => {
        setIsAnalyzing(true);
        try {
            // Simulate AI analysis
            setTimeout(() => {
                const mockSummary = {
                    summary: [
                        "• This webpage contains main content about the current topic",
                        "• Key sections include navigation, main content area, and footer",
                        "• The page follows standard web accessibility practices",
                        "• Interactive elements are properly structured for user engagement"
                    ],
                    wordCount: Math.floor(Math.random() * 2000) + 500,
                    readingTime: Math.floor(Math.random() * 10) + 2
                };
                setSummary(mockSummary);
                setIsAnalyzing(false);
            }, 2000);
        } catch (error) {
            console.error('Error analyzing page:', error);
            setIsAnalyzing(false);
        }
    };

    const sendMessage = () => {
        if (!userInput.trim()) return;

        const userMessage = { type: 'user', content: userInput, timestamp: new Date() };
        setChatHistory(prev => [...prev, userMessage]);

        // Simulate AI response
        setTimeout(() => {
            const aiResponse = {
                type: 'ai',
                content: getAIResponse(userInput),
                timestamp: new Date()
            };
            setChatHistory(prev => [...prev, aiResponse]);
        }, 1000);

        setUserInput('');
    };

    const getAIResponse = (input) => {
        const responses = [
            "Based on the current page content, I can help you understand the key information presented.",
            "This appears to be a webpage with structured content. Would you like me to analyze specific sections?",
            "I can help you navigate this content more efficiently. What specific information are you looking for?",
            "The page contains several interactive elements. Let me know if you need assistance with any particular feature."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    };

    return React.createElement('div', { className: 'ai-copilot h-100 d-flex flex-column' },
        // Header
        React.createElement('div', { className: 'ai-header p-3 bg-primary text-white' },
            React.createElement('div', { className: 'd-flex align-items-center mb-2' },
                React.createElement('i', { className: 'fas fa-robot me-2' }),
                React.createElement('h6', { className: 'mb-0' }, 'AI Copilot')
            ),
            React.createElement('small', null, 'Intelligent browsing assistant')
        ),

        // Page Analysis
        React.createElement('div', { className: 'page-analysis p-3 border-bottom' },
            React.createElement('h6', { className: 'mb-3' }, 'Page Analysis'),
            isAnalyzing ? 
                React.createElement('div', { className: 'text-center' },
                    React.createElement('div', { className: 'spinner-border spinner-border-sm me-2' }),
                    React.createElement('small', null, 'Analyzing page content...')
                ) :
                summary ? 
                    React.createElement('div', null,
                        React.createElement('div', { className: 'mb-3' },
                            summary.summary.map((point, index) =>
                                React.createElement('div', { key: index, className: 'mb-1' },
                                    React.createElement('small', null, point)
                                )
                            )
                        ),
                        React.createElement('div', { className: 'row text-center' },
                            React.createElement('div', { className: 'col-6' },
                                React.createElement('small', { className: 'text-muted' },
                                    React.createElement('i', { className: 'fas fa-file-word me-1' }),
                                    summary.wordCount, ' words'
                                )
                            ),
                            React.createElement('div', { className: 'col-6' },
                                React.createElement('small', { className: 'text-muted' },
                                    React.createElement('i', { className: 'fas fa-clock me-1' }),
                                    summary.readingTime, ' min read'
                                )
                            )
                        ),
                        React.createElement('button', {
                            className: 'btn btn-sm btn-outline-primary mt-2 w-100',
                            onClick: analyzePage
                        }, React.createElement('i', { className: 'fas fa-sync-alt me-1' }), 'Re-analyze')
                    ) :
                    React.createElement('div', { className: 'text-center text-muted' },
                        React.createElement('i', { className: 'fas fa-exclamation-circle me-1' }),
                        React.createElement('small', null, 'No content to analyze')
                    )
        ),

        // Chat Interface
        React.createElement('div', { className: 'chat-section flex-grow-1 d-flex flex-column' },
            React.createElement('h6', { className: 'p-3 mb-0 border-bottom' }, 'Ask AI Assistant'),
            
            // Chat History
            React.createElement('div', { 
                className: 'chat-history flex-grow-1 p-3',
                style: { overflowY: 'auto', maxHeight: '300px' }
            },
                chatHistory.length === 0 ?
                    React.createElement('div', { className: 'text-center text-muted' },
                        React.createElement('i', { className: 'fas fa-comments fa-2x mb-2' }),
                        React.createElement('p', { className: 'small' }, 'Start a conversation with the AI assistant')
                    ) :
                    chatHistory.map((message, index) =>
                        React.createElement('div', {
                            key: index,
                            className: `message mb-3 ${message.type === 'user' ? 'text-end' : ''}`
                        },
                            React.createElement('div', {
                                className: `d-inline-block p-2 rounded ${
                                    message.type === 'user' ? 'bg-primary text-white' : 'bg-light'
                                }`,
                                style: { maxWidth: '80%' }
                            },
                                React.createElement('small', null, message.content)
                            ),
                            React.createElement('div', { className: 'text-muted mt-1' },
                                React.createElement('small', null, message.timestamp.toLocaleTimeString())
                            )
                        )
                    )
            ),

            // Chat Input
            React.createElement('div', { className: 'chat-input p-3 border-top' },
                React.createElement('div', { className: 'input-group' },
                    React.createElement('input', {
                        type: 'text',
                        className: 'form-control form-control-sm',
                        placeholder: 'Ask about this page...',
                        value: userInput,
                        onChange: (e) => setUserInput(e.target.value),
                        onKeyPress: (e) => e.key === 'Enter' && sendMessage()
                    }),
                    React.createElement('button', {
                        className: 'btn btn-primary btn-sm',
                        onClick: sendMessage
                    }, React.createElement('i', { className: 'fas fa-paper-plane' }))
                )
            )
        )
    );
}

window.AICopilot = AICopilot;
