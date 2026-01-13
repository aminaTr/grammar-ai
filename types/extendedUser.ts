import { User } from "@supabase/supabase-js";

export interface ExtendedUser extends User {
  plan: string;
  subscriptionEnd?: string | null;
  credits?: number;
}
