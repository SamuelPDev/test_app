<script>
  import {
    ref as strRef,
    deleteObject,
    uploadBytes,
    getDownloadURL,
  } from "firebase/storage";
  import { state, userInfo, transitionTime, darkMode } from "../../store.js";
  import { menuStockImage, Admin, getDate } from "../../utils.js";
  import { ref as dbRef, onValue, set } from "firebase/database";
  import { Database, Storage } from "../../firebase/firebase.js";
  import { toast } from "@zerodevx/svelte-toast";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";

  let isInstalled = window.localStorage.getItem("installed");
  let inputFile = null;
  let pedidos = [];
  let custom = null;
  let install;

  const currentDate = getDate().toFirebase();
  const UUID = localStorage.getItem("USER_UID");
  let menu = { ensalada: [] };

  $: name = $userInfo?.name ?? "Loading...";
  $: precio = $state?.price ?? 140;

  $: image = $state?.imageUrl ? $state.imageUrl : menuStockImage;

  $: isAdmin = Admin();

  $: cicFact = pedidos.filter(
    ({ facturacion }) => facturacion === "cincinnatus"
  );
  $: cicSend = pedidos.filter(({ ubicacion }) => ubicacion === "cincinnatus");

  $: intFac = pedidos.filter(({ facturacion }) => facturacion === "intellisys");
  $: intSend = pedidos.filter(({ ubicacion }) => ubicacion === "intellisys");

  $: apart = pedidos.filter(({ facturacion }) => facturacion === "separado");

  $: miPedido = pedidos.filter(({ UUID }) => UUID === $userInfo?.uid);

  let facturacion = "intellisys";
  let ubicacion = "intellisys";
  let guarnicion = "";
  let ensalada = "";
  let segundo = "";

  async function eliminarTodo() {
    const { isConfirmed } = await Swal.fire({
      title: "¿Seguro que quieres eliminar los pedidos actuales?",
      showCancelButton: true,
      confirmButtonText: "Si",
      cancelButtonText: "Cancelar",
    });

    if (isConfirmed) {
      set(dbRef(Database, "pedidos"), null);

      toast.push("Se elimino el registro de pedidos", {
        theme: {
          "--toastBackground": "#6ee7b7",
          "--toastProgressBackground": "#58bf96",
        },
      });
    }
  }

  function uploadImage() {
    inputFile.click();
  }

  async function onChangeFile(e) {
    try {
      const file = e.target.files[0];
      const storage = strRef(Storage, file.name);

      await uploadBytes(storage, file);

      image = await getDownloadURL(storage);

      set(dbRef(Database, "state/imageName"), file.name);
      set(dbRef(Database, "state/imageUrl"), image);

      toast.push("Se cargo correctamente la imagen", {
        theme: {
          "--toastBackground": "#6ee7b7",
          "--toastProgressBackground": "#58bf96",
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  async function deleteImage() {
    try {
      const toDelete = strRef(Storage, `${$state.imageName}`);
      await deleteObject(toDelete);

      set(dbRef(Database, "state/imageName"), "");
      set(dbRef(Database, "state/imageUrl"), "");

      toast.push("Se elimino correctamente la imagen", {
        theme: {
          "--toastBackground": "#6ee7b7",
          "--toastProgressBackground": "#58bf96",
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  function desactivate() {
    set(dbRef(Database, "state/activa"), !$state.activa);

    if ($state.activa) {
      toast.push("Ya se pueden realizar pedidos", {
        theme: {
          "--toastBackground": "#6ee7b7",
          "--toastProgressBackground": "#58bf96",
        },
      });
    } else {
      toast.push("Ya no se pueden realizar pedidos", {
        theme: {
          "--toastBackground": "#F56565",
          "--toastProgressBackground": "#C53030",
        },
      });
    }
  }

  async function pedidosReport() {
    let report = "";

    report += "Estos Servicios los envian donde estoy yo, en Cincinnatus:\n";

    cicSend.forEach(
      ({ nombre, guarnicion, segundo, ensalada, ubicacion }, index) => {
        if (ubicacion === "cincinnatus") {
          report += ` ${
            index + 1
          }. ${nombre}: ${guarnicion}, ${segundo}, ${ensalada}\n`;
        }
      }
    );

    report += "\n\nEstos Servicios los envian al otro local, en Intellisys:\n";

    intSend.forEach(
      ({ nombre, guarnicion, segundo, ensalada, ubicacion }, index) => {
        if (ubicacion === "intellisys") {
          report += ` ${
            index + 1
          }. ${nombre}: ${guarnicion}, ${segundo}, ${ensalada}\n`;
        }
      }
    );

    await navigator.clipboard.writeText(report);
    await Swal.fire("Pedido copiado.");
  }

  async function facturasReport() {
    let facturas = "";

    if (intFac.length) {
      facturas += `\n Se enviaran a intellisys las facturas de:\n - ${intFac
        .map(({ nombre }) => nombre)
        .join("\n - ")}\n Con una factura valor: ${
        intFac.length * precio
      }\n Para un total de: ${intFac.length} pedidos.\n`;
    }

    if (cicFact.length) {
      facturas += `\n Se enviaran a cincinnatus las facturas de:\n - ${cicFact
        .map(({ nombre }) => nombre)
        .join("\n - ")}\n Con una factura valor: ${
        cicFact.length * precio
      }\n Para un total de: ${cicFact.length} pedidos.\n`;
    }

    if (apart.length) {
      facturas += `\n Un total de ${
        apart.length
      } facturas por separado de:\n - ${apart
        .map(({ nombre }) => nombre)
        .join("\n - ")}\n Para una factura total de ${apart.length * precio}`;
    }

    await navigator.clipboard.writeText(facturas);
    await Swal.fire("Reporte de facturas copiado copiado.");
  }

  async function send() {
    if ($state.activa) {
      if (!ensalada || !guarnicion || !ensalada) {
        return toast.push("Debes agregar todos los campos", {
          theme: {
            "--toastBackground": "#F56565",
            "--toastProgressBackground": "#C53030",
          },
        });
      }

      const { isConfirmed } = await Swal.fire({
        title: "¿Seguro que quieres enviar el pedido?",
        showCancelButton: true,
        confirmButtonText: "Enviar",
        cancelButtonText: "Cancelar",
      });

      if (isConfirmed) {
        set(dbRef(Database, `pedidos/${UUID}`), {
          nombre: name,
          ensalada,
          guarnicion,
          facturacion,
          ubicacion,
          segundo,
          UUID,
        });

        set(dbRef(Database, `history/${currentDate}/${UUID}`), {
          user: { ...$userInfo },
          ensalada,
          guarnicion,
          facturacion,
          ubicacion,
          segundo,
        });

        ubicacion = "intellisys";
        facturacion = "intellisys";
        ensalada = "";
        segundo = "";
        guarnicion = "";
        custom = null;

        toast.push("tu pedido fue enviado", {
          theme: {
            "--toastBackground": "#6ee7b7",
            "--toastProgressBackground": "#58bf96",
          },
        });
      }
    }
  }

  onMount(() => {
    const pedidosRef = dbRef(Database, "pedidos");
    const menuRef = dbRef(Database, "menu");

    window.addEventListener("beforeinstallprompt", (e) => {
      setTimeout(() => {
        install = e;
      }, 1000);
    });

    onValue(pedidosRef, (snapshot) => {
      pedidos = Object.values(snapshot?.val() ?? {});
    });

    onValue(menuRef, (snapshot) => {
      const data = snapshot.val() ?? {};
      menu.ensalada = data.ensalada.sort((a, b) => a.localeCompare(b)) ?? [];
    });
  });
</script>

<svelte:head>
  <title>Pedidos</title>
</svelte:head>

<div
  class="flex lg:flex-row flex-col-reverse"
  transition:fade={{ duration: transitionTime }}
>
  <div
    class={`mr-6 ${
      isAdmin ? "lg:w-1/2" : "lg:w-1/3"
    } w-full mt-8 py-2 flex-shrink-0 flex flex-col ${
      $darkMode ? "bg-gray-900" : "bg-white"
    } rounded-lg`}
  >
    <h3
      class="flex items-center pt-1 pb-1 px-8 text-lg font-semibold
      capitalize"
    >
      {#if isAdmin}
        <span>Pedidos Realizados</span>
      {:else}
        <span class={$darkMode && "text-gray-300"}>Mi Pedido</span>
      {/if}
    </h3>

    <div>
      <ul class="pt-1 pb-2 px-3 overflow-y-auto">
        {#if isAdmin}
          <li class="mt-2">
            <span
              class="p-5 flex flex-col justify-between bg-gray-100 rounded-lg"
            >
              <div
                class="flex items-center justify-between
              font-semibold capitalize"
              >
                <span>Pedidos a Cincinnatus:</span>
              </div>

              <p class="text-sm font-medium leading-snug text-gray-600 my-3">
                Un total de {cicSend.length} pedidos para cincinnatus.
                <br />
                Para Facturar un total de {cicFact.length} pedidos.
                <br />
                <br />
                Facturacion para cincinnatus de:
                {#each cicFact as { nombre }, key}
                  <br />
                  <span>
                    {key + 1}: {nombre}
                  </span>
                {/each}
                <br />

                <br />
                Envio para Cincinnatus de:
                {#each cicSend as { nombre }, key}
                  <br />
                  <span>
                    {key + 1}: {nombre}
                  </span>
                {/each}
                <br />
              </p>

              <p class="font-bold">
                para una factura valor: ${cicFact.length * precio} pesos.
              </p>
            </span>
          </li>

          <li class="mt-2">
            <span
              class="p-5 flex flex-col justify-between bg-gray-100 rounded-lg"
            >
              <div
                class="flex items-center justify-between
              font-semibold capitalize"
              >
                <span>Pedidos a Intellisys:</span>
              </div>

              <p class="text-sm font-medium leading-snug text-gray-600 my-3">
                Un total de {intSend.length} pedidos para intellisys.
                <br />
                Para Facturar un total de {intFac.length} pedidos.
                <br />
                <br />
                Facturacion para Intellisys de:
                {#each intFac as { nombre }, key}
                  <br />
                  <span>
                    {key + 1}: {nombre}
                  </span>
                {/each}
                <br />

                <br />

                Envio para Intellisys de:
                {#each intSend as { nombre }, key}
                  <br />
                  <span>
                    {key + 1}: {nombre}
                  </span>
                {/each}
              </p>

              <p class="font-bold">
                para una factura valor: ${intFac.length * precio} pesos.
              </p>
            </span>
          </li>

          <li class="mt-2">
            <span
              class="p-5 flex flex-col justify-between bg-gray-100 rounded-lg"
            >
              <div
                class="flex items-center justify-between
              font-semibold capitalize"
              >
                <span>Pedidos a facturar por separado:</span>
              </div>

              <p class="text-sm font-medium leading-snug text-gray-600 my-3">
                Para Facturar un total de {apart.length} pedidos.
                <br />
                <br />
                Facturacion por separado de:
                {#each apart as { nombre }, key}
                  <br />
                  <span>
                    {key + 1}: {nombre}
                  </span>
                {/each}
              </p>

              <p class="font-bold">
                para una factura valor: ${apart.length * precio} pesos.
              </p>
            </span>
          </li>
        {:else}
          {#each miPedido as pedido}
            <li class="mt-2">
              <span
                class="p-5 flex flex-col justify-between {$darkMode
                  ? 'bg-gray-800'
                  : 'bg-gray-100'} rounded-lg"
              >
                <div
                  class="flex items-center justify-between font-semibold {$darkMode &&
                    'text-gray-400'}"
                >
                  <span>Factura: {pedido?.facturacion}</span>
                </div>
                <p
                  class="text-sm font-medium leading-snug my-3 {$darkMode
                    ? 'text-gray-400'
                    : 'text-gray-600'}"
                >
                  Lugar de entrega: {pedido?.ubicacion}
                  <br />
                  <br />
                  Detalles del pedido:

                  <br />
                  <span>
                    1: {pedido?.guarnicion}
                  </span>

                  <br />
                  <span>
                    2: {pedido?.segundo}
                  </span>

                  <br />
                  <span>
                    3: {pedido?.ensalada}
                  </span>
                  <br />
                </p>
                <p class="font-bold {$darkMode && 'text-gray-400'}">
                  Para una factura valor: ${precio} pesos.
                </p>
              </span>
            </li>
          {/each}
        {/if}
      </ul>

      {#if isAdmin}
        <div class="flex content-cente justify-center">
          <button
            class="mt-8 flex items-center py-4 px-3 text-white rounded-lg bg-green-400 shadow focus:outline-none text-center mx-2"
            on:click={pedidosReport}
          >
            Generar Pedido
          </button>

          <button
            class="mt-8 flex items-center py-4 px-3 text-white rounded-lg bg-green-400 shadow focus:outline-none text-center mx-2"
            on:click={facturasReport}
          >
            Generar Reporte de facturas
          </button>

          <button
            class="mt-8 flex items-center py-4 px-3 text-white rounded-lg bg-blue-400 shadow focus:outline-none text-center mx-2"
            on:click={desactivate}
          >
            {#if $state?.activa}
              Cerrar pedidos
            {:else}
              Activar pedidos
            {/if}
          </button>

          <button
            class="mt-8 flex items-center py-4 px-3 text-white rounded-lg bg-red-400 shadow focus:outline-none text-center mx-2"
            on:click={eliminarTodo}
          >
            Eliminar los pedidos
          </button>
        </div>
      {/if}
    </div>
  </div>

  <div
    class={`mr-6 ${
      isAdmin ? "lg:w-1/2" : "lg:w-1/3"
    } w-full mt-8 py-2 flex-shrink-0 flex flex-col ${
      $darkMode ? "bg-gray-900" : "bg-indigo-300"
    } rounded-lg text-white mx-auto`}
  >
    <h3
      class="flex items-center pt-1 pb-1 px-8 text-lg font-bold capitalize {$darkMode &&
        'text-gray-300'}"
    >
      <!-- Header -->
      <span>Menu Del Dia</span>
    </h3>

    <div class="flex flex-col items-center mt-12">
      <a href={image} target="_blank">
        <img
          src={image}
          width="400"
          height="400"
          alt="menu del dia"
          loading="lazy"
          style={$darkMode && image === menuStockImage && "filter: invert(1);"}
        />
      </a>

      {#if isAdmin}
        <input
          bind:this={inputFile}
          on:change={onChangeFile}
          accept=".jpg, .jpeg, .png"
          type="file"
          style="display: none;"
        />
        <button
          class="mt-8 bg-green-400 rounded-lg py-2 px-4"
          on:click={uploadImage}
        >
          Subir nuevo menu
        </button>

        {#if $state.imageName && $state.imageUrl}
          <button
            class="mt-2 bg-red-400 rounded-lg py-2 px-2"
            on:click={deleteImage}
          >
            Eliminar menu
          </button>
        {/if}
      {/if}
    </div>
  </div>

  {#if !isAdmin}
    <div
      class="mr-6 lg:w-1/3 w-full mt-6 flex-shrink-0 flex flex-col rounded-lg mr-72"
    >
      <div class="container mx-auto w-min">
        <div
          class="py-6 p-10 {$darkMode
            ? 'bg-gray-900'
            : 'bg-white'} rounded-xl mt-2"
        >
          <div class="mb-4 flex flex-col">
            <span
              class="mr-4 {$darkMode
                ? 'text-gray-300'
                : 'text-gray-700'} font-bold inline-block mb-2"
            >
              Para:
            </span>
            <input
              type="text"
              class="border {$darkMode
                ? 'bg-gray-800 text-gray-400'
                : 'bg-gray-100'} py-2 px-4 w-64 outline-none focus:ring-2 focus:ring-indigo-400 rounded"
              placeholder="Erick Sosa"
              bind:value={name}
              readonly
            />
          </div>

          <div class="mb-4 flex flex-col">
            <span
              class="mr-4 {$darkMode
                ? 'text-gray-300'
                : 'text-gray-700'} font-bold inline-block mb-2"
            >
              Enviar a:
            </span>
            <select
              class="border {$darkMode
                ? 'bg-gray-800 text-gray-400'
                : 'bg-gray-100'} py-2 px-4 w-64 outline-none focus:ring-2 focus:ring-indigo-400 rounded"
              bind:value={ubicacion}
            >
              <option value="intellisys">Intellisys</option>
              <option value="cincinnatus">Cincinnatus</option>
            </select>
          </div>

          <div class="mb-4 flex flex-col">
            <span
              class="mr-4 {$darkMode
                ? 'text-gray-300'
                : 'text-gray-700'} font-bold inline-block mb-2"
            >
              <span>
                {#if facturacion === "separado"}
                  Facturar por:
                {:else}
                  Facturar en:
                {/if}
              </span>
            </span>

            <select
              class="border {$darkMode
                ? 'bg-gray-800 text-gray-400'
                : 'bg-gray-100'} py-2 px-4 w-64 outline-none focus:ring-2 focus:ring-indigo-400 rounded"
              bind:value={facturacion}
            >
              <option value="intellisys">Intellisys</option>
              <option value="cincinnatus">Cincinnatus</option>
              <option value="separado">Separado</option>
            </select>
          </div>

          <div class="mb-4">
            <input
              class="border {$darkMode
                ? 'bg-gray-800 text-gray-400'
                : 'bg-gray-100'} py-2 px-4 w-64 outline-none focus:ring-2 focus:ring-indigo-400 rounded"
              placeholder="Guarnicion"
              type="text"
              bind:value={guarnicion}
            />
          </div>

          <div class="mb-4">
            <input
              class="border {$darkMode
                ? 'bg-gray-800 text-gray-400'
                : 'bg-gray-100'} py-2 px-4 w-64 outline-none focus:ring-2 focus:ring-indigo-400 rounded"
              placeholder="Acompañamiento"
              type="text"
              bind:value={segundo}
            />
          </div>

          <div class="mb-4 flex flex-col">
            <span
              class="mr-4 {$darkMode
                ? 'text-gray-300'
                : 'text-gray-700'} font-bold inline-block mb-2"
            >
              <span> Ensalada: </span>
            </span>

            {#if !custom}
              <!-- svelte-ignore a11y-no-onchange -->
              <select
                class="border {$darkMode
                  ? 'bg-gray-800 text-gray-400'
                  : 'bg-gray-100'} py-2 px-4 w-64 outline-none focus:ring-2 focus:ring-indigo-400 rounded"
                bind:value={ensalada}
                on:change={() => {
                  if (ensalada === "Otra") {
                    toast.push("Escribe el nombre de la ensalada", {
                      theme: {
                        "--toastBackground": "#6ee7b7",
                        "--toastProgressBackground": "#58bf96",
                      },
                    });
                    custom = true;
                    ensalada = "";
                  }
                }}
              >
                {#each menu?.ensalada as item}
                  <option value={item}>{item}</option>
                {/each}
              </select>
            {:else}
              <input
                class="border {$darkMode
                  ? 'bg-gray-800 text-gray-400'
                  : 'bg-gray-100'} py-2 px-4 w-64 outline-none focus:ring-2 focus:ring-indigo-400 rounded"
                placeholder="Escribe la ensalada"
                type="text"
                bind:value={ensalada}
              />
            {/if}
          </div>

          <button
            class={`w-full mt-6 text-white font-bold ${
              $state?.activa ? "bg-green-400" : "bg-gray-400 cursor-not-allowed"
            } py-3 rounded-md`}
            on:click={send}
          >
            <span class="mx-auto">
              {#if $state?.activa}
                {#if miPedido?.length}
                  Actualizar pedido
                {:else}
                  Enviar
                {/if}
              {:else}
                No puedes realizar pedidos
              {/if}
            </span>
          </button>
          {#if install && isInstalled === null}
            <button
              class=" text-white font-bold bg-green-400 py-3 rounded-full px-4 fixed right-5 bottom-5"
              on:click={async () => {
                await Swal.fire("Instalar app");

                install.prompt();

                const choise = await install.userChoice;

                if (choise.outcome === "accepted") {
                  window.localStorage.setItem("installed", "ok");
                }
              }}
            >
              <i class="fas fa-download" />
            </button>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>
