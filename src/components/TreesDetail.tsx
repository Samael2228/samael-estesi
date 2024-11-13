import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import { Trees } from '../utils/interfaces';
import userStore from '../utils/ZustandStore';
import Swal from 'sweetalert2';

const TreeDetail = () => {
  const { id: treeId } = useParams<{ id: string }>();
  const [treeToShow, setTreeToShow] = useState<Trees | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeUser = userStore((state) => state.activeUser);
  const decrementSpotAndUpdateTrees = userStore((state) => state.decrementSpotAndUpdateTrees);
  let balance = activeUser?.balance;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTreeDetails = async () => {
      setLoading(true);
      setError(null);
      if (treeId) {
        const { data, error } = await supabase
          .from('trees')
          .select('*')
          .eq('id', treeId)
          .single();

        if (error) {
          console.error('Error fetching tree details:', error);
          setError('Error fetching tree details');
        } else {
          setTreeToShow(data);
        }
      }
      setLoading(false);
    };

    fetchTreeDetails();
  }, [treeId]);

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);
  };

  const buyTree = async () => { 
    if (activeUser && activeUser.spots > 0) {
      if (treeToShow && balance && balance >= treeToShow?.price) {
        const now = new Date();
        const { error } = await supabase
          .from('UserTree')
          .update({ tree_id: treeToShow.id, purchase_date: now.toISOString(), last_harvest: now.toISOString() })
          .eq('user_id', activeUser.id)
          .is('tree_id', null)
          .order('created_at', { ascending: true }) // Add order clause
          .limit(1)
          .select();

        if (error) {
          console.error('Error updating user tree:', error);
          console.error('Error details:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error updating user tree.',
          });
        } else {
          const newBalance = balance - treeToShow.price;
          await supabase
            .from('Users')
            .update({ balance: newBalance })
            .eq('id', activeUser.id);
          userStore.setState({ activeUser: { ...activeUser, balance: newBalance } });
          Swal.fire({
            icon: 'success',
            title: '¡Felicidades!',
            text: 'Has comprado un nuevo árbol.',
          });
          decrementSpotAndUpdateTrees();
          await supabase
            .from('transactions')
            .insert([
              { user_id: activeUser.id, amount: treeToShow.price, transaction_type: 'purchase', status: 'completed' },
            ])
            .select();
          navigate('/home');
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No tienes suficiente saldo para comprar este árbol.',
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No tienes parcelas disponibles para comprar este árbol.',
      });
    }
  };

  return (
    <div className="relative h-screen overflow-auto lg:p-10 lg:flex lg:justify-center">
      <div>
        {loading ? (
          <p>Cargando detalles del árbol...</p>
        ) : error ? (
          <p>{error}</p>
        ) : treeToShow ? (
          <div className='grid h-fit relative max-w-5xl mb-20'>
            <img className="bg-[#A9DEFB] w-full lg:rounded-t-2xl" src={treeToShow.image_url} alt={treeToShow.name} />
            <div className='bg-white h-full top-[40%] sm:top-[50%] rounded-t-2xl absolute w-full p-5 space-y-3'>
              <div>
                <p className='text-2xl'> <span className='font-bold'>Nombre:</span> {treeToShow.name}</p>
                <p className='text-md text-gray-400'>Oxígeno por día: {formatNumber(treeToShow.oxygen_per_day)} Lts</p>
              </div>
              <p> <span className='font-bold text-xl'>Descripción:</span> {treeToShow.description}</p>
              <p> <span className='font-bold text-xl'>Precio:</span> {formatNumber(treeToShow.price)}</p>
              <button onClick={buyTree} className="bg-green-500 text-white p-2 rounded">Comprar</button>
            </div>
          </div>
        ) : (
          <p>No se encontraron detalles del árbol.</p>
        )}
      </div>
    </div>
  );
};

export default TreeDetail;