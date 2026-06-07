import Link from "next/link";
import { LegalLayout, LegalH2 } from "@/components/site/legal-layout";

export const metadata = { title: "Data Processing Agreement | Review Your Doctor" };

export default function DpaPage() {
  return (
    <LegalLayout title="Data Processing Agreement (DPA)" updated="June 2026">
      <p>
        This Data Processing Agreement (&ldquo;DPA&rdquo;) forms <strong>Schedule
        1 to the Terms of Service</strong> and is entered into between the dental
        clinic (&ldquo;Controller&rdquo;) and Review Your Doctor, operated by
        ShiftDeploy (&ldquo;Processor&rdquo;). It governs the processing of
        personal data under UK GDPR Article 28 and is <strong>accepted by the
        clinic on sign-up, before go-live</strong>.
      </p>

      <LegalH2>1. Parties</LegalH2>
      <p>
        The <strong>clinic is the data controller</strong>; Review Your Doctor /
        ShiftDeploy is the <strong>data processor</strong>. The Controller
        determines the purposes and means of processing; the Processor acts only
        on the Controller&rsquo;s documented instructions.
      </p>

      <LegalH2>2. Subject matter</LegalH2>
      <p>
        Patient feedback collection and operation of the clinic dashboard,
        including the QR feedback form, ratings, private negative-feedback capture,
        manager alerts, and analytics display.
      </p>

      <LegalH2>3. Duration</LegalH2>
      <p>
        The subscription term, plus the agreed retention/deletion period
        (negative-feedback personal data is retained for up to 12 months, then
        deleted), subject to backup cycles and legal obligations.
      </p>

      <LegalH2>4. Nature and purpose of processing</LegalH2>
      <p>
        Collecting, storing, displaying, and notifying clinic staff about patient
        feedback, so the Controller can monitor service quality and follow up
        privately with dissatisfied patients.
      </p>

      <LegalH2>5. Categories of data subjects</LegalH2>
      <p>Patients of the clinic, or representatives, who submit feedback.</p>

      <LegalH2>6. Categories of personal data</LegalH2>
      <p>
        Optional name, email, and phone number; free-text feedback (reason); star
        rating; timestamp; clinic identifier; and technical metadata where
        necessary for security and service delivery. For 4-5 star submissions,
        only an anonymous rating is recorded.
      </p>

      <LegalH2>7. Special category data</LegalH2>
      <p>
        <strong>No medical or treatment data is requested.</strong> If a patient
        voluntarily includes health information in free-text feedback, the
        <strong> Controller remains responsible</strong> for handling it
        appropriately, and the Processor will process it only as part of providing
        the service.
      </p>

      <LegalH2>8. Subprocessors and prior authorisation</LegalH2>
      <p>
        The Controller authorises the subprocessors listed in our{" "}
        <Link href="/privacy" className="text-emerald-600 hover:underline">
          Privacy Policy
        </Link>{" "}
        (currently Supabase, Vercel, the email/SMTP provider, Google Places, and a
        payment provider). The Processor will give prior notice of any intended
        addition or replacement of a subprocessor, allowing the Controller a
        reasonable opportunity to object on reasonable data-protection grounds.
      </p>

      <LegalH2>9. Security measures</LegalH2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Encryption in transit (TLS) and at rest where available.</li>
        <li>Access controls and least-privilege access; row-level security so a clinic only ever sees its own data.</li>
        <li>Managed backups and activity logging.</li>
        <li>Confidentiality obligations on authorised personnel.</li>
        <li>
          Breach notification: the Processor will notify the Controller without
          undue delay after becoming aware of a personal data breach and assist
          with the Controller&rsquo;s notification obligations.
        </li>
      </ul>

      <LegalH2>10. Deletion / return</LegalH2>
      <p>
        On cancellation or upon a verified request, the Processor will delete (or
        return) the Controller&rsquo;s personal data, subject to backup cycles and
        any legal retention obligations.
      </p>

      <LegalH2>11. Assistance</LegalH2>
      <p>
        The Processor will assist the Controller, taking into account the nature
        of processing, with data-subject requests for access, rectification,
        erasure, restriction, and portability, and will cooperate with audits and
        information requests necessary to demonstrate Article 28 compliance.
      </p>

      <LegalH2>12. International transfers</LegalH2>
      <p>
        Patient data is stored in the UK/EU. Where data is processed outside the
        UK/EU by a subprocessor, appropriate safeguards apply (UK IDTA/Addendum or
        Standard Contractual Clauses). See the Privacy Policy for details.
      </p>

      <LegalH2>13. Governing law</LegalH2>
      <p>
        This DPA is governed by the laws of England and Wales and forms part of
        the Terms of Service.
      </p>

      <p className="text-sm text-muted-foreground">
        Acceptance: by ticking the consent box at sign-up (or by signing the
        offline version on onboarding), the Controller accepts this DPA. Data
        queries:{" "}
        <a
          href="mailto:contact@shiftdeploy.com"
          className="text-emerald-600 hover:underline"
        >
          contact@shiftdeploy.com
        </a>
        .
      </p>
    </LegalLayout>
  );
}
