import { useState, useEffect } from 'react';
import api from '../services/api';

const UserSalesList = ({ userId }) => {
  const [sales, setSales] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [salas, setSalas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserSales = async () => {
      try {
        if (!userId) {
          throw new Error('ID de usuario no disponible. Asegúrate de que el token contenga el ID.');
        }
        
        // Peticiones paralelas para el usuario y catálogos
        const [userRes, funcRes, pelRes, salRes] = await Promise.all([
          api.get(`/usuarios/${userId}`),
          api.get('/funciones'),
          api.get('/peliculas'),
          api.get('/salas')
        ]);
        
        const userData = userRes.data;
        if (userData && userData.ventas) {
          setSales(userData.ventas);
        } else {
          setSales([]);
        }

        setFunciones(Array.isArray(funcRes.data) ? funcRes.data : []);
        setPeliculas(Array.isArray(pelRes.data) ? pelRes.data : []);
        setSalas(Array.isArray(salRes.data) ? salRes.data : []);

      } catch (err) {
        setError('Error al cargar tu historial de compras.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSales();
  }, [userId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 mt-6">
        <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-800 rounded-xl border border-slate-700"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mt-6 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200">
        <p className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 animate-[fadeIn_0.5s_ease-out]">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="bg-emerald-500 w-1.5 h-6 rounded-full inline-block"></span>
        Mis Entradas Compradas
      </h2>
      
      {sales.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <p className="text-slate-400">Aún no has comprado ninguna entrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sales.map((sale) => {
            const entrada = sale.entradas?.[0];
            const funcion = funciones.find(f => f.id === entrada?.funcionId);
            const pelicula = peliculas.find(p => p.id === funcion?.peliculaId);
            const sala = salas.find(s => s.id === funcion?.salaId);
            
            return (
              <div key={sale.id} className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden flex flex-col sm:flex-row group hover:border-slate-500 transition-colors">
                <div className="w-full sm:w-1/3 bg-slate-900 relative">
                  <img 
                    src={pelicula?.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=200&h=300'} 
                    alt={pelicula?.titulo || 'Película'} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent sm:bg-gradient-to-r"></div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Ticket #{sale.id}</span>
                      <span className="font-bold text-white">{sale.importeTotal?.toFixed(2)}€</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{pelicula?.titulo || 'Desconocida'}</h3>
                    <div className="text-sm text-slate-400 mb-4 space-y-1">
                      <p className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {sale.fecha ? new Date(sale.fecha).toLocaleString() : funcion?.fechaHora ? new Date(funcion.fechaHora).toLocaleString() : 'Fecha N/A'}
                      </p>
                      <p className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                        {sala?.nombre || `Sala ID: ${funcion?.salaId || 'N/A'}`}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-700/50 flex justify-between items-center text-sm">
                    <span className="text-slate-400">
                      Entradas: {sale.entradas?.length || 0}
                    </span>
                    <span className="text-blue-400 font-medium hover:text-blue-300 cursor-pointer transition-colors">
                      Ver detalle
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserSalesList;
