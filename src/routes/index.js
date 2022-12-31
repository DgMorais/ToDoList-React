import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // importa o toastify
import 'react-toastify/dist/ReactToastify.css'; // importa o css do toastify

import Home from '../pages/Home';
import Register from '../pages/Register';
import UserArea from '../pages/UserArea';

import Private from './Private';

function RoutesApp() {
  return (
    <BrowserRouter >
    <ToastContainer autoClos={2000}/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user-area" element={<Private> <UserArea /> </Private>} />
      </Routes>
    </BrowserRouter>
  );
}

export default RoutesApp;