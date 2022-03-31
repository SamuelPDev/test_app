<script>
    import { localStorage, userInfo, darkMode } from "../../store.js";
    import { ref as dbRef, onValue } from "firebase/database";
    import { Database } from "../../firebase/firebase.js";
    import { userStockImage, Admin } from "../../utils";
    import { Link } from "svelte-routing";
    import { onMount } from "svelte";
    import Img from "./Lazy.svelte";
  
    let sidebarOpen = false;
    let dropdownOpen = false;
    let count = 0;
  
    $: isAdmin = Admin();
  
    function logout() {
      localStorage.removeItem("USER_UID");
      localStorage.removeItem("USER_TOKEN");
  
      setTimeout(() => {
        window.location.replace("/");
      }, 400);
    }
  
    onMount(() => {
      onValue(dbRef(Database, "feedback"), (snapshot) => {
        const notify = Object.entries(snapshot?.val() ?? {})
          .flat(Infinity)
          .filter((noty) => typeof noty !== "string");
  
        count = notify.filter(({ readed }) => !readed).length;
      });
    });
  </script>
  
  <div>
    <div class="flex h-screen bg-gray-200">
      <div
        class={`${
          sidebarOpen ? "block" : "hidden"
        } fixed z-20 inset-0 bg-black opacity-50 transition-opacity lg:hidden`}
        on:click={() => (sidebarOpen = false)}
      />
  
      <div
        class={`${
          sidebarOpen ? "translate-x-0 ease-out" : "-translate-x-full ease-in"
        } fixed z-30 inset-y-0 left-0 w-64 transition duration-300 transform overflow-y-auto lg:translate-x-0 lg:static lg:inset-0 ${
          $darkMode ? "bg-gray-900" : "bg-white"
        }`}
      >
        <div class="flex items-center justify-center mt-8">
          <div class="flex items-center ml-4">
            <img
              class="h-10 w-10"
              src="https://cdn-icons-png.flaticon.com/512/857/857718.png"
              loading="lazy"
              alt="logo"
            />
            <span
              class="{$darkMode
                ? 'text-gray-400'
                : 'text-gray-700'} text-2xl mx-2 font-semibold"
            >
              Pedidos Almuerzo
            </span>
          </div>
        </div>
  
        <nav class="mt-10 flex flex-col justify-center">
          <div class="flex-grow">
            <Link to="/">
              <span
                class="flex items-center mt-4 py-2 px-6 bg- opacity -25 {$darkMode
                  ? 'text-gray-100'
                  : 'text-gray-700'}"
              >
                <span class="mx-3">Inicio</span>
              </span>
            </Link>
  
            <Link to="/panel/feedback">
              <span
                class="flex items-center mt-4 py-2 px-6 bg- opacity -25 {$darkMode
                  ? 'text-gray-100'
                  : 'text-gray-700'}"
              >
                <span class="mx-3">Feedback</span>
              </span>
            </Link>
  
            <Link to="/panel/history">
              <span
                class="flex items-center mt-4 py-2 px-6 bg- opacity -25 {$darkMode
                  ? 'text-gray-100'
                  : 'text-gray-700'}"
              >
                <span class="mx-3">Historial de pedidos</span>
              </span>
            </Link>
            <Link to="/panel/FAQ">
              <span
                class="flex items-center mt-4 py-2 px-6 bg- opacity -25 {$darkMode
                  ? 'text-gray-100'
                  : 'text-gray-700'}"
              >
                <span class="mx-3">FAQ</span>
              </span>
            </Link>
          </div>
        </nav>
      </div>
      <div class="flex-1 flex flex-col overflow-hidden">
        <header
          class="{$darkMode
            ? 'bg-gray-900'
            : 'bg-white'} flex justify-between items-center py-4 px-6 border-b-4 border-indigo-600"
        >
          <div class="flex items-center">
            <button
              on:click={() => (sidebarOpen = true)}
              class="text-gray-500 focus:outline-none lg:hidden"
            >
              <i class="fas fa-bars fa-lg" />
            </button>
          </div>
  
          <div class="flex items-center">
            <div class="relative">
              {#if isAdmin}
                <Link to="feedback">
                  <span
                    class="relative w-16 p-2 text-purple-900 rounded-xl mb-4 mr-6 cursor-pointer"
                  >
                    <i class="ml-4 fas fa-bell fa-lg" />
  
                    {#if count > 0 && count < 10}
                      <span
                        class="absolute -top-1 -right-2 bg-red-600 h-6 w-6 p-2 flex justify-center items-center text-white rounded-full"
                      >
                        {count}
                      </span>
                    {:else if count >= 10}
                      <span
                        class="absolute -top-1 -right-2 bg-red-600 h-6 w-6 p-2 flex justify-center items-center text-white rounded-full"
                      >
                        9+
                      </span>
                    {/if}
                  </span>
                </Link>
              {/if}
            </div>
  
            <div class="relative">
              <button
                on:click={() => (dropdownOpen = !dropdownOpen)}
                class="relative block h-8 w-8 rounded-full overflow-hidden shadow focus:outline-none"
              >
                <Img
                  Class="h-full w-full object-cover"
                  src={$userInfo?.imageUrl ?? userStockImage}
                  alt={$userInfo?.name}
                />
              </button>
  
              {#if dropdownOpen}
                <div
                  on:click={() => (dropdownOpen = false)}
                  class="fixed h-full w-full z-10"
                />
                <div
                  class="{$darkMode
                    ? 'bg-gray-800'
                    : 'bg-white'}  absolute right-0 mt-2 w-48 rounded-md overflow-hidden z-10 shadow-2xl border-gray-600"
                >
                  <Link to="me">
                    <span
                      class="{$darkMode
                        ? 'text-gray-200'
                        : 'text-gray-700'}  block px-4 py-2 text-sm hover:bg-indigo-600 hover:text-white"
                      >Perfil</span
                    >
                  </Link>
                  <span
                    on:click={logout}
                    class="{$darkMode
                      ? 'text-gray-200'
                      : 'text-gray-700'}  block px-4 py-2 text-sm hover:bg-indigo-600 hover:text-white"
                    >Cerrar Sesion</span
                  >
                </div>
              {/if}
            </div>
          </div>
        </header>
        <main
          class="flex-1 overflow-x-hidden overflow-y-auto {$darkMode
            ? 'bg-gray-800'
            : 'bg-gray-200'}"
        >
          <slot name="content" />
        </main>
      </div>
    </div>
  </div>