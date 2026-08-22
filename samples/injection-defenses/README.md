# Prompt-Injection Defenses Playbook & Detection Ruleset — Free Sample

This is a **free sample** of Fetchgate's *Prompt-Injection Defenses
Playbook & Detection Ruleset*: the defense counterpart to the Prompt-
Injection & Tool-Hijack Test Corpus — a machine-readable detection
ruleset plus a layered-defense playbook for hardening an agent or LLM
application against prompt injection, tool hijacking, data exfiltration,
system-prompt leaking, jailbreaks, and encoding-based obfuscation.

**Free sample: 10 of the 84 detection rules** in the full ruleset, spread
across all 7 attack categories.

- [**Get the full ruleset + playbook ($39)**](https://growthchief5.gumroad.com/l/injection-defenses)

## What's in this sample

- `rules/schema.json` — the full JSON Schema every detection rule
  validates against, copied verbatim from the full product.
- `rules/detection-rules-sample.json` — 10 of the 84 rules in the full
  ruleset, copied verbatim, including each rule's honest
  `falsePositiveNotes` field (this ruleset is not sold as a magic filter
  — every rule documents what benign content can also trigger it):

| id | category | severity | action |
|---|---|---|---|
| PID-DIR-001 | direct-injection | high | block |
| PID-DIR-004 | direct-injection | medium | flag |
| PID-IND-001 | indirect-injection | high | block |
| PID-IND-005 | indirect-injection | medium | flag |
| PID-TH-001 | tool-hijack | critical | block |
| PID-TH-009 | tool-hijack | high | flag |
| PID-EXF-005 | data-exfiltration | medium | flag |
| PID-LEAK-002 | system-prompt-leak | high | flag |
| PID-ENC-001 | encoding-obfuscation | medium | review |
| PID-JB-001 | jailbreak-roleplay | high | block |

(see `rules/detection-rules-sample.json` for each rule's full match
pattern and `falsePositiveNotes`)

## Why it's small

This is a teaser, not the product. The full ruleset has 84 rules across
all 7 categories (regex, keyword, and named-heuristic based), plus
`PLAYBOOK.md` (a structured threat model and six-layer defense taxonomy
with concrete DO/DON'T guidance), `detector/scan.py` (a dependency-light
reference detector you can run as a CLI or import as a library), and
`GUIDE.md` (a four-phase adoption plan and tuning guidance). See the [full
product listing](https://growthchief5.gumroad.com/l/injection-defenses)
for the complete breakdown.

This ruleset pairs with the [Prompt-Injection & Tool-Hijack Test
Corpus](https://growthchief5.gumroad.com/l/injection-corpus) — the corpus
gives you attack cases to test against, this ruleset gives you the
mitigations.

## Honesty note

Prompt injection does not have a known complete solution. This is
defense-in-depth: it raises the cost of a successful attack and gives you
detection/review mechanisms, but it doesn't make any system immune. See
the full product's `GUIDE.md` for the complete limitations discussion.

## License note

This sample is free to use, share, and build against. The full product is
single-team internal use — no resale, redistribution, or repackaging as
part of a competing product — see the full product's README for details.
