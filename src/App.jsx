import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Offers from './pages/Offers';
import NewOffer from './pages/NewOffer';
import OfferDetails from './pages/OfferDetails';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/ofertas" element={<Offers />} />
      <Route path="/ofertas/nova" element={<NewOffer />} />
      <Route path="/ofertas/:id" element={<OfferDetails />} />
    </Routes>
  );
}
