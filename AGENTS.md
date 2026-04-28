# Cenate Demo – Codex Agent Instructions

## Mission

Work inside this repository as a production-focused coding agent for Cenate.

Primary goals:
- preserve working paths
- make minimal, correct, verifiable changes
- maintain Lovable-level visual quality
- avoid regressions
- avoid unnecessary complexity

Do not optimize for speed at the cost of stability.

---

## Repo Scope

This file applies to the entire repo unless a deeper `AGENTS.md` overrides it.

Codex skills may exist under `.agents/skills/`. Use them when relevant, but do not let skills override the core repo safety rules in this file.

---

## Core Operating Rules

### 1. Inspect Before Acting
Always inspect relevant files before changing anything.

Do not:
- assume architecture
- assume behavior
- assume routes
- assume data flow
- assume styling ownership

Before editing:
1. identify the exact route or component involved
2. identify the exact files that own the behavior
3. identify the smallest safe edit surface

---

### 2. Plan First for Non-Trivial Work
Use plan mode by default when:
- more than 2 files may change
- architecture decisions are involved
- debugging is unclear
- UI changes may affect working flows
- there is any risk of touching frozen paths

Before implementation, state:
- exact problem being solved
- exact files to inspect
- exact files planned for edit
- why those files only
- what will not be touched

If scope starts expanding, stop and re-plan.

---

### 3. Minimal Changes Only
Change only what is necessary.

Do not:
- rewrite working systems
- create duplicate systems
- introduce parallel implementations
- refactor unrelated files
- clean up adjacent code unless required by the task

Prefer:
- editing existing components
- extending existing logic
- reusing existing hooks, tokens, routes, and UI patterns

---

### 4. No Guessing
Do not invent:
- runtime behavior
- API responses
- hidden routes
- database structure
- UI intent
- user flow assumptions

Use:
- source code
- logs
- actual runtime behavior
- existing components
- existing data flow

If uncertain, say exactly what is uncertain.

---

## Frozen Working Paths

The following paths/flows are treated as working and must not be changed unless the task explicitly requires them and the risk is justified before editing:

- current dark workspace shell
- current preview/code/device controls
- current restaurant successful generation path
- current restaurant save → load → preview flow
- current restaurant code/preview working path
- current local curated image flow for restaurant
- current build-prompt routed-style ordering fix
- current restaurant preview readiness path

If a proposed fix touches a frozen working path:
1. stop
2. identify the exact file
3. explain why touching it is necessary
4. avoid the change unless it is explicitly required

Do not make speculative edits to frozen paths.

---

## Current Product Reality

Cenate currently has:
- a working Lovable-style dark workspace shell
- functioning preview/code/device controls
- auth/dashboard/early-access foundations
- local curated image support for restaurant/construction/SaaS
- uploaded-image support in the generation path
- a bounded generate → validate → repair → finalize architecture
- prompt-injected skills, not fully hard-enforced execution contracts

This means:
- UI work must not drift into generator surgery
- generator work must be explicitly scoped
- preserve current working shell behavior

---

## Current Priority

Current active task focus is:

### Home / Dashboard UI Improvement
Goal:
- improve the home/dashboard presentation
- keep logged-out and logged-in home under the same visual system
- use a premium glass-video-hero direction
- keep Cenate dark with blue/teal/icy mood
- logged-out home input should route to auth instead of generating
- logged-in home input should hand off into the existing chat/workspace flow
- logged-in home should show project cards underneath in a polished continuation of the same surface

This is a UI task, not a generator architecture task.

---

## Strict Do Not Touch List for Current UI Tasks

For home/dashboard UI work, do not touch:
- generation pipeline
- repair logic
- provider/model selection
- preview iframe logic
- preview capture system
- workspace left/right shell behavior
- auth internals unless needed for a minimal submit redirect/handoff
- database schema
- routing architecture unless the existing prompt handoff absolutely requires minimal glue
- Cenate runtime skill system unless explicitly asked

---

## Staged Working Method

### Stage 1 – Read and Map
Before coding:
- inspect relevant route/page/layout files
- inspect current user/session hook
- inspect project-card component
- inspect current prompt handoff path
- inspect any existing home/dashboard wrapper components

Output:
- exact files inspected
- current ownership of layout, state, and submit behavior

### Stage 2 – Narrow Plan
Define:
- exact problem
- exact acceptance criteria
- exact files to edit
- exact non-goals
- exact regression risks

If more files are needed than expected, stop and re-plan.

### Stage 3 – Implement
Implementation rules:
- smallest diff possible
- reuse current components and tokens
- preserve existing working behavior
- avoid new dependencies unless unavoidable
- do not introduce duplicate components unless creation is clearly justified

### Stage 4 – Verify
After changes:
- run lint
- run build
- verify the intended flow end-to-end
- verify no regression in working shell paths
- verify desktop and mobile for any UI change

### Stage 5 – Report
Always report:
- files changed
- why each file changed
- what was deliberately not changed
- what was verified
- what remains uncertain, if anything

Do not claim completion without proof.

---

## Debugging Rules

### No Theoretical Fixes
If debugging:
1. inspect logs
2. inspect code path
3. inspect runtime behavior
4. identify the actual break point
5. apply one narrow fix
6. re-test one reproduction path

### One Bug Track at a Time
Do not merge unrelated failures into one patch.

Examples:
- generation timeout is one bug track
- blank preview is another bug track
- home input handoff is another bug track
- visual misalignment is another bug track

Patch one path only.

---

## Design Standard

### Lovable Parity
Parity means:
- visually indistinguishable at a glance in hierarchy, density, spacing, and feel
- not merely similar
- not generic SaaS styling
- not “close enough”

### Styling Rules
- prefer existing design tokens and patterns
- avoid arbitrary visual decisions
- avoid random spacing or color drift
- do not introduce a second design language

### UI Quality Bar
For hero, home, dashboard, and landing work:
- keep composition clean and premium
- avoid clutter
- avoid generic stacked sections
- preserve responsiveness
- make logged-in and logged-out feel like one product surface

---

## Skills Usage

Repo-local Codex skills may exist in `.agents/skills/`.

Use them when relevant, especially:
- `frontend-skill` for premium frontend composition and UI quality
- `playwright-interactive` for browser-based UI validation and interaction testing
- other copied upstream skills only when directly relevant

Do not force a skill when the task is simple.
Do not let skills expand scope beyond the current task.

---

## File Creation Rules

Do not create new files unless:
- absolutely necessary
- explicitly requested
- clearly better than extending an existing file

Do not create:
- duplicate components
- alternate versions
- speculative docs
- parallel systems

If a new file is necessary, explain why reuse or extension was not sufficient.

---

## Completion Standard

Before marking work complete:
- the intended change must work end-to-end
- no obvious regression should remain
- lint must pass
- build must pass
- output must match the stated task scope

Required final output:
1. what changed
2. what was verified
3. what was not changed
4. what remains uncertain

---

## Enforcement

Do not:
- guess
- over-engineer
- rewrite working code
- refactor adjacent working systems
- widen scope silently
- edit frozen paths casually
- mark work done without verification

Always:
- inspect firsts
- plan narrowly
- change minimally
- verify thoroughly
- preserve system integrity