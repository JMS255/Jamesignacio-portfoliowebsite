# Claude Code Rules — James Portfolio

## Surgical Edit Policy
- **Minimal diffs only.** Never rewrite a full file for a small fix. Touch only the exact lines causing the issue.
- **25-line cap.** If a fix requires changing more than 25 lines, stop and enter Plan Mode for approval before writing any code.
- **Zero scope creep.** Fix the precise bug. Do not refactor, optimize, or clean up adjacent code unless explicitly asked.
- **One sentence explanations.** Let the diff speak. No long preambles.

## Tech Stack Rules (Next.js · Supabase · TypeScript · Vercel)
- **TypeScript:** Never use `any` or `@ts-ignore`. Write a proper interface or extend from `lib/types.ts`.
- **Supabase:** Make targeted table/query edits. Never rewrite a full query to change one field.
- **Formspree:** Never change the form endpoint ID unless explicitly asked. Keep backup submissions intact.
- **Next.js App Router:** Do not convert Server Components to Client Components just to fix a state issue — find the architectural reason first.
- **Vercel:** Match import paths with exact casing. Case mismatches cause silent build failures on Linux.
- **CSS:** Prefer adding a targeted class or inline style over rewriting a stylesheet section. Never touch unrelated CSS rules.

## Workflow
- Read only the files relevant to the bug before editing.
- Build check (`npx next build`) before every commit.
- One commit per fix — small, descriptive message.
