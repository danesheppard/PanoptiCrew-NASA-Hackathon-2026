import { useState } from 'react';
import Welcome from './views/Welcome.jsx';
import GlobalMap from './views/GlobalMap.jsx';
import CaseStudy from './views/CaseStudy.jsx';

export default function App() {
  const [view, setView] = useState('welcome');
  const [study, setStudy] = useState(null);

  if (view === 'welcome') return <Welcome onStart={() => setView('map')} />;

  if (view === 'case' && study)
    return <CaseStudy study={study} onBack={() => setView('map')} />;

  return (
    <GlobalMap
      selected={study}
      onSelect={setStudy}
      onLaunch={() => setView('case')}
      onHome={() => setView('welcome')}
    />
  );
}
