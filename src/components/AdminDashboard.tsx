import { useEffect, useState } from "react";
import supabase from "../utils/supabase";

interface Transaction {
  id: string;
  created_at: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  status: string;
  order_id: string;

}

const AdminDashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
        const { data: transactions, error } = await supabase
          .from('transactions')
          .select("*")
          .eq('status', "pending");

        if (error) {
          console.error('Error fetching transactions:', error.message);
          return;
        }
        setTransactions(transactions);
      
    };

    fetchTransactions();
  }, []);

 
  const getTransactionTypeProps = (status: string) => {
    switch (status) {
      case 'purchase':
        return "Compra";
      case 'withdraw':
        return "Retiro";
      case 'deposit':
        return "Deposito";
      default:
        return "Desconocido";
    }
  };

  return (
    <div className="flex flex-col m-5">
      <div className="overflow-x-auto pb-4">
        <div className="block">
          <div className="overflow-x-auto w-full border rounded-lg border-gray-300">
            <table className="w-full rounded-xl">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="p-5 text-left whitespace-nowrap text-sm leading-6 font-semibold text-gray-900 capitalize">Fecha</th>
                  <th scope="col" className="p-5 text-left whitespace-nowrap text-sm leading-6 font-semibold text-gray-900 capitalize">Monto</th>
                  <th scope="col" className="p-5 text-left whitespace-nowrap text-sm leading-6 font-semibold text-gray-900 capitalize min-w-[150px]">Tipo</th>
                  <th scope="col" className="p-5 text-left whitespace-nowrap text-sm leading-6 font-semibold text-gray-900 capitalize">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {transactions.map((transaction) => {
                  const transactionType = getTransactionTypeProps(transaction.transaction_type);
                  return (
                    <tr key={transaction.id} className="bg-white transition-all duration-500 hover:bg-gray-50">
                      <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">{new Date(transaction.created_at).toLocaleString()}</td>
                      <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">{transaction.amount} lts</td>
                      <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">{transactionType}</td>
                      <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                        <div className={`py-1.5 px-2.5 bg-yellow-50 rounded-full flex justify-center w-20 items-center gap-1`}>
                          <svg width="5" height="6" viewBox="0 0 5 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="2.5" cy="3" r="2.5" fill={'text-yellow-600'}></circle>
                          </svg>
                          <span className={`font-medium text-xs text-yellow-600`}>{transaction.status}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;