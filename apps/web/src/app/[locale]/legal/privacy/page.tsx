import { getTranslations } from 'next-intl/server';
import { Card } from '@voyagenest/ui';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    title: locale === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy',
  };
}

export default async function PrivacyPage({
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
            {isGerman ? 'Datenschutzerklärung' : 'Privacy Policy'}
          </h1>

          <div className="prose prose-invert max-w-none space-y-8">
            {isGerman ? (
              <>
                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    1. Datenschutz auf einen Blick
                  </h2>
                  <h3 className="font-semibold text-pearl mt-4 mb-2">Allgemeine Hinweise</h3>
                  <p className="text-warm-gray leading-relaxed">
                    Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
                    personenbezogenen Daten passiert, wenn Sie diese Website besuchen.
                    Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert
                    werden können.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    2. Verantwortliche Stelle
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    VoyageNest GmbH<br />
                    Musterstraße 123<br />
                    10115 Berlin<br />
                    Deutschland<br /><br />
                    E-Mail: datenschutz@voyagenest.com<br />
                    Telefon: +49 123 456789
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    3. Datenerfassung auf dieser Website
                  </h2>
                  <h3 className="font-semibold text-pearl mt-4 mb-2">Cookies</h3>
                  <p className="text-warm-gray leading-relaxed">
                    Unsere Internetseiten verwenden teilweise so genannte Cookies. Cookies richten
                    auf Ihrem Rechner keinen Schaden an und enthalten keine Viren. Cookies dienen
                    dazu, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
                  </p>

                  <h3 className="font-semibold text-pearl mt-4 mb-2">Server-Log-Dateien</h3>
                  <p className="text-warm-gray leading-relaxed">
                    Der Provider der Seiten erhebt und speichert automatisch Informationen in so
                    genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    4. Ihre Rechte
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre
                    gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den
                    Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung oder Löschung
                    dieser Daten.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    5. Buchung und Kundenkonto
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    Bei der Buchung einer Ferienwohnung erheben wir folgende Daten: Name, E-Mail,
                    Telefonnummer, Adresse und Zahlungsinformationen. Diese Daten werden
                    ausschließlich zur Abwicklung der Buchung verwendet und nach den gesetzlichen
                    Aufbewahrungsfristen gelöscht.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    1. Privacy at a Glance
                  </h2>
                  <h3 className="font-semibold text-pearl mt-4 mb-2">General Information</h3>
                  <p className="text-warm-gray leading-relaxed">
                    The following information provides a simple overview of what happens to your
                    personal data when you visit this website. Personal data is any data that can
                    be used to personally identify you.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    2. Responsible Party
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    VoyageNest GmbH<br />
                    Musterstraße 123<br />
                    10115 Berlin<br />
                    Germany<br /><br />
                    Email: privacy@voyagenest.com<br />
                    Phone: +49 123 456789
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    3. Data Collection on This Website
                  </h2>
                  <h3 className="font-semibold text-pearl mt-4 mb-2">Cookies</h3>
                  <p className="text-warm-gray leading-relaxed">
                    Our website uses cookies. Cookies do not harm your computer and do not contain
                    viruses. Cookies are used to make our website more user-friendly, effective,
                    and secure.
                  </p>

                  <h3 className="font-semibold text-pearl mt-4 mb-2">Server Log Files</h3>
                  <p className="text-warm-gray leading-relaxed">
                    The provider of the pages automatically collects and stores information in
                    so-called server log files, which your browser automatically transmits to us.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    4. Your Rights
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    You have the right at any time to free information about your stored personal
                    data, its origin and recipients, and the purpose of data processing, as well
                    as the right to correction or deletion of this data.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    5. Booking and Customer Account
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    When booking a vacation rental, we collect the following data: name, email,
                    phone number, address, and payment information. This data is used exclusively
                    for processing the booking and is deleted after the statutory retention periods.
                  </p>
                </section>
              </>
            )}
          </div>

          <p className="text-sm text-warm-gray mt-8 pt-8 border-t border-navy-light">
            {isGerman
              ? 'Stand: Dezember 2024'
              : 'Last updated: December 2024'}
          </p>
        </Card>
      </div>
    </div>
  );
}

