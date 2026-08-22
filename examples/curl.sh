#!/usr/bin/env bash
# Fetchgate — curl examples. https://fetchgate.dev
set -euo pipefail
BASE="https://fetchgate.dev"

echo "# Reader: URL -> clean Markdown (free tier: 30/day per IP)"
curl -s "$BASE/v1/read?url=https://example.com" | jq .

echo "# Reader: URL -> structured metadata"
curl -s "$BASE/v1/meta?url=https://example.com" | jq .

echo "# Store: list products"
curl -s "$BASE/v1/products" | jq '.products[] | {id, name, priceUsd}'

echo "# Store: start a purchase -> HTTP 402 with x402 payment requirements"
curl -s "$BASE/v1/buy/x402-registry-2026-08-21" | jq .
# Pay with an x402-capable client, then re-request with the X-PAYMENT header;
# on success you get { downloadUrl, expiresInSeconds }.

echo "# Discovery documents for agents"
curl -s "$BASE/llms.txt"
curl -s "$BASE/.well-known/x402" | jq .
