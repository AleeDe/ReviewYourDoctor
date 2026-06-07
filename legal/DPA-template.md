# Data Processing Agreement (DPA)

**Under Article 28 of the UK GDPR**

This Data Processing Agreement ("DPA") forms part of the agreement between:

- **Data Controller:** ______________________ (the "Clinic")
- **Data Processor:** Review Your Doctor, operated by ShiftDeploy (the "Processor")

Effective date: ______________________

---

## 1. Subject matter and duration
The Processor processes personal data on behalf of the Clinic for the duration of
the Clinic's subscription to the Review Your Doctor service, and until data is
deleted in accordance with Section 6.

## 2. Nature and purpose of processing
Collecting and storing patient feedback (star ratings and, on the negative flow,
optional contact details and a reason) so the Clinic can monitor service quality
and follow up privately with patients who report a poor experience.

## 3. Type of personal data
- Star rating (always; anonymous for positive ratings)
- On 1-3★ submissions only, where the patient chooses to provide them: name,
  email address, phone number, and a free-text reason.
- No special-category (medical/treatment) data is requested. If a patient
  voluntarily includes health information in free text, the Clinic (Controller)
  remains responsible for handling it appropriately.

## 4. Categories of data subjects
Patients of the Clinic who submit feedback.

## 5. Obligations and rights of the Controller (Clinic)
The Clinic determines the purposes of processing, ensures patients are informed
(via the supplied poster and form consent wording), and is responsible for
responding to data-subject requests, with the Processor's assistance.

## 6. Processor obligations
The Processor shall:
- Process personal data only on the Clinic's documented instructions.
- Ensure persons authorised to process the data are bound by confidentiality.
- Implement appropriate technical and organisational measures (encryption in
  transit and at rest).
- Assist the Clinic with data-subject requests and breach notification.
- Delete negative-feedback personal data after **12 months**, or earlier on the
  Clinic's written request, and delete all data on termination.

## 7. Sub-processors
The Clinic authorises the following sub-processor:

| Sub-processor | Purpose | Data residency / transfer |
|---|---|---|
| Supabase | Database, authentication, storage, email function | UK/EU |
| Vercel | Application hosting, CDN, DNS/edge | Global edge (US company); SCCs / UK Addendum |
| Email/SMTP provider | Sends the manager alert email | Per configured provider |
| Google (Places API) | Optional live rating (place identifier only, no patient data) | US; safeguards apply |
| Payment provider (PayPal/Stripe) | Billing the Clinic (no patient data) | Per provider |

The Processor will inform the Clinic of any intended changes to sub-processors.
Analytics / error-monitoring providers are not currently used and will be added
here (consent-gated) before any activation.

## 8. International transfers
Personal data is stored within the UK/EU. Any transfer outside the UK will rely
on appropriate safeguards under UK GDPR.

## 9. Audit
The Processor will make available information necessary to demonstrate compliance
with Article 28 and allow for reasonable audits by the Clinic.

---

**Signed for the Clinic:** ______________________  Date: __________

**Signed for the Processor (Review Your Doctor / ShiftDeploy):** ______________________  Date: __________

> Template only. Customise with your ICO registration number and details, and
> have it reviewed by a qualified adviser before use. A free UK GDPR DPA template
> is also available from the ICO at ico.org.uk.
