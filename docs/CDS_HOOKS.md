# CDS Hooks service

CDS Hooks 2.0. Discovery: `GET /cds-services` (public, by spec).

| Service id | Hook | Fires | Shows |
|---|---|---|---|
| `oncosaferx-order-sign` | `order-sign` | a new medication order is drafted | what the **new order** changes |
| `oncosaferx-patient-view` | `patient-view` | a chart is opened | **critical** findings about the current medication list only |

Feedback: `POST /cds-services/{id}/feedback` records accepted / overridden (with reason) against the rule and rule version.

## What order-sign checks
- **Major interactions** between a new order and a charted or co-ordered drug (curated list; moderate/minor are deliberately
  not interruptive, to limit alert fatigue). A pair already on the chart is not re-alerted unless a new order is part of it.
- **QT-prolongation and serotonin-syndrome load** added by the new order (`data/qt_serotonin.yaml`).
- **Drug-specific rules** for the ordered drug: DPYD (CPIC) and UGT1A1, capecitabine / oxaliplatin renal rules, anthracycline
  LVEF (`data/dosing_rules.yaml`). Generic protocol-level rules (ANC/platelets) are not run for single orders.
- **HLA contraindications** (abacavir, carbamazepine, allopurinol) from genomic Observations.
- **Missing or stale data** is shown as an info card ("Some patient data was not available"), never silently skipped.
  Labs older than their freshness window (see `docs/SMART_LAUNCH.md`) are not used.
- At most 4 finding cards, plus one summary card for the overflow.

Indicators: critical = avoid / hold / contraindicated; warning = major interaction or dose reduction; info = data gaps.
Every card carries `overrideReasons` (except info) and states the rule id and its status (**draft** until clinically reviewed).

## Security
Every service and feedback call must carry the EHR's signed JWT (`Authorization: Bearer`): signature checked against the
issuer's JWKS, `iss` must be a configured trusted issuer, `aud` must equal the exact endpoint URL, `exp`/`iat` checked,
`jti` rejected on replay (per instance; a shared store is needed for strict replay protection across serverless instances).
A `jku` header can only repeat the configured JWKS URL. Unsigned requests are accepted only when `NODE_ENV` is `development`
or `test` (for the public CDS Hooks sandbox); in production the service returns 503 until configured.

```
CDS_TRUSTED_ISSUERS={"https://ehr.example.com":{"jwksUri":"https://ehr.example.com/.well-known/jwks.json"}}
CDS_PUBLIC_BASE_URL=https://api.example.com
```

## Card <-> rule linkage (no server state)
The first 60 bits of each card `uuid` are a hash of `<ruleId>@<version>`; the rest is random. On feedback the prefix is
resolved against an index of every rule that can fire (dosing rules, QT/serotonin rules, HLA rules, 574 interaction pairs).
Feedback is stored in `alert_overrides` (migration `007_alert_overrides_ehr_feedback.sql`): `source = cds-hooks`, the verified
`ehr_issuer`, `card_uuid`, rule id + version, outcome and reason. No patient identifier is stored.
`GET /api/overrides/summary` (admin) then shows override rates per rule version. Apply migrations 006 and 007 first
(Database Migrations workflow, target `overrides`); without a database, feedback returns 5xx rather than dropping records.

## Limits
- No `prefetch` fallback: if the EHR does not send prefetch data the service says so in a card rather than calling the FHIR server.
- Class-level interaction rows (e.g. "strong CYP3A4 inhibitors") do not match drugs by name (no class membership data yet).
- Orders are matched by name and RxNorm text; brand names beyond a short alias list may be missed.
- Only `MedicationRequest` draft orders are analysed. Cards offer no `suggestions` (no automated order changes).
- Rules and lists are draft pending pharmacist/oncologist review (and a CredibleMeds license for QT tiers).
