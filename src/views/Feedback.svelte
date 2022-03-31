<script>
  import { transitionTime, userInfo, darkMode } from "../store.js";
  import { ref as dbRef, onValue, set } from "firebase/database";
  import { Database } from "../firebase/firebase.js";
  import Layout from "./components/Layout.svelte";
  import { Admin, generate } from "../utils.js";
  import { Success } from "../notification.js";
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";

  $: isAdmin = Admin();

  let description = "";
  let solution = "";
  let where = "app";
  let data = [];

  function sendFeedback() {
    const id = generate();

    set(dbRef(Database, `feedback/${id}`), {
      id,
      where,
      solution,
      description,
      userInfo: $userInfo,
      date: new Date().toLocaleString(),
      readed: false,
    });

    Success({
      message: "¡Gracias! Tu opinion es muy importante.",
      time: 2,
    });

    solution = "";
    description = "";
    where = "app";
  }

  function deleteCard(id) {
    set(dbRef(Database, `feedback/${id}`), null);
  }

  function openFeedback({ where, description, solution, readed, id }) {
    if (!readed) {
      set(dbRef(Database, `feedback/${id}/readed`), true);
    }

    Swal.fire({
      title: `Feedback para la ${where}`,
      text: description,
      footer: `<h3>
                  Una Solucion seria: ${solution}
                <h3>`,
    });
  }

  onMount(() => {
    onValue(dbRef(Database, "feedback"), (snapshot) => {
      data = Object.values(snapshot.val() ?? {});
    });
  });
</script>

<svelte:head>
  <title>Feedback</title>
</svelte:head>

<Layout>
  <div
    slot="content"
    in:fly={{ duration: transitionTime + 250, x: -400 }}
    out:fly={{ duration: transitionTime + 250, x: 400 }}
  >
    <!-- user view -->
    {#if !isAdmin}
      <div class="flex flex-col justify-center">
        <div class="relative py-3 sm:max-w-xl sm:mx-auto">
          <div
            class="{$darkMode
              ? 'bg-gray-900'
              : 'bg-white'} relative px-4 py-10 mx-8 md:mx-0 shadow rounded-3xl sm:p-10"
          >
            <div class="max-w-md mx-auto">
              <div class="flex items-center space-x-5">
                <div
                  class="block pl-2 font-semibold text-xl self-start text-gray-700"
                >
                  <h2
                    class="{$darkMode ? 'text-gray-200' : ''} leading-relaxed"
                  >
                    FeedBack
                  </h2>
                  <p class="text-sm text-gray-500 font-normal leading-relaxed">
                    Ayudanos a mejorar la app y el servicio de comida.
                  </p>
                </div>
              </div>
              <div class="divide-y divide-gray-200">
                <div
                  class="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7"
                >
                  <div class="flex flex-col">
                    <span class="leading-loose text-bolder text-gray-500">
                      ¿De que quieres dar feedback?
                    </span>
                    <select
                      class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring mt-2 {$darkMode &&
                        'bg-gray-800 text-gray-400'}"
                      bind:value={where}
                    >
                      <option value="app">App de pedidos</option>
                      <option value="comida">Servicio de comida</option>
                    </select>
                  </div>
                  <div class="flex flex-col">
                    <span class="leading-loose text-gray-500">
                      Has una descripcion:
                    </span>

                    <textarea
                      cols="30"
                      rows="5"
                      class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring {$darkMode &&
                        'bg-gray-800 text-gray-400'}"
                      placeholder="Me gustaria ..."
                      bind:value={description}
                    />
                  </div>

                  <div class="flex flex-col">
                    <span class="leading-loose text-gray-500">
                      ¿Alguna idea de como solucionar o mejorar lo reportado?
                    </span>
                    <input
                      type="text"
                      class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring {$darkMode &&
                        'bg-gray-800 text-gray-400'}"
                      placeholder="Esta parte es opcional"
                      bind:value={solution}
                    />
                  </div>
                </div>
                <div class="pt-4 flex items-center space-x-4">
                  <button
                    class="bg-green-400 flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none"
                    on:click={sendFeedback}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- admin view -->
    {:else}
      <section class="container mx-auto p-6 font-mono overflow-hidden">
        <div class="w-full mb-8 overflow-hidden rounded-lg shadow-lg">
          <div class="w-full overflow-x-auto ">
            <table class="w-full overflow-hidden">
              <thead>
                <tr
                  class="text-md font-semibold tracking-wide text-left text-gray-900 bg-gray-100 uppercase border-b border-gray-600"
                >
                  <th class="px-4 py-3"> Nombre </th>
                  <th class="px-4 py-3"> Tipo de feedback </th>
                  <th class="px-4 py-3"> Fecha </th>
                  <th class="px-4 py-3"> Acciones </th>
                </tr>
              </thead>
              <tbody class="bg-white">
                {#each data as feeds, index}
                  <tr
                    class={`text-gray-700 ${
                      feeds?.readed ? "bg-gray-200" : ""
                    }`}
                    in:fly={{
                      duration: transitionTime + 300 + (index + 1) * 100,
                      x: 600,
                    }}
                  >
                    <td class="px-4 py-3 border">
                      <div class="flex items-center text-sm">
                        <div
                          class="relative w-8 h-8 mr-3 rounded-full md:block"
                        >
                          <img
                            class="object-cover w-full h-full rounded-full"
                            src={feeds?.userInfo?.imageUrl}
                            alt={feeds?.userInfo?.imageName}
                            loading="lazy"
                            style="object-fit: cover;"
                          />
                          <div
                            class="absolute inset-0 rounded-full shadow-inner"
                            aria-hidden="true"
                          />
                        </div>
                        <div>
                          <p class="font-semibold text-black">
                            {feeds?.userInfo?.name}
                          </p>
                          <p class="text-xs text-gray-600">
                            {feeds?.userInfo?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-xs border">
                      <span
                        class="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-sm"
                      >
                        Para la {feeds?.where}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm border">{feeds?.date}</td>
                    <td class="px-4 py-3 text-sm border">
                      <div class="flex item-center justify-center">
                        <div
                          class="w-4 mr-4 transform hover:text-purple-500 hover:scale-110 cursor-pointer"
                          on:click={() => openFeedback(feeds)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </div>

                        <div
                          class="w-4 mr-4 transform hover:text-purple-500 hover:scale-110 cursor-pointer"
                          on:click={() => deleteCard(feeds?.id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </div>
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    {/if}
  </div>
</Layout>
