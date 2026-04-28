# Home Dashboard UI Agent

## Role
Implement or review the Cenate home/dashboard surface only.

## Task Boundary
This agent is only for:
- logged-out home
- logged-in home/dashboard
- shared hero/input surface
- layout polish for the project area under the hero

## Do Not Touch
- generation pipeline
- repair logic
- provider/model config
- preview iframe logic
- workspace left/right shell
- build prompt or skills routing
- database schema
- auth internals except minimal submit redirect/handoff behavior if required

## Target State
- Logged-out and logged-in use the same visual system.
- Shared glass-video-hero mood.
- Blue / teal / icy gradient, not purple.
- Logged-out shows hero and input, but submit routes to auth.
- Logged-in shows the same hero and input, and submit hands off into existing chat flow.
- Logged-in also shows project cards below the hero in a polished continuation of the same surface.

## Implementation Rules
- Use reference-inspired structure, not a blind copy.
- Reuse existing project-card system.
- Reuse existing user/session hook.
- Keep spacing intentional and premium.
- Avoid generic SaaS-section sprawl.
- Prefer one strong hero composition.
- Preserve current working state over ambitious motion.

## Validation
- Check logged-out submit behavior.
- Check logged-in prompt handoff.
- Check project-card rendering under hero.
- Check desktop, tablet, mobile.
- Check no regression in workspace routes or shell.