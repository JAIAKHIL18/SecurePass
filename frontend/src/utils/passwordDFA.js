/**
 * Deterministic Finite Automaton (DFA) Password Validator
 * 
 * Formal Definition:
 * M = (Q, Sigma, delta, q0, F)
 * 
 * - Q: Finite set of 145 states represented as:
 *      q{length}_U{0|1}_L{0|1}_D{0|1}_S{0|1} where length in 0..8 (9 * 16 = 144) + {TRAP}
 * - Sigma: 94 permitted characters:
 *      Uppercase [A-Z] (26)
 *      Lowercase [a-z] (26)
 *      Digits [0-9] (10)
 *      Special characters [!@#$%^&*()_+-=[]{};:',.<>/?] (32)
 * - delta: Q x Sigma -> Q (Deterministic transition function)
 * - q0: Start state = "q0_U0_L0_D0_S0"
 * - F: Set of accepting states = { "q8_U1_L1_D1_S1" }
 */

export const PERMITTED_SPECIALS = "!@#$%^&*()_+-=[]{};:',.<>/?";

export const DFA_SPECIFICATION = {
  name: "Password Validation DFA",
  statesCount: 145, // (9 lengths: 0..8) * (2^4 condition combinations) + 1 Trap state
  alphabetSize: 94, // 26 + 26 + 10 + 32
  startState: "q0_U0_L0_D0_S0",
  acceptState: "q8_U1_L1_D1_S1",
  trapState: "TRAP_REJECT",
  alphabetDescription: "A-Z, a-z, 0-9, and permitted special characters (!@#$%^&*()_+-=[]{};:',.<>/?)",
};

/**
 * Classifies a single input character into an alphabet category
 * @param {string} character 
 * @returns {'UPPER' | 'LOWER' | 'DIGIT' | 'SPECIAL' | 'WHITESPACE' | 'INVALID'}
 */
export const classifyCharacter = (character) => {
  if (/\s/.test(character)) {
    return 'WHITESPACE';
  }
  if (/[A-Z]/.test(character)) {
    return 'UPPER';
  }
  if (/[a-z]/.test(character)) {
    return 'LOWER';
  }
  if (/[0-9]/.test(character)) {
    return 'DIGIT';
  }
  if (/[!@#$%^&*()_+\-=[\]{};:',.<>/?]/.test(character)) {
    return 'SPECIAL';
  }
  return 'INVALID';
};

/**
 * Executes the Deterministic Finite Automaton on an input string
 * @param {string} password 
 */
export function validatePasswordDFA(password) {
  if (typeof password !== 'string') {
    password = '';
  }

  // DFA State Vector
  let length = 0;
  let hasUpper = false;
  let hasLower = false;
  let hasDigit = false;
  let hasSpecial = false;

  let isTrap = false;
  let trapReason = null;

  const transitions = [];
  let currentState = DFA_SPECIFICATION.startState;

  for (let i = 0; i < password.length; i++) {
    const character = password[i];
    const category = classifyCharacter(character);
    const previousState = currentState;

    if (isTrap) {
      // Once in trap state, DFA stays in trap state for all remaining input
      transitions.push({
        step: i + 1,
        character,
        category,
        fromState: DFA_SPECIFICATION.trapState,
        toState: DFA_SPECIFICATION.trapState,
        action: 'Stay in Trap State',
        isTrap: true,
      });
      continue;
    }

    if (category === 'WHITESPACE') {
      isTrap = true;
      trapReason = 'Whitespace is strictly disallowed';
      currentState = DFA_SPECIFICATION.trapState;
      transitions.push({
        step: i + 1,
        character: character === ' ' ? '␣ (Space)' : character,
        category,
        fromState: previousState,
        toState: DFA_SPECIFICATION.trapState,
        action: 'Trap: Whitespace detected',
        isTrap: true,
      });
      continue;
    }

    if (category === 'INVALID') {
      isTrap = true;
      trapReason = `Disallowed character '${character}' (not in permitted alphabet Sigma)`;
      currentState = DFA_SPECIFICATION.trapState;
      transitions.push({
        step: i + 1,
        character,
        category,
        fromState: previousState,
        toState: DFA_SPECIFICATION.trapState,
        action: `Trap: Disallowed character '${character}'`,
        isTrap: true,
      });
      continue;
    }

    // Valid symbol in Sigma: update state vector
    length = Math.min(length + 1, 8);
    let actionDesc = `Length -> ${length}`;

    if (category === 'UPPER') {
      if (!hasUpper) actionDesc += ', Upper Flag Activated';
      hasUpper = true;
    } else if (category === 'LOWER') {
      if (!hasLower) actionDesc += ', Lower Flag Activated';
      hasLower = true;
    } else if (category === 'DIGIT') {
      if (!hasDigit) actionDesc += ', Digit Flag Activated';
      hasDigit = true;
    } else if (category === 'SPECIAL') {
      if (!hasSpecial) actionDesc += ', Special Flag Activated';
      hasSpecial = true;
    }

    currentState = `q${length}_U${Number(hasUpper)}_L${Number(hasLower)}_D${Number(hasDigit)}_S${Number(hasSpecial)}`;

    transitions.push({
      step: i + 1,
      character,
      category,
      fromState: previousState,
      toState: currentState,
      action: actionDesc,
      isTrap: false,
    });
  }

  // Acceptance condition: delta*(q0, w) == "q8_U1_L1_D1_S1"
  const accepted = !isTrap && currentState === DFA_SPECIFICATION.acceptState;

  return {
    accepted,
    currentState: password.length === 0 ? DFA_SPECIFICATION.startState : currentState,
    finalState: accepted ? 'ACCEPT (q8_U1_L1_D1_S1)' : currentState,
    isTrap,
    trapReason,
    transitions,
    details: {
      length: isTrap ? 0 : length,
      actualLength: password.length,
      hasUpper,
      hasLower,
      hasDigit,
      hasSpecial,
      noWhitespace: !isTrap || trapReason !== 'Whitespace is strictly disallowed',
      onlyPermitted: !isTrap,
    },
  };
}
