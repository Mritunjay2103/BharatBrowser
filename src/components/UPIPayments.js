const { useState } = React;

function UPIPayments() {
    const [currentStep, setCurrentStep] = useState('select');
    const [paymentData, setPaymentData] = useState(null);
    const [transactionStatus, setTransactionStatus] = useState('pending');

    const startUPIPayment = (amount, recipient) => {
        setPaymentData({ amount, recipient });
        setCurrentStep('upi-apps');
    };

    const selectUPIApp = (app) => {
        setCurrentStep('payment-processing');
        
        // Simulate external app integration
        setTimeout(() => {
            if (window.electronAPI) {
                const deepLinkUrl = generateDeepLink(app, paymentData);
                window.electronAPI.openExternal(deepLinkUrl);
            }
            
            setCurrentStep('payment-confirmation');
            setTransactionStatus('success');
        }, 2000);
    };

    const generateDeepLink = (app, data) => {
        const baseUrls = {
            phonepe: 'phonepe://pay',
            gpay: 'tez://upi/pay',
            paytm: 'paytmmp://pay'
        };
        
        // Mock deep link generation
        return `${baseUrls[app] || 'upi://pay'}?pa=${data.recipient}&am=${data.amount}&cu=INR`;
    };

    const resetPayment = () => {
        setCurrentStep('select');
        setPaymentData(null);
        setTransactionStatus('pending');
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 'select':
                return React.createElement(PaymentSelector, {
                    onPaymentStart: startUPIPayment
                });
            
            case 'upi-apps':
                return React.createElement(UPIAppSelector, {
                    paymentData,
                    onAppSelect: selectUPIApp,
                    onBack: () => setCurrentStep('select')
                });
            
            case 'payment-processing':
                return React.createElement(PaymentProcessing, {
                    paymentData
                });
            
            case 'payment-confirmation':
                return React.createElement(PaymentConfirmation, {
                    paymentData,
                    status: transactionStatus,
                    onReset: resetPayment
                });
            
            default:
                return React.createElement('div', null, 'Unknown step');
        }
    };

    return React.createElement('div', { className: 'upi-payments h-100 d-flex flex-column' },
        // Header
        React.createElement('div', { className: 'payment-header p-3 bg-warning text-dark' },
            React.createElement('div', { className: 'd-flex align-items-center mb-2' },
                React.createElement('i', { className: 'fas fa-credit-card me-2' }),
                React.createElement('h6', { className: 'mb-0' }, 'UPI Payments')
            ),
            React.createElement('small', null, 'Seamless payments with Indian UPI apps')
        ),

        // Status Indicator
        transactionStatus === 'success' && React.createElement('div', { className: 'status-bar p-2 bg-success text-white text-center' },
            React.createElement('i', { className: 'fas fa-check-circle me-1' }),
            React.createElement('small', null, 'Payment Successful')
        ),

        // Content
        React.createElement('div', { className: 'payment-content flex-grow-1 p-3' },
            renderStepContent()
        )
    );
}

function PaymentSelector({ onPaymentStart }) {
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    const [selectedQuickAmount, setSelectedQuickAmount] = useState(null);

    const quickAmounts = [100, 200, 500, 1000, 2000];

    const handleQuickAmount = (value) => {
        setAmount(value.toString());
        setSelectedQuickAmount(value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (amount && recipient) {
            onPaymentStart(parseFloat(amount), recipient);
        }
    };

    return React.createElement('div', null,
        React.createElement('h5', { className: 'mb-4' }, 'Make a Payment'),
        
        React.createElement('form', { onSubmit: handleSubmit },
            React.createElement('div', { className: 'mb-3' },
                React.createElement('label', { className: 'form-label' }, 'Recipient (UPI ID or Phone)'),
                React.createElement('input', {
                    type: 'text',
                    className: 'form-control',
                    value: recipient,
                    onChange: (e) => setRecipient(e.target.value),
                    placeholder: 'merchant@upi or 9876543210'
                })
            ),
            
            React.createElement('div', { className: 'mb-3' },
                React.createElement('label', { className: 'form-label' }, 'Amount (₹)'),
                React.createElement('input', {
                    type: 'number',
                    className: 'form-control',
                    value: amount,
                    onChange: (e) => {
                        setAmount(e.target.value);
                        setSelectedQuickAmount(null);
                    },
                    placeholder: 'Enter amount',
                    min: '1'
                })
            ),
            
            React.createElement('div', { className: 'mb-4' },
                React.createElement('label', { className: 'form-label' }, 'Quick Amount'),
                React.createElement('div', { className: 'd-flex flex-wrap gap-2' },
                    quickAmounts.map(value =>
                        React.createElement('button', {
                            key: value,
                            type: 'button',
                            className: `btn btn-sm ${selectedQuickAmount === value ? 'btn-primary' : 'btn-outline-primary'}`,
                            onClick: () => handleQuickAmount(value)
                        }, '₹', value)
                    )
                )
            ),
            
            React.createElement('button', {
                type: 'submit',
                className: 'btn btn-warning w-100',
                disabled: !amount || !recipient
            }, 'Proceed to Pay ₹', amount || '0')
        )
    );
}

function UPIAppSelector({ paymentData, onAppSelect, onBack }) {
    const upiApps = [
        {
            id: 'phonepe',
            name: 'PhonePe',
            icon: 'fas fa-mobile-alt',
            color: 'bg-purple'
        },
        {
            id: 'gpay',
            name: 'Google Pay',
            icon: 'fab fa-google',
            color: 'bg-primary'
        },
        {
            id: 'paytm',
            name: 'Paytm',
            icon: 'fas fa-wallet',
            color: 'bg-info'
        },
        {
            id: 'bhim',
            name: 'BHIM UPI',
            icon: 'fas fa-university',
            color: 'bg-success'
        }
    ];

    return React.createElement('div', null,
        React.createElement('button', {
            className: 'btn btn-outline-secondary btn-sm mb-3',
            onClick: onBack
        }, React.createElement('i', { className: 'fas fa-arrow-left me-1' }), 'Back'),
        
        React.createElement('h5', { className: 'mb-3' }, 'Choose UPI App'),
        React.createElement('div', { className: 'payment-summary mb-4 p-3 bg-light rounded' },
            React.createElement('div', { className: 'row' },
                React.createElement('div', { className: 'col-6' },
                    React.createElement('small', { className: 'text-muted' }, 'Amount'),
                    React.createElement('div', { className: 'fw-bold' }, '₹', paymentData.amount)
                ),
                React.createElement('div', { className: 'col-6' },
                    React.createElement('small', { className: 'text-muted' }, 'To'),
                    React.createElement('div', { className: 'fw-bold text-truncate' }, paymentData.recipient)
                )
            )
        ),
        
        React.createElement('div', { className: 'row g-3' },
            upiApps.map(app =>
                React.createElement('div', { key: app.id, className: 'col-6' },
                    React.createElement('div', { 
                        className: 'card h-100 border-0 shadow-sm',
                        style: { cursor: 'pointer' },
                        onClick: () => onAppSelect(app.id)
                    },
                        React.createElement('div', { className: 'card-body text-center p-3' },
                            React.createElement('div', { 
                                className: `${app.color} text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2`,
                                style: { width: '50px', height: '50px' }
                            },
                                React.createElement('i', { className: app.icon })
                            ),
                            React.createElement('h6', { className: 'card-title small' }, app.name)
                        )
                    )
                )
            )
        ),
        
        React.createElement('div', { className: 'mt-4 text-center' },
            React.createElement('small', { className: 'text-muted' },
                'You will be redirected to the selected UPI app to complete the payment'
            )
        )
    );
}

function PaymentProcessing({ paymentData }) {
    return React.createElement('div', { className: 'text-center py-5' },
        React.createElement('div', { className: 'spinner-border text-warning mb-3' }),
        React.createElement('h5', null, 'Processing Payment'),
        React.createElement('p', { className: 'text-muted' },
            'Redirecting to UPI app for ₹', paymentData.amount
        ),
        React.createElement('small', { className: 'text-muted' },
            'Please complete the payment in the UPI app'
        )
    );
}

function PaymentConfirmation({ paymentData, status, onReset }) {
    const transactionId = 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase();

    return React.createElement('div', { className: 'text-center' },
        status === 'success' ? 
            React.createElement('div', null,
                React.createElement('i', { className: 'fas fa-check-circle fa-4x text-success mb-3' }),
                React.createElement('h5', { className: 'text-success' }, 'Payment Successful'),
                
                React.createElement('div', { className: 'card mt-4' },
                    React.createElement('div', { className: 'card-body' },
                        React.createElement('div', { className: 'row mb-2' },
                            React.createElement('div', { className: 'col-6 text-start' },
                                React.createElement('small', { className: 'text-muted' }, 'Amount Paid')
                            ),
                            React.createElement('div', { className: 'col-6 text-end' },
                                React.createElement('strong', null, '₹', paymentData.amount)
                            )
                        ),
                        React.createElement('div', { className: 'row mb-2' },
                            React.createElement('div', { className: 'col-6 text-start' },
                                React.createElement('small', { className: 'text-muted' }, 'Paid To')
                            ),
                            React.createElement('div', { className: 'col-6 text-end' },
                                React.createElement('small', null, paymentData.recipient)
                            )
                        ),
                        React.createElement('div', { className: 'row mb-2' },
                            React.createElement('div', { className: 'col-6 text-start' },
                                React.createElement('small', { className: 'text-muted' }, 'Transaction ID')
                            ),
                            React.createElement('div', { className: 'col-6 text-end' },
                                React.createElement('small', { className: 'font-monospace' }, transactionId)
                            )
                        ),
                        React.createElement('div', { className: 'row' },
                            React.createElement('div', { className: 'col-6 text-start' },
                                React.createElement('small', { className: 'text-muted' }, 'Date & Time')
                            ),
                            React.createElement('div', { className: 'col-6 text-end' },
                                React.createElement('small', null, new Date().toLocaleString())
                            )
                        )
                    )
                )
            ) :
            React.createElement('div', null,
                React.createElement('i', { className: 'fas fa-times-circle fa-4x text-danger mb-3' }),
                React.createElement('h5', { className: 'text-danger' }, 'Payment Failed'),
                React.createElement('p', { className: 'text-muted' }, 'Please try again or contact support')
            ),
        
        React.createElement('button', {
            className: 'btn btn-primary mt-3',
            onClick: onReset
        }, 'Make Another Payment')
    );
}

window.UPIPayments = UPIPayments;
