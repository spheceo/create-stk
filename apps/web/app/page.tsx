"use client";

import Link from "next/link";
import { useState } from "react";

const commands = [
  {
    id: "npm",
    label: "npm",
    command: "npx create-stk@latest my-app",
  },
  {
    id: "pnpm",
    label: "pnpm",
    command: "pnpm create stk my-app",
  },
  {
    id: "bun",
    label: "bun",
    command: "bun create stk my-app",
  },
] as const;

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.06c-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.34-1.75-1.34-1.75-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1-.32 3.3 1.23a11.45 11.45 0 0 1 6 0c2.28-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.69.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between">
      <Link
        aria-label="Create STK home"
        className="text-sm font-bold tracking-normal text-[#f5f5f5]"
        href="/"
      >
        create-stk
      </Link>

      <Link
        aria-label="View Create STK on GitHub"
        className="grid h-10 w-10 place-items-center text-[#f5f5f5] transition hover:text-[#61affe] focus:outline-none focus:ring-2 focus:ring-[#61affe] focus:ring-offset-4 focus:ring-offset-[#0f0f0f]"
        href="https://github.com/spheceo/create-stk"
      >
        <GitHubIcon />
      </Link>
    </header>
  );
}

export default function Home() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (command: string, id: string) => {
    navigator.clipboard.writeText(command);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  return (
    <main className="h-dvh overflow-hidden bg-[#0f0f0f] text-[#f5f5f5]">
      <style>{`
        #pm-npm:checked ~ .command-stage .command-panel:not([data-pm="npm"]),
        #pm-pnpm:checked ~ .command-stage .command-panel:not([data-pm="pnpm"]),
        #pm-bun:checked ~ .command-stage .command-panel:not([data-pm="bun"]) {
          display: none;
        }

        #pm-npm:checked ~ .pm-switch label[for="pm-npm"],
        #pm-pnpm:checked ~ .pm-switch label[for="pm-pnpm"],
        #pm-bun:checked ~ .pm-switch label[for="pm-bun"] {
          color: #f5f5f5;
          border-color: #61affe;
        }
      `}</style>

      <section className="mx-auto flex h-dvh w-full max-w-6xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <Header />

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(340px,440px)]">
          <div>
            <h1 className="max-w-3xl text-balance text-[clamp(3.25rem,7vw,6.8rem)] font-black leading-[0.88] tracking-normal">
              Start clean. Stay in control.
            </h1>

            <p className="mt-6 max-w-lg text-pretty text-lg leading-8 text-[#a0a0a0]">
              Create STK gives empty projects a clean shape without forcing a
              framework story onto the first commit.
            </p>
          </div>

          <div className="w-full">
            {commands.map((item, index) => (
              <input
                className="sr-only"
                defaultChecked={index === 0}
                id={`pm-${item.id}`}
                key={item.id}
                name="package-manager"
                type="radio"
              />
            ))}

            <div className="pm-switch flex gap-7 border-b border-[#2a2a2a] font-mono text-sm font-semibold uppercase tracking-[0.18em] text-[#707070]">
              {commands.map((item) => (
                <label
                  className="-mb-px cursor-pointer border-b-2 border-transparent py-3 transition hover:text-[#f5f5f5]"
                  htmlFor={`pm-${item.id}`}
                  key={item.id}
                >
                  {item.label}
                </label>
              ))}
            </div>

            <div className="command-stage">
              {commands.map((item) => (
                <div
                  className="command-panel group relative flex items-center justify-between py-5 px-4 -mx-4"
                  data-pm={item.id}
                  key={item.id}
                >
                  <code className="font-mono text-base font-semibold text-[#f5f5f5] sm:text-xl">
                    <span className="select-none text-[#61affe]">$ </span>
                    {item.command}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.command, item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-4 p-2 hover:text-[#61affe] text-[#707070] cursor-pointer"
                    title="Copy to clipboard"
                  >
                    {copiedId === item.id ? <CheckIcon /> : <CopyIcon />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
