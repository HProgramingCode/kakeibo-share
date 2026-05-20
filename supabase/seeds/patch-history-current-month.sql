-- 履歴タブ「今月表示」用 seed 追補（既存 DB 向け・再実行可）
-- 適用: npx supabase db query --linked --file supabase/seeds/patch-history-current-month.sql
-- ローカルは seed.sql 一式の db reset を推奨

-- サンプル共同家計: 2026-05 精算バッチ
INSERT INTO public.settlement_batches (id, group_id, target_month, status, created_by)
VALUES (
  'c1a2b3c4-d5e6-4789-a012-3456789abcde',
  '20000000-0000-4000-8000-000000000001',
  '2026-05',
  'confirmed',
  '10000000-0000-4000-8000-000000000001'
)
ON CONFLICT (group_id, target_month) DO NOTHING;

INSERT INTO public.expenses (
  id, group_id, payer_id, title, category, amount, expense_date, status, settlement_batch_id
)
VALUES (
  '30000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'GW共有ランチ（精算済）',
  '食費',
  3600,
  DATE '2026-05-01',
  'settled',
  'c1a2b3c4-d5e6-4789-a012-3456789abcde'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  settlement_batch_id = EXCLUDED.settlement_batch_id;

INSERT INTO public.expense_participants (expense_id, user_id)
VALUES
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001'),
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002'),
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003')
ON CONFLICT (expense_id, user_id) DO NOTHING;

INSERT INTO public.settlement_transfers (batch_id, from_user_id, to_user_id, amount)
SELECT v.batch_id, v.from_user_id, v.to_user_id, v.amount
FROM (VALUES
  ('c1a2b3c4-d5e6-4789-a012-3456789abcde'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 1200),
  ('c1a2b3c4-d5e6-4789-a012-3456789abcde'::uuid, '10000000-0000-4000-8000-000000000003'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 1200)
) AS v(batch_id, from_user_id, to_user_id, amount)
WHERE NOT EXISTS (
  SELECT 1 FROM public.settlement_transfers t
  WHERE t.batch_id = v.batch_id
    AND t.from_user_id = v.from_user_id
    AND t.to_user_id = v.to_user_id
    AND t.amount = v.amount
);

UPDATE public.expenses
SET category = '交通'
WHERE id = '31000000-0000-4000-8000-000000000002' AND category = '交通費';

-- ライフスタイル共有: 精算バッチ（2025-11, 2026-02〜05）
INSERT INTO public.settlement_batches (id, group_id, target_month, status, created_by)
VALUES
  ('f2111111-1111-4111-8111-111111111101', '20000000-0000-4000-8000-000000000002', '2025-11', 'confirmed', '10000000-0000-4000-8000-000000000003'),
  ('f2111111-1111-4111-8111-111111111102', '20000000-0000-4000-8000-000000000002', '2026-02', 'confirmed', '10000000-0000-4000-8000-000000000003'),
  ('f2111111-1111-4111-8111-111111111103', '20000000-0000-4000-8000-000000000002', '2026-03', 'confirmed', '10000000-0000-4000-8000-000000000003'),
  ('f2111111-1111-4111-8111-111111111104', '20000000-0000-4000-8000-000000000002', '2026-04', 'confirmed', '10000000-0000-4000-8000-000000000003'),
  ('f2111111-1111-4111-8111-111111111105', '20000000-0000-4000-8000-000000000002', '2026-05', 'confirmed', '10000000-0000-4000-8000-000000000003')
ON CONFLICT (group_id, target_month) DO NOTHING;

UPDATE public.expenses SET status = 'settled', settlement_batch_id = 'f2111111-1111-4111-8111-111111111101'
WHERE id = '32000000-0000-4000-8000-000000000009';

UPDATE public.expenses SET status = 'settled', settlement_batch_id = 'f2111111-1111-4111-8111-111111111102'
WHERE id = '32000000-0000-4000-8000-000000000005';

UPDATE public.expenses SET status = 'settled', settlement_batch_id = 'f2111111-1111-4111-8111-111111111103'
WHERE id = '32000000-0000-4000-8000-000000000006';

UPDATE public.expenses SET status = 'settled', settlement_batch_id = 'f2111111-1111-4111-8111-111111111104'
WHERE id = '32000000-0000-4000-8000-000000000007';

UPDATE public.expenses
SET
  status = 'settled',
  settlement_batch_id = 'f2111111-1111-4111-8111-111111111105',
  title = 'スターバックス（打ち合わせ・精算済）'
WHERE id = '32000000-0000-4000-8000-000000000001';

INSERT INTO public.settlement_transfers (batch_id, from_user_id, to_user_id, amount)
SELECT v.batch_id, v.from_user_id, v.to_user_id, v.amount
FROM (VALUES
  ('f2111111-1111-4111-8111-111111111101'::uuid, '10000000-0000-4000-8000-000000000006'::uuid, '10000000-0000-4000-8000-000000000005'::uuid, 750),
  ('f2111111-1111-4111-8111-111111111102'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, '10000000-0000-4000-8000-000000000003'::uuid, 1050),
  ('f2111111-1111-4111-8111-111111111103'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, 1000),
  ('f2111111-1111-4111-8111-111111111103'::uuid, '10000000-0000-4000-8000-000000000004'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, 1000),
  ('f2111111-1111-4111-8111-111111111104'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 1300),
  ('f2111111-1111-4111-8111-111111111105'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, '10000000-0000-4000-8000-000000000003'::uuid, 800),
  ('f2111111-1111-4111-8111-111111111105'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, '10000000-0000-4000-8000-000000000003'::uuid, 800),
  ('f2111111-1111-4111-8111-111111111105'::uuid, '10000000-0000-4000-8000-000000000004'::uuid, '10000000-0000-4000-8000-000000000003'::uuid, 800)
) AS v(batch_id, from_user_id, to_user_id, amount)
WHERE NOT EXISTS (
  SELECT 1 FROM public.settlement_transfers t
  WHERE t.batch_id = v.batch_id
    AND t.from_user_id = v.from_user_id
    AND t.to_user_id = v.to_user_id
    AND t.amount = v.amount
);
