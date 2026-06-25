import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { EntrySelector } from "../../../../components/onboarding/entry-selector";

export default async function NewProjectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("viby_credit_balance")
    .eq("id", user.id)
    .single();

  return (
    <>
      <nav className="topnav">
        <div className="tn-left">
          <Link href="/app" className="tn-logo">Viby</Link>
        </div>
        <div className="tn-right">
          <span className="credit-pill">
            Credit 余额：<b>{profile?.viby_credit_balance ?? 0}</b>
          </span>
        </div>
      </nav>
      <div className="ob-stage">
        <EntrySelector />
      </div>
    </>
  );
}
