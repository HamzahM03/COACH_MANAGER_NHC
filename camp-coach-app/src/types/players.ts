export type Player = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  notes: string | null;
  created_at: string
};

export type PlayerPackage = {
  id: string
  sessions_total: number
  sessions_used: number
  price_cents: number
  purchased_at: string
}

