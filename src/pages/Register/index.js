import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

import { auth } from '../../services/firebaseConnection';
import { createUserWithEmailAndPassword } from "firebase/auth";

import '../../styles/register.css'

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleRegister(e) {
    e.preventDefault();

    if (email === '' || password === '') {
      toast.warning('Preencha todos os campos!');
    } else {
      await createUserWithEmailAndPassword(auth, email, password)
      .then((value) => {
        console.log(value)
        toast.success('Cadastro realizado com sucesso!');
        navigate('/user-area', {replace: true})
      })
      .catch((error) => {
        if (error.code === 'auth/invalid-email') {
          toast.error('Email inválido!');
        } else if (error.code === 'auth/email-already-in-use') {
          toast.error('Email já cadastrado!');
        } else {
          toast.error('Erro ao cadastrar!');
        }
      });
    }
  }

  return (
    <div className="home-container">
      <h1>Cadastre-se</h1>
      <form className="form-register" onSubmit={handleRegister}>
        <label htmlFor="email">Email</label>
        <input type="text" placeholder="Digite seu email..." value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password">Senha</label>
        <input autoComplete='false' type="password" placeholder="Digite sua senha..." value={password} onChange={(e) => setPassword(e.target.value)} />

        <button type="submit">Cadastrar</button>
        
        <span className='link-register'>
          Já tem uma conta?
          <Link to="/"> Faça o login</Link>
        </span>
      </form>
    </div>
  );
}

export default Register;