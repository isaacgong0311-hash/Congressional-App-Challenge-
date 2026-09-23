# Lantern Premium Frontend Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish Lantern's frontend so the public site, First Day, and Explain feel like one polished paid product while preserving every existing backend and domain contract.

**Architecture:** Keep feature containers responsible for state and side effects, move recurring visual language into shared Lantern primitives and icons, and finish the remaining Explain surfaces with typed presentational components. Treat the current First Day and public-page work as the approved foundation, then close the remaining visual-system, responsive, state-feedback, and verification gaps.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Vitest, Playwright, Axe, Lighthouse CI

---

## File map

- Create `app/components/lantern/icons.tsx`: shared semantic line icons used by product UI controls and notices.
- Modify `app/components/lantern/primitives.tsx`: add a shared segmented control and icon-label treatment without changing state ownership.
- Modify `app/features/letter-tool/letter-intake.tsx`: premium intake, options, and privacy panels using shared icons and clearer action hierarchy.
- Modify `app/features/letter-tool/letter-result-overview.tsx`: stronger three-part result hierarchy with semantic icons.
- Modify `app/features/letter-tool/letter-results.tsx`: remove remaining slate/blue/emoji visual debt and standardize actions, warnings, dates, and result tabs.
- Modify `app/features/letter-tool/letter-help-screen.tsx`: replace emoji category presentation with consistent semantic icon tiles.
- Modify `app/features/letter-tool/letter-support.tsx`: align local-help, resource, and disclosure components with Lantern primitives.
- Modify `app/features/letter-tool/letter-workspace.tsx`: compose polished loading/error/footer states without changing request or speech behavior.
- Modify `app/styles/letter-tool.css`: feature-specific tactile states, responsive density, and print/high-contrast treatment.
- Modify `app/globals.css`: shared pressed-state and product-shell polish only.
- Modify `e2e/letter-tool.spec.ts`: interaction, state, preference, safety, and accessibility assertions.
- Modify `e2e/visual-regression.spec.ts`: preserve deterministic 390/768/1024/1440 captures.
- Update `e2e/visual-regression.spec.ts-snapshots/*-darwin.png`: reviewed frontend baselines only after behavior checks pass.

### Task 1: Preserve the approved frontend foundation

**Files:**
- Modify: all currently tracked frontend and test changes
- Create: existing untracked frontend modules under `app/components/lantern`, `app/features/letter-tool`, and `app/styles`
- Preserve: `app/explain/page 2.tsx`

- [ ] **Step 1: Verify the approved consolidation before checkpointing it**

Run:

```bash
npm run lint
npm test
npm run build
npm run test:e2e
npm run evaluate:first-day
```

Expected: ESLint exits 0; Vitest reports 103 passing tests; the production build succeeds; Playwright has no failures; the First Day evaluation reports no failures.

- [ ] **Step 2: Confirm the user-owned duplicate page remains untracked**

Run:

```bash
git status --short -- 'app/explain/page 2.tsx'
```

Expected:

```text
?? "app/explain/page 2.tsx"
```

- [ ] **Step 3: Stage only the approved frontend foundation**

Run:

```bash
git add -u
git add app/components/lantern/mobile-navigation.tsx \
  app/features/letter-tool/letter-help-screen.tsx \
  app/features/letter-tool/letter-intake.tsx \
  app/features/letter-tool/letter-result-overview.tsx \
  app/features/letter-tool/letter-results.tsx \
  app/features/letter-tool/letter-support.tsx \
  app/styles/first-day.css \
  app/styles/letter-tool.css
git diff --cached --name-only | rg 'page 2.tsx' && exit 1 || true
```

Expected: every approved frontend file is staged and `app/explain/page 2.tsx` is absent.

- [ ] **Step 4: Commit the foundation**

Run:

```bash
git commit -m "feat: consolidate Lantern frontend experience"
```

Expected: one commit containing the already verified consolidation and no user-owned duplicate page.

### Task 2: Add a semantic Lantern icon and segmented-control layer

**Files:**
- Create: `app/components/lantern/icons.tsx`
- Modify: `app/components/lantern/primitives.tsx`
- Test: `e2e/letter-tool.spec.ts`

- [ ] **Step 1: Add failing semantics coverage**

Add this test to `e2e/letter-tool.spec.ts`:

```ts
test("Explain intake exposes semantic tabs without decorative glyph labels", async ({ page }) => {
  await page.goto("/explain");
  const tablist = page.getByRole("tablist", { name: "Letter setup" });
  await expect(tablist).toBeVisible();
  await expect(tablist.getByRole("tab", { name: "Upload" })).toHaveAttribute("aria-selected", "true");
  await tablist.getByRole("tab", { name: "Options" }).click();
  await expect(tablist.getByRole("tab", { name: "Options" })).toHaveAttribute("aria-selected", "true");
});
```

- [ ] **Step 2: Run the test and verify the accessible tablist name is missing**

Run:

```bash
npx playwright test e2e/letter-tool.spec.ts --grep "semantic tabs" --project=desktop-chromium
```

Expected: FAIL because the current tablist has no `Letter setup` accessible name.

- [ ] **Step 3: Create the icon library**

Create `app/components/lantern/icons.tsx` with a shared icon contract and semantic icons:

```tsx
import type { SVGProps } from "react";

export type LanternIconProps = SVGProps<SVGSVGElement>;

function IconFrame({ children, ...props }: LanternIconProps) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      {children}
    </svg>
  );
}

export function UploadIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4.5A1.5 1.5 0 006.5 20h11a1.5 1.5 0 001.5-1.5V14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function SlidersIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M4 7h7m4 0h5M4 17h3m4 0h9M11 4v6M7 14v6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /><circle cx="13" cy="7" r="2" stroke="currentColor" strokeWidth="1.8" /><circle cx="9" cy="17" r="2" stroke="currentColor" strokeWidth="1.8" /></IconFrame>;
}

export function LockIcon(props: LanternIconProps) {
  return <IconFrame {...props}><rect height="9" rx="2" stroke="currentColor" strokeWidth="1.8" width="14" x="5" y="11" /><path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></IconFrame>;
}

export function CameraIcon(props: LanternIconProps) {
  return <IconFrame {...props}><rect height="13" rx="3" stroke="currentColor" strokeWidth="1.8" width="18" x="3" y="7" /><path d="M8 7l1.5-2.5h5L16 7" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" /><circle cx="12" cy="13.5" r="3.2" stroke="currentColor" strokeWidth="1.8" /></IconFrame>;
}

export function VolumeIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M5 10v4h3l4 3V7L8 10H5zm10-1.5a5 5 0 010 7M17.5 6a9 9 0 010 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function StopIcon(props: LanternIconProps) {
  return <IconFrame {...props}><rect height="12" rx="2" stroke="currentColor" strokeWidth="1.8" width="12" x="6" y="6" /></IconFrame>;
}

export function CalendarIcon(props: LanternIconProps) {
  return <IconFrame {...props}><rect height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" width="18" x="3" y="5" /><path d="M8 3v4m8-4v4M3 10h18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></IconFrame>;
}

export function LightbulbIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M9 18h6m-5 3h4m-2-18a7 7 0 00-4 12.7c.7.5 1 1.3 1 2.3h6c0-1 .3-1.8 1-2.3A7 7 0 0012 3z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function PhoneIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M7.2 3.8l2.1 4.4-2 1.6a15 15 0 006.9 6.9l1.6-2 4.4 2.1-.8 3.2c-.2.7-.8 1.1-1.5 1A18.5 18.5 0 013 6.1c-.1-.7.3-1.3 1-1.5l3.2-.8z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function ShieldAlertIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M12 3l7 3v5c0 4.4-2.8 8.3-7 10-4.2-1.7-7-5.6-7-10V6l7-3zM12 8v5m0 3h.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function CheckIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" /></IconFrame>;
}

export function SearchIcon(props: LanternIconProps) {
  return <IconFrame {...props}><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" /><path d="M15.5 15.5L21 21" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></IconFrame>;
}

export function DocumentIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M6 3h8l4 4v14H6V3zM14 3v5h4M9 13h6m-6 4h6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function HomeIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M3 11.5L12 4l9 7.5M5.5 10v10h13V10M10 20v-6h4v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function HealthcareIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5V4z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function BenefitsIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M12 21c5-3.2 8-7.2 8-12a5 5 0 00-8-4 5 5 0 00-8 4c0 4.8 3 8.8 8 12z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function LegalIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M12 3v18M6 6h12M6 6l-3 7h6L6 6zm12 0l-3 7h6l-3-7zM7 21h10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function SchoolIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M3 9l9-5 9 5-9 5-9-5zm3 3v5l6 3 6-3v-5M21 9v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function FinanceIcon(props: LanternIconProps) {
  return <IconFrame {...props}><rect height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" width="18" x="3" y="5" /><path d="M3 10h18M7 15h3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></IconFrame>;
}

export function ImmigrationIcon(props: LanternIconProps) {
  return <IconFrame {...props}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></IconFrame>;
}

export function HelpIcon(props: LanternIconProps) {
  return <IconFrame {...props}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M9.8 9a2.4 2.4 0 114.1 1.7c-1.4 1.1-1.9 1.6-1.9 3.1M12 17h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></IconFrame>;
}
```

- [ ] **Step 4: Add a typed segmented control**

Add this API to `app/components/lantern/primitives.tsx`:

```tsx
export function SegmentedControl<T extends string | number>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: T) => void;
  options: readonly { icon?: ReactNode; label: string; value: T }[];
  value: T;
}) {
  return (
    <div aria-label={label} className="lantern-segmented" role="tablist">
      {options.map((option) => (
        <button
          aria-selected={value === option.value}
          className="lantern-segmented-option"
          data-selected={value === option.value ? "true" : undefined}
          key={option.value}
          onClick={() => onChange(option.value)}
          role="tab"
          type="button"
        >
          {option.icon}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Add shared interaction styles**

Add to `app/globals.css`:

```css
.lantern-segmented {
  display: flex;
  gap: 0.375rem;
  border-bottom: 1px solid rgba(20, 36, 30, 0.1);
  background: rgba(244, 241, 234, 0.66);
  padding: 0.375rem;
}

.lantern-segmented-option {
  display: inline-flex;
  min-height: 44px;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.75rem;
  color: var(--lantern-muted);
  font-size: 0.875rem;
  font-weight: 750;
  transition: background 160ms ease, color 160ms ease, box-shadow 160ms ease, transform 120ms ease;
}

.lantern-segmented-option[data-selected="true"] {
  background: var(--lantern-surface);
  color: var(--lantern-cobalt);
  box-shadow: 0 2px 10px rgba(20, 36, 30, 0.08);
}

.lantern-segmented-option:active {
  transform: scale(0.985);
}
```

- [ ] **Step 6: Run lint and the focused test**

Run:

```bash
npm run lint
npx playwright test e2e/letter-tool.spec.ts --grep "semantic tabs" --project=desktop-chromium
```

Expected: both commands pass.

- [ ] **Step 7: Commit the shared layer**

Run:

```bash
git add app/components/lantern/icons.tsx app/components/lantern/primitives.tsx app/globals.css e2e/letter-tool.spec.ts
git commit -m "feat: add premium Lantern interaction primitives"
```

### Task 3: Rebuild Explain intake and processing presentation

**Files:**
- Modify: `app/features/letter-tool/letter-intake.tsx`
- Modify: `app/features/letter-tool/letter-workspace.tsx`
- Modify: `app/styles/letter-tool.css`
- Test: `e2e/letter-tool.spec.ts`

- [ ] **Step 1: Add failing intake and loading assertions**

Add to `e2e/letter-tool.spec.ts`:

```ts
test("Explain intake keeps one clear primary action and stable processing status", async ({ page }) => {
  let release: (() => void) | undefined;
  await page.route("**/api/explain", async (route) => {
    await new Promise<void>((resolve) => { release = resolve; });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(validResult) });
  });
  await page.goto("/explain");
  await expect(page.getByText("Choose a letter photo", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Try a sample/ }).click();
  await page.getByRole("button", { name: "Explain this letter" }).click();
  await expect(page.getByRole("status", { name: "Analyzing your letter" })).toContainText("Reading the document");
  release?.();
  await expect(page.getByRole("heading", { name: "Utility notice", exact: true })).toBeVisible();
});
```

- [ ] **Step 2: Run the focused test and verify the new button name is absent**

Run:

```bash
npx playwright test e2e/letter-tool.spec.ts --grep "clear primary action" --project=desktop-chromium
```

Expected: FAIL because the current upload control is a label rather than the named premium action.

- [ ] **Step 3: Replace the intake tabs and upload surface**

In `letter-intake.tsx`, import `SegmentedControl` plus `CameraIcon`, `LockIcon`, `SlidersIcon`, and `UploadIcon`. Replace the glyph-based tab map with:

```tsx
<SegmentedControl
  label="Letter setup"
  onChange={setFormTab}
  options={[
    { icon: <UploadIcon className="h-4 w-4" />, label: "Upload", value: 0 },
    { icon: <SlidersIcon className="h-4 w-4" />, label: "Options", value: 1 },
    { icon: <LockIcon className="h-4 w-4" />, label: "Privacy", value: 2 },
  ] as const}
  value={formTab}
/>
```

Use a visually dominant upload button inside the existing file label:

```tsx
<span className="letter-upload-action">
  <CameraIcon className="h-5 w-5" />
  Choose a letter photo
</span>
<span className="mt-3 text-sm font-semibold text-ink">Take a photo or choose an image</span>
<span className="mt-1 text-sm text-muted">JPG or PNG · up to 10 MB · clear, flat, and well lit</span>
```

Keep the existing input attributes, `onPick`, preview, quality warning, sample action, help action, options, language list, ZIP handling, and privacy copy unchanged.

- [ ] **Step 4: Replace the processing card without changing request orchestration**

In `letter-workspace.tsx`, keep `loading`, `loadingMsg`, and `LOADING_STEPS` unchanged. Replace only the loading markup with a stable `letter-processing-card` containing the current step label, a progress element with `max={LOADING_STEPS.length}` and `value={loadingMsg + 1}`, and the full checklist. Do not add timers or new state.

- [ ] **Step 5: Add premium intake and loading styles**

Add to `letter-tool.css`:

```css
.letter-upload-action {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  border-radius: 0.875rem;
  background: var(--lantern-cobalt);
  padding: 0.75rem 1rem;
  color: white;
  font-weight: 800;
  box-shadow: 0 12px 28px rgba(53, 86, 212, 0.22);
}

.letter-processing-card {
  border: 1px solid rgba(53, 86, 212, 0.18);
  border-radius: var(--radius-feature);
  background: linear-gradient(145deg, #fffefa, #eef2ff);
  padding: 1.25rem;
  box-shadow: 0 18px 50px rgba(20, 36, 30, 0.07);
}
```

- [ ] **Step 6: Run focused Explain tests**

Run:

```bash
npm run lint
npx playwright test e2e/letter-tool.spec.ts
```

Expected: lint passes and all Explain tests pass in mobile and desktop projects.

- [ ] **Step 7: Commit the intake upgrade**

Run:

```bash
git add app/features/letter-tool/letter-intake.tsx app/features/letter-tool/letter-workspace.tsx app/styles/letter-tool.css e2e/letter-tool.spec.ts
git commit -m "feat: polish Explain intake and processing"
```

### Task 4: Finish the Explain results visual system

**Files:**
- Modify: `app/features/letter-tool/letter-result-overview.tsx`
- Modify: `app/features/letter-tool/letter-results.tsx`
- Modify: `app/features/letter-tool/letter-support.tsx`
- Modify: `app/styles/letter-tool.css`
- Test: `e2e/letter-tool.spec.ts`

- [ ] **Step 1: Add failing result hierarchy assertions**

Extend the successful Explain test with:

```ts
await expect(page.getByRole("region", { name: "Letter summary" })).toBeVisible();
await expect(page.getByRole("tablist", { name: "Explanation sections" })).toBeVisible();
await expect(page.getByRole("button", { name: "Read explanation aloud" })).toBeVisible();
```

- [ ] **Step 2: Run the focused test and verify the new names are absent**

Run:

```bash
npx playwright test e2e/letter-tool.spec.ts --grep "malformed output" --project=desktop-chromium
```

Expected: FAIL on at least `Explanation sections` or `Read explanation aloud`.

- [ ] **Step 3: Add semantic icons to the three-part overview**

In `letter-result-overview.tsx`, import `DocumentIcon`, `ShieldAlertIcon`, and `CheckIcon`. Keep all text derivation unchanged. Add a compact icon well to each card and set `role="region"` with `aria-label="Letter summary"` on the section.

- [ ] **Step 4: Standardize result tabs and controls**

In `letter-results.tsx`:

- replace the existing result tab bar with `SegmentedControl` labeled `Explanation sections`;
- replace `🔊 Read aloud` and `⏹ Stop` with `VolumeIcon` and `StopIcon`, preserving `aria-pressed`;
- set the accessible name to `Read explanation aloud` or `Stop reading explanation`;
- replace calendar, lightbulb, reply, phone, warning, and camera emoji with semantic icons;
- replace `text-slate-*`, `bg-slate-*`, and `text-blue-*` presentation classes with Lantern `ink`, `muted`, `canvas`, `surface`, `cobalt`, `amber`, `confirmed`, and `review` tokens;
- preserve every callback, conditional, result field, language branch, download, calendar, print, speech, and assistant behavior.

- [ ] **Step 5: Standardize disclosures and resources**

In `letter-support.tsx`, keep all data and fetch behavior unchanged. Apply Lantern tokens to `Collapsible`, `Detail`, `ResourceRow`, and `LocalHelpFinder`; use `SearchIcon`, `PhoneIcon`, and `CheckIcon`; keep 44-pixel targets and external-link behavior.

- [ ] **Step 6: Add result-specific tactile styles**

Add classes to `letter-tool.css` for `.letter-summary-card`, `.letter-result-shell`, `.letter-icon-well`, and `.letter-action-button`. Use `:active` scale no lower than `0.985`, visible focus outlines, no opacity entrance animation, and print-safe shadows.

- [ ] **Step 7: Run behavior and accessibility tests**

Run:

```bash
npm run lint
npx playwright test e2e/letter-tool.spec.ts
```

Expected: all Explain behavior, safety, RTL, speech, local-help, preference, and axe assertions pass in both projects.

- [ ] **Step 8: Commit the results upgrade**

Run:

```bash
git add app/features/letter-tool/letter-result-overview.tsx app/features/letter-tool/letter-results.tsx app/features/letter-tool/letter-support.tsx app/styles/letter-tool.css e2e/letter-tool.spec.ts
git commit -m "feat: finish premium Explain results"
```

### Task 5: Polish the help experience and product trust footer

**Files:**
- Modify: `app/features/letter-tool/letter-help-screen.tsx`
- Modify: `app/features/letter-tool/letter-workspace.tsx`
- Modify: `app/styles/letter-tool.css`
- Test: `e2e/letter-tool.spec.ts`

- [ ] **Step 1: Add failing no-letter-help coverage**

Add to `e2e/letter-tool.spec.ts`:

```ts
test("no-letter help feels like a complete product path", async ({ page }) => {
  await page.goto("/explain");
  await page.getByRole("button", { name: "Find help without a letter" }).click();
  await expect(page.getByRole("heading", { name: "What's going on?" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Help categories" })).toBeVisible();
  await page.getByRole("button", { name: /Utilities/ }).click();
  await expect(page.getByRole("heading", { name: /Utility help/ })).toBeVisible();
  await expect(page.getByText("verified by hand", { exact: false })).toBeVisible();
});
```

- [ ] **Step 2: Run the test and verify the category list name is missing**

Run:

```bash
npx playwright test e2e/letter-tool.spec.ts --grep "complete product path" --project=desktop-chromium
```

Expected: FAIL because the category grid has no list semantics or accessible name.

- [ ] **Step 3: Replace category emoji with semantic icon tiles**

In `letter-help-screen.tsx`, change each category definition from an emoji string to a React icon component imported from `icons.tsx`. Render the category grid as:

```tsx
<ul aria-label="Help categories" className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
  {categories.map((item) => (
    <li key={item.key}>
      <button className="letter-help-category" onClick={() => onChooseCategory(item.key)} type="button">
        <span className="letter-icon-well"><item.icon className="h-5 w-5" /></span>
        <span><span className="block font-bold">{item.label}</span><span className="mt-1 block text-xs text-muted">{item.description}</span></span>
      </button>
    </li>
  ))}
</ul>
```

Preserve the existing category values, resource data, 211 call link, back paths, and upload path.

- [ ] **Step 4: Replace the comparison footer with a premium trust disclosure**

In `letter-workspace.tsx`, retain the same factual copy but rename the disclosure to `How Lantern protects your decisions`. Use shared Lantern tokens and a `ShieldAlertIcon`. Keep the no-account, provider-handling, safety-rule, and ready-output statements unchanged.

- [ ] **Step 5: Run focused tests and axe**

Run:

```bash
npx playwright test e2e/letter-tool.spec.ts --grep "complete product path|malformed output" 
```

Expected: both tests pass in mobile and desktop projects with no serious or critical axe violations.

- [ ] **Step 6: Commit the help and trust upgrade**

Run:

```bash
git add app/features/letter-tool/letter-help-screen.tsx app/features/letter-tool/letter-workspace.tsx app/styles/letter-tool.css e2e/letter-tool.spec.ts
git commit -m "feat: polish Explain help and trust surfaces"
```

### Task 6: Complete the cross-product visual and quality audit

**Files:**
- Modify: `e2e/visual-regression.spec.ts` only if a stability wait or explicit state assertion is required
- Update: `e2e/visual-regression.spec.ts-snapshots/*-darwin.png`
- Verify: all frontend files and public routes

- [ ] **Step 1: Run behavior before updating visuals**

Run:

```bash
npm run lint
npm test
npm run build
npm run test:e2e
npm run evaluate:first-day
```

Expected: no failures; visual diffs are the only acceptable reason for `test:e2e` to require a subsequent snapshot update.

- [ ] **Step 2: Update deterministic Darwin visual baselines**

Run:

```bash
npx playwright test e2e/visual-regression.spec.ts --project=desktop-chromium --update-snapshots
```

Expected: four viewport tests pass and only intentional Darwin PNGs change.

- [ ] **Step 3: Inspect the premium states**

Visually inspect at least:

```text
home-wide-1440
explain-intro-mobile-390
explain-intro-wide-1440
explain-result-mobile-390
explain-result-tablet-768
explain-result-wide-1440
first-day-facts-mobile-390
first-day-blocker-tablet-768
first-day-export-wide-1440
```

Reject any baseline with hidden content, overlapping controls, weak contrast, inconsistent shell alignment, excessive decorative depth, or horizontal overflow.

- [ ] **Step 4: Prove visual stability**

Run:

```bash
npx playwright test e2e/visual-regression.spec.ts --project=desktop-chromium --repeat-each=3
```

Expected: all 12 repeated tests pass at the one-percent pixel threshold.

- [ ] **Step 5: Run the production performance gate**

Run:

```bash
npm run test:lighthouse
```

Expected: median performance at least 0.90, accessibility at least 0.95, and cumulative layout shift at most 0.1 for `/` and `/first-day`.

- [ ] **Step 6: Audit scope and user-owned files**

Run:

```bash
git diff --check
git diff --name-only HEAD | rg '^app/api/|^app/features/first-day/domain/|^app/features/first-day/server/' && exit 1 || true
git status --short -- 'app/explain/page 2.tsx'
```

Expected: no whitespace errors, no backend or domain files changed, and `app/explain/page 2.tsx` remains untracked.

- [ ] **Step 7: Commit verified visual baselines**

Run:

```bash
git add e2e/visual-regression.spec.ts e2e/visual-regression.spec.ts-snapshots
git commit -m "test: refresh premium frontend baselines"
```

- [ ] **Step 8: Report completion evidence**

Report the implemented product improvements, exact passing test counts, Lighthouse thresholds, responsive viewports, accessibility results, print verification, First Day evaluation results, and confirmation that no backend/domain files or `app/explain/page 2.tsx` changed.
