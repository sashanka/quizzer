import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, FileText, Check, Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export const QuizGenerator = () => {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load default prompt on mount
  React.useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/config');
        if (response.data.defaultPrompt) {
          setPrompt(response.data.defaultPrompt);
        }
      } catch (error) {
        console.error('Failed to fetch config:', error);
        // Fallback if needed, or leave empty
      }
    };
    fetchConfig();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };



  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload a file.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessUrl(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', prompt);

    try {
      const response = await axios.post('http://localhost:3000/api/generate-quiz', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccessUrl(response.data.formUrl);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to generate quiz. Please check backend logs/keys.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Quizzer AI</h1>
        <p className="text-muted-foreground">Turn your documents into Google Forms quizzes instantly.</p>
      </div>

      {/* Main Input Area */}
      <div className="flex flex-col rounded-xl border bg-card focus-within:ring-2 focus-within:ring-ring focus-within:border-primary overflow-hidden shadow-sm transition-all">
        <textarea
          className="w-full min-h-[400px] p-4 bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-base leading-relaxed"
          placeholder="Enter custom instructions or content for the quiz generation..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        {/* Toolbar */}
        <div className="flex items-center gap-3 p-3 border-t bg-muted/30">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-secondary-foreground text-sm font-medium"
            title="Upload file"
          >
            <Upload className="w-4 h-4" />
            <span>Attach File</span>
          </button>

          {file ? (
            <span className="flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded">
              <FileText className="w-3 h-3" />
              {file.name}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Supported formats: PDF, TXT
            </span>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.txt"
          onChange={handleFileChange}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || !file} // Keep disabled logic? Or allow prompt-only if file optional in future? Current backend requires file.
        className={cn(
          "w-full py-4 px-6 rounded-lg font-medium text-lg text-primary-foreground transition-all flex items-center justify-center gap-2",
          loading || !file ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Generating Quiz...
          </>
        ) : (
          <>
            Generate Quiz
          </>
        )}
      </button>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {successUrl && (
        <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg space-y-3">
          <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
            <div className="p-2 bg-green-500/20 rounded-full">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg">Quiz Generated Successfully!</h3>
          </div>
          <p className="text-sm text-muted-foreground ml-1">Your Google Form is ready. Click the link below to view it.</p>
          <a
            href={successUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium break-all"
          >
            <LinkIcon className="w-4 h-4" />
            {successUrl}
          </a>
        </div>
      )}
    </div>
  );
};
