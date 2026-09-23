# Lantern Premium Frontend Pass

Date: 2026-09-22  
Status: Approved for planning  
Scope: Frontend only

## Product decision

Lantern will receive an integrated premium-product pass that balances a compelling three-minute competition demonstration with fast, clear real-family use. The target is the finish level of a paid civic, healthcare, or financial product rather than a marketing template.

The pass will improve presentation, interaction quality, responsive behavior, and frontend maintainability together. It will not add or change APIs, provider behavior, extraction logic, planner rules, persistence formats, domain records, authentication, or backend services.

## Product architecture

Lantern will feel like one focused product with three connected surfaces:

1. The public site establishes trust, explains the evidence-to-plan model, and leads with the fictional three-minute First Day demo.
2. First Day is the flagship guided case workspace for turning school instructions into a source-backed plan.
3. Explain is a secondary document assistant for understanding general letters and finding practical next steps.

All surfaces will use the same header behavior, navigation language, accessibility preferences, interaction primitives, typography, spacing rhythm, color tokens, focus treatment, and responsive rules. Existing URLs and data contracts remain stable.

## Experience design

Every screen will present one obvious next best action. Supporting actions remain available but visually secondary. Stage changes move focus to the new content, preserve user decisions, and avoid arbitrary scroll positions.

The shared product shell will provide:

- a clear active route and accessible mobile navigation;
- persistent high-contrast and large-text preferences;
- compact utility controls that do not crowd narrow screens;
- consistent primary, secondary, destructive, and technical actions;
- shared notices, badges, segmented tabs, disclosures, dialogs, and side sheets;
- stable loading, empty, warning, success, and recoverable-error states.

First Day will behave like a guided workspace. Mobile layouts prioritize the active task and fixed navigation without obscuring interactive controls. Desktop layouts use available width for evidence comparison rather than decorative whitespace. The conflict screen remains the signature interaction, with both values and sources visible, a prepared question prominent, and the affected task shown after resolution.

Explain will behave like a focused document assistant. Intake, processing, meaning, urgency, next steps, resources, and original-letter context will form one clear hierarchy. Crisis and scam guidance remain visibly distinct. The original image stays available beside results on desktop and through an accessible disclosure on mobile.

## Visual system

The existing editorial Lantern identity remains. The system will use a warm canvas, ivory surfaces, deep green ink, cobalt actions, and restrained amber highlights.

Premium finish comes from restraint and consistency:

- flat content is the default; stronger elevation is reserved for active tools, dialogs, and important outcomes;
- typography uses fewer competing sizes and a repeatable hierarchy;
- spacing, radii, borders, and shadows follow shared tokens;
- interface icons communicate actions consistently and decorative emoji are avoided where semantic icons are appropriate;
- buttons include hover, pressed, disabled, busy, and focus-visible states;
- transitions are short and limited to state changes, sheets, success feedback, and next-action emphasis;
- content never starts hidden and remains usable with animation disabled.

High contrast, large text, RTL, print, keyboard navigation, 200% zoom, and reduced motion are first-class presentation modes rather than patches.

## Component boundaries

Feature containers own state orchestration and side effects. Presentation components receive typed data and callbacks and do not fetch or mutate domain state directly.

Shared Lantern components will cover the product shell and recurring interaction patterns. First Day components continue to own document, fact, plan, conflict, source, and export presentation. Explain remains split into intake, overview, results, support, and help modules. Large files may be reduced when doing so directly improves the premium interface or makes visual states easier to verify; unrelated refactors are out of scope.

## Responsive behavior

The pass will explicitly verify 390, 768, 1024, and 1440-pixel layouts.

- Mobile places the primary action in the first useful viewport and uses compact summaries instead of large setup blocks.
- Tablet layouts avoid stretched mobile cards and premature desktop sidebars.
- Desktop layouts use comparison columns, side sheets, and restrained maximum widths.
- Fixed or sticky controls reserve enough space to avoid covering content.
- No supported viewport may introduce horizontal overflow.

## Error and loading behavior

Loading states preserve the surrounding layout and describe current work without blocking unrelated controls. Recoverable errors explain what happened and expose a clear retry or reset action. Partial success remains visible. Empty states tell the user what action is available next.

The frontend will continue to present provider limitations honestly. General Explain results must not be described as exact-source evidence; that claim remains exclusive to First Day's validated evidence flow.

## Verification and acceptance

The pass is complete only when current-state evidence demonstrates all of the following:

- the homepage, First Day, Explain, How It Works, and Privacy share a cohesive premium product shell;
- the three-minute fictional path reaches evidence review, conflict resolution, and export without backtracking;
- real-family paths keep privacy and decision boundaries visible where users act on data;
- keyboard focus, Escape behavior, focus restoration, mobile navigation, preferences, RTL, print, and reduced motion work across relevant states;
- crisis, scam, malformed-response, retry, speech fallback, and local-help states remain clear and accessible;
- 390, 768, 1024, and 1440-pixel layouts have no horizontal overflow or obscured actions;
- axe reports no serious or critical violations on public pages and critical workflow states;
- visual-regression baselines pass at the existing one-percent threshold;
- Letter and A4 print output exclude navigation and interactive controls;
- Lighthouse median scores remain at least 90 for performance and 95 for accessibility, with cumulative layout shift no greater than 0.1;
- ESLint, the production build, all existing unit tests, the First Day evaluation, and the complete Playwright suite pass.

## Explicit exclusions

This design does not authorize backend, API, provider, extraction, planner, storage, authentication, deployment, or domain-logic changes. It introduces no UI library or paid service. The fictional Mesa View case remains the competition-safe demonstration. The untracked `app/explain/page 2.tsx` remains user-owned and must not be edited, staged, or deleted.
