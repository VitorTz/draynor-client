import type { PageType } from "../types";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import './AuthPage.css'


interface SignupPageProps {
  navigate: (page: PageType, data?: any) => void;
}


const SignupPage = ({ navigate }: SignupPageProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await signup(username, email, password);
    if (success) {
      navigate('login');
    } else {
      setError('Erro ao criar conta');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Cadastre-se</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome de usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
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
          <button type="submit">Cadastrar</button>
        </form>
        <p>
          Já tem uma conta?{' '}
          <a onClick={() => navigate('login')}>Entre</a>
        </p>
      </div>
    </div>
  );
};


export default SignupPage;