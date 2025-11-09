import { useState, useEffect } from 'react';
import type { User } from './types';
import './App.css';
import { draynorApi } from './api/draynor';
import { AuthContext } from './context/AuthContext';
import Router from './components/Router';
import LoadingScreen from './components/LoadingScreen';


const App = () => {

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    await draynorApi
      .auth
      .me()
      .then(user => setUser(user))
      .catch(err => console.log(err))
    setLoading(false)
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    return await draynorApi
      .auth
      .login(email, password)
      .then(user => {setUser(user); return true})
      .catch(err => {console.error('Login failed:', err); return false})
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    return await draynorApi
      .auth
      .signup(username, email, password)
      .then(() => {return true})
      .catch(err => {console.error('Signup failed:', err); return false;})
  };

  const logout = async () => {
    await draynorApi
      .auth
      .logout()
      .then(() => setUser(null))
      .catch(err => console.error('Logout failed:', err))
  };  

  if (loading) { return <LoadingScreen />; }

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout }}>
      <Router />
    </AuthContext.Provider>
  );
};


export default App;