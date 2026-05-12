# Launch Studio Sample Fixtures

This directory contains golden dry-run JSON exports generated from Launch Studio.

## Fixture Contract

A valid dry-run export fixture must satisfy:

- `dryRun === true`
- `page.headline` is a non-empty string
- `strategy.primaryCTA` is a non-empty string
- `page.sections` is a non-empty array
- `seo` is an object
- `faq` is an array
- `compliance.violations` is empty or missing
- `productionWrite` is false or missing
- `wordpressPostId` is null or missing

## Purpose

These fixtures are used to verify that Launch Studio can generate structured, safe, import-ready payloads without writing to WordPress production.

## Safety Rule

Dry-run fixtures must never contain real production write results, real WordPress post IDs, secrets, API keys, or customer private data.
