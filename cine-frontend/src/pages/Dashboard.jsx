import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
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

  const handleGetVentas = async () => {
    const saleId = prompt("Introduce el ID de la venta que quieres consultar:", "1");
    if (!saleId) return;

    const token = localStorage.getItem('accessToken');
    try {
      // El Request Interceptor de Axios inyectará el header de Autorización automáticamente
      const response = await api.get(`/ventas/${saleId}`);
      console.log(`Mi Venta (ID ${saleId}):`, response.data);
      alert(`¡Éxito! Has recuperado la venta ${saleId}. Total: ${response.data.importeTotal}€. Método: ${response.data.metodoPago}`);
    } catch (error) {
      console.error('Error obteniendo ventas:', error);
      alert('Error al obtener ventas. Revisa la consola. Puede ser un 403 (No autorizado).');
    }
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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans text-white">
      {/* Tarjeta Principal */}
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        
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

        {/* Cuerpo (Botonera) */}
        <div className="p-8 space-y-4">
          <p className="text-gray-300 mb-6">Selecciona una acción para interactuar con la API segura:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Botón Ver Ventas */}
            <button 
              onClick={handleGetVentas}
              className="flex flex-col items-center justify-center p-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors duration-200 border border-gray-600 shadow-sm"
            >
              <span className="font-bold text-white">Ver Mis Entradas</span>
              <span className="text-xs text-gray-400 mt-1">Llama a /api/v1/ventas (GET)</span>
            </button>

            {/* Botón Renovar Token */}
            <button 
              onClick={handleRefreshToken}
              className="flex flex-col items-center justify-center p-4 bg-orange-600/20 hover:bg-orange-600/40 rounded-xl transition-colors duration-200 border border-orange-500/30 shadow-sm"
            >
              <span className="font-bold text-orange-400">Forzar Renovación</span>
              <span className="text-xs text-orange-400/70 mt-1">Llama a /auth/refresh</span>
            </button>

            {/* Botón Admin (Condicional) */}
            {isAdmin && (
              <button className="sm:col-span-2 flex flex-col items-center justify-center p-4 bg-yellow-600/20 hover:bg-yellow-600/40 rounded-xl transition-colors duration-200 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.15)]">
                <span className="font-bold text-yellow-500 text-lg">Panel de Administración</span>
                <span className="text-xs text-yellow-500/70 mt-1">Visible sólo para ROLE_ADMIN</span>
              </button>
            )}

          </div>
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
