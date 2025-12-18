import { Card } from '@voyagenest/ui';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    title: locale === 'de' ? 'Impressum' : 'Imprint',
  };
}

export default function ImprintPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isGerman = locale === 'de';

  return (
    <div className="min-h-screen bg-navy-deep pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="p-8 md:p-12">
          <h1 className="font-display text-3xl font-bold text-pearl mb-8">
            {isGerman ? 'Impressum' : 'Imprint'}
          </h1>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                {isGerman ? 'Angaben gemäß § 5 TMG' : 'Information according to § 5 TMG'}
              </h2>
              <p className="text-warm-gray leading-relaxed">
                VoyageNest GmbH<br />
                Musterstraße 123<br />
                10115 Berlin<br />
                {isGerman ? 'Deutschland' : 'Germany'}
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                {isGerman ? 'Handelsregister' : 'Commercial Register'}
              </h2>
              <p className="text-warm-gray leading-relaxed">
                {isGerman ? 'Registergericht:' : 'Register Court:'} Amtsgericht Berlin-Charlottenburg<br />
                {isGerman ? 'Registernummer:' : 'Register Number:'} HRB 123456
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                {isGerman ? 'Vertreten durch' : 'Represented by'}
              </h2>
              <p className="text-warm-gray leading-relaxed">
                {isGerman ? 'Geschäftsführer:' : 'Managing Director:'} Max Mustermann
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                {isGerman ? 'Kontakt' : 'Contact'}
              </h2>
              <p className="text-warm-gray leading-relaxed">
                {isGerman ? 'Telefon:' : 'Phone:'} +49 123 456789<br />
                E-Mail: info@voyagenest.com
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                {isGerman ? 'Umsatzsteuer-ID' : 'VAT ID'}
              </h2>
              <p className="text-warm-gray leading-relaxed">
                {isGerman
                  ? 'Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:'
                  : 'VAT identification number according to §27a of the German VAT Act:'}<br />
                DE123456789
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                {isGerman ? 'Streitschlichtung' : 'Dispute Resolution'}
              </h2>
              <p className="text-warm-gray leading-relaxed">
                {isGerman
                  ? 'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:'
                  : 'The European Commission provides a platform for online dispute resolution (OS):'}
                <br />
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sunset hover:text-sunset-light"
                >
                  https://ec.europa.eu/consumers/odr
                </a>
              </p>
              <p className="text-warm-gray leading-relaxed mt-4">
                {isGerman
                  ? 'Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'
                  : 'We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.'}
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                {isGerman ? 'Haftung für Inhalte' : 'Liability for Content'}
              </h2>
              <p className="text-warm-gray leading-relaxed">
                {isGerman
                  ? 'Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht unter Umständen verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.'
                  : 'As a service provider, we are responsible for our own content on these pages in accordance with § 7 Abs.1 TMG. However, according to §§ 8 to 10 TMG, we are not obliged to monitor transmitted or stored third-party information.'}
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}

