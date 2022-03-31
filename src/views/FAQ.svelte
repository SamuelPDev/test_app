<script>
  import { darkMode } from "../store.js";
  import Layout from "./components/Layout.svelte";
  import { fade, fly } from "svelte/transition";

  const questions = [
    {
      question: "Como se realiza un pedido",
      anwer:
        "Para realizar un pedido debemos de realizar los siguientes pasas:<br><ul class='list-decimal ml-4'><li>Esperamos la apertura del menu del comedor.</li><li>Seleccionamos el sitio donde se va a mandar su pedido debajo de <b>Enviar a:</b></li><li>Seleccionamos el sitio donde se va a realizar la factura del pedido debajo de <b>Facturar en:</b></li><li>Seleccionamos el sitio donde dice <b>Guarnicion</b> y introducimos la guarnicion al gusto que concuerde con el menu del dia.</li><li>Seleccionamos el sitio donde dice <b>Acompañamiento</b> y introducimos el acompañamiento al gusto que concuerde con el menu del dia.</li><li>Desplegamos la zona de <b>Ensaladas:</b> y seleccionamos la ensalada al gusto que concuerde con el menu del dia.</li><li>Seleccionamos el boton de enviar y confirmamos nuestro pedido en la parte de <b>Mi Pedido</b>.</li></ul>",
      show: false,
    },
    {
      question: "Como se actualiza un pedido",
      anwer:
        "Para actualizar un pedido debemos de realizar los siguientes pasas:<br><ul class='list-decimal ml-4'><li>Tenemos que tener un pedido reciente enviado, teniendo en cuanta esto podemos continuar.</li><li>Seleccionamos los caracteres a actualizar.</li><li>Seleccionamos el boton de <b>Actualizar pedido</b>.</li><li>Despues confirmamos nuestra pedido actualizado en la parte de <b>Mi pedido</b>.</li></ul>",
      show: false,
    },
    {
      question: "Como realizar un Feedback",
      anwer:
        "<ul class='list-decimal ml-4'><li>Para realizar un <b>FeedBack</b> debemos de seleccionar a donde se va a referenciar dicho <b>FeedBack</b>.</li><li>Describimos el <b>FeedBack</b> a tratar.</li><li>Como paso opcional agregamos una solucion a dicho <b>FeedBack</b>.</li><li>Seleccionamos enviar.</li></ul>",
      show: false,
    },
  ];
</script>

<svelte:head>
  <title>FAQ</title>
</svelte:head>
<Layout>
  <div slot="content">
    <div
      class="antialiased font-sans max-w-5xl mx-auto p-16 mt-4 rounded-3xl {$darkMode
        ? 'bg-gray-900'
        : 'bg-white'}"
    >
      <h2
        class="text-2xl font-semibold leading-tight mb-4 {$darkMode &&
          'text-gray-300'}"
      >
        Preguntas más frecuentes
      </h2>
      {#each questions as { question, anwer, show }}
        <h2
          on:click={() => {
            show = !show;
          }}
        >
          <button
            class="flex items-center justify-between p-5 w-full font-medium text-left border bg-indigo-400 rounded-lg my-1 text-gray-100 {$darkMode
              ? 'border-gray-700'
              : 'border-gray-200'}"
          >
            <span>¿{question}?</span>
            <i class="fas fa-angle-{show ? 'up' : 'down'}" />
          </button>
        </h2>
        {#if show}
          <div
            class="p-5 border rounded-md {$darkMode
              ? 'bg-gray-900 border-gray-700 text-gray-100'
              : 'bg-white border-gray-300'}"
            transition:fade={{ duration: 250 }}
          >
            <p
              class="mb-2"
              out:fly={{ duration: 300, y: -150 }}
              in:fly={{ duration: 300, y: -150 }}
            >
              {@html anwer}
            </p>
          </div>
        {/if}
      {/each}
    </div>
  </div>
</Layout>
