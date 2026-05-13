import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const VerMiVenta = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [peliculas, setPeliculas] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [salas, setSalas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar ventas del usuario actual y los catálogos en paralelo
        const [ventasRes, pelRes, funcRes, salRes] = await Promise.all([
          api.get('/api/v1/ventas/mis-ventas'),
          api.get('/api/v1/peliculas'),
          api.get('/api/v1/funciones'),
          api.get('/api/v1/salas')
        ]);
        
        setVentas(Array.isArray(ventasRes.data) ? ventasRes.data : []);
        setPeliculas(Array.isArray(pelRes.data) ? pelRes.data : []);
        setFunciones(Array.isArray(funcRes.data) ? funcRes.data : []);
        setSalas(Array.isArray(salRes.data) ? salRes.data : []);
      } catch (err) {
        console.error("Error cargando el historial de ventas", err);
        setError('Error al cargar tu historial de entradas. Asegúrate de reiniciar el backend.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBorrarVenta = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres cancelar y borrar esta entrada? Esta acción no se puede deshacer.")) return;
    
    try {
      await api.delete(`/api/v1/ventas/${id}`);
      setVentas(ventas.filter(v => v.id !== id));
      setError('');
    } catch (err) {
      console.error(err);
      setError('Error al borrar la venta. Inténtalo de nuevo más tarde.');
    }
  };

  if (loading) {
    return <div className="text-center text-slate-400 mt-10">Cargando tus entradas...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-700 pb-2">
        <h3 className="text-2xl font-bold text-white">Mis Entradas Compradas</h3>
        <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium">
          {ventas.length} Ticket(s)
        </span>
      </div>
      
      {error && <p className="text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-500/20">{error}</p>}
      
      {ventas.length === 0 && !error ? (
        <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-700/50">
          <p className="text-slate-400">Aún no has comprado ninguna entrada.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {ventas.map(venta => {
            let detallesPelicula = 'N/A';
            let detallesSala = 'N/A';
            let fechaHora = 'N/A';
            let asientoInfo = 'N/A';

            if (venta.entradas && venta.entradas.length > 0) {
              const entrada = venta.entradas[0];
              asientoInfo = `Fila ${entrada.fila}, Asiento ${entrada.asiento}`;
              
              const funcion = funciones.find(f => f.id === entrada.funcionId);
              if (funcion) {
                fechaHora = new Date(funcion.fechaHora).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' });
                const peli = peliculas.find(p => p.id === funcion.peliculaId);
                detallesPelicula = peli ? peli.titulo : `Pelicula ID: ${funcion.peliculaId}`;
                const sala = salas.find(s => s.id === funcion.salaId);
                detallesSala = sala ? sala.nombre : `Sala ID: ${funcion.salaId}`;
              }
            }

            return (
              <div key={venta.id} className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-2xl flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center hover:border-slate-500 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-bold text-emerald-400">Ticket #{venta.id}</h4>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs font-mono rounded border border-slate-700">
                      {venta.metodoPago}
                    </span>
                  </div>
                  <p className="font-bold text-white text-xl">{detallesPelicula}</p>
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {fechaHora}
                  </p>
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    {detallesSala} - {asientoInfo}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-2 min-w-[120px]">
                  <span className="text-2xl font-bold text-white">{venta.importeTotal != null ? venta.importeTotal.toFixed(2) : '0.00'}€</span>
                  <span className="text-xs text-slate-500">{new Date(venta.fecha).toLocaleDateString()}</span>
                  <span className="font-mono text-xs text-emerald-300 bg-emerald-400/10 px-2 py-1 rounded">
                    {venta.estado}
                  </span>
                  
                  <button 
                    onClick={() => handleBorrarVenta(venta.id)}
                    className="mt-2 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded border border-red-500/30 text-xs font-medium transition w-full text-center"
                  >
                    Borrar Ticket
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VerMiVenta;
