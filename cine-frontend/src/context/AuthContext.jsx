import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Intentamos cargar el usuario inicial desde el token
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Ajusta las propiedades de roles y email según cómo vengan en tu JWT
        const roles = decoded.roles || [];
        const role = roles.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : 'ROLE_USER';
        
        setUser({
          email: decoded.sub,
          role: role
        });
      } catch (err) {
        console.error("Token inicial inválido", err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setLoading(false);
  }, []);

  const login = (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    const decoded = jwtDecode(accessToken);
    const roles = decoded.roles || [];
    const role = roles.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : 'ROLE_USER';

    setUser({
      email: decoded.sub,
      role: role
    });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    window.location.href = '/login';
  };

  if (loading) return <div>Cargando sesión...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
