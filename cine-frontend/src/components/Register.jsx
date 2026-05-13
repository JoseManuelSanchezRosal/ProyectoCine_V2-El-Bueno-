import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/v1/auth/register', { email, password });
      setMessage('Registro exitoso. Ahora puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Error al registrar usuario. Puede que el email ya exista.');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">Registro de Usuario</h2>
      {message && <p className="text-emerald-400 bg-emerald-400/10 p-3 rounded-xl border border-emerald-500/20">{message}</p>}
      {error && <p className="text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-500/20">{error}</p>}
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-xl transition shadow-lg shadow-blue-500/20 mt-4">Registrar</button>
      </form>
    </div>
  );
};

export default Register;
