import { useState, type ReactNode } from "react";
import { Badge, type BadgeVariant } from "@astryxdesign/core/Badge";
import { Banner, type BannerStatus } from "@astryxdesign/core/Banner";
import { Drawer } from "@astryxdesign/core/Drawer";
import { Layout, LayoutContent, Stack } from "@astryxdesign/core/Layout";
import { List, ListItem } from "@astryxdesign/core/List";

import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { useWideWorkbench } from "./primitives/WorkbenchLayout.tsx";
import {
  WorkbenchEmptyState,
  WorkbenchErrorState,
} from "./primitives/WorkbenchState.tsx";

export type WorkflowStepIndexItem = Readonly<{
  id: string;
  label: string;
  description?: string;
  statusLabel?: string;
  statusVariant?: BadgeVariant;
  selected?: boolean;
  onSelect: () => void;
}>;

export type WorkflowStepIndexGroup = Readonly<{
  id: string;
  label: string;
  items: readonly WorkflowStepIndexItem[];
}>;

export const WorkflowStepIndex = ({
  groups,
}: Readonly<{
  groups: readonly WorkflowStepIndexGroup[];
}>) => (
  <Stack
    direction="vertical"
    gap={3}
    width="100%"
    className="order-workflow-step-index"
    data-testid="workflow-step-index"
  >
    {groups.map((group) => (
      <List
        key={group.id}
        density="compact"
        edge="flush"
        header={group.label}
      >
        {group.items.map((item) => (
          <ListItem
            key={item.id}
            itemKey={item.id}
            label={item.label}
            description={item.description}
            isSelected={item.selected}
            onClick={item.onSelect}
            endContent={
              item.statusLabel ? (
                <Badge
                  variant={item.statusVariant ?? "neutral"}
                  label={item.statusLabel}
                />
              ) : undefined
            }
          />
        ))}
      </List>
    ))}
  </Stack>
);

export type WorkflowStepSummaryBlocker = Readonly<{
  status: BannerStatus;
  title: string;
  description?: ReactNode;
}>;

export const WorkflowStepSummary = ({
  label,
  purpose,
  stateLabel,
  stateVariant = "neutral",
  statusLabel,
  statusVariant = "neutral",
  blocker,
  action,
}: Readonly<{
  label: string;
  purpose: string;
  stateLabel: string;
  stateVariant?: BadgeVariant;
  statusLabel?: string;
  statusVariant?: BadgeVariant;
  blocker?: WorkflowStepSummaryBlocker | null;
  action?: ReactNode;
}>) => (
  <Stack
    direction="vertical"
    gap={2}
    width="100%"
    className="order-workflow-step-summary"
    data-testid="workflow-step-summary"
  >
    <Stack
      direction="horizontal"
      gap={2}
      hAlign="between"
      vAlign="center"
      width="100%"
      className="order-workflow-step-summary-row"
    >
      <div className="order-workflow-step-summary-copy">
        <div className="order-workflow-step-summary-title">
          <strong>{label}</strong>
          <Badge variant={stateVariant} label={stateLabel} />
          {statusLabel ? (
            <Badge variant={statusVariant} label={statusLabel} />
          ) : null}
        </div>
        <span>{purpose}</span>
      </div>
      {action ? (
        <div className="order-workflow-step-summary-action">{action}</div>
      ) : null}
    </Stack>
    {blocker ? (
      <Banner
        status={blocker.status}
        title={blocker.title}
        description={blocker.description}
        container="section"
      />
    ) : null}
  </Stack>
);

export const PrimaryMaterialFrame = ({
  title,
  description,
  action,
  loading,
  error,
  empty,
  scrollable = false,
  children,
}: Readonly<{
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  loading?: string | null;
  error?: Readonly<{ title: string; description: string }> | null;
  empty?: Readonly<{ title: string; description?: string }> | null;
  scrollable?: boolean;
  children?: ReactNode;
}>) => (
  <div
    className="order-primary-material-frame"
    data-testid="primary-material-frame"
  >
    <Layout
      height="fill"
      padding={0}
      header={
        title || description || action ? (
          <Stack
            direction="horizontal"
            gap={2}
            hAlign="between"
            vAlign="center"
            width="100%"
            className="order-primary-material-heading"
          >
            <div>
              {title ? <strong>{title}</strong> : null}
              {description ? <div>{description}</div> : null}
            </div>
            {action ? <div>{action}</div> : null}
          </Stack>
        ) : null
      }
      content={
        <LayoutContent
          padding={0}
          isScrollable={scrollable}
          label={title ? `${title} material` : "Workflow material"}
        >
          {loading ? (
            <WorkbenchEmptyState compact title={loading} />
          ) : error ? (
            <WorkbenchErrorState
              title={error.title}
              description={error.description}
            />
          ) : empty ? (
            <WorkbenchEmptyState
              compact
              title={empty.title}
              description={empty.description}
            />
          ) : (
            children
          )}
        </LayoutContent>
      }
    />
  </div>
);

export const WorkflowStepFrame = ({
  summary,
  index,
  indexLabel = "Work items",
  primary,
}: Readonly<{
  summary: ReactNode;
  index?: ReactNode;
  indexLabel?: string;
  primary: ReactNode;
}>) => {
  const wide = useWideWorkbench();
  const [indexOpen, setIndexOpen] = useState(false);
  const hasIndex = index !== undefined && index !== null;

  return (
    <div
      className="order-workflow-step-frame"
      data-testid="workflow-step-frame"
    >
      <Layout
        height="fill"
        padding={0}
        header={
          <Stack direction="vertical" gap={2} width="100%">
            {summary}
            {!wide && hasIndex ? (
              <div className="order-workflow-step-index-trigger">
                <WorkbenchAction
                  label={indexLabel}
                  tone="ghost"
                  onClick={() => setIndexOpen(true)}
                />
              </div>
            ) : null}
          </Stack>
        }
        start={
          wide && hasIndex ? (
            <div className="order-workflow-step-index-rail">
              {index}
            </div>
          ) : null
        }
        content={
          <LayoutContent
            padding={0}
            isScrollable={false}
            label="Selected workflow material"
          >
            {primary}
          </LayoutContent>
        }
      />
      {!wide && hasIndex ? (
        <Drawer
          isOpen={indexOpen}
          onOpenChange={setIndexOpen}
          side="start"
          width="20rem"
          padding={3}
          label={indexLabel}
          data-testid="workflow-step-index-drawer"
        >
          {index}
        </Drawer>
      ) : null}
    </div>
  );
};
