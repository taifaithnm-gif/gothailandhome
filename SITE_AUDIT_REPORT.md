# SITE_AUDIT_REPORT

**Milestone:** Phase 11 — Google Readiness  
**Date:** 2026-07-16  
**Crawl set:** 640 URLs · concurrency 14 · property detail cap 250 (EN)

## 1. Robots

```
User-Agent: *
Allow: /
Disallow: /admin
Disallow: /admin/

Host: www.gothailandhome.com
Sitemap: https://www.gothailandhome.com/sitemap.xml
```

| Check | Result |
|-------|--------|
| HTTP 200 | PASS |
| Allow / | PASS |
| Disallow /admin | PASS |
| Sitemap pointer | PASS |
| Host | PASS |

## 2. Sitemap XML statistics

| Metric | Value |
|--------|------:|
| HTTP status | 200 |
| Bytes | 745730 |
| `<url>` count | 3456 |
| Unique locs | 3456 |
| Duplicate locs | 0 |
| Invalid locs | 0 |
| en / zh / th | 1152 / 1152 / 1152 |

### By path kind (all locales)

| Kind | Count |
|------|------:|
| properties | 3003 |
| districts | 168 |
| projects | 153 |
| developers | 72 |
| cities | 21 |
| knowledge | 9 |
| partners | 6 |
| home | 3 |
| buy | 3 |
| rent | 3 |
| about | 3 |
| contact | 3 |
| marketplace | 3 |
| find-my-home | 3 |
| list-your-property | 3 |

## 3. Crawl report

| Metric | Value |
|--------|------:|
| Fetched | 640 |
| HTTP 200 | 640 |
| HTTP non-200 / error | 0 |
| Mean TTFB-ish (ms) | 1637 |
| Canonical OK | 640 |
| Hreflang OK | 640 |
| JSON-LD present | 585 |
| Missing meta description | 42 |

### Non-200 / fetch errors (sample)

- None

## 4. Canonical

- Failures: **0**
- None in crawl set

## 5. Hreflang

- Failures: **0**
- None in crawl set

## 6. Orphan pages

### Linked from crawled pages but not in sitemap

- https://www.gothailandhome.com/en/properties/the-livin-ramkhamhaeng-rent-propertyhub-5329310
- https://www.gothailandhome.com/en/properties/the-livin-ramkhamhaeng-rent-propertyhub-5886141
- https://www.gothailandhome.com/th/properties/the-livin-ramkhamhaeng-rent-propertyhub-5329310
- https://www.gothailandhome.com/th/properties/the-livin-ramkhamhaeng-rent-propertyhub-5886141
- https://www.gothailandhome.com/zh/properties/the-livin-ramkhamhaeng-rent-propertyhub-5329310
- https://www.gothailandhome.com/zh/properties/the-livin-ramkhamhaeng-rent-propertyhub-5886141

### In sitemap but not discovered via hub internal links (informational; not proof of orphan)

Count sample: **0** (of 0 candidates among EN non-property URLs)

- None

## 7. Duplicate titles (crawled set)

Groups: **71**

- **1 Bedroom Condo for rent at XT Phayathai \| GoThailandHome** × 9
  - https://www.gothailandhome.com/en/properties/xt-phayathai-rent-dotproperty-50f0c83b9115-5c6e-f962-8d08-9fafc089
  - https://www.gothailandhome.com/en/properties/xt-phayathai-rent-dotproperty-01ab9bb85d4c-4221-7382-297a-1528b089
  - https://www.gothailandhome.com/en/properties/xt-phayathai-rent-dotproperty-4f4c133ea105-ea60-1982-6bf1-d0afc089
  - https://www.gothailandhome.com/zh/properties/xt-phayathai-rent-dotproperty-50f0c83b9115-5c6e-f962-8d08-9fafc089
  - https://www.gothailandhome.com/zh/properties/xt-phayathai-rent-dotproperty-01ab9bb85d4c-4221-7382-297a-1528b089
- **1 Bedroom Condo for rent at XT Huaikhwang \| GoThailandHome** × 9
  - https://www.gothailandhome.com/en/properties/xt-huai-khwang-rent-dotproperty-066579177c17-4591-efe2-dde5-4d74a089
  - https://www.gothailandhome.com/en/properties/xt-huai-khwang-rent-dotproperty-f5bd078ba745-22ef-a9e2-a4f8-48c4a089
  - https://www.gothailandhome.com/en/properties/xt-huai-khwang-rent-dotproperty-2446dd24f5b1-690f-96a2-525e-18c4a089
  - https://www.gothailandhome.com/zh/properties/xt-huai-khwang-rent-dotproperty-066579177c17-4591-efe2-dde5-4d74a089
  - https://www.gothailandhome.com/zh/properties/xt-huai-khwang-rent-dotproperty-f5bd078ba745-22ef-a9e2-a4f8-48c4a089
- **2 Bedroom Condo for rent at The Room Sukhumvit 62 \| GoThailandHome** × 9
  - https://www.gothailandhome.com/en/properties/the-room-sukhumvit-62-rent-dotproperty-385f504020ca-12ae-db52-65ea-a685a089
  - https://www.gothailandhome.com/en/properties/the-room-sukhumvit-62-rent-dotproperty-2a9b2329e48a-48df-03f2-beac-1065a089
  - https://www.gothailandhome.com/en/properties/the-room-sukhumvit-62-rent-dotproperty-aa9d376fa782-a421-8c32-28c4-5d74a089
  - https://www.gothailandhome.com/zh/properties/the-room-sukhumvit-62-rent-dotproperty-385f504020ca-12ae-db52-65ea-a685a089
  - https://www.gothailandhome.com/zh/properties/the-room-sukhumvit-62-rent-dotproperty-2a9b2329e48a-48df-03f2-beac-1065a089
- **1 Bedroom Condo for rent at The Lofts Silom \| GoThailandHome** × 9
  - https://www.gothailandhome.com/en/properties/the-lofts-silom-rent-dotproperty-e1829c50e92c-eb4e-2792-6dbd-8c55b089
  - https://www.gothailandhome.com/en/properties/the-lofts-silom-rent-dotproperty-57be3eafd7ed-a381-4b26-51ca-8f6a849b
  - https://www.gothailandhome.com/en/properties/the-lofts-silom-rent-dotproperty-c82ccf9ae59b-06b0-6172-e13a-d754a089
  - https://www.gothailandhome.com/zh/properties/the-lofts-silom-rent-dotproperty-e1829c50e92c-eb4e-2792-6dbd-8c55b089
  - https://www.gothailandhome.com/zh/properties/the-lofts-silom-rent-dotproperty-57be3eafd7ed-a381-4b26-51ca-8f6a849b
- **1 Bedroom Condo for rent at The Line sukhumvit 101 \| GoThailandHome** × 9
  - https://www.gothailandhome.com/en/properties/the-line-sukhumvit-101-rent-dotproperty-5efaff91cc0d-157e-60d2-0975-4814a089
  - https://www.gothailandhome.com/en/properties/the-line-sukhumvit-101-rent-dotproperty-c20ce07c83dc-e390-9a32-cef0-2514a089
  - https://www.gothailandhome.com/en/properties/the-line-sukhumvit-101-rent-dotproperty-f1cbab16828f-a85e-5be2-ce96-4814a089
  - https://www.gothailandhome.com/zh/properties/the-line-sukhumvit-101-rent-dotproperty-5efaff91cc0d-157e-60d2-0975-4814a089
  - https://www.gothailandhome.com/zh/properties/the-line-sukhumvit-101-rent-dotproperty-c20ce07c83dc-e390-9a32-cef0-2514a089
- **1 Bedroom Condo for rent at The ESSE Sukhumvit 36 \| GoThailandHome** × 9
  - https://www.gothailandhome.com/en/properties/the-esse-sukhumvit-36-rent-dotproperty-d81f679e3da3-d42f-cb96-eefa-194530d0
  - https://www.gothailandhome.com/en/properties/the-esse-sukhumvit-36-rent-dotproperty-e96644359438-188e-d472-f3b5-c104a089
  - https://www.gothailandhome.com/en/properties/the-esse-sukhumvit-36-rent-dotproperty-e0dce233c60b-4541-f892-dacd-25eea189
  - https://www.gothailandhome.com/zh/properties/the-esse-sukhumvit-36-rent-dotproperty-d81f679e3da3-d42f-cb96-eefa-194530d0
  - https://www.gothailandhome.com/zh/properties/the-esse-sukhumvit-36-rent-dotproperty-e96644359438-188e-d472-f3b5-c104a089
- **1 Bedroom Condo for rent at The ESSE Asoke \| GoThailandHome** × 9
  - https://www.gothailandhome.com/en/properties/the-esse-asoke-rent-dotproperty-a7e3cf7d4bd1-fe61-fa52-17d9-0b24a089
  - https://www.gothailandhome.com/en/properties/the-esse-asoke-rent-dotproperty-3d4fa654cf61-147f-d072-6db8-68c4a089
  - https://www.gothailandhome.com/en/properties/the-esse-asoke-rent-dotproperty-4c9b55e2162e-82e0-c6f2-442b-58c4a089
  - https://www.gothailandhome.com/zh/properties/the-esse-asoke-rent-dotproperty-a7e3cf7d4bd1-fe61-fa52-17d9-0b24a089
  - https://www.gothailandhome.com/zh/properties/the-esse-asoke-rent-dotproperty-3d4fa654cf61-147f-d072-6db8-68c4a089
- **1 Bedroom Condo for rent at The Base Sukhumvit 77 \| GoThailandHome** × 9
  - https://www.gothailandhome.com/en/properties/the-base-sukhumvit-77-rent-dotproperty-c1b98d99d9cb-f261-f972-f282-add5a089
  - https://www.gothailandhome.com/en/properties/the-base-sukhumvit-77-rent-dotproperty-a46c5cd6b2ba-c9de-e172-6e57-ebe5a089
  - https://www.gothailandhome.com/en/properties/the-base-sukhumvit-77-rent-dotproperty-7360c6b0fbb0-db4e-ce62-9f07-18d8a089
  - https://www.gothailandhome.com/zh/properties/the-base-sukhumvit-77-rent-dotproperty-c1b98d99d9cb-f261-f972-f282-add5a089
  - https://www.gothailandhome.com/zh/properties/the-base-sukhumvit-77-rent-dotproperty-a46c5cd6b2ba-c9de-e172-6e57-ebe5a089
- **4 Bedroom Condo for rent at Whizdom Essence \| GoThailandHome** × 6
  - https://www.gothailandhome.com/en/properties/whizdom-essence-rent-dotproperty-4ea006e7c928-9d21-9652-54aa-8194a089
  - https://www.gothailandhome.com/en/properties/whizdom-essence-rent-dotproperty-d436fd1a8b88-4f11-4d72-6ff5-9295a089
  - https://www.gothailandhome.com/zh/properties/whizdom-essence-rent-dotproperty-4ea006e7c928-9d21-9652-54aa-8194a089
  - https://www.gothailandhome.com/zh/properties/whizdom-essence-rent-dotproperty-d436fd1a8b88-4f11-4d72-6ff5-9295a089
  - https://www.gothailandhome.com/th/properties/whizdom-essence-rent-dotproperty-4ea006e7c928-9d21-9652-54aa-8194a089
- **2 Bedroom Condo for rent at The Room Sathorn-Taksin \| GoThailandHome** × 6
  - https://www.gothailandhome.com/en/properties/the-room-sathorn-taksin-rent-dotproperty-1e8e914482d8-b35f-9142-8490-e4e5a089
  - https://www.gothailandhome.com/en/properties/the-room-sathorn-taksin-rent-dotproperty-10096efc48ca-a4af-2e52-2d8d-28c4a089
  - https://www.gothailandhome.com/zh/properties/the-room-sathorn-taksin-rent-dotproperty-1e8e914482d8-b35f-9142-8490-e4e5a089
  - https://www.gothailandhome.com/zh/properties/the-room-sathorn-taksin-rent-dotproperty-10096efc48ca-a4af-2e52-2d8d-28c4a089
  - https://www.gothailandhome.com/th/properties/the-room-sathorn-taksin-rent-dotproperty-1e8e914482d8-b35f-9142-8490-e4e5a089
- **2 Bedroom Condo for rent at The Privacy Rama 9 \| GoThailandHome** × 6
  - https://www.gothailandhome.com/en/properties/the-privacy-rama-9-rent-dotproperty-8d7401c1e59f-a97f-7432-7eb2-3789a089
  - https://www.gothailandhome.com/en/properties/the-privacy-rama-9-rent-dotproperty-b8693e9029f9-7c21-06d2-ae5e-9fc5a089
  - https://www.gothailandhome.com/zh/properties/the-privacy-rama-9-rent-dotproperty-8d7401c1e59f-a97f-7432-7eb2-3789a089
  - https://www.gothailandhome.com/zh/properties/the-privacy-rama-9-rent-dotproperty-b8693e9029f9-7c21-06d2-ae5e-9fc5a089
  - https://www.gothailandhome.com/th/properties/the-privacy-rama-9-rent-dotproperty-8d7401c1e59f-a97f-7432-7eb2-3789a089
- **1 Bedroom Condo for rent at The LIVIN Ramkhamhaeng \| GoThailandHome** × 6
  - https://www.gothailandhome.com/en/properties/the-livin-ramkhamhaeng-rent-dotproperty-172312255ad0-58ce-b032-c4d5-2b78a089
  - https://www.gothailandhome.com/en/properties/the-livin-ramkhamhaeng-rent-dotproperty-b797c106c689-42e1-5062-7206-d08ac089
  - https://www.gothailandhome.com/zh/properties/the-livin-ramkhamhaeng-rent-dotproperty-172312255ad0-58ce-b032-c4d5-2b78a089
  - https://www.gothailandhome.com/zh/properties/the-livin-ramkhamhaeng-rent-dotproperty-b797c106c689-42e1-5062-7206-d08ac089
  - https://www.gothailandhome.com/th/properties/the-livin-ramkhamhaeng-rent-dotproperty-172312255ad0-58ce-b032-c4d5-2b78a089
- **2 Bedroom Condo for rent at Supalai Veranda Rama 9 \| GoThailandHome** × 6
  - https://www.gothailandhome.com/en/properties/supalai-veranda-rama-9-rent-dotproperty-81c550cc6850-5580-fe22-ce08-9cf4a089
  - https://www.gothailandhome.com/en/properties/supalai-veranda-rama-9-rent-dotproperty-e1c63a02a170-158f-e062-d649-9b93a089
  - https://www.gothailandhome.com/zh/properties/supalai-veranda-rama-9-rent-dotproperty-81c550cc6850-5580-fe22-ce08-9cf4a089
  - https://www.gothailandhome.com/zh/properties/supalai-veranda-rama-9-rent-dotproperty-e1c63a02a170-158f-e062-d649-9b93a089
  - https://www.gothailandhome.com/th/properties/supalai-veranda-rama-9-rent-dotproperty-81c550cc6850-5580-fe22-ce08-9cf4a089
- **💙 ห้องสวยวิวสระ Kave Town Space \| แต่งครบ พร้อมอยู่ ใกล้ ม.กรุงเทพ 🔥 \| GoThailandHome** × 3
  - https://www.gothailandhome.com/en/properties/kave-town-space-rent-livinginsider-2615264
  - https://www.gothailandhome.com/zh/properties/kave-town-space-rent-livinginsider-2615264
  - https://www.gothailandhome.com/th/properties/kave-town-space-rent-livinginsider-2615264
- **2 Bedroom Condo for rent at Whizdom Essence \| GoThailandHome** × 3
  - https://www.gothailandhome.com/en/properties/whizdom-essence-rent-dotproperty-76890d27b2b6-c9b1-0bf2-9dba-98c4a089
  - https://www.gothailandhome.com/zh/properties/whizdom-essence-rent-dotproperty-76890d27b2b6-c9b1-0bf2-9dba-98c4a089
  - https://www.gothailandhome.com/th/properties/whizdom-essence-rent-dotproperty-76890d27b2b6-c9b1-0bf2-9dba-98c4a089
- **1 Bedroom Condo for rent at The Room Sathorn-Taksin \| GoThailandHome** × 3
  - https://www.gothailandhome.com/en/properties/the-room-sathorn-taksin-rent-dotproperty-ba133f6c5bf9-2ad1-d0b2-599e-0956a089
  - https://www.gothailandhome.com/zh/properties/the-room-sathorn-taksin-rent-dotproperty-ba133f6c5bf9-2ad1-d0b2-599e-0956a089
  - https://www.gothailandhome.com/th/properties/the-room-sathorn-taksin-rent-dotproperty-ba133f6c5bf9-2ad1-d0b2-599e-0956a089
- **1 Bedroom Condo for rent at The Privacy Rama 9 \| GoThailandHome** × 3
  - https://www.gothailandhome.com/en/properties/the-privacy-rama-9-rent-dotproperty-89a58fb5d124-8311-6372-a1de-b67c5089
  - https://www.gothailandhome.com/zh/properties/the-privacy-rama-9-rent-dotproperty-89a58fb5d124-8311-6372-a1de-b67c5089
  - https://www.gothailandhome.com/th/properties/the-privacy-rama-9-rent-dotproperty-89a58fb5d124-8311-6372-a1de-b67c5089
- **2 Bedroom Condo for rent at The LIVIN Ramkhamhaeng \| GoThailandHome** × 3
  - https://www.gothailandhome.com/en/properties/the-livin-ramkhamhaeng-rent-dotproperty-180897836d4b-10df-0d52-f88a-c0a8a089
  - https://www.gothailandhome.com/zh/properties/the-livin-ramkhamhaeng-rent-dotproperty-180897836d4b-10df-0d52-f88a-c0a8a089
  - https://www.gothailandhome.com/th/properties/the-livin-ramkhamhaeng-rent-dotproperty-180897836d4b-10df-0d52-f88a-c0a8a089
- **1 Bedroom Condo for rent at Supalai Veranda Rama 9 \| GoThailandHome** × 3
  - https://www.gothailandhome.com/en/properties/supalai-veranda-rama-9-rent-dotproperty-bdb0759d1ff8-07b0-d542-30aa-a3c4a089
  - https://www.gothailandhome.com/zh/properties/supalai-veranda-rama-9-rent-dotproperty-bdb0759d1ff8-07b0-d542-30aa-a3c4a089
  - https://www.gothailandhome.com/th/properties/supalai-veranda-rama-9-rent-dotproperty-bdb0759d1ff8-07b0-d542-30aa-a3c4a089
- **1 Bedroom Condo for rent at Supalai Oriental Sukhumvit 39 \| GoThailandHome** × 3
  - https://www.gothailandhome.com/en/properties/supalai-oriental-sukhumvit-39-rent-dotproperty-9a0874f96ca7-4f8e-8d32-bce5-2514a
  - https://www.gothailandhome.com/en/properties/supalai-oriental-sukhumvit-39-rent-dotproperty-a5b367800232-080f-8ec2-4a45-cb24a
  - https://www.gothailandhome.com/en/properties/supalai-oriental-sukhumvit-39-rent-dotproperty-6cad9fd9ac53-f22f-7d02-170b-58c4a
- **1 Bedroom Condo for rent at RHYTHM Ekkamai \| GoThailandHome** × 3
  - https://www.gothailandhome.com/en/properties/rhythm-ekkamai-rent-dotproperty-8b5c8dc066bd-cce0-0d62-0025-8fc5a089
  - https://www.gothailandhome.com/en/properties/rhythm-ekkamai-rent-dotproperty-a371193b24ef-0cae-6a72-29a9-c0c5a089
  - https://www.gothailandhome.com/en/properties/rhythm-ekkamai-rent-dotproperty-5ec1ba25ee09-9730-1682-fec8-2814a089
- **1 Bedroom Condo for rent at Noble Around Ari \| GoThailandHome** × 3
  - https://www.gothailandhome.com/en/properties/noble-around-ari-rent-dotproperty-2c57d71c3807-f5bf-8112-a395-48c4a089
  - https://www.gothailandhome.com/en/properties/noble-around-ari-rent-dotproperty-7bfc46f17dbc-a77f-4dd2-f4cf-18c4a089
  - https://www.gothailandhome.com/en/properties/noble-around-ari-rent-dotproperty-e4cb7084a121-1700-0dd2-8031-28c4a089
- **1 Bedroom Condo for rent at The Niche Pride Thonglor-Phetchaburi \| GoThailandHome** × 3
  - https://www.gothailandhome.com/en/properties/niche-pride-thonglor-phetchaburi-rent-dotproperty-b5e734de1755-0310-bf62-d42e-18
  - https://www.gothailandhome.com/en/properties/niche-pride-thonglor-phetchaburi-rent-dotproperty-bcea60fddb79-e551-4b32-d515-0b
  - https://www.gothailandhome.com/en/properties/niche-pride-thonglor-phetchaburi-rent-dotproperty-ca4cc022962e-3010-f512-4b58-db
- **1 Bedroom Condo for rent at Life One Wireless \| GoThailandHome** × 3
  - https://www.gothailandhome.com/en/properties/life-one-wireless-rent-dotproperty-9acd7ff1a6d8-72ef-d6c2-2cb4-58c4a089
  - https://www.gothailandhome.com/en/properties/life-one-wireless-rent-dotproperty-6b748c8a795d-c9b1-1722-3607-98c4a089
  - https://www.gothailandhome.com/en/properties/life-one-wireless-rent-dotproperty-41ff5d59bc6f-22f1-1f92-7796-fbe0b089
- **1 Bedroom Condo for rent at Life Ladprao \| GoThailandHome** × 3
  - https://www.gothailandhome.com/en/properties/life-ladprao-rent-dotproperty-525db81d82ec-6031-6282-e969-98c4a089
  - https://www.gothailandhome.com/en/properties/life-ladprao-rent-dotproperty-8af48e3966a4-8dd0-45f2-8318-98c4a089
  - https://www.gothailandhome.com/en/properties/life-ladprao-rent-dotproperty-8cc17742bd96-50d1-d9d6-b923-28fac577
- **1 Bedroom Condo for rent at Life Asoke Rama 9 \| GoThailandHome** × 3
  - https://www.gothailandhome.com/en/properties/life-asoke-rama-9-rent-dotproperty-68efc322b459-ca1e-9922-d495-b3c4a089
  - https://www.gothailandhome.com/en/properties/life-asoke-rama-9-rent-dotproperty-23912322a2d0-5f7e-3402-1349-38c4a089
  - https://www.gothailandhome.com/en/properties/life-asoke-rama-9-rent-dotproperty-4ab078254a0f-6dc0-fb72-9f22-ddab6089
- **1 Bedroom Condo for rent at Knightsbridge Prime Sathorn \| GoThailandHome** × 3
  - https://www.gothailandhome.com/en/properties/knightsbridge-prime-sathorn-rent-dotproperty-7200ac15a00e-21b0-03c2-e2f4-58c4a08
  - https://www.gothailandhome.com/en/properties/knightsbridge-prime-sathorn-rent-dotproperty-e2ed6771355a-39d0-7372-0a61-48c4a08
  - https://www.gothailandhome.com/en/properties/knightsbridge-prime-sathorn-rent-dotproperty-07eebf86d7ab-63df-d462-5bec-5cf4a08
- **1 Bedroom Condo for rent at Kave Town Space \| GoThailandHome** × 3
  - https://www.gothailandhome.com/en/properties/kave-town-space-rent-dotproperty-8f2423198946-8c7e-7362-fdf4-e045b089
  - https://www.gothailandhome.com/en/properties/kave-town-space-rent-dotproperty-b6544710dbcc-dfb1-f4b2-df8a-9b2cb089
  - https://www.gothailandhome.com/en/properties/kave-town-space-rent-dotproperty-6c26d560c5a4-6bc1-de72-7084-2b93a089
- **1 Bedroom Condo for rent at Ideo Q Sukhumvit 36 \| GoThailandHome** × 3
  - https://www.gothailandhome.com/en/properties/ideo-q-sukhumvit-36-rent-dotproperty-031325c3047e-ffce-0862-0f78-38c4a089
  - https://www.gothailandhome.com/en/properties/ideo-q-sukhumvit-36-rent-dotproperty-167158c6d211-81e1-1972-a679-48c4a089
  - https://www.gothailandhome.com/en/properties/ideo-q-sukhumvit-36-rent-dotproperty-2809ada3c5d3-1ece-0952-8cfa-dd54a089
- **1 Bedroom Condo for rent at Casa Condo Asoke-Dindaeng \| GoThailandHome** × 3
  - https://www.gothailandhome.com/en/properties/casa-condo-asoke-dindaeng-rent-dotproperty-1300ed05751a-9ce0-da72-34e0-b77cd089
  - https://www.gothailandhome.com/en/properties/casa-condo-asoke-dindaeng-rent-dotproperty-0302440ad595-89a1-73b2-c29a-720a3089
  - https://www.gothailandhome.com/en/properties/casa-condo-asoke-dindaeng-rent-dotproperty-96f431e779d0-b89f-e672-cc5b-830a3089

## 8. Duplicate descriptions (crawled set)

Groups: **0**

- None

## 9. Missing images

Pages with **zero `<img>`** and OG default/placeholder only: **200**

- https://www.gothailandhome.com/en (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/buy (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/rent (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/properties (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/projects (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/cities (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/developers (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/about (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/marketplace (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/find-my-home (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/list-your-property (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/partners/developers (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/partners/agencies (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/knowledge (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/knowledge/glossary (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/knowledge/bangkok-districts (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/cities/bangkok (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/cities/pattaya (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/cities/phuket (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/cities/chiang-mai (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/cities/rayong (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/cities/hua-hin (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/districts/phra-nakhon (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/districts/central-pattaya (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/districts/kathu (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/districts/mueang-chiang-mai (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/districts/mueang-rayong (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/districts/hua-hin-town (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/districts/hua-mak (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/districts/dusit (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/districts/nong-chok (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/districts/bang-rak (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/districts/bang-khen (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/districts/bang-kapi (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/districts/pathum-wan (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/districts/pom-prap-sattru-phai (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/districts/phra-khanong (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/districts/min-buri (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/districts/lat-krabang (og=https://www.gothailandhome.com/og/default.svg)
- https://www.gothailandhome.com/en/districts/yan-nawa (og=https://www.gothailandhome.com/og/default.svg)

## 10. Broken internal links

Checked unique internal targets from crawl: **400**  
Broken: **0**

- None

## 11. Static code checks

- PASS `file_schema` — src/lib/seo/schema.ts
- PASS `file_jsonLd` — src/components/seo/json-ld.tsx
- PASS `file_metadata` — src/lib/i18n/metadata.ts
- PASS `file_robots` — src/app/robots.ts
- PASS `file_sitemap` — src/app/sitemap.ts
- PASS `file_admin` — src/app/admin/layout.tsx
- PASS `export_organizationSchema` — organizationSchema
- PASS `export_websiteSchema` — websiteSchema
- PASS `export_listingSchema` — listingSchema
- PASS `export_projectSchema` — projectSchema
- PASS `export_developerSchema` — developerSchema
- PASS `export_districtSchema` — districtSchema
- PASS `export_breadcrumbListSchema` — breadcrumbListSchema
- PASS `export_collectionPageSchema` — collectionPageSchema
- PASS `export_projectFaqSchema` — projectFaqSchema
- PASS `hreflang_languages_map` — buildPageMetadata alternates
- PASS `robots_disallow_admin` — src/app/robots.ts
- PASS `admin_noindex` — admin layout metadata
- PASS `sitemap_static_/find-my-home` — /find-my-home
- PASS `sitemap_static_/list-your-property` — /list-your-property
- PASS `sitemap_static_/partners/developers` — /partners/developers
- PASS `sitemap_static_/partners/agencies` — /partners/agencies
- PASS `sitemap_static_/marketplace` — /marketplace
- PASS `sitemap_static_/buy` — /buy
- PASS `sitemap_static_/rent` — /rent
- PASS `sitemap_static_/knowledge` — /knowledge

## Limits

- Property detail crawl capped at **250** EN URLs (+ smaller zh/th samples); duplicate title/description findings for listings are therefore **partial**.
- Rich Results validated structurally, not via Google’s live testing API.
- Orphan “not linked from hubs” is approximate (hub-link discovery only).
