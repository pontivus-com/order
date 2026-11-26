import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";
import { Selector } from "@astryxdesign/core/Selector";

import { WorkbenchStatus } from "./WorkbenchStatus.tsx";
import { WorkbenchUtilityLink } from "./WorkbenchUtilityLink.tsx";

type WorkbenchToolbarTone = "neutral" | "success" | "warning" | "danger";
type WorkbenchThemePreference = "system" | "light" | "dark";

const navigate = (
  onNavigate: (() => void) | undefined,
): ((event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void) | undefined =>
  onNavigate === undefined
    ? undefined
    : (event) => {
      event.preventDefault();
      onNavigate();
    };

export const WorkbenchToolbar = ({
  orientation,
  projectContext,
  account,
  navigation,
  theme,
}: Readonly<{
  orientation: Readonly<{
    productLabel: string;
    destinationLabel: string;
  }>;
  projectContext?: Readonly<{
    value: string;
    options: readonly string[];
    onChange?: (projectId: string) => void;
  }>;
  account?: Readonly<{
    label: string;
    readiness?: Readonly<{
      label: string;
      tone: WorkbenchToolbarTone;
    }>;
    href: string;
    onNavigate?: () => void;
  }>;
  navigation: Readonly<{
    label: "Settings" | "Work queue";
    href: string;
    onNavigate?: () => void;
  }>;
  theme: Readonly<{
    value: WorkbenchThemePreference;
    onChange: (value: string) => void;
  }>;
}>) => {
  const projectSwitchable =
    projectContext !== undefined &&
    projectContext.options.length > 1 &&
    projectContext.onChange !== undefined;

  return (
    <header
      className="order-workbench-toolbar"
      data-testid="workbench-toolbar"
      aria-label="Order application toolbar"
    >
      <div className="order-workbench-toolbar-main">
        <div
          className="order-application-orientation"
          aria-label="Current application destination"
        >
          <strong>{orientation.productLabel}</strong>
          <span className="order-workbench-destination-label">{orientation.destinationLabel}</span>
        </div>
        {projectContext === undefined ? null : projectSwitchable ? (
          <div className="order-workbench-toolbar-project">
            <Selector
              label="Project"
              options={projectContext.options.map((projectId) => ({
                value: projectId,
                label: projectId,
              }))}
              value={projectContext.value}
              onChange={projectContext.onChange}
              width="100%"
            />
          </div>
        ) : (
          <div
            className="order-workbench-project-context"
            aria-label="Current Project"
          >
            <span>Project</span>
            <strong title={projectContext.value}>{projectContext.value}</strong>
          </div>
        )}
      </div>
      <div
        className="order-workbench-toolbar-utilities"
        data-testid="workbench-utilities"
      >
        {account === undefined ? null : (
          <div className="order-workbench-toolbar-account" title={account.label}>
            <WorkbenchUtilityLink
              label="OpenCode"
              detail={
                <span className="order-workbench-account-detail">
                  <span className="order-workbench-account-label">{account.label}</span>
                  {account.readiness === undefined ? null : (
                    <WorkbenchStatus
                      tone={account.readiness.tone}
                      label={account.readiness.label}
                    />
                  )}
                </span>
              }
              href={account.href}
              testId="opencode-account-trigger"
              onNavigate={navigate(account.onNavigate)}
            />
          </div>
        )}
        <WorkbenchUtilityLink
          label={navigation.label}
          href={navigation.href}
          onNavigate={navigate(navigation.onNavigate)}
        />
        <div className="order-workbench-toolbar-theme">
          <SegmentedControl
            label="Theme"
            value={theme.value}
            onChange={theme.onChange}
            size="sm"
          >
            <SegmentedControlItem value="system" label="System" />
            <SegmentedControlItem value="light" label="Light" />
            <SegmentedControlItem value="dark" label="Dark" />
          </SegmentedControl>
        </div>
      </div>
    </header>
  );
};
