"""
Adapter interface for the Agent Eval Harness.

A ModelAdapter is the one seam you need to touch to point this harness at
your own agent, model, or API. Implement `.generate(messages, tools)` and
the rest of the harness (runner.py, judge.py, run_eval.py) works unchanged.

Keeping this interface deliberately tiny -- one method, plain lists/dicts
in, one small return type out, no framework base classes beyond this ABC --
is what makes "bring your own model" a one-file change instead of a rewrite.
See http_adapter.py (the dependency-free default) and anthropic_adapter.py
(an optional reference adapter) for two concrete implementations, and
run_eval.py's --adapter <custom-module-path> option for wiring in your own.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Optional


class ModelAdapter(ABC):
    """Minimal interface every adapter implements.

    `generate` takes a list of message dicts in the common
    `[{"role": "user"|"assistant"|"system", "content": "..."}, ...]` shape
    (the same shape used by the Anthropic and OpenAI Messages/Chat APIs),
    and an optional list of tool definitions (`[{"name", "description",
    "input_schema"}, ...]`) for tool-selection cases. It returns an
    AdapterResponse -- never a bare string -- so tool-call-match scoring
    has somewhere to put tool_calls even for adapters that never see tools.
    """

    @abstractmethod
    def generate(
        self, messages: list[dict], tools: Optional[list[dict]] = None
    ) -> "AdapterResponse":
        raise NotImplementedError


class AdapterResponse:
    """Normalized response every adapter returns, regardless of provider.

    text: the model/agent's final text response. May be empty if the
        agent's turn was only a tool call.
    tool_calls: list of {"name": ..., "arguments": {...}} the agent
        attempted, if any. Required for scoring_method == "tool-call-match"
        cases -- an adapter that can't surface tool calls (e.g. a plain
        text-only HTTP endpoint) will always fail those cases, which is
        the correct, honest outcome, not a bug to work around.
    raw: the original provider response object/dict, kept only for
        debugging -- never relied on by the scoring logic.
    """

    __slots__ = ("text", "tool_calls", "raw")

    def __init__(
        self,
        text: str = "",
        tool_calls: Optional[list[dict]] = None,
        raw: Any = None,
    ):
        self.text = text
        self.tool_calls = tool_calls or []
        self.raw = raw

    def to_dict(self) -> dict:
        return {"text": self.text, "tool_calls": self.tool_calls}

    def __repr__(self) -> str:  # pragma: no cover -- debugging convenience
        return f"AdapterResponse(text={self.text!r}, tool_calls={self.tool_calls!r})"
