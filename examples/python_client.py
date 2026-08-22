"""Fetchgate — minimal Python client. https://fetchgate.dev

Reader endpoints and the product catalog are plain HTTP (free tier, no auth).
Paying beyond the free tier — or buying a product — uses x402: the server
replies 402 with payment requirements, an x402 client signs and pays (USDC on
Base), and re-requests with an `X-PAYMENT` header. This script shows the free
paths and how to read a 402 challenge; wire an x402 client (e.g. `x402`/
`x402-requests`) to complete a paid call.

Requires: requests  (pip install requests)
"""
from __future__ import annotations
import requests

BASE = "https://fetchgate.dev"


def read_url(url: str) -> dict:
    """URL -> { url, title, markdown, fetchedAt }."""
    r = requests.get(f"{BASE}/v1/read", params={"url": url}, timeout=30)
    r.raise_for_status()
    return r.json()


def get_metadata(url: str) -> dict:
    r = requests.get(f"{BASE}/v1/meta", params={"url": url}, timeout=30)
    r.raise_for_status()
    return r.json()


def list_products() -> list[dict]:
    r = requests.get(f"{BASE}/v1/products", timeout=30)
    r.raise_for_status()
    return r.json()["products"]


def purchase_terms(product_id: str) -> dict:
    """Return the x402 payment requirements for a product (the 402 body)."""
    r = requests.get(f"{BASE}/v1/buy/{product_id}", timeout=30)
    if r.status_code == 402:
        return r.json()  # { x402Version, accepts: [{ network, maxAmountRequired, payTo, asset, ... }] }
    r.raise_for_status()
    return r.json()


if __name__ == "__main__":
    print("markdown:", read_url("https://example.com")["markdown"][:80], "...")
    for p in list_products():
        print(f"  {p['id']:38} ${p['priceUsd']:<5} {p['name']}")
    terms = purchase_terms("x402-registry-2026-08-21")
    accept = terms["accepts"][0]
    print(f"to buy x402-registry: pay {int(accept['maxAmountRequired'])/1e6} USDC "
          f"on {accept['network']} to {accept['payTo']}")
