import React from 'react';
import { Isometric1880 } from './components/isometric/Isometric1880';

export const App: React.FC = () => {
  return (
    <div className="w-screen h-screen relative overflow-hidden bg-stone-950 font-sans select-none">
      <Isometric1880 />
    </div>
  );
};

export default App;
