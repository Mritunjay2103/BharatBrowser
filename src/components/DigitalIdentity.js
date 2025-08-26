const { useState } = React;

function DigitalIdentity() {
    const [currentStep, setCurrentStep] = useState('select');
    const [identityData, setIdentityData] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState('pending');

    const startAadhaarFlow = () => {
        setCurrentStep('aadhaar-input');
    };

    const startDigiLockerFlow = () => {
        setCurrentStep('digilocker-login');
    };

    const handleAadhaarSubmit = (aadhaarNumber) => {
        if (aadhaarNumber.length === 12) {
            setCurrentStep('otp-verification');
            // Simulate OTP sent
            setTimeout(() => {
                setCurrentStep('aadhaar-success');
                setIdentityData({
                    type: 'aadhaar',
                    number: aadhaarNumber.replace(/\d(?=\d{4})/g, 'X'),
                    name: 'John Doe',
                    verified: true
                });
                setVerificationStatus('verified');
            }, 3000);
        }
    };

    const handleDigiLockerLogin = (credentials) => {
        setCurrentStep('digilocker-loading');
        // Simulate DigiLocker authentication
        setTimeout(() => {
            setCurrentStep('digilocker-success');
            setIdentityData({
                type: 'digilocker',
                username: credentials.username,
                documents: ['Aadhaar Card', 'PAN Card', 'Driving License'],
                verified: true
            });
            setVerificationStatus('verified');
        }, 2000);
    };

    const resetFlow = () => {
        setCurrentStep('select');
        setIdentityData(null);
        setVerificationStatus('pending');
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 'select':
                return React.createElement(SelectIdentityMethod, {
                    onAadhaarSelect: startAadhaarFlow,
                    onDigiLockerSelect: startDigiLockerFlow
                });
            
            case 'aadhaar-input':
                return React.createElement(AadhaarInput, {
                    onSubmit: handleAadhaarSubmit,
                    onBack: () => setCurrentStep('select')
                });
            
            case 'otp-verification':
                return React.createElement(OTPVerification, {
                    onVerified: () => setCurrentStep('aadhaar-success')
                });
            
            case 'aadhaar-success':
                return React.createElement(VerificationSuccess, {
                    data: identityData,
                    onReset: resetFlow
                });
            
            case 'digilocker-login':
                return React.createElement(DigiLockerLogin, {
                    onLogin: handleDigiLockerLogin,
                    onBack: () => setCurrentStep('select')
                });
            
            case 'digilocker-loading':
                return React.createElement(LoadingScreen, {
                    message: 'Authenticating with DigiLocker...'
                });
            
            case 'digilocker-success':
                return React.createElement(VerificationSuccess, {
                    data: identityData,
                    onReset: resetFlow
                });
            
            default:
                return React.createElement('div', null, 'Unknown step');
        }
    };

    return React.createElement('div', { className: 'digital-identity h-100 d-flex flex-column' },
        // Header
        React.createElement('div', { className: 'identity-header p-3 bg-success text-white' },
            React.createElement('div', { className: 'd-flex align-items-center mb-2' },
                React.createElement('i', { className: 'fas fa-id-card me-2' }),
                React.createElement('h6', { className: 'mb-0' }, 'Digital Identity')
            ),
            React.createElement('small', null, 'Verify your identity with Indian digital services')
        ),

        // Status Indicator
        verificationStatus === 'verified' && React.createElement('div', { className: 'status-bar p-2 bg-success text-white text-center' },
            React.createElement('i', { className: 'fas fa-check-circle me-1' }),
            React.createElement('small', null, 'Identity Verified')
        ),

        // Content
        React.createElement('div', { className: 'identity-content flex-grow-1 p-3' },
            renderStepContent()
        )
    );
}

function SelectIdentityMethod({ onAadhaarSelect, onDigiLockerSelect }) {
    return React.createElement('div', { className: 'text-center' },
        React.createElement('h5', { className: 'mb-4' }, 'Choose Verification Method'),
        
        React.createElement('div', { className: 'row g-3' },
            React.createElement('div', { className: 'col-12' },
                React.createElement('div', { 
                    className: 'card h-100 border-primary',
                    style: { cursor: 'pointer' },
                    onClick: onAadhaarSelect
                },
                    React.createElement('div', { className: 'card-body text-center' },
                        React.createElement('i', { className: 'fas fa-id-card fa-3x text-primary mb-3' }),
                        React.createElement('h6', null, 'Aadhaar Verification'),
                        React.createElement('p', { className: 'text-muted small' },
                            'Verify using your 12-digit Aadhaar number'
                        )
                    )
                )
            ),
            
            React.createElement('div', { className: 'col-12' },
                React.createElement('div', { 
                    className: 'card h-100 border-info',
                    style: { cursor: 'pointer' },
                    onClick: onDigiLockerSelect
                },
                    React.createElement('div', { className: 'card-body text-center' },
                        React.createElement('i', { className: 'fas fa-cloud fa-3x text-info mb-3' }),
                        React.createElement('h6', null, 'DigiLocker'),
                        React.createElement('p', { className: 'text-muted small' },
                            'Access documents from your DigiLocker account'
                        )
                    )
                )
            )
        )
    );
}

function AadhaarInput({ onSubmit, onBack }) {
    const [aadhaarNumber, setAadhaarNumber] = useState('');
    const [isValid, setIsValid] = useState(false);

    const handleInputChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 12);
        setAadhaarNumber(value);
        setIsValid(value.length === 12);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isValid) {
            onSubmit(aadhaarNumber);
        }
    };

    return React.createElement('div', null,
        React.createElement('button', {
            className: 'btn btn-outline-secondary btn-sm mb-3',
            onClick: onBack
        }, React.createElement('i', { className: 'fas fa-arrow-left me-1' }), 'Back'),
        
        React.createElement('h5', { className: 'mb-4' }, 'Enter Aadhaar Number'),
        
        React.createElement('form', { onSubmit: handleSubmit },
            React.createElement('div', { className: 'mb-3' },
                React.createElement('label', { className: 'form-label' }, 'Aadhaar Number'),
                React.createElement('input', {
                    type: 'text',
                    className: `form-control ${isValid ? 'is-valid' : aadhaarNumber ? 'is-invalid' : ''}`,
                    value: aadhaarNumber,
                    onChange: handleInputChange,
                    placeholder: 'Enter 12-digit Aadhaar number',
                    maxLength: 12
                }),
                React.createElement('div', { className: 'form-text' },
                    'Your Aadhaar number will be securely processed for verification'
                )
            ),
            
            React.createElement('button', {
                type: 'submit',
                className: 'btn btn-primary w-100',
                disabled: !isValid
            }, 'Verify Aadhaar')
        )
    );
}

function OTPVerification({ onVerified }) {
    const [otp, setOtp] = useState('');
    const [countdown, setCountdown] = useState(30);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (otp.length === 6) {
            onVerified();
        }
    };

    return React.createElement('div', null,
        React.createElement('h5', { className: 'mb-4' }, 'Enter OTP'),
        React.createElement('p', { className: 'text-muted' },
            'An OTP has been sent to your registered mobile number'
        ),
        
        React.createElement('form', { onSubmit: handleSubmit },
            React.createElement('div', { className: 'mb-3' },
                React.createElement('input', {
                    type: 'text',
                    className: 'form-control text-center',
                    value: otp,
                    onChange: (e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)),
                    placeholder: 'Enter 6-digit OTP',
                    maxLength: 6,
                    style: { fontSize: '1.5rem', letterSpacing: '0.5rem' }
                })
            ),
            
            React.createElement('button', {
                type: 'submit',
                className: 'btn btn-primary w-100 mb-3',
                disabled: otp.length !== 6
            }, 'Verify OTP'),
            
            React.createElement('div', { className: 'text-center' },
                countdown > 0 ?
                    React.createElement('small', { className: 'text-muted' },
                        'Resend OTP in ', countdown, ' seconds'
                    ) :
                    React.createElement('button', {
                        className: 'btn btn-link btn-sm',
                        onClick: () => setCountdown(30)
                    }, 'Resend OTP')
            )
        )
    );
}

function DigiLockerLogin({ onLogin, onBack }) {
    const [credentials, setCredentials] = useState({ username: '', password: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (credentials.username && credentials.password) {
            onLogin(credentials);
        }
    };

    return React.createElement('div', null,
        React.createElement('button', {
            className: 'btn btn-outline-secondary btn-sm mb-3',
            onClick: onBack
        }, React.createElement('i', { className: 'fas fa-arrow-left me-1' }), 'Back'),
        
        React.createElement('h5', { className: 'mb-4' }, 'DigiLocker Login'),
        
        React.createElement('form', { onSubmit: handleSubmit },
            React.createElement('div', { className: 'mb-3' },
                React.createElement('label', { className: 'form-label' }, 'Username/Mobile'),
                React.createElement('input', {
                    type: 'text',
                    className: 'form-control',
                    value: credentials.username,
                    onChange: (e) => setCredentials(prev => ({ ...prev, username: e.target.value })),
                    placeholder: 'Enter username or mobile number'
                })
            ),
            
            React.createElement('div', { className: 'mb-3' },
                React.createElement('label', { className: 'form-label' }, 'Password'),
                React.createElement('input', {
                    type: 'password',
                    className: 'form-control',
                    value: credentials.password,
                    onChange: (e) => setCredentials(prev => ({ ...prev, password: e.target.value })),
                    placeholder: 'Enter password'
                })
            ),
            
            React.createElement('button', {
                type: 'submit',
                className: 'btn btn-info w-100',
                disabled: !credentials.username || !credentials.password
            }, 'Login to DigiLocker')
        )
    );
}

function LoadingScreen({ message }) {
    return React.createElement('div', { className: 'text-center py-5' },
        React.createElement('div', { className: 'spinner-border text-primary mb-3' }),
        React.createElement('p', null, message)
    );
}

function VerificationSuccess({ data, onReset }) {
    return React.createElement('div', { className: 'text-center' },
        React.createElement('i', { className: 'fas fa-check-circle fa-4x text-success mb-3' }),
        React.createElement('h5', { className: 'text-success' }, 'Verification Successful'),
        
        React.createElement('div', { className: 'card mt-4' },
            React.createElement('div', { className: 'card-body' },
                data.type === 'aadhaar' ? 
                    React.createElement('div', null,
                        React.createElement('h6', null, 'Aadhaar Verified'),
                        React.createElement('p', null, 'Number: ', data.number),
                        React.createElement('p', null, 'Name: ', data.name)
                    ) :
                    React.createElement('div', null,
                        React.createElement('h6', null, 'DigiLocker Connected'),
                        React.createElement('p', null, 'User: ', data.username),
                        React.createElement('p', null, 'Documents: ', data.documents.join(', '))
                    )
            )
        ),
        
        React.createElement('button', {
            className: 'btn btn-primary mt-3',
            onClick: onReset
        }, 'Verify Another Identity')
    );
}

window.DigitalIdentity = DigitalIdentity;
