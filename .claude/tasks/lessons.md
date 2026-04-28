# Cenate Lessons

This file stores repeated mistakes, corrections, and repo-specific patterns.

It is used to:
- prevent repeated errors
- improve Claude’s decision-making over time
- reduce wasted iterations and token usage
- capture real lessons from actual work

This is NOT a dump file.
Only store patterns that are useful and repeatable.

---

## 1. How to Use This File

Add a lesson when:
- the same mistake happens more than once
- the user corrects a pattern that Claude got wrong
- a repo-specific rule becomes clear through debugging
- a subtle bug pattern is discovered
- a fix reveals a reusable principle

Do NOT add:
- one-off bugs
- temporary task notes
- random observations without reuse value

Keep lessons:
- short
- specific
- actionable

---

## 2. Promotion Rule (Critical)

Use this rule strictly:

- 1st occurrence → fix it
- 2nd occurrence → add or strengthen lesson
- 3rd occurrence → promote to:
  - `CLAUDE.md` (if repo-wide rule), or
  - agent rule (`.claude/agents/*.md`), or
  - reusable workflow/playbook

Goal:
→ eliminate repeated mistakes permanently

---

## 3. Before Starting Work

Before working on similar tasks:
- scan relevant lessons
- apply known patterns
- avoid repeating past mistakes

This step is mandatory for:
- generation/preview bugs
- UI parity work
- layout issues
- state flow problems

---

## 4. Lesson Format (Required)

Every lesson must follow this format:

### [Title]

**Context**
What situation this applies to.

**Wrong Pattern**
What Claude did incorrectly.

**Correct Pattern**
What should be done instead.

**Evidence**
Logs, behavior, or reasoning that proves the correction.

**Prevention Rule**
Clear rule to avoid repeating this mistake.

**Promotion Status**
- keep as lesson
- promote (if repeated)

---

## 5. Active Lessons

### Preview completion stale-state bug

**Context**
Preview shows loading or incorrect UI even after generation completes successfully.

**Wrong Pattern**
Blaming backend or generation failure without checking full state flow.

**Correct Pattern**
Treat as frontend stale-state or state propagation issue until proven otherwise.

**Evidence**
Preview appears correctly after refresh → server state is correct → client state is stale.

**Prevention Rule**
Always trace:
- backend completion
- final response
- client state write
- loading state clear
- render condition

**Promotion Status**
Active lesson

---

### Do not create extra markdown files

**Context**
Claude created unnecessary summary or implementation `.md` files.

**Wrong Pattern**
Generating documentation files for progress or summaries without request.

**Correct Pattern**
Keep all progress in chat unless explicitly asked for a file.

**Evidence**
Extra files create noise and duplicate information.

**Prevention Rule**
Do not create `.md` files unless explicitly requested.

**Promotion Status**
Promoted to CLAUDE.md

---

### Avoid whole-file rewrites for small fixes

**Context**
Small bugs were fixed by rewriting large parts of files.

**Wrong Pattern**
Large diffs for narrow problems.

**Correct Pattern**
Edit only the necessary section.

**Evidence**
Large rewrites increase regression risk and reduce review clarity.

**Prevention Rule**
Prefer smallest possible change that solves the issue.

**Promotion Status**
Active lesson

---

### Do not patch UI over broken state

**Context**
UI conditionals were added to hide incorrect behavior.

**Wrong Pattern**
Masking the issue instead of fixing underlying state flow.

**Correct Pattern**
Fix state source, transitions, or ownership.

**Evidence**
UI fixes break under different conditions or reintroduce bugs.

**Prevention Rule**
Fix root cause in state, not symptoms in UI.

**Promotion Status**
Active lesson

---

## 6. Writing New Lessons

When adding a lesson:

- use clear titles
- focus on patterns, not events
- keep wording precise
- avoid long paragraphs
- avoid vague language

Bad:
- “something broke in preview”

Good:
- “preview stale-state after successful generation”

---

## 7. What NOT to Do

Do NOT:
- turn this into a task log
- store temporary instructions here
- repeat the same lesson multiple times
- write vague or generic advice
- store personal notes without repo relevance

---

## 8. Goal of This File

This file should:

- get better over time
- reduce repeated mistakes
- improve Claude’s first-attempt accuracy
- make future tasks faster and cleaner

If used correctly, this becomes a compounding system.

Every lesson should pay off in future work.