<script>
  import { createUserWithEmailAndPassword } from "firebase/auth";
  import { ErrorAlert, Success } from "../notification.js";
  import { Auth, Database } from "../firebase/firebase.js";
  import { transitionTime, darkMode } from "../store.js";
  import { ref as dbRef, set } from "firebase/database";
  import { userStockImage } from "../utils.js";
  import { fade } from "svelte/transition";
  import { Link } from "svelte-routing";

  let password = "";
  let email = "";
  let name = "";

  async function handlerSignup() {
    if (password.length <= 5) {
      return ErrorAlert({
        message: "la contraseña debe tener minimo 6 caracteres",
        time: 3,
      });
    } else {
      try {
        const { user } = await createUserWithEmailAndPassword(
          Auth,
          email,
          password
        );

        await set(dbRef(Database, `users/${user?.uid}`), {
          name,
          email,
          uid: user?.uid,
          imageUrl: userStockImage,
          imageName: "default",
        });

        password = "";
        name = "";
        email = "";

        Success({
          message: "Registrado correctamente",
          time: 2,
        });

        setTimeout(() => {
          window.location.replace("/");
        }, 500);
      } catch (e) {
        console.log(e);

        switch (e?.code) {
          case "auth/email-already-in-use":
            return ErrorAlert({
              message: "Ya esta registrado este correo",
              time: 3,
            });
          default:
            return ErrorAlert({
              text: "Error creando la cuenta",
              time: 3,
            });
        }
      }
    }
  }
 
</script>

<svelte:head>
  <title>Registrate</title>
</svelte:head>

<div
  class="min-h-screen flex flex-col items-center justify-center {$darkMode &&
    'bg-gray-900'}"
  transition:fade={{ duration: transitionTime }}
>
  <div
    class="flex flex-col {$darkMode
      ? 'bg-gray-900'
      : 'bg-white'} px-4 sm:px-6 md:px-8 lg:px-10 py-8 rounded-md w-full max-w-md"
  >
    <span
      class="inline-block self-center mb-6 text-3xl font-bold tracking-wider uppercase {$darkMode
        ? 'text-gray-300'
        : 'text-gray-600'}">Registrate</span
    >
    <div class="mt-10">
      <form on:submit|preventDefault={handlerSignup}>
        <div class="flex flex-col mb-6">
          <div class="relative">
            <input
              bind:value={email}
              id="email"
              type="email"
              name="email"
              class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring {$darkMode &&
                'bg-gray-800 text-gray-200'}"
              placeholder="Correo"
              required
            />
          </div>
        </div>

        <div class="flex flex-col mb-6">
          <div class="relative">
            <input
              bind:value={name}
              id="nombre"
              type="text"
              name="nombre"
              class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring {$darkMode &&
                'bg-gray-800 text-gray-200'}"
              placeholder="Nombre"
              required
            />
          </div>
        </div>

        <div class="flex flex-col mb-6">
          <div class="relative">
            <input
              bind:value={password}
              id="password"
              type="password"
              name="password"
              class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring {$darkMode &&
                'bg-gray-800 text-gray-200'}"
              placeholder="Contraseña"
              required
            />
          </div>
        </div>

        <div class="flex w-full flex-col">
          <button
            type="submit"
            class="w-full px-4 py-2 font-medium text-center text-white transition-colors duration-200 bg-blue-500 rounded-md focus:outline-none focus:ring"
          >
            <span class="mr-2 uppercase">Crear cuenta</span>
          </button>
          <Link to="/login">
            <div
              class="w-full px-4 py-2 font-medium text-center text-white transition-colors duration-200 bg-gray-400 rounded-md focus:outline-none focus:ring mt-2"
            >
              <span class="mr-2 uppercase">
                <i class="fas fa-arrow-left" />
              </span>
            </div>
          </Link>
        </div>
      </form>
    </div>
  </div>
</div>
