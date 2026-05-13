import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const CrearPelicula = () => {
  const [titulo, setTitulo] = useState('');
  const [duracion, setDuracion] = useState('');
  const [edadMinima, setEdadMinima] = useState('0');
  const [directorId, setDirectorId] = useState('');
  const [actorId, setActorId] = useState('');
  
  const [directores, setDirectores] = useState([]);
  const [actores, setActores] = useState([]);
  const [peliculas, setPeliculas] = useState([]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const edadesPermitidas = [0, 7, 12, 16, 18];

  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const [dirRes, actRes, pelRes] = await Promise.all([
          api.get('/api/v1/directores'),
          api.get('/api/v1/actores'),
          api.get('/api/v1/peliculas')
        ]);
        setDirectores(Array.isArray(dirRes.data) ? dirRes.data : []);
        setActores(Array.isArray(actRes.data) ? actRes.data : []);
        setPeliculas(Array.isArray(pelRes.data) ? pelRes.data : []);
      } catch (err) {
        console.error("Error al cargar directores o actores", err);
      }
    };
    fetchCatalogos();
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/v1/peliculas', {
        titulo,
        duracion: Number(duracion),
        edadMinima: Number(edadMinima),
        directorId: Number(directorId),
        actorIds: [Number(actorId)]
      });
      setMessage('Película creada con éxito.');
      setError('');
      // Resetear campos
      setTitulo('');
      setDuracion('');
      setEdadMinima('0');
      setDirectorId('');
      setActorId('');
      
      // Recargar lista de películas
      const pelRes = await api.get('/api/v1/peliculas');
      setPeliculas(Array.isArray(pelRes.data) ? pelRes.data : []);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('Error 403: No tienes permisos de ADMIN para realizar esta acción.');
      } else {
        setError('Error de validación al crear la película (400 Bad Request). Revisa los campos.');
      }
      setMessage('');
    }
  };

  const handleBorrar = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres borrar esta película? Se borrarán también sus funciones asociadas.")) return;
    
    try {
      await api.delete(`/api/v1/peliculas/${id}`);
      setPeliculas(peliculas.filter(p => p.id !== id));
      setMessage('Película borrada con éxito.');
      setError('');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('Error 403: No tienes permisos de ADMIN para borrar películas.');
      } else {
        setError('Error al borrar la película. Puede que tenga ventas asociadas.');
      }
      setMessage('');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h3 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">Crear Película (Admin)</h3>
      {message && <p className="text-emerald-400 bg-emerald-400/10 p-3 rounded-xl border border-emerald-500/20">{message}</p>}
      {error && <p className="text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-500/20">{error}</p>}
      <form onSubmit={handleCrear} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Título</label>
          <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Duración (min)</label>
          <input type="number" value={duracion} onChange={(e) => setDuracion(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500" />
        </div>
        
        <div>
          <label className="block text-sm text-slate-400 mb-1">Edad Mínima</label>
          <select 
            value={edadMinima} 
            onChange={(e) => setEdadMinima(e.target.value)} 
            required 
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500 appearance-none"
          >
            {edadesPermitidas.map(edad => (
              <option key={edad} value={edad}>{edad === 0 ? 'Todos los públicos (TP)' : `+${edad} años`}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Director</label>
          <select 
            value={directorId} 
            onChange={(e) => setDirectorId(e.target.value)} 
            required 
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500 appearance-none"
          >
            <option value="" disabled>Selecciona un director</option>
            {directores.map(d => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Actor Principal</label>
          <select 
            value={actorId} 
            onChange={(e) => setActorId(e.target.value)} 
            required 
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500 appearance-none"
          >
            <option value="" disabled>Selecciona un actor</option>
            {actores.map(a => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={!directorId || !actorId} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 rounded-xl transition shadow-lg shadow-purple-500/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed">Guardar Película</button>
      </form>

      <div className="pt-8 border-t border-slate-700/50 mt-8">
        <h3 className="text-xl font-bold text-white mb-4">Películas Existentes</h3>
        {peliculas.length === 0 ? (
          <p className="text-slate-400 text-sm">No hay películas registradas.</p>
        ) : (
          <ul className="space-y-3">
            {peliculas.map(peli => (
              <li key={peli.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex justify-between items-center hover:border-slate-500 transition">
                <div>
                  <h4 className="font-bold text-white text-lg">{peli.titulo}</h4>
                  <p className="text-xs text-slate-400 mt-1">{peli.duracion} min • +{peli.edadMinima} años</p>
                </div>
                <button 
                  onClick={() => handleBorrar(peli.id)}
                  className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 rounded-lg text-sm font-medium transition flex items-center gap-2 border border-red-500/30"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Borrar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CrearPelicula;
