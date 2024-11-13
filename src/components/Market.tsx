import { useEffect, useState } from "react";
import { Trees } from "../utils/interfaces";
import supabase from "../utils/supabase";
import MarketCard from "./CardsMarket";
import userStore from "../utils/ZustandStore";

const Market = () => { 
  const [trees, setTrees] = useState<Trees[]>([]);
  const activeUser = userStore((state) => state.activeUser);

  useEffect(() => {
    const fetchTrees = async () => {
      const { data, error } = await supabase
        .from('trees')
        .select('*');

      if (error) {
        console.error('Error fetching trees:', error);
      } else {
        setTrees(data);
      }
    };

    fetchTrees();

    const treesChannel = supabase
      .channel('public:trees')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trees' }, (payload) => {
        setTrees((prevTrees) => {
          let updatedTrees = [...prevTrees];
          switch (payload.eventType) {
            case 'INSERT':
              updatedTrees.push(payload.new as Trees);
              break;
            case 'UPDATE':
              updatedTrees = updatedTrees.map(tree => tree.id === (payload.new as Trees).id ? payload.new as Trees : tree);
              break;
            case 'DELETE':
              updatedTrees = updatedTrees.filter(tree => tree.id !== payload.old.id);
              break;
            default:
              break;
          }
          return updatedTrees;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(treesChannel);
    };
  }, []);


  return (
    <div className='w-full h-full'>
      <div className='mt-5 ml-5'>
        <p className='text-5xl lg:text-7xl font-semibold '>Vivero</p>
        <p className='text-xl lg:text-2xl'>lts oxigeno: {activeUser?.balance}</p>
        <p className='text-xl lg:text-2xl'>Parcelas: {activeUser?.spots}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-10 w-full my-28 p-8">
        {trees.length > 0 ? (
          trees.map((tree) => (
            <MarketCard tree={tree} key={tree.id} />
          ))
        ) : (
          <p>No hay árboles disponibles para comprar.</p>
        )}
      </div>
    </div>
  );
};

export default Market;