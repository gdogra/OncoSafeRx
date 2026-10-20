# SMART on FHIR launch

OncoSafeRx is a SMART **app**. The EHR is the authorization and FHIR server. EHR launch and standalone
launch are supported (authorization-code flow with PKCE S256, state, nonce, `aud`, id_token verification).

| Route | Purpose |
|---|---|
| `GET /smart/launch?iss=&launch=` | Register as the app's **launch URL**. Discovers the EHR, redirects to its authorize endpoint. |
| `GET /smart/callback` | Register as the **redirect URI**. Exchanges the code, verifies the id_token, sets the session. |
| `GET /api/smart/context` | Who and what the session is bound to (never returns the token). |
| `GET /api/smart/patient` | Reads Patient / Observation / MedicationRequest and returns inputs for `POST /api/dosing/adjust`. |
| `POST /api/smart/logout` | Clears the session. |

## Configuration
See the `SMART_*` block in `.env.example`. In production the server refuses to launch (503) until
`SMART_CLIENT_ID`, `SMART_SESSION_SECRET`, `SMART_REDIRECT_URI` and `SMART_ALLOWED_ISS` are set.

## Security notes
- `iss` is attacker-controlled; it is checked against `SMART_ALLOWED_ISS` (https only) before any request is made.
- No server memory: the launch transaction and the session are AES-256-GCM sealed, HttpOnly, SameSite=Lax cookies
  (the label is bound as AAD, so a transaction cookie cannot be replayed as a session). The access token never reaches
  browser JavaScript. The session lasts at most `SMART_SESSION_MAX_SECONDS` (default 1 hour) and is not refreshed:
  after expiry, relaunch from the EHR.
- Scopes are read-only (`patient/*.read`). No `offline_access`.

## FHIR -> dosing inputs
A value is used only if its LOINC code is recognised and its unit converts exactly; otherwise it is reported in
`unconverted`. **Values older than their freshness window are excluded** (ANC/platelets/potassium 7 d, creatinine/magnesium
14 d, QTc 30 d, LVEF/weight 90 d) so the dosing check reports a data gap rather than acting on an old number.
Observations are matched on LOINC: ANC 26499-4/751-8, platelets 777-3/26515-7, creatinine 2160-0, K 2823-3,
Mg 19123-9, QTc 8634-8, LVEF 10230-1, weight 29463-7, height 8302-2. Medication orders that reference a
`Medication` resource are not resolved yet (counted in `medicationsUnresolved`).

## Trying it against the public SMART sandbox (no registration)
In a non-production run the default allow-list is `https://launch.smarthealthit.org/v/r4/fhir` and the client id is
`oncosaferx-dev`. Get a patient id from `https://launch.smarthealthit.org/v/r4/fhir/Patient?_count=1`, build a launch
code (base64url of `[0,"<patientId>","","AUTO",0,0,0,"","","","","","","",0,1]`) and open

    http://127.0.0.1:3000/smart/launch?iss=https://launch.smarthealthit.org/v/r4/fhir&launch=<code>

then sign in with the demo practitioner (any password). You land on `/?smart=1`; `GET /api/smart/context` shows the patient.
Epic / Oracle Health sandboxes need app registration (client id, redirect URI) and, for Epic, a non-production client.

## Not done yet
Frontend UI for the launched context; resolving `medicationReference`; refresh tokens / `offline_access`;
`private_key_jwt` client auth (for confidential asymmetric clients); CDS Hooks JWT verification (`/cds-services`).
