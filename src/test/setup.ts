import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Provide a minimal App Router context so client components that call
// useRouter()/usePathname() can mount under the jsdom test environment.
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));
