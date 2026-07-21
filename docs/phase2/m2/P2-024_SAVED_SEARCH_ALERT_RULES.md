# P2-024 — Saved Search Alert Rules

1. Match only when `alert_frequency != off` and prefs `savedSearchAlerts`.
2. Quiet hours suppress non-security mail.
3. Instant: enqueue on match job (future worker); daily/weekly digests deferred.
4. Cap: no more than 1 instant alert per search per hour (documented for worker).
