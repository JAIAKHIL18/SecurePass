# Deterministic Finite Automaton (DFA) Formal Specification

## 1. Executive Summary

This document provides the formal mathematical specification, state space analysis, and language equivalence proof for the **Deterministic Finite Automaton (DFA)** implemented in **SecurePass**.

SecurePass validates passwords by modeling the password policy as a formal language $L \subset \Sigma^*$ over a restricted alphabet $\Sigma$, and accepts input strings using a state-minimized product automaton.

---

## 2. Formal Language Definition

Let the password policy define a formal language $L_{pass}$ over an alphabet $\Sigma$:

$$L_{pass} = \{ w \in \Sigma^* \mid |w| \ge 8 \land \text{hasUpper}(w) \land \text{hasLower}(w) \land \text{hasDigit}(w) \land \text{hasSpecial}(w) \land \text{noWhitespace}(w) \}$$

Where:
- $\text{hasUpper}(w) \iff \exists c \in w \text{ such that } c \in [A-Z]$
- $\text{hasLower}(w) \iff \exists c \in w \text{ such that } c \in [a-z]$
- $\text{hasDigit}(w) \iff \exists c \in w \text{ such that } c \in [0-9]$
- $\text{hasSpecial}(w) \iff \exists c \in w \text{ such that } c \in \Sigma_{special}$
- $\text{noWhitespace}(w) \iff \forall c \in w, c \notin \{\text{' '}, \text{'\t'}, \text{'\n'}, \text{'\r'}\}$

---

## 3. The 5-Tuple Formulation: $M = (Q, \Sigma, \delta, q_0, F)$

Formally, a Deterministic Finite Automaton is a 5-tuple:

$$M = (Q, \Sigma, \delta, q_0, F)$$

### 3.1 Input Alphabet ($\Sigma$)

The alphabet $\Sigma$ consists of exactly $94$ printable ASCII characters partitioned into four mutually disjoint subsets:

$$\Sigma = \Sigma_{upper} \cup \Sigma_{lower} \cup \Sigma_{digit} \cup \Sigma_{special}$$

1. **Uppercase Letters ($\Sigma_{upper}$)** ($|\Sigma_{upper}| = 26$):
   $$\Sigma_{upper} = \{A, B, C, \dots, Z\}$$
2. **Lowercase Letters ($\Sigma_{lower}$)** ($|\Sigma_{lower}| = 26$):
   $$\Sigma_{lower} = \{a, b, c, \dots, z\}$$
3. **Numeric Digits ($\Sigma_{digit}$)** ($|\Sigma_{digit}| = 10$):
   $$\Sigma_{digit} = \{0, 1, 2, 3, 4, 5, 6, 7, 8, 9\}$$
4. **Permitted Special Characters ($\Sigma_{special}$)** ($|\Sigma_{special}| = 32$):
   $$\Sigma_{special} = \{!, @, \#, \$, \%, \hat{}, \&, *, (, ), \_, +, -, =, \[, \], \{, \}, ;, :, ', ,, ., <, >, /, ?\}$$

$$\text{Total Alphabet Size: } |\Sigma| = 26 + 26 + 10 + 32 = 94$$

> **Disallowed Alphabet ($\Gamma \setminus \Sigma$)**:
> Whitespace characters (` `, `\t`, `\n`) and unlisted characters (e.g. Unicode symbols, emoji, backtick, tilde, pipe, double quote) are **not** in $\Sigma$. Receipt of any $c \notin \Sigma$ triggers an immediate deterministic transition to the dead/trap state $q_{trap}$.

---

### 3.2 Finite Set of States ($Q$)

A naive cross-product automaton over 4 independent conditions and arbitrary length would yield an infinite state set. However, because our length constraint is monotonic and saturates at length $8$, the automaton only needs to track:

1. **Length Tracker ($k$)**: $k \in \{0, 1, 2, 3, 4, 5, 6, 7, 8\}$ where $k=8$ signifies $\ge 8$ characters.
2. **Uppercase Flag ($u$)**: $u \in \{0, 1\}$
3. **Lowercase Flag ($l$)**: $l \in \{0, 1\}$
4. **Digit Flag ($d$)**: $d \in \{0, 1\}$
5. **Special Flag ($s$)**: $s \in \{0, 1\}$
6. **Dead/Trap State ($q_{trap}$)**: Absorbs all strings containing invalid characters or whitespace.

The state space $Q$ is therefore defined as:

$$Q = \left( \{0, 1, 2, 3, 4, 5, 6, 7, 8\} \times \{0, 1\}^4 \right) \cup \{ q_{trap} \}$$

$$\text{Total State Count: } |Q| = (9 \times 2^4) + 1 = 9 \times 16 + 1 = 145 \text{ states}$$

Each valid state is denoted by the coordinate tuple:
$$q = (k, u, l, d, s) \equiv \text{q}k\text{\_U}u\text{\_L}l\text{\_D}d\text{\_S}s$$

---

### 3.3 Initial State ($q_0$)

At initialization before processing input, the length is $0$ and no character classes have been observed:

$$q_0 = (0, 0, 0, 0, 0) \equiv \text{q0\_U0\_L0\_D0\_S0}$$

---

### 3.4 Set of Accept States ($F$)

A string $w$ is accepted if and only if the machine halts in a state where the length is at least 8 ($k=8$) and all four requirement bits are set ($u=1, l=1, d=1, s=1$):

$$F = \{ (8, 1, 1, 1, 1) \} \equiv \{ \text{q8\_U1\_L1\_D1\_S1} \}$$

$$|F| = 1$$

---

### 3.5 State Transition Function ($\delta$)

The deterministic transition function $\delta: Q \times \Sigma \to Q$ is defined as follows:

For any non-trap state $q = (k, u, l, d, s)$ and input symbol $c$:

$$\delta((k, u, l, d, s), c) = \begin{cases}
(\min(k+1, 8), 1, l, d, s) & \text{if } c \in \Sigma_{upper} \\
(\min(k+1, 8), u, 1, d, s) & \text{if } c \in \Sigma_{lower} \\
(\min(k+1, 8), u, l, 1, s) & \text{if } c \in \Sigma_{digit} \\
(\min(k+1, 8), u, l, d, 1) & \text{if } c \in \Sigma_{special} \\
q_{trap} & \text{if } c \notin \Sigma
\end{cases}$$

For the dead state $q_{trap}$:

$$\forall c \in \Sigma \cup (\Gamma \setminus \Sigma), \quad \delta(q_{trap}, c) = q_{trap}$$

---

## 4. Extended Transition Function ($\hat{\delta}$)

The extended transition function $\hat{\delta}: Q \times \Sigma^* \to Q$ processes an entire string $w = c_1 c_2 \dots c_n$:

1. **Base Case**:
   $$\hat{\delta}(q, \epsilon) = q$$
2. **Recursive Step**:
   $$\hat{\delta}(q, w c) = \delta(\hat{\delta}(q, w), c)$$

An input string $w$ is accepted by the DFA if and only if:
$$\hat{\delta}(q_0, w) \in F$$

---

## 5. State Transition Matrix (Representative Slice)

Below is the state transition matrix illustrating transitions from key states across character classes:

| Current State $q$ | Input Symbol Category | Next State $\delta(q, c)$ | Length $k'$ | Flags $(u, l, d, s)$ | Acceptance? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `q0_U0_L0_D0_S0` (Start) | $c \in \Sigma_{upper}$ | `q1_U1_L0_D0_S0` | 1 | $(1, 0, 0, 0)$ | No |
| `q0_U0_L0_D0_S0` (Start) | $c \in \Sigma_{lower}$ | `q1_U0_L1_D0_S0` | 1 | $(0, 1, 0, 0)$ | No |
| `q0_U0_L0_D0_S0` (Start) | $c \in \Sigma_{digit}$ | `q1_U0_L0_D1_S0` | 1 | $(0, 0, 1, 0)$ | No |
| `q0_U0_L0_D0_S0` (Start) | $c \in \Sigma_{special}$ | `q1_U0_L0_D0_S1` | 1 | $(0, 0, 0, 1)$ | No |
| `q0_U0_L0_D0_S0` (Start) | $c \notin \Sigma$ or Space | `TRAP_REJECT` | 0 | Dead | No |
| `q7_U1_L1_D1_S0` | $c \in \Sigma_{special}$ | `q8_U1_L1_D1_S1` | 8 | $(1, 1, 1, 1)$ | **YES ($q \in F$)** |
| `q7_U1_L1_D1_S0` | $c \in \Sigma_{digit}$ | `q8_U1_L1_D1_S0` | 8 | $(1, 1, 1, 0)$ | No |
| `q8_U1_L1_D1_S1` (Accept) | $c \in \Sigma$ | `q8_U1_L1_D1_S1` | 8 | $(1, 1, 1, 1)$ | **YES ($q \in F$)** |
| `q8_U1_L1_D1_S1` (Accept) | $c \notin \Sigma$ or Space | `TRAP_REJECT` | - | Dead | No |
| `TRAP_REJECT` | Any character | `TRAP_REJECT` | - | Dead | No |

---

## 6. Equivalence with Regular Expressions

### 6.1 Regular Expression Formulation

The policy is defined as the following regular expression:

```regex
^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};:',.<>/?])[A-Za-z0-9!@#$%^&*()_+\-=[\]{};:',.<>/?]{8,}$
```

### 6.2 Kleene's Theorem & Equivalence Proof

By **Kleene's Theorem**, a language $L$ is regular if and only if it is recognized by a finite automaton.

1. **Length Monoid**: The sub-language $L_{len \ge 8} = \Sigma^8 \Sigma^*$ is regular because it is recognized by a standard 9-state counter automaton.
2. **Sub-alphabet Languages**:
   - $L_U = \Sigma^* \Sigma_{upper} \Sigma^*$ is regular.
   - $L_L = \Sigma^* \Sigma_{lower} \Sigma^*$ is regular.
   - $L_D = \Sigma^* \Sigma_{digit} \Sigma^*$ is regular.
   - $L_S = \Sigma^* \Sigma_{special} \Sigma^*$ is regular.
3. **Closure under Intersection**:
   Regular languages are closed under finite intersection ($\cap$):
   $$L_{pass} = L_{len \ge 8} \cap L_U \cap L_L \cap L_D \cap L_S$$
   The product automaton constructed in Section 3 is the direct Cartesian product DFA recognizing this intersection.
4. **Determinism**: For every state $q \in Q$ and symbol $c \in \Sigma$, there is exactly one destination state $\delta(q, c)$. Therefore, the machine is strictly deterministic.
5. **Time Complexity**: $\mathcal{O}(n)$ where $n = |w|$, requiring a single left-to-right scan.
6. **Space Complexity**: $\mathcal{O}(1)$ auxiliary space (5 integer/boolean registers).
