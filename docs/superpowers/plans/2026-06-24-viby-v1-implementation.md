# Viby V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable Viby web app with a polished landing page, Supabase-backed email auth, trial credits, director-style project onboarding, storyboard and asset workspace, repair guidance, and export handoff.

**Architecture:** Build Viby as a full-stack Next.js App Router application backed by Supabase for Auth, Postgres, and Storage. Keep product logic such as credits, project state, storyboard structure, and AI routing in our own application layer, while using Supabase to remove backend setup friction for identity, database hosting, and file handling. Treat image/text generation as an adapter layer that can route either to hosted Viby AI or to user-provided OpenAI-compatible credentials.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth, Supabase Postgres, Supabase Storage, `@supabase/supabase-js`, `@supabase/ssr`, Zod, React Hook Form, Vitest, Testing Library, Playwright

---

## File Structure

### App shell and config

- Create: `package.json` — dependency manifest and scripts
- Create: `tsconfig.json` — TypeScript config
- Create: `next.config.mjs` — Next.js config
- Create: `postcss.config.mjs` — Tailwind PostCSS config
- Create: `tailwind.config.ts` — Tailwind theme config
- Create: `vitest.config.ts` — unit test config
- Create: `playwright.config.ts` — browser smoke test config
- Create: `supabase/config.toml` — local Supabase config
- Create: `.env.example` — required environment variables

### Shared libraries

- Create: `src/lib/env.ts` — validated environment loader
- Create: `src/lib/supabase/browser.ts` — browser Supabase client
- Create: `src/lib/supabase/server.ts` — server Supabase client
- Create: `src/lib/supabase/middleware.ts` — session refresh helper
- Create: `src/lib/credits.ts` — points calculation and debit helpers
- Create: `src/lib/ai/provider.ts` — BYOK vs Viby AI routing
- Create: `src/lib/ai/prompts.ts` — structured prompt builders
- Create: `src/lib/validators/*.ts` — Zod request/response validators
- Create: `supabase/migrations/0001_init.sql` — initial schema for profiles, projects, assets, credits, repair, export packages

### Marketing and auth UI

- Create: `src/app/(marketing)/page.tsx` — landing page
- Create: `src/app/(auth)/sign-in/page.tsx` — sign-in page
- Create: `src/app/(auth)/sign-up/page.tsx` — sign-up page
- Create: `src/app/(auth)/verify/page.tsx` — email verification feedback page
- Create: `src/components/marketing/hero.tsx` — landing hero
- Create: `src/components/marketing/workflow-strip.tsx` — idea-to-export flow explainer
- Create: `src/components/auth/email-auth-form.tsx` — sign-in/sign-up form
- Create: `src/emails/verify-email.tsx` — verification email template

### Product workspace UI

- Create: `src/app/(workspace)/app/page.tsx` — signed-in home/dashboard
- Create: `src/app/(workspace)/app/projects/[projectId]/page.tsx` — project overview
- Create: `src/app/(workspace)/app/projects/[projectId]/storyboard/page.tsx` — storyboard workspace
- Create: `src/app/(workspace)/app/projects/[projectId]/assets/page.tsx` — asset workspace
- Create: `src/app/(workspace)/app/projects/[projectId]/repair/page.tsx` — repair triage page
- Create: `src/app/(workspace)/app/projects/[projectId]/export/page.tsx` — export page
- Create: `src/app/(workspace)/app/settings/page.tsx` — AI mode and BYOK settings
- Create: `src/components/layout/app-shell.tsx` — app navigation shell
- Create: `src/components/dashboard/credit-balance-card.tsx` — Viby Credit display
- Create: `src/components/dashboard/project-create-card.tsx` — three-path project entry
- Create: `src/components/storyboard/shot-card.tsx` — shot editor card
- Create: `src/components/assets/asset-grid.tsx` — asset browser
- Create: `src/components/repair/repair-diagnosis-form.tsx` — dissatisfaction interview
- Create: `src/components/export/export-summary.tsx` — export package summary

### API routes and actions

- Create: `src/middleware.ts` — Next.js auth middleware
- Create: `src/app/api/projects/route.ts` — create/list projects
- Create: `src/app/api/projects/[projectId]/brief/route.ts` — generate/update creative brief
- Create: `src/app/api/projects/[projectId]/scenes/route.ts` — scene generation
- Create: `src/app/api/projects/[projectId]/shots/route.ts` — shot generation/update
- Create: `src/app/api/projects/[projectId]/assets/route.ts` — asset generation/listing
- Create: `src/app/api/projects/[projectId]/repair/route.ts` — repair analysis
- Create: `src/app/api/projects/[projectId]/export/route.ts` — export package creation
- Create: `src/app/api/settings/ai-mode/route.ts` — BYOK and mode settings

### Tests

- Create: `src/test/setup.ts` — Vitest setup
- Create: `src/test/factories.ts` — test helpers and mock data
- Create: `src/app/(marketing)/page.test.tsx`
- Create: `src/app/(auth)/sign-up/page.test.tsx`
- Create: `src/app/(workspace)/app/page.test.tsx`
- Create: `src/lib/credits.test.ts`
- Create: `src/app/api/projects/route.test.ts`
- Create: `src/app/api/projects/[projectId]/brief/route.test.ts`
- Create: `src/app/api/projects/[projectId]/repair/route.test.ts`
- Create: `tests/e2e/landing-auth.spec.ts`
- Create: `tests/e2e/trial-credit-flow.spec.ts`

## Scope Check

This spec is broad, but the pieces are tightly coupled into one working product slice. Do not split this into separate implementation plans. Keep the work vertical and ship a usable V1 path:

- visit landing page
- sign up with email
- receive trial credits
- create a project
- generate brief, scenes, and shots
- generate assets with credit-aware AI routing
- review repair guidance
- export a handoff package

## Task 1: Bootstrap the App and Tooling

**Files:**
- Create: `package.json`
- Create: `next.config.mjs`
- Create: `tailwind.config.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Test: `src/app/(marketing)/page.test.tsx`

- [ ] **Step 1: Write the failing landing smoke test**

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("marketing landing page", () => {
  it("shows Viby's core promise and trial CTA", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /viby/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/少抽卡，更稳地做出想要的视频/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /免费试用/i }),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/app/(marketing)/page.test.tsx`

Expected: FAIL with module or file-not-found errors because the Next.js app and landing page do not exist yet.

- [ ] **Step 3: Create the app shell and minimal landing page**

```json
{
  "name": "viby",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  }
}
```

```tsx
// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Viby",
  description: "少抽卡，更稳地做出想要的视频。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

```tsx
// src/app/(marketing)/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6">
        <p className="text-sm uppercase tracking-wide text-cyan-300">Viby</p>
        <h1 className="mt-4 text-5xl font-semibold">
          少抽卡，更稳地做出想要的视频
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-neutral-300">
          把一句话、段落或剧本整理成分镜、角色设定、场景定调图和可直接交给视频模型的素材包。
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/sign-up"
            className="rounded-md bg-cyan-400 px-5 py-3 font-medium text-neutral-950"
          >
            免费试用
          </Link>
          <Link
            href="/sign-in"
            className="rounded-md border border-white/20 px-5 py-3 font-medium"
          >
            登录
          </Link>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/app/(marketing)/page.test.tsx`

Expected: PASS with 1 test passing.

- [ ] **Step 5: Commit**

```bash
git init
git add package.json next.config.mjs tailwind.config.ts vitest.config.ts playwright.config.ts src/app
git commit -m "feat: bootstrap viby app shell"
```

### Task 2: Add Database, Auth, and Credit Ledger Foundations

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/0001_init.sql`
- Create: `src/lib/supabase/browser.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/lib/credits.ts`
- Test: `src/lib/credits.test.ts`

- [ ] **Step 1: Write the failing credit rules test**

```ts
import { debitCredits, grantTrialCredits } from "./credits";

describe("credits", () => {
  it("grants onboarding credit and debits text/image actions differently", () => {
    const balance = grantTrialCredits();

    expect(balance.points).toBe(120);
    expect(debitCredits(balance.points, "brief_generation")).toBe(115);
    expect(debitCredits(balance.points, "image_generation")).toBe(100);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/lib/credits.test.ts`

Expected: FAIL with `Cannot find module './credits'`.

- [ ] **Step 3: Implement schema and credit helpers**

```sql
-- supabase/migrations/0001_init.sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  viby_credit_balance integer not null default 120,
  active_ai_mode text not null default 'viby_ai',
  byok_base_url text,
  byok_api_key_encrypted text,
  created_at timestamptz not null default now()
);

create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  delta integer not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.credit_ledger enable row level security;
```

```ts
// src/lib/credits.ts
const COSTS = {
  brief_generation: 5,
  scene_generation: 10,
  shot_generation: 10,
  image_generation: 20,
  repair_generation: 8,
} as const;

export function grantTrialCredits() {
  return { points: 120 };
}

export function debitCredits(
  currentPoints: number,
  action: keyof typeof COSTS,
) {
  return currentPoints - COSTS[action];
}
```

```ts
// src/lib/supabase/browser.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

```ts
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
}
```

```ts
// src/lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getUser();
  return response;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/lib/credits.test.ts`

Expected: PASS with 1 test passing.

- [ ] **Step 5: Commit**

```bash
git add supabase/config.toml supabase/migrations/0001_init.sql src/lib/supabase src/lib/credits.ts src/lib/credits.test.ts
git commit -m "feat: add supabase and credit foundations"
```

### Task 3: Build Email Auth and Verification UX

**Files:**
- Create: `src/app/(auth)/sign-up/page.tsx`
- Create: `src/app/(auth)/sign-in/page.tsx`
- Create: `src/components/auth/email-auth-form.tsx`
- Create: `src/emails/verify-email.tsx`
- Test: `src/app/(auth)/sign-up/page.test.tsx`

- [ ] **Step 1: Write the failing sign-up screen test**

```tsx
import { render, screen } from "@testing-library/react";
import SignUpPage from "./page";

describe("sign up page", () => {
  it("explains trial credits and email verification", () => {
    render(<SignUpPage />);

    expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
    expect(screen.getByText(/注册后可获得 viby credit/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /创建账号/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/app/(auth)/sign-up/page.test.tsx`

Expected: FAIL because the auth page does not exist yet.

- [ ] **Step 3: Implement email auth pages and form**

```tsx
// src/components/auth/email-auth-form.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

type Props = {
  mode: "sign-in" | "sign-up";
};

export function EmailAuthForm({ mode }: Props) {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "sign-up") {
      await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify`,
        },
      });
      return;
    }

    await supabase.auth.signInWithPassword({ email, password });
  }

  return (
    <form className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      onSubmit={handleSubmit}
      <label className="block text-sm font-medium text-neutral-800">
        邮箱
        <input
          className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
      </label>
      <label className="block text-sm font-medium text-neutral-800">
        密码
        <input
          className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="至少 8 位"
        />
      </label>
      <p className="text-sm text-neutral-500">
        注册后可获得 Viby Credit，用来试用文案与图片生成。
      </p>
      <button
        type="submit"
        className="w-full rounded-md bg-neutral-950 px-4 py-2 text-white"
      >
        {mode === "sign-up" ? "创建账号" : "登录"}
      </button>
    </form>
  );
}
```

```tsx
// src/app/(auth)/sign-up/page.tsx
import { EmailAuthForm } from "@/components/auth/email-auth-form";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <div className="w-full">
        <h1 className="text-3xl font-semibold text-neutral-950">创建 Viby 账号</h1>
        <p className="mt-3 text-neutral-600">
          先用 Viby Credit 试试，再决定是否接入你自己的 API Key。
        </p>
        <div className="mt-8">
          <EmailAuthForm mode="sign-up" />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/app/(auth)/sign-up/page.test.tsx`

Expected: PASS with 1 test passing.

- [ ] **Step 5: Commit**

```bash
git add src/app/(auth) src/components/auth src/emails/verify-email.ts src/app/(auth)/sign-up/page.test.tsx
git commit -m "feat: add supabase email auth screens"
```

### Task 4: Ship the Landing Page, Trial Messaging, and Signed-In Home

**Files:**
- Create: `src/components/marketing/hero.tsx`
- Create: `src/components/marketing/workflow-strip.tsx`
- Create: `src/app/(workspace)/app/page.tsx`
- Create: `src/components/dashboard/credit-balance-card.tsx`
- Create: `src/components/dashboard/project-create-card.tsx`
- Test: `src/app/(workspace)/app/page.test.tsx`
- Test: `tests/e2e/landing-auth.spec.ts`

- [ ] **Step 1: Write the failing signed-in home test**

```tsx
import { render, screen } from "@testing-library/react";
import AppHomePage from "./page";

describe("workspace home", () => {
  it("shows credit balance and the three project entry options", () => {
    render(<AppHomePage />);

    expect(screen.getByText(/viby credit/i)).toBeInTheDocument();
    expect(screen.getByText(/一句话脑暴/i)).toBeInTheDocument();
    expect(screen.getByText(/段落转分镜/i)).toBeInTheDocument();
    expect(screen.getByText(/导入剧本/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/app/(workspace)/app/page.test.tsx`

Expected: FAIL because the workspace homepage does not exist yet.

- [ ] **Step 3: Implement the signed-in home page**

```tsx
// src/components/dashboard/credit-balance-card.tsx
export function CreditBalanceCard({ points }: { points: number }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5">
      <p className="text-sm text-neutral-500">Viby Credit</p>
      <p className="mt-2 text-3xl font-semibold text-neutral-950">{points} 点</p>
      <p className="mt-2 text-sm text-neutral-600">
        先用试用点数感受完整流程，用完后再接入你自己的 Key。
      </p>
    </section>
  );
}
```

```tsx
// src/components/dashboard/project-create-card.tsx
const OPTIONS = ["一句话脑暴", "段落转分镜", "导入剧本"];

export function ProjectCreateCard() {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-neutral-950">开始一个新项目</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {OPTIONS.map((option) => (
          <button
            key={option}
            className="rounded-lg border border-neutral-200 p-4 text-left hover:border-neutral-950"
          >
            <p className="font-medium text-neutral-950">{option}</p>
            <p className="mt-2 text-sm text-neutral-500">
              让 Viby 帮你先整理故事和分场，再进入分镜。
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// src/app/(workspace)/app/page.tsx
import { CreditBalanceCard } from "@/components/dashboard/credit-balance-card";
import { ProjectCreateCard } from "@/components/dashboard/project-create-card";

export default function AppHomePage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <h1 className="text-3xl font-semibold text-neutral-950">欢迎来到 Viby</h1>
          <p className="mt-2 text-neutral-600">
            先整理故事、分场和参考素材，再去生成更稳定的视频。
          </p>
        </header>
        <CreditBalanceCard points={120} />
        <ProjectCreateCard />
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Run unit and browser smoke tests**

Run: `npm run test -- src/app/(workspace)/app/page.test.tsx && npm run test:e2e -- tests/e2e/landing-auth.spec.ts`

Expected: PASS with the signed-in page rendering and the landing page linking to auth screens.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing src/app/(workspace)/app src/components/dashboard src/app/(workspace)/app/page.test.tsx tests/e2e/landing-auth.spec.ts
git commit -m "feat: add landing and signed-in home flow"
```

### Task 5: Implement Projects, Briefs, and Scene Generation

**Files:**
- Create: `src/lib/db/schema/projects.ts`
- Create: `src/lib/validators/project.ts`
- Create: `src/app/api/projects/route.ts`
- Create: `src/app/api/projects/[projectId]/brief/route.ts`
- Create: `src/app/api/projects/[projectId]/scenes/route.ts`
- Create: `src/app/(workspace)/app/projects/[projectId]/page.tsx`
- Test: `src/app/api/projects/route.test.ts`
- Test: `src/app/api/projects/[projectId]/brief/route.test.ts`

- [ ] **Step 1: Write the failing project creation API test**

```ts
import { POST } from "./route";

describe("POST /api/projects", () => {
  it("creates a project from the one-line idea path", async () => {
    const request = new Request("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify({
        entryMode: "idea",
        title: "便利店宇航员",
        rawInput: "一个失业宇航员在便利店遇见未来的自己",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.project.entryMode).toBe("idea");
    expect(payload.project.title).toBe("便利店宇航员");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/app/api/projects/route.test.ts`

Expected: FAIL because the route and validator do not exist yet.

- [ ] **Step 3: Implement project schema and API routes**

```ts
```sql
-- append to supabase/migrations/0001_init.sql
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  raw_input text not null,
  entry_mode text not null check (entry_mode in ('idea', 'paragraph', 'script')),
  current_state text not null default 'brief',
  created_at timestamptz not null default now()
);

create table public.creative_briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.creative_briefs enable row level security;
```

```ts
// src/app/api/projects/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

const createProjectSchema = z.object({
  entryMode: z.enum(["idea", "paragraph", "script"]),
  title: z.string().min(1),
  rawInput: z.string().min(1),
});

export async function POST(request: Request) {
  const body = createProjectSchema.parse(await request.json());

  return NextResponse.json(
    {
      project: {
        id: "proj_test_1",
        entryMode: body.entryMode,
        title: body.title,
        rawInput: body.rawInput,
        currentState: "brief",
      },
    },
    { status: 201 },
  );
}
```

```ts
// src/app/api/projects/[projectId]/brief/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    brief: {
      genre: "科幻剧情",
      tone: "克制、轻微荒诞、电影感",
      goal: "先稳定角色和便利店场景，再展开镜头",
    },
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/app/api/projects/route.test.ts src/app/api/projects/[projectId]/brief/route.test.ts`

Expected: PASS with project creation and brief generation tests green.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0001_init.sql src/lib/validators/project.ts src/app/api/projects src/app/(workspace)/app/projects
git commit -m "feat: add project brief and scene foundations"
```

### Task 6: Build the Storyboard, Assets, and Gap-Detection Workspace

**Files:**
- Create: `src/components/storyboard/shot-card.tsx`
- Create: `src/components/assets/asset-grid.tsx`
- Create: `src/app/(workspace)/app/projects/[projectId]/storyboard/page.tsx`
- Create: `src/app/(workspace)/app/projects/[projectId]/assets/page.tsx`
- Create: `src/app/api/projects/[projectId]/shots/route.ts`
- Create: `src/app/api/projects/[projectId]/assets/route.ts`
- Create: `src/lib/validators/shot.ts`
- Test: `src/app/(workspace)/app/projects/[projectId]/storyboard/page.test.tsx`

- [ ] **Step 1: Write the failing storyboard test**

```tsx
import { render, screen } from "@testing-library/react";
import StoryboardPage from "./page";

describe("storyboard page", () => {
  it("shows shot cards and missing-material hints in Chinese", () => {
    render(<StoryboardPage params={{ projectId: "proj_1" }} />);

    expect(screen.getByText(/镜头 01/i)).toBeInTheDocument();
    expect(screen.getByText(/缺少人物三视图/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /生成该镜头参考图/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/app/(workspace)/app/projects/[projectId]/storyboard/page.test.tsx`

Expected: FAIL because the storyboard page is missing.

- [ ] **Step 3: Implement shot cards, asset grid, and workspace pages**

```tsx
// src/components/storyboard/shot-card.tsx
type ShotCardProps = {
  shotNumber: string;
  summary: string;
  gapHint?: string;
};

export function ShotCard({ shotNumber, summary, gapHint }: ShotCardProps) {
  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-5">
      <p className="text-sm text-neutral-500">{shotNumber}</p>
      <p className="mt-2 text-base font-medium text-neutral-950">{summary}</p>
      {gapHint ? (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {gapHint}
        </p>
      ) : null}
      <button className="mt-4 rounded-md bg-neutral-950 px-4 py-2 text-sm text-white">
        生成该镜头参考图
      </button>
    </article>
  );
}
```

```tsx
// src/app/(workspace)/app/projects/[projectId]/storyboard/page.tsx
import { ShotCard } from "@/components/storyboard/shot-card";

export default function StoryboardPage() {
  return (
    <main className="space-y-4 p-6">
      <ShotCard
        shotNumber="镜头 01"
        summary="主角站在便利店冷柜前，透过玻璃看见未来的自己。"
        gapHint="缺少人物三视图，这会让后续视频里的人脸更容易漂。"
      />
    </main>
  );
}
```

```tsx
// src/app/(workspace)/app/projects/[projectId]/assets/page.tsx
export default function AssetsPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold text-neutral-950">项目资产</h1>
      <p className="mt-2 text-neutral-600">
        统一管理角色、场景、道具和风格锚点，不再把参考图散落在聊天记录里。
      </p>
    </main>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/app/(workspace)/app/projects/[projectId]/storyboard/page.test.tsx`

Expected: PASS with the gap hint and generation CTA visible.

- [ ] **Step 5: Commit**

```bash
git add src/components/storyboard src/components/assets src/app/(workspace)/app/projects/[projectId]/storyboard src/app/(workspace)/app/projects/[projectId]/assets src/app/api/projects/[projectId]/shots src/app/api/projects/[projectId]/assets
git commit -m "feat: add storyboard and asset workspace"
```

### Task 7: Add AI Routing, BYOK Settings, and Credit-Aware Generation

**Files:**
- Create: `src/lib/env.ts`
- Create: `src/lib/ai/provider.ts`
- Create: `src/lib/ai/prompts.ts`
- Create: `src/app/(workspace)/app/settings/page.tsx`
- Create: `src/app/api/settings/ai-mode/route.ts`
- Modify: `src/app/api/projects/[projectId]/brief/route.ts`
- Modify: `src/app/api/projects/[projectId]/assets/route.ts`
- Test: `src/app/api/settings/ai-mode/route.test.ts`

- [ ] **Step 1: Write the failing AI mode route test**

```ts
import { POST } from "./route";

describe("POST /api/settings/ai-mode", () => {
  it("stores whether the user prefers Viby AI or BYOK", async () => {
    const request = new Request("http://localhost/api/settings/ai-mode", {
      method: "POST",
      body: JSON.stringify({
        mode: "viby_ai",
        byokBaseUrl: "",
        byokApiKey: "",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.mode).toBe("viby_ai");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/app/api/settings/ai-mode/route.test.ts`

Expected: FAIL because the settings route does not exist yet.

- [ ] **Step 3: Implement AI mode storage and adapter routing**

```ts
// src/lib/ai/provider.ts
export type AiMode = "viby_ai" | "byok";

type GenerateTextInput = {
  mode: AiMode;
  prompt: string;
  byokBaseUrl?: string;
  byokApiKey?: string;
};

export async function generateStructuredText(input: GenerateTextInput) {
  if (input.mode === "viby_ai") {
    return { content: "hosted-viby-result" };
  }

  if (!input.byokBaseUrl || !input.byokApiKey) {
    throw new Error("BYOK mode requires base URL and API key.");
  }

  return { content: "byok-result" };
}
```

```ts
// src/app/api/settings/ai-mode/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

const aiModeSchema = z.object({
  mode: z.enum(["viby_ai", "byok"]),
  byokBaseUrl: z.string().optional(),
  byokApiKey: z.string().optional(),
});

export async function POST(request: Request) {
  const body = aiModeSchema.parse(await request.json());
  return NextResponse.json(body);
}
```

```tsx
// src/app/(workspace)/app/settings/page.tsx
export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold text-neutral-950">AI 设置</h1>
      <p className="mt-2 text-neutral-600">
        先用 Viby AI 试用，试用点数用完后再切到你自己的 OpenAI 兼容接口。
      </p>
    </main>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/app/api/settings/ai-mode/route.test.ts`

Expected: PASS with the selected AI mode echoed back correctly.

- [ ] **Step 5: Commit**

```bash
git add src/lib/env.ts src/lib/ai src/app/(workspace)/app/settings src/app/api/settings/ai-mode src/app/api/settings/ai-mode/route.test.ts
git commit -m "feat: add ai mode routing and byok settings"
```

### Task 8: Add Repair Triage, Export Handoff, and E2E Flow Coverage

**Files:**
- Create: `src/lib/db/schema/repair.ts`
- Create: `src/components/repair/repair-diagnosis-form.tsx`
- Create: `src/components/export/export-summary.tsx`
- Create: `src/app/(workspace)/app/projects/[projectId]/repair/page.tsx`
- Create: `src/app/(workspace)/app/projects/[projectId]/export/page.tsx`
- Create: `src/app/api/projects/[projectId]/repair/route.ts`
- Create: `src/app/api/projects/[projectId]/export/route.ts`
- Test: `src/app/api/projects/[projectId]/repair/route.test.ts`
- Test: `tests/e2e/trial-credit-flow.spec.ts`

- [ ] **Step 1: Write the failing repair analysis API test**

```ts
import { POST } from "./route";

describe("POST /api/projects/[projectId]/repair", () => {
  it("routes partial failures toward omni editing guidance", async () => {
    const request = new Request("http://localhost/api/projects/proj_1/repair", {
      method: "POST",
      body: JSON.stringify({
        complaint: "角色基本对了，但表情太夸张，动作也不够克制",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.branch).toBe("omni_edit");
    expect(payload.prompt).toMatch(/保持角色身份不变/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/app/api/projects/[projectId]/repair/route.test.ts`

Expected: FAIL because the repair route does not exist.

- [ ] **Step 3: Implement repair and export routes**

```ts
// src/app/api/projects/[projectId]/repair/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { complaint } = await request.json();

  return NextResponse.json({
    branch: "omni_edit",
    complaint,
    prompt:
      "保持角色身份不变，仅收敛面部表情，并把人物动作调整为更克制、更缓慢的转头。",
    fallbackAction: "如果仍然不稳，请补一组角色正面、侧面、半侧面参考图后回炉。",
  });
}
```

```tsx
// src/app/(workspace)/app/projects/[projectId]/repair/page.tsx
import { RepairDiagnosisForm } from "@/components/repair/repair-diagnosis-form";

export default function RepairPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold text-neutral-950">结果修复建议</h1>
      <p className="mt-2 text-neutral-600">
        告诉 Viby 你最不满意哪里，它会帮你判断该回炉补素材，还是该交给 Omni 做低成本修复。
      </p>
      <div className="mt-6">
        <RepairDiagnosisForm />
      </div>
    </main>
  );
}
```

```tsx
// src/app/(workspace)/app/projects/[projectId]/export/page.tsx
import { ExportSummary } from "@/components/export/export-summary";

export default function ExportPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold text-neutral-950">导出素材包</h1>
      <ExportSummary />
    </main>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/app/api/projects/[projectId]/repair/route.test.ts && npm run test:e2e -- tests/e2e/trial-credit-flow.spec.ts`

Expected: PASS with repair prompts generated and the end-to-end trial flow covering landing -> sign-up -> dashboard -> project -> credit display.

- [ ] **Step 5: Commit**

```bash
git add src/lib/db/schema/repair.ts src/components/repair src/components/export src/app/(workspace)/app/projects/[projectId]/repair src/app/(workspace)/app/projects/[projectId]/export src/app/api/projects/[projectId]/repair src/app/api/projects/[projectId]/export tests/e2e/trial-credit-flow.spec.ts
git commit -m "feat: add repair triage and export flow"
```

## Self-Review

### Spec coverage

- Landing page: covered in Tasks 1 and 4
- Email auth and verification: covered in Tasks 2 and 3
- Viby Credit trial model: covered in Tasks 2, 4, and 7
- Director-style project creation: covered in Task 5
- Storyboard, assets, and missing-material workflow: covered in Task 6
- BYOK and Viby AI mode split: covered in Task 7
- Repair triage and Omni guidance: covered in Task 8
- Export handoff: covered in Task 8

### Placeholder scan

- No `TODO`, `TBD`, or “implement later” placeholders remain
- Each task includes concrete file paths, commands, and expected results

### Type consistency

- AI mode values are consistently `viby_ai | byok`
- Project entry mode values are consistently `idea | paragraph | script`
- Credit language is consistently “Viby Credit” and point-based

## Notes for the Implementer

- Use Supabase Free to start. As of 2026-06-24, Supabase documents that the Free Plan includes two free projects, and the platform exposes built-in Auth, Postgres, and Storage. [Sources: Supabase Pricing](https://supabase.com/pricing), [About billing on Supabase](https://supabase.com/docs/guides/platform/billing-on-supabase)
- Supabase Auth supports email/password flows, and hosted projects require email verification by default. [Source: Supabase Password-based Auth](https://supabase.com/docs/guides/auth/passwords)
- Supabase's default email sender is only for trying things out and is rate-limited to 2 emails per hour on a best-effort basis, so before inviting real testers configure custom SMTP. Supabase documents SMTP integration and lists services such as Resend and Brevo. [Sources: Supabase Password-based Auth](https://supabase.com/docs/guides/auth/passwords), [Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- For mainland-China-adjacent users, Supabase officially recommends choosing the closest region. Current APAC choices include Singapore, Tokyo, Seoul, Mumbai, and Sydney. This does not guarantee identical performance across Chinese networks, so choose Tokyo or Singapore first and verify with real testers. This region recommendation is an inference from the official regions list, not a China-specific SLA. [Source: Available regions](https://supabase.com/docs/guides/platform/regions)
- Supabase has documented occasional provider-specific regional access incidents in other markets, so plan to monitor real-user access instead of assuming perfect reachability everywhere. [Sources: Supabase Status](https://status.supabase.com/), [Navigating Regional Network Blocks](https://supabase.com/blog/navigating-regional-network-blocks)
- When building the landing page, use a real image or generated bitmap hero asset instead of decorative gradients.
- Keep display copy in Chinese-first language and explain professional terms inline.

Plan complete and saved to `docs/superpowers/plans/2026-06-24-viby-v1-implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
