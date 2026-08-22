# Prompt-Injection & Tool-Hijack Test Corpus — Free Sample

This is a **free sample** of Fetchgate's *Prompt-Injection & Tool-Hijack
Test Corpus*: a structured set of adversarial test cases for evaluating
whether an agent or LLM application resists prompt injection, tool
hijacking, and jailbreak attempts.

**Free sample: 10 of the 156 defensive test cases** in the full corpus,
deliberately restricted to **low/medium-severity, well-known, publicly
documented techniques** — classic "ignore previous instructions" style
overrides, encoded-instruction tricks (ROT13, binary/base64-family), the
DAN/STAN jailbreak family, and simple system-prompt-metadata probing.
Nothing novel and nothing high- or critical-severity is included here.

- [**Get the full corpus ($29)**](https://growthchief5.gumroad.com/l/injection-corpus)

## Defensive-use note

**Every case in this sample (and in the full corpus) is a defensive
robustness probe, meant to be run only against a system you own or are
explicitly authorized to test.** These are not exploits against a third
party, and nothing here targets a real system, a real credential, or a
real vulnerability. Use this to test *your own* agent's resistance to
well-documented prompt-injection patterns before you ship it — not to
attack anything you don't control.

## What's in this sample

- `schema.json` — the full JSON Schema every corpus case (sample or full)
  validates against, copied verbatim from the full product.
- `corpus-sample.jsonl` — 10 cases, one JSON object per line, each with:
  `id`, `category`, `severity`, `technique`, `attack_input`,
  `injection_vector`, `expected_safe_behavior`, `detection_notes`,
  `source`.

| id | category | severity | technique |
|---|---|---|---|
| direct-injection-006 | direct-injection | low | negation-trick |
| direct-injection-013 | direct-injection | low | faq-formatting-trick |
| direct-injection-004 | direct-injection | medium | priority-claim |
| direct-injection-015 | direct-injection | medium | instruction-override |
| encoding-obfuscation-002 | encoding-obfuscation | medium | rot13-encoded-instruction |
| encoding-obfuscation-006 | encoding-obfuscation | low | leetspeak-obfuscation |
| encoding-obfuscation-020 | encoding-obfuscation | medium | binary-encoding-obfuscation |
| jailbreak-roleplay-007 | jailbreak-roleplay | low | opposite-day |
| jailbreak-roleplay-002 | jailbreak-roleplay | medium | dan-variant-stan |
| system-prompt-leak-005 | system-prompt-leak | low | metadata-leak |

Every case is copied **verbatim** from the paid product, including its
`source` citation (Lakera's Gandalf taxonomy, the DAN taxonomy, or
"original" for cases authored for this corpus).

## Why it's small (and why it skips the harder stuff)

This is a teaser, not the product. The full corpus has 156 cases across
seven categories — including indirect injection, tool hijacking, and data
exfiltration — spanning low through critical severity, plus a
dependency-light Python evaluation harness scaffold and a guide covering
methodology, scoring, and responsible use. Those categories carry more
sensitive attack content and aren't appropriate for a free public sample.
See the [full product listing](https://growthchief5.gumroad.com/l/injection-corpus)
for the complete breakdown.

## License note

This sample is free to use, share, and run against your own systems. The
full corpus is single-team internal use — no reselling or republishing the
raw case files — see the full product's README for details.
