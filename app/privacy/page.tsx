import { LegalLayout, LegalH2 } from "@/components/site/legal-layout";

export const metadata = { title: "Privacy Policy | Review Your Doctor" };

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 2026">
      <p>
        Review Your Doctor (&ldquo;we&rdquo;, &ldquo;us&rdquo;), operated by
        ShiftDeploy, provides a patient-feedback tool to dental clinics. This
        policy explains how patient personal data is handled. We operate as a{" "}
        <strong>data processor</strong> under the UK GDPR and the Data Protection
        Act 2018; the clinic is the <strong>data controller</strong>.
      </p>

      <LegalH2>What data we collect</LegalH2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>4-5 star ratings:</strong> an anonymous star rating only, with
          no personal data.
        </li>
        <li>
          <strong>1-3 star ratings:</strong> the star rating, an optional reason,
          and any contact details the patient chooses to provide (name, email,
          phone). All contact fields are optional.
        </li>
        <li>No medical data is ever collected.</li>
      </ul>

      <LegalH2>Why we collect it (lawful basis)</LegalH2>
      <p>
        Our lawful basis is <strong>legitimate interests</strong>: enabling the
        clinic to improve service quality and follow up privately with patients
        who report a poor experience. Data is never used for marketing.
      </p>

      <LegalH2>Who has access</LegalH2>
      <p>
        Negative-feedback contact details are accessible only to the relevant
        clinic&rsquo;s practice manager. We do not share patient data with any
        third parties.
      </p>

      <LegalH2>How long we keep it</LegalH2>
      <p>
        Negative-feedback submissions are retained for a maximum of{" "}
        <strong>12 months</strong>, after which they are automatically deleted. A
        clinic may request earlier deletion of its data at any time.
      </p>

      <LegalH2>Security</LegalH2>
      <p>
        Data is encrypted in transit and at rest and stored on our infrastructure
        provider, <strong>Supabase</strong> (declared sub-processor), with UK/EU
        data residency.
      </p>

      <LegalH2>Your rights</LegalH2>
      <p>
        Under UK GDPR (Articles 15-20) patients have the right to access,
        rectification, erasure, restriction, and portability of their personal
        data. To exercise any right, contact the clinic (data controller) or us
        using the details below.
      </p>

      <LegalH2>Data processor &amp; contact</LegalH2>
      <p>
        Data processor: Review Your Doctor / ShiftDeploy.
        <br />
        Data queries:{" "}
        <a
          href="mailto:contact@shiftdeploy.com"
          className="text-emerald-600 hover:underline"
        >
          contact@shiftdeploy.com
        </a>
        <br />
        ICO registration number: <em>pending registration</em>.
      </p>

      <p className="text-sm text-muted-foreground">
        A Data Processing Agreement (DPA) under UK GDPR Article 28 is provided to
        every clinic before go-live.
      </p>
    </LegalLayout>
  );
}
