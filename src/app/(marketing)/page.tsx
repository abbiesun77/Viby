import { Hero } from "../../components/marketing/hero";
import { WorkflowStrip } from "../../components/marketing/workflow-strip";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <Hero />
      <WorkflowStrip />
    </main>
  );
}
