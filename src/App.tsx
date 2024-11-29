import './App.css'
import Home from './components/Home'
import { Route, Routes, useNavigate } from "react-router-dom";
import SignUpForm from './utils/signUp';
import Login from './utils/login';
import Market from './components/Market';
import Profile from './components/Profile';
import NavBar from './utils/navBar';
import TreeDetail from './components/TreesDetail';
import userStore from './utils/ZustandStore';
import { useEffect } from 'react';
import supabase from './utils/supabase';
import Transactions from './components/transactions';
import Withdraw from './components/withdraw';
import Deposit from './components/deposit';
import AdminDashboard from './components/AdminDashboard';

function App() {
   const isActiveLogin = location.pathname === "/login";
   const isActiveSignUp = location.pathname === "/";


   const navigate = useNavigate()

   const subscribeToChanges = userStore(state => state.subscribeToChanges);
 
   useEffect(() => {
    const unsubscribe = subscribeToChanges;
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [subscribeToChanges]);
   useEffect(() => {
     supabase.auth.onAuthStateChange((_, session) => {
       if (!session) {
         navigate('/login');
       }
     });
   }, [navigate]);
 

  return (
    <div className='h-full w-full'>
      <div className={`h-full w-full flex justify-center ${isActiveLogin || isActiveSignUp ? "hidden" : 'block'}`}>
      <NavBar/>
      </div>
    <Routes>
      <Route path="/" element={<SignUpForm />} />
      <Route path="/transactions" element={< Transactions />} />
      <Route path="/withdraw" element={<Withdraw />} />
      <Route path="/deposit" element={<Deposit />} />
      <Route path="/adminDashboard" element={<AdminDashboard />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/market" element={<Market />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/treeDetail/:id" element={<TreeDetail />} />
    </Routes>
    </div>
  )
}

export default App
