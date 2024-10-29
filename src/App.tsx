import './App.css'
import Home from './components/Home'
import { Route, Routes } from "react-router-dom";
import SignUpForm from './utils/signUp';
import Login from './utils/login';

function App() {
   const isActiveLogin = location.pathname === "/"
  return (
    <div className='h-full w-full'>
      <div className={`h-full ${isActiveLogin ? "hidden" :'block'}`}>
      {/* <NavBar/> */}
      </div>
    <Routes>
      <Route path="/" element={<SignUpForm />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
    </div>
  )
}

export default App
