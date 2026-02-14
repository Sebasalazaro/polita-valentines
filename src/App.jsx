import React, { useEffect, useMemo, useRef, useState } from "react";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * A simple typewriter queue:
 * - Feeds lines one by one into "printed"
 * - Each line is typed character-by-character
 */
function useTerminalTyper({ charDelay = 18, lineDelay = 450 } = {}) {
  const [printed, setPrinted] = useState([]); // fully printed lines
  const [activeLine, setActiveLine] = useState(""); // currently typing
  const queueRef = useRef([]);
  const typingRef = useRef(false);

  const enqueueLines = (lines) => {
    queueRef.current.push(...lines);
    if (!typingRef.current) void run();
  };

  const clear = () => {
    queueRef.current = [];
    typingRef.current = false;
    setPrinted([]);
    setActiveLine("");
  };

  const run = async () => {
    typingRef.current = true;

    while (queueRef.current.length > 0) {
      const next = queueRef.current.shift();

      // small pause between lines
      if (printed.length > 0 || activeLine) await sleep(lineDelay);

      // type the line
      setActiveLine("");
      for (let i = 0; i < next.length; i++) {
        setActiveLine((prev) => prev + next[i]);
        await sleep(charDelay);
      }

      // commit line to printed
      setPrinted((prev) => [...prev, next]);
      setActiveLine("");
    }

    typingRef.current = false;
  };

  return { printed, activeLine, enqueueLines, clear, isTyping: () => typingRef.current };
}

export default function App() {
  // ---- CONFIG ----
  const NO_CLICKS_TO_UNLOCK = 10; // change to 5 if you want faster
  const disableYesInitially = true;

  // ---- UI STATE ----
  const [noClicks, setNoClicks] = useState(0);
  const [yesUnlocked, setYesUnlocked] = useState(!disableYesInitially);
  const [choice, setChoice] = useState(null); // "yes" | "no" | null
  const [step, setStep] = useState("intro"); // "intro" | "unlock" | "accepted"
  const bottomRef = useRef(null);

  const { printed, activeLine, enqueueLines, clear } = useTerminalTyper({
    charDelay: 16,
    lineDelay: 380,
  });

  // Auto-scroll terminal
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [printed, activeLine]);

  const introLines = useMemo(
    () => [
      "booting valentineOS v1.4.14...",
      "checking system mood... ✅ romantic",
      "initializing terminal...",
      "",
      "Hey darling. I hope you are doing well in this beautiful day.",
      "I wrote you a tiny program because I'm cheesy like that.",
      "",
      "Do you want to be my special valentine this year? 💘",
      "",
      "Choose wisely:",
      " - [Yes] (currently: permission denied)",
      " - [No]",
    ],
    []
  );

  const unlockLines = useMemo(
    () => [
      "",
      "Oh shoot... lemme try something. I'm new to this Linux console.",
      "chmod 400: love_letter.txt",
      "chmod 600: my_heart.dat",
      "sudo --askpass \"will you be my valentine?\"",
      "auth success ✅",
      "permission updated: [Yes] is now enabled.",
      "",
      "Okay... try again 😌",
    ],
    []
  );

  const acceptedLines = useMemo(
    () => [
      "",
      "✅ input received: YES",
      "compiling butterflies... done.",
      "deploying hugs... done.",
      "shipping kisses... done.",
      "",
      "You just made me the happiest person alive.",
      "I love you. Happy Valentine’s Day 💖",
      "",
      "P.S. screenshot this page so we can laugh later 😄",
    ],
    []
  );

  // Start intro typing once
  useEffect(() => {
    clear();
    enqueueLines(introLines);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unlockYes = () => {
    if (yesUnlocked) return;
    setYesUnlocked(true);
    setStep("unlock");
    enqueueLines(unlockLines);
  };

  const onNo = () => {
    if (choice === "yes") return;

    setChoice("no");
    setNoClicks((n) => {
      const next = n + 1;

      // Print a snarky line each time
      enqueueLines([
        "",
        `> girlfriend_input: "No"`,
        `hmm... attempt ${next}/${NO_CLICKS_TO_UNLOCK}`,
        next < NO_CLICKS_TO_UNLOCK
          ? "recalculating... maybe you misclicked? 👀"
          : "okay okay, enough. escalating privileges...",
      ]);

      if (next >= NO_CLICKS_TO_UNLOCK) unlockYes();
      return next;
    });
  };

  const onYes = () => {
    if (!yesUnlocked) {
      enqueueLines(["", "permission denied: cannot execute 'Yes' 😅"]);
      return;
    }
    setChoice("yes");
    setStep("accepted");
    enqueueLines(acceptedLines);
  };

  const reset = () => {
    setNoClicks(0);
    setChoice(null);
    setStep("intro");
    setYesUnlocked(!disableYesInitially);
    clear();
    enqueueLines(introLines);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.dots}>
            <span style={{ ...styles.dot, background: "#ff5f56" }} />
            <span style={{ ...styles.dot, background: "#ffbd2e" }} />
            <span style={{ ...styles.dot, background: "#27c93f" }} />
          </div>
          <div style={styles.title}>valentine-terminal</div>
          <button onClick={reset} style={styles.resetBtn} title="Restart">
            ↻
          </button>
        </div>

        <div style={styles.terminal} aria-label="terminal">
          {printed.map((line, idx) => (
            <pre key={idx} style={styles.line}>
              {line}
            </pre>
          ))}
          {activeLine ? (
            <pre style={styles.line}>
              {activeLine}
              <span style={styles.cursor}>█</span>
            </pre>
          ) : (
            <pre style={styles.line}>
              <span style={styles.cursor}>█</span>
            </pre>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={styles.actions}>
          <button
            onClick={onYes}
            disabled={!yesUnlocked || choice === "yes"}
            style={{
              ...styles.btn,
              ...(yesUnlocked && choice !== "yes" ? styles.btnYes : styles.btnDisabled),
            }}
          >
            Yes 💖
          </button>
          <button
            onClick={onNo}
            disabled={choice === "yes"}
            style={{ ...styles.btn, ...styles.btnNo }}
          >
            No 🙃
          </button>
        </div>

        <div style={styles.footer}>
          <span>Attempts: {noClicks}</span>
          <span>Mode: {step}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 20,
    background: "radial-gradient(1200px 600px at 50% 20%, #1b1f2a 0%, #0b0e14 60%, #07090e 100%)",
    color: "#e6e6e6",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  card: {
    width: "min(900px, 96vw)",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 20px 80px rgba(0,0,0,0.55)",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(10,12,18,0.9)",
    backdropFilter: "blur(10px)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
  },
  dots: { display: "flex", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 999 },
  title: { fontSize: 13, opacity: 0.9, flex: 1, textAlign: "center" },
  resetBtn: {
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.04)",
    color: "#e6e6e6",
    borderRadius: 10,
    padding: "6px 10px",
    cursor: "pointer",
  },
  terminal: {
    padding: 16,
    height: "min(520px, 62vh)",
    overflow: "auto",
    background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)",
  },
  line: {
    margin: 0,
    whiteSpace: "pre-wrap",
    lineHeight: 1.5,
    fontSize: 14,
  },
  cursor: {
    display: "inline-block",
    marginLeft: 4,
    animation: "blink 1s step-end infinite",
  },
  actions: {
    display: "flex",
    gap: 12,
    padding: 14,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    justifyContent: "center",
  },
  btn: {
    minWidth: 160,
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.15)",
    cursor: "pointer",
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  btnYes: {
    background: "rgba(255, 70, 140, 0.16)",
  },
  btnNo: {
    background: "rgba(120, 170, 255, 0.10)",
  },
  btnDisabled: {
    background: "rgba(255,255,255,0.03)",
    opacity: 0.5,
    cursor: "not-allowed",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 14px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    fontSize: 12,
    opacity: 0.8,
  },
};

// Add keyframes via a tiny style tag (no separate CSS file needed)
if (typeof document !== "undefined" && !document.getElementById("terminal-blink-style")) {
  const style = document.createElement("style");
  style.id = "terminal-blink-style";
  style.innerHTML = `
    @keyframes blink { 50% { opacity: 0; } }
  `;
  document.head.appendChild(style);
}
