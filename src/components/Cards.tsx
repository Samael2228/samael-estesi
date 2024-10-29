// Card.js
import { useEffect, useState } from 'react';
import './Card.css'; // Agrega estilos específicos para la card
import supabase from '../utils/supabase';


// Componente TreeCard para manejar cada árbol individualmente
const TreeCard = ({ tree, userId }) => {
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 horas en segundos
  const [isHarvestReady, setIsHarvestReady] = useState(tree.harvest_boolean);

  useEffect(() => {
    if (!tree.harvest_boolean) {
      const calculateTimeLeft = () => {
        const now = new Date().getTime();
        const nextHarvestTime = new Date(tree.created_at).getTime() + 24 * 60 * 60 * 1000; // 24 horas
        const remainingTime = Math.max(0, Math.floor((nextHarvestTime - now) / 1000));
        setTimeLeft(remainingTime);
        setIsHarvestReady(remainingTime === 0);
      };

      calculateTimeLeft();
      const interval = setInterval(() => {
        calculateTimeLeft();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [tree]);

  const handleHarvest = async () => {
    if (!isHarvestReady) return;

    const newBalance = activeUser.balance + tree.oxygen_per_day;
    await supabase
      .from('Users')
      .update({ balance: newBalance })
      .eq('id', userId);

    // Reinicia el timer y actualiza el estado de cosecha
    setTimeLeft(24 * 60 * 60);
    setIsHarvestReady(false);

    // Actualiza el harvest_boolean en la base de datos
    await supabase
      .from('UserTree')
      .update({ harvest_boolean: false })
      .eq('id', tree.id);

    // Refresca los datos del usuario y los árboles
    await fetchUserTree(userId);
  };

  return (
    <div className="tree-card">
      <img src={tree.image_url} alt={tree.name} />
      <h3>{tree.name}</h3>
      <p>Oxígeno por día: {tree.oxygen_per_day}</p>
      <p>Precio: {tree.price}</p>
      {isHarvestReady ? (
        <button onClick={handleHarvest}>Cosechar</button>
      ) : (
        <p>Tiempo restante para cosechar: {`${Math.floor(timeLeft / 3600)}h ${Math.floor((timeLeft % 3600) / 60)}m ${timeLeft % 60}s`}</p>
      )}
    </div>
  );
};

export default TreeCard;
