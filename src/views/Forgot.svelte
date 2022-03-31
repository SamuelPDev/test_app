<script>
  import { ErrorAlert, Success } from "../notification.js";
  import { sendPasswordResetEmail } from "firebase/auth";
  import { transitionTime, darkMode } from "../store.js";
  import { Auth } from "../firebase/firebase.js";
  import { fade } from "svelte/transition";
  import { Link } from "svelte-routing";

  let email = "";

  async function handlerForgot() {
    try {
      await sendPasswordResetEmail(Auth, email);

      Success({
        message: `Se envio el correo de restauracion a ${email}`,
        time: 3,
      });
    } catch (e) {
      console.log(e);
      email = "";
      switch (e?.code) {
        case "auth/user-not-found":
          return ErrorAlert({
            message: "No existe un usuario registrado con este correo",
            time: 3,
          });
        default:
          return ErrorAlert({
            message: "Error enviando el correo de restauracion",
            time: 3,
          });
      }
    }
  }
</script>

<svelte:head>
  <title>Reset</title>
</svelte:head>

<div
  class="min-h-screen flex flex-col items-center justify-center {$darkMode
    ? 'bg-gray-900'
    : 'bg-white'}"
  transition:fade={{ duration: transitionTime }}
>
  <div
    class="flex flex-col {$darkMode
      ? 'bg-gray-900'
      : 'bg-white'} px-4 sm:px-6 md:px-8 lg:px-10 py-8 rounded-md w-full max-w-md"
  >
    <div
      class="font-medium self-center text-xl sm:text-2xl uppercase {$darkMode
        ? 'text-gray-300'
        : 'text-gray-800'}"
    >
      Resetear Contraseña
    </div>
    <div class="mt-10">
      <form on:submit|preventDefault={handlerForgot}>
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

        <div class="flex w-full flex-col">
          <button
            type="submit"
            class="w-full px-4 py-2 font-medium text-center text-white transition-colors duration-200 bg-blue-500 rounded-md  hover:bg-blue-600 focus:outline-none focus:ring"
          >
            <span class="mr-2 uppercase">Enviar</span>
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
