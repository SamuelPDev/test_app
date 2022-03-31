<script>
  import Pedidos from "./components/Pedidos.svelte";
  import Layout from "./components/Layout.svelte";
  import Notfound from "./NotFound.svelte";
  import Feedback from "./Feedback.svelte";
  import { Router } from "svelte-routing";
  import { fly } from "svelte/transition";
  import { Route } from "svelte-routing";
  import History from "./History.svelte";
  import FAQ from "./FAQ.svelte";
  import Me from "./Me.svelte";

  import { ref as dbRef, onValue } from "firebase/database";
  import { userInfo, transitionTime } from "../store.js";
  import { Database } from "../firebase/firebase.js";
  import { onMount } from "svelte";

  const UUID = localStorage.getItem("USER_UID");

  let url = "";

  onMount(() => {
    onValue(dbRef(Database, `users/${UUID}`), (snapshot) => {
      const data = snapshot.val() ?? {};

      userInfo.set(data);
    });
  });
</script>

<Router {url}>
  <Route path="me">
    <Me />
  </Route>

  <Route path="/">
    <Layout>
      <div
        in:fly={{ duration: transitionTime + 250, x: -500 }}
        out:fly={{ duration: transitionTime + 250, x: 500 }}
        slot="content"
        class="container mx-auto px-6 py-8"
      >
        <Pedidos />
      </div>
    </Layout>
  </Route>

  <Route path="feedback">
    <Feedback />
  </Route>

  <Route path="history">
    <History />
  </Route>

  <Route path="FAQ">
    <FAQ />
  </Route>

  <Route>
    <Notfound />
  </Route>
</Router>
