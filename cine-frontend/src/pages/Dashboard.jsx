import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import AdminSalesList from '../components/AdminSalesList';
import TicketPurchaseFlow from '../components/TicketPurchaseFlow';
import UserSalesList from '../components/UserSalesList';

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [activeView, setActiveView] = useState('HOME');
  const navigate = useNavigate();

  // Función para cargar/actualizar la info del token
  const loadUserInfo = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/');
      return false;
    }
    try {
      const decoded = jwtDecode(token);
      const expDate = new Date(decoded.exp * 1000);
      setUserInfo({
        id: decoded.id || decoded.usuarioId || decoded.userId || decoded.sub, // Fallback al email si no hay ID, aunque el endpoint necesita ID
        email: decoded.sub,
        roles: decoded.roles || [],
        expiration: expDate.toLocaleTimeString(),
      });
      return true;
    } catch (err) {
      console.error('Invalid token', err);
      handleLogout();
      return false;
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  const handleRefreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      const newAccessToken = response.data.accessToken;
      // Actualizamos localStorage
      localStorage.setItem('accessToken', newAccessToken);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      // Recargamos visualmente el token para actualizar la fecha
      loadUserInfo();
      alert('¡Token renovado con éxito! Observa que tu hora de expiración se ha ampliado.');
    } catch (error) {
      console.error('Error renovando token:', error);
      alert('Tu sesión caducó completamente o el refresh token es inválido.');
      handleLogout();
    }
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <p className="animate-pulse">Cargando perfil...</p>
      </div>
    );
  }

  const isAdmin = userInfo.roles.includes('ROLE_ADMIN');

  return (
    <div className="min-h-screen bg-[#0f1115] flex items-center justify-center p-4 font-sans text-white">
      {/* Tarjeta Principal */}
      <div className={`w-full transition-all duration-500 ease-in-out ${activeView === 'HOME' ? 'max-w-2xl' : 'max-w-5xl'} bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700`}>
        
        {/* Encabezado */}
        <div className="bg-gray-800 px-8 py-6 border-b border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Hola, <span className="text-blue-400">{userInfo.email}</span>
            </h1>
            <p className="mt-1 text-sm text-gray-300">
              Expira: <span className="font-mono bg-gray-700 px-2 py-0.5 rounded">{userInfo.expiration}</span>
            </p>
          </div>
          <span className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1.5 rounded-full font-semibold tracking-wide uppercase border border-blue-500/30">
            {userInfo.roles.join(', ')}
          </span>
        </div>

        {/* Cuerpo */}
        <div className="p-8 space-y-4">
          {activeView === 'HOME' && (
            <>
              <p className="text-gray-300 mb-6">Selecciona una acción para interactuar con la plataforma:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {isAdmin ? (
                  <button 
                    onClick={() => setActiveView('ADMIN_SALES')}
                    className="flex flex-col items-center justify-center p-5 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors duration-200 border border-gray-600 shadow-sm"
                  >
                    <span className="font-bold text-white text-lg">Historial de Entradas</span>
                    <span className="text-xs text-gray-400 mt-1">Listado global de ventas (Admin)</span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => setActiveView('TICKET_PURCHASE')}
                      className="flex flex-col items-center justify-center p-5 bg-blue-600/20 hover:bg-blue-600/40 rounded-xl transition-colors duration-200 border border-blue-500/30 shadow-sm group"
                    >
                      <span className="font-bold text-blue-400 text-lg group-hover:scale-105 transition-transform">Comprar Entradas</span>
                      <span className="text-xs text-blue-400/70 mt-1">Explora la cartelera</span>
                    </button>
                    <button 
                      onClick={() => setActiveView('USER_SALES')}
                      className="flex flex-col items-center justify-center p-5 bg-emerald-600/20 hover:bg-emerald-600/40 rounded-xl transition-colors duration-200 border border-emerald-500/30 shadow-sm group"
                    >
                      <span className="font-bold text-emerald-400 text-lg group-hover:scale-105 transition-transform">Mis Entradas</span>
                      <span className="text-xs text-emerald-400/70 mt-1">Historial de compras</span>
                    </button>
                  </>
                )}

                {/* Botón Renovar Token */}
                <button 
                  onClick={handleRefreshToken}
                  className="flex flex-col items-center justify-center p-5 bg-orange-600/20 hover:bg-orange-600/40 rounded-xl transition-colors duration-200 border border-orange-500/30 shadow-sm"
                >
                  <span className="font-bold text-orange-400">Forzar Renovación</span>
                  <span className="text-xs text-orange-400/70 mt-1">Renovar sesión (JWT)</span>
                </button>

              </div>
            </>
          )}

          {activeView === 'ADMIN_SALES' && isAdmin && (
            <div className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
              <button 
                onClick={() => setActiveView('HOME')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-4"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al Panel Principal
              </button>
              <AdminSalesList />
            </div>
          )}

          {activeView === 'TICKET_PURCHASE' && !isAdmin && (
            <div className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
              <button 
                onClick={() => setActiveView('HOME')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-4"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al Panel Principal
              </button>
              <TicketPurchaseFlow />
            </div>
          )}

          {activeView === 'USER_SALES' && !isAdmin && (
            <div className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
              <button 
                onClick={() => setActiveView('HOME')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-4"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al Panel Principal
              </button>
              <UserSalesList userId={userInfo.id} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800/50 px-8 py-5 border-t border-gray-700 flex justify-end">
          <button 
            onClick={handleLogout}
            className="px-5 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white font-medium rounded-lg border border-red-600/50 transition-all duration-200"
          >
            Cerrar Sesión
          </button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
