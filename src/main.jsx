import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const MANIFEST = '/figma-frames/manifest.json';
const frameModules = import.meta.glob('./frames/Frame*.jsx');
const componentName = (id) => `Frame${id.replace(':', '_')}`;

function App() {
  const [manifest, setManifest] = useState([]);
  const [selected, setSelected] = useState('2667:32');
  const [message, setMessage] = useState('');
  useEffect(() => { fetch(MANIFEST).then((response) => response.json()).then(setManifest); }, []);
  const entry = manifest.find((item) => item.id === selected);
  const Screen = useMemo(() => {
    if (!entry) return null;
    const loader = frameModules[`./frames/${componentName(entry.id)}.jsx`];
    return loader ? lazy(loader) : null;
  }, [entry]);
  return <div className="studio">
    <aside>
      <h1>Budlum frames</h1>
      <select value={selected} onChange={(event) => setSelected(event.target.value)}>
        {manifest.map((item) => <option key={item.id} value={item.id}>{item.id} — {item.name}</option>)}
      </select>
      {entry && <small>{entry.nodeCount} ayrı Figma node’u</small>}
    </aside>
    <section className="viewport">
      <Suspense fallback={<span>Frame yükleniyor…</span>}>
        {Screen && <Screen onAction={setMessage} />}
      </Suspense>
    </section>
    {message && <div className="event">{message}<button onClick={() => setMessage('')}>×</button></div>}
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
