import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const ComprarEntrada = () => {
  const [peliculas, setPeliculas] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [salas, setSalas] = useState([]);
  
  const [selectedPeliculaId, setSelectedPeliculaId] = useState('');
  const [selectedFuncionId, setSelectedFuncionId] = useState('');
  const [selectedAsiento, setSelectedAsiento] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Generamos un array de asientos del 1 al 20 para el desplegable
  const asientosDisponibles = Array.from({ length: 20 }, (_, i) => i + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pelRes, funcRes, salRes] = await Promise.all([
          api.get('/api/v1/peliculas'),
          api.get('/api/v1/funciones'),
          api.get('/api/v1/salas')
        ]);
        setPeliculas(Array.isArray(pelRes.data) ? pelRes.data : []);
        setFunciones(Array.isArray(funcRes.data) ? funcRes.data : []);
        setSalas(Array.isArray(salRes.data) ? salRes.data : []);
      } catch (err) {
        console.error("Error cargando datos para compra", err);
      }
    };
    fetchData();
  }, []);

  const handlePeliculaChange = (e) => {
    setSelectedPeliculaId(e.target.value);
    setSelectedFuncionId(''); // Resetear función al cambiar de película
  };

  const handleComprar = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/v1/ventas', {
        metodoPago: 'TARJETA',
        entradas: [
          {
            fila: 1, // Por simplicidad asignamos fila 1 siempre
            asiento: Number(selectedAsiento),
            funcionId: Number(selectedFuncionId)
          }
        ]
      });
      setMessage(`Compra realizada con éxito. ID Venta: ${response.data.id}`);
      setError('');
    } catch (err) {
      setError('Error al procesar la compra.');
      setMessage('');
    }
  };

  const funcionesFiltradas = funciones.filter(f => f.peliculaId === Number(selectedPeliculaId));

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h3 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">Comprar Entrada</h3>
      {message && <p className="text-emerald-400 bg-emerald-400/10 p-3 rounded-xl border border-emerald-500/20">{message}</p>}
      {error && <p className="text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-500/20">{error}</p>}
      <form onSubmit={handleComprar} className="space-y-4">
        
        <div>
          <label className="block text-sm text-slate-400 mb-1">Película</label>
          <select 
            value={selectedPeliculaId} 
            onChange={handlePeliculaChange} 
            required 
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 appearance-none"
          >
            <option value="" disabled>Selecciona una película</option>
            {peliculas.map(p => (
              <option key={p.id} value={p.id}>{p.titulo}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Función y Horario</label>
          <select 
            value={selectedFuncionId} 
            onChange={(e) => setSelectedFuncionId(e.target.value)} 
            required 
            disabled={!selectedPeliculaId || funcionesFiltradas.length === 0}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="" disabled>
              {!selectedPeliculaId ? 'Selecciona primero una película' : (funcionesFiltradas.length === 0 ? 'No hay funciones disponibles' : 'Selecciona una función')}
            </option>
            {funcionesFiltradas.map(f => {
              const sala = salas.find(s => s.id === f.salaId);
              const fechaFormateada = new Date(f.fechaHora).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
              return (
                <option key={f.id} value={f.id}>
                  {fechaFormateada} - {sala?.nombre || `Sala ${f.salaId}`} - {f.precio}€
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Asiento Preferido</label>
          <select 
            value={selectedAsiento} 
            onChange={(e) => setSelectedAsiento(e.target.value)} 
            required 
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 appearance-none"
          >
            <option value="" disabled>Selecciona tu asiento</option>
            {asientosDisponibles.map(num => (
              <option key={num} value={num}>Asiento {num}</option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          disabled={!selectedFuncionId || !selectedAsiento}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition shadow-lg shadow-blue-500/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Comprar Entrada
        </button>
      </form>
    </div>
  );
};

export default ComprarEntrada;
