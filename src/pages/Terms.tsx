import { useEffect } from "react";
import { FileText, Mail } from "lucide-react";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";

const sections = [
  {
    title: "Introduction",
    body: "These Terms & Conditions describe the general terms that apply when you visit NM Mart, use this website, create an account, or place an order through the available website services. By using the website, you acknowledge that you have read these terms.",
  },
  {
    title: "About NM Mart",
    body: "NM Mart is a grocery and wholesale shopping service serving customers through its store and digital channels. Product, delivery, payment, and support options may depend on the selected service area and current availability.",
  },
  {
    title: "Eligibility",
    body: "You should use this website only if you are legally able to enter into an agreement under the laws that apply to you. If you use the website for another person or organisation, you confirm that you are authorised to do so.",
  },
  {
    title: "Account Registration",
    body: "Some features require an authenticated account. You are responsible for providing information that is accurate and keeping your sign-in details secure. Please contact NM Mart if you believe that your account has been used without permission.",
  },
  {
    title: "Products and Product Information",
    body: "Product names, images, descriptions, pack details, prices, and availability are shown for shopping purposes. We aim to keep this information current, but product information may change and displayed images may not represent every packaging variation.",
  },
  {
    title: "Product Prices and Availability",
    body: "Prices and availability are based on the information available when you browse or place an order. Products may become unavailable, and displayed information may be corrected or updated when necessary.",
  },
  {
    title: "Orders and Order Acceptance",
    body: "Submitting an order is a request to purchase the selected products. An order is subject to product availability, delivery serviceability, payment or collection arrangements, and confirmation by NM Mart. We may contact you if clarification is needed.",
  },
  {
    title: "Payment",
    body: "The payment methods displayed during checkout are the methods currently made available by NM Mart. Payment details and order totals are handled through the applicable checkout flow. An order may not be completed if the selected payment or confirmation step is unsuccessful.",
  },
  {
    title: "Delivery",
    body: "Delivery is available only where NM Mart currently provides the service. Delivery details depend on the address, pincode, product availability, order information, and operational conditions at the time of the order. Customers should provide accurate delivery details and remain reachable when required.",
  },
  {
    title: "Cancellation",
    body: "Cancellation requests may depend on the order status and whether processing or delivery has already started. Contact NM Mart support as soon as possible if you need help with an order cancellation.",
  },
  {
    title: "Returns and Refunds",
    body: "Returns, replacements, and refunds are handled according to the product condition, order details, and the applicable NM Mart support decision. The website does not establish a universal return period or refund amount through these general terms. Please contact support for order-specific assistance.",
  },
  {
    title: "Damaged / Incorrect Products",
    body: "If an order appears damaged, incomplete, or different from what was ordered, contact NM Mart support with the relevant order details as soon as reasonably possible. The support team will review the information and advise on the available next step.",
  },
  {
    title: "Offers, Coupons and Promotions",
    body: "Offers, coupons, rewards, and promotions may have their own displayed conditions, eligibility requirements, availability, or expiry information. Where a promotion has specific terms, those terms apply to that promotion. Promotions are subject to availability and may be changed or withdrawn when permitted.",
  },
  {
    title: "User Responsibilities",
    body: "You must use the website lawfully, provide accurate order and account information, avoid misuse of website services, and not attempt to interfere with the website, its security, or another customer's account.",
  },
  {
    title: "Intellectual Property",
    body: "Website content, branding, text, images, layouts, and other materials are provided for use of the NM Mart services. You may not copy, modify, distribute, or commercially use that content except where permitted by law or with appropriate permission.",
  },
  {
    title: "Privacy",
    body: "The handling of personal information is described in the NM Mart Privacy Policy. By using the website, you should also review the Privacy Policy available through the website footer and other legal navigation.",
  },
  {
    title: "Limitation of Liability",
    body: "To the extent permitted by applicable law, NM Mart is not responsible for losses caused by information supplied incorrectly by a user, events outside reasonable operational control, temporary website unavailability, or a user's misuse of the website. Nothing in these terms limits a right or responsibility that cannot legally be limited.",
  },
  {
    title: "Changes to Terms",
    body: "These terms may be updated when the website services, policies, or applicable requirements change. The updated version will be made available on this page, and continued use of the website after an update may be subject to the revised terms.",
  },
  {
    title: "Contact / Customer Support",
    body: "For questions about an order, product, delivery, payment, or these terms, use the NM Mart Contact page or the support contact details displayed in the website footer.",
  },
  {
    title: "Governing Law",
    body: "These terms are intended to be interpreted under the laws that apply to the relevant transaction and the parties. Any specific governing jurisdiction or dispute process is not configured in this general website page and should be confirmed through the appropriate NM Mart policy or agreement.",
  },
  {
    title: "Contact Us",
    body: "You can contact NM Mart through the Contact Us page or by emailing support@nmmart.in. Please include enough order or account information for the support team to identify your request, and do not include passwords or other sensitive authentication information.",
  },
];

export default function Terms() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Terms & Conditions | NM Mart";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header />
      <main className="nm-page-shell flex-1 py-6 md:py-10">
        <header className="mb-6 text-center md:mb-8">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
            <FileText size={14} /> NM Mart Legal Information
          </div>
          <h1 className="mt-4 text-3xl font-black uppercase tracking-[-0.06em] text-slate-900 md:text-5xl">Terms &amp; Conditions</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">Please read these general terms before using the NM Mart website or placing an order.</p>
        </header>

        <article className="nm-card p-5 sm:p-8 md:p-10">
          <div className="space-y-8 md:space-y-10">
            {sections.map((section, index) => (
              <section key={section.title} className="border-b border-slate-100 pb-8 last:border-0 last:pb-0 md:pb-10">
                <h2 className="text-lg font-black uppercase tracking-[-0.02em] text-slate-900 sm:text-xl">
                  <span className="mr-2 text-primary">{index + 1}.</span>
                  {section.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 sm:flex-row sm:items-center">
            <Mail className="shrink-0 text-primary" size={18} />
            <p className="text-sm leading-6 text-slate-600">
              Questions about these terms? <a href="mailto:support@nmmart.in" className="font-bold text-primary hover:underline">Contact NM Mart support</a>.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
