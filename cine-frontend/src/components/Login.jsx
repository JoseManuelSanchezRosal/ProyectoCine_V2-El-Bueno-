import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/v1/auth/login', { email, password });
      login(response.data.accessToken, response.data.refreshToken);
      navigate('/');
    } catch (err) {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">Iniciar Sesión</h2>
      {error && <p className="text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-500/20">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-xl transition shadow-lg shadow-blue-500/20 mt-4">Ingresar</button>
      </form>
    </div>
  );
};

export default Login;
