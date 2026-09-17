import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Offers from './pages/Offers';
import NewOffer from './pages/NewOffer';
import OfferDetails from './pages/OfferDetails';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { OffersProvider } from './context/OffersContext.jsx';

// O OffersProvider passou a ficar aqui dentro (antes estava no
// main.jsx) para que a busca das ofertas no Supabase só aconteça
// depois do login — e não na tela de login.
function AreaInterna({ children }) {
  return (
    <ProtectedRoute>
      <OffersProvider>{children}</OffersProvider>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Única rota pública */}
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <AreaInterna>
            <Dashboard />
          </AreaInterna>
        }
      />
      <Route
        path="/ofertas"
        element={
          <AreaInterna>
            <Offers />
          </AreaInterna>
        }
      />
      <Route
        path="/ofertas/nova"
        element={
          <AreaInterna>
            <NewOffer />
          </AreaInterna>
        }
      />
      <Route
        path="/ofertas/:id"
        element={
          <AreaInterna>
            <OfferDetails />
          </AreaInterna>
        }
      />
    </Routes>
  );
}
