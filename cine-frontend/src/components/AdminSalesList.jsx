import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const AdminSalesList = () => {
  const [sales, setSales] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [salas, setSalas] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [ventasRes, usuRes, funcRes, pelRes, salRes] = await Promise.all([
          api.get('/api/v1/ventas'),
          api.get('/api/v1/usuarios'),
          api.get('/api/v1/funciones'),
          api.get('/api/v1/peliculas'),
          api.get('/api/v1/salas')
        ]);
        
        setSales(Array.isArray(ventasRes.data) ? ventasRes.data : []);
        setUsuarios(Array.isArray(usuRes.data) ? usuRes.data : []);
        setFunciones(Array.isArray(funcRes.data) ? funcRes.data : []);
        setPeliculas(Array.isArray(pelRes.data) ? pelRes.data : []);
        setSalas(Array.isArray(salRes.data) ? salRes.data : []);
      } catch (err) {
        setError('Error al cargar las ventas o datos relacionados. Asegúrate de tener permisos de administrador.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleBorrarVenta = async (id) => {
    if (!window.confirm(`¿Estás seguro de que quieres borrar la venta #${id}? Esta acción es irreversible.`)) return;
    
    try {
      await api.delete(`/api/v1/ventas/${id}`);
      setSales(sales.filter(s => s.id !== id));
      setError(null);
    } catch (err) {
      console.error(err);
      setError(`Error al borrar la venta #${id}.`);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-slate-800 rounded-xl border border-slate-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200">
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
    <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden animate-[fadeIn_0.5s_ease-out]">
      <div className="p-6 border-b border-slate-700 bg-slate-800/80">
        <h2 className="text-2xl font-bold text-white">Historial Global de Entradas</h2>
        <p className="text-sm text-slate-400 mt-1">Listado de todas las ventas registradas en el sistema.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/60">
            <tr>
              <th className="px-6 py-4 font-semibold">ID Venta</th>
              <th className="px-6 py-4 font-semibold">Usuario / Email</th>
              <th className="px-6 py-4 font-semibold">Película</th>
              <th className="px-6 py-4 font-semibold">Sala / Fecha</th>
              <th className="px-6 py-4 font-semibold text-right">Total</th>
              <th className="px-6 py-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {sales.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No hay ventas registradas todavía.</p>
                </td>
              </tr>
            ) : (
              sales.map((sale, index) => {
                const usuario = usuarios.find(u => u.id === sale.usuarioId);
                const entrada = sale.entradas?.[0];
                const funcion = funciones.find(f => f.id === entrada?.funcionId);
                const pelicula = peliculas.find(p => p.id === funcion?.peliculaId);
                const sala = salas.find(s => s.id === funcion?.salaId);

                return (
                  <tr key={sale.id || index} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-400">#{sale.id || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{usuario?.email || `ID: ${sale.usuarioId}`}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-blue-300">
                      {pelicula?.titulo || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300">{sala?.nombre || 'N/A'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {sale.fecha ? new Date(sale.fecha).toLocaleString() : funcion?.fechaHora ? new Date(funcion.fechaHora).toLocaleString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-400">
                      {sale.importeTotal != null ? `${sale.importeTotal.toFixed(2)}€` : '0.00€'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleBorrarVenta(sale.id)}
                        className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded border border-red-500/30 text-xs font-medium transition"
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSalesList;
