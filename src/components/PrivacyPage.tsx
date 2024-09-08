type Props = {
  companyName: string;
  companyEmail: string;
  companyAddress: string;
  companyLocation: string;
  updatedAt: string;
};

export default function Privacy({
  companyName,
  companyEmail,
  companyAddress,
  companyLocation,
  updatedAt,
}: Props) {
  return (
    <div className="text-wrapper">
      <h3>Privacy Policy</h3>
      <p>
        Protecting your private information is our priority. This Statement of
        Privacy applies to {companyName} pages and apps developed by
        {companyName} and governs data collection and usage. For the purposes of
        this Privacy Policy, unless otherwise noted, all references to{" "}
        {companyName} include {companyName} pages and apps developed by{" "}
        {companyName}. By using the {companyName}
        website and applications, you consent to the data practices described in
        this statement.
      </p>
      <h4>Collection of your Personal Information</h4>
      <p>
        In order to better provide you with products and services offered,
        {companyName} may collect personally identifiable information, such as
        your:
      </p>
      <ul>
        <li>First and Last Name</li>
        <li>E-mail Address</li>
      </ul>
      <p>
        We do not collect any personal information about you unless you
        voluntarily provide it to us. However, you may be required to provide
        certain personal information to us when you elect to use certain
        products or services. These may include: (a) registering for an account;
        (b) entering a sweepstakes or contest sponsored by us or one of our
        partners; (c) signing up for special offers from selected third parties;
        (d) sending us an email message; (e) submitting your credit card or
        other payment information when ordering and purchasing products and
        services. To wit, we will use your information for, but not limited to,
        communicating with you in relation to services and/or products you have
        requested from us. We also may gather additional personal or
        non-personal information in the future.
      </p>
      <h4>Use of your Personal Information</h4>
      <p>
        {companyName} collects and uses your personal information to operate and
        deliver the services you have requested.
      </p>
      <p>
        {companyName} may also use your personally identifiable information to
        inform you of other products or services available from
        {companyName} and its affiliates.
      </p>
      <h4>Sharing Information with Third Parties</h4>
      <p>
        {companyName} does not sell, rent or lease its customer lists to third
        parties.
      </p>
      <p>
        {companyName} may share data with trusted partners to help perform
        statistical analysis, send you email or postal mail, provide customer
        support, or arrange for deliveries. All such third parties are
        prohibited from using your personal information except to provide these
        services to {companyName}, and they are required to maintain the
        confidentiality of your information.
      </p>
      <p>
        {companyName} may disclose your personal information, without notice, if
        required to do so by law or in the good faith belief that such action is
        necessary to: (a) conform to the edicts of the law or comply with legal
        process served on {companyName} or the site; (b) protect and defend the
        rights or property of {companyName}; and/or (c) act under exigent
        circumstances to protect the personal safety of users of {companyName},
        or the public.
      </p>
      <h4>Right to Deletion</h4>
      <p>
        Subject to certain exceptions set out below, on receipt of a verifiable
        request from you, we will:
      </p>
      <ul>
        <li>Delete your personal information from our records; and</li>
        <li>
          Direct any service providers to delete your personal information from
          their records.
        </li>
      </ul>
      <p>
        Please note that we may not be able to comply with requests to delete
        your personal information if it is necessary to:
      </p>
      <ul>
        <li>
          Complete the transaction for which the personal information was
          collected, fulfill the terms of a written warranty or product recall
          conducted in accordance with federal law, provide a good or service
          requested by you, or reasonably anticipated within the context of our
          ongoing business relationship with you, or otherwise perform a
          contract between you and us;
        </li>
        <li>
          Detect security incidents, protect against malicious, deceptive,
          fraudulent, or illegal activity; or prosecute those responsible for
          that activity;
        </li>
        <li>
          Debug to identify and repair errors that impair existing intended
          functionality;
        </li>
        <li>
          Exercise free speech, ensure the right of another consumer to exercise
          his or her right of free speech, or exercise another right provided
          for by law;
        </li>
        <li>
          Comply with the California Electronic Communications Privacy Act;
        </li>
        <li>
          Engage in public or peer-reviewed scientific, historical, or
          statistical research in the public interest that adheres to all other
          applicable ethics and privacy laws, when our deletion of the
          information is likely to render impossible or seriously impair the
          achievement of such research, provided we have obtained your informed
          consent;
        </li>
        <li>
          Enable solely internal uses that are reasonably aligned with your
          expectations based on your relationship with us;
        </li>
        <li>Comply with an existing legal obligation; or</li>
        <li>
          Otherwise use your personal information, internally, in a lawful
          manner that is compatible with the context in which you provided the
          information.
        </li>
      </ul>

      <h4>Children Under Thirteen</h4>
      <p>
        {companyName} does not knowingly collect personally identifiable
        information from children under the age of thirteen. If you are under
        the age of thirteen, you must ask your parent or guardian for permission
        to use this application.
      </p>
      <h4>E-mail Communications</h4>
      <p>
        From time to time, {companyName} may contact you via email for the
        purpose of providing announcements, promotional offers, alerts,
        confirmations, surveys, and/or other general communication. If you would
        like to stop receiving marketing or promotional communications via email
        from {companyName}, you may opt out of such communications by clicking
        the unsubscribe link in the email message.
      </p>
      <h4>External Data Storage</h4>
      <p>
        Sites We may store your data on servers provided by third party hosting
        vendors with whom we have contracted.
      </p>
      <h4>Changes to this Statement</h4>
      <p>
        {companyName} reserves the right to change this Privacy Policy from time
        to time. We will notify you about significant changes in the way we
        treat personal information by sending a notice to the primary email
        address specified in your account, by placing a prominent notice on our
        application, and/or by updating any privacy information. Your continued
        use of the application and/or Services available after such
        modifications will constitute your: (a) acknowledgment of the modified
        Privacy Policy; and (b) agreement to abide and be bound by that Policy.
      </p>
      <h4>Contact Information</h4>
      <p>
        {companyName} welcomes your questions or comments regarding this
        Statement of Privacy. If you believe that {companyName} has not adhered
        to this Statement, please contact {companyName} at:
      </p>
      <p>
        {companyName}
        <br />
        {companyAddress}
        <br />
        {companyLocation}
      </p>
      <p>
        Email Address:
        <br />
        {companyEmail}
      </p>
      <h5>Last updated: {updatedAt}</h5>
    </div>
  );
}
