import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { set, ref, get } from "firebase/database";
import { App, Database } from "./firebase";
import { navigate } from "svelte-routing";

export async function GoogleAuth() {
  try {
    const provider = new GoogleAuthProvider();
    const auth = getAuth(App);

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    const token = credential.accessToken;
    const user = result.user;

    if (token !== null && user !== null) {
      const docData = await get(ref(Database, `users/${user?.uid}`));
      localStorage.setItem("USER_UID", user.uid);
      localStorage.setItem("USER_TOKEN", token);

      if (!docData.exists()) {
        await set(ref(Database, `users/${user?.uid}`), {
          name: user?.displayName,
          email: user?.email,
          uid: user?.uid,
          imageUrl: user?.photoURL,
          imageName: "default",
        });
      }

      setTimeout(() => {
        navigate("/panel", { replace: true });
      }, 900);
    }
  } catch (error) {
    console.log(error);
  }
}
