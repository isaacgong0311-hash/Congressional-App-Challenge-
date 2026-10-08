# Lantern Editorial Frontend Renovation Design

**Date:** 2026-10-08  
**Status:** Approved in conversation  
**Scope:** Home, First Day, Explain, and their shared visual shell

## Goal

Make the entire Lantern experience feel like one premium editorial product: warm, calm, legible, and confident. A judge should find the fictional demo immediately, and a family should understand the next action and its evidence without decoding the interface.

## Direction

Evolve the existing warm paper, deep green, ivory, serif, cobalt, and amber identity. Sharpen type contrast, spacing rhythm, and active states. Use subtle gradients, selective translucency, and short transitions to add depth without turning content into decoration. Content is visible in the base state; motion only enhances changes after they occur.

This is a focused renovation of presentation and interaction clarity. It preserves URLs, fictional and live case separation, API contracts, domain records, planner behavior, event history, exports, provider boundaries, and browser-storage rules.

## Shared shell

- Make the header, route labels, preference controls, buttons, cards, notices, and focus treatment feel related across all three surfaces.
- Keep a high-contrast primary action and quiet secondary controls. On mobile, the current step or task remains the visual center.
- Establish repeatable title, eyebrow, body, and metadata scales through existing CSS tokens and shared components rather than introducing a UI library.
- Use hover and pressed feedback, focus-visible outlines, and 150–250 ms state transitions. Respect reduced motion and never depend on animation or an observer to reveal content.

## Home

- Lead with the family problem and a direct guided-demo action in the first viewport.
- Give the fictional plan specimen stronger contrast and clearer labels for ready, unresolved, and source-linked states.
- Keep the explanation, privacy boundary, synthetic evaluation caveat, and secondary Explain route in a readable sequence.
- Use editorial whitespace and one restrained visual accent per section; avoid repetitive floating cards.

## First Day

- Make the current step and next action easy to scan in the guided and ordinary journeys.
- Keep documents, proposed facts, human confirmations, blockers, and plan outcomes visually distinct using consistent labels and color meaning.
- In the conflict step, show both source statements as peers, then emphasize the question to ask and the single dependent update after resolution.
- Make Decision Trace readable as a five-stage explanation on narrow and wide screens, with text relationships surviving without connector lines.
- Keep export controls and printable plan legible, including unresolved items and source references.

## Explain

- Make the intake choice and primary action obvious without crowding the page.
- Separate what the letter means, what is urgent, and what to do next through hierarchy and stable tabs.
- Keep the original document available beside results on desktop and through a clear disclosure on mobile.
- Preserve distinct crisis and scam treatment, recoverable errors, and provider limitations.

## Accessibility and responsive contract

- Verify 390, 768, 1024, and 1440 px widths, 200% zoom, keyboard navigation, reduced motion, large text, high contrast, print, and English/Spanish critical paths.
- No horizontal overflow, clipped action, obscured sticky control, hidden base content, or serious/critical axe violation is acceptable.
- Use semantic text for source, AI proposal, human decision, and deterministic result. Color and motion never carry meaning alone.

## Verification

Run lint, unit tests, synthetic evaluation, production build, mobile/desktop browser journeys, export checks, and responsive visual regression. Update visual baselines only after inspecting the actual changed screens. Check the provider-free guided journey makes zero API calls. Retain the existing Lighthouse budgets: performance at least 90 and accessibility at least 95 on Home and First Day, with CLS no greater than 0.1.

## Boundaries

No paid service, new UI library, backend change, account, persistent case storage, new AI behavior, or unsupported impact claim. The independent Round Rock ISD example remains clearly unendorsed. The fictional case remains the competition-safe default.
