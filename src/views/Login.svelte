<script>
  import { localStorage, transitionTime, darkMode } from "../store.js";
  import { signInWithEmailAndPassword } from "firebase/auth";
  import { ErrorAlert, Success } from "../notification.js";
  import { GoogleAuth } from "../firebase/providers.js";
  import { Auth } from "../firebase/firebase.js";
  import { navigate } from "svelte-routing";
  import { fade } from "svelte/transition";
  import { Link } from "svelte-routing";
  

  let email = "";
  let password = "";

  async function handlerLogin(e) {
    if (email && password) {
      try {
        const User = await signInWithEmailAndPassword(Auth, email, password);
        localStorage.setItem("USER_UID", User.user.uid);

        const token = Auth.currentUser;
        if (token !== null) {
          localStorage.setItem("USER_TOKEN", token?.accessToken);
        }

        Success({
          message: "Iniciando Sesion",
          time: 1,
        });

        setTimeout(() => {
          navigate("/panel", { replace: true });
        }, 500);
      } catch (e) {
        console.log(e);

        switch (e?.code) {
          case "auth/user-not-found":
            return ErrorAlert({
              message: "No existe un usuario registrado con este correo",
              time: 3,
            });
          case "auth/wrong-password":
            return ErrorAlert({
              message: "La contraseña es incorrecta",
              time: 3,
            });
          default:
            return ErrorAlert({
              message: "Error al ingregar",
              time: 3,
            });
        }
      }
    }
  }
</script>

<svelte:head>
  <title>Inicia Sesion</title>
</svelte:head>

<div
  class="flex flex-col items-center justify-center min-h-screen p-4 space-y-4 antialiased text-gray-900 {$darkMode
    ? 'bg-gray-900'
    : 'bg-white'}"
  transition:fade={{ duration: transitionTime + 250 }}
>
  <span
    class="inline-block mb-6 text-3xl font-bold tracking-wider uppercase {$darkMode
      ? 'text-gray-300'
      : 'text-gray-600'}">Pedidos Almuerzo</span
  >
  <main>
    <div
      class="w-full max-w-sm px-8 py-10 space-y-6 {$darkMode
        ? 'bg-gray-900'
        : 'bg-white'} rounded-md"
    >
      <form class="space-y-6 " on:submit|preventDefault={handlerLogin}>
        <input
          bind:value={email}
          class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring {$darkMode &&
            'bg-gray-800 text-gray-200'}"
          type="email"
          name="email"
          placeholder="Correo electronico"
          required={true}
        /><input
          bind:value={password}
          class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring {$darkMode &&
            'bg-gray-800 text-gray-200'}"
          type="password"
          name="password"
          placeholder="Contraseña"
          required={true}
        />
        <div class="flex items-center justify-between">
          <Link to="forgot">
            <span class="text-sm text-blue-600 hover:underline"
              >¿Olvidaste tu contraseña?</span
            >
          </Link>
        </div>
        <div>
          <button
            type="submit"
            class="w-full px-4 py-2 font-medium text-center text-white transition-colors duration-200 bg-blue-500 rounded-md  hover:bg-blue-600 focus:outline-none focus:ring"
            >Iniciar Sesion</button
          >
          <button
            type="submit"
            on:click={GoogleAuth}
            class="w-full px-4 py-2 mt-2 font-medium text-center text-white transition-colors duration-200 bg-blue-500 rounded-md  hover:bg-blue-600 focus:outline-none focus:ring"
            >Continuar con Google</button
          >
        </div>
      </form>

      <div class="text-sm {$darkMode ? 'text-gray-400' : 'text-gray-600'}">
        ¿No tienes cuenta? &nbsp;

        <Link to="signup">
          <span class="text-blue-600 hover:underline">Registrate</span>
        </Link>
      </div>
    </div>
  </main>
</div>
