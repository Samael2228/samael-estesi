import { useState, useCallback } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import userStore from "../utils/ZustandStore";
import supabase from "../utils/supabase";

interface DepositData {
  amount: number;
  order_id: string;
}


const Deposit = () => {
  const navigate = useNavigate();
  const ActiveUser = userStore((state) => state.activeUser);

  const [deposit, setDeposit] = useState<DepositData>({
    amount: 0,
    order_id: "",
  });



  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      const updatedDeposit = { ...deposit, [name]: value };
      setDeposit(updatedDeposit);
    },
    [deposit]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
        if (deposit.amount > 0) {
        try {
            const amount = deposit.amount * 100
          const { error } = await supabase.from("transactions").insert([
            
            {
              user_id: ActiveUser?.id,
              amount: amount,
              transaction_type: "deposit",
              status: "pending",
              order_id: deposit.order_id,
            },
          ]);

          if (error) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: error.message,
            });
          } else {
            Swal.fire({
              icon: "success",
            title: "¡Listo!",
            text: "Tu depósito ha sido registrado, espera a que sea confirmado.",
            });
            navigate("/home");
            }   
        } catch (error) {
          console.log(error);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Algo salió mal. Por favor, inténtalo de nuevo.",
          });
        }
      }
    },
    [deposit, navigate]
  );

  return (
    <section className="bg-gray-50 font-Manrope w-full">
      <div className="flex flex-col items-center justify-center px-6 pb-8 mx-auto md:h-screen lg:pb-14">
        <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-semibold leading-tight tracking-tight text-text-50 md:text-2xl">
                Depositar
            </h1>
            <p>Direccion de billetera: <br/>
                <span>969658473tedgdfht5858bbry4y</span></p>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="amount"
                  className="block mb-2 text-sm font-medium text-text-50"
                >
                  Monto (USDT)
                </label>
                <input
                  type="text"
                  name="amount"
                  id="amount"
                  value={deposit.amount}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-text-50 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label
                  htmlFor="order_id"
                  className="block mb-2 text-sm font-medium text-text-50"
                >
                  Referencia
                </label>
                <input
                  type="text"
                  name="order_id"
                  id="order_id"
                  placeholder="1122334455"
                  value={deposit.order_id}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-text-50 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  required
                />
              </div>
              <button
                type="submit"
                className="disabled:cursor-not-allowed disabled:bg-secondary-100 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
              >
                Depositar
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Deposit;
