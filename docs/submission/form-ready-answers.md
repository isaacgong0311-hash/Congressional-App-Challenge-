# Congressional App Challenge form copy

Prepared October 10, 2026. Each prose answer is under the form's 400-word limit. Verify personal facts and the final release before pasting. Do not submit until the public video exists.

## Video demonstration URL

Pending. The 2026 rules require a public YouTube or Vimeo video, 1–3 minutes long. Paste its verified `https://` URL after testing it while signed out.

## Please briefly describe what your app does

Lantern: First Day helps newcomer families turn scattered school-enrollment instructions into a clear, bilingual plan. It keeps each document separate, links important facts to exact source quotes, asks the family to confirm details that a document cannot know, and flags conflicting instructions instead of guessing. A deterministic planner shows which tasks are ready, waiting, or blocked. When the family records what the school says, Decision Trace explains how that answer changed the plan. Families can switch between English and Spanish, print the plan, save its history, and add confirmed dates to a calendar. The complete demonstration uses fictional data and needs no account or AI key.

## What inspired you to create this app?

School enrollment can require families to connect information from several letters, health-office notes, and follow-up messages. A date may be on one page while a requirement is on another, and two sources may disagree. That is especially stressful for a family new to the school system or working across languages. I wanted to build something that helps a family act without hiding uncertainty. Lantern keeps the original words close to every fact, gives unanswered questions a place in the plan, and lets a human confirmation resolve a conflict visibly.

## What technical difficulties did you face programming your app?

The hardest problem was making a useful plan without letting an AI summary silently turn uncertain information into a fact. In the fictional case, one page says orientation starts in the cafeteria and another says the gym entrance. I separated reading from decision-making: the server validates model proposals and requires an exact quote from the source text; typed case events record family confirmations and corrections; deterministic TypeScript rules calculate each task's state. Decision Trace reads those same sources, events, and rules to show why a task changed. I tested the boundaries with unit tests, synthetic evaluation packets, and mobile and desktop browser journeys.

## What improvements would you make in a 2.0 version?

I would first test the fictional workflow with more families and school staff, including people who use assistive technology, and simplify any steps they find confusing. I would add more school districts only after reviewing current official procedures and setting up a reliable process for keeping them current. I would also evaluate document reading on a broader set of consented or synthetic multilingual examples, improve support for languages beyond English and Spanish, and make provider privacy choices clearer before any real-world pilot. I would keep the rule that a model can propose information but a person and explicit code decide what the plan says.

## Did you use AI?

Yes.

## If you used AI, how did you use it and what did you contribute?

I used OpenAI Codex during development for planning, code and test drafting, debugging, documentation, and review. The app can use Groq through the Vercel AI SDK to read uploaded pages and propose structured facts with exact source quotes. Optional ElevenLabs speech and Perplexity local-help integrations are separate features. The fictional judge demonstration, planner, conflict decisions, Decision Trace, exports, and tests work without an AI provider. I chose the problem and audience, designed the evidence and privacy rules, defined how facts are confirmed and conflicts are resolved, selected the task dependencies, reviewed the school sources, set test expectations, revised the implementation, and made the final design and release decisions. I understand and can explain the submitted code. Lantern builds from my earlier public TRANSLATEtheform project; the reused base and AI assistance are disclosed in the repository.

## What did you learn or take away from participating?

I learned that a helpful app has to show where its answers came from and what it still does not know. It was harder to preserve conflicting evidence and human decisions than to produce a fluent summary, but that work made the result testable and explainable. I also learned to separate tasks that AI can help with, such as reading unstructured text, from tasks that need explicit code, such as validation, dependencies, privacy limits, and safe failure behavior. Building the browser tests and synthetic evaluation changed how I judged my own work: a polished screen is only convincing when the behavior behind it is reliable.

## Cover photo

Upload `docs/submission/cover-photo.jpg`. It is a 600×800 JPEG screenshot of the public app, captured on October 10, 2026.

## Optional project link

https://lantern-first-day.vercel.app/first-day?demo=1

## Fields requiring Isaac's own confirmation

- Coding location.
- Date coding was completed (use the actual final completion date).
- Whether this was a school or coding-club project, and any teacher or mentor details.
- Ambassador referral, if any.
- Whether to opt into Congressional Certification.
- Final “Application Ready to Submit” confirmation, after the video and all required fields are complete.
