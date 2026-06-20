# Orchestration Plan

## Mode Selection

- Repo: /Users/stephenbrown/Code/OPENSOURCE/generatemeai
- Branch: dev
- Work mode: full
- Run folder: /Users/stephenbrown/Code/OPENSOURCE/generatemeai/agent-runs/2026-06-20-codebase-pass
- Verifiable gates: git remote read, dry-run push, npm run lint, npx tsc --noEmit, npm test, npm run build, git diff --check, targeted source searches
- Human-decision blockers: product roadmap changes, broad architecture rewrites, secret-backed external service verification, unsafe local changes, branch divergence
- Resume policy: resume from run-state.md plus git status; push any validated local phase commit before making new edits; stop on unrelated dirty files

## Loop Plan

| Phase | Loop | Verify Gate | Stop Condition |
| --- | --- | --- | --- |
| Preflight and Repo Docs | Orchestration Planning Loop, Docs Sweep Loop | Docs match current repo and checks pass | Plan, state, queue, docs, and report pushed |
| Baseline Validation | Baseline Validation Loop | lint, typecheck, tests, and build classified | Baseline is clean or failures are reproducible and owned |
| Findings Backlog | Findings Queue Loop, Architecture Fitness Loop, Lean Code Loop | Evidence-backed backlog and scorecard | Backlog, scorecard, and queue are pushed |
| Execute Fixes and Improvements | Task Queue Loop, Fix Validation Loop, Architecture Fitness Loop, Lean Code Loop | Targeted done-check plus quality gate pass | Highest-priority confirmed task fixed, deferred, or blocked |
| Package and Dead-Code Cleanup | Package Cleanup Loop, Dead Code Loop | Safe diagnostics and quality gate pass | Safe cleanup complete or risky work deferred |
| Review | Judge Loop | Diff, reports, and scorecard reviewed | PASS or bounded follow-up tasks created |
| Stabilization Loop | Stabilization Loop, Judge Loop | Completion criteria pass | Clean synced dev or real blocker recorded |
| Integrator | Final Completion Gate | final verification and sync checks recorded | Final report pushed or blocker recorded |

## File Ownership

| Task | Owned Files | Notes |
| --- | --- | --- |
| T-001 | 00-orchestration-plan.md, run-state.md, task-queue.md | Startup planning and resume state |
| T-002 | AGENTS.md, spec.md, 01-preflight-and-repo-docs.md | Current-state docs and preflight report |
| T-003 | 02-baseline-validation.md, task-queue.md, run-state.md | Baseline command results |
| T-004 | 03-findings-backlog.md, task-queue.md, run-state.md | Findings and architecture scorecard |
| T-005 | Source/docs files named by the selected finding | Focused improvement batch |
| T-006 | package.json, package-lock.json, source files named by evidence | Safe package/dead-code cleanup only |
| T-007 | 06-review.md, 07-stabilization-loop.md, task-queue.md | Review and stabilization findings |
| T-008 | final-report.md, run-state.md, task-queue.md | Final completion report |
