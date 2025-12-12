import { useContext } from "react";
import { AuthContext } from "./AuthHOC";

export function useAuth() {
  return useContext(AuthContext);
}
