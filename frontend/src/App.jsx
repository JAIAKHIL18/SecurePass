import { useState, useEffect } from 'react'
import './App.css'
import { validatePasswordDFA } from './utils/passwordDFA'
import DFAVisualizer from './components/DFAVisualizer'

function App() {
  // Navigation: 'home' | 'user-login' | 'admin-login' | 'register' | 'dashboard'
  const [currentPage, setCurrentPage] = useState('home')

  // Password analyzer state
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Admin Diagnostics accordion toggle
  const [showAdminDiagnostics, setShowAdminDiagnostics] = useState(true)
  const [adminApiResult, setAdminApiResult] = useState(null)
  const [adminApiLoading, setAdminApiLoading] = useState(false)
  const [adminApiError, setAdminApiError] = useState('')

  // Registration form
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registerMessage, setRegisterMessage] = useState('')
  const [registerStatus, setRegisterStatus] = useState('') // 'success' | 'error' | ''
  const [isRegistering, setIsRegistering] = useState(false)

  // User Login form state
  const [userLoginEmail, setUserLoginEmail] = useState('')
  const [userLoginPassword, setUserLoginPassword] = useState('')
  const [showUserLoginPassword, setShowUserLoginPassword] = useState(false)
  const [userLoginMessage, setUserLoginMessage] = useState('')
  const [userLoginStatus, setUserLoginStatus] = useState('') // 'success' | 'error' | ''
  const [isUserLoggingIn, setIsUserLoggingIn] = useState(false)

  // Admin Login form state (Company side)
  const [adminLoginEmail, setAdminLoginEmail] = useState('')
  const [adminLoginPassword, setAdminLoginPassword] = useState('')
  const [showAdminLoginPassword, setShowAdminLoginPassword] = useState(false)
  const [adminLoginMessage, setAdminLoginMessage] = useState('')
  const [adminLoginStatus, setAdminLoginStatus] = useState('') // 'success' | 'error' | ''
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false)

  // Authenticated user session state (includes role and token)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('securepass_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Synchronize user session with localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('securepass_user', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('securepass_user')
    }
  }, [currentUser])

  // RBAC: Check if the current logged-in user is an authenticated administrator
  const isAdmin = currentUser && currentUser.role === 'admin'

  /* =====================================
     PASSWORD POLICY SPECIFICATION
  ==================================== */

  const passwordRequirements = (value) => [
    {
      id: 'length',
      label: 'Minimum 8 characters',
      test: value.length >= 8,
    },
    {
      id: 'upper',
      label: 'Uppercase letter (A-Z)',
      test: /[A-Z]/.test(value),
    },
    {
      id: 'lower',
      label: 'Lowercase letter (a-z)',
      test: /[a-z]/.test(value),
    },
    {
      id: 'digit',
      label: 'Number (0-9)',
      test: /[0-9]/.test(value),
    },
    {
      id: 'special',
      label: 'Special character (!@#$%^&*()_+-=[]{};:\',.<>/?)',
      test: /[!@#$%^&*()_+\-=[\]{};:',.<>/?]/.test(value),
    },
    {
      id: 'nowhitespace',
      label: 'No spaces or whitespace',
      test: value.length > 0 ? !/\s/.test(value) : false,
    },
  ]

  /* =====================================
     PASSWORD EVALUATION ENGINE
  ===================================== */

  const requirements = passwordRequirements(password)
  const isValid = requirements.every((rule) => rule.test)
  const passedRequirements = requirements.filter((rule) => rule.test).length

  const strengthPercentage =
    password.length === 0 ? 0 : (passedRequirements / requirements.length) * 100

  const getStrength = () => {
    if (password.length === 0) return 'Enter a password'
    if (passedRequirements <= 2) return 'Weak'
    if (passedRequirements <= 4) return 'Medium'
    if (passedRequirements === 5) return 'Strong'
    return 'Very Strong'
  }

  const getStrengthClass = () => {
    if (password.length === 0) return 'empty'
    if (passedRequirements <= 2) return 'weak'
    if (passedRequirements <= 4) return 'moderate'
    if (passedRequirements === 5) return 'strong'
    return 'very-strong'
  }

  // User-friendly suggestions for improving passwords
  const getSuggestions = () => {
    if (password.length === 0) {
      return ['Start typing a password to see live suggestions for improvement.']
    }

    const tips = []
    if (password.length < 8) {
      tips.push(`Make your password at least 8 characters long (${8 - password.length} more needed).`)
    }
    if (!/[A-Z]/.test(password)) {
      tips.push('Add an uppercase letter (A-Z) to strengthen your password.')
    }
    if (!/[a-z]/.test(password)) {
      tips.push('Add a lowercase letter (a-z).')
    }
    if (!/[0-9]/.test(password)) {
      tips.push('Include at least one numeric digit (0-9).')
    }
    if (!/[!@#$%^&*()_+\-=[\]{};:',.<>/?]/.test(password)) {
      tips.push('Include at least one special character (e.g. ! @ # $ %).')
    }
    if (/\s/.test(password)) {
      tips.push('Remove all spaces or whitespace characters.')
    }
    if (isValid) {
      tips.push('Great job! Your password meets all security criteria.')
    }
    return tips
  }

  /* =====================================
     ADMIN-ONLY TECHNICAL AUTOMATA DATA
     (Company Side — Only evaluated when isAdmin is true)
  ===================================== */

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};:',.<>/?])[A-Za-z0-9!@#$%^&*()_+\-=[\]{};:',.<>/?]{8,}$/

  // Evaluated for technical display in Admin mode
  const regexValid = isAdmin && password.length > 0 && passwordRegex.test(password)
  const dfaResult = isAdmin ? validatePasswordDFA(password) : null
  const dfaValid = dfaResult ? dfaResult.accepted : false
  const validationAgreement = !isAdmin || password.length === 0 || regexValid === dfaValid

  // Pre-fill analyzer with samples
  const setSamplePassword = (type) => {
    if (type === 'valid') setPassword('SecurePass2026!')
    else if (type === 'noSpecial') setPassword('SecurePass2026')
    else if (type === 'withSpace') setPassword('Secure Pass2026!')
    else if (type === 'weak') setPassword('pass1')
    else if (type === 'invalidChar') setPassword('SecurePass2026!€')
  }

  // Admin: Call protected backend endpoint to verify technical analysis with token
  const handleVerifyWithBackend = async () => {
    if (!isAdmin || !currentUser?.token) return
    setAdminApiLoading(true)
    setAdminApiError('')
    setAdminApiResult(null)

    try {
      const response = await fetch('http://localhost:5001/api/auth/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()
      if (!response.ok) {
        setAdminApiError(data.message || 'Server rejected technical analysis request.')
        return
      }

      setAdminApiResult(data.technicalAnalysis)
    } catch (err) {
      console.error('Admin API error:', err)
      setAdminApiError('Failed to communicate with admin endpoint on port 5001.')
    } finally {
      setAdminApiLoading(false)
    }
  }

  /* =====================================
     REGISTRATION (FORCES USER ROLE)
  ===================================== */

  const handleRegister = async (event) => {
    event.preventDefault()
    setRegisterMessage('')
    setRegisterStatus('')

    if (!registerName.trim()) {
      setRegisterStatus('error')
      setRegisterMessage('Please enter your full name.')
      return
    }

    if (!registerEmail.trim()) {
      setRegisterStatus('error')
      setRegisterMessage('Please enter your email address.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(registerEmail.trim())) {
      setRegisterStatus('error')
      setRegisterMessage('Please enter a valid email address (e.g. user@example.com).')
      return
    }

    const registrationRequirements = passwordRequirements(registerPassword)
    const registrationPasswordValid = registrationRequirements.every((rule) => rule.test)

    if (!registrationPasswordValid) {
      setRegisterStatus('error')
      setRegisterMessage('Your password does not meet all security policy requirements.')
      return
    }

    if (registerPassword !== confirmPassword) {
      setRegisterStatus('error')
      setRegisterMessage('Passwords do not match.')
      return
    }

    try {
      setIsRegistering(true)
      setRegisterMessage('Registering your account securely...')

      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setRegisterStatus('error')
        setRegisterMessage(data.message || 'Registration failed.')
        return
      }

      setRegisterStatus('success')
      setRegisterMessage('Registration successful! Your client account has been created. Redirecting to User Login...')
      setRegisterName('')
      setRegisterEmail('')
      setRegisterPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        goToPage('user-login')
      }, 2000)
    } catch (error) {
      console.error('Registration error:', error)
      setRegisterStatus('error')
      setRegisterMessage('Unable to connect to SecurePass backend (port 5001).')
    } finally {
      setIsRegistering(false)
    }
  }

  /* =====================================
     1. USER LOGIN (CLIENT SIDE)
     Checks password alone — zero technical jargon
  ===================================== */

  const handleUserLogin = async (event) => {
    event.preventDefault()
    setUserLoginMessage('')
    setUserLoginStatus('')

    if (!userLoginEmail.trim() || !userLoginPassword) {
      setUserLoginStatus('error')
      setUserLoginMessage('Please enter your email and password.')
      return
    }

    try {
      setIsUserLoggingIn(true)
      setUserLoginMessage('Checking credentials...')

      const response = await fetch('http://localhost:5001/api/auth/user-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userLoginEmail.trim(),
          password: userLoginPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setUserLoginStatus('error')
        setUserLoginMessage(data.message || 'Invalid email or password.')
        return
      }

      setUserLoginStatus('success')
      setUserLoginMessage(`Welcome back, ${data.user.name}! Logging in to your user dashboard...`)

      setCurrentUser({
        ...data.user,
        token: data.token,
      })
      setUserLoginPassword('')

      setTimeout(() => {
        goToPage('dashboard')
      }, 1200)
    } catch (error) {
      console.error('User login error:', error)
      setUserLoginStatus('error')
      setUserLoginMessage('Unable to connect to SecurePass server (port 5001).')
    } finally {
      setIsUserLoggingIn(false)
    }
  }

  /* =====================================
     2. ADMIN LOGIN (COMPANY SIDE)
     Authenticates admin and unlocks technical diagnostics
  ===================================== */

  const handleAdminLogin = async (event) => {
    event.preventDefault()
    setAdminLoginMessage('')
    setAdminLoginStatus('')

    if (!adminLoginEmail.trim() || !adminLoginPassword) {
      setAdminLoginStatus('error')
      setAdminLoginMessage('Please enter company administrator credentials.')
      return
    }

    try {
      setIsAdminLoggingIn(true)
      setAdminLoginMessage('Verifying company administrator credentials with MongoDB...')

      const response = await fetch('http://localhost:5001/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminLoginEmail.trim(),
          password: adminLoginPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setAdminLoginStatus('error')
        setAdminLoginMessage(data.message || 'Invalid administrator credentials.')
        return
      }

      setAdminLoginStatus('success')
      setAdminLoginMessage(`Company Administrator Verified! Access granted to technical analysis.`)

      setCurrentUser({
        ...data.user,
        token: data.token,
      })
      setAdminLoginPassword('')

      setTimeout(() => {
        goToPage('dashboard')
      }, 1200)
    } catch (error) {
      console.error('Admin login error:', error)
      setAdminLoginStatus('error')
      setAdminLoginMessage('Unable to connect to SecurePass backend (port 5001).')
    } finally {
      setIsAdminLoggingIn(false)
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setAdminApiResult(null)
    goToPage('home')
  }

  /* =====================================
     NAVIGATION HELPERS
  ===================================== */

  const goToPage = (page) => {
    setCurrentPage(page)
    setRegisterMessage('')
    setRegisterStatus('')
    setUserLoginMessage('')
    setUserLoginStatus('')
    setAdminLoginMessage('')
    setAdminLoginStatus('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToChecker = () => {
    if (currentPage !== 'home') {
      setCurrentPage('home')
      setTimeout(() => {
        document.getElementById('checker')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      document.getElementById('checker')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  /* =====================================
     RENDER APPLICATION
  ===================================== */

  return (
    <div className="app">
      {/* Navigation Bar */}
      <header className="navbar">
        <div
          className="logo"
          onClick={() => goToPage('home')}
          style={{ cursor: 'pointer' }}
          title="SecurePass Homepage"
        >
          <span className="logo-icon">🔐</span>
          <span>SecurePass</span>
        </div>

        <nav>
          <button
            className={`nav-button ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => goToPage('home')}
          >
            Home
          </button>

          <button
            className="nav-button"
            onClick={scrollToChecker}
          >
            Password Checker
          </button>

          {!currentUser ? (
            <>
              {/* Separate User Login */}
              <button
                className={`nav-button ${currentPage === 'user-login' ? 'active' : ''}`}
                onClick={() => goToPage('user-login')}
              >
                User Login
              </button>

              {/* Separate Admin Login (Company Side) */}
              <button
                className={`nav-button nav-admin-btn ${currentPage === 'admin-login' ? 'active' : ''}`}
                onClick={() => goToPage('admin-login')}
                title="Company Administrator Portal"
              >
                🛡️ Admin Portal
              </button>

              <button
                className="nav-register-button"
                onClick={() => goToPage('register')}
              >
                Register
              </button>
            </>
          ) : (
            <>
              <button
                className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => goToPage('dashboard')}
              >
                {isAdmin ? '🛡️ Company Console' : '👤 My Dashboard'} ({currentUser.name.split(' ')[0]})
              </button>

              <button
                className="nav-register-button nav-logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </header>

      <main>
        {/* =================================
            1. HOME / PASSWORD CHECKER
        ================================= */}
        {currentPage === 'home' && (
          <>
            {/* Hero Section */}
            <section className="hero-section" id="home">
              <div className="hero-badge">
                {isAdmin
                  ? '🛡️ Company Administrator Mode: Full Automata Diagnostics Active'
                  : '🔒 SecurePass — Modern Password Policy Validation'}
              </div>

              <h1>
                Build stronger passwords.
                <br />
                <span>Protect your digital identity.</span>
              </h1>

              <p>
                {isAdmin
                  ? 'Company-side administrator view: Inspect how passwords are mathematically evaluated using Deterministic Finite Automata (DFA) state progression and Regular Expressions.'
                  : 'Check your password security in real time. Get instant feedback on password strength and simple tips to ensure your accounts stay protected.'}
              </p>

              <div className="hero-actions">
                <button
                  className="primary-button"
                  onClick={scrollToChecker}
                >
                  {isAdmin ? 'Open Technical Analysis' : 'Check Your Password'}
                </button>
                {!currentUser && (
                  <>
                    <button
                      className="secondary-button"
                      onClick={() => goToPage('user-login')}
                    >
                      User Login
                    </button>
                    <button
                      className="secondary-button admin-hero-btn"
                      onClick={() => goToPage('admin-login')}
                    >
                      Company Admin Portal
                    </button>
                  </>
                )}
              </div>
            </section>

            {/* Password Checker Section */}
            <section className="checker-section" id="checker">
              <div className="checker-card">
                <div className="checker-heading">
                  <div className="checker-title-row">
                    <h2>
                      {isAdmin ? 'Technical Password Analyzer (Company Side)' : 'Password Strength Checker'}
                    </h2>
                    {isAdmin ? (
                      <span className="role-badge admin-badge">🛡️ Company Administrator</span>
                    ) : (
                      <span className="role-badge user-badge">Client View</span>
                    )}
                  </div>
                  <p>
                    {isAdmin
                      ? 'Administrative analysis: Evaluate passwords against the formal policy and examine internal automata state transitions.'
                      : 'Test your password alone against basic requirements and view clear recommendations for improvement.'}
                  </p>
                </div>

                {/* Quick Presets for Demo */}
                <div className="demo-presets">
                  <span className="preset-label">Sample Passwords:</span>
                  <button type="button" className="preset-btn" onClick={() => setSamplePassword('valid')}>
                    ✓ Strong Password
                  </button>
                  <button type="button" className="preset-btn" onClick={() => setSamplePassword('noSpecial')}>
                    ✗ Missing Special
                  </button>
                  <button type="button" className="preset-btn" onClick={() => setSamplePassword('withSpace')}>
                    ✗ With Spaces
                  </button>
                  <button type="button" className="preset-btn" onClick={() => setSamplePassword('weak')}>
                    ✗ Weak Password
                  </button>
                  {isAdmin && (
                    <button type="button" className="preset-btn admin-preset-btn" onClick={() => setSamplePassword('invalidChar')}>
                      ⚙ Forbidden Symbol (€)
                    </button>
                  )}
                </div>

                {/* Password Input Field */}
                <label htmlFor="password">
                  {isAdmin ? 'Enter Password for Technical Inspection' : 'Enter Password to Check'}
                </label>

                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Type a password to test..."
                    autoComplete="off"
                    spellCheck="false"
                  />

                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                <div className="strength-section">
                  <div className="strength-header">
                    <span>Password Strength</span>
                    <span className={`strength-label ${getStrengthClass()}`}>
                      {getStrength()}
                    </span>
                  </div>

                  <div className="strength-track">
                    <div
                      className={`strength-bar ${getStrengthClass()}`}
                      style={{
                        width: `${strengthPercentage}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Basic Password Requirements Checklist */}
                <div className="requirements">
                  <h3>Password Requirements</h3>

                  {requirements.map((rule) => (
                    <div className="requirement" key={rule.id}>
                      <span className={`requirement-icon ${rule.test ? 'passed' : 'failed'}`}>
                        {rule.test ? '✓' : '○'}
                      </span>
                      <span className={rule.test ? 'rule-passed' : 'rule-failed'}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Overall Validation Result Banner */}
                <div className={`validation-result ${isValid ? 'valid' : 'invalid'}`}>
                  {password.length === 0
                    ? 'Enter a password above to begin analysis'
                    : isValid
                    ? '✓ Password satisfies all required security criteria!'
                    : '✗ Password does not satisfy all requirements yet'}
                </div>

                {/* USER SIDE: Recommendations Card (Clean, Simple, Zero Technical Terms) */}
                <div className="suggestions-card">
                  <div className="suggestions-header">
                    <span className="suggestions-icon">💡</span>
                    <h4>Recommendations to Improve Your Password:</h4>
                  </div>
                  <ul className="suggestions-list">
                    {getSuggestions().map((tip, idx) => (
                      <li key={idx} className={isValid ? 'suggestion-success' : 'suggestion-item'}>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ==============================================================
                    COMPANY SIDE: TECHNICAL ANALYSIS & AUTOMATA CONSOLE
                    (Exclusively rendered for Administrator)
                ============================================================== */}
                {isAdmin ? (
                  <div className="admin-diagnostics-wrapper">
                    {/* Header */}
                    <div className="company-console-header">
                      <div className="admin-btn-content">
                        <span className="admin-btn-icon">⚙️</span>
                        <div>
                          <strong>Company-Side Technical Password Analysis Console</strong>
                          <div className="console-subtext">Internal Automata Diagnostics &amp; Regex Evaluation</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="console-collapse-btn"
                        onClick={() => setShowAdminDiagnostics((prev) => !prev)}
                      >
                        {showAdminDiagnostics ? '▲ Collapse Console' : '▼ Expand Console'}
                      </button>
                    </div>

                    {showAdminDiagnostics && (
                      <div className="admin-diagnostics-panel">
                        <div className="admin-notice-bar">
                          <span>🛡️ <strong>Company Staff Authenticated:</strong> <code>{currentUser.email}</code>. Inspecting live DFA state progression, state transitions, and Regex lookahead assertions.</span>
                        </div>

                        {/* Dual-Engine Grid */}
                        <div className="dual-engine-grid">
                          {/* Regex Panel */}
                          <div className="regex-panel">
                            <div className="regex-heading">
                              <h3>Regex Validation</h3>
                              <span className="tech-badge">Regular Expression</span>
                            </div>

                            <div className="regex-pattern">
                              <code>{String(passwordRegex)}</code>
                            </div>

                            <div className={`regex-status ${password.length === 0 ? '' : regexValid ? 'success' : 'failure'}`}>
                              <span>Regex Engine Result</span>
                              <strong>
                                {password.length === 0 ? 'WAITING' : regexValid ? 'ACCEPTED' : 'REJECTED'}
                              </strong>
                            </div>
                          </div>

                          {/* DFA Summary Panel */}
                          <div className="regex-panel">
                            <div className="regex-heading">
                              <h3>DFA Validation</h3>
                              <span className="tech-badge">Automata Theory</span>
                            </div>

                            <div className="regex-pattern">
                              <code>M = (Q, Σ, δ, q₀, F) | States: 145</code>
                            </div>

                            <div className={`regex-status ${password.length === 0 ? '' : dfaValid ? 'success' : 'failure'}`}>
                              <span>DFA Automaton Result</span>
                              <strong>
                                {password.length === 0 ? 'WAITING' : dfaValid ? 'ACCEPTED' : 'REJECTED'}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Dual Engine Agreement Banner */}
                        <div className={`validation-result ${validationAgreement ? 'valid' : 'invalid'}`}>
                          {password.length === 0
                            ? 'Dual validation engines ready: Regex & DFA'
                            : validationAgreement
                            ? '✓ Perfect Agreement: Regex and DFA produced identical results'
                            : '⚠ Discrepancy detected between Regex and DFA validation'}
                        </div>

                        {/* Server-Side Protected API Verification */}
                        <div className="admin-server-verify-box">
                          <div className="server-verify-header">
                            <div>
                              <h4>Company Server-Side Verification</h4>
                              <p className="server-verify-subtext">
                                Verifies administrative JWT token against protected company endpoint <code>POST /api/auth/analyze</code>
                              </p>
                            </div>
                            <button
                              type="button"
                              className="admin-verify-btn"
                              onClick={handleVerifyWithBackend}
                              disabled={adminApiLoading || password.length === 0}
                            >
                              {adminApiLoading ? 'Verifying with Server...' : 'Verify via Server API'}
                            </button>
                          </div>

                          {adminApiError && (
                            <div className="admin-api-error">
                              ❌ {adminApiError}
                            </div>
                          )}

                          {adminApiResult && (
                            <div className="admin-api-success">
                              <div className="api-result-title">
                                ✓ Company Server Verified (HTTP 200 OK — Admin Authorized)
                              </div>
                              <div className="api-result-grid">
                                <div><strong>Regex Status:</strong> {adminApiResult.regexResult ? 'ACCEPTED' : 'REJECTED'}</div>
                                <div><strong>DFA Status:</strong> {adminApiResult.dfaResult ? 'ACCEPTED' : 'REJECTED'}</div>
                                <div><strong>Mathematical Agreement:</strong> {adminApiResult.agreement ? 'TRUE (100% Match)' : 'FALSE'}</div>
                                <div><strong>DFA State:</strong> <code>{adminApiResult.dfaState}</code></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Interactive DFA Visualizer Component */}
                        <DFAVisualizer dfaResult={dfaResult} password={password} />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Notice for Normal Users: Technical details are not visible on the client side */
                  <div className="admin-restricted-box">
                    <div className="restricted-content">
                      <span className="restricted-icon">🔒</span>
                      <div>
                        <strong>Company Technical Automata Analysis</strong>
                        <p>
                          Internal DFA state progressions, transition tables, and Regular Expression evaluations are accessible only on the company side via the Admin Portal.
                        </p>
                      </div>
                    </div>
                    {!currentUser && (
                      <button
                        type="button"
                        className="restricted-login-btn"
                        onClick={() => goToPage('admin-login')}
                      >
                        Company Admin Login
                      </button>
                    )}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* =================================
            2. DEDICATED USER LOGIN PAGE
            Simple, client-side, checks password alone
        ================================= */}
        {currentPage === 'user-login' && (
          <section className="auth-section">
            <div className="auth-card">
              <div className="auth-heading">
                <div className="hero-badge">Client Portal</div>
                <h2>User Login</h2>
                <p>Sign in to check your password security and manage your account.</p>
              </div>

              <form onSubmit={handleUserLogin}>
                <div className="form-group">
                  <label htmlFor="user-login-email">Email Address</label>
                  <input
                    id="user-login-email"
                    type="email"
                    value={userLoginEmail}
                    onChange={(e) => setUserLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="user-login-password">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="user-login-password"
                      type={showUserLoginPassword ? 'text' : 'password'}
                      value={userLoginPassword}
                      onChange={(e) => setUserLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowUserLoginPassword((prev) => !prev)}
                    >
                      {showUserLoginPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {userLoginMessage && (
                  <div
                    className={`form-message ${
                      userLoginStatus === 'success' ? 'success' : 'error'
                    }`}
                  >
                    {userLoginMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="primary-button auth-button"
                  disabled={isUserLoggingIn}
                >
                  {isUserLoggingIn ? 'Checking Password...' : 'Log In to User Account'}
                </button>
              </form>

              <div className="portal-switch-box">
                <p>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => goToPage('register')}>
                    Register here
                  </button>
                </p>
                <p className="admin-portal-link">
                  Are you a company administrator?{' '}
                  <button type="button" onClick={() => goToPage('admin-login')}>
                    Go to Company Admin Portal →
                  </button>
                </p>
              </div>
            </div>
          </section>
        )}

        {/* =================================
            3. DEDICATED ADMIN LOGIN PAGE (COMPANY SIDE)
            Strictly requires administrator credentials
        ================================= */}
        {currentPage === 'admin-login' && (
          <section className="auth-section">
            <div className="auth-card admin-auth-card">
              <div className="auth-heading">
                <div className="hero-badge admin-hero-badge">🛡️ Company Side Portal</div>
                <h2>Administrator Login</h2>
                <p>Company staff authentication. Unlocks full technical DFA &amp; Regex diagnostics.</p>
              </div>

              <form onSubmit={handleAdminLogin}>
                <div className="form-group">
                  <label htmlFor="admin-login-email">Company Admin Email</label>
                  <input
                    id="admin-login-email"
                    type="email"
                    value={adminLoginEmail}
                    onChange={(e) => setAdminLoginEmail(e.target.value)}
                    placeholder="admin@securepass.local"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="admin-login-password">Master Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="admin-login-password"
                      type={showAdminLoginPassword ? 'text' : 'password'}
                      value={adminLoginPassword}
                      onChange={(e) => setAdminLoginPassword(e.target.value)}
                      placeholder="Enter administrator master password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowAdminLoginPassword((prev) => !prev)}
                    >
                      {showAdminLoginPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {adminLoginMessage && (
                  <div
                    className={`form-message ${
                      adminLoginStatus === 'success' ? 'success' : 'error'
                    }`}
                  >
                    {adminLoginMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="primary-button auth-button admin-submit-btn"
                  disabled={isAdminLoggingIn}
                >
                  {isAdminLoggingIn ? 'Authenticating Admin...' : 'Authenticate as Company Administrator'}
                </button>
              </form>

              <div className="portal-switch-box">
                <p>
                  Standard client user?{' '}
                  <button type="button" onClick={() => goToPage('user-login')}>
                    Go to User Login
                  </button>
                </p>
              </div>
            </div>
          </section>
        )}

        {/* =================================
            4. USER REGISTRATION PAGE
        ================================= */}
        {currentPage === 'register' && (
          <section className="auth-section">
            <div className="auth-card">
              <div className="auth-heading">
                <div className="hero-badge">Client Registration</div>
                <h2>Create Account</h2>
                <p>Register as a standard user with policy-enforced password security.</p>
              </div>

              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label htmlFor="register-name">Full Name</label>
                  <input
                    id="register-name"
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="e.g. John Doe"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-email">Email Address</label>
                  <input
                    id="register-email"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-password">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="register-password"
                      type={showRegisterPassword ? 'text' : 'password'}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Create a policy-compliant password"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowRegisterPassword((prev) => !prev)}
                    >
                      {showRegisterPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="register-requirements">
                  <p>Password Policy Checklist:</p>
                  {passwordRequirements(registerPassword).map((rule) => (
                    <div className="requirement" key={rule.id}>
                      <span className={`requirement-icon ${rule.test ? 'passed' : 'failed'}`}>
                        {rule.test ? '✓' : '○'}
                      </span>
                      <span className={rule.test ? 'rule-passed' : 'rule-failed'}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {registerMessage && (
                  <div
                    className={`form-message ${
                      registerStatus === 'success' ? 'success' : 'error'
                    }`}
                  >
                    {registerMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="primary-button auth-button"
                  disabled={isRegistering}
                >
                  {isRegistering ? 'Registering Account...' : 'Create Account'}
                </button>
              </form>

              <div className="portal-switch-box">
                <p>
                  Already have an account?{' '}
                  <button type="button" onClick={() => goToPage('user-login')}>
                    User Login
                  </button>
                </p>
              </div>
            </div>
          </section>
        )}

        {/* =================================
            5. AUTHENTICATED DASHBOARD / CONSOLE
        ================================= */}
        {currentPage === 'dashboard' && currentUser && (
          <section className="auth-section">
            <div className="auth-card">
              <div className="user-dashboard-view">
                <div className="auth-heading">
                  <div className={`hero-badge ${isAdmin ? 'admin-hero-badge' : ''}`}>
                    {isAdmin ? '🛡️ Company Administrator Console' : '👤 Client User Account'}
                  </div>
                  <h2>{isAdmin ? 'Company Security Console' : 'User Account Dashboard'}</h2>
                  <p>
                    {isAdmin
                      ? 'Full technical automata access enabled. Master authorization verified.'
                      : 'Logged in as a standard user. Password security analysis is in simplified mode.'}
                  </p>
                </div>

                <div className="profile-card">
                  <div className={`profile-avatar ${isAdmin ? 'admin-avatar' : ''}`}>
                    {isAdmin ? '🛡️' : (currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U')}
                  </div>
                  <div className="profile-info">
                    <h3>{currentUser.name}</h3>
                    <p className="profile-email">{currentUser.email}</p>
                    <span className={`profile-tag ${isAdmin ? 'admin-tag' : ''}`}>
                      Account Level: {currentUser.role ? currentUser.role.toUpperCase() : 'USER'}
                    </span>
                  </div>
                </div>

                <div className="security-specs-card">
                  <h4>Security &amp; Permissions:</h4>
                  <ul>
                    <li>
                      <strong>Access Level:</strong>{' '}
                      <span className={isAdmin ? 'badge-admin-text' : ''}>
                        {isAdmin ? 'Company Administrator (Full Technical Access)' : 'Standard User (Checks Password Alone)'}
                      </span>
                    </li>
                    <li>
                      <strong>Technical Automata Diagnostics:</strong>{' '}
                      {isAdmin ? '✓ Full Access (DFA & Regex)' : '✗ Hidden (User-Friendly Mode)'}
                    </li>
                    <li><strong>Hashing Algorithm:</strong> bcryptjs (10 salt rounds)</li>
                    <li><strong>Authentication Token:</strong> Signed JWT Session Token</li>
                    <li><strong>Database:</strong> MongoDB Atlas Cluster</li>
                  </ul>
                </div>

                <div className="dashboard-actions">
                  <button
                    type="button"
                    className="primary-button auth-button"
                    onClick={scrollToChecker}
                  >
                    {isAdmin ? 'Open Company Technical Password Analysis' : 'Check a Password'}
                  </button>

                  <button
                    type="button"
                    className="secondary-button logout-button"
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          SecurePass — Role-Based Password Policy Validation &amp; Secure Authentication System
        </p>
        <p className="footer-subtext">
          Separate Portals: Client User Login (Checks Password Alone) &amp; Company Admin Portal (Full Technical DFA &amp; Regex Analysis)
        </p>
      </footer>
    </div>
  )
}

export default App
