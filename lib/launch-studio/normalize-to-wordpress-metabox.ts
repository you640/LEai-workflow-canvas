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

export function normalizeToWordPressMetabox(brief: LaunchStudioGeneratedBrief): {
  wordpress: WordPressMetaboxPayload;
  previewSections: NonNullable<SourceOfTruthExport["_preview"]>["sections"];
} {
  const projectName = stripHtmlForPlainText(brief.identity.name);
  const audience = stripHtmlForPlainText(brief.audience);
  const goal = stripHtmlForPlainText(brief.goal);
  const contactEmail = stripHtmlForPlainText(brief.contactEmail);

  const title = "Moderný firemný web pripravený na klientov už do 24 hodín";
  const slug = slugify(projectName) || "web-do-24h-project";
  const tagline = "Rýchly štart moderného webu bez chaosu, nekonečných úprav a lacnej šablónovej bolesti.";

  const context = `${projectName} rieši pre ${audience} jasný cieľ: ${goal}`;

  const sections = [
    {
      id: "hero",
      title: "Web do 24h pre firmy, ktoré nechcú čakať",
      body: `${projectName} prináša rýchly a profesionálny štart webu. Návštevník hneď vidí, čo služba rieši, pre koho je určená a aký je ďalší krok.`,
      bullets: ["Jasná hodnota na prvej obrazovke", "Silný CTA krok", "Dôveryhodná komunikácia"],
      cta: "Poslať brief"
    },
    {
      id: "benefits",
      title: "Prínosy pre tvoje podnikanie",
      body: "Výstup je navrhnutý tak, aby zvýšil dôveru, zrýchlil rozhodovanie klienta a zjednodušil internú realizáciu webu.",
      bullets: ["Mobilná optimalizácia", "Čitateľná štruktúra", "SEO základ pripravený na publikovanie"],
      cta: null
    },
    {
      id: "process",
      title: "Proces bez zbytočných meetingov",
      body: "Po briefingu sa pripraví obsahová kostra, finálne texty a implementačný plán. Každý krok má konkrétny výstup, ktorý sa dá okamžite použiť.",
      bullets: ["Brief a validácia", "Návrh štruktúry a copy", "QA a odovzdanie"],
      cta: "Pozrieť možnosti"
    },
    {
      id: "offer",
      title: "Čo je súčasťou dodania",
      body: "Dostaneš headline, hodnotové argumenty, CTA systém, FAQ, SEO metadata a dry-run payload pripravený pre WordPress import preview.",
      bullets: ["Kompletný launch obsah", "Import-ready štruktúra", "Bez prepisovania od nuly"],
      cta: null
    },
    {
      id: "trust",
      title: "Dôvera postavená na realite",
      body: "Obsah používa overiteľné tvrdenia a transparentný jazyk. Bez fake referencií, bez manipulatívnych trikov, bez nereálnych sľubov.",
      bullets: ["Transparentná komunikácia", "Konzistentný brand tón", "Zrozumiteľná ponuka"],
      cta: null
    },
    {
      id: "faq",
      title: "FAQ",
      body: "Najdôležitejšie otázky sú zodpovedané jasne, aby klient vedel čo dostane, v akom rozsahu a ako rýchlo sa vie pohnúť ďalej.",
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
        section: ["Landing page", "Firemný web", "Služby"].map(stripHtmlForPlainText),
        topic: ["web do 24h", "responzívny dizajn", "SEO základ", "kontakt"].map(stripHtmlForPlainText),
        source: stripHtmlForPlainText("Launch Studio dry-run"),
      },
      services: [
        {
          type: ["Tvorba webu"].map(stripHtmlForPlainText),
          category: ["Firemné weby"].map(stripHtmlForPlainText),
          badge: ["Do 24h", "Mobile-first", "SEO základ"].map(stripHtmlForPlainText),
          price: normalizeNullableNumber(null),
          duration: normalizeNullableNumber(24),
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
