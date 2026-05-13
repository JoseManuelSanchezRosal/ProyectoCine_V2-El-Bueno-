import { useState, useEffect } from 'react';
import api from '../services/api';



const TicketPurchaseFlow = () => {
  const [movies, setMovies] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, sessionsRes, salasRes] = await Promise.all([
          api.get('/peliculas'),
          api.get('/funciones'),
          api.get('/salas')
        ]);
        // Validamos que sea array
        setMovies(Array.isArray(moviesRes.data) ? moviesRes.data : []);
        setSessions(Array.isArray(sessionsRes.data) ? sessionsRes.data : []);
        setSalas(Array.isArray(salasRes.data) ? salasRes.data : []);
      } catch (err) {
        console.error('Error cargando la cartelera y funciones:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
    setSelectedSession(null); 
    setPurchaseSuccess(false);
  };

  const handlePurchase = async () => {
    if (!selectedSession) return;
    setIsPurchasing(true);
    
    try {
      await api.post('/ventas', {
        metodoPago: 'TARJETA',
        entradas: [
          {
            fila: 5,
            asiento: 12,
            funcionId: selectedSession.id
          }
        ]
      });
      
      setPurchaseSuccess(true);
    } catch (error) {
      console.error('Error durante la compra:', error);
      alert('Error procesando la compra. Revisa la consola para más detalles.');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (purchaseSuccess) {
    return (
      <div className="bg-slate-800 p-8 rounded-2xl border border-emerald-500/30 text-center shadow-2xl">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">¡Compra Exitosa!</h3>
        <p className="text-slate-300 mb-8">Tu entrada ha sido confirmada correctamente.</p>
        <button 
          onClick={() => {
            setSelectedMovie(null);
            setSelectedSession(null);
            setPurchaseSuccess(false);
          }}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-300 font-medium shadow-lg shadow-blue-500/25"
        >
          Volver a la cartelera
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Paso A: Grid de Películas */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="bg-blue-500 w-1.5 h-6 rounded-full inline-block"></span>
          Cartelera
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-slate-400 col-span-full animate-pulse">Cargando cartelera...</p>
          ) : movies.length === 0 ? (
            <p className="text-slate-400 col-span-full">No hay películas en cartelera.</p>
          ) : (
          movies.map(movie => (
            <div 
              key={movie.id} 
              onClick={() => handleMovieSelect(movie)}
              className={`group cursor-pointer rounded-2xl overflow-hidden border transition-all duration-300 ${
                selectedMovie?.id === movie.id 
                  ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] ring-2 ring-blue-500/50' 
                  : 'border-slate-700 bg-slate-800 hover:border-slate-500 hover:shadow-xl'
              }`}
            >
              <div className="aspect-[2/3] relative overflow-hidden bg-slate-900">
                <img 
                  src={movie.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400&h=600'} 
                  alt={movie.titulo} 
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    selectedMovie?.id === movie.id ? 'opacity-100 scale-105' : 'opacity-70 group-hover:opacity-100 group-hover:scale-105'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 w-full">
                  <h3 className="text-xl font-bold text-white mb-1.5 drop-shadow-md">{movie.titulo}</h3>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                    <span className="bg-slate-800/80 backdrop-blur px-2 py-1 rounded border border-slate-700/50">{movie.duracion} min</span>
                    <span className="bg-slate-800/80 backdrop-blur px-2 py-1 rounded border border-slate-700/50">+{movie.edadMinima} años</span>
                  </div>
                </div>
              </div>
            </div>
          )))}
        </div>
      </div>

      {/* Paso B y C: Selector de Sesiones y Compra */}
      {selectedMovie && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl transition-all duration-500 ease-out opacity-100">
          <h3 className="text-xl font-bold text-white mb-5">
            Sesiones para: <span className="text-blue-400">{selectedMovie.titulo}</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {sessions.filter(s => s.peliculaId === selectedMovie.id).length === 0 ? (
              <p className="text-slate-400 col-span-full">No hay sesiones disponibles para esta película.</p>
            ) : (
            sessions.filter(s => s.peliculaId === selectedMovie.id).map(session => {
              const sala = salas.find(sa => sa.id === session.salaId);
              return (
              <div 
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                  selectedSession?.id === session.id
                    ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/50 shadow-md shadow-blue-500/10'
                    : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-lg text-white">
                    {session.fechaHora ? new Date(session.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    <span className="text-xs text-slate-400 block font-normal">{session.fechaHora ? new Date(session.fechaHora).toLocaleDateString() : 'N/A'}</span>
                  </span>
                  <span className="text-emerald-400 font-semibold">{session.precio?.toFixed(2) || '0.00'}€</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  {sala?.nombre || `Sala ID: ${session.salaId}`}
                </div>
              </div>
            )}))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-700 gap-4">
            <div>
              {selectedSession ? (
                <p className="text-slate-300">
                  Total a pagar: <span className="text-2xl font-bold text-emerald-400 ml-2">{(selectedSession.precio || 0).toFixed(2)}€</span>
                </p>
              ) : (
                <p className="text-slate-500 italic">Selecciona una sesión para continuar</p>
              )}
            </div>
            
            <button
              disabled={!selectedSession || isPurchasing}
              onClick={handlePurchase}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg ${
                !selectedSession || isPurchasing
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5'
              }`}
            >
              {isPurchasing ? 'Procesando...' : 'Confirmar Compra'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketPurchaseFlow;
