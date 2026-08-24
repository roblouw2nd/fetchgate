---
title: "How to Build an LLM Eval Harness That Catches Regressions Before Your Users Do"
seo_title: "LLM Eval Harness Guide (2026): Catch Regressions Early"
meta_description: "A working eval loop for agents: pointwise LLM-as-judge scoring, the 3 biases that break it, and why tool-selection needs an exact-match scorer instead."
keywords:
  - LLM eval harness
  - agent evaluation framework
  - LLM-as-judge bias
  - agent regression testing
  - CI eval gate for LLM
date: 2026-08-24
---

# How to build an LLM eval harness that catches regressions before your users do

The moment an agent or LLM-backed feature ships, you inherit a problem traditional testing doesn't have: the same input can produce a different, still-plausible-looking output tomorrow, because a model version changed, a prompt got tweaked, or a tool description shifted. Unit tests catch "this function throws." Nothing catches "this agent used to pick the right tool 98% of the time and now it's 84%" except an eval suite that actually runs regularly — and that suite needs a scorer that doesn't fool itself.

This is a working structure for that: test-case format, scoring methods, and specifically the failure modes of LLM-as-judge scoring that make most homegrown eval setups produce false confidence instead of a real regression signal.

## Two scoring methods, and when to use which

Not every case needs a model to judge it. A tool-selection eval — "did the agent call the right tool with the right arguments" — has a ground-truth answer:

```json
{
  "input": {
    "messages": [{"role": "user", "content": "What's the weather like in Tokyo right now?"}],
    "tools": [
      {"name": "get_current_weather", "description": "..."},
      {"name": "get_weather_forecast", "description": "..."},
      {"name": "search_web", "description": "..."}
    ]
  },
  "expected": {"tool_name": "get_current_weather", "arguments": {"location": "Tokyo"}},
  "scoring_method": "tool-call-match",
  "tags": ["tool-selection", "weather", "distractor-similar-tools"]
}
```

`tool-call-match` is exact comparison — no model call, no ambiguity, no bias to mitigate. Notice the case is deliberately built with **distractor tools**: `get_weather_forecast` is a plausible wrong answer for "right now," and a case design that doesn't include near-miss distractors isn't actually testing tool *selection*, just tool *existence*. The same discipline applies to a `contains` scorer for open-ended-but-checkable answers (a date, a converted unit, a specific fact) — deterministic, cheap, no judge needed.

Where a deterministic scorer can't work — "is this a good summary," "did the agent refuse appropriately without being preachy about it" — you need LLM-as-judge. And that's where most eval setups quietly stop being trustworthy.

## LLM-as-judge is the most failure-prone part of the harness, and here's why

Three specific, documented biases break naive judge prompts:

**Position bias.** In a pairwise comparison (response A vs. response B), judges disproportionately favor whichever response is shown first — sometimes second, depending on model and prompt (Zheng et al. 2024, "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena"). The fix isn't a better prompt, it's a different scoring shape: **score pointwise** — one candidate against a rubric, never two candidates against each other. Pairwise comparison is more sensitive for close calls, but it costs 2x the judge calls and reintroduces the exact bias you're trying to avoid; if you need it, randomize left/right per call and average both orderings.

**Verbosity bias.** Judges — LLM or human — tend to rate longer, more elaborately-hedged answers as better even when they're not more correct. This isn't something you can leave implicit and hope the judge figures out; an unconstrained judge prompt reliably reproduces the bias. The judge's system prompt has to explicitly instruct it to ignore response length and penalize padding/hedging that doesn't add correctness. That instruction is required, not decorative framing.

**Self-preference bias.** A model tends to score its own family's outputs more favorably than another model's (Zheng et al. 2024; Wataoka et al. 2024, "Self-Preference Bias in LLM-as-a-Judge," arXiv:2410.21819). If the model under test and the judge model are the same model or family, treat PASS verdicts with extra skepticism — or better, use a genuinely different provider/model as judge than the one being evaluated. This means your harness needs **separate adapter flags for the model under test and the judge** (`--adapter` vs. `--judge-adapter`), not one model reused for both roles.

One more structural fix, easy to skip: **rubric-based, not free-form, scoring.** An unconstrained "is this good?" judge prompt lets the model's own priors substitute for your actual acceptance criteria. Every judged case needs an explicit rubric field so the judge is scoring against *your* stated criteria, not its own taste about what a good answer looks like.

## What a real run looks like

A report from an actual regression suite run, 10 cases:

```json
{
  "summary": {
    "total": 10, "passed": 9, "failed": 1, "pass_rate": 0.9,
    "by_severity": {
      "medium": {"total": 5, "passed": 5, "pass_rate": 1.0},
      "low":    {"total": 2, "passed": 2, "pass_rate": 1.0},
      "high":   {"total": 2, "passed": 1, "pass_rate": 0.5},
      "critical": {"total": 1, "passed": 1, "pass_rate": 1.0}
    }
  }
}
```

The `by_severity` breakdown is the part a flat pass-rate number hides: 90% overall looks fine until you notice the high-severity bucket is only at 50%. A CI gate that only checks the aggregate pass rate would let that regression through; one that checks per-severity thresholds wouldn't. Each individual result carries its own `rationale` (what actually matched, or the judge's reasoning), `tags`, and `severity` — enough to triage a failure without re-running anything.

## Suite design: four categories cover most of what breaks

A minimal but real suite splits into `task_completion`, `tool_selection`, `refusal_safety`, and `regression`. The first three test capability; the fourth is specifically for catching *drift* — cases that passed last version and need to keep passing, not new capability probes. One honest scoping note if you're building `refusal_safety` cases yourself: **ordinary refusal behavior and adversarial jailbreak resistance are different eval surfaces.** A refusal_safety suite testing "does the agent decline a task it should reasonably decline" is not the same thing as testing whether an agent holds up against an adversarial prompt-injection or jailbreak attempt — that needs its own adversarial test corpus, not a repurposed refusal suite.

## What this doesn't replace

A 40-case seed suite (or any hand-curated set) is a starting point to expand with your own domain cases, not a comprehensive benchmark — and LLM-as-judge bias is *reduced* by the mitigations above, not eliminated. Mature frameworks (promptfoo, DeepEval, Ragas, AgentBench, tau-bench) exist because eval at scale — thousands of cases, multi-turn conversation state, human-preference calibration — outgrows a lightweight scaffold like this one eventually. The honest use case for a stdlib-only harness like this is the gap before that: you need *something* running in CI catching regressions today, not a mature framework six weeks from now.

---

The scoring module, bias mitigations, and report format above are from Fetchgate's **[Agent Eval Harness Templates](https://growthchief5.gumroad.com/l/eval-harness)** ($39) — 40 example cases across the four suites above, the pointwise LLM-as-judge scorer with every bias mitigation built into the actual prompt (not just described in a README), a stdlib-only Python CLI, and adapters for bringing your own model or using the included Claude Messages API reference adapter. [A free sample](https://github.com/roblouw2nd/fetchgate/tree/main/samples/eval-harness) has 5 cases plus the full schema and adapter interface if you want to see the real thing before buying.
