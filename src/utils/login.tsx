import { useState, useCallback } from "react";
import supabase from "./supabase";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import userStore from "./ZustandStore";

interface LoginData {
  email: string;
  password: string;
}

interface LoginErrors {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const setActiveUser = userStore((state) => state.setActiveUser);
  const  fetchUserTrees = userStore((state) => state. fetchUserTrees);

  const [logUser, setLogUser] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({
    email: "",
    password: "",
  });

  const validateForm = useCallback((formData: LoginData): LoginErrors => {
    const errors: LoginErrors = { email: "", password: "" };

    // Validar email
    if (!formData.email) {
      errors.email = "El correo electrónico es obligatorio.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "El correo electrónico no es válido.";
    }

    // Validar password
    if (!formData.password) {
      errors.password = "La contraseña es obligatoria.";
    } else if (formData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    return errors;
  }, []);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      const updatedUser = { ...logUser, [name]: value };
      setLogUser(updatedUser);
      setLoginErrors(validateForm(updatedUser));
    },
    [logUser, validateForm]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (Object.values(loginErrors).every((error) => error === "")) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: logUser.email,
            password: logUser.password,
          });

          if (error) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: error.message,
            });
          } else {
            Swal.fire({
              icon: "success",
              title: "Bienvenido",
              text: "Inicio de sesión exitoso",
            });
            if (data) {
              let IdUser = data.user.id;
              setActiveUser(IdUser);
              fetchUserTrees(IdUser);
            navigate("/home");
          }}
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
    [logUser, loginErrors, navigate]
  );

  return (
    <section className="bg-gray-50 font-Manrope w-full">
      <div className="flex flex-col items-center justify-center px-6 pb-8 mx-auto md:h-screen lg:pb-14">
        <div className="flex justify-center">
          <img className="-mb-[20%]" src="/JTEP.avif" alt="logo" />
        </div>
        <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-semibold leading-tight tracking-tight text-text-50 md:text-2xl">
              Accede a tu cuenta
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-text-50"
                >
                  Correo
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={logUser.email}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-text-50 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="nombre@email.com"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-text-50"
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  value={logUser.password}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-text-50 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  required
                />
              </div>
              <button
                type="submit"
                className="disabled:cursor-not-allowed disabled:bg-secondary-100 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
              >
                Iniciar Sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
