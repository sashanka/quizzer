import { useState, useEffect } from "react";
import axios from "axios";

interface Card {
  question: string;
  answer: string;
  chapter: string;
}

interface Section {
  title: string;
  questions: { question: string; answer: string }[];
}

interface FlashcardsData {
  title: string;
  subtitle: string;
  sections: Section[];
}

function shuffle(arr: Card[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Flashcards() {
  const [data, setData] = useState<FlashcardsData | null>(null);
  const [chapter, setChapter] = useState("All");
  const [deck, setDeck] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState({ known: 0, learning: 0 });

  useEffect(() => {
    axios.get("/api/flashcards").then(res => {
      const d: FlashcardsData = res.data;
      setData(d);
      const all = d.sections.flatMap(s => s.questions.map(q => ({ ...q, chapter: s.title })));
      setDeck(shuffle(all));
    });
  }, []);

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: "#1c1917", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#78716c", fontFamily: "Georgia, serif" }}>Loading…</p>
      </div>
    );
  }

  const ALL: Card[] = data.sections.flatMap(s => s.questions.map(q => ({ ...q, chapter: s.title })));

  const switchChapter = (ch: string) => {
    const cards = ch === "All" ? ALL : ALL.filter(c => c.chapter === ch);
    setChapter(ch);
    setDeck(shuffle(cards));
    setIdx(0);
    setFlipped(false);
    setScore({ known: 0, learning: 0 });
  };

  const advance = (result: "known" | "learning" | null) => {
    if (result) setScore(s => ({ ...s, [result]: s[result] + 1 }));
    setFlipped(false);
    setTimeout(() => setIdx(i => i + 1), 200);
  };

  const restart = () => {
    setDeck(d => shuffle(d));
    setIdx(0);
    setFlipped(false);
    setScore({ known: 0, learning: 0 });
  };

  const card = deck[idx];
  const done = idx >= deck.length;
  const pct = deck.length ? (idx / deck.length) * 100 : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#1c1917", display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 16px 48px", fontFamily: "Georgia, serif" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#78716c", textTransform: "uppercase", marginBottom: 6 }}>Study Deck</div>
        <h1 style={{ fontSize: "clamp(18px,4vw,30px)", color: "#fef3c7", margin: 0, fontWeight: "normal", letterSpacing: 1 }}>{data.title}</h1>
        <p style={{ color: "#78716c", fontSize: 13, margin: "6px 0 0", fontStyle: "italic" }}>{data.subtitle} · {ALL.length} cards</p>
      </div>

      {/* Chapter tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", maxWidth: 660, marginBottom: 28 }}>
        {["All", ...data.sections.map(s => s.title)].map(ch => (
          <button key={ch} onClick={() => switchChapter(ch)} style={{
            padding: "4px 12px", borderRadius: 99, cursor: "pointer", fontSize: 11,
            border: chapter === ch ? "1px solid #d97706" : "1px solid #44403c",
            background: chapter === ch ? "rgba(217,119,6,0.15)" : "transparent",
            color: chapter === ch ? "#fbbf24" : "#78716c",
            transition: "all .15s"
          }}>{ch === "All" ? "All" : ch.split(":")[0]}</button>
        ))}
      </div>

      {/* Progress */}
      <div style={{ width: "100%", maxWidth: 520, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#57534e", marginBottom: 6 }}>
          <span>{done ? "Complete!" : `${idx + 1} / ${deck.length}`}</span>
          <span><span style={{ color: "#4ade80" }}>✓ {score.known}</span>  <span style={{ color: "#f87171" }}>✗ {score.learning}</span></span>
        </div>
        <div style={{ height: 3, background: "#292524", borderRadius: 2 }}>
          <div style={{ height: "100%", width: pct + "%", background: "linear-gradient(90deg,#b45309,#f59e0b)", borderRadius: 2, transition: "width .4s" }} />
        </div>
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 520, perspective: 1200, marginBottom: 20 }}>
        {!done ? (
          <div onClick={() => setFlipped(f => !f)} style={{
            position: "relative", height: 280, cursor: "pointer",
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform .5s cubic-bezier(.4,0,.2,1)"
          }}>
            {/* Front */}
            <div style={{
              position: "absolute", inset: 0, backfaceVisibility: "hidden",
              background: "linear-gradient(135deg,#292524,#1c1917)",
              border: "1px solid #44403c", borderRadius: 10,
              boxShadow: "0 20px 60px rgba(0,0,0,.5)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "36px 40px"
            }}>
              <div style={{ fontSize: 9, letterSpacing: 4, color: "#d97706", textTransform: "uppercase", marginBottom: 20 }}>Question</div>
              <p style={{ fontSize: "clamp(15px,2.5vw,19px)", color: "#fef3c7", textAlign: "center", lineHeight: 1.7, margin: 0 }}>{card.question}</p>
              <div style={{ position: "absolute", bottom: 14, fontSize: 9, letterSpacing: 3, color: "#44403c" }}>TAP TO FLIP</div>
              <div style={{ position: "absolute", top: 14, right: 16, fontSize: 9, color: "#57534e" }}>{card.chapter}</div>
            </div>
            {/* Back */}
            <div style={{
              position: "absolute", inset: 0, backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "linear-gradient(135deg,#14290f,#0f1f0a)",
              border: "1px solid #365314", borderRadius: 10,
              boxShadow: "0 20px 60px rgba(0,0,0,.5)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "36px 40px"
            }}>
              <div style={{ fontSize: 9, letterSpacing: 4, color: "#4ade80", textTransform: "uppercase", marginBottom: 20 }}>Answer</div>
              <p style={{ fontSize: "clamp(15px,2.5vw,19px)", color: "#dcfce7", textAlign: "center", lineHeight: 1.7, margin: 0 }}>{card.answer}</p>
            </div>
          </div>
        ) : (
          <div style={{
            height: 280, background: "linear-gradient(135deg,#14290f,#0f1f0a)",
            border: "1px solid #365314", borderRadius: 10,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🎉</div>
            <p style={{ color: "#86efac", fontSize: 22, margin: "0 0 6px" }}>Deck Complete!</p>
            <p style={{ color: "#4ade80", fontSize: 13, margin: "0 0 24px", fontStyle: "italic" }}>{score.known} known · {score.learning} still learning</p>
            <button onClick={restart} style={{
              padding: "10px 28px", background: "rgba(74,222,128,.1)", border: "1px solid #4ade80",
              borderRadius: 6, color: "#4ade80", fontSize: 12, letterSpacing: 2, cursor: "pointer"
            }}>SHUFFLE & RESTART</button>
          </div>
        )}
      </div>

      {/* Buttons */}
      {!done && flipped && (
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => advance("learning")} style={{
            padding: "10px 24px", background: "rgba(248,113,113,.08)", border: "1px solid #ef4444",
            borderRadius: 6, color: "#f87171", fontSize: 12, letterSpacing: 1, cursor: "pointer"
          }}>✗ Still Learning</button>
          <button onClick={() => advance("known")} style={{
            padding: "10px 24px", background: "rgba(74,222,128,.08)", border: "1px solid #4ade80",
            borderRadius: 6, color: "#4ade80", fontSize: 12, letterSpacing: 1, cursor: "pointer"
          }}>✓ Got It</button>
        </div>
      )}
      {!done && !flipped && (
        <button onClick={() => advance(null)} style={{
          padding: "8px 20px", background: "transparent", border: "1px solid #44403c",
          borderRadius: 6, color: "#57534e", fontSize: 11, cursor: "pointer"
        }}>Skip →</button>
      )}
    </div>
  );
}
