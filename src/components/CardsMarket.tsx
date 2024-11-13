import { Trees } from '../utils/interfaces';
interface TreeCardProps {
  tree: Trees;
}

const MarketCard = ({ tree }: TreeCardProps) => {


  const formatNumber = (number: number) => {
    return new Intl.NumberFormat().format(number);
  };


  return (
    <div className='relative'>
    <a className="flex flex-col bg-[#A9DEFB] border shadow-sm rounded-xl hover:shadow-lg focus:outline-none focus:shadow-lg transition overflow-hidden" href={`/treeDetail/${tree.id}`}>
            <img className="rounded-xl" src={tree.image_url}></img>
            <div className='absolute -bottom-4 w-full justify-center flex'>
            <span className='bg-[#D9D9D9] text-xl sm:text-2xl font-bold p-2 shadow rounded-lg w-fit'>{formatNumber(tree.price)} LTS</span>
            </div>
          </a>
          </div>
  );
};

export default MarketCard;