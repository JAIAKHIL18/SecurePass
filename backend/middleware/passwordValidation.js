/**
 * Password Policy Validation Middleware
 * Enforces identical validation using both Regular Expressions and Deterministic Finite Automata (DFA).
 * 
 * Password Policy:
 * 1. At least 8 characters in length
 * 2. At least one uppercase letter (A-Z)
 * 3. At least one lowercase letter (a-z)
 * 4. At least one numeric digit (0-9)
 * 5. At least one special character from the permitted set
 * 6. No whitespace characters
 * 7. Only permitted characters allowed
 */

// Permitted special characters: !@#$%^&*()_+-=[]{};:',.<>/?
const PERMITTED_SPECIALS = "!@#$%^&*()_+-=[]{};:',.<>/?";

// Regex requiring lookaheads for all 4 categories and restricted character class
const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};:',.<>/?])[A-Za-z0-9!@#$%^&*()_+\-=[\]{};:',.<>/?]{8,}$/;

/**
 * Validates password using Regular Expressions
 * @param {string} password 
 * @returns {boolean}
 */
const validatePasswordRegex = (password) => {
    if (typeof password !== "string") return false;
    return passwordRegex.test(password);
};

/**
 * Validates password using Deterministic Finite Automaton (DFA)
 * Mathematically modeled as M = (Q, Sigma, delta, q0, F)
 * Product automaton tracking length (0..8) and 4 condition bits (U, L, D, S)
 * Transitions to trap state on any character not in Sigma (or on whitespace)
 * 
 * @param {string} password 
 * @returns {boolean}
 */
const validatePasswordDFA = (password) => {
    if (typeof password !== "string") return false;

    let hasUpper = false;
    let hasLower = false;
    let hasDigit = false;
    let hasSpecial = false;
    let length = 0;

    for (const char of password) {
        if (/[A-Z]/.test(char)) {
            hasUpper = true;
        } else if (/[a-z]/.test(char)) {
            hasLower = true;
        } else if (/[0-9]/.test(char)) {
            hasDigit = true;
        } else if (/[!@#$%^&*()_+\-=[\]{};:',.<>/?]/.test(char)) {
            hasSpecial = true;
        } else {
            // Invalid character or whitespace encountered -> DFA enters Trap/Reject state
            return false;
        }

        length++;
    }

    return (
        length >= 8 &&
        hasUpper &&
        hasLower &&
        hasDigit &&
        hasSpecial
    );
};

/**
 * Extended DFA analysis with state transitions and step-by-step progress tracking
 * Used for authenticated administrative diagnostics
 */
const getDFAAnalysis = (password) => {
    if (typeof password !== "string") password = "";

    let hasUpper = false;
    let hasLower = false;
    let hasDigit = false;
    let hasSpecial = false;
    let length = 0;
    let isTrap = false;
    let trapReason = null;
    let currentState = "q0_U0_L0_D0_S0";
    const transitions = [];

    for (let i = 0; i < password.length; i++) {
        const char = password[i];
        let category = "INVALID";
        if (/\s/.test(char)) category = "WHITESPACE";
        else if (/[A-Z]/.test(char)) category = "UPPER";
        else if (/[a-z]/.test(char)) category = "LOWER";
        else if (/[0-9]/.test(char)) category = "DIGIT";
        else if (/[!@#$%^&*()_+\-=[\]{};:',.<>/?]/.test(char)) category = "SPECIAL";

        const previousState = currentState;

        if (isTrap) {
            transitions.push({
                step: i + 1,
                character: char,
                category,
                fromState: "TRAP_REJECT",
                toState: "TRAP_REJECT",
                isTrap: true
            });
            continue;
        }

        if (category === "WHITESPACE" || category === "INVALID") {
            isTrap = true;
            trapReason = category === "WHITESPACE" ? "Whitespace not permitted" : `Illegal character '${char}'`;
            currentState = "TRAP_REJECT";
            transitions.push({
                step: i + 1,
                character: char,
                category,
                fromState: previousState,
                toState: "TRAP_REJECT",
                isTrap: true
            });
            continue;
        }

        length = Math.min(length + 1, 8);
        if (category === "UPPER") hasUpper = true;
        else if (category === "LOWER") hasLower = true;
        else if (category === "DIGIT") hasDigit = true;
        else if (category === "SPECIAL") hasSpecial = true;

        currentState = `q${length}_U${Number(hasUpper)}_L${Number(hasLower)}_D${Number(hasDigit)}_S${Number(hasSpecial)}`;

        transitions.push({
            step: i + 1,
            character: char,
            category,
            fromState: previousState,
            toState: currentState,
            isTrap: false
        });
    }

    const accepted = !isTrap && length >= 8 && hasUpper && hasLower && hasDigit && hasSpecial;

    return {
        accepted,
        currentState,
        finalState: accepted ? "ACCEPT (q8_U1_L1_D1_S1)" : currentState,
        isTrap,
        trapReason,
        transitions,
        details: { length, hasUpper, hasLower, hasDigit, hasSpecial }
    };
};

/**
 * Combined validation returning dual validation results and detailed rule breakdown
 * @param {string} password 
 */
const validatePassword = (password) => {
    const isString = typeof password === "string";
    const regexResult = validatePasswordRegex(password);
    const dfaResult = validatePasswordDFA(password);

    const requirements = {
        minLength: isString && password.length >= 8,
        hasUpper: isString && /[A-Z]/.test(password),
        hasLower: isString && /[a-z]/.test(password),
        hasDigit: isString && /[0-9]/.test(password),
        hasSpecial: isString && /[!@#$%^&*()_+\-=[\]{};:',.<>/?]/.test(password),
        noWhitespace: isString && password.length > 0 && !/\s/.test(password),
        onlyPermitted: isString && password.length > 0 && /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};:',.<>/?]+$/.test(password)
    };

    return {
        regexResult,
        dfaResult,
        isValid: regexResult && dfaResult,
        requirements
    };
};

module.exports = {
    PERMITTED_SPECIALS,
    passwordRegex,
    validatePasswordRegex,
    validatePasswordDFA,
    getDFAAnalysis,
    validatePassword
};
