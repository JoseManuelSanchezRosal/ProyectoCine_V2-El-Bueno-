import { useContext } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Cartelera from './components/Cartelera';
import Login from './components/Login';
import Register from './components/Register';
import ComprarEntrada from './components/ComprarEntrada';
import VerMiVenta from './components/VerMiVenta';
import CrearPelicula from './components/CrearPelicula';
import CrearFuncion from './components/CrearFuncion';
import AdminSalesList from './components/AdminSalesList';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 font-sans flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-5xl bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50">
        <div className="p-8 text-center bg-slate-800 border-b border-slate-700/50">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Cine V4 <span className="text-blue-500">Supervitaminado</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Arquitectura robusta SPA</p>
        </div>
        
        <nav className="bg-slate-900/50 px-6 py-4 border-b border-slate-700/50">
          <ul className="flex flex-wrap items-center justify-center gap-3">
            <li><Link to="/" className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition shadow-sm">Cartelera</Link></li>
            {!user && (
              <>
                <li><Link to="/login" className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 transition shadow-sm">Login</Link></li>
                <li><Link to="/register" className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition shadow-sm">Registro</Link></li>
              </>
            )}
            {user && (
              <>
                <li><Link to="/comprar" className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition shadow-sm">Comprar</Link></li>
                <li><Link to="/mis-ventas" className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition shadow-sm">Mis Ventas</Link></li>
                {user.role === 'ROLE_ADMIN' && (
                  <>
                    <li><Link to="/admin" className="px-4 py-2 rounded-xl text-sm font-medium bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition shadow-sm">Admin: Ventas</Link></li>
                    <li><Link to="/admin/peliculas" className="px-4 py-2 rounded-xl text-sm font-medium bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition shadow-sm">Admin: Películas</Link></li>
                    <li><Link to="/admin/funciones" className="px-4 py-2 rounded-xl text-sm font-medium bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition shadow-sm">Admin: Funciones</Link></li>
                  </>
                )}
                <li className="ml-auto">
                  <button onClick={logout} className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition shadow-sm flex items-center gap-2">
                    <span>Salir</span>
                    <span className="text-xs opacity-70 border-l border-red-500/30 pl-2">({user.role})</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
        
        <main className="p-8 md:p-12">
          {children}
        </main>
      </div>

      <footer className="mt-8 text-center text-slate-500 text-sm pb-4">
        <p>&copy; Todos los derechos reservados</p>
        <p className="mt-1 font-medium text-slate-400">José Manuel Sánchez Rosal</p>
      </footer>
    </div>
  );
};

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Cartelera />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/comprar" element={<ProtectedRoute><ComprarEntrada /></ProtectedRoute>} />
        <Route path="/mis-ventas" element={<ProtectedRoute><VerMiVenta /></ProtectedRoute>} />
        
        <Route path="/admin" element={<ProtectedRoute><AdminSalesList /></ProtectedRoute>} />
        <Route path="/admin/peliculas" element={<ProtectedRoute><CrearPelicula /></ProtectedRoute>} />
        <Route path="/admin/funciones" element={<ProtectedRoute><CrearFuncion /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
