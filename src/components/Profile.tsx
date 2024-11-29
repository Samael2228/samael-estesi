import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";
import userStore from "../utils/ZustandStore";
import { useState } from "react";

const Profile = () => {
  const [wallet, setWallet] = useState("");
  const navigate = useNavigate();
  const activeUser = userStore((state) => state.activeUser);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
      return;
    }
    localStorage.clear();
    navigate('/login');
  };

  const saveWallet = async () => {
    const { error } = await supabase
      .from('Users')
      .update({ wallet_address: wallet })
      .eq('id', activeUser?.id);
    if (error) {
      console.error("Error updating wallet:", error);
      return;
    }
  }
  return (
    <div className="flex flex-col items-center p-4 space-y-4 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Perfil</h2>
        {activeUser ? (
          <>
            <p className="text-lg"><strong>Nombre:</strong> {activeUser?.name}</p>
            <p className="text-lg"><strong>Email:</strong> {activeUser?.email}</p>
            {activeUser?.wallet_address ?
            <p className="text-lg"><strong>Billetera:</strong> {activeUser?.wallet_address}</p>
            : 
            <div>
            <input
              type="text"
              placeholder="Dirección de billetera"
              className="w-full border rounded p-2"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
            />
            <button onClick={saveWallet}>
              Guardar
            </button>
            </div>
}
          </>
        ) : (
          <p>Cargando perfil...</p>
        )}
        <div className="mt-6 space-y-2">
          <button
            onClick={() => navigate('/transactions')}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
           Transacciones
          </button>
          <button
            onClick={() => navigate('/deposit')}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Depositar
          </button>
          <button
            onClick={() => navigate('/withdraw')}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Retirar
          </button>
          <button
            onClick={signOut}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;