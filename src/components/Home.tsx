// Home.js
import { useEffect } from 'react';
import userStore from '../utils/ZustandStore';
import TreeCard from './Cards';


const Home = () => {
  const { activeUser, trees, setActiveUser, fetchUserTrees } = userStore();
  const userId = "someUserId"; // Simula el ID del usuario actual

  useEffect(() => {
    if (userId) {
      setActiveUser(userId);
      fetchUserTrees(userId);
    }
  }, [userId, setActiveUser, fetchUserTrees]);

  return (
    <div>
      <h1>Bienvenido {activeUser ? activeUser.name : "Usuario"}</h1>
      <div className="tree-list">
        {trees.length > 0 ? (
          trees.map((tree) => (
            <TreeCard key={tree.id} tree={tree} userId={userId} />
          ))
        ) : (
          <p>No tienes árboles en tus parcelas aún.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
