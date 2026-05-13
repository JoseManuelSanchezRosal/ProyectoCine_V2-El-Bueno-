import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const CrearFuncion = () => {
  const [peliculas, setPeliculas] = useState([]);
  const [salas, setSalas] = useState([]);
  
  const [peliculaId, setPeliculaId] = useState('');
  const [salaId, setSalaId] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [precio, setPrecio] = useState('8.50');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const [pelRes, salRes] = await Promise.all([
          api.get('/api/v1/peliculas'),
          api.get('/api/v1/salas')
        ]);
        setPeliculas(Array.isArray(pelRes.data) ? pelRes.data : []);
        setSalas(Array.isArray(salRes.data) ? salRes.data : []);
      } catch (err) {
        console.error("Error al cargar películas o salas", err);
      }
    };
    fetchCatalogos();
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/v1/funciones', {
        peliculaId: Number(peliculaId),
        salaId: Number(salaId),
        fechaHora: fechaHora, // formato "YYYY-MM-DDTHH:mm" de input type="datetime-local"
        precio: Number(precio)
      });
      setMessage('Función creada y programada con éxito.');
      setError('');
      // Resetear campos
      setPeliculaId('');
      setSalaId('');
      setFechaHora('');
      setPrecio('8.50');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('Error 403: No tienes permisos de ADMIN para realizar esta acción.');
      } else {
        setError('Error al crear la función. Revisa los datos ingresados.');
      }
      setMessage('');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h3 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">Programar Función (Admin)</h3>
      {message && <p className="text-emerald-400 bg-emerald-400/10 p-3 rounded-xl border border-emerald-500/20">{message}</p>}
      {error && <p className="text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-500/20">{error}</p>}
      <form onSubmit={handleCrear} className="space-y-4">
        
        <div>
          <label className="block text-sm text-slate-400 mb-1">Película</label>
          <select 
            value={peliculaId} 
            onChange={(e) => setPeliculaId(e.target.value)} 
            required 
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500 appearance-none"
          >
            <option value="" disabled>Selecciona la película</option>
            {peliculas.map(p => (
              <option key={p.id} value={p.id}>{p.titulo}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Sala</label>
          <select 
            value={salaId} 
            onChange={(e) => setSalaId(e.target.value)} 
            required 
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500 appearance-none"
          >
            <option value="" disabled>Selecciona la sala</option>
            {salas.map(s => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Fecha y Hora</label>
          <input 
            type="datetime-local" 
            value={fechaHora} 
            onChange={(e) => setFechaHora(e.target.value)} 
            required 
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500 [color-scheme:dark]" 
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Precio de la Entrada (€)</label>
          <input 
            type="number" 
            step="0.01"
            value={precio} 
            onChange={(e) => setPrecio(e.target.value)} 
            required 
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500" 
          />
        </div>

        <button type="submit" disabled={!peliculaId || !salaId || !fechaHora} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 rounded-xl transition shadow-lg shadow-purple-500/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
          Crear Función
        </button>
      </form>
    </div>
  );
};

export default CrearFuncion;
