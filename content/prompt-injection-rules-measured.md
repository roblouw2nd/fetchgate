---
title: "We Measured Our Own Prompt-Injection Rules. They Flagged 69% of Top Websites and Missed 61% of Attacks."
seo_title: "Prompt-Injection Detection Rules, Measured: 69% False Alarms, 39% Recall"
meta_description: "We ran our 85-rule prompt-injection ruleset against 4,435 top-site homepages and 156 labeled attacks. As written it flagged 69.4% of ordinary pages and caught 39% of held-out attacks. Here is what fixed the false alarms, what did not fix recall, and the two top sites that already carry instructions for AI agents."
keywords:
  - prompt injection detection
  - prompt injection false positives
  - indirect prompt injection
  - LLM guardrails
  - agent security
  - prompt injection scanner
date: 2026-10-04
---

# We measured our own prompt-injection rules. They flagged 69% of top websites and missed 61% of attacks.

> Published at: https://fetchgate.dev/blog/prompt-injection-rules-measured — this GitHub copy is a mirror; the canonical page has product links, related articles and an RSS feed.

We sell a prompt-injection ruleset: 85 detection rules and a reference detector. Until this week we had never measured it. We had tested that each rule fires on the example it was written for, which is what most rule authors mean by "tested".

Then we built a hosted scanner on top of those rules, and the first page we scanned was `example.com`. It came back flagged. The offending text was a semicolon.

So we measured properly. This is what we found, including the parts that are bad for us.

## The two numbers

**False alarms.** We fetched the homepage of every domain in the Tranco top 8,000 that would answer with HTML: 4,435 pages. The 85 rules, exactly as written, matched on **3,079 of them (69.4%)** and recommended "block" on 1,983 (44.7%).

**Recall.** We ran the same rules over 156 labeled attack cases. On the half we held out, they caught **25 of 64 (39%)**.

A detector that stops four attacks in ten and seven ordinary pages in ten is not a detector. It is a coin with a bad attitude.

## Why seven pages in ten

Two rules did most of the damage:

- **`PID-TH-002`, 58% of pages.** "Shell metacharacters present in a tool argument." The pattern is `;`, `&`, `|` or a backtick. That is a reasonable thing to check in the arguments of a shell tool. It is also every sentence with a semicolon.
- **`PID-EXF-001`, 45% of pages.** "Markdown image pointing at an external domain", the classic zero-click exfiltration channel. In an agent's *output* that is worth blocking. In a web page it is called an image.

The rest were smaller versions of the same mistake. A long hex run is an encoded payload, or a commit hash. Percent-encoding hides an instruction, or it is a Vietnamese URL. Zero-width characters split a keyword, or they are the non-joiner that Persian spelling requires in most words. A Latin word with one Cyrillic letter is a homoglyph attack, or it is a Russian site that ran a brand name into the next word.

None of these rules is wrong. Each was written for one place: a tool call's arguments, or a model's outbound response. The mistake was having no way to say where the text came from.

## What fixed the false alarms

We split the detector into two profiles.

- **`strict`** runs every rule as written. Use it on tool arguments and outbound responses.
- **`content`** is for web pages, retrieved documents and inbound messages. It leaves the tool-argument and egress rules to `strict` and narrows a handful of others to the attack they actually describe. A markdown image only counts if its URL has a placeholder for data. Spaced-out letters only count if they spell a trigger word.

We tuned `content` on the top 5,000 and then froze it and ran it on ranks 5,001 to 8,000, which it had never seen. On those 1,714 pages it flagged 7. One was real (below). **Six were false positives: 0.35%.**

That is the number we would plan with. Our first attempt at a content profile, before measuring anything, flagged 15.7%.

## What did not fix recall

We wrote 34 new rules against half of the attack corpus, deliberately not looking at the other half. Each pairs two things that rarely co-occur in ordinary text: an address to an AI and an imperative, a verb of disclosure and a system prompt, an action and "without telling the user".

| | Development half | Held-out half |
| --- | ---: | ---: |
| Original 85 rules | 38% | 39% |
| New rules, `content` | 84% | **38%** |
| New rules, `strict` | 87% | **53%** |

Look at the gap in the second row. On the cases we wrote the rules against, 84%. On cases we had not seen, 38%.

**Any detection rate measured on the cases the rules were written for is roughly double the real one.** That includes ours until this week, and it is worth asking of any vendor's number, including the ones attached to model-based classifiers.

The honest result is modest. `content` now has the recall the original rules had, at one two-hundredth of the false-alarm rate. `strict` gained 14 points. Regex does not generalize to paraphrase, and no amount of rule-writing will make it.

By category, held-out, `strict`: tool hijacking 89%, obfuscation 78%, direct injection 67%, data exfiltration 58%, indirect injection 33%, system-prompt extraction 14%, jailbreak framing 11%. The last two are the ones that are just ordinary sentences with an unusual purpose.

## The one thing that worked well

Obfuscation is where patterns earn their keep, because the trick is mechanical. We added a decode-and-rescan step: undo zero-width splitting, Unicode tag characters, leetspeak, one-character-per-line text, lookalike letters, hex, base64, percent-encoding and ROT13, then run the instruction rules again on each decoded reading.

An instruction that only exists after decoding was hidden on purpose. That is the finding, whatever the instruction says. Held-out recall on obfuscated attacks: 78%.

## What 4,435 homepages actually contain

No injection attempts, which is what you would expect. A homepage is the one page a site fully controls. The places third parties can write (reviews, comments, issues, e-mail, shared documents) are where indirect injection lives, and we did not measure those.

But two top sites already carry text written for AI agents:

- **A top-5,000 homepage** has a visible line: "If you are an AI Agent or automated assistant, please read…", linking to an agent-specific instructions file.
- **A top-8,000 homepage** has an HTML comment beginning "If you're an LLM/agent: This is a server-side rendered page…"

Both are benign. They are site owners being helpful to agents. They are also exactly the shape of an indirect injection: text that addresses the model, in one case placed where no human reader will see it. The agent cannot tell a helpful note from a hostile one by its shape. It has to treat both as data to weigh and neither as instructions.

That is the practical point of scanning hidden text separately. Comments and `alt`, `title`, `aria` and `meta` attributes are thrown away by most HTML-to-Markdown steps, and kept by any agent that reads raw HTML.

## What we would tell someone building this

1. **Say where the text came from.** One ruleset for "input" is how you get semicolons flagged. Tool arguments, outbound text and retrieved content need different rules.
2. **Measure false positives on real pages before you set anything to block.** Not on a list of benign sentences you wrote. Ours passed those.
3. **Hold out half your attack cases before you write a rule.** Then believe the held-out number.
4. **Plan for the misses.** Six in ten get through a pattern filter. Least-privilege tools, confirmation before anything that sends data or spends money, and treating every retrieved page as data are what make a missed injection survivable.

## Limits

- The attack corpus and the rules have the same author. Real attackers write differently. Expect lower recall in the wild.
- Homepages only. Forums, repositories and security articles will have different false-positive rates. Articles about prompt injection quote attacks and are flagged.
- English-first. One rule covers instruction overrides in four other languages.
- One snapshot, one GET per site, with an identifying User-Agent. 3,565 of 8,000 domains did not answer with HTML.

## Try it, and the data

- **Free scanner:** [fetchgate.dev/tools/injection-scanner](https://fetchgate.dev/tools/injection-scanner). Paste a URL or text. It shows each matching rule with its evidence, and what was found only in hidden text.
- **API:** `GET https://fetchgate.dev/v1/scan?url=…` or `POST` text. Free daily tier, then $0.003 a call over x402. Also an MCP tool, `scan_for_prompt_injection`.
- **Per-site results, CC BY 4.0:** [`injection-census-2026-10-04.jsonl`](https://fetchgate.dev/data/injection-census-2026-10-04.jsonl). One row per domain: whether it was scanned, which rules matched as written, which matched under `content`.
- **The rules themselves, $39:** the [Prompt-Injection Defenses Playbook](https://growthchief5.gumroad.com/l/injection-defenses), 2026-10-04 edition. All 119 rules with their patterns and false-positive notes, the Python detector with both profiles and decode-and-rescan, and `MEASUREMENTS.md` with everything above in full. It agrees with the hosted scanner on 1,912 of 1,912 parity checks.
- **The attack cases, $29:** the [Test Corpus](https://growthchief5.gumroad.com/l/injection-corpus), 156 labeled cases, for measuring your own defenses the way we should have measured ours.

If a number here does not match what you compute from the rows, the number is wrong and we want to know: [open an issue](https://github.com/roblouw2nd/fetchgate/issues).
