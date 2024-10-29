import { useState, useCallback } from "react";
import supabase from "./supabase";
import Swal from "sweetalert2";
import userStore from "./ZustandStore";

interface FormData {
  email: string;
  password: string;
  full_name: string;
}

interface FormErrors {
  email: string;
  password: string;
  full_name: string;
}

const SignUpForm = () => {
  const [user, setUser] = useState<FormData>({
    email: "",
    password: "",
    full_name: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    email: "",
    password: "",
    full_name: "",
  });

  const setActiveUser = userStore((state) => state.setActiveUser);
  const fetchUserTrees = userStore((state) => state.fetchUserTrees);

  const validateForm = useCallback((formData: FormData): FormErrors => {
    const errors: FormErrors = {
      email: "",
      password: "",
      full_name: "",
    };

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

    // Validar full_name
    if (!formData.full_name) {
      errors.full_name = "El nombre es obligatorio.";
    }

    return errors;
  }, []);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    const updatedUser = { ...user, [name]: value };
    setUser(updatedUser);
    setFormErrors(validateForm(updatedUser));
  }, [user, validateForm]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (Object.values(formErrors).every((error) => error === "")) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              full_name: user.full_name,
            },
          },
        });

        if (error) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
          });
        } else {
          const userId = data.user?.id;

          if (userId) {
            const { error: insertError } = await supabase
              .from('Users')
              .insert([
                {
                  id: userId,
                  name: user.full_name,
                  email: user.email,
                },
              ]);

            if (insertError) {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: insertError.message,
              });
            } else {
              Swal.fire({
                icon: "success",
                title: "Usuario creado",
                text: "El usuario ha sido creado exitosamente.",
              });

              const { error: userTreeError1 } = await supabase
                .from('UserTree')
                .insert([
                  {
                    Userid: userId,
                  },
                ]);

              const { error: userTreeError2 } = await supabase
                .from('UserTree')
                .insert([
                  {
                    Userid: userId,
                  },
                ]);

              if (userTreeError1 || userTreeError2) {
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: userTreeError1?.message || userTreeError2?.message,
                });
              } else {
                setActiveUser(userId);
                fetchUserTrees(userId);
              }
            }
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "No se pudo obtener el UUID del usuario.",
            });
          }
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
  }, [formErrors, user, setActiveUser, fetchUserTrees]);

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white p-3 lg:p-5 m-5 mb-20 rounded-lg">
        <div className="grid gap-6 mb-6 md:grid-cols-2 ">
          <div>
            <label htmlFor="full_name" className="block mb-2 text-sm font-medium text-text-50 dark:text-white">
              Nombre Completo
            </label>
            <input
              type="text"
              id="full_name"
              className="bg-gray-50 border border-gray-300 text-text-50 text-sm rounded-lg focus:ring-secondary-50 focus:border-secondary-50 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-secondary-50 dark:focus:border-secondary-50"
              placeholder="John Doe"
              required
              name="full_name"
              value={user.full_name}
              onChange={handleChange}
            />
            {formErrors.full_name && <p className="text-red-500 text-xs">{formErrors.full_name}</p>}
          </div>
        </div>
        <div className="mb-6">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-text-50 dark:text-white">
            Correo
          </label>
          <input
            type="email"
            id="email"
            className="bg-gray-50 border border-gray-300 text-text-50 text-sm rounded-lg focus:ring-secondary-50 focus:border-secondary-50 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-secondary-50 dark:focus:border-secondary-50"
            placeholder="john.doe@company.com"
            required
            name="email"
            value={user.email}
            onChange={handleChange}
          />
          {formErrors.email && <p className="text-red-500 text-xs">{formErrors.email}</p>}
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-text-50 dark:text-white">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            className="bg-gray-50 border border-gray-300 text-text-50 text-sm rounded-lg focus:ring-secondary-50 focus:border-secondary-50 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-secondary-50 dark:focus:border-secondary-50"
            placeholder="•••••••••"
            required
            name="password"
            value={user.password}
            onChange={handleChange}
          />
          {formErrors.password && <p className="text-red-500 text-xs">{formErrors.password}</p>}
        </div>

        <button
          type="submit"
          className="disabled:cursor-not-allowed disabled:bg-secondary-100 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          disabled={!Object.values(formErrors).every((error) => error === "") || !Object.values(user).every((value) => value)}
        >
          Crear Usuario
        </button>
      </form>
    </div>
  );
};

export default SignUpForm;