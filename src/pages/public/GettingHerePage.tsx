import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/PageHeader";
import { PracticalTabs } from "../../components/PracticalTabs";

// Avanza's airport → Estepona fares as booked online (Oct 2026). The web
// fee and travel insurance are per person and the same on every service.
const BUS_WEB_FEE = 2.5;
const BUS_INSURANCE = 1.75;
const BUS_FARES = [
  { service: "normal", ticket: 10.24 },
  { service: "multimedia", ticket: 12.0 },
] as const;

/** Static host-written copy (lives in the locale files, like the golf tip),
 * not Firestore: it's one fixed page rather than a list of items. */
export function GettingHerePage() {
  const { t, i18n } = useTranslation();
  const eur = (n: number) =>
    new Intl.NumberFormat(i18n.language === "no" ? "nb-NO" : "en-GB", {
      style: "currency",
      currency: "EUR",
    }).format(n);
  const list = (key: string) => t(key, { returnObjects: true }) as string[];

  return (
    <div>
      <PageHeader tracker={t("tracker.gettingHere")} title={t("gettingHere.title")}>
        <PracticalTabs />
      </PageHeader>

      <p className="page-intro">{t("gettingHere.intro")}</p>

      <section className="travel-section">
        <p className="micro-label">01</p>
        <h2>{t("gettingHere.car.title")}</h2>
        <p>{t("gettingHere.car.lead")}</p>
        <h3>{t("gettingHere.car.tollTitle")}</h3>
        <div className="table-scroll">
          <table className="info-table">
            <thead>
              <tr>
                <th>{t("gettingHere.car.colRoute")}</th>
                <th>{t("gettingHere.car.colToll")}</th>
                <th>{t("gettingHere.car.colTime")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t("gettingHere.car.ap7")}</td>
                <td>{t("gettingHere.car.ap7Toll")}</td>
                <td>{t("gettingHere.car.ap7Time")}</td>
              </tr>
              <tr>
                <td>{t("gettingHere.car.a7")}</td>
                <td>{t("gettingHere.car.a7Toll")}</td>
                <td>{t("gettingHere.car.a7Time")}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="host-note">{t("gettingHere.car.mix")}</p>
        <ul>
          {list("gettingHere.car.tips").map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <section className="travel-section">
        <p className="micro-label">02</p>
        <h2>{t("gettingHere.bus.title")}</h2>
        <p>{t("gettingHere.bus.lead")}</p>
        <div className="table-scroll">
          <table className="info-table">
            <thead>
              <tr>
                <th>{t("gettingHere.bus.colService")}</th>
                <th>{t("gettingHere.bus.colTicket")}</th>
                <th>{t("gettingHere.bus.colTotal")}</th>
              </tr>
            </thead>
            <tbody>
              {BUS_FARES.map((f) => (
                <tr key={f.service}>
                  <td>{t(`gettingHere.bus.${f.service}`)}</td>
                  <td>{eur(f.ticket)}</td>
                  <td>{eur(f.ticket + BUS_WEB_FEE + BUS_INSURANCE)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint">{t("gettingHere.bus.fees")}</p>
        <p className="host-note">{t("gettingHere.bus.lastLeg")}</p>
        <div className="card-links">
          <a href="https://www.avanzabus.com/" target="_blank" rel="noreferrer">
            {t("gettingHere.bus.link")}
          </a>
        </div>
      </section>

      <section className="travel-section">
        <p className="micro-label">03</p>
        <h2>{t("gettingHere.taxi.title")}</h2>
        <p>{t("gettingHere.taxi.lead")}</p>
        <ul>
          {list("gettingHere.taxi.tips").map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <section className="travel-section">
        <p className="micro-label">04</p>
        <h2>{t("gettingHere.apps.title")}</h2>
        <p>{t("gettingHere.apps.lead")}</p>
        <ul>
          {list("gettingHere.apps.tips").map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <p className="hint">{t("gettingHere.pricesNote")}</p>
    </div>
  );
}
