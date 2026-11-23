
import { useState } from 'react'
import './App.css'
import { validatePasswordDFA } from './utils/passwordDFA'

function App() {
  // Navigation
  const [currentPage, setCurrentPage] = useState('home')

  // Password analyzer
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Registration form
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [registerMessage, setRegisterMessage] = useState('')

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginMessage, setLoginMessage] = useState('')


  /* =====================================
     PASSWORD POLICY
  ===================================== */

  const passwordRequirements = (value) => [
    {
      label: 'At least 8 characters',
      test: value.length >= 8,
    },
    {
      label: 'One uppercase letter (A-Z)',
      test: /[A-Z]/.test(value),
    },
    {
      label: 'One lowercase letter (a-z)',
      test: /[a-z]/.test(value),
    },
    {
      label: 'One number (0-9)',
      test: /[0-9]/.test(value),
    },
    {
      label: 'One special character',
      test: /[!@#$%^&*()_+\-=\[\]{};:',.<>/?]/.test(value),
    },
    {
      label: 'No spaces or whitespace',
      test: /^\S*$/.test(value),
    },
  ]


  /* =====================================
     PASSWORD ANALYZER
  ===================================== */

  const requirements = passwordRequirements(password)

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};:',.<>/?])\S{8,}$/

  const regexValid = passwordRegex.test(password)

  const dfaResult = validatePasswordDFA(password)
  const dfaValid = dfaResult.accepted

  const validationAgreement = regexValid === dfaValid

  const isValid = requirements.every((rule) => rule.test)

  const passedRequirements = requirements.filter(
    (rule) => rule.test,
  ).length

  const strengthPercentage =
    (passedRequirements / requirements.length) * 100


  const getStrength = () => {
    if (password.length === 0) return 'Enter a password'
    if (passedRequirements <= 2) return 'Weak'
    if (passedRequirements <= 4) return 'Moderate'
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


  /* =====================================
     REGISTRATION VALIDATION
  ===================================== */

  const handleRegister = (event) => {
    event.preventDefault()

    setRegisterMessage('')

    if (!registerName.trim()) {
      setRegisterMessage('Please enter your full name.')
      return
    }

    if (!registerEmail.trim()) {
      setRegisterMessage('Please enter your email address.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(registerEmail)) {
      setRegisterMessage('Please enter a valid email address.')
      return
    }

    const registrationRequirements =
      passwordRequirements(registerPassword)

    const registrationPasswordValid =
      registrationRequirements.every((rule) => rule.test)

    if (!registrationPasswordValid) {
      setRegisterMessage(
        'Your password does not meet all security requirements.',
      )
      return
    }

    if (registerPassword !== confirmPassword) {
      setRegisterMessage('Passwords do not match.')
      return
    }

    setRegisterMessage(
      'Registration form validation successful! Backend connection will be added next.',
    )
  }


  /* =====================================
     LOGIN VALIDATION
  ===================================== */

  const handleLogin = (event) => {
    event.preventDefault()

    setLoginMessage('')

    if (!loginEmail.trim() || !loginPassword) {
      setLoginMessage('Please enter both email and password.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(loginEmail)) {
      setLoginMessage('Please enter a valid email address.')
      return
    }

    setLoginMessage(
      'Login form validation successful! Backend authentication will be added next.',
    )
  }


  /* =====================================
     NAVIGATION
  ===================================== */

  const goToPage = (page) => {
    setCurrentPage(page)

    // Clear messages when changing pages
    setRegisterMessage('')
    setLoginMessage('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }


  /* =====================================
     MAIN APPLICATION
  ===================================== */

  return (
    <div className="app">

      {/* Navigation */}

      <header className="navbar">

        <div
          className="logo"
          onClick={() => goToPage('home')}
          style={{ cursor: 'pointer' }}
        >
          <span className="logo-icon">🔐</span>
          SecurePass
        </div>

        <nav>
          <button
            className="nav-button"
            onClick={() => goToPage('home')}
          >
            Home
          </button>

          <button
            className="nav-button"
            onClick={() => goToPage('home')}
          >
            Password Checker
          </button>

          <button
            className="nav-button"
            onClick={() => goToPage('login')}
          >
            Login
          </button>

          <button
            className="nav-register-button"
            onClick={() => goToPage('register')}
          >
            Register
          </button>
        </nav>

      </header>


      <main>

        {/* =================================
            HOME PAGE
        ================================= */}

        {currentPage === 'home' && (

          <>

            {/* Hero section */}

            <section className="hero-section" id="home">

              <div className="hero-badge">
                Password Security Analyzer
              </div>

              <h1>
                Build stronger passwords.
                <br />
                <span>Protect your digital identity.</span>
              </h1>

              <p>
                Analyze your password security using Regular
                Expressions and Deterministic Finite Automata.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  document
                    .getElementById('checker')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Check Your Password
              </button>

            </section>


            {/* Password checker */}

            <section className="checker-section" id="checker">

              <div className="checker-card">

                <div className="checker-heading">

                  <h2>Password Analyzer</h2>

                  <p>
                    Test your password against our security policy.
                  </p>

                </div>


                {/* Password input */}

                <label htmlFor="password">
                  Enter password
                </label>

                <div className="password-input-wrapper">

                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password..."
                    autoComplete="off"
                  />

                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>

                </div>


                {/* Password strength */}

                <div className="strength-section">

                  <div className="strength-header">

                    <span>Password strength</span>

                    <span
                      className={`strength-label ${getStrengthClass()}`}
                    >
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


                {/* Requirements */}

                <div className="requirements">

                  <h3>Password requirements</h3>

                  {requirements.map((rule, index) => (

                    <div className="requirement" key={index}>

                      <span
                        className={`requirement-icon ${
                          rule.test ? 'passed' : 'failed'
                        }`}
                      >
                        {rule.test ? '✓' : '○'}
                      </span>

                      <span
                        className={
                          rule.test
                            ? 'rule-passed'
                            : 'rule-failed'
                        }
                      >
                        {rule.label}
                      </span>

                    </div>

                  ))}

                </div>


                {/* Overall validation */}

                <div
                  className={`validation-result ${
                    isValid ? 'valid' : 'invalid'
                  }`}
                >
                  {password.length === 0
                    ? 'Enter a password to begin analysis'
                    : isValid
                      ? '✓ Password meets all security requirements'
                      : '✗ Password does not meet all requirements'}
                </div>


                {/* Regex validation */}

                <div className="regex-panel">

                  <div className="regex-heading">

                    <h3>Regex Validation</h3>

                    <span className="tech-badge">
                      Regular Expression
                    </span>

                  </div>

                  <div className="regex-pattern">

                    <code>{String(passwordRegex)}</code>

                  </div>

                  <div
                    className={`regex-status ${
                      regexValid ? 'success' : 'failure'
                    }`}
                  >

                    <span>Regex Result</span>

                    <strong>
                      {password.length === 0
                        ? 'WAITING'
                        : regexValid
                          ? 'ACCEPTED'
                          : 'REJECTED'}
                    </strong>

                  </div>

                </div>


                {/* DFA validation */}

                <div className="regex-panel">

                  <div className="regex-heading">

                    <h3>DFA Validation</h3>

                    <span className="tech-badge">
                      Deterministic Finite Automaton
                    </span>

                  </div>

                  <div
                    className={`regex-status ${
                      dfaValid ? 'success' : 'failure'
                    }`}
                  >

                    <span>DFA Result</span>

                    <strong>
                      {password.length === 0
                        ? 'WAITING'
                        : dfaValid
                          ? 'ACCEPTED'
                          : 'REJECTED'}
                    </strong>

                  </div>


                  {/* DFA details */}

                  {password.length > 0 && dfaResult.details && (

                    <div className="dfa-details">

                      <h4>DFA Validation Details</h4>

                      <p>
                        Length requirement:{' '}
                        {dfaResult.details.length >= 8
                          ? '✓ Passed'
                          : '✗ Failed'}
                      </p>

                      <p>
                        Uppercase:{' '}
                        {dfaResult.details.hasUpper
                          ? '✓ Found'
                          : '✗ Missing'}
                      </p>

                      <p>
                        Lowercase:{' '}
                        {dfaResult.details.hasLower
                          ? '✓ Found'
                          : '✗ Missing'}
                      </p>

                      <p>
                        Digit:{' '}
                        {dfaResult.details.hasDigit
                          ? '✓ Found'
                          : '✗ Missing'}
                      </p>

                      <p>
                        Special character:{' '}
                        {dfaResult.details.hasSpecial
                          ? '✓ Found'
                          : '✗ Missing'}
                      </p>

                    </div>

                  )}

                </div>


                {/* Regex and DFA comparison */}

                <div
                  className={`validation-result ${
                    validationAgreement ? 'valid' : 'invalid'
                  }`}
                >

                  {password.length === 0
                    ? 'Enter a password to compare validation methods'
                    : validationAgreement
                      ? '✓ Regex and DFA results agree'
                      : '⚠ Regex and DFA results differ'}

                </div>


                {/* DFA transition history */}

                {password.length > 0 &&
                  dfaResult.transitions && (

                    <div className="dfa-details">

                      <h4>DFA Transition History</h4>

                      <div className="dfa-transition-list">

                        {dfaResult.transitions.map(
                          (transition, index) => (

                            <div
                              className="dfa-transition"
                              key={index}
                            >

                              <span>
                                Character:{' '}
                                <strong>
                                  {transition.character}
                                </strong>
                              </span>

                              <span>
                                Category: {transition.category}
                              </span>

                              <span>
                                State: {transition.state}
                              </span>

                            </div>

                          ),
                        )}

                      </div>

                    </div>

                  )}

              </div>

            </section>

          </>

        )}


        {/* =================================
            REGISTER PAGE
        ================================= */}

        {currentPage === 'register' && (

          <section className="auth-section">

            <div className="auth-card">

              <div className="auth-heading">

                <div className="hero-badge">
                  Create Account
                </div>

                <h2>Join SecurePass</h2>

                <p>
                  Create an account with a secure password.
                </p>

              </div>


              <form onSubmit={handleRegister}>

                {/* Full name */}

                <div className="form-group">

                  <label htmlFor="register-name">
                    Full Name
                  </label>

                  <input
                    id="register-name"
                    type="text"
                    value={registerName}
                    onChange={(event) =>
                      setRegisterName(event.target.value)
                    }
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />

                </div>


                {/* Email */}

                <div className="form-group">

                  <label htmlFor="register-email">
                    Email Address
                  </label>

                  <input
                    id="register-email"
                    type="email"
                    value={registerEmail}
                    onChange={(event) =>
                      setRegisterEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                  />

                </div>


                {/* Password */}

                <div className="form-group">

                  <label htmlFor="register-password">
                    Password
                  </label>

                  <input
                    id="register-password"
                    type="password"
                    value={registerPassword}
                    onChange={(event) =>
                      setRegisterPassword(event.target.value)
                    }
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                  />

                </div>


                {/* Password requirements */}

                <div className="register-requirements">

                  <p>Password must contain:</p>

                  {passwordRequirements(
                    registerPassword,
                  ).map((rule, index) => (

                    <div
                      className="requirement"
                      key={index}
                    >

                      <span
                        className={`requirement-icon ${
                          rule.test ? 'passed' : 'failed'
                        }`}
                      >
                        {rule.test ? '✓' : '○'}
                      </span>

                      <span
                        className={
                          rule.test
                            ? 'rule-passed'
                            : 'rule-failed'
                        }
                      >
                        {rule.label}
                      </span>

                    </div>

                  ))}

                </div>


                {/* Confirm password */}

                <div className="form-group">

                  <label htmlFor="confirm-password">
                    Confirm Password
                  </label>

                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                  />

                </div>


                {/* Register message */}

                {registerMessage && (

                  <div
                    className={`form-message ${
                      registerMessage.includes('successful')
                        ? 'success'
                        : 'error'
                    }`}
                  >
                    {registerMessage}
                  </div>

                )}


                {/* Submit */}

                <button
                  type="submit"
                  className="primary-button auth-button"
                >
                  Create Account
                </button>

              </form>


              <p className="auth-switch">

                Already have an account?{' '}

                <button
                  type="button"
                  onClick={() => goToPage('login')}
                >
                  Login
                </button>

              </p>

            </div>

          </section>

        )}


        {/* =================================
            LOGIN PAGE
        ================================= */}

        {currentPage === 'login' && (

          <section className="auth-section">

            <div className="auth-card">

              <div className="auth-heading">

                <div className="hero-badge">
                  Secure Authentication
                </div>

                <h2>Welcome Back</h2>

                <p>
                  Login to your SecurePass account.
                </p>

              </div>


              <form onSubmit={handleLogin}>

                {/* Email */}

                <div className="form-group">

                  <label htmlFor="login-email">
                    Email Address
                  </label>

                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(event) =>
                      setLoginEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                  />

                </div>


                {/* Password */}

                <div className="form-group">

                  <label htmlFor="login-password">
                    Password
                  </label>

                  <input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(event) =>
                      setLoginPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />

                </div>


                {/* Login message */}

                {loginMessage && (

                  <div
                    className={`form-message ${
                      loginMessage.includes('successful')
                        ? 'success'
                        : 'error'
                    }`}
                  >
                    {loginMessage}
                  </div>

                )}


                {/* Submit */}

                <button
                  type="submit"
                  className="primary-button auth-button"
                >
                  Login
                </button>

              </form>


              <p className="auth-switch">

                Don't have an account?{' '}

                <button
                  type="button"
                  onClick={() => goToPage('register')}
                >
                  Register
                </button>

              </p>

            </div>

          </section>

        )}

      </main>

   {/* Footer */}

<footer className="footer">
  <p>
    SecurePass — Password Policy Validation and Secure
    Authentication System
  </p>
</footer>

    </div>
  )
}

export default App





