import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@astryxdesign/core/Table";
import type { ReactNode } from "react";
export type WorkbenchTableColumn = Readonly<{ key: string; label: string }>;
export type WorkbenchTableRow = Readonly<{ id: string; cells: Readonly<Record<string, ReactNode>>; selected?: boolean; disabled?: boolean; testId?: string; onSelect?: () => void }>;
export const WorkbenchTable = ({ label, columns, rows, selection }: Readonly<{ label: string; columns: readonly WorkbenchTableColumn[]; rows: readonly WorkbenchTableRow[]; selection?: "single" | null }>) => (
  <Table density="compact" dividers="rows" hasHover={rows.some((row) => row.onSelect !== undefined)} aria-label={label}>
    <TableHeader><TableRow isHeaderRow>{columns.map((column) => <TableHeaderCell key={column.key} scope="col">{column.label}</TableHeaderCell>)}</TableRow></TableHeader>
    <TableBody>{rows.map((row) => <TableRow
      key={row.id}
      data-testid={row.testId}
      aria-selected={selection ? row.selected === true : undefined}
      aria-disabled={row.disabled || undefined}
      tabIndex={row.onSelect && !row.disabled ? 0 : undefined}
      onClick={row.disabled ? undefined : row.onSelect}
      onKeyDown={row.onSelect && !row.disabled ? (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          row.onSelect?.();
        }
      } : undefined}
    >{columns.map((column) => <TableCell key={column.key}>{row.cells[column.key]}</TableCell>)}</TableRow>)}</TableBody>
  </Table>
);
