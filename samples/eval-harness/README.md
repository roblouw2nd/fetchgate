# Agent Eval Harness Templates — Free Sample

This is a **free, runnable sample** of Fetchgate's *Agent Eval Harness
Templates*: a starter kit for evaluating an agent or LLM application —
test-case schemas, example suites, an LLM-as-judge scorer, and a CLI
runner.

**Free sample: 5 test cases + the test-case schema + the adapter
interface** — enough to see the exact shape you'd plug your own agent
into, out of the full kit's 40 cases across 4 suites plus the judge and
runner.

- [**Get the full kit ($39)**](https://growthchief5.gumroad.com/l/eval-harness)

## What's in this sample

- `schema/test_case.schema.json` — the full JSON Schema (draft 2020-12)
  every test case validates against, copied verbatim from the full
  product. Covers all four suite types (task-completion, tool-selection,
  refusal-safety, regression), so you can see the whole shape even though
  this sample only includes task-completion cases.
- `suites/task_completion-sample.jsonl` — 5 of the 10 cases in the full
  `task_completion.jsonl` suite, copied verbatim: factual QA, arithmetic,
  code generation, summarization (LLM-judge scored), and date math.
- `harness/adapters/base.py` — the actual `ModelAdapter` interface from
  the full product, copied verbatim. This is the one file you touch to
  point the harness at your own agent or model: implement
  `.generate(messages, tools) -> AdapterResponse` and the rest of the
  harness works unchanged.

## What's deliberately not included

This sample does **not** include `judge.py` (the LLM-as-judge scorer) or
`runner.py` (the suite-loading/scoring core) — those are the load-bearing
parts of the paid product. You can read the test-case shape and the
adapter interface here, but you'll need the full kit to actually run an
eval end-to-end.

## Why it's small

This is a teaser, not the product. The full kit ships 40 test cases across
4 suites (task-completion, tool-selection, refusal-safety, regression), a
documented-bias LLM-as-judge scorer, a CLI runner that produces a scored
JSON report plus a human-readable summary, and both a dependency-free HTTP
adapter and an optional Anthropic reference adapter. See the [full product
listing](https://growthchief5.gumroad.com/l/eval-harness) for the complete
breakdown and how it compares to promptfoo/DeepEval/Ragas/OpenAI Evals.

## License note

This sample is free to use, share, and adapt. The full kit carries its own
license terms — see the full product's README for details.
