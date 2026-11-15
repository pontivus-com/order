import type { ReactNode } from "react";
export const WorkbenchDialogue = ({ transcript, composer, state }: Readonly<{ transcript: ReactNode; composer?: ReactNode; state?: ReactNode }>) => (
  <section className="order-workbench-dialogue"><div className="order-workbench-dialogue-transcript">{transcript}</div>{state ? <div className="order-workbench-dialogue-state">{state}</div> : null}{composer ? <div className="order-workbench-dialogue-composer">{composer}</div> : null}</section>
);
