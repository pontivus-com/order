import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@astryxdesign/core/Table";
import type { ReactNode } from "react";

const WORKBENCH_TABLE_CELL_STYLE = {
  overflowWrap: "normal",
  wordBreak: "normal",
  maxWidth: "none",
} as const;

const WORKBENCH_TABLE_STYLE = {
  tableLayout: "auto",
} as const;

const WORKBENCH_TABLE_HEADER_CELL_STYLE = {
  overflow: "visible",
  textOverflow: "clip",
  whiteSpace: "normal",
  maxWidth: "none",
  overflowWrap: "normal",
  wordBreak: "normal",
} as const;

export type WorkbenchTableColumn = Readonly<{ key: string; label: string }>;
export type WorkbenchTableRow = Readonly<{
  id: string;
  cells: Readonly<Record<string, ReactNode>>;
  selected?: boolean;
  disabled?: boolean;
  testId?: string;
  onSelect?: () => void;
}>;

export const WorkbenchTable = ({
  label, columns, rows, selection,
}: Readonly<{
  label: string;
  columns: readonly WorkbenchTableColumn[];
  rows: readonly WorkbenchTableRow[];
  selection?: "single" | null;
}>) => (
  <Table
    className="order-workbench-data-table"
    density="compact"
    dividers="rows"
    hasHover={rows.some((row) => row.onSelect !== undefined)}
    aria-label={label}
    style={WORKBENCH_TABLE_STYLE}
  >
    <TableHeader>
      <TableRow isHeaderRow>
        {columns.map((column) => (
          <TableHeaderCell
            key={column.key}
            scope="col"
            style={WORKBENCH_TABLE_HEADER_CELL_STYLE}
          >
            {column.label}
          </TableHeaderCell>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((row) => {
        const onSelect = row.disabled ? undefined : row.onSelect;
        return (
          <TableRow
            key={row.id}
            data-testid={row.testId}
            aria-selected={selection ? row.selected === true : undefined}
            aria-disabled={row.disabled || undefined}
            tabIndex={onSelect === undefined ? undefined : 0}
            onClick={onSelect}
            onKeyDown={onSelect === undefined ? undefined : (event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              onSelect();
            }}
          >
            {columns.map((column) => (
              <TableCell key={column.key} style={WORKBENCH_TABLE_CELL_STYLE}>
                {row.cells[column.key]}
              </TableCell>
            ))}
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);
