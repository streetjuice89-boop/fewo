import { Card } from '@voyagenest/ui';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    title: locale === 'de' ? 'Allgemeine Geschäftsbedingungen' : 'Terms of Service',
  };
}

export default function TermsPage({
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
            {isGerman ? 'Allgemeine Geschäftsbedingungen' : 'Terms of Service'}
          </h1>

          <div className="prose prose-invert max-w-none space-y-8">
            {isGerman ? (
              <>
                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    1. Geltungsbereich
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    Diese Allgemeinen Geschäftsbedingungen gelten für alle Buchungen von
                    Ferienwohnungen über die Website VoyageNest. Mit der Buchung erkennen Sie
                    diese AGB an.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    2. Vertragsschluss
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    Der Mietvertrag kommt mit der Buchungsbestätigung per E-Mail zustande. Die
                    Buchung ist verbindlich, sobald Sie die Bestätigung erhalten haben.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    3. Preise und Zahlung
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    Alle angegebenen Preise verstehen sich pro Nacht und inkl. der gesetzlichen
                    Mehrwertsteuer. Die Zahlung erfolgt bei der Buchung. Wir akzeptieren
                    Kreditkarten und PayPal.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    4. Stornierung
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    Kostenlose Stornierung bis 14 Tage vor Anreise. Bei späterer Stornierung
                    werden folgende Gebühren fällig:
                  </p>
                  <ul className="list-disc list-inside text-warm-gray mt-2 space-y-1">
                    <li>14-7 Tage vor Anreise: 50% des Gesamtpreises</li>
                    <li>Weniger als 7 Tage: 100% des Gesamtpreises</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    5. Check-in/Check-out
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    Check-in ab 15:00 Uhr, Check-out bis 10:00 Uhr. Abweichende Zeiten nach
                    Vereinbarung möglich.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    6. Pflichten des Gastes
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    Der Gast verpflichtet sich, die Unterkunft pfleglich zu behandeln und bei
                    Abreise in einem ordentlichen Zustand zu hinterlassen. Für Schäden haftet
                    der Gast.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    7. Haftung
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    VoyageNest haftet nicht für persönliche Gegenstände des Gastes. Die Haftung
                    ist auf grobe Fahrlässigkeit und Vorsatz beschränkt.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    1. Scope
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    These Terms of Service apply to all bookings of vacation rentals through the
                    VoyageNest website. By booking, you acknowledge these terms.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    2. Contract Formation
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    The rental agreement is concluded upon receipt of the booking confirmation
                    by email. The booking is binding once you receive the confirmation.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    3. Prices and Payment
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    All prices are per night and include applicable taxes. Payment is due at
                    booking. We accept credit cards and PayPal.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    4. Cancellation
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    Free cancellation up to 14 days before arrival. For later cancellations,
                    the following fees apply:
                  </p>
                  <ul className="list-disc list-inside text-warm-gray mt-2 space-y-1">
                    <li>14-7 days before arrival: 50% of total price</li>
                    <li>Less than 7 days: 100% of total price</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    5. Check-in/Check-out
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    Check-in from 3:00 PM, check-out by 10:00 AM. Different times possible by
                    arrangement.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    6. Guest Obligations
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    The guest agrees to treat the accommodation with care and leave it in an
                    orderly condition upon departure. The guest is liable for damages.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                    7. Liability
                  </h2>
                  <p className="text-warm-gray leading-relaxed">
                    VoyageNest is not liable for personal belongings of the guest. Liability is
                    limited to gross negligence and intent.
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

