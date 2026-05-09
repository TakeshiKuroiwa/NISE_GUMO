import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { FileCode2, Folder, Save, Settings } from 'lucide-react';

const files = [
  {
    name: 'src/main.rs',
    language: 'rust',
    value: `use axum::{routing::get, Router};

async fn health() -> &'static str {
    "NISE_GUMO mock backend is running"
}

#[tokio::main]
async fn main() {
    let app = Router::new().route("/health", get(health));
    println!("server: http://127.0.0.1:3001");
}`,
  },
  {
    name: 'src/App.tsx',
    language: 'typescript',
    value: `export function App() {
  return <NiseGumoWorkspace mode="mock" />;
}`,
  },
  {
    name: 'README.md',
    language: 'markdown',
    value: '# NISE_GUMO\n\nWBS、カレンダー、コードエディタを統合したプロジェクト管理アプリ。',
  },
];

export const EditorPage: React.FC = () => {
  const [activeFile, setActiveFile] = useState(files[0]);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [fontSize, setFontSize] = useState(14);

  return (
    <div className="editor-shell">
      <aside className="editor-explorer">
        <div className="editor-panel-title">
          <Folder size={16} />
          workspace
        </div>
        {files.map((file) => (
          <button
            key={file.name}
            className={activeFile.name === file.name ? 'active' : ''}
            onClick={() => setActiveFile(file)}
          >
            <FileCode2 size={15} />
            {file.name}
          </button>
        ))}
      </aside>

      <main className="editor-main">
        <div className="editor-toolbar">
          <div>
            <strong>{activeFile.name}</strong>
            <span>{activeFile.language}</span>
          </div>
          <label>
            <Settings size={15} />
            <select value={theme} onChange={(event) => setTheme(event.target.value as 'vs-dark' | 'light')}>
              <option value="vs-dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </label>
          <label>
            Font
            <input
              type="number"
              min={12}
              max={22}
              value={fontSize}
              onChange={(event) => setFontSize(Number(event.target.value))}
            />
          </label>
          <button>
            <Save size={16} />
            保存
          </button>
        </div>
        <Editor
          height="calc(100vh - 112px)"
          theme={theme}
          language={activeFile.language}
          value={activeFile.value}
          options={{
            fontSize,
            minimap: { enabled: true },
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            fontFamily: 'Fira Code, Consolas, monospace',
          }}
        />
      </main>
    </div>
  );
};
