import Link from "next/link";

export function Nav() {
  return (
    <nav className="nav" aria-label="主导航">
      <Link href="/" className="nav-logo">Viby</Link>
      <div className="nav-actions">
        <Link href="/sign-in" className="nav-link">登录</Link>
        <Link href="/sign-up" className="nav-cta">免费试用</Link>
      </div>
    </nav>
  );
}
