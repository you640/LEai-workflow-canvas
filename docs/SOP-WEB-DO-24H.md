# SOP: Web do 24h Delivery

## Účel

Tento SOP popisuje kontrolovaný postup doručenia služby `Web do 24h` cez LE Studio. Cieľom je pripraviť kvalitný webový obsah a WordPress-ready payload bez neoverených tvrdení, bez tajných produkčných zápisov a bez chaosu pri odovzdávke.

## Roly a zodpovednosti

| Rola | Zodpovednosť |
| --- | --- |
| Delivery owner | Riadi celý delivery flow, termíny, klientsku komunikáciu a finálny handoff. |
| Content operator | Pripravuje brief, spúšťa LE Studio, kontroluje texty a CTA. |
| QA reviewer | Kontroluje compliance, zakázané tvrdenia, SEO metadata, formuláre a export. |
| WordPress operator | Pripravuje staging, nahráva obsah/payload, kontroluje rendering vo WordPresse. |
| Client approver | Schvaľuje názov, texty, ceny, kontakty, CTA a publikovanie. |

## Časové okná

| Fáza | Cieľový čas | Poznámka |
| --- | ---: | --- |
| Prijatie briefu | 0-1 h | Začína až po dodaní minimálnych podkladov. |
| Kontrola podkladov | 15-30 min | Ak chýbajú kritické údaje, práca sa stopne. |
| Generovanie cez LE Studio | 15-45 min | Zahŕňa validáciu a export. |
| QA outputu | 30-60 min | Bez QA sa payload neposúva do stagingu. |
| WordPress staging príprava | 30-90 min | Závisí od prístupov, témy a hostingu. |
| Klientsky review | podľa klienta | Termín sa neráta ako interné delivery omeškanie. |
| Finálny handoff | 30-60 min | Po schválení klientom. |

`Web do 24h` znamená rýchly proces podľa rozsahu a dostupných podkladov. Nie je to garancia dodania pri nekompletných podkladoch, väčšom rozsahu alebo chýbajúcom schválení.

## 1. Vstupný brief

Minimálne povinné údaje:

- názov projektu alebo firmy
- typ projektu
- cieľová skupina
- hlavný cieľ webu
- popis služby/ponuky
- preferovaný tón komunikácie
- kontaktný email alebo kontaktný bod
- informácia, či existujú ceny, balíky alebo rozpočet
- informácia, či existujú právne obmedzenia alebo citlivé tvrdenia

Ak chýba názov projektu, cieľ webu, popis ponuky alebo kontakt, delivery owner musí zastaviť generovanie a vyžiadať doplnenie.

## 2. Kontrola podkladov

Pred generovaním skontroluj:

- či klient dodal reálne údaje, nie placeholdery
- či názov projektu nie je zamenený za typ projektu
- či email vyzerá ako reálny kontakt
- či ceny, ak existujú, sú explicitne dodané klientom
- či médiá, ak existujú, sú explicitne dodané klientom
- či v briefi nie sú fake referencie, fake počty klientov alebo garantované výsledky
- či brief nežiada skryté admin bypassy, vypnutie validácie alebo iné nebezpečné technické odporúčania

Ak je brief rizikový, nepokračuj ticho. Zapíš problém do klientskych otázok a vyžiadaj opravu.

## 3. Generovanie cez LE Studio

Postup:

1. Otvor LE Studio alebo brief flow.
2. Vyplň polia presne podľa klientskych podkladov.
3. Nepoužívaj demo emaily, sample názvy ani vymyslené ceny.
4. Spusti workflow.
5. Skontroluj execution log a validation state.
6. Skontroluj JSON preview.
7. Exportuj až po úspešnej validácii.

Výstup musí byť content-first a schema-first. LE Studio generuje payload, nie finálny WordPress layout.

## 4. Kontrola outputu

QA reviewer skontroluje:

- `project.name` sedí s názvom klienta
- headline je konkrétny a bez fake claimov
- CTA zodpovedá reálnemu flowu
- sekcie dávajú obchodný zmysel
- FAQ neobsahuje sľuby bez dôkazu
- SEO metadata neobsahujú garantované pozície
- WordPress payload používa očakávanú metabox štruktúru
- `productionWrite` nie je zapnuté bez explicitného guardu
- `wordpressPostId` nie je predstieraný výsledok
- export neobsahuje secrety, tokeny ani prístupové údaje

## 5. Úprava textov

Content operator môže upraviť:

- gramatiku
- tón komunikácie
- jasnosť CTA
- štruktúru sekcií
- dĺžku textov
- FAQ formulácie
- SEO title/description v bezpečných hraniciach

Content operator nesmie doplniť:

- fake referencie
- fake počty klientov
- fake príjmy
- garantované SEO pozície
- garantované predaje
- vymyslené ceny
- vymyslené médiá
- vymyslené certifikácie

## 6. WordPress staging príprava

Pred stagingom musí existovať:

- staging URL
- staging-only admin prístup
- rollback bod alebo snapshot
- potvrdenie, že nejde o produkciu
- potvrdenie aktívnej témy pred zmenou
- bezpečný spôsob prenosu prístupov

WordPress operator pripraví:

- aktuálnu zálohu alebo snapshot
- staging theme/template kontrolu
- vypnutú indexáciu stagingu
- debug log bezpečne dostupný iba oprávneným osobám
- import alebo ručné mapovanie payloadu do metaboxov podľa schváleného flowu

## 7. Klientsky review

Klient musí schváliť:

- názov projektu
- headline a podnadpis
- hlavné CTA
- sekcie a priority obsahu
- FAQ
- ceny, ak sa zobrazujú
- kontaktné údaje
- právne a compliance tvrdenia
- SEO metadata
- finálny staging náhľad

Bez klientského schválenia sa nepublikuje.

## 8. Finálny handoff

Handoff balík obsahuje:

- finálny export JSON
- WordPress payload alebo zoznam namapovaných polí
- screenshoty staging review
- zoznam otvorených rizík
- SEO metadata
- kontakty a formuláre
- rollback poznámku
- support okno
- informáciu, čo bolo mimo scope

Prístupové údaje sa neposielajú v plain texte. Použi password manager, jednorazový secret sharing alebo schválený bezpečný kanál.

## 9. Čo nerobiť

- Nepublikovať bez staging review.
- Nezapínať produkčný WordPress write bez explicitného guardu.
- Nevkladať prístupové údaje do browseru, JSON exportu alebo dokumentácie.
- Nevymýšľať ceny, médiá, referencie ani obchodné tvrdenia.
- Nepoužívať WordPress produkciu ako testovacie prostredie.
- Neobchádzať compliance fail.
- Neposielať klientovi neoznačený draft ako finálny výstup.
- Nemeniť DNS, hosting alebo Caddy v rámci delivery bez samostatného schválenia.

## Exit kritériá

Delivery je pripravené na handoff iba keď:

- brief je kompletný
- export prešiel validáciou
- QA reviewer nenašiel P0/P1 problém
- staging náhľad je funkčný
- klient schválil obsah
- rollback bod je potvrdený
- handover checklist je vyplnený
