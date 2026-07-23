import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const MANIFEST = '/figma-frames/manifest.json';
const WALLET_FRAME_IDS = new Set([
  '2223:54',
  '2446:824',
  '2377:22',
  '2901:266',
  '2901:704',
  '2902:961',
  '2907:1281',
  '2972:3658',
  '2972:3858',
  '2972:4204',
]);
const frameModules = import.meta.glob('./frames/Frame*.jsx');
const componentName = (id) => `Frame${id.replace(':', '_')}`;

function App() {
  const [manifest, setManifest] = useState([]);
  const [selected, setSelected] = useState('2223:54');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch(MANIFEST)
      .then((response) => response.json())
      .then((items) => setManifest(items.filter((item) => WALLET_FRAME_IDS.has(item.id))));
  }, []);

  const entry = manifest.find((item) => item.id === selected) || manifest[0];
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
      <h1>Budlum wallet states</h1>
      <select value={entry?.id || selected} onChange={(event) => setSelected(event.target.value)}>
        {manifest.map((item) => <option key={item.id} value={item.id}>{item.id} — {item.name}</option>)}
      </select>
      {entry && <small>{entry.nodeCount} ayrı Figma node’u · kaynak: {componentName(entry.id)}</small>}
      <p>Bu görünüm yalnızca Wallet frame/state görevindeki 10 top-level Figma frame’i yükler.</p>
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
