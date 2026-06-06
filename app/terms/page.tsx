import { LegalLayout, LegalH2 } from "@/components/site/legal-layout";

export const metadata = { title: "Terms of Service | Review Your Doctor" };

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="June 2026">
      <p>
        These terms govern use of Review Your Doctor (the &ldquo;Service&rdquo;),
        operated by ShiftDeploy, by dental clinics (&ldquo;you&rdquo;).
      </p>

      <LegalH2>What the Service does</LegalH2>
      <p>
        The Service provides a QR-linked patient feedback form and a dashboard.
        Every patient is invited to share their experience. Patients who rate 1-3
        stars trigger a private alert to your practice manager so you can follow
        up. <strong>The Service does not block, filter, or withhold any review.</strong>{" "}
        Patients remain free to post publicly on Google regardless of their
        rating.
      </p>

      <LegalH2>Your responsibilities</LegalH2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Display the supplied consent wording on your reception QR poster so
          patients are informed before submitting contact details.
        </li>
        <li>Act as data controller for patient personal data you receive.</li>
        <li>Use patient contact details solely to follow up on feedback.</li>
      </ul>

      <LegalH2>Payment</LegalH2>
      <p>
        A <strong>30-day free trial</strong> applies, after which the Service is{" "}
        <strong>£49/month</strong> per clinic. No setup fee and no annual
        contract.
      </p>

      <LegalH2>Cancellation</LegalH2>
      <p>
        You may cancel at any time; the Service will stop at the end of your
        current billing period. On cancellation you may request deletion of your
        clinic&rsquo;s data.
      </p>

      <LegalH2>Limitation of liability</LegalH2>
      <p>
        The Service is provided &ldquo;as is&rdquo;. To the maximum extent
        permitted by law, our liability for any claim arising from the Service is
        limited to the fees paid in the preceding 3 months.
      </p>

      <LegalH2>Governing law</LegalH2>
      <p>
        These terms are governed by the laws of <strong>England and Wales</strong>,
        and disputes are subject to the exclusive jurisdiction of its courts.
      </p>

      <p className="text-sm text-muted-foreground">
        Questions:{" "}
        <a
          href="mailto:shiftdeploy@gmail.com"
          className="text-emerald-600 hover:underline"
        >
          shiftdeploy@gmail.com
        </a>
      </p>
    </LegalLayout>
  );
}
