import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

/* ---------- Signature element: a live call stack ticker ---------- */
type Frame = { id: number; name: string };

function useAutoStack() {
  const [stack, setStack] = useState<Frame[]>([]);
  const idRef = useRef(0);
  const names = ["main()", "printSquare()", "square()", "multiply()"];

  useEffect(() => {
    let cancelled = false;

    async function run() {
      while (!cancelled) {
        // push each frame in order
        for (const name of names) {
          if (cancelled) return;
          idRef.current += 1;
          const frame = { id: idRef.current, name };
          setStack((s) => [...s, frame]);
          await sleep(550);
        }
        await sleep(500);
        // pop them off in reverse
        for (let i = 0; i < names.length; i++) {
          if (cancelled) return;
          setStack((s) => s.slice(0, -1));
          await sleep(420);
        }
        await sleep(600);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return stack;
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function StackPulse() {
  const stack = useAutoStack();
  return (
    <div className="pulse-wrap">
      <div className="pulse-box stack-pulse-box">
        <span className="pulse-label">
          This stack pushes and pops on its own, forever — no user input required.
        </span>
        <div className="mini-stack">
          {stack.length === 0 && <div className="mini-stack-empty">(empty)</div>}
          {stack
            .slice()
            .reverse()
            .map((f) => (
              <div key={f.id} className="mini-frame">
                {f.name}
              </div>
            ))}
        </div>
      </div>
      <div className="pulse-caption">
        Every function call pushes a frame. Every return pops one. That's the whole mechanism.
      </div>
    </div>
  );
}

/* ---------- Playground: step-through call stack visualizer ---------- */
type StepEvent =
  | { kind: "push"; name: string; line: number }
  | { kind: "pop"; line: number }
  | { kind: "log"; value: string; line: number };

const SOURCE_LINES = [
  "function multiply(a, b) {",
  "  return a * b;",
  "}",
  "",
  "function square(n) {",
  "  return multiply(n, n);",
  "}",
  "",
  "function printSquare(n) {",
  "  console.log(square(n));",
  "}",
  "",
  "printSquare(5);",
];

const TRACE: StepEvent[] = [
  { kind: "push", name: "printSquare(5)", line: 13 },
  { kind: "push", name: "square(5)", line: 6 },
  { kind: "push", name: "multiply(5, 5)", line: 2 },
  { kind: "pop", line: 2 },
  { kind: "pop", line: 6 },
  { kind: "log", value: "25", line: 10 },
  { kind: "pop", line: 9 },
];

type StackEntry = { id: number; name: string };
type LogEntry = { id: number; value: string };

// Given the index of a "pop" event in TRACE, find the index of the "push"
// event it corresponds to, so a stepped-back pop can restore the exact
// frame (name + stable id) that was on the stack before it.
function findMatchingPushIndex(popIndex: number): number {
  let depth = 0;
  for (let i = popIndex; i >= 0; i--) {
    const ev = TRACE[i];
    if (ev.kind === "pop") depth++;
    if (ev.kind === "push") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function StepPlayground() {
  const [stepIndex, setStepIndex] = useState(0);
  const [stack, setStack] = useState<StackEntry[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Each pushed frame keeps a stable id: its own index in TRACE. That id
  // survives stepping forward and backward, so React keys stay attached
  // to "the same call" instead of being derived from name + array position.
  const stepForward = () => {
    const ev = TRACE[stepIndex];
    if (!ev) return;
    if (ev.kind === "push") {
      setStack((s) => [...s, { id: stepIndex, name: ev.name }]);
    } else if (ev.kind === "pop") {
      setStack((s) => s.slice(0, -1));
    } else if (ev.kind === "log") {
      setLogs((l) => [...l, { id: stepIndex, value: ev.value }]);
    }
    setStepIndex((i) => i + 1);
  };

  const stepBackward = () => {
    const prevIndex = stepIndex - 1;
    if (prevIndex < 0) return;
    const ev = TRACE[prevIndex];
    if (ev.kind === "push") {
      setStack((s) => s.slice(0, -1));
    } else if (ev.kind === "pop") {
      const pushIndex = findMatchingPushIndex(prevIndex);
      const pushEv = TRACE[pushIndex];
      if (pushEv && pushEv.kind === "push") {
        setStack((s) => [...s, { id: pushIndex, name: pushEv.name }]);
      }
    } else if (ev.kind === "log") {
      setLogs((l) => l.slice(0, -1));
    }
    setStepIndex(prevIndex);
  };

  const reset = () => {
    setStepIndex(0);
    setStack([]);
    setLogs([]);
  };

  const currentLine = stepIndex > 0 ? TRACE[stepIndex - 1].line : 1;
  const done = stepIndex >= TRACE.length;

  return (
    <div className="sandbox">
      <div className="stack-demo-grid">
        <div className="demo-card">
          <div className="card-header">Source</div>
          <div className="card-body">
            <pre className="stack-source">
              {SOURCE_LINES.map((line, i) => (
                <div
                  key={i}
                  className={`source-line${currentLine === i + 1 ? " active-line" : ""}`}
                >
                  <span className="line-no">{i + 1}</span>
                  <span>{line || " "}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>

        <div className="demo-card">
          <div className="card-header">Call stack</div>
          <div className="card-body">
            <div className="visual-stack">
              {stack.length === 0 && <div className="mini-stack-empty">(empty — stack cleared)</div>}
              {stack
                .slice()
                .reverse()
                .map((frame, i) => (
                  <div
                    key={frame.id}
                    className={`stack-frame${i === 0 ? " top-frame" : ""}`}
                  >
                    {frame.name}
                  </div>
                ))}
            </div>
            <div className="console-log">
              <div className="console-label">console</div>
              {logs.length === 0 ? (
                <div className="console-empty">—</div>
              ) : (
                logs.map((entry) => (
                  <div key={entry.id} className="console-line">
                    {entry.value}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="control-panel">
        <div className="control-row step-controls">
          <button type="button" className="btn-outline" onClick={stepBackward} disabled={stepIndex === 0}>
            ← Back
          </button>
          <span className="step-counter">
            Step {stepIndex} / {TRACE.length}
          </span>
          <button type="button" className="btn-compact" onClick={stepForward} disabled={done}>
            {done ? "Finished" : "Step →"}
          </button>
          <button type="button" className="btn-outline" onClick={reset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Article ---------- */
function App() {
  return (
    <div>
      <header className="masthead">
        <div className="signature">Written by Althaf</div>
        <div className="eyebrow">Field notes: JavaScript</div>
        <h1>The call stack isn't scary — here's what's actually happening when your code runs</h1>
        <p className="dek">
          Execution context and the call stack come up in nearly every JS interview, and most
          answers are memorized rather than understood. Tracing through a real example fixes that
          in a few minutes.
        </p>
        <div className="byline">
          <span>Althaf</span>
          <span className="dot">·</span>
          <span>Frontend</span>
          <span className="dot">·</span>
          <span>5 min read</span>
        </div>
        <div className="topics">
          <span>JavaScript</span>
          <span>Execution Context</span>
          <span>Call Stack</span>
          <span>Fundamentals</span>
        </div>
      </header>

      <StackPulse />

      <article>
        <section>
          <h2>What is an execution context?</h2>
          <p className="lede">
            An execution context is the environment JavaScript builds before it runs a piece of
            code — it bundles up the variables in scope, the value of <code>this</code>, and a
            reference to the outer scope. There's a global execution context created once when
            your program starts, and a brand new function execution context created every single
            time a function is called.
          </p>
          <p>
            Each context goes through two phases. In the creation phase, JavaScript scans the code
            about to run and sets up memory for variables and functions before executing anything
            — this is what causes hoisting. In the execution phase, the code actually runs, line by
            line, top to bottom.
          </p>

          <p className="pull-quote">
            The call stack doesn't track your code. It tracks execution contexts — one entry for
            every function call that hasn't returned yet.
          </p>

          <h3>The call stack, traced through a real example</h3>
          <p>
            The call stack is a last-in-first-out structure: the most recent function call is
            always the next one to finish and pop off. Take this:
          </p>
          <pre>{`function multiply(a, b) { return a * b; }
function square(n) { return multiply(n, n); }
function printSquare(n) { console.log(square(n)); }
printSquare(5);`}</pre>
          <p>
            Calling <code>printSquare(5)</code> pushes its context onto the stack. Inside it,
            calling <code>square(n)</code> pushes a second context on top. Inside that,{" "}
            <code>multiply(n, n)</code> pushes a third. <code>multiply</code> finishes first and
            pops off, handing its return value back to <code>square</code>, which finishes and pops,
            handing its value to <code>printSquare</code>, which logs it and pops last. Three
            pushes, three pops, in exactly reverse order.
          </p>

          <h3>Where hoisting fits in</h3>
          <p>
            Because of the creation phase, <code>var</code> declarations and function declarations
            are set up in memory before the code runs — which is why you can call a function
            declared later in the file. <code>let</code> and <code>const</code> are hoisted too,
            but into a "temporal dead zone" where referencing them before their line throws, rather
            than silently returning <code>undefined</code>.
          </p>

          <h3>Common mistakes and misconceptions</h3>
          <p>
            A "stack overflow" isn't mysterious once you see the mechanism: it's just recursion
            that never hits a base case, pushing new contexts faster than any return can pop them,
            until the stack hits its size limit and JavaScript throws.
          </p>
          <p>
            A common misconception is that JavaScript always executes top to bottom. Hoisting
            already complicates that, and asynchronous code breaks it further — a <code>
            setTimeout</code> callback doesn't sit on the call stack waiting; it's handed off
            entirely and only gets pushed back on once the current stack is empty.
          </p>
          <p>
            That last point is also where people conflate the call stack with the event loop.
            They're related but distinct: the call stack is strictly synchronous, one thread, one
            frame executing at a time. The event loop is the separate mechanism that watches for
            the stack to empty and then feeds it queued callbacks — a topic worth its own post.
          </p>

          <h3>Tools worth having in your workflow</h3>
          <p>
            Chrome DevTools shows you the real call stack for free. Open the Sources tab, set a
            breakpoint inside any function, and the Call Stack panel on the right will show you the
            exact same push order you'd trace by hand — useful for confirming your mental model
            against the real thing.
          </p>
        </section>

        <section id="conclusion">
          <h3>Wrapping up</h3>
          <p>
            The call stack is not a separate, exotic concept from "how functions call other
            functions" — it's a literal, visualizable record of exactly that. Once you can trace
            three or four nested calls by hand, the rest of the mental model — hoisting, recursion
            limits, and eventually the event loop — builds directly on top of it.
          </p>
          <h3>Next steps</h3>
          <p>
            Set a breakpoint in one of your own nested function calls, open the Call Stack panel in
            DevTools, and step through it. Compare what you see against what you'd have predicted
            before opening the tool.
          </p>
        </section>
      </article>

      <div className="sandbox-intro">
        <div className="eyebrow">Try it yourself</div>
        <h2>Step-through call stack</h2>
        <p>
          The same three-function example from above. Step forward and watch frames push and pop
          in real time, alongside the exact line executing.
        </p>
      </div>

      <StepPlayground />

      <div className="post-footer">
        <div className="author-card">
          <div className="author-avatar">A</div>
          <div className="author-info">
            <h3>
              <a href="https://uixalthaf.github.io/portfolio-minimalism/" className="author-name-link">
                Althaf
              </a>
            </h3>
            <p className="author-role">Frontend Engineer @ Samsung</p>
            <p className="author-bio">
              Frontend engineer working with React and TypeScript, writing about the parts of
              Frontend Development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(<App />);
}