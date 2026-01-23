export type AuthAdapter = {
  signIn: (data: Record<string, any>) => Promise<void>;
  signUp?: (data: Record<string, any>) => Promise<void>;
  signOut?: () => Promise<void>;
  getSession?: () => Promise<Record<string, any> | null>;
};

export type UseAuthOptions = {
  adapter?: AuthAdapter;
};
