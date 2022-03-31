<script>
  import {
    ref as strRef,
    deleteObject,
    uploadBytes,
    getDownloadURL,
  } from "firebase/storage";
  import { userInfo, transitionTime, darkMode } from "../store.js";
  import { Database, Storage } from "../firebase/firebase.js";
  import { sendPasswordResetEmail } from "firebase/auth";
  import { ref as dbRef, set } from "firebase/database";
  import { userStockImage, Admin } from "../utils.js";
  import Layout from "./components/Layout.svelte";
  import { toast } from "@zerodevx/svelte-toast";
  import { Auth } from "../firebase/firebase.js";
  import { Success } from "../notification.js";
  import { fly } from "svelte/transition";
  
  $: User = $userInfo;

  let imageInput = null;
  let userName = "";

  const isAdmin = Admin();

  const textFallback = isAdmin ? "Administracion" : "Loading...";
  const imageFallback = userStockImage;

  function clickInput() {
    imageInput.click();
  }

  async function uploadPicture(e) {
    try {
      const toDelete = strRef(Storage, $userInfo?.imageUrl);
      await deleteObject(toDelete);

      set(dbRef(Database, `users/${$userInfo?.uid}/imageName`), "");
      set(dbRef(Database, `users/${$userInfo?.uid}/imageUrl`), userStockImage);
    } catch (error) {
      console.error(error);
    }

    try {
      const file = e.target.files[0];
      const storage = strRef(Storage, `${$userInfo?.uid}${file.name}`);

      await uploadBytes(storage, file);

      let image = await getDownloadURL(storage);

      set(
        dbRef(Database, `users/${$userInfo?.uid}/imageName`),
        `${$userInfo?.uid}${file.name}`
      );

      set(dbRef(Database, `users/${$userInfo?.uid}/imageUrl`), image);

      toast.push("Se cargo correctamente la imagen", {
        theme: {
          "--toastBackground": "#6ee7b7",
          "--toastProgressBackground": "#58bf96",
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  function updateInfo() {
    if (!userName) return;

    set(dbRef(Database, `users/${$userInfo?.uid}/name`), userName);

    toast.push("Se actualizo la informacion correctamente", {
      theme: {
        "--toastBackground": "#6ee7b7",
        "--toastProgressBackground": "#58bf96",
      },
    });

    userName = "";
  }
</script>

<svelte:head>
  <title>Mi perfil</title>
</svelte:head>

<Layout>
  <div
    class="container mx-auto px-10"
    slot="content"
    transition:fly={{ duration: transitionTime + 150, x: 400 }}
  >
    <div class="my-10">
      <div
        class="{$darkMode
          ? 'bg-gray-900'
          : 'bg-white'} rounded overflow-hidden shadow-lg"
      >
        <div class="text-center p-6 border-b">
          <img
            class="h-64 w-64 rounded-full mx-auto"
            src={User?.imageUrl ?? imageFallback}
            alt={User?.name}
            loading="lazy"
            style="object-fit: cover;"
          />

          {#if !isAdmin}
            <input
              type="file"
              style="display: none;"
              accept=".jpg, .jpeg, .png"
              bind:this={imageInput}
              on:change={uploadPicture}
            />
            <button
              class="{$darkMode
                ? 'bg-gray-800'
                : 'bg-gray-400'} mt-2  rounded-lg py-2 px-4 text-white"
              on:click={clickInput}
            >
              Cambiar foto
            </button>
          {/if}
          <p
            class="{$darkMode
              ? 'text-gray-300'
              : ''} pt-2 text-lg font-semibold"
          >
            {User?.name ?? textFallback}
          </p>
          <p class="{$darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm">
            {User?.email ?? textFallback}
          </p>
        </div>
        <div class={$darkMode ? "" : "border-b"}>
          {#if !isAdmin}
            <span class="px-4 py-2 flex">
              <div class="pl-3">
                <p
                  class="{$darkMode
                    ? 'text-gray-400'
                    : 'text-gray-800'} text-sm font-medium leading-none"
                >
                  Cambia tu nombre:
                </p>
                <input
                  type="text"
                  class="{$darkMode
                    ? 'bg-gray-800 text-gray-200'
                    : ''} mt-2 w-full px-2 py-2 border rounded-md focus:outline-none focus:ring mb-2"
                  placeholder={$userInfo?.name ?? textFallback}
                  bind:value={userName}
                />

                <div
                  class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in"
                >
                  <input
                    type="checkbox"
                    name="toggle"
                    id="toggle"
                    class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    checked={$darkMode}
                    on:change={() => {
                      if ($darkMode) {
                        darkMode.set("");
                      } else {
                        darkMode.set(!$darkMode);
                      }
                    }}
                  />
                  <label
                    for="toggle"
                    class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  />
                </div>
                <label
                  for="toggle"
                  class="{$darkMode
                    ? 'text-gray-400'
                    : 'text-gray-900'} text-base mt-4"
                >
                  Dark mode
                </label>
              </div>
            </span>

            <span class="px-4 py-2 flex">
              <div class="pl-3">
                <button
                  class="mt-2 bg-green-400 rounded-lg py-2 px-4 text-white"
                  on:click={updateInfo}
                >
                  Guardar
                </button>

                <button
                  class="mt-2 bg-red-400 rounded-lg py-2 px-2 text-white"
                  on:click={async () => {
                    await sendPasswordResetEmail(Auth, User?.email);

                    Success({
                      message: `Se envio el correo de cambio de contraseña a ${User?.email}`,
                      time: 3,
                    });
                  }}
                >
                  Cambiar contraseña
                </button>
              </div>
            </span>
          {/if}
        </div>
      </div>
    </div>
  </div>
</Layout>

<style>
  :global(img) {
    object-fit: cover;
  }

  .toggle-checkbox:checked {
    right: 0;
    border-color: #68d391;
  }
  .toggle-checkbox:checked + .toggle-label {
    background-color: #68d391;
  }
</style>
