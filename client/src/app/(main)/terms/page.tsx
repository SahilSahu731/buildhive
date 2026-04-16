import React from "react";

export const metadata = {
  title: "Terms of Service | vibeship",
  description: "Terms of Service for vibeship",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p>
            By accessing or using our services at <strong>vibeship</strong>, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
            </p>
        </section>

        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Use of Service</h2>
            <p>
            You are responsible for your use of the Service and for any content you provide, including compliance with applicable laws. You may not use the Service for any illegal or unauthorized purpose.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>You must not transmit any worms or viruses or any code of a destructive nature.</li>
                <li>You must not reproduce, duplicate, copy, sell, resell or exploit any portion of the Service without express written permission by us.</li>
            </ul>
        </section>

        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p>
            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
        </section>

        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
            <p>
            The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of vibeship and its licensors.
            </p>
        </section>

        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Termination</h2>
            <p>
            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
        </section>

        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Changes to Terms</h2>
            <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
        </section>
      </div>
    </div>
  );
}
