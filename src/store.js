import { ref as dbRef, onValue } from "firebase/database";
import { Database } from "./firebase/firebase.js";
import { writable } from "svelte/store";
import { Admin } from "./utils.js";

export const localStorage = window.localStorage;

const isLogged =
  !!localStorage.getItem("USER_UID") && !!localStorage.getItem("USER_TOKEN");

export const logged = writable(isLogged);

export const state = writable({});

onValue(dbRef(Database, "state"), (snapshot) => {
  const stateShot = snapshot.val();

  state.set(stateShot);
});

export const userInfo = writable({});

export const transitionTime = 320;

const store = writable(
  !!window.localStorage.getItem("dark_mode.pedidos_app") && !Admin()
);

export const darkMode = {
  subscribe: store.subscribe,
  set(data) {
    window.localStorage.setItem("dark_mode.pedidos_app", data.toString());
    store.set(!!window.localStorage.getItem("dark_mode.pedidos_app"));
  },
};
