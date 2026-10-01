# Papilve CV modernisation workspace

This folder holds design/architecture audit notes and implementation planning for the 2026 modernisation.

## Baseline
- Original site source remains the reference.
- Local Docker baseline: http://localhost:8080
- Preserve the site's distinctive concepts rather than converting it into a generic CV template.
- No production/GCP deployment until the redesigned local version is reviewed.

## Direction
Preserve/evolve: cinematic hero video/image, brain visual identity, interactive skill exploration, immersive career storytelling, expandable  detail interactions, portfolio/story scenes.

Modernise: typography, spacing, navigation, information hierarchy, responsive behaviour, motion choreography, scroll-driven reveals, transitions, micro-interactions, accessibility and performance.

Avoid: generic SaaS/portfolio template, arbitrary animation on every element, fake skill percentages, premature framework rewrite, removal of personality.

## Workflow
1. Read-only audit and proposal.
2. Agree architecture/content structure.
3. Implement locally in bounded passes.
4. Desktop + tablet + mobile QA.
5. Commit/push after review.
6. Deploy separately to the Curriculum Vitae GCP project.
