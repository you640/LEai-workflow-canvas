# WordPress Import Safety Limits

## Účel

Tento dokument definuje bezpečnostné hranice medzi LE Studio a WordPress importom. LE Studio je generátor a validátor payloadu. WordPress je runtime, ktorý ukladá a renderuje obsah cez tému, template a metabox polia.

## Základný princíp

LE Studio generuje:

- štruktúrovaný JSON payload
- obsahové polia
- SEO metadata
- FAQ
- odporúčania
- WordPress metabox dáta

LE Studio negeneruje:

- finálny WordPress layout
- produkčný HTML layout s CSS triedami
- tajné WP credentials
- automatické produkčné zápisy bez guardu
- fake úspešný import

## Render zodpovednosť

WordPress zodpovedá za:

- uloženie dát
- mapovanie metabox polí
- rendering cez theme/template
- frontend layout
- formuláre a ich backend spracovanie
- cache a publikovanie

AI ani LE Studio nesmú rozhodovať o finálnom WordPress layoute mimo schváleného theme/template systému.

## Production write pravidlo

Bez explicitného serverového guardu musí platiť:

```txt
productionWrite === false
wordpressPostId === null
```

Produkčný import je povolený až keď existuje:

- explicitný feature flag
- server-side autentifikácia
- oprávnenie používateľa
- validovaný payload
- audit log
- rollback bod
- staging-first prechod

## WP credentials

WP credentials musia byť:

- iba server-side
- uložené v secret store alebo bezpečnom deployment env
- nikdy v browser bundle
- nikdy v JSON exporte
- nikdy v dokumentácii alebo logoch
- nikdy v screenshotoch určených pre klienta

Ak sa credential objaví v klientskom kóde alebo exporte, ide o P0 incident.

## Browser bezpečnostné pravidlá

Browser nesmie obsahovať:

- WP admin heslá
- API tokeny
- service role kľúče
- basic auth stringy
- produkčné import endpoint credentials
- tajné webhook URL

Klientský kód môže vidieť iba verejné alebo neškodné hodnoty.

## Compliance fail

Import musí byť blokovaný pri:

- fake referenciách
- fake počtoch klientov
- fake revenue tvrdeniach
- garantovanom príjme
- garantovaných SEO pozíciách
- garantovaných predajoch
- gambling alebo lottery mechanikách bez compliance
- hidden admin bypass požiadavkách
- unsafe technical advice
- nevalidnom JSON
- chýbajúcich povinných poliach
- placeholder textoch

Compliance fail nesmie byť len warning, ak by payload mohol prejsť do importu. Musí blokovať export/import podľa rizika.

## Audit log odporúčanie

Každý import attempt by mal zaznamenať:

- timestamp
- user/account id, ak existuje
- project id
- schema version
- source of truth
- hash payloadu
- validation result
- compliance result
- import mode: staging / production
- productionWrite value
- target WordPress host
- výsledok: blocked / preview / imported / failed

Audit log nesmie ukladať secrety.

## Rate limit odporúčanie

Import a generation endpointy by mali mať rate limit podľa rizika:

- AI generation: chrániť proti nákladovým spikeom
- WordPress import preview: chrániť proti abuse a spam payloadom
- produkčný import: striktnejší limit a audit
- failed validation attempts: limitovať opakované pokusy

Rate limit má byť server-side. Client-side limit je iba UX pomocník, nie bezpečnostná kontrola.

## Rollback pred importom

Pred produkčným importom musí existovať:

- WordPress backup alebo snapshot
- známa aktívna téma
- zoznam dotknutých postov/metaboxov
- rollback osoba
- rollback postup
- kritériá, kedy rollback spustiť

Bez rollback bodu sa produkčný import nespúšťa.

## Staging first policy

Každý nový typ payloadu alebo theme mapping ide najprv cez staging.

Minimálny staging smoke:

- homepage
- relevantná landing page
- single/page template
- archive/search, ak sa dotýka obsahu
- mobile viewport
- browser console
- WordPress debug log
- template parts
- formuláre

Až po staging výsledku GREEN alebo YELLOW bez P0/P1 možno plánovať produkčný import.

## Zakázané skratky

- Neimportovať priamo do produkcie len preto, že JSON vyzerá správne.
- Neprepínať `productionWrite` z klienta.
- Neposielať WP credentials do browsera.
- Neobchádzať compliance fail.
- Nevytvárať fake WordPress post ID.
- Neukladať payload s tajnými údajmi do verejných artefaktov.
- Nepoužívať LE Studio ako náhradu za WordPress theme/template rendering.

## P0 incidenty

Za P0 sa považuje:

- secret v klientskom bundle
- produkčný zápis bez schválenia
- import do zlého WordPress hosta
- fake successful import state
- verejné zobrazenie credentials
- chýbajúci rollback pri produkčnom zásahu

Pri P0 zastav workflow, nepublikuj, izoluj artefakty a priprav incident report.
