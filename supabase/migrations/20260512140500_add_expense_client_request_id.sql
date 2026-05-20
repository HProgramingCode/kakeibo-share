ALTER TABLE public.expenses
  ADD COLUMN client_request_id uuid;

CREATE UNIQUE INDEX expenses_group_client_request_id_key
  ON public.expenses (group_id, client_request_id)
  WHERE client_request_id IS NOT NULL;
