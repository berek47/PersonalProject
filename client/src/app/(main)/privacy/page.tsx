import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheckIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how LearnHub collects, uses, and protects your personal information.",
};

const sections = [
  {
    title: "Information We Collect",
    content: `We collect information you provide directly to us, such as when you create an account, enroll in a course, make a purchase, or contact us for support. This information may include:

• Name and email address
• Payment information (processed securely through Stripe)
• Profile information (such as profile picture and bio)
• Course progress and completion data
• Communications with instructors and support

We also automatically collect certain information when you use our platform, including your IP address, browser type, device information, and pages visited.`,
  },
  {
    title: "How We Use Your Information",
    content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Process transactions and send related information
• Send you technical notices, updates, and support messages
• Respond to your comments and questions
• Track your course progress and issue certificates
• Personalize your learning experience and recommend courses
• Monitor and analyze trends, usage, and activities
• Detect, investigate, and prevent fraudulent transactions and other illegal activities`,
  },
  {
    title: "Information Sharing",
    content: `We do not sell your personal information. We may share your information in the following circumstances:

• With instructors for courses you enroll in (limited to necessary information)
• With service providers who assist in our operations (payment processing, email delivery, analytics)
• To comply with legal obligations
• To protect the rights, privacy, safety, or property of LearnHub, our users, or the public
• In connection with a merger, acquisition, or sale of assets (with notice to users)`,
  },
  {
    title: "Data Security",
    content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:

• Encryption of data in transit and at rest
• Regular security assessments and penetration testing
• Access controls and authentication measures
• Secure payment processing through PCI-compliant providers
• Regular backup and disaster recovery procedures

However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "Your Rights and Choices",
    content: `You have the following rights regarding your personal information:

• Access: Request a copy of the personal information we hold about you
• Correction: Request that we correct inaccurate or incomplete information
• Deletion: Request that we delete your personal information
• Portability: Request a copy of your data in a machine-readable format
• Opt-out: Unsubscribe from marketing communications at any time
• Withdraw consent: Where processing is based on consent, you may withdraw it

To exercise these rights, please contact us at privacy@learnhub.com.`,
  },
  {
    title: "Cookies and Tracking",
    content: `We use cookies and similar technologies to:

• Keep you logged in to your account
• Remember your preferences and settings
• Understand how you use our platform
• Measure the effectiveness of our marketing campaigns
• Improve our services

You can control cookies through your browser settings. Note that disabling certain cookies may affect the functionality of our platform.`,
  },
  {
    title: "Children's Privacy",
    content: `Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will take steps to delete such information promptly.

For users between 13 and 18 years of age, we recommend parental guidance when using our platform.`,
  },
  {
    title: "International Data Transfers",
    content: `Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that are different from the laws of your country.

We ensure appropriate safeguards are in place when transferring data internationally, including standard contractual clauses approved by relevant authorities.`,
  },
  {
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.

We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.`,
  },
  {
    title: "Contact Us",
    content: `If you have any questions about this Privacy Policy or our privacy practices, please contact us at:

Email: privacy@learnhub.com
Address: 123 Learning Street, San Francisco, CA 94102
Phone: +1 (555) 123-4567

For data protection inquiries in the European Union, you may also contact our Data Protection Officer at dpo@learnhub.com.`,
  },
];

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheckIcon className="size-8 text-primary" />
          </div>
          <h1 className="mb-4 text-4xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Privacy Matters</CardTitle>
            <CardDescription>
              At LearnHub, we are committed to protecting your privacy and
              ensuring the security of your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our learning platform. By
              using LearnHub, you agree to the collection and use of information
              in accordance with this policy.
            </p>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line text-muted-foreground">
                  {section.content}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 rounded-lg border bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            By using LearnHub, you acknowledge that you have read and understood
            this Privacy Policy. If you do not agree with our policies and
            practices, please do not use our services.
          </p>
        </div>
      </div>
    </main>
  );
}
