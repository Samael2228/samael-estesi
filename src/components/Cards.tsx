import { useState, useEffect } from 'react';
import { UserTrees, Trees } from '../utils/interfaces';
import supabase from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

interface TreeCardProps {
  tree: UserTrees;
}

const TreeCard = ({ tree }: TreeCardProps) => {
  const [treeToShow, setTreeToShow] = useState<Trees | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchTreeDetails = async () => {
      if (tree.tree_id) {
        const { data, error } = await supabase
          .from('trees')
          .select('*')
          .eq('id', tree.tree_id)
          .single();

        if (error) {
          console.error('Error fetching tree details:', error);
        } else {
          setTreeToShow(data);
        }
      }
    };

    fetchTreeDetails();

    const calculateTimeLeft = () => {
      if (tree.last_harvest) {
        const lastHarvestDate = new Date(tree.last_harvest);
        const now = new Date();
        const timeDiff = 24 * 60 * 60 * 1000 - (now.getTime() - lastHarvestDate.getTime());
        return timeDiff > 0 ? timeDiff : 0;
      }
      return 24 * 60 * 60 * 1000;
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        if (prevTimeLeft && prevTimeLeft > 0) {
          return prevTimeLeft - 1000;
        } else {
          clearInterval(interval);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tree.tree_id, tree.last_harvest]);

  useEffect(() => {
    if (timeLeft === 0) {
      const updateHarvestStatus = async () => {
        const { error } = await supabase
          .from('UserTree')
          .update({ harvest_boolean: true })
          .eq('id', tree.id);

        if (error) {
          console.error('Error updating harvest status:', error);
        }
      };

      updateHarvestStatus();
    }
  }, [timeLeft, tree.id]);

  const handleHarvest = async (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    const now = new Date();
    const { error } = await supabase
      .from('UserTree')
      .update({ harvest_boolean: false, last_harvest: now.toISOString() })
      .eq('id', tree.id);

    if (error) {
      console.error('Error updating harvest status:', error);
    } else {
      setTimeLeft(24 * 60 * 60 * 1000);
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      {tree.tree_id === null ? (
        <div className="flex flex-col bg-[#A9DEFB] border shadow-sm rounded-xl hover:shadow-lg focus:outline-none focus:shadow-lg transition overflow-hidden">
          <img className="rounded-xl" src='https://mdxknhyxybkumqvtveag.supabase.co/storage/v1/object/public/tree_images/spot.png?t=2024-11-03T22%3A25%3A30.666Z'></img>
        </div>
      ) : (
        <div>
          {treeToShow ? (
            <a className="flex flex-col bg-[#A9DEFB] border shadow-sm rounded-xl hover:shadow-lg focus:outline-none focus:shadow-lg transition overflow-hidden">
              <p className='absolute top-[5%] left-[5%] text-[1.5rem] sm:text-3xl text-white'>{timeLeft !== null ? formatTime(timeLeft) : '00:00:00'}</p>
              <img className={` top-[-15%] lg:top-[-10%] right-[-4%] cursor-pointer drop-shadow-xl w-1/3 lg:w-1/4 ${tree.harvest_boolean === false ? 'hidden' : 'absolute'}`} src='/02button.png' onClick={handleHarvest}></img>
              <img className="rounded-xl" src={treeToShow.image_url} onClick={()=>navigate(`/treeDetail/${tree.tree_id}`)}></img>
            </a>
          ) : (
            <p>Cargando detalles del árbol...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TreeCard;