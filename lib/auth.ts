import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

export async function signin(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}
export async function register(email: string, password: string) {
  return await createUserWithEmailAndPassword(auth, email, password);
}
export async function signOutUser() {
  return await signOut(auth);
}
