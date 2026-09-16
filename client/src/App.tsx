import { useState } from 'react';
import { QuizGenerator } from './components/QuizGenerator';
import Flashcards from './components/Flashcards';

type View = 'quiz' | 'flashcards';

function App() {
  const [view, setView] = useState<View>('quiz');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px 0', borderBottom: '1px solid #292524' }}>
        {(['quiz', 'flashcards'] as View[]).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '6px 20px', borderRadius: 99, cursor: 'pointer', fontSize: 12,
              border: view === v ? '1px solid #d97706' : '1px solid #44403c',
              background: view === v ? 'rgba(217,119,6,0.15)' : 'transparent',
              color: view === v ? '#fbbf24' : '#78716c',
              textTransform: 'capitalize', letterSpacing: 1,
            }}
          >{v === 'quiz' ? 'Quiz Generator' : 'Flashcards'}</button>
        ))}
      </div>

      {view === 'quiz' ? (
        <div className="flex flex-col items-center justify-center p-4">
          <QuizGenerator />
        </div>
      ) : (
        <Flashcards />
      )}
    </div>
  );
}

export default App;
