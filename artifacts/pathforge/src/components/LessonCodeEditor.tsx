import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/themes/prism-tomorrow.css'; // A dark theme
import { Play, RotateCcw, Terminal, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui';

interface LessonCodeEditorProps {
  initialCode?: string;
  className?: string;
}

type Language = 'javascript' | 'python' | 'java' | 'cpp';

const DEFAULT_SNIPPETS: Record<Language, string> = {
  javascript: `// Write your algorithmic solution here\nfunction solve(input) {\n  // Your code here\n  return input;\n}\n\n// Example test\nconsole.log("Result:", solve([1, 2, 3]));`,
  python: `# Write your algorithmic solution here\ndef solve(input_data):\n    # Your code here\n    return input_data\n\n# Example test\nprint("Result:", solve([1, 2, 3]))`,
  java: `// Write your algorithmic solution here\nclass Solution {\n    public static Object solve(int[] input) {\n        // Your code here\n        return input;\n    }\n\n    public static void main(String[] args) {\n        int[] testInput = {1, 2, 3};\n        System.out.println("Result: " + java.util.Arrays.toString((int[])solve(testInput)));\n    }\n}`,
  cpp: `// Write your algorithmic solution here\n#include <iostream>\n#include <vector>\n\nstd::vector<int> solve(std::vector<int> input) {\n    // Your code here\n    return input;\n}\n\nint main() {\n    std::vector<int> testInput = {1, 2, 3};\n    std::vector<int> result = solve(testInput);\n    std::cout << "Result: executed";\n    return 0;\n}`
};

export function LessonCodeEditor({ initialCode, className = '' }: LessonCodeEditorProps) {
  const [language, setLanguage] = useState<Language>('javascript');
  const [codes, setCodes] = useState<Record<Language, string>>({
    javascript: initialCode || DEFAULT_SNIPPETS.javascript,
    python: DEFAULT_SNIPPETS.python,
    java: DEFAULT_SNIPPETS.java,
    cpp: DEFAULT_SNIPPETS.cpp,
  });
  
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const currentCode = codes[language];

  const updateCurrentCode = (newCode: string) => {
    setCodes(prev => ({ ...prev, [language]: newCode }));
  };

  const executeCode = () => {
    setOutput([]);
    setError(null);

    if (language !== 'javascript') {
      setOutput([
        `[Environment Info]`,
        `Local browser execution is currently only supported for JavaScript.`,
        `To execute ${language}, please connect a backend code execution engine or run it locally in your IDE.`
      ]);
      return;
    }

    const logs: string[] = [];
    
    // Intercept console.log
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    };

    try {
      // Evaluate the code
      // eslint-disable-next-line no-new-func
      const fn = new Function(currentCode);
      fn();
      setOutput(logs.length > 0 ? logs : ['Code executed successfully (no output).']);
    } catch (err: any) {
      setError(err.toString());
    } finally {
      // Restore console.log
      console.log = originalLog;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleReset = () => {
    setCodes(prev => ({
      ...prev,
      [language]: language === 'javascript' && initialCode ? initialCode : DEFAULT_SNIPPETS[language]
    }));
    setOutput([]);
    setError(null);
  };

  return (
    <div className={`border border-border bg-card/40 flex flex-col ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border bg-black/40 px-4 py-3 gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary">
            <Terminal className="w-4 h-4" />
            <h2 className="text-xs font-mono tracking-[0.2em] hidden sm:inline-block">PLAYGROUND</h2>
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="flex items-center bg-black/40 rounded border border-border/50 overflow-hidden text-[10px] font-mono">
            {(['javascript', 'python', 'java', 'cpp'] as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1.5 transition-colors ${
                  language === lang 
                    ? 'bg-primary/20 text-primary border-b-2 border-primary' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-white border-b-2 border-transparent'
                }`}
              >
                {lang === 'javascript' ? 'JS/TS' : lang === 'cpp' ? 'C++' : lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 self-end sm:self-auto">
          <Button variant="outline" size="sm" onClick={handleReset} className="h-8 text-[10px]">
            <RotateCcw className="w-3 h-3 mr-2" /> RESET
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 text-[10px]">
            {hasCopied ? <Check className="w-3 h-3 mr-2 text-green-400" /> : <Copy className="w-3 h-3 mr-2" />} 
            {hasCopied ? 'COPIED' : 'COPY'}
          </Button>
          <Button size="sm" onClick={executeCode} className="h-8 text-[10px]">
            <Play className="w-3 h-3 mr-2" /> RUN
          </Button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 min-h-[300px] divide-y md:divide-y-0 md:divide-x divide-border flex-1">
        {/* Editor Pane */}
        <div className="bg-[#1d1f21] overflow-hidden relative font-mono text-sm">
          <Editor
            value={currentCode}
            onValueChange={updateCurrentCode}
            highlight={code => Prism.highlight(code, Prism.languages[language] || Prism.languages.javascript, language)}
            padding={16}
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: 13,
              minHeight: '100%',
              backgroundColor: 'transparent'
            }}
            textareaClassName="focus:outline-none"
          />
        </div>
        
        {/* Output Pane */}
        <div className="bg-black/60 p-4 font-mono text-xs overflow-y-auto">
          <div className="text-muted-foreground/60 mb-2 uppercase tracking-widest text-[10px]">Output Console</div>
          {error ? (
            <div className="text-red-400 whitespace-pre-wrap">{error}</div>
          ) : output.length > 0 ? (
            <div className={`whitespace-pre-wrap flex flex-col gap-1 ${language !== 'javascript' ? 'text-amber-300' : 'text-green-300'}`}>
              {output.map((line, i) => (
                <span key={i}>&gt; {line}</span>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground/40 italic">Run your code to see output here...</div>
          )}
        </div>
      </div>
    </div>
  );
}
