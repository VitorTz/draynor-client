import type { PageType } from "../types";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import './AuthPage.css'


interface LoginPageProps {
  navigate: (page: PageType, data?: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(email, password);
    if (success) {
      navigate('home');
    } else {
      setError('Email ou senha inválidos');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Entrar</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="error-message">{error}</div>}
          <button type="submit">Entrar</button>
        </form>
        <p>
          Não tem uma conta?{' '}
          <a onClick={() => navigate('signup')}>Cadastre-se</a>
        </p>
      </div>
    </div>
  );
};


export default LoginPage;