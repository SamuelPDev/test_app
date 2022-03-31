<script>
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import Notfound from "./views/NotFound.svelte";
  import Signup from "./views/Signup.svelte";
  import Forgot from "./views/Forgot.svelte";
  import { navigate } from "svelte-routing";
  import { fade } from "svelte/transition";
  import Login from "./views/Login.svelte";
  import { Router } from "svelte-routing";
  import { Route } from "svelte-routing";
  import Home from "./views/Home.svelte";
  import { logged } from "./store.js";
  import Me from "./views/Me.svelte";

  let url = "";

  const currentRoute = window.location.pathname;

  const excludeRoutes = ["/panel", "/"];
  const panelRedirects = ["/login"];

  const redirectToPanel =
    ($logged && panelRedirects.includes(currentRoute)) ||
    ($logged && currentRoute === "/");

  if (redirectToPanel) {
    navigate("/panel", { replacer: true });
  }

  if (!$logged && excludeRoutes.includes(currentRoute)) {
    navigate("/login", { replacer: true });
  }
</script>

<main transition:fade>
  <SvelteToast options={{}} />

  <Router {url}>
    <Route path="login">
      <Login />
    </Route>

    <Route path="panel/*">
      <Home />
    </Route>

    <Route path="signup">
      <Signup />
    </Route>

    <Route path="forgot">
      <Forgot />
    </Route>

    <Route path="me">
      <Me />
    </Route>

    <Route>
      <Notfound />
    </Route>
  </Router>
</main>

<style>
  :global(*) {
    font-family: "Poppins", sans-serif;
  }
</style>
