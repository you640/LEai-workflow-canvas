# Outreach Metrics: Web do 24h Pilot

## Účel

Tento dokument slúži na manuálne vyhodnotenie prvých 20 oslovení pre pilot `Web do 24h`. Cieľ nie je poslať čo najviac správ. Cieľ je zistiť, či ponuka dáva trhu zmysel.

## Základné počítadlá

| Metrika | Hodnota | Poznámka |
| --- | ---: | --- |
| Počet oslovených | 0 | Max 20 v prvej vlne. |
| Open rate | NEZNÁME | Meraj iba ak máš legálny a schválený spôsob. |
| Počet odpovedí | 0 | Počíta sa každá ľudská odpoveď. |
| Počet záujmov | 0 | Záujem = pýta si brief, cenu, call alebo ukážku. |
| Počet callov | 0 | Reálne dohodnuté hovory. |
| Počet pilotov | 0 | Zaplatený alebo záväzne potvrdený pilot. |
| Počet odmietnutí | 0 | Zaznač dôvod, nie iba „nie“. |

## Statusy v CSV

Používaj tieto hodnoty:

```txt
not_sent
sent
followed_up
replied_interested
replied_not_now
replied_no
call_booked
pilot_won
closed_lost
invalid_contact
```

## Dôvody odmietnutia

Zapisuj presne, nie pocitovo:

- nemajú rozpočet
- majú dodávateľa
- web teraz neriešia
- cena vysoká
- neveria 24h formulácii
- nerozumejú výstupu
- chcú hotový web, nie obsahový podklad
- chcú garanciu SEO/predaja
- zlý segment
- zlý timing
- bez odpovede

## Rozhodovací prah po 20 osloveniach

| Výsledok | Interpretácia | Ďalší krok |
| --- | --- | --- |
| 0/20 odpovedí | Problém je v ponuke, segmente, texte alebo relevancii targetov. | Nepísať ďalších 100. Upraviť segment a opening line. |
| 1/20 odpoveď | Slabý signál. | Skontrolovať kvalitu targetov a konkrétnosť personalizácie. |
| 2-4/20 odpovede | Ponuka má slabý až stredný signál. | Iterovať copy, zúžiť segment, pridať jasnejší benefit. |
| 5+/20 odpovedí | Trh reaguje. | Testovať platený pilot a zaviesť jednoduchý sales flow. |
| 2+ platené piloty | Ponuka má komerčný signál. | Priorita je doručenie a repeatable SOP, nie ďalšie feature brúsenie. |

## Kvalitatívne poznámky

Po každej odpovedi vyplň:

```txt
Čo ich zaujalo:
Čomu nerozumeli:
Čo im vadilo:
Akú cenu spomenuli:
Aký ďalší krok chceli:
```

## Denný report

Po každom outreach bloku zapíš:

```txt
Dátum:
Počet odoslaných:
Segment:
Počet odpovedí:
Počet záujmov:
Počet follow-upov:
Najčastejšia námietka:
Čo upraviť v copy:
```

## Anti-spam pravidlá

- Posielaj iba relevantným firmám alebo freelancerom.
- Neposielaj hromadné nepersonalizované správy.
- Neposielaj viac než jeden follow-up bez jasného dôvodu.
- Rešpektuj odmietnutie.
- Nepoužívaj fake referencie.
- Nepoužívaj garantované výsledky.
- Nezbieraj ani nespracúvaj osobné údaje bez dôvodu.

## Manuálny postup vyhodnotenia

1. Vyplň 20 targetov v `docs/OUTREACH-TARGETS-TEMPLATE.csv` po ručnom researchi.
2. Pri každom targete doplň konkrétny `current_site_issue` a `suggested_angle`.
3. Pošli najviac 10 správ denne, ručne a personalizovane.
4. Po 3 dňoch pošli jeden follow-up iba tým, kde to dáva zmysel.
5. Aktualizuj status, reply a next_action.
6. Po 20 targetoch vyhodnoť tabuľku podľa rozhodovacieho prahu.
7. Ak je 0/20 odpovedí, neškáluj outreach. Najprv oprav ponuku alebo segment.
