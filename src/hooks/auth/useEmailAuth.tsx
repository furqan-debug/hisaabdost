
import { useSignIn } from "./useSignIn";
import { useSignUp } from "./useSignUp";

export const useEmailAuth = () => {
  const { signInWithEmail } = useSignIn();
  const { signUp } = useSignUp();

  return {
    signInWithEmail,
    signUp,
  };
};
