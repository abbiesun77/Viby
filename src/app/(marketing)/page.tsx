import { Nav } from "../../components/marketing/nav";
import { Hero } from "../../components/marketing/hero";
import { WorkflowStrip } from "../../components/marketing/workflow-strip";
import { EntryPaths } from "../../components/marketing/entry-paths";
import { AssetWorkspace } from "../../components/marketing/asset-workspace";
import { TrialSection } from "../../components/marketing/trial-section";
import { Footer } from "../../components/marketing/footer";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <Hero />
        <WorkflowStrip />
        <EntryPaths />
        <AssetWorkspace />
        <TrialSection />
      </main>
      <Footer />
    </>
  );
}
