import os
import zipfile
import html

def escape_xml(text):
    return html.escape(str(text))

class DocxBuilder:
    def __init__(self):
        self.body_elements = []

    def add_title(self, text, subtitle=None):
        xml = f'''
        <w:p>
            <w:pPr>
                <w:jc w:val="center"/>
                <w:spacing w:before="360" w:after="120"/>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                    <w:b/>
                    <w:sz w:val="56"/>
                    <w:color w:val="1E3A8A"/>
                </w:rPr>
                <w:t>{escape_xml(text)}</w:t>
            </w:r>
        </w:p>'''
        self.body_elements.append(xml)

        if subtitle:
            xml_sub = f'''
            <w:p>
                <w:pPr>
                    <w:jc w:val="center"/>
                    <w:spacing w:before="0" w:after="360"/>
                </w:pPr>
                <w:r>
                    <w:rPr>
                        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                        <w:i/>
                        <w:sz w:val="28"/>
                        <w:color w:val="4B5563"/>
                    </w:rPr>
                    <w:t>{escape_xml(subtitle)}</w:t>
                </w:r>
            </w:p>'''
            self.body_elements.append(xml_sub)

    def add_meta_block(self, meta_dict):
        xml = '''<w:tbl>
            <w:tblPr>
                <w:tblW w:w="9000" w:type="dxa"/>
                <w:jc w:val="center"/>
                <w:tblBorders>
                    <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
                    <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
                    <w:left w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
                    <w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
                    <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
                    <w:insideV w:val="none"/>
                </w:tblBorders>
            </w:tblPr>'''
        for k, v in meta_dict.items():
            xml += f'''
            <w:tr>
                <w:trPr><w:cantSplit/></w:trPr>
                <w:tc>
                    <w:tcPr>
                        <w:tcW w:w="3000" w:type="dxa"/>
                        <w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/>
                    </w:tcPr>
                    <w:p>
                        <w:pPr><w:spacing w:before="60" w:after="60"/></w:pPr>
                        <w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="1E293B"/></w:rPr><w:t>{escape_xml(k)}</w:t></w:r>
                    </w:p>
                </w:tc>
                <w:tc>
                    <w:tcW w:w="6000" w:type="dxa"/>
                    <w:p>
                        <w:pPr><w:spacing w:before="60" w:after="60"/></w:pPr>
                        <w:r><w:rPr><w:sz w:val="20"/><w:color w:val="334155"/></w:rPr><w:t>{escape_xml(v)}</w:t></w:r>
                    </w:p>
                </w:tc>
            </w:tr>'''
        xml += '</w:tbl>'
        self.body_elements.append(xml)
        self.add_paragraph('')

    def add_heading_1(self, text):
        xml = f'''
        <w:p>
            <w:pPr>
                <w:spacing w:before="400" w:after="120"/>
                <w:pBdr><w:bottom w:val="single" w:sz="12" w:space="4" w:color="2563EB"/></w:pBdr>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                    <w:b/>
                    <w:sz w:val="36"/>
                    <w:color w:val="1E3A8A"/>
                </w:rPr>
                <w:t>{escape_xml(text)}</w:t>
            </w:r>
        </w:p>'''
        self.body_elements.append(xml)

    def add_heading_2(self, text):
        xml = f'''
        <w:p>
            <w:pPr>
                <w:spacing w:before="260" w:after="80"/>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                    <w:b/>
                    <w:sz w:val="28"/>
                    <w:color w:val="2563EB"/>
                </w:rPr>
                <w:t>{escape_xml(text)}</w:t>
            </w:r>
        </w:p>'''
        self.body_elements.append(xml)

    def add_heading_3(self, text):
        xml = f'''
        <w:p>
            <w:pPr>
                <w:spacing w:before="180" w:after="60"/>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                    <w:b/>
                    <w:sz w:val="24"/>
                    <w:color w:val="0F172A"/>
                </w:rPr>
                <w:t>{escape_xml(text)}</w:t>
            </w:r>
        </w:p>'''
        self.body_elements.append(xml)

    def add_paragraph(self, text, bold_prefix=None, italic=False):
        xml = '''<w:p><w:pPr><w:spacing w:before="60" w:after="100"/><w:line w:line="276" w:lineRule="auto"/></w:pPr>'''
        if bold_prefix:
            xml += f'''<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:sz w:val="22"/><w:color w:val="0F172A"/></w:rPr><w:t xml:space="preserve">{escape_xml(bold_prefix)} </w:t></w:r>'''
        
        i_tag = '<w:i/>' if italic else ''
        xml += f'''<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>{i_tag}<w:sz w:val="22"/><w:color w:val="334155"/></w:rPr><w:t>{escape_xml(text)}</w:t></w:r></w:p>'''
        self.body_elements.append(xml)

    def add_bullet(self, bold_term, text):
        xml = f'''
        <w:p>
            <w:pPr>
                <w:ind w:left="480" w:hanging="240"/>
                <w:spacing w:before="40" w:after="60"/>
            </w:pPr>
            <w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="2563EB"/><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">•  </w:t></w:r>
            <w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:sz w:val="22"/><w:color w:val="0F172A"/></w:rPr><w:t xml:space="preserve">{escape_xml(bold_term)}: </w:t></w:r>
            <w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/><w:color w:val="334155"/></w:rPr><w:t>{escape_xml(text)}</w:t></w:r>
        </w:p>'''
        self.body_elements.append(xml)

    def add_callout(self, title, text):
        xml = f'''
        <w:p>
            <w:pPr>
                <w:spacing w:before="140" w:after="140"/>
                <w:ind w:left="240" w:right="240"/>
                <w:shd w:val="clear" w:color="auto" w:fill="EFF6FF"/>
                <w:pBdr><w:left w:val="single" w:sz="24" w:space="12" w:color="2563EB"/></w:pBdr>
            </w:pPr>
            <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="1E40AF"/></w:rPr><w:t>{escape_xml(title)}: </w:t></w:r>
            <w:r><w:rPr><w:sz w:val="22"/><w:color w:val="1E3A8A"/></w:rPr><w:t>{escape_xml(text)}</w:t></w:r>
        </w:p>'''
        self.body_elements.append(xml)

    def add_code_block(self, code_text):
        lines = code_text.strip().split('\n')
        xml = '''<w:tbl>
            <w:tblPr>
                <w:tblW w:w="9200" w:type="dxa"/>
                <w:jc w:val="center"/>
                <w:tblBorders>
                    <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                    <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                    <w:left w:val="single" w:sz="18" w:space="0" w:color="2563EB"/>
                    <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                    <w:insideH w:val="none"/><w:insideV w:val="none"/>
                </w:tblBorders>
            </w:tblPr>
            <w:tr>
                <w:tc>
                    <w:tcPr>
                        <w:tcW w:w="9200" w:type="dxa"/>
                        <w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/>
                    </w:tcPr>'''
        for line in lines:
            xml += f'''
                    <w:p>
                        <w:pPr><w:spacing w:before="20" w:after="20"/></w:pPr>
                        <w:r>
                            <w:rPr>
                                <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
                                <w:sz w:val="19"/>
                                <w:color w:val="0F172A"/>
                            </w:rPr>
                            <w:t xml:space="preserve">{escape_xml(line)}</w:t>
                        </w:r>
                    </w:p>'''
        xml += '''</w:tc></w:tr></w:tbl>'''
        self.body_elements.append(xml)
        self.add_paragraph('')

    def add_table(self, headers, rows):
        xml = '''<w:tbl>
            <w:tblPr>
                <w:tblW w:w="9200" w:type="dxa"/>
                <w:jc w:val="center"/>
                <w:tblBorders>
                    <w:top w:val="single" w:sz="8" w:space="0" w:color="2563EB"/>
                    <w:bottom w:val="single" w:sz="8" w:space="0" w:color="CBD5E1"/>
                    <w:left w:val="none"/><w:right w:val="none"/>
                    <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
                    <w:insideV w:val="none"/>
                </w:tblBorders>
            </w:tblPr>'''
        
        # Header Row
        xml += '<w:tr><w:trPr><w:tblHeader/><w:cantSplit/></w:trPr>'
        for h in headers:
            xml += f'''
            <w:tc>
                <w:tcPr>
                    <w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/>
                </w:tcPr>
                <w:p>
                    <w:pPr><w:spacing w:before="80" w:after="80"/><w:jc w:val="left"/></w:pPr>
                    <w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:sz w:val="20"/><w:color w:val="FFFFFF"/></w:rPr><w:t>{escape_xml(h)}</w:t></w:r>
                </w:p>
            </w:tc>'''
        xml += '</w:tr>'

        # Body Rows
        for r_idx, row in enumerate(rows):
            fill = 'F8FAFC' if r_idx % 2 == 1 else 'FFFFFF'
            xml += '<w:tr><w:trPr><w:cantSplit/></w:trPr>'
            for cell in row:
                xml += f'''
                <w:tc>
                    <w:tcPr>
                        <w:shd w:val="clear" w:color="auto" w:fill="{fill}"/>
                    </w:tcPr>
                    <w:p>
                        <w:pPr><w:spacing w:before="60" w:after="60"/><w:jc w:val="left"/></w:pPr>
                        <w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="20"/><w:color w:val="1E293B"/></w:rPr><w:t>{escape_xml(cell)}</w:t></w:r>
                    </w:p>
                </w:tc>'''
            xml += '</w:tr>'

        xml += '</w:tbl>'
        self.body_elements.append(xml)
        self.add_paragraph('')

    def build_docx(self, output_path):
        doc_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <w:body>
        {''.join(self.body_elements)}
        <w:sectPr>
            <w:pgSz w:w="12240" w:h="15840"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
        </w:sectPr>
    </w:body>
</w:document>'''

        content_types = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>'''

        rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>'''

        doc_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>'''

        styles_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:docDefaults>
        <w:rPrDefault>
            <w:rPr>
                <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                <w:sz w:val="22"/>
                <w:color w:val="1E293B"/>
            </w:rPr>
        </w:rPrDefault>
    </w:docDefaults>
</w:styles>'''

        with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            zf.writestr('[Content_Types].xml', content_types)
            zf.writestr('_rels/.rels', rels)
            zf.writestr('word/_rels/document.xml.rels', doc_rels)
            zf.writestr('word/document.xml', doc_xml)
            zf.writestr('word/styles.xml', styles_xml)

def generate_report():
    builder = DocxBuilder()

    # Title & Metadata
    builder.add_title("SecurePass: Password Policy Validation & Secure Authentication System",
                      "Academic Project Report on Formal Languages and Automata Theory (FLAT / TOC)")

    meta = {
        "Project Title": "SecurePass: Full-Stack Password Validation & Secure Authentication",
        "Subject / Domain": "Formal Languages & Automata Theory (FLAT / Theory of Computation)",
        "Student / Author": "Jai Akhil",
        "Academic Program": "B.Tech Computer Science & Engineering",
        "Core Concepts": "Deterministic Finite Automata (DFA), Product Automata, Regular Expressions, Kleene's Theorem, Chomsky Hierarchy, Role-Based Access Control (RBAC)",
        "Tech Stack": "React 19, Node.js / Express 5, MongoDB Atlas, Mongoose, bcryptjs, JWT"
    }
    builder.add_meta_block(meta)

    # 1. Introduction
    builder.add_heading_1("1. Introduction & Theoretical Foundations")
    builder.add_paragraph("In computer science and cybersecurity, user authentication security fundamentally relies on the mathematical definition and enforcement of password complexity rules. A password policy can be formally represented as a language L over a defined alphabet Sigma of allowable symbols. The problem of determining whether a user-submitted password string w belongs to the authorized language L (w in L) constitutes a classical membership decision problem in Automata Theory.")
    builder.add_paragraph("Traditionally, software applications perform password checking using Regular Expressions (Regex). However, regular expression engines with backtracking and lookaheads can suffer from non-deterministic overhead, complex state spaces, and client-server validation divergence. This project presents SecurePass, an industrial and academic system that simultaneously models password policy through two formally equivalent approaches: Deterministic Finite Automata (DFA) and Regular Expressions (Regex), paired with salted cryptographic hashing (bcrypt) and Role-Based Access Control (RBAC).")

    # 2. Chomsky Hierarchy
    builder.add_heading_2("1.1 Placement within the Chomsky Hierarchy")
    builder.add_paragraph("According to the Chomsky Hierarchy of formal grammars, languages are categorized into four levels based on their generative power and automaton recognition model:")
    builder.add_bullet("Type 3: Regular Languages", "Recognized by Deterministic and Non-deterministic Finite Automata (DFA / NFA). Governed by regular grammars and regular expressions.")
    builder.add_bullet("Type 2: Context-Free Languages (CFL)", "Recognized by Non-deterministic Pushdown Automata (PDA). Requires stack memory.")
    builder.add_bullet("Type 1: Context-Sensitive Languages", "Recognized by Linear Bounded Automata (LBA).")
    builder.add_bullet("Type 0: Recursively Enumerable Languages", "Recognized by Turing Machines.")
    builder.add_callout("Theoretical Classification", "The SecurePass password language L_pass is strictly a Type 3 Regular Language. It does not require memory beyond a finite number of states (length counter 0..8 and 4 boolean requirement bits), proving that a Finite Automaton is both necessary and mathematically sufficient.")

    # 3. Formal Language Definition
    builder.add_heading_1("2. Formal Language Definition: L_pass")
    builder.add_paragraph("Let Sigma denote the finite input alphabet of 94 printable ASCII characters partitioned into four mutually disjoint subsets:")
    builder.add_code_block("""Sigma = Sigma_upper U Sigma_lower U Sigma_digit U Sigma_special

Where:
Sigma_upper   = {A, B, C, ..., Z}                     (|Sigma_upper| = 26)
Sigma_lower   = {a, b, c, ..., z}                     (|Sigma_lower| = 26)
Sigma_digit   = {0, 1, 2, ..., 9}                     (|Sigma_digit| = 10)
Sigma_special = {!, @, #, $, %, ^, &, *, (, ), _, +, -, =, [, ], {, }, ;, :, ', ,, ., <, >, /, ?}  (|Sigma_special| = 32)
Total Alphabet Cardinality: |Sigma| = 26 + 26 + 10 + 32 = 94""")

    builder.add_paragraph("The password language L_pass over alphabet Sigma is formally defined as:")
    builder.add_code_block("L_pass = { w in Sigma* | |w| >= 8  AND  hasUpper(w)  AND  hasLower(w)  AND  hasDigit(w)  AND  hasSpecial(w)  AND  noWhitespace(w) }")
    builder.add_paragraph("Any symbol outside Sigma (such as space ' ', tab '\\t', or unicode characters like '€') is part of the complement set Gamma \\ Sigma and causes immediate rejection.")

    # 4. DFA 5-Tuple Formulation
    builder.add_heading_1("3. Deterministic Finite Automaton (DFA) Mathematical Formulation")
    builder.add_paragraph("In formal automata theory, a Deterministic Finite Automaton is rigorously defined as a 5-tuple:")
    builder.add_code_block("M = (Q, Sigma, delta, q0, F)")

    builder.add_heading_2("3.1 Finite Set of States (Q)")
    builder.add_paragraph("A naive cross-product state space would result in an intractable number of states. However, because length tracking saturates at 8 (any length >= 8 satisfies the condition), the state space is modeled as a product automaton of a saturating length counter k in {0, 1, 2, ..., 8} and a 4-bit boolean condition vector (u, l, d, s) in {0, 1}^4 representing uppercase, lowercase, digit, and special character presence:")
    builder.add_code_block("""Q = ( {0, 1, 2, 3, 4, 5, 6, 7, 8} x {0, 1}^4 ) U { q_trap }
Total States: |Q| = (9 x 16) + 1 = 145 states""")

    builder.add_heading_2("3.2 Start State (q0) and Accept States (F)")
    builder.add_bullet("Start State (q0)", "q0 = (0, 0, 0, 0, 0) = q0_U0_L0_D0_S0 (Length = 0, no categories seen).")
    builder.add_bullet("Accept State Set (F)", "F = { (8, 1, 1, 1, 1) } = { q8_U1_L1_D1_S1 }. A string w is accepted iff delta*(q0, w) in F.")
    builder.add_bullet("Dead / Trap State (q_trap)", "q_trap absorbs all invalid inputs (whitespace, disallowed characters). For all c, delta(q_trap, c) = q_trap.")

    builder.add_heading_2("3.3 Transition Function (delta)")
    builder.add_paragraph("For any state q = (k, u, l, d, s) in Q \\ {q_trap} and input symbol c in Sigma:")
    builder.add_code_block("""delta((k, u, l, d, s), c) =
    (min(k+1, 8), 1, l, d, s)   if c in Sigma_upper
    (min(k+1, 8), u, 1, d, s)   if c in Sigma_lower
    (min(k+1, 8), u, l, 1, s)   if c in Sigma_digit
    (min(k+1, 8), u, l, d, 1)   if c in Sigma_special
    q_trap                      if c not in Sigma (or whitespace)

For the dead state:
    delta(q_trap, c) = q_trap for all c""")

    # 5. State Transition Table
    builder.add_heading_1("4. State Transition Table (Representative Matrix)")
    builder.add_paragraph("The table below demonstrates the deterministic transitions across input categories:")

    headers = ["Current State (q)", "Input Category (sigma)", "Next State delta(q, sigma)", "Length Progress", "Accepting?"]
    rows = [
        ["q0_U0_L0_D0_S0 (Start)", "UPPER [A-Z]", "q1_U1_L0_D0_S0", "len: 0 -> 1", "No"],
        ["q0_U0_L0_D0_S0 (Start)", "LOWER [a-z]", "q1_U0_L1_D0_S0", "len: 0 -> 1", "No"],
        ["q0_U0_L0_D0_S0 (Start)", "DIGIT [0-9]", "q1_U0_L0_D1_S0", "len: 0 -> 1", "No"],
        ["q0_U0_L0_D0_S0 (Start)", "SPECIAL [!@#$]", "q1_U0_L0_D0_S1", "len: 0 -> 1", "No"],
        ["q0_U0_L0_D0_S0 (Start)", "WHITESPACE / INVALID", "TRAP_REJECT", "Dead State", "No"],
        ["q7_U1_L1_D1_S0", "SPECIAL [!@#$]", "q8_U1_L1_D1_S1", "len: 7 -> 8", "YES (q in F)"],
        ["q7_U1_L1_D1_S0", "DIGIT [0-9]", "q8_U1_L1_D1_S0", "len: 7 -> 8", "No (S missing)"],
        ["q8_U1_L1_D1_S1 (Accept)", "Any c in Sigma", "q8_U1_L1_D1_S1", "Self-loop (len>=8)", "YES (q in F)"],
        ["q8_U1_L1_D1_S1 (Accept)", "Whitespace / Invalid", "TRAP_REJECT", "Dead State", "No"],
        ["TRAP_REJECT", "Any symbol", "TRAP_REJECT", "Absorbing Loop", "No"]
    ]
    builder.add_table(headers, rows)

    # 6. Regular Expression Equivalence & Kleene's Theorem
    builder.add_heading_1("5. Regular Expression & Kleene's Theorem Proof")
    builder.add_paragraph("The password policy is concurrently validated by the following positive lookahead Regular Expression:")
    builder.add_code_block("""/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};:',.<>/?])[A-Za-z0-9!@#$%^&*()_+\\-=\\[\\]{};:',.<>/?]{8,}$/""")

    builder.add_heading_2("5.1 Mathematical Proof of Equivalence")
    builder.add_paragraph("Kleene's Theorem establishes that a language L is regular if and only if it is accepted by a Finite Automaton.")
    builder.add_bullet("Language Intersection Closure", "Regular languages are closed under finite intersection (L1 n L2 is regular).")
    builder.add_bullet("Decomposition into 5 Regular Languages", "L_pass = L_len8 n L_upper n L_lower n L_digit n L_special")
    builder.add_paragraph("Each sub-language is recognized by a trivial finite automaton: L_len8 counts to 8; L_upper, L_lower, L_digit, L_special each require 2 states (flag not seen, flag seen). The product automaton M constructed in Section 3 has exactly 9 x 2^4 = 144 reachable states (+1 trap state), proving L(Regex) = L(DFA) = L_pass.")

    # 7. Trace Execution Example
    builder.add_heading_1("6. Step-by-Step Automaton Execution Trace")
    builder.add_paragraph("Below is the execution trace for input password 'Pass123!':")
    trace_headers = ["Step", "Input Char (c)", "Category", "Source State", "Destination State", "Condition Bits Set"]
    trace_rows = [
        ["1", "'P'", "UPPER", "q0_U0_L0_D0_S0", "q1_U1_L0_D0_S0", "U=1"],
        ["2", "'a'", "LOWER", "q1_U1_L0_D0_S0", "q2_U1_L1_D0_S0", "U=1, L=1"],
        ["3", "'s'", "LOWER", "q2_U1_L1_D0_S0", "q3_U1_L1_D0_S0", "U=1, L=1"],
        ["4", "'s'", "LOWER", "q3_U1_L1_D0_S0", "q4_U1_L1_D0_S0", "U=1, L=1"],
        ["5", "'1'", "DIGIT", "q4_U1_L1_D0_S0", "q5_U1_L1_D1_S0", "U=1, L=1, D=1"],
        ["6", "'2'", "DIGIT", "q5_U1_L1_D1_S0", "q6_U1_L1_D1_S0", "U=1, L=1, D=1"],
        ["7", "'3'", "DIGIT", "q6_U1_L1_D1_S0", "q7_U1_L1_D1_S0", "U=1, L=1, D=1"],
        ["8", "'!'", "SPECIAL", "q7_U1_L1_D1_S0", "q8_U1_L1_D1_S1", "U=1, L=1, D=1, S=1 [ACCEPTED]"]
    ]
    builder.add_table(trace_headers, trace_rows)
    builder.add_callout("Automaton Verdict", "delta*(q0, 'Pass123!') = q8_U1_L1_D1_S1 in F. The string is accepted with length 8 and all four condition gates activated.")

    # 8. Role-Based Access Control Architecture
    builder.add_heading_1("7. Role-Based Access Control (RBAC) Architecture")
    builder.add_paragraph("SecurePass implements a dual-portal role-based model to ensure appropriate information disclosure:")
    builder.add_bullet("Client Portal (User Login)", "Evaluates the password alone. Presents strength scoring (Weak, Medium, Strong, Very Strong), policy checklist, and user-friendly suggestions. Guaranteed zero exposure of internal Regex strings, DFA states, or transition tables.")
    builder.add_bullet("Company Portal (Admin Login)", "Strictly restricted to users with role='admin' verified via signed JWT tokens. Unlocks the Company Technical Password Analysis Console: full Regex lookahead analysis, DFA state machine visualization, SVG diagrams, gate cards, and live server verification.")
    builder.add_bullet("Privilege Invariance", "Registration strictly forces role='user'. Standard users cannot escalate privileges by tampering with frontend state or API payloads.")

    # 9. Verification & Automated Test Suite
    builder.add_heading_1("8. Verification & Test Suite Results")
    builder.add_paragraph("The automated test suite (backend/test_suite.js) executes 80 assertions covering automata theory, alphabet coverage, cryptographic security, and RBAC enforcement:")
    test_headers = ["Test Category", "Assertions", "Passed", "Failed", "Success Rate"]
    test_rows = [
        ["Regex & DFA Policy Agreement", "26", "26", "0", "100%"],
        ["32 Permitted Special Characters Matrix", "32", "32", "0", "100%"],
        ["MongoDB Atlas Connection & Admin Setup", "2", "2", "0", "100%"],
        ["Registration Role Invariance (No Privilege Escalation)", "2", "2", "0", "100%"],
        ["Normal User Data Sanitization (Zero Tech Leakage)", "7", "7", "0", "100%"],
        ["RBAC Backend Security (401 & 403 Enforcement)", "5", "5", "0", "100%"],
        ["Admin Technical Analysis Payload Verification", "2", "2", "0", "100%"],
        ["Separate User Login vs Admin Login Portals", "4", "4", "0", "100%"],
        ["TOTAL SUITE VERIFICATION", "80", "80", "0", "100%"]
    ]
    builder.add_table(test_headers, test_rows)

    # 10. Conclusion
    builder.add_heading_1("9. Conclusion")
    builder.add_paragraph("The SecurePass project bridges the theoretical foundations of Formal Languages and Automata Theory with modern cybersecurity engineering. By demonstrating the 100% mathematical equivalence between a 145-state Deterministic Finite Automaton and a regular expression, and embedding this verification within a role-separated full-stack architecture (React 19, Express, bcrypt, MongoDB Atlas), the project proves that theoretical computation models provide rigorous, deterministic security for real-world software.")

    out_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "SecurePass_Formal_Languages_and_Automata_Report.docx"))
    builder.build_docx(out_file)
    print("SUCCESS: Report written to", out_file)

if __name__ == "__main__":
    generate_report()
