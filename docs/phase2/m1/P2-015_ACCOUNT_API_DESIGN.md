# P2-015 — Account API / Action Design

| Action | AuthZ |
| --- | --- |
| `signInWithPassword` / `signInWithOtp` / `signOut` | public / self |
| `ensureCustomerProfile` | self |
| `list/upsert/deleteSavedItem` | self only (`user_id = auth.uid()`) |
| `list/create/update/deleteSavedSearch` | self only |
| `migrateDeviceState` | self; opt-in |

Admin users are excluded from customer session helper.
