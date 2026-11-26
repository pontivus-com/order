import type { WorkbenchStatusTone } from "./WorkbenchStatus.tsx";
import { WorkbenchStatus } from "./WorkbenchStatus.tsx";

export type WorkbenchReviewVerdictProps = Readonly<{
  label: string;
  description?: string;
  tone: WorkbenchStatusTone;
  currentness?: string;
}>;

export const WorkbenchReviewVerdict = ({
  label,
  description,
  tone,
  currentness,
}: WorkbenchReviewVerdictProps) => (
  <section className="order-workbench-review-verdict" aria-label="Review verdict" data-testid="review-verdict">
    <div className="order-workbench-review-verdict-label">
      <WorkbenchStatus tone={tone} label={label} />
      {currentness === undefined ? null : (
        <span className="order-workbench-review-verdict-currentness">{currentness}</span>
      )}
    </div>
    {description === undefined ? null : <p>{description}</p>}
  </section>
);
