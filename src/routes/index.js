import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // importa o toastify
import 'react-toastify/dist/ReactToastify.css'; // importa o css do toastify

import Home from '../pages/Home';
import Register from '../pages/Register';
import UserArea from '../pages/UserArea';

import Private from './Private';
import Logged from './Logged';

function RoutesApp() {
  return (
    <BrowserRouter >
    <ToastContainer autoClos={2000}/>
      <Routes>
        <Route path="/" element={<Logged>  <Home /> </Logged>} />
        <Route path="/register" element={<Logged> <Register /> </Logged>} />
        <Route path="/user-area" element={<Private> <UserArea /> </Private>} />
      </Routes>
    </BrowserRouter>
  );
}

export default RoutesApp;