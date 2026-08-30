#!/usr/bin/env python3
"""Add the de-concentrated outcome split to summary.json.

WHY THIS EXISTS. The 2026-08-28 audit's headline was "8,235 of 15,329 remote
URLs (53.7%) answered tools/list". A directory operator (u/Alvasilev on the
r/mcp thread, 2026-08-30) made the fair objection that with two operators
holding 28.6% of live servers between them, that number is to a large extent
a statement about two hosts' week:

    "If pipeworx.io and mcp.ai really are 29.4% of live servers, then 54% is
     to a large extent a statement about two hosts' week. Worth publishing it
     with and without them, otherwise a bad morning at one provider reads as
     the ecosystem moving."

Correct, and it changes the headline: without those two domains the answer
rate is 45.5%, not 53.7%. Their own URLs answer at 97.7%, so they are not a
representative sample of anything — they are two fleets that happen to be up.

Reads the per-URL file the free dataset already ships, so anyone can re-run
this and get the same numbers:

    python3 add_deconcentrated.py

Idempotent: rewrites the `deconcentrated` key in summary.json each time.
"""

import collections
import json
import pathlib
from urllib.parse import urlparse

HERE = pathlib.Path(__file__).parent
SERVERS = HERE / "free" / "mcp-registry-audit-2026-08-28.servers.jsonl"
SUMMARY = HERE / "summary.json"

# The two operators named in the audit's own concentration table.
FARM_DOMAINS = ("pipeworx.io", "mcp.ai")


def registrable(host: str) -> str:
    """Last two labels. Crude, but these two domains are both plain
    second-level names, and every other host only needs to NOT match them."""
    parts = host.lower().split(".")
    return ".".join(parts[-2:]) if len(parts) >= 2 else host.lower()


def main() -> None:
    total: collections.Counter = collections.Counter()
    rest: collections.Counter = collections.Counter()
    farm: collections.Counter = collections.Counter()
    farm_urls: collections.Counter = collections.Counter()

    with SERVERS.open() as fh:
        for line in fh:
            row = json.loads(line)
            host = urlparse(row["url"]).hostname or ""
            outcome = row["outcome"]
            total[outcome] += 1
            domain = registrable(host)
            if domain in FARM_DOMAINS:
                farm[outcome] += 1
                farm_urls[domain] += 1
            else:
                rest[outcome] += 1

    def share(counter: collections.Counter) -> dict:
        n = sum(counter.values())
        return {k: round(v / n, 4) for k, v in counter.items()} if n else {}

    summary = json.loads(SUMMARY.read_text())
    summary["deconcentrated"] = {
        "note": (
            "The same probe run, split by whether the URL belongs to one of the two "
            "operators that dominate the registry. Published because a headline answer "
            "rate over a base that is 15.7% two fleets is mostly a statement about those "
            "two fleets."
        ),
        "excluded_domains": list(FARM_DOMAINS),
        "farm_urls_by_domain": dict(farm_urls),
        "all": {"urls": sum(total.values()), "outcomes": dict(total), "share": share(total)},
        "excluding_farms": {
            "urls": sum(rest.values()),
            "outcomes": dict(rest),
            "share": share(rest),
        },
        "farms_only": {
            "urls": sum(farm.values()),
            "outcomes": dict(farm),
            "share": share(farm),
        },
    }
    SUMMARY.write_text(json.dumps(summary, indent=1) + "\n")

    def line(label: str, counter: collections.Counter) -> None:
        n = sum(counter.values())
        print(f"{label:34s} N={n:6d}  ok={counter['ok']:6d} ({100 * counter['ok'] / n:.1f}%)")

    line("all URLs", total)
    line("excluding the two operators", rest)
    line("those two operators only", farm)
    print(f"wrote {SUMMARY}")


if __name__ == "__main__":
    main()
