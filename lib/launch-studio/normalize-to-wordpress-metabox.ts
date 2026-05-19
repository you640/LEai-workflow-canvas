import type { LaunchStudioGeneratedBrief, SourceOfTruthExport, WordPressMetaboxPayload } from "@/lib/launch-studio/source-of-truth-schema";
import {
  normalizeNullableNumber,
  normalizeNullableString,
  sanitizeEditorContent,
  stripHtmlForPlainText,
} from "@/lib/launch-studio/content-format";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function includesAny(value: string, needles: string[]): boolean {
  const normalized = value.toLowerCase();
  return needles.some((needle) => normalized.includes(needle));
}

function buildContentProfile(brief: LaunchStudioGeneratedBrief, projectName: string, audience: string, goal: string) {
  const description = stripHtmlForPlainText(brief.description);
  const combined = `${projectName} ${audience} ${goal} ${description}`.toLowerCase();
  const isPhysio = includesAny(combined, ["fyzioter", "ambulancia", "sportov", "senior"]);
  const isBookingSaas = brief.identity.type === "saas" || includesAny(combined, ["booking", "rezerva", "pwa", "supabase"]);
  const isWordPressHub =
    includesAny(projectName.toLowerCase(), ["palicox"]) ||
    (brief.identity.type === "personal-brand" && includesAny(combined, ["knowledge hub", "blog"]));
  const isWebDo24 = includesAny(combined, ["web do 24", "24h", "24 hod"]);

  if (isWordPressHub) {
    return {
      title: `${projectName}: slovenský WordPress knowledge hub`,
      tagline: "Technické návody, bezpečnostné poznámky a praktické rozhodnutia pre ľudí, ktorí spravujú WordPress bez chaosu.",
      heroTitle: "WordPress poznanie, ktoré sa dá použiť",
      heroBody: `${projectName} pomáha čitateľom rýchlo pochopiť WordPress témy, pluginy, bezpečnosť, SEO a každodenné rozhodnutia pri správe webu.`,
      benefitsTitle: "Prehľadný obsah namiesto náhodných rád",
      benefitsBody: "Obsah je rozdelený podľa praktických tém, aby čitateľ našiel odpoveď bez prehrabávania zastaraných postupov.",
      processTitle: "Ako je hub postavený",
      processBody: "Homepage vedie návštevníka cez hlavné témy, blog index nesie pravidelný obsah a FAQ pomáha uzavrieť rozhodnutie pred kontaktom alebo odberom.",
      offerTitle: "Čo má stránka niesť",
      offerBody: "Výstup pripravuje jasný brand kontext, kategórie, tagy, SEO metadata, FAQ a bezpečný obsahový základ pre WordPress publikovanie.",
      trustTitle: "Dôvera cez vecnosť",
      trustBody: "Komunikácia stojí na praktických vysvetleniach, jasných obmedzeniach a technickej presnosti bez vymyslených autorít.",
      sectionLabels: ["Knowledge hub", "WordPress", "Blog"],
      topics: ["WordPress návody", "pluginy", "témy", "bezpečnosť", "SEO"],
      serviceType: ["Obsahový hub"],
      serviceCategory: ["WordPress vzdelávanie"],
      serviceBadges: ["Slovenský obsah", "Technický tón", "Blog-ready"],
      duration: null,
    };
  }

  if (isBookingSaas) {
    return {
      title: `${projectName}: bezpečný rezervačný systém pre služby`,
      tagline: "Technický launch plán pre mobilný booking produkt s validáciou, auditom a bezpečným backendom.",
      heroTitle: "Rezervácie bez bezpečnostných skratiek",
      heroBody: `${projectName} vysvetľuje hodnotu bezpečného rezervačného systému pre služby, ktoré potrebujú spoľahlivý mobilný flow a jasnú správu termínov.`,
      benefitsTitle: "Bezpečnosť ako súčasť produktu",
      benefitsBody: "Výstup pomenúva validáciu slotov, rate limiting, audit log, API hranice a technické pravidlá, ktoré patria do prvého releasu.",
      processTitle: "Od launch plánu po implementáciu",
      processBody: "Brief sa premieňa na landing obsah, technické odporúčania, REST kontrakt, testovací plán a checklist pre bezpečné nasadenie.",
      offerTitle: "Čo dostane produktový tím",
      offerBody: "Payload pokrýva positioning, CTA, SEO, FAQ, technické odporúčania a WordPress metabox dáta pre review pred publikovaním.",
      trustTitle: "Dôvera cez auditovateľný návrh",
      trustBody: "Komunikácia neobchádza validáciu, autentifikáciu ani bezpečnostné hranice. Riziká sú pomenované pred implementáciou.",
      sectionLabels: ["SaaS", "Booking", "Security"],
      topics: ["PWA", "Supabase", "Zod validácia", "rate limiting", "audit log"],
      serviceType: ["SaaS launch plán"],
      serviceCategory: ["Booking systémy"],
      serviceBadges: ["Security-first", "PWA", "API-ready"],
      duration: null,
    };
  }

  if (isPhysio) {
    return {
      title: `${projectName}: dôveryhodná stránka pre objednanie konzultácie`,
      tagline: "Pokojná a odborná prezentácia služieb, ktorá vysvetlí proces návštevy a navedie klienta ku kontaktu.",
      heroTitle: "Fyzioterapia vysvetlená zrozumiteľne",
      heroBody: `${projectName} potrebuje stránku, ktorá návštevníkovi jasne ukáže, komu ambulancia pomáha, ako prebieha prvá konzultácia a ako si dohodnúť termín.`,
      benefitsTitle: "Dôvera pred prvým kontaktom",
      benefitsBody: "Obsah pomáha klientovi pochopiť služby, pripraviť sa na návštevu a urobiť bezpečný ďalší krok bez nerealistických medicínskych sľubov.",
      processTitle: "Jednoduchý proces objednania",
      processBody: "Stránka vysvetľuje úvodný kontakt, konzultáciu, odporúčaný postup a ďalšie kroky po vyhodnotení potrieb klienta.",
      offerTitle: "Čo má landing page obsahovať",
      offerBody: "Výstup pripravuje hero, služby, proces, dôveru, FAQ, kontaktný smer a SEO metadata pre lokálnu zdravotnú službu.",
      trustTitle: "Odbornosť bez prehnaných tvrdení",
      trustBody: "Texty ostávajú vecné, ľudské a opatrné pri zdravotných tvrdeniach. Dôvera vzniká cez jasnosť, nie cez vymyslené dôkazy.",
      sectionLabels: ["Landing page", "Lokálna služba", "Zdravie"],
      topics: ["fyzioterapia", "objednanie konzultácie", "lokálna služba", "dôvera"],
      serviceType: ["Fyzioterapia"],
      serviceCategory: ["Súkromná ambulancia"],
      serviceBadges: ["Lokálne služby", "Dôvera", "Objednanie"],
      duration: null,
    };
  }

  return {
    title: isWebDo24 ? "Moderný firemný web pripravený podľa rozsahu a podkladov" : `${projectName}: jasná webová ponuka pripravená na review`,
    tagline: "Rýchly štart webovej prezentácie bez zbytočného chaosu a bez prehnaných obchodných tvrdení.",
    heroTitle: "Webová štruktúra s jasným ďalším krokom",
    heroBody: `${projectName} prináša profesionálny štart webu. Návštevník hneď vidí, čo ponuka rieši, pre koho je určená a aký je ďalší krok.`,
    benefitsTitle: "Prínosy pre rozhodovanie klienta",
    benefitsBody: "Výstup je navrhnutý tak, aby zvýšil dôveru, zrýchlil orientáciu návštevníka a zjednodušil následnú realizáciu webu.",
    processTitle: "Proces bez zbytočných meetingov",
    processBody: "Po briefingu sa pripraví obsahová kostra, finálne texty a implementačný plán. Každý krok má konkrétny výstup, ktorý sa dá skontrolovať.",
    offerTitle: "Čo je súčasťou dodania",
    offerBody: "Dostaneš headline, hodnotové argumenty, CTA systém, FAQ, SEO metadata a WordPress metabox payload pripravený na review.",
    trustTitle: "Dôvera postavená na realite",
    trustBody: "Obsah používa overiteľné tvrdenia a transparentný jazyk bez vymyslených referencií, manipulatívnych trikov alebo nereálnych sľubov.",
    sectionLabels: ["Landing page", "Firemný web", "Služby"],
    topics: ["web do 24h", "responzívny dizajn", "SEO základ", "kontakt"],
    serviceType: ["Tvorba webu"],
    serviceCategory: ["Firemné weby"],
    serviceBadges: isWebDo24 ? ["Podľa rozsahu", "Mobile-first", "SEO základ"] : ["Mobile-first", "SEO základ", "Review-ready"],
    duration: isWebDo24 ? 24 : null,
  };
}

export function normalizeToWordPressMetabox(brief: LaunchStudioGeneratedBrief): {
  wordpress: WordPressMetaboxPayload;
  previewSections: NonNullable<SourceOfTruthExport["_preview"]>["sections"];
} {
  const projectName = stripHtmlForPlainText(brief.identity.name);
  const audience = stripHtmlForPlainText(brief.audience);
  const goal = stripHtmlForPlainText(brief.goal);
  const contactEmail = stripHtmlForPlainText(brief.contactEmail);

  const profile = buildContentProfile(brief, projectName, audience, goal);
  const title = profile.title;
  const slug = slugify(projectName) || "web-do-24h-project";
  const tagline = profile.tagline;

  const context = `${projectName} rieši pre ${audience} jasný cieľ: ${goal}`;

  const sections = [
    {
      id: "hero",
      title: profile.heroTitle,
      body: profile.heroBody,
      bullets: ["Jasná hodnota na prvej obrazovke", "Silný CTA krok", "Dôveryhodná komunikácia"],
      cta: "Poslať brief"
    },
    {
      id: "benefits",
      title: profile.benefitsTitle,
      body: profile.benefitsBody,
      bullets: ["Mobilná optimalizácia", "Čitateľná štruktúra", "SEO základ pripravený na publikovanie"],
      cta: null
    },
    {
      id: "process",
      title: profile.processTitle,
      body: profile.processBody,
      bullets: ["Brief a validácia", "Návrh štruktúry a copy", "QA a odovzdanie"],
      cta: "Pozrieť možnosti"
    },
    {
      id: "offer",
      title: profile.offerTitle,
      body: profile.offerBody,
      bullets: ["Kompletný launch obsah", "Import-ready štruktúra", "Bez prepisovania od nuly"],
      cta: null
    },
    {
      id: "trust",
      title: profile.trustTitle,
      body: profile.trustBody,
      bullets: ["Transparentná komunikácia", "Konzistentný brand tón", "Zrozumiteľná ponuka"],
      cta: null
    },
    {
      id: "faq",
      title: "FAQ",
      body: "FAQ dáva klientovi stručné odpovede k rozsahu, ďalším krokom, kontrole výstupu a bezpečnému odovzdaniu.",
      bullets: ["Rozsah služby", "Časový plán", "Odovzdanie a ďalšie kroky"],
      cta: null
    },
    {
      id: "contact",
      title: "Kontakt a štart",
      body: `Ak chceš spustiť web bez chaosu, pošli brief na ${contactEmail} a dostaneš jasný plán realizácie.`,
      bullets: ["Jednoznačný CTA krok", "Rýchla odpoveď", "Pripravený handoff"],
      cta: "Poslať brief"
    }
  ];

  const rawEditor = sections
    .map(
      (section) =>
        `## ${section.title}\n\n${section.body}\n\n- ${section.bullets.join("\n- ")}${section.cta ? `\n\n**CTA:** ${section.cta}` : ""}`
    )
    .join("\n\n");
  const editor = sanitizeEditorContent(rawEditor);

  return {
    wordpress: {
      postType: "launch_studio",
      postStatus: "draft",
      main: {
        title: stripHtmlForPlainText(title),
        slug: stripHtmlForPlainText(slug),
        tagline: stripHtmlForPlainText(tagline),
        context: stripHtmlForPlainText(context),
        editor,
        label: stripHtmlForPlainText("Poslať brief"),
        link: stripHtmlForPlainText("#kontakt"),
      },
      post: {
        section: profile.sectionLabels.map(stripHtmlForPlainText),
        topic: profile.topics.map(stripHtmlForPlainText),
        source: stripHtmlForPlainText("LE Studio guarded export"),
      },
      services: [
        {
          type: profile.serviceType.map(stripHtmlForPlainText),
          category: profile.serviceCategory.map(stripHtmlForPlainText),
          badge: profile.serviceBadges.map(stripHtmlForPlainText),
          price: normalizeNullableNumber(null),
          duration: normalizeNullableNumber(profile.duration),
          datetime: null
        }
      ],
      products: [],
      media: {
        video: normalizeNullableString(null),
        icon: normalizeNullableString(null),
        image: normalizeNullableString(null),
        gallery: [],
        files: []
      }
    },
    previewSections: sections.map((s) => ({ ...s }))
  };
}
