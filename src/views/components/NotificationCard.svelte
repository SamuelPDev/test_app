<script>
  export let description;
  export let name;
</script>

<span
  class="flex items-center px-4 py-3 text-gray-600 hover:text-white hover:bg-indigo-600 -mx-2"
>
  <p class="text-sm mx-2">
    <span class="font-bold">
      {name}
    </span>
    <br />
    <span class="font-semibold">
      {description}
    </span>
  </p>
</span>
