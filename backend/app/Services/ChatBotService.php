<?php

namespace App\Services;

class ChatBotService
{
    /**
     * FAQ responses for the chat bot
     */
    protected array $faqResponses = [
        'buchung' => [
            'keywords' => ['buchen', 'buchung', 'reservieren', 'reservierung', 'book', 'booking'],
            'response' => 'Um eine Unterkunft zu buchen, wählen Sie einfach Ihre gewünschte Unterkunft aus, geben Sie Ihren Reisezeitraum ein und folgen Sie dem Buchungsprozess. Bei Fragen zur Buchung helfe ich Ihnen gerne weiter!',
        ],
        'stornierung' => [
            'keywords' => ['stornieren', 'stornierung', 'absagen', 'cancel', 'storno'],
            'response' => 'Stornierungen können je nach Unterkunft unterschiedliche Bedingungen haben. In der Regel können Sie bis 24-48 Stunden vor Anreise kostenlos stornieren. Bitte prüfen Sie die Stornierungsbedingungen Ihrer Buchung oder kontaktieren Sie unseren Support.',
        ],
        'zahlung' => [
            'keywords' => ['bezahlen', 'zahlung', 'payment', 'preis', 'kosten', 'geld'],
            'response' => 'Wir akzeptieren alle gängigen Zahlungsmethoden wie Kreditkarte, PayPal und Banküberweisung. Die Zahlung erfolgt sicher über unsere verschlüsselte Zahlungsplattform.',
        ],
        'checkin' => [
            'keywords' => ['check-in', 'checkin', 'ankunft', 'schlüssel', 'einzug', 'anreise'],
            'response' => 'Die Check-in-Zeit ist in der Regel ab 15:00 Uhr. Sie erhalten vor Ihrer Anreise alle notwendigen Informationen per E-Mail, einschließlich Anfahrtsbeschreibung und Schlüsselübergabe.',
        ],
        'checkout' => [
            'keywords' => ['check-out', 'checkout', 'abreise', 'auszug'],
            'response' => 'Der Check-out erfolgt in der Regel bis 11:00 Uhr am Abreisetag. Bitte hinterlassen Sie die Unterkunft in einem ordentlichen Zustand.',
        ],
        'ausstattung' => [
            'keywords' => ['ausstattung', 'wifi', 'wlan', 'internet', 'parkplatz', 'pool', 'küche'],
            'response' => 'Jede Unterkunft hat unterschiedliche Ausstattungsmerkmale. Sie finden alle Details auf der jeweiligen Unterkunftsseite. Standard sind WLAN, voll ausgestattete Küche und alle notwendigen Haushaltsgeräte.',
        ],
        'kontakt' => [
            'keywords' => ['kontakt', 'telefon', 'email', 'support', 'hilfe', 'help'],
            'response' => 'Unser Support-Team ist Mo-Fr von 9-18 Uhr erreichbar. Sie können uns auch jederzeit eine Nachricht hier im Chat hinterlassen, und wir melden uns schnellstmöglich zurück.',
        ],
        'haustiere' => [
            'keywords' => ['haustier', 'hund', 'katze', 'tier', 'pet', 'dog', 'cat'],
            'response' => 'Die Haustierregelung variiert je nach Unterkunft. Bitte prüfen Sie die Beschreibung der gewünschten Unterkunft oder kontaktieren Sie uns für spezifische Anfragen.',
        ],
        'gruß' => [
            'keywords' => ['hallo', 'hi', 'hey', 'guten tag', 'moin', 'servus', 'hello'],
            'response' => 'Hallo! Willkommen bei VoyageNest. Wie kann ich Ihnen heute behilflich sein?',
        ],
    ];

    /**
     * Get bot response for a message
     */
    public function getResponse(string $message): array
    {
        $messageLower = mb_strtolower($message);
        
        // Check for FAQ matches
        foreach ($this->faqResponses as $category => $data) {
            foreach ($data['keywords'] as $keyword) {
                if (str_contains($messageLower, $keyword)) {
                    return [
                        'message' => $data['response'],
                        'needsHuman' => false,
                        'category' => $category,
                    ];
                }
            }
        }

        // No match found - need human assistance
        return [
            'message' => 'Vielen Dank für Ihre Nachricht. Ich bin nicht sicher, ob ich Ihnen bei diesem Anliegen helfen kann. Ich leite Ihre Anfrage an einen Mitarbeiter weiter, der sich in Kürze bei Ihnen meldet.',
            'needsHuman' => true,
            'category' => 'unknown',
        ];
    }

    /**
     * Add custom FAQ response
     */
    public function addFaqResponse(string $category, array $keywords, string $response): void
    {
        $this->faqResponses[$category] = [
            'keywords' => $keywords,
            'response' => $response,
        ];
    }
}

