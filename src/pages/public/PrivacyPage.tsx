import { useTranslation } from "react-i18next";

const CONTENT = {
  en: {
    heading: "Privacy policy",
    updated: "Last updated: 2026-07-26",
    intro:
      "This site is a guest guide for a single holiday home. It is run by an individual host, not a company, and this page explains what personal data it processes under the EU General Data Protection Regulation (GDPR).",
    sections: [
      {
        title: "What we collect",
        body: "Admin accounts: if you are a co-host with edit access, your email address is stored by Firebase Authentication to let you log in. Guests browsing the public guide or the house manual do not create accounts and are not asked for any personal data. The shared house-manual code is a single password shared by all guests of the property — it is deliberately not linked to any individual guest's name, booking, or identity, specifically to avoid collecting personal data we don't need. Uploaded photos: any photo an admin uploads through the admin panel has its EXIF metadata (including GPS location) automatically stripped before it is stored on Cloudinary, our image hosting provider, so photos never carry hidden location or device data.",
      },
      {
        title: "Why (lawful basis)",
        body: "Admin email storage is processed on the basis of legitimate interest (GDPR Art. 6(1)(f)): it is necessary to operate the tool that lets the host and co-hosts maintain the guide, and it is limited to the minimum needed (an email address, nothing else) for people who have chosen to help run the property.",
      },
      {
        title: "Cookies & analytics",
        body: "This site does not use cookies, analytics, or any tracking by default. Your language preference is stored in your browser's local storage (not a cookie, not sent to any server) purely so the site remembers whether you prefer English or Norwegian.",
      },
      {
        title: "Retention",
        body: "Admin account data is kept for as long as that person has editing access, and is deleted when their account is removed (see RULES.md for how admins are added/removed). Guide content (restaurants, activities, etc.) is not personal data and is kept indefinitely for the life of the guide.",
      },
      {
        title: "Your rights",
        body: "If you are a co-host with an admin account and want your data corrected or deleted, or if you have any other question about this policy, contact the property host directly.",
      },
    ],
  },
  no: {
    heading: "Personvernerklæring",
    updated: "Sist oppdatert: 26.07.2026",
    intro:
      "Denne siden er en gjesteguide for ett enkelt feriehus. Den drives av en privatperson, ikke et selskap, og denne siden forklarer hvilke personopplysninger den behandler i henhold til EUs personvernforordning (GDPR).",
    sections: [
      {
        title: "Hva vi samler inn",
        body: "Admin-kontoer: hvis du er medvert med redigeringstilgang, lagrer Firebase Authentication e-postadressen din slik at du kan logge inn. Gjester som ser på den offentlige guiden eller husmanualen oppretter ikke kontoer og blir ikke bedt om personopplysninger. Den delte koden til husmanualen er ett enkelt passord delt av alle gjester i huset — den er bevisst ikke knyttet til en bestemt gjests navn, booking eller identitet, nettopp for å unngå å samle inn personopplysninger vi ikke trenger. Opplastede bilder: alle bilder en admin laster opp gjennom adminpanelet får EXIF-metadata (inkludert GPS-posisjon) automatisk fjernet før de lagres hos Cloudinary, vår leverandør av bildelagring, slik at bilder aldri inneholder skjult posisjons- eller enhetsdata.",
      },
      {
        title: "Hvorfor (rettslig grunnlag)",
        body: "Lagring av admin-e-post behandles på grunnlag av berettiget interesse (GDPR art. 6(1)(f)): det er nødvendig for å drifte verktøyet som lar vert og medverter vedlikeholde guiden, og er begrenset til det minimum som trengs (en e-postadresse, ikke mer) for personer som har valgt å bidra til å drifte eiendommen.",
      },
      {
        title: "Cookies og analyse",
        body: "Denne siden bruker ikke cookies, analyseverktøy eller sporing som standard. Språkvalget ditt lagres i nettleserens lokale lagring (ikke en cookie, sendes ikke til noen server) utelukkende for at siden skal huske om du foretrekker engelsk eller norsk.",
      },
      {
        title: "Lagringstid",
        body: "Admin-kontodata beholdes så lenge personen har redigeringstilgang, og slettes når kontoen fjernes (se RULES.md for hvordan admins legges til/fjernes). Guideinnhold (restauranter, aktiviteter osv.) er ikke personopplysninger og beholdes så lenge guiden er i bruk.",
      },
      {
        title: "Dine rettigheter",
        body: "Hvis du er medvert med en admin-konto og ønsker at dine opplysninger rettes eller slettes, eller har andre spørsmål om denne erklæringen, ta direkte kontakt med verten.",
      },
    ],
  },
};

export function PrivacyPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("no") ? "no" : "en";
  const content = CONTENT[lang];

  return (
    <div className="page-narrow">
      <h1>{content.heading}</h1>
      <p className="hint">{content.updated}</p>
      <p>{content.intro}</p>
      {content.sections.map((s) => (
        <section key={s.title}>
          <h2>{s.title}</h2>
          <p>{s.body}</p>
        </section>
      ))}
    </div>
  );
}
