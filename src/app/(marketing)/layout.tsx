import "./marketing.css";
import { ScrollReveal } from "../../components/marketing/scroll-reveal";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="viby-light">
      <ScrollReveal />
      {children}
    </div>
  );
}
