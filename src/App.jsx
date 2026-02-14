import React, { useEffect, useMemo, useRef, useState } from "react";

// Import cat images
import sadCrying from "./assets/images/sad/crying.jfif";
import sadCryingAss from "./assets/images/sad/crying ass.jfif";
import sadCryingRiver from "./assets/images/sad/crying river.jfif";
import sad1 from "./assets/images/sad/sad-1.jfif";
import funDumb from "./assets/images/fun/dumb.jfif";
import funLoading from "./assets/images/fun/loading.jfif";
import funThinking from "./assets/images/fun/thinking.jfif";
import flowerAwkward from "./assets/images/flower/flower arkward.jfif";
import flower from "./assets/images/flower/flower.jfif";
import happyNice from "./assets/images/happy/nice.jfif";
import happyYipeeee from "./assets/images/happy/yipeeee.jfif";
import heartBeMyValentine from "./assets/images/heart/be my valentine!.jfif";
import heart from "./assets/images/heart/heart.jfif";
import heartie from "./assets/images/heart/heartie.jfif";
import valentine from "./assets/images/heart/valentine.jfif";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Cat image collections
const sadCats = [sadCrying, sadCryingAss, sadCryingRiver, sad1];
const funCats = [funDumb, funLoading, funThinking];

// Specific image mapping
const specificImages = {
  'heart': heart,
  'flower awkard': flowerAwkward,
  'flower awkward': flowerAwkward,
  'flower': flower,
  'be my valentine!': heartBeMyValentine,
  'dumb': funDumb,
  'loading': funLoading,
  'thinking': funThinking,
  'yipeeee': happyYipeeee,
  'nice': happyNice,
  'heartie': heartie,
  'valentine': valentine,
  'love': heartBeMyValentine,
};

// Get random cat from a category or specific image
const getImage = (name) => {
  const lowerName = name.toLowerCase();
  
  // Check if it's a specific image
  if (specificImages[lowerName]) {
    return specificImages[lowerName];
  }
  
  // Otherwise, treat as category (sad/fun)
  const cats = lowerName === 'sad' ? sadCats : funCats;
  return cats[Math.floor(Math.random() * cats.length)];
};

// Process lines and replace image markers with actual image URLs (stable, won't change on re-render)
const processLinesWithImages = (lines) => {
  return lines.map(line => {
    if (!line.includes('{{')) return { text: line, images: [] };
    
    const parts = line.split(/({{[^}]+}})/g);
    const images = [];
    const processedParts = parts.map((part, idx) => {
      const match = part.match(/{{([^}]+)}}/);
      if (match) {
        const imageName = match[1].replace('IMG:', '').trim();
        const catImg = getImage(imageName);
        images.push({ idx, src: catImg });
        return `{{IMG_${idx}}}`; // stable placeholder
      }
      return part;
    });
    return { text: processedParts.join(''), images };
  });
};

// Parse line with pre-selected images
const parseLineWithImages = (lineData) => {
  if (!lineData.images || lineData.images.length === 0) {
    return lineData.text;
  }
  
  const parts = lineData.text.split(/({{IMG_\d+}})/g);
  return parts.map((part, idx) => {
    const match = part.match(/{{IMG_(\d+)}}/);
    if (match) {
      const imgIdx = parseInt(match[1]);
      const image = lineData.images.find(img => img.idx === imgIdx);
      if (image) {
        return <img key={idx} src={image.src} alt="cat" style={{ height: '5em', width: 'auto', verticalAlign: 'middle', margin: '0 4px', borderRadius: '4px' }} />;
      }
    }
    return part;
  });
};

/**
 * A simple typewriter queue:
 * - Feeds lines one by one into "printed"
 * - Each line is typed character-by-character
 */
function useTerminalTyper({ charDelay = 250 , lineDelay = 8000, skipMode = false } = {}) {
  const [printed, setPrinted] = useState([]); // fully printed lines
  const [activeLine, setActiveLine] = useState({ text: "", images: [] }); // currently typing
  const queueRef = useRef([]);
  const typingRef = useRef(false);

  const enqueueLines = (lines) => {
    const processedLines = processLinesWithImages(lines);
    queueRef.current.push(...processedLines);
    if (!typingRef.current) void run();
  };

  const clear = () => {
    queueRef.current = [];
    typingRef.current = false;
    setPrinted([]);
    setActiveLine({ text: "", images: [] });
  };

  const run = async () => {
    typingRef.current = true;

    while (queueRef.current.length > 0) {
      const next = queueRef.current.shift();

      // small pause between lines (skip if in skip mode)
      if (!skipMode && (printed.length > 0 || activeLine.text)) {
        await sleep(lineDelay);
      }

      // type the line
      setActiveLine({ text: "", images: next.images || [] });
      
      if (skipMode) {
        // Instant display in skip mode
        setPrinted((prev) => [...prev, next]);
      } else {
        // Normal typing - type only the text content
        const textToType = next.text;
        for (let i = 0; i < textToType.length; i++) {
          setActiveLine((prev) => ({ ...next, text: prev.text + textToType[i] }));
          // Make dots type slower for suspense effect
          const delay = textToType[i] === '.' ? charDelay * 6 : charDelay;
          await sleep(delay);
        }

        // Pause at the end of the line for more natural feel
        await sleep(charDelay * 4);

        // commit line to printed
        setPrinted((prev) => [...prev, next]);
        setActiveLine({ text: "", images: [] });
      }
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
  const [skipMode, setSkipMode] = useState(false); // persistent skip mode
  const bottomRef = useRef(null);

  const { printed, activeLine, enqueueLines, clear } = useTerminalTyper({
    charDelay: 50,
    lineDelay: 400,
    skipMode,
  });

  // Auto-scroll terminal
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [printed, activeLine]);

  const introLines = useMemo(
    () => [
      "booting PolitaOS v1.4.14...",
      "checking system mood... romantic {{heart}}",
      "initializing terminal...",
      "...",
      "...",
      "...",
      "Loading love_letter.txt...",
      "",
      "Hola mi Polita hermosa. Hoy estás igual de hermosa que siempre. {{flower awkard}}",
      "Te hice esta consola porque estaba pensando en ti y me di cuenta que te amo desde el fondo de mi corazón. Eres la mujer más hermosa, increíble y maravillosa que he conocido. Y entonces me di cuenta que quería hacerte algo especial para ti, nada más y nada menos que para hacerte una simple pregunta...",
      "......",
      "Do you want to be my special valentine this year mailov? {{be my valentine!}}",
      "",
      "Escoge sabiamente:",
      " - [Sipi] [FATAL: PERMISSION_DENIED_0x403]",
      " - [Nopi]",
    ],
    []
  );

  const unlockLines = useMemo(
    () => [
      "",
      "Ok veamos... voy a intentar a las malas. Perdóname pero es que soy nuevo en linux. {{dumb}}",
      "chmod 400: love_letter.txt",
      "sudo --askpass \"will you be my valentine?\"",
      "auth success ✅",
      "permission updated: [Yes] is now enabled.",
      "",
      "Yattaaaa! ya puedes volver a intentar jejeje {{Yipeee}}",
    ],
    []
  );

  const acceptedLines = useMemo(
    () => [
      "",
      "Input received: YES",
      "compiling sillyness... done.",
      "deploying cuddles... done.",
      "shipping kisses... done.",
      "",
      "Me has hecho el hombre más feliz del mundo! {{heartie}}",
      "Te amo mucho Polita. Feliz día de San Valentín! {{valentine}}",
      "",
      "Quedas cordialmente invitada a una cena conmigo el día de hoy, donde te prometo que disfrutaremos mucho del romance y de nuestro amor. {{love}}",
      "......",
      "Espero que hayas disfrutado tu PolitaOS terminal.",
      "...",
      "...",
      "...",
      "...",
      "Te amo Polita. Eres el amor de mi vida. Gracias por ser tú. :)",
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

      // Progressive messages for each attempt
      const progressiveMessages = [
        "recalculating... maybe you misclicked? {{IMG:sad}}",
        "hmm... let me check the manual real quick... {{IMG:fun}}",
        "trying editing permissions... nope, still locked {{IMG:sad}}",
        "maybe if I restart the system? {{IMG:fun}}",
        "checking Stack Overflow for solutions... {{IMG:fun}}",
        "does turning it off and on again work? {{IMG:sad}}",
        "deploying emergency heart protocols... {{IMG:fun}}",
        "accessing backup romantic plans... {{IMG:sad}}",
        "okay I'm getting creative now... {{IMG:fun}}",
        "alright, time for admin privileges... {{IMG:sad}}",
      ];

      const message = progressiveMessages[next - 1] || progressiveMessages[progressiveMessages.length - 1];

      // Print a snarky line each time
      enqueueLines([
        "",
        "",
        `> polita_input: "No"`,
        `hmm... attempt ${next}/${NO_CLICKS_TO_UNLOCK}`,
        next < NO_CLICKS_TO_UNLOCK
          ? message
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
    setSkipMode(false); // reset skip mode on restart
    clear();
    enqueueLines(introLines);
  };

  const toggleSkip = () => {
    setSkipMode(prev => !prev);
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
          <div style={styles.title}>polita-terminal</div>
          <button 
            onClick={toggleSkip} 
            style={{
              ...styles.skipBtn,
              background: skipMode ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)"
            }} 
            title={skipMode ? "Skip mode ON" : "Skip mode OFF"}
          >
            {skipMode ? "⏩" : "▶️"}
          </button>
          <button onClick={reset} style={styles.resetBtn} title="Restart">
            ↻
          </button>
        </div>

        <div style={styles.terminal} aria-label="terminal">
          {printed.map((line, idx) => (
            <pre key={idx} style={styles.line}>
              {parseLineWithImages(line)}
            </pre>
          ))}
          {activeLine.text || activeLine.images?.length > 0 ? (
            <pre style={styles.line}>
              {parseLineWithImages(activeLine)}
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
            Yes :D
          </button>
          <button
            onClick={onNo}
            disabled={choice === "yes"}
            style={{ ...styles.btn, ...styles.btnNo }}
          >
            No :,(
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
  skipBtn: {
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.04)",
    color: "#e6e6e6",
    borderRadius: 10,
    padding: "6px 10px",
    cursor: "pointer",
    marginRight: 8,
  },
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
