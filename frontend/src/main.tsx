import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { RoleContextWrapper } from './context/RoleContextWrapper.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <RoleContextWrapper>
      <App />
    </RoleContextWrapper>
  </BrowserRouter>
);
