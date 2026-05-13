import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const Cartelera = () => {
  const [peliculas, setPeliculas] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPeliculas = async () => {
      try {
        const response = await api.get('/api/v1/peliculas');
        setPeliculas(response.data);
      } catch (err) {
        setError('Error al cargar la cartelera');
      }
    };
    fetchPeliculas();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">Cartelera Pública (Sin token)</h2>
      {error && <p className="text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-500/20">{error}</p>}
      <ul className="grid gap-3">
        {peliculas.map((pelicula) => (
          <li key={pelicula.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-500 transition flex items-center justify-between">
            <strong className="text-blue-300 text-lg">{pelicula.titulo}</strong>
            <span className="text-slate-400 text-sm">{pelicula.duracion} min</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Cartelera;
