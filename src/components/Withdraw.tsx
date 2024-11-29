import { useState, useCallback, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import userStore from "../utils/ZustandStore";
import supabase from "../utils/supabase";

interface WithdrawData {
  amount: number;
  lts: number;
}

const Withdraw = () => {
  const navigate = useNavigate();
  const activeUser = userStore((state) => state.activeUser);
  const decrementBalance = userStore((state) => state.decrementBalance);

  const [withdraw, setWithdraw] = useState<WithdrawData>({
    amount: 0,
    lts: 0,
  });

  useEffect(() => {
    const amount = withdraw.lts / 100;
    setWithdraw((prevWithdraw) => ({ ...prevWithdraw, amount }));
  }, [withdraw.lts]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      const updatedWithdraw = { ...withdraw, [name]: parseFloat(value) };
      setWithdraw(updatedWithdraw);
    },
    [withdraw]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (withdraw.lts > 0 && activeUser && withdraw.lts <= activeUser?.balance) {
        try {
          const { error } = await supabase.from("transactions").insert([
            {
              user_id: activeUser?.id,
              amount: withdraw.lts,
              transaction_type: "withdraw",
              status: "pending",
            },
          ]);

          if (error) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: error.message,
            });
          } else {
            Swal.fire({
              icon: "success",
              title: "¡Listo!",
              text: "El retiro ha sido registrado, espera a que sea confirmado.",
            });
            decrementBalance(withdraw.lts);
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
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No tienes suficientes lts para retirar.",
        });
      }
    },
    [withdraw, activeUser, navigate]
  );

  return (
    <section className="bg-gray-50 font-Manrope w-full">
      <div className="flex flex-col items-center justify-center px-6 pb-8 mx-auto md:h-screen lg:pb-14">
        <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-semibold leading-tight tracking-tight text-text-50 md:text-2xl">
              Retirar
            </h1>
            <p>Balance: <span>{activeUser?.balance} lts</span></p>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <span>100 lts = 1 USDT</span>
              </div>
              <div>
                <label
                  htmlFor="lts"
                  className="block mb-2 text-sm font-medium text-text-50"
                >
                  LTS a retirar
                </label>
                <input
                  type="number"
                  name="lts"
                  id="lts"
                  value={withdraw.lts}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-text-50 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="amount"
                  className="block mb-2 text-sm font-medium text-text-50"
                >
                  Retiro en USDT
                </label>
                <input
                  type="text"
                  name="amount"
                  id="amount"
                  placeholder="0"
                  value={withdraw.amount}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-text-50 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  disabled
                />
              </div>
              <button
                type="submit"
                className="disabled:cursor-not-allowed disabled:bg-secondary-100 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
              >
                Retirar
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Withdraw;