"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { messages } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/client";

type LeadFormState = {
  name: string;
  company: string;
  email: string;
  projectType: string;
  description: string;
  budget: string;
  consent: boolean;
};

const INITIAL_FORM: LeadFormState = {
  name: "",
  company: "",
  email: "",
  projectType: "business",
  description: "",
  budget: "",
  consent: false,
};

const INPUT_CLASS =
  "w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30";

function buildMailto(form: LeadFormState): string {
  const subject = encodeURIComponent(`Web do 24h brief: ${form.company || form.name || "novy lead"}`);
  const body = encodeURIComponent(
    [
      `Meno: ${form.name}`,
      `Firma: ${form.company}`,
      `Email: ${form.email}`,
      `Typ projektu: ${form.projectType}`,
      `Rozpocet: ${form.budget || "neuvedeny"}`,
      "",
      "Popis:",
      form.description,
    ].join("\n")
  );
  return `mailto:studio@rubberduck.sk?subject=${subject}&body=${body}`;
}

export function WebDo24hLandingClient() {
  const { locale } = useI18n();
  const copy = messages[locale].webDo24h;
  const [form, setForm] = useState<LeadFormState>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

  const mailto = useMemo(() => buildMailto(form), [form]);
  const canSubmit = form.name.trim() && form.email.trim() && form.description.trim() && form.consent;

  const update = (patch: Partial<LeadFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-[100vh] min-h-[100dvh] bg-zinc-950 text-zinc-100">
      <section className="border-b border-zinc-800 bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(9,9,11,0)_58%),radial-gradient(900px_360px_at_15%_0%,rgba(59,130,246,0.2),rgba(9,9,11,0)_62%)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <nav className="flex items-center justify-between">
            <Link href="/launch-studio" className="text-sm font-semibold text-zinc-100">
              {copy.nav.brand}
            </Link>
            <Link href="/brief?plan=web-do-24h&type=business" className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-200">
              {copy.nav.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                {copy.hero.kicker}
              </p>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">{copy.hero.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">{copy.hero.subtitle}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/brief?plan=web-do-24h&type=business" className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300">
                  {copy.hero.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#sample-output" className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900">
                  {copy.hero.secondaryCta}
                  <FileText className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div id="sample-output" className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-5 shadow-2xl shadow-black/30">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <div>
                  <p className="text-xs uppercase text-zinc-500">{copy.sample.label}</p>
                  <h2 className="text-lg font-semibold text-white">{copy.sample.title}</h2>
                </div>
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
              </div>
              <div className="space-y-3 text-sm text-zinc-300">
                {copy.sample.items.map((item) => (
                  <div key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-300">{copy.audience.kicker}</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">{copy.audience.title}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
          {copy.audience.items.map((item) => (
            <div key={item} className="rounded-md border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-200">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-zinc-800 bg-zinc-900/55">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase text-emerald-300">{copy.deliverables.kicker}</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{copy.deliverables.title}</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {copy.deliverables.items.map((item) => (
              <div key={item} className="flex gap-3 rounded-md border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-200">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase text-emerald-300">{copy.process.kicker}</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">{copy.process.title}</h2>
        <div className="mt-7 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {copy.process.steps.map((step, index) => (
            <div key={step} className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
              <div className="mb-3 text-xs font-semibold text-zinc-500">{String(index + 1).padStart(2, "0")}</div>
              <div className="text-sm font-semibold text-zinc-100">{step}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-zinc-800 bg-zinc-900/55">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-emerald-300">{copy.pricing.kicker}</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">{copy.pricing.title}</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-zinc-400">{copy.pricing.note}</p>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {copy.pricing.plans.map((plan) => (
              <div key={plan.name} className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <p className="mt-2 text-3xl font-semibold text-emerald-300">{plan.price}</p>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{plan.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-300">{copy.faq.kicker}</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">{copy.faq.title}</h2>
          <div className="mt-6 space-y-4">
            {copy.faq.items.map((item) => (
              <details key={item.question} className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-zinc-100">{item.question}</summary>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>

        <form id="kontakt" onSubmit={onSubmit} className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-5 flex items-start gap-3">
            <Mail className="mt-1 h-5 w-5 text-emerald-300" />
            <div>
              <h2 className="text-2xl font-semibold text-white">{copy.lead.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{copy.lead.note}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-zinc-200">
              <span className="mb-1 block">{copy.lead.fields.name}</span>
              <input className={INPUT_CLASS} value={form.name} onChange={(event) => update({ name: event.target.value })} required />
            </label>
            <label className="text-sm text-zinc-200">
              <span className="mb-1 block">{copy.lead.fields.company}</span>
              <input className={INPUT_CLASS} value={form.company} onChange={(event) => update({ company: event.target.value })} />
            </label>
            <label className="text-sm text-zinc-200">
              <span className="mb-1 block">{copy.lead.fields.email}</span>
              <input className={INPUT_CLASS} type="email" value={form.email} onChange={(event) => update({ email: event.target.value })} required />
            </label>
            <label className="text-sm text-zinc-200">
              <span className="mb-1 block">{copy.lead.fields.projectType}</span>
              <select className={INPUT_CLASS} value={form.projectType} onChange={(event) => update({ projectType: event.target.value })}>
                {copy.lead.projectTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </label>
            <label className="text-sm text-zinc-200 sm:col-span-2">
              <span className="mb-1 block">{copy.lead.fields.description}</span>
              <textarea className={INPUT_CLASS} rows={5} value={form.description} onChange={(event) => update({ description: event.target.value })} required />
            </label>
            <label className="text-sm text-zinc-200 sm:col-span-2">
              <span className="mb-1 block">{copy.lead.fields.budget}</span>
              <input className={INPUT_CLASS} value={form.budget} onChange={(event) => update({ budget: event.target.value })} />
            </label>
          </div>

          <label className="mt-4 flex gap-3 text-sm leading-6 text-zinc-300">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(event) => update({ consent: event.target.checked })}
              className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-emerald-400"
              required
            />
            <span>{copy.lead.consent}</span>
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copy.lead.submit}
            <ArrowRight className="h-4 w-4" />
          </button>

          {submitted ? (
            <div className="mt-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-100">
              <p>{copy.lead.success}</p>
              <a className="mt-3 inline-flex font-semibold text-emerald-200 underline underline-offset-4" href={mailto}>
                {copy.lead.mailto}
              </a>
            </div>
          ) : null}
        </form>
      </section>
    </main>
  );
}
