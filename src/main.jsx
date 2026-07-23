import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const MANIFEST = '/figma-frames/manifest.json';
const frameModules = import.meta.glob('./frames/Frame*.jsx');
const componentName = (id) => `Frame${id.replace(':', '_')}`;

function frameMatchesQuery(frame, query) {
  if (!query.trim()) return true;
  const normalized = query.trim().toLocaleLowerCase('tr-TR');
  return `${frame.id} ${frame.name}`.toLocaleLowerCase('tr-TR').includes(normalized);
}

function App() {
  const [manifest, setManifest] = useState([]);
  const [selected, setSelected] = useState('');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch(MANIFEST)
      .then((response) => response.json())
      .then((items) => {
        setManifest(items);
        setSelected((current) => current || items[0]?.id || '');
      });
  }, []);

  const visibleFrames = useMemo(() => manifest.filter((frame) => frameMatchesQuery(frame, query)), [manifest, query]);
  const entry = manifest.find((item) => item.id === selected) || visibleFrames[0] || manifest[0];
  const Screen = useMemo(() => {
    if (!entry) return null;
    const loader = frameModules[`./frames/${componentName(entry.id)}.jsx`];
    return loader ? lazy(loader) : null;
  }, [entry]);

  useEffect(() => {
    if (entry && selected !== entry.id) setSelected(entry.id);
  }, [entry, selected]);

  return <div className="studio">
    <aside>
      <h1>Budlum Figma frames</h1>
      <input
        className="frame-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Frame ara…"
        aria-label="Frame ara"
      />
      <select value={entry?.id || selected} onChange={(event) => setSelected(event.target.value)} size={Math.min(Math.max(visibleFrames.length, 2), 12)}>
        {visibleFrames.map((item) => <option key={item.id} value={item.id}>{item.id} — {item.name}</option>)}
      </select>
      {entry && <small>{entry.nodeCount} ayrı Figma node’u · kaynak: {componentName(entry.id)}</small>}
      <p>{manifest.length} top-level Figma frame React renderer üzerinden yükleniyor. Eksik exact geometry olan node’lar audit’te tutulur; uydurma render yapılmaz.</p>
    </aside>
    <section className="viewport">
      <Suspense fallback={<span>Frame yükleniyor…</span>}>
        {Screen && <Screen onAction={setMessage} />}
      </Suspense>
    </section>
    {message && <div className="event">
      <strong>{message.name}</strong><br />
      <small>{message.nodeId}</small>
      <button onClick={() => setMessage(null)}>×</button>
    </div>}
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
