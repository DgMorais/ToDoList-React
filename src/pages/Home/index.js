import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

import { auth } from '../../services/firebaseConnection';
import { signInWithEmailAndPassword } from "firebase/auth";

import '../../styles/home.css'

function Home() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin(e) {
    e.preventDefault();

    if (email === '' || password === '') {
      toast.warning('Preencha todos os campos!');
    } else {
      await signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigate('/user-area', {replace: true})
        toast.success('Bem-vindo!');
      })
      .catch((error) => {
        if (error.code === 'auth/invalid-email') {
          toast.error('Email inválido!');
        } else if (error.code === 'auth/user-not-found') {
          toast.error('Usuário não encontrado!');
        } else if (error.code === 'auth/wrong-password') {
          toast.error('Senha incorreta!');
        } else {
          toast.error('Erro ao logar!');
        }
      });
    }
  }

  return (
    <div className="home-container">
      <h1>To do List</h1>
      <span>Gerencie sua lista de tarefas de forma fácil</span>

      <form className="form-login" onSubmit={handleLogin}>
        <label htmlFor="email">Email</label>
        <input type="text" placeholder="Digite seu email..." value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password">Senha</label>
        <input autoComplete='false' type="password" placeholder="Digite sua senha..." value={password} onChange={(e) => setPassword(e.target.value)} />

        <button type="submit">Entrar</button>
      </form>

      <span className='link-register'>
        Não tem uma conta?  
        <Link to="/register"> Cadastre-se</Link>
      </span>
    </div>
  );
}

export default Home;