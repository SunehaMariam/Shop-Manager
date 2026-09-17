import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';

import Login from './pages/Login.jsx';
import SuperDashboard from './pages/SuperDashboard.jsx';
import Companies from './pages/Companies.jsx';
import CompanyDetail from './pages/CompanyDetail.jsx';
import CompanyDashboard from './pages/CompanyDashboard.jsx';
import Shops from './pages/Shops.jsx';
import ProductionAreas from './pages/ProductionAreas.jsx';
import Products from './pages/Products.jsx';
import Team from './pages/Team.jsx';

// Role ke hisab se home page badal jata hai
const Home = () => {
  const { isSuperAdmin } = useAuth();
  return isSuperAdmin ? <SuperDashboard /> : <CompanyDashboard />;
};

const Private = ({ children, roles }) => (
  <ProtectedRoute roles={roles}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<Private><Home /></Private>} />

      <Route path="/companies" element={<Private roles={['superadmin']}><Companies /></Private>} />
      <Route path="/companies/:id" element={<Private roles={['superadmin']}><CompanyDetail /></Private>} />

      <Route path="/shops" element={<Private roles={['admin', 'staff']}><Shops /></Private>} />
      <Route path="/production-areas" element={<Private roles={['admin', 'staff']}><ProductionAreas /></Private>} />
      <Route path="/products" element={<Private roles={['admin', 'staff']}><Products /></Private>} />
      <Route path="/team" element={<Private roles={['admin']}><Team /></Private>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
