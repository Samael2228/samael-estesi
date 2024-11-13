// Home.js
import { useEffect } from 'react';
import userStore from '../utils/ZustandStore';
import TreeCard from './Cards';


const Home = () => {
  const trees = userStore((state) => state.trees);
  const activeUser = userStore((state) => state.activeUser);
  const SetActiveUser = userStore((state) => state.setActiveUser);


   useEffect(() => {
    SetActiveUser(activeUser?.id);
   }, [activeUser]);

  return (
    <div className='w-full h-full'>
        <div className='mt-5 ml-5'>
        <p className='text-5xl lg:text-7xl font-semibold '>Tus arboles</p>
      <p className='text-xl lg:text-2xl'>lts oxigeno: {activeUser?.balance}</p>
      <p className='text-xl lg:text-2xl'>Parcelas: {activeUser?.spots}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-10 w-full my-28 p-8">
        {trees.length > 0 ? (
          trees.map((tree) => (
            <TreeCard tree={tree} key={tree.id} />
          ))
        ) : (
          <p>No tienes árboles en tus parcelas aún.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
