<script>
  import { transitionTime, userInfo, darkMode } from "../store.js";
  import { ref as dbRef, onValue, get } from "firebase/database";
  import { Database } from "../firebase/firebase.js";
  import Layout from "./components/Layout.svelte";
  import { fly } from "svelte/transition";
  import { getDate } from "../utils.js";
  import { onMount } from "svelte";

  let date = getDate().toFirebase();

  let history = [];
  let copyHistory = [];
  let filter;

  async function changeDate() {
    const data = Object.entries(
      (await get(dbRef(Database, `history/${date}`))).val() ?? {}
    );

    history = data.flat(Infinity).filter((item) => typeof item !== "string");
    copyHistory = history;

    find();
  }

  const find = () => {
    if (filter === "me") {
      history = [...history].filter(
        (pedido) => pedido.user.uid === $userInfo?.uid
      );
    } else if (filter === "all") {
      history = copyHistory;
    }
  };

  function search(e) {
    const value = e.target.value?.trim();

    if (value === "") {
      history = copyHistory;
    } else {
      history = [...history].filter(
        ({ user }) =>
          user?.email
            ?.toLocaleLowerCase()
            ?.startsWith(value.toLocaleLowerCase()) ||
          user?.name?.toLocaleLowerCase()?.startsWith(value.toLocaleLowerCase())
      );
    }
  }

  onMount(() => {
    onValue(dbRef(Database, `history/${date}`), (snapshot) => {
      const data = Object.entries(snapshot.val() ?? {});

      history = data.flat(Infinity).filter((item) => typeof item !== "string");

      copyHistory = history;
    });
  });
</script>

<svelte:head>
  <title>Historial de Pedidos</title>
</svelte:head>
<Layout>
  <div
    slot="content"
    in:fly={{ duration: transitionTime + 250, x: -400 }}
    out:fly={{ duration: transitionTime + 250, x: 400 }}
  >
    <div
      class="antialiased font-sans {$darkMode ? 'bg-gray-800' : 'bg-gray-200'}"
    >
      <div class="container mx-auto px-4 sm:px-8">
        <div class="py-8">
          <div>
            <h2
              class="text-2xl font-semibold leading-tight {$darkMode &&
                'text-gray-300'}"
            >
              Historial de Pedidos
            </h2>
          </div>
          <div class="my-2 flex sm:flex-row flex-col">
            <div class="flex flex-row mb-1 sm:mb-0">
              <div class="relative">
                <input
                  type="date"
                  class="appearance-none h-full rounded-l border block w-full bg-white border-gray-400 text-gray-300 py-2 px-4 pr-8 leading-tight {$darkMode
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-700'}"
                  on:change={(e) => {
                    const parse = e.target.value
                      .split("-")
                      .reverse()
                      .map((n) => parseInt(n).toString())
                      .join("-");

                    date = parse;

                    changeDate();
                  }}
                />

                <div
                  class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
                >
                  <svg
                    class="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                    />
                  </svg>
                </div>
              </div>

              <div class="relative">
                <!-- svelte-ignore a11y-no-onchange -->
                <select
                  class="appearance-none h-full border block w-full bg-white border-gray-400 py-2 px-4 pr-8 leading-tight {$darkMode
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-700'}"
                  bind:value={filter}
                  on:change={() => find()}
                >
                  <option value="me"> Mis pedidos </option>
                  <option value="all" selected> Todos los pedidos </option>
                </select>
                <div
                  class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
                >
                  <svg
                    class="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {#if filter === "all"}
              <div class="block relative">
                <span
                  class="h-full absolute inset-y-0 left-0 flex items-center pl-2"
                >
                  <svg
                    viewBox="0 0 24 24"
                    class="h-4 w-4 fill-current text-gray-500"
                  >
                    <path
                      d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z"
                    />
                  </svg>
                </span>
                <input
                  on:keyup={search}
                  placeholder="Buscar por correo"
                  class="appearance-none rounded-r rounded-l sm:rounded-l-none border border-gray-400 border-b block pl-8 pr-6 py-2 w-full bg-white text-sm text-gray-300 {$darkMode
                    ? 'bg-gray-800 placeholder-gray-200'
                    : 'text-gray-700 placeholder-gray-700'}"
                  type="email"
                />
              </div>
            {/if}
          </div>
          <div class="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
            <div
              class="inline-block min-w-full shadow rounded-lg overflow-hidden"
            >
              <table class="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th
                      class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider {$darkMode &&
                        'bg-gray-900 text-gray-300'}"
                    >
                      Nombre
                    </th>
                    <th
                      class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider {$darkMode &&
                        'bg-gray-900 text-gray-300'}"
                    >
                      Enviado a
                    </th>

                    <th
                      class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider {$darkMode &&
                        'bg-gray-900 text-gray-300'}"
                    >
                      Facturado
                    </th>
                    <th
                      class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider {$darkMode &&
                        'bg-gray-900 text-gray-300'}"
                    >
                      Pedido
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {#each history as user, index}
                    <tr
                      in:fly={{
                        duration: transitionTime + 300 + (index + 1) * 100,
                        x: 600,
                      }}
                    >
                      <td
                        class="px-5 py-5 border-b border-gray-200 {$darkMode
                          ? 'bg-gray-800 border-gray-900'
                          : 'bg-white'} text-sm"
                      >
                        <div class="flex items-center">
                          <div class="flex-shrink-0 w-10 h-10">
                            <img
                              class="w-full h-full rounded-full"
                              src={user?.user?.imageUrl}
                              alt={user?.user?.name}
                              loading="lazy"
                            />
                          </div>
                          <div class="ml-3">
                            <p
                              class="whitespace-no-wrap {$darkMode
                                ? 'text-gray-100'
                                : 'text-gray-900'}"
                            >
                              {user?.user?.name}
                            </p>
                            <p
                              class="text-xs {$darkMode
                                ? 'text-gray-500'
                                : 'text-gray-600'}"
                            >
                              {user?.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td
                        class="px-5 py-5 border-b border-gray-200 {$darkMode
                          ? 'bg-gray-800 border-gray-900'
                          : 'bg-white'} text-sm"
                      >
                        <p
                          class="whitespace-no-wrap {$darkMode
                            ? 'text-gray-100'
                            : 'text-gray-900'}"
                        >
                          {user?.ubicacion}
                        </p>
                      </td>

                      <td
                        class="px-5 py-5 border-b border-gray-200 {$darkMode
                          ? 'bg-gray-800 border-gray-900'
                          : 'bg-white'} text-sm"
                      >
                        <p
                          class="whitespace-no-wrap {$darkMode
                            ? 'text-gray-100'
                            : 'text-gray-900'}"
                        >
                          {user?.facturacion}
                        </p>
                      </td>

                      <td
                        class="px-5 py-5 border-b border-gray-200 {$darkMode
                          ? 'bg-gray-800 border-gray-900'
                          : 'bg-white'} text-sm"
                      >
                        <p
                          class="{$darkMode
                            ? 'text-gray-100'
                            : 'text-gray-900'} whitespace-no-wrap"
                        >
                          1: {user?.guarnicion}
                        </p>

                        <p
                          class="{$darkMode
                            ? 'text-gray-100'
                            : 'text-gray-900'} whitespace-no-wrap"
                        >
                          2: {user?.segundo}
                        </p>

                        <p
                          class="{$darkMode
                            ? 'text-gray-100'
                            : 'text-gray-900'} whitespace-no-wrap"
                        >
                          3: {user?.ensalada}
                        </p>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</Layout>
