import { useQuery } from "@tanstack/react-query";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import type { EvidenceSelection } from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchSectionHeader } from "./primitives/WorkbenchSectionHeader.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchSurface } from "./primitives/WorkbenchSurface.tsx";

const decodeBytes = (bytes: Uint8Array): string => {
  try { return new TextDecoder("utf-8",{fatal:true}).decode(bytes); }
  catch { const preview=Array.from(bytes.slice(0,256),(value)=>value.toString(16).padStart(2,"0")).join(" "); return "Binary evidence ("+bytes.byteLength+" bytes)\n"+preview+(bytes.byteLength>256?" …":""); }
};

export const EvidenceViewer = ({selection,onBack}:Readonly<{selection:EvidenceSelection|null;onBack:()=>void;}>) => {
  const query=useQuery({
    queryKey:selection?.kind==="ARTIFACT"?workbenchQueryKeys.artifactContent(selection.artifactId):workbenchQueryKeys.evidence(selection?.runId??null,selection?.relativePath??null),
    queryFn:()=>{if(!selection)throw new TypeError("evidence selection required");return selection.kind==="ARTIFACT"?api.readArtifactContent(selection.artifactId):api.readEvidence(selection.runId,selection.relativePath);},
    enabled:selection!==null,
  });
  if(!selection)return <WorkbenchSurface attention={<WorkbenchSectionHeader title="Evidence"/>} material={<WorkbenchState kind="empty" title="No evidence selected" description="Select an evidence reference from the owning workflow step."/>}/>;
  const title=selection.kind==="ARTIFACT"?selection.label:selection.relativePath;
  const heading=<WorkbenchSectionHeader title={title} description="Read-only exact material" action={<WorkbenchAction label="Back to workflow context" tone="ghost" onClick={onBack}/>}/>;
  if(query.isPending)return <WorkbenchSurface attention={heading} material={<WorkbenchState kind="loading" title="Loading evidence…"/>}/>;
  if(query.isError)return <WorkbenchSurface attention={heading} material={<WorkbenchState kind="error" title="Evidence could not be read" description={query.error instanceof Error?query.error.message:String(query.error)}/>}/>;
  return <div data-testid="evidence-workspace"><WorkbenchSurface attention={heading} material={<div data-testid="raw-content-view" className="order-code-view"><CodeBlock code={decodeBytes(query.data)} language="plaintext" hasCopyButton width="100%"/></div>}/></div>;
};
