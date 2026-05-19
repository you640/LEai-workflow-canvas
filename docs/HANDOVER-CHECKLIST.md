# Handover Checklist: Web do 24h

## Účel

Checklist slúži na bezpečné odovzdanie výstupu klientovi alebo internému WordPress operátorovi. Bez vyplneného checklistu sa projekt nepovažuje za pripravený na produkčný import alebo publikovanie.

## 1. Identifikácia projektu

- [ ] Názov projektu:
- [ ] Klient / firma:
- [ ] Kontaktná osoba:
- [ ] Kontaktný email:
- [ ] Dátum handoveru:
- [ ] Delivery owner:
- [ ] WordPress operator:

## 2. Asset inventory

- [ ] Finálny export JSON je uložený a pomenovaný jednoznačne.
- [ ] WordPress payload je dostupný alebo namapovaný do metabox polí.
- [ ] Texty sú finálne schválené klientom.
- [ ] Obrázky alebo médiá sú dodané klientom, ak sa používajú.
- [ ] Cenník je potvrdený klientom, ak sa zobrazuje.
- [ ] FAQ je potvrdené klientom.
- [ ] Kontaktné údaje sú potvrdené klientom.
- [ ] Zoznam otvorených rizík je priložený.

## 3. Export JSON

- [ ] Export obsahuje správny `project.name`.
- [ ] Export obsahuje správny `project.type`.
- [ ] Export neobsahuje demo emaily ani sample názvy.
- [ ] Export neobsahuje secrety, tokeny ani prihlasovacie údaje.
- [ ] Export neobsahuje fake referencie, fake počty klientov ani garantované výsledky.
- [ ] Export prešiel validátorom alebo QA kontrolou.
- [ ] Export je označený dátumom a verziou, ak to pipeline podporuje.

## 4. WordPress payload

- [ ] `wordpress.main.title` je finálny H1.
- [ ] `wordpress.main.slug` je bezpečný a čitateľný.
- [ ] `wordpress.main.tagline` je schválený.
- [ ] `wordpress.main.context` je schválený.
- [ ] `wordpress.main.editor` neobsahuje zakázané HTML, skripty ani layout soup.
- [ ] `wordpress.post.section` a `wordpress.post.topic` sú relevantné.
- [ ] `wordpress.services` neobsahuje vymyslené ceny.
- [ ] `wordpress.products` neobsahuje vymyslený sklad, ceny alebo paylink.
- [ ] `wordpress.media` neobsahuje vymyslené URL.

## 5. Prístupové údaje

- [ ] Prístupové údaje neboli poslané v plain texte cez email alebo chat.
- [ ] Použil sa password manager alebo jednorazový bezpečný odkaz.
- [ ] Do exportu neboli vložené žiadne heslá, API kľúče alebo WP credentials.
- [ ] Po handovere je jasné, kto má admin prístup.
- [ ] Dočasné prístupy majú dátum expirácie alebo plán odobratia.

## 6. DNS a hosting poznámky

- [ ] Produkčné DNS zmeny nie sú súčasťou tohto handoveru, ak neboli samostatne schválené.
- [ ] Hosting prostredie je pomenované: staging / production.
- [ ] Aktívna téma pred zmenou je zaznamenaná.
- [ ] PHP verzia a WordPress verzia sú zaznamenané, ak sú dostupné.
- [ ] Rollback bod alebo snapshot je potvrdený.

## 7. Obsahové súbory

- [ ] Finálne texty sú uložené.
- [ ] Klientské podklady sú uložené oddelene od exportu.
- [ ] Obrázky majú jasné názvy a licenčný pôvod.
- [ ] PDF alebo súbory na stiahnutie sú schválené klientom.
- [ ] Nepoužité alebo demo assety nie sú súčasťou finálneho balíka.

## 8. SEO metadata

- [ ] SEO title je schválený.
- [ ] SEO description je schválená.
- [ ] OG title je schválený.
- [ ] OG description je schválená.
- [ ] Metadata neobsahujú garantované SEO pozície.
- [ ] Indexácia stagingu je vypnutá, ak ide o staging.

## 9. Formuláre

- [ ] Lead/contact formulár má jasný účel.
- [ ] Formulár neposiela dáta na neoverené externé služby.
- [ ] Email príjemcu je potvrdený.
- [ ] Súhlas s kontaktovaním alebo privacy text je prítomný, ak sa zbierajú osobné údaje.
- [ ] Test odoslania bol vykonaný na stagingu alebo je jasne označené, že formulár je placeholder.

## 10. Analytics

- [ ] Analytics nie sú pridané bez súhlasu klienta.
- [ ] Ak analytics existujú, merací identifikátor je klientsky alebo schválený.
- [ ] Cookie/privacy dopad je zaznamenaný.
- [ ] Nie sú vložené neznáme trackery.

## 11. Rollback

- [ ] Predchádzajúca stabilná téma je známa.
- [ ] Snapshot alebo backup existuje.
- [ ] Rollback postup je popísaný.
- [ ] Osoba zodpovedná za rollback je určená.
- [ ] Rollback nebol vykonaný bez explicitného schválenia.

## 12. Support okno

- [ ] Support okno začína:
- [ ] Support okno končí:
- [ ] Čo je v supporte zahrnuté:
- [ ] Čo je mimo supportu:
- [ ] Kontakt pre urgentné problémy:

## Finálne potvrdenie

- [ ] Klient schválil obsah.
- [ ] Delivery owner schválil handover.
- [ ] QA reviewer nenašiel P0/P1 problém.
- [ ] WordPress operator potvrdil staging alebo produkčnú pripravenosť.
