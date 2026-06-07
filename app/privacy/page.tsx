import { LegalLayout, LegalH2 } from "@/components/site/legal-layout";
import { CookiePrefsLink } from "@/components/cookie/cookie-prefs-link";

export const metadata = { title: "Privacy Policy | Review Your Doctor" };

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 2026">
      <p>
        Review Your Doctor (&ldquo;we&rdquo;, &ldquo;us&rdquo;), operated by
        ShiftDeploy, provides a patient-feedback tool to dental clinics. This
        policy explains how patient personal data is handled. We operate as a{" "}
        <strong>data processor</strong> under the UK GDPR and the Data Protection
        Act 2018; the clinic is the <strong>data controller</strong> and decides
        why patient feedback is collected. We process it only to provide the
        service on the clinic&rsquo;s instructions.
      </p>

      <LegalH2>What data we collect (data minimisation)</LegalH2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>4-5 star ratings:</strong> an anonymous star rating only, with
          no personal data.
        </li>
        <li>
          <strong>1-3 star ratings:</strong> the star rating, an optional reason,
          and any contact details (name, email, phone) <strong>only where the
          patient voluntarily provides them</strong> so the clinic can follow up.
          All contact fields are optional and never required.
        </li>
        <li>No medical data is ever collected.</li>
      </ul>

      <LegalH2>Why we collect it (lawful basis)</LegalH2>
      <p>
        Our lawful basis is <strong>legitimate interests</strong>: enabling the
        clinic to improve service quality and follow up privately with patients
        who report a poor experience. Data is never used for marketing. As a
        processor we do not decide independent purposes for patient data.
      </p>

      <LegalH2>Who has access</LegalH2>
      <p>
        Negative-feedback contact details are accessible only to the relevant
        clinic&rsquo;s practice manager. We do not sell or share patient data with
        any third parties beyond the subprocessors listed below.
      </p>

      <LegalH2>How long we keep it</LegalH2>
      <p>
        Negative-feedback submissions are retained for a maximum of{" "}
        <strong>12 months</strong>, after which they are automatically deleted. A
        clinic may request earlier deletion of its data at any time.
      </p>

      <LegalH2>Cookies</LegalH2>
      <p>We use three categories of cookies:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Essential</strong> (always active): required for login,
          security, session handling, and core operation. Typically last for the
          session or a short period.
        </li>
        <li>
          <strong>Analytics</strong> (off unless you accept): help us understand
          usage and improve the product.
        </li>
        <li>
          <strong>Marketing</strong> (off unless you accept): used only if paid
          ads or retargeting pixels are ever added.
        </li>
      </ul>
      <p>
        Non-essential cookies are blocked until you opt in. Your choice is
        remembered for up to 12 months. You can change or withdraw consent at any
        time via{" "}
        <CookiePrefsLink className="font-medium text-emerald-600 hover:underline" />
        .
      </p>

      <LegalH2>Subprocessors</LegalH2>
      <p>
        We use the following infrastructure providers to deliver the service.
        Any new subprocessor will be added here before it processes patient data.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4 font-semibold">Provider</th>
              <th className="py-2 pr-4 font-semibold">Purpose</th>
              <th className="py-2 font-semibold">Location / transfer</th>
            </tr>
          </thead>
          <tbody className="align-top">
            {[
              ["Supabase", "Database, authentication, file storage, email function", "UK/EU data region"],
              ["Vercel", "Application hosting, CDN, DNS/edge delivery", "Global edge (US company); SCCs / UK Addendum"],
              ["Email/SMTP provider", "Sends the manager alert email", "Per your configured provider"],
              ["Google (Places API)", "Optional live rating; only a place identifier is sent, no patient data", "US; safeguards apply"],
              ["Payment provider (e.g. PayPal/Stripe)", "Billing the clinic (no patient data)", "Per provider"],
              ["Analytics / error monitoring", "Not currently used; listed here before any future activation (consent-gated)", "TBC"],
            ].map(([p, why, loc]) => (
              <tr key={p} className="border-b last:border-0">
                <td className="py-2 pr-4 font-medium">{p}</td>
                <td className="py-2 pr-4 text-muted-foreground">{why}</td>
                <td className="py-2 text-muted-foreground">{loc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LegalH2>International transfers</LegalH2>
      <p>
        Patient personal data is stored within the <strong>UK/EU</strong>{" "}
        (Supabase region). Some providers (such as Vercel and Google) are
        US-based or operate globally. Where UK/EU personal data is accessed or
        processed outside the UK/EU, we rely on appropriate safeguards such as the
        UK <strong>International Data Transfer Agreement (IDTA)</strong> /
        Addendum or <strong>Standard Contractual Clauses (SCCs)</strong>.
      </p>

      <LegalH2>Children and minors</LegalH2>
      <p>
        Dental patients may include children. Feedback involving a child should be
        submitted by a parent or guardian, or handled by the clinic directly. We
        do not knowingly collect personal data from children without an
        appropriate adult acting on their behalf.
      </p>

      <LegalH2>Your rights</LegalH2>
      <p>
        Under UK GDPR (Articles 15-20) patients have the right to access,
        rectification, erasure, restriction, and portability of their personal
        data. You can contact either the <strong>clinic</strong> (the data
        controller) or us as the <strong>processor</strong> using the details
        below; where legally required, we will route the request to the relevant
        clinic.
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
        every clinic before go-live, defining processing instructions,
        confidentiality, security, subprocessors, assistance with rights requests,
        deletion/return of data, and audit cooperation.
      </p>
    </LegalLayout>
  );
}
