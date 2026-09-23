import type { ChatRequest, Conversation, Message } from '../types';

export interface ShieldProduct {
  id: string;
  name: string;
  badge: string;
  amountRange: string;
  speed: string;
  termRange: string;
  minRevenue: string;
  description: string;
  highlights: string[];
  bestFor: string;
  applyUrl: string;
}

export const SHIELD_PRODUCTS: ShieldProduct[] = [
  {
    id: 'mca',
    name: 'Merchant Cash Advance (MCA)',
    badge: '⚡ Fastest Funding',
    amountRange: '$5,000 – $500,000+',
    speed: '24 – 48 Hours',
    termRange: '3 – 18 Months',
    minRevenue: '$10,000 / mo',
    description: 'Advance capital against your future credit card and business receivables with flexible daily or weekly remittances tied directly to sales volume.',
    highlights: [
      'No strict collateral requirements',
      'Bad or fair credit (500+ FICO) accepted',
      'Remittances adjust automatically with your cash flow',
      'Fast approvals within 2 to 4 business hours',
    ],
    bestFor: 'Retailers, restaurants, e-commerce, seasonal businesses needing immediate working capital.',
    applyUrl: 'https://shieldfunding.com/apply/',
  },
  {
    id: 'loc',
    name: 'Business Line of Credit',
    badge: '🔄 Maximum Flexibility',
    amountRange: '$10,000 – $250,000',
    speed: '1 – 3 Business Days',
    termRange: 'Revolving (6 – 24 mo)',
    minRevenue: '$15,000 / mo',
    description: 'A revolving credit facility you can draw from anytime. Only pay interest on the exact funds you withdraw, with capital replenishing as you repay.',
    highlights: [
      'Pay interest only on drawn capital',
      'Draw funds on-demand via online portal',
      'Builds business credit history',
      'Reusable emergency cash cushion',
    ],
    bestFor: 'Managing cash flow gaps, payroll emergencies, seasonal inventory purchases.',
    applyUrl: 'https://shieldfunding.com/apply/',
  },
  {
    id: 'term_loans',
    name: 'Small Business Term Loans',
    badge: '📊 Predictable Fixed Rates',
    amountRange: '$10,000 – $1,000,000+',
    speed: '2 – 4 Business Days',
    termRange: '6 – 36 Months',
    minRevenue: '$15,000 / mo',
    description: 'Lump-sum financing with predictable, fixed monthly or weekly payments and transparent rates for major expansion projects and growth.',
    highlights: [
      'Fixed predictable payment schedules',
      'Competitive interest rates from 8.99%',
      'No prepayment penalties on select loan tiers',
      'Generous terms up to 3 years',
    ],
    bestFor: 'Business expansion, second location openings, hiring, large inventory bulk orders.',
    applyUrl: 'https://shieldfunding.com/apply/',
  },
  {
    id: 'equipment',
    name: 'Equipment Financing',
    badge: '🚜 Up to 100% Financed',
    amountRange: '$10,000 – $2,000,000',
    speed: '2 – 5 Business Days',
    termRange: '2 – 7 Years',
    minRevenue: '$10,000 / mo',
    description: 'Finance heavy machinery, commercial vehicles, technology, medical equipment, or restaurant appliances with the equipment itself serving as collateral.',
    highlights: [
      'Up to 100% of equipment cost covered',
      'Potential Section 179 tax deduction benefits',
      'Does not tie up operational working capital',
      'Fixed monthly payments matched to equipment life',
    ],
    bestFor: 'Construction, medical practices, trucking/logistics, manufacturing, restaurants.',
    applyUrl: 'https://shieldfunding.com/apply/',
  },
  {
    id: 'factoring',
    name: 'Invoice Factoring / A/R Financing',
    badge: '🧾 Zero Debt Incurred',
    amountRange: '$20,000 – $1,500,000',
    speed: '24 – 48 Hours',
    termRange: '30 – 90 Days Net Terms',
    minRevenue: '$20,000 / mo in B2B Invoices',
    description: 'Sell your outstanding B2B invoices to receive up to 90% immediate cash advance, eliminating the wait on 30, 60, or 90-day client payment cycles.',
    highlights: [
      'Advance up to 90% of invoice value in 24 hours',
      'Approval based on your customer’s creditworthiness',
      'Not a loan — zero balance sheet debt',
      'Scales automatically as your sales grow',
    ],
    bestFor: 'B2B wholesalers, staffing agencies, transportation, government contractors.',
    applyUrl: 'https://shieldfunding.com/apply/',
  },
  {
    id: 'sba',
    name: 'SBA 7(a) & Express Loans',
    badge: '🏛️ Lowest Long-Term Rates',
    amountRange: '$50,000 – $5,000,000',
    speed: '2 – 4 Weeks',
    termRange: '10 – 25 Years',
    minRevenue: '$25,000 / mo',
    description: 'Government-backed loans offering the lowest interest rates and longest repayment terms on the market for established businesses.',
    highlights: [
      'Prime-based low interest rates',
      'Long-term amortizations up to 25 years',
      'Largest capital availability up to $5M',
      'Refinance existing high-cost commercial debt',
    ],
    bestFor: 'Commercial real estate purchase, business acquisition, debt consolidation.',
    applyUrl: 'https://shieldfunding.com/apply/',
  },
];

// Shield Funding Official Knowledge Base Responses Engine
export function generateShieldResponse(query: string): string {
  const q = query.toLowerCase().trim();

  // 1. Business Line of Credit (LOC) & Revolving Credit / Draws / LOC Rates
  if (
    q.includes('line of credit') ||
    q.includes('credit line') ||
    q.includes('loc') ||
    (q.includes('draw') && !q.includes('withdrawn') && !q.includes('drawing pictures')) ||
    (q.includes('revolving') && (q.includes('credit') || q.includes('capital') || q.includes('rate') || q.includes('fund')))
  ) {
    if (q.includes('rate') || q.includes('interest') || q.includes('cost') || q.includes('fee') || q.includes('apr') || q.includes('draw')) {
      return `### 🔄 Business Line of Credit: Interest Rates & Draw Structure

For a **Business Line of Credit** with Shield Funding, interest and fees are structured on a flexible revolving basis:

---

#### 📊 Interest Rates & Pricing Details:
* **Monthly Interest Rate:** **1% – 6% per month** applied **only** to the active drawn balance *(starts at approximately **14% annual finance charge**)*.
* **Pay Only What You Use:** You **never** pay interest on your unused credit limit. If you have a $100,000 credit line and draw $20,000, you only accrue interest on that $20,000.
* **Draw Fees:** Typically **0% to 4%** per draw, depending on your business credit and revenue profile.
* **Credit Limit Available:** Up to **$200,000** (with no minimum requirement).
* **Repayment Frequency:** Convenient **monthly payments**.
* **Facility Duration:** **24 Months**, fully renewable as you maintain good repayment standing.

---

#### 💡 How Revolving Draws Work:
1. **On-Demand Access:** Draw funds 24/7 whenever an emergency, payroll, or business opportunity arises.
2. **Instant Replenishment:** As you pay down your monthly balance, your available capital replenishes automatically back to your maximum credit limit.
3. **No Prepayment Penalties:** Pay off drawn balances at any time without fees to minimize total interest expense.

---

#### 📋 Basic Qualifications:
* **4+ Months** in business  
* **$10,000+** monthly gross revenue ($120k/year)  
* Active U.S. Business Checking Account  
* **Soft credit pull only** — reviewing offers will **not** impact your personal FICO score.

Would you like to calculate estimated payments or speak directly with a funding advisor at **[(888) 882-6117](tel:8888826117)**?`;
    }

    return `### 🔄 Shield Funding Business Line of Credit Overview

A **Business Line of Credit** provides flexible, revolving access to capital that you can draw against anytime cash flow fluctuates or new opportunities arise.

---

#### 🛡️ Key Features:
* **Credit Limit:** Up to **$200,000** (no minimum requirement).
* **Monthly Interest:** **1% to 6% per month** *(starts at ~14% annual finance charge)*.
* **Pay Interest Only on Drawn Funds:** Zero cost while your line sits untouched.
* **Draw Fees:** **0% to 4%**.
* **Repayment Schedule:** Flexible **monthly payments**.
* **Term:** **24 Months**, renewable.
* **Speed:** Access funds in **1 to 3 business days** via direct ACH transfer.

---

#### 💡 When to Use a Line of Credit:
* Managing seasonal inventory peaks and supplier discounts
* Bridging customer payment gaps (accounts receivable lag)
* Covering unexpected emergency repairs or payroll timing
* Keeping a safety net for sudden business opportunities

Would you like to check pre-qualification requirements or see how much your business can be approved for?`;
  }

  // 2. Merchant Cash Advance (MCA) Rates & Terms
  if (
    q.includes('mca') ||
    q.includes('merchant cash advance') ||
    q.includes('factor rate') ||
    q.includes('remittance') ||
    q.includes('sales advance')
  ) {
    if (q.includes('difference') || q.includes('vs') || q.includes('versus') || q.includes('compare')) {
      return `### 📊 Merchant Cash Advance (MCA) vs. Traditional Commercial Loan

Here is how a Merchant Cash Advance compares side-by-side with a traditional business term loan:

---

| Comparison Factor | Merchant Cash Advance (MCA) | Traditional Term Loan |
| :--- | :--- | :--- |
| **Legal Nature** | Purchase of future receivables | Commercial debt obligation |
| **Funding Speed** | **24 – 48 Hours** *(Same-day available)* | **1 – 4 Weeks** (Longer underwriting) |
| **Credit Requirement** | **Flexible (500+ FICO)** | **Stricter (650+ FICO typically)** |
| **Collateral** | **None Required** (100% Unsecured) | Real estate, equipment, or business assets |
| **Repayment Structure** | **Flexible % of daily or weekly sales** | **Fixed monthly amortized payments** |
| **Slow Season Impact** | **Payments automatically drop when sales drop** | Fixed payment remains the same |
| **Pricing Metric** | Factor Rate (**1.10 – 1.50**) | Annual Percentage Rate (APR) |
| **Prepayment Discount** | **Up to 25%–100% of interest/fee saved** | Varies / Prepayment penalties common |

---

#### 💡 Summary Recommendation:
* Choose an **MCA** if you need fast working capital within 24–48 hours, have variable seasonal revenues, or have credit challenges (500+ FICO).
* Choose a **Term Loan** if you have strong credit (650+) and prefer a predictable fixed monthly payment over 1 to 4 years.`;
    }

    return `### ⚡ Shield Funding Merchant Cash Advance (MCA)

A **Merchant Cash Advance** provides fast lump-sum working capital in exchange for a fixed percentage of your future receivables or bank deposits.

---

#### 📊 Pricing & Key Terms:
* **Advance Amount:** Up to **$2,000,000** (no minimum requirement).
* **Factor Rates:** Range from **1.10 to 1.50** depending on your cash flow profile and time in business.
* **Pricing Metric:** A simple, fixed fee — **no compounding interest**!
  * *Example:* A $10,000 advance at a 1.25 factor rate has a total payback of $12,500 ($10,000 advance + $2,500 fixed cost).
* **Payment Frequency:** **Daily or Weekly ACH remittances** aligned with your incoming card sales or bank deposits.
* **Duration:** Typically **3 to 24 months**.
* **Early Payoff Discounts:** Shield Funding offers **25% to 100% forgiveness** of remaining fees when paid off early!
* **Credit Friendly:** Business owners with **credit scores down to 500 FICO** qualify based on monthly revenue health.

Would you like to calculate estimated remittances for a specific dollar amount?`;
  }

  // 3. Small Business Term Loans
  if (
    q.includes('term loan') ||
    q.includes('commercial term') ||
    q.includes('fixed rate') ||
    q.includes('amortized') ||
    q.includes('term business')
  ) {
    return `### 📈 Small Business Term Loans

Shield Funding offers traditional **Small Business Term Loans** designed for established businesses seeking predictable fixed financing for long-term investments.

---

#### 📊 Loan Features:
* **Loan Amount:** Up to **$2,000,000** (no minimum).
* **Interest Rates:** Starting at **~30% APR** depending on risk tier and term duration.
* **Repayment Terms:** **6 to 48 months** (up to 4 years).
* **Payment Frequency:** Predictable **Weekly or Monthly fixed payments**.
* **Collateral:** Unsecured options available for qualified businesses.
* **Allowable Uses:** Commercial expansion, inventory purchases, hiring, or refinancing high-cost short-term debt.

---

#### 📋 Qualifications for Term Loans:
* **6+ Months** in business (2+ years for prime rates)
* **$15,000+** in gross monthly revenue ($180k+ annual)
* **600+ FICO** personal credit score
* Active U.S. business checking account with healthy average balances

Would you like to estimate your monthly payments or check if you qualify?`;
  }

  // 4. Equipment Financing
  if (
    q.includes('equipment') ||
    q.includes('machinery') ||
    q.includes('vehicle') ||
    q.includes('truck') ||
    q.includes('lease')
  ) {
    return `### 🚜 Commercial Equipment Financing

Shield Funding helps business owners acquire heavy machinery, commercial vehicles, and specialized equipment with minimal cash out of pocket.

---

#### 📊 Program Terms:
* **Funding Amount:** **$10,000 up to Multi-Million Dollar** opportunities.
* **Coverage:** **Up to 100% of equipment cost covered** — zero upfront cash needed!
* **Annual Rates:** **10% – 15% annual rate**, secured terms.
* **Term Length:** Typically **5-year terms** (structured to match equipment lifespan).
* **Funding Speed:** Same-day financing available — walk out with your equipment upon dealer approval.
* **Collateral:** The equipment itself secures the financing, preserving your cash reserves and working capital.
* **Tax Benefit:** Fully eligible for **IRS Section 179 tax depreciation write-offs**!

---

#### 📋 Requirements:
* **620+ FICO** personal credit score
* **At least 1 year** in business
* Must purchase from a recognized new or used commercial dealer
* Eligible industries: Construction, medical, manufacturing, and specialty trade *(Note: OTR commercial semi-trucks restricted)*.

Would you like to submit an invoice or quote for instant equipment pre-approval?`;
  }

  // 5. Invoice Factoring (Accounts Receivable Financing)
  if (
    q.includes('factoring') ||
    q.includes('invoice') ||
    q.includes('receivable') ||
    q.includes('unpaid invoice') ||
    q.includes('net 30') ||
    q.includes('b2b')
  ) {
    return `### 🧾 Invoice Factoring (Accounts Receivable Financing)

Turn your outstanding 30, 60, or 90-day B2B customer invoices into instant cash within 24 hours.

---

#### 📊 Program Highlights:
* **Advance Rate:** Advance up to **80% – 90%** of total invoice value upfront.
* **Facility Size:** **$20,000 up to $1,500,000+** (focusing on transactions from $100k to $500k).
* **Zero Balance Sheet Debt:** Factoring is an **asset sale**, not a loan, so it does not add debt liabilities to your balance sheet.
* **Approval Based on Customer Credit:** We evaluate the creditworthiness and payment history of your **B2B clients**, not your personal credit!
* **Startups Welcome:** Recent startups qualify with no revenue history required if billing approved B2B clients.
* **Turnaround:** Receive funds directly into your account within **24 hours** of invoice verification.

---

#### 🏢 Who It's Best For:
* Staffing agencies, wholesale distributors, logistics, manufacturing, and government contractors.
*(Note: Medical insurance third-party billing and California deals currently excluded).*

Would you like to learn how to upload your customer invoices for quick review?`;
  }

  // 6. SBA 7(a) & Express Loans
  if (
    q.includes('sba') ||
    q.includes('sba 7') ||
    q.includes('small business administration') ||
    q.includes('government backed')
  ) {
    return `### 🏛️ SBA 7(a) & Express Loans

Government-backed SBA loans provide the largest capital availability and lowest long-term interest rates on the commercial market.

---

#### 📊 Program Overview:
* **Maximum Loan Amount:** Up to **$15,000,000**.
* **Interest Rates:** Highly competitive, starting around **Prime + 3%**.
* **Repayment Terms:** Long-term amortizations up to **10 to 25 Years**.
* **Repayment Frequency:** Low fixed **monthly payments**.
* **Collateral:** Options under $350,000 can be completely **unsecured**.
* **Allowable Uses:** Business acquisition, partner buyouts, commercial real estate purchase, large-scale expansion, or refinancing conventional debt.

---

#### 📋 Qualification Criteria:
* **640+ FICO** personal credit score (700+ for startups with real estate collateral)
* **2+ Years** in business with strong profitable tax returns
* Debt Service Coverage Ratio (DSCR) showing clear ability to repay
* Complete financial documentation (3 years tax returns, P&L, balance sheets, and debt schedules)

Ready to see if your business qualifies for an SBA loan package?`;
  }

  // 7. General Interest Rates & Pricing Comparison
  if (
    q.includes('interest rate') ||
    q.includes('what are the rates') ||
    q.includes('what rate') ||
    q.includes('how much does it cost') ||
    q.includes('cost of funding') ||
    q.includes('apr') ||
    q.includes('rates and fees') ||
    q.includes('origination fee') ||
    q.includes('hidden fee') ||
    q.includes('upfront fee')
  ) {
    return `### 💰 Shield Funding Rates, APR & Fee Breakdown

At Shield Funding, transparency is our core principle. Here is the clear rate breakdown across all of our commercial funding programs:

---

| Financing Product | Interest / Pricing Metric | Payment Frequency | Term Length |
| :--- | :--- | :--- | :--- |
| **Business Line of Credit** | **1% – 6% monthly interest** on drawn funds *(~14% annual finance charge)* | Monthly | 24 Months, renewable |
| **Merchant Cash Advance** | **1.10 – 1.50 Factor Rate** *(no compounding interest)* | Daily or Weekly ACH | 3 – 24 Months |
| **Small Business Term Loan** | Starting from **~30% APR** | Weekly or Monthly | 6 – 48 Months |
| **Equipment Financing** | **10% – 15% Annual Rate** | Monthly | Up to 5 Years |
| **Invoice Factoring** | **1% – 3% Discount Fee** per 30 days | Paid upon client settlement | 30 – 90 Days |
| **SBA 7(a) Loans** | **Prime + ~3%** *(lowest long-term APR)* | Monthly | 10 – 25 Years |

---

#### 🛡️ Transparent Fee Policies:
* **ZERO Upfront Application Fees:** We never charge fees just to apply or review term sheets.
* **Origination Fees:** Standard administrative underwriting fees (if applicable) are deducted directly from funded capital at closing — never out of pocket.
* **Early Payoff Discounts:** Up to **25% – 100% fee forgiveness** on MCAs and lines of credit when paid early.

Would you like to calculate estimated payments for a specific amount?`;
  }

  // 8. Payment Calculations & Estimator
  if (
    q.includes('calculate') ||
    q.includes('calculator') ||
    q.includes('estimate payment') ||
    q.includes('how much will i pay') ||
    q.includes('monthly payment') ||
    /\$\d+/.test(q)
  ) {
    return `### 🧮 Estimated Repayment Calculations

Here are typical payment structures for common funding amounts with Shield Funding:

---

#### 💡 Scenario 1: $25,000 Advance (12 Months)
* **Factor Rate (MCA):** ~1.22
* **Total Payback:** $30,500 ($25,000 principal + $5,500 fixed cost)
* **Estimated Weekly Payment:** ~$635 / week
* **Early Payoff Option:** Settle in 6 months to save up to 50% of the fee!

#### 💡 Scenario 2: $50,000 Line of Credit (Drawn for 90 Days)
* **Monthly Interest Rate:** ~2.5% per month
* **Monthly Interest Due:** ~$1,250 / month while drawn
* **Total Interest for 3 Months:** ~$3,750
* **Repayment:** Pay back the $50k principal whenever your receivables land, eliminating further interest!

#### 💡 Scenario 3: $100,000 Small Business Term Loan (24 Months)
* **APR:** ~32%
* **Estimated Monthly Payment:** ~$5,680 / month
* **Total Cost of Capital:** Predictable fixed amortization

---

💡 **Tip:** You can also click the **Calculator** button in the top navigation bar to test custom loan amounts, terms, and payment schedules interactively!`;
  }

  // 9. Qualifications, Credit Score, Bankruptcies, Requirements
  if (
    q.includes('qualif') ||
    q.includes('require') ||
    q.includes('eligible') ||
    q.includes('criteria') ||
    q.includes('minimum') ||
    q.includes('credit score') ||
    q.includes('bad credit') ||
    q.includes('fico') ||
    q.includes('low credit') ||
    q.includes('bankruptcy') ||
    q.includes('tax lien') ||
    q.includes('bank statement')
  ) {
    return `### 📋 Shield Funding Qualification Requirements

Shield Funding evaluates approvals based primarily on your **business cash flow and regular deposits**, rather than strict personal credit scores.

---

#### 🎯 Minimum Qualification Criteria:
* **Time in Business:** At least **4+ Months** of active operations *(1+ year unlocks prime rates and larger term loans)*.
* **Monthly Revenue:** A minimum of **$10,000+ in gross monthly sales** ($120,000 annual gross revenue).
* **Bank Account:** An active U.S. **business checking account** (personal bank accounts are not eligible).
* **Credit Profile:** We approve business owners with **500+ FICO scores**.
* **NSF / Negative Days:** Up to 5 NSFs allowed in the most recent month; 2 or fewer negative days preferred.

---

#### 🛡️ Challenged Credit Questions Answered:
* **Past Bankruptcies:** Discharged bankruptcies are **accepted**.
* **Tax Liens:** Existing federal or state tax liens do **not** automatically disqualify you.
* **Soft Pull Inquiry:** Our initial review uses a **soft credit inquiry only**, which will **never impact your personal credit score**.
* **No Collateral Needed:** Most working capital advances and lines of credit are **100% unsecured**.

---

#### 📄 Documents Needed to Fund:
1. **1-Page Digital Application** (takes 2 minutes)
2. **3 to 4 Months of Business Bank Statements** (PDFs or instant digital link)
3. Government-issued photo ID and voided business check (to wire funds)

Would you like to start a pre-qualification review online or call our desk at **[(888) 882-6117](tel:8888826117)**?`;
  }

  // 10. Funding Speed, Timelines & Sameday Wire
  if (
    q.includes('how quick') ||
    q.includes('how fast') ||
    q.includes('speed') ||
    q.includes('same day') ||
    q.includes('timeline') ||
    q.includes('how long') ||
    q.includes('wire')
  ) {
    return `### ⚡ Shield Funding Timeline: From Application to Direct Wire

Shield Funding specializes in rapid commercial funding with some of the fastest turnaround times in the alternative finance industry:

---

| Stage | Expected Duration | Details |
| :--- | :--- | :--- |
| **1. Digital Application** | **2 Minutes** | Fill out our simple online form with basic revenue details. |
| **2. Underwriting Review** | **2 – 4 Hours** | Advisors analyze your bank statements with AI-powered matching to 50+ lenders. |
| **3. Term Sheet & Offer** | **Same Day** | Receive your official offer outlining approved amount, rates, and remittance options. |
| **4. Direct Wire Transfer** | **24 – 48 Hours** | Sign digital documents and receive funds directly via ACH or wire into your checking account. |

---

#### 🚀 Need Same-Day Emergency Funding?
For urgent payroll, inventory, or emergency repairs, submit your application and bank statements **before 1:00 PM EST** to qualify for **Same-Day ACH Wire Transfer**!

Call our direct underwriting desk at **[(888) 882-6117](tel:8888826117)** to expedite your review.`;
  }

  // 11. Early Payoff Discounts / Prepayment / Consolidation
  if (
    q.includes('early pay') ||
    q.includes('prepay') ||
    q.includes('refinance') ||
    q.includes('consolidat') ||
    q.includes('renew')
  ) {
    return `### 💵 Early Payoff Discounts & Refinancing

Shield Funding rewards responsible borrowers who settle their financing ahead of schedule.

---

#### 🛡️ Early Payoff Advantages:
* **Fee Forgiveness:** Depending on your agreement, we offer **10% to 100% forgiveness of remaining fees** if you pay off your advance early.
* **No Prepayment Penalties:** Unlike traditional bank loans with stiff penalties, paying off your balance early directly saves your business money.
* **Facility Renewals:** Once you have paid down **25% to 50%** of your active advance or loan, you become eligible for renewals with increased funding limits and lower factor rates.
* **Debt Consolidation:** If you currently have multiple high-cost advances, Shield Funding can consolidate them into a single, manageable monthly or weekly payment to free up cash flow.

Would you like our advisory team to review your current debt schedule for consolidation options?`;
  }

  // 12. Explicit Application Process / How to Apply
  const isHowToApply =
    q.includes('how to apply') ||
    q.includes('how do i apply') ||
    q.includes('where to apply') ||
    q.includes('where do i apply') ||
    q.includes('application process') ||
    q.includes('steps to apply') ||
    q.includes('steps to get funded') ||
    q.includes('start an application') ||
    q.includes('how can i apply') ||
    q.includes('sign up for funding') ||
    (q.startsWith('apply') && !q.includes('rate') && !q.includes('interest') && !q.includes('credit') && !q.includes('fee'));

  if (isHowToApply) {
    return `### 🚀 How to Apply for Business Funding with Shield Funding

Applying with Shield Funding is fast, 100% digital, and will **not affect your personal credit score** during the initial review.

---

#### 4 Simple Steps to Get Funded:

1. **Step 1: Complete the Online Application (2 Minutes)**  
   Fill out basic details about your business name, monthly revenue, and requested funding amount at [shieldfunding.com/apply](https://shieldfunding.com/apply/).

2. **Step 2: Submit 3 to 4 Months of Bank Statements**  
   Upload PDF copies of your recent business bank statements or connect securely via our digital bank verification partner for instant review.

3. **Step 3: Review Your Custom Offers**  
   Your dedicated Shield Funding advisor will contact you with matched funding offers, transparent terms, and repayment options.

4. **Step 4: Receive Your Capital in 24 Hours**  
   Sign your digital agreement and receive your funds directly via ACH wire deposit into your business checking account.

---

📞 **Prefer to apply over the phone?**  
Call our senior funding team directly at **[(888) 882-6117](tel:8888826117)** (Mon–Fri, 9:00 AM – 7:00 PM EST).`;
  }

  // 13. Contact / Advisor Phone / Company Profile
  if (
    q.includes('contact') ||
    q.includes('phone') ||
    q.includes('call') ||
    q.includes('number') ||
    q.includes('address') ||
    q.includes('about') ||
    q.includes('who are you') ||
    q.includes('speak to human') ||
    q.includes('representative') ||
    q.includes('advisor')
  ) {
    return `### 🏢 About Shield Funding & Contact Information

Shield Funding is a premier American commercial finance broker dedicated to helping small and mid-sized businesses secure fast, reliable, and flexible working capital.

---

#### 🛡️ Company Highlights:
* **Experience:** Nearly **20 years** of commercial lending and funding expertise.
* **Reputation:** **4.9 / 5 Stars** on Trustpilot & A+ rated with the Better Business Bureau.
* **Network:** Direct access to over 50+ specialized institutional and private commercial lenders.
* **Security:** Bank-grade 256-bit encrypted data protection.

---

#### 📞 Direct Contact Channels:
* **Toll-Free Phone:** **[(888) 882-6117](tel:8888826117)**
* **Email:** **info@shieldfunding.com**
* **Hours:** Monday – Friday: 9:00 AM – 7:00 PM EST
* **Official Website:** [www.shieldfunding.com](https://www.shieldfunding.com)

#### 📍 Office Locations:
* **Administrative HQ:** 2 Sherri Ln, Spring Valley, NY 10977
* **Sales Division:** 5 Paragon Dr, Montvale, NJ 07645
* **West Coast Office:** 8807 W. Pico Blvd, Los Angeles, CA 90035

How can we assist your business today?`;
  }

  // 14. Default Tailored Financial Response
  return `### 🛡️ Shield Funding AI Assistant

Thank you for your inquiry regarding business financing options with Shield Funding.

---

#### 💡 How We Can Help Your Business:
* **Fast Working Capital:** Access from **$5,000 up to $2,000,000+** within 24 to 48 hours.
* **Flexible Capital Programs:** Merchant Cash Advances, Business Lines of Credit, Term Loans, Equipment Financing, Invoice Factoring, and SBA Loans.
* **Simple Requirements:** Only **4+ months in business** and **$10,000+ monthly revenue** required. All credit scores considered (500+ FICO). Soft credit pull only.

---

#### 🔍 Specific Questions You Can Ask Me:
1. *"What interest rates apply when drawing funds from a business line of credit?"*
2. *"How does an MCA work, and what are typical factor rates?"*
3. *"What are the minimum qualifications and documents needed to get approved?"*
4. *"Can I get funded with a credit score below 600 or past bankruptcies?"*
5. *"How quickly can money be wired to my account?"*

---

💬 Feel free to ask any specific question about funding amounts, terms, or required documentation, or call our funding advisory desk directly at **[(888) 882-6117](tel:8888826117)**!`;
}

// Local Storage Conversation Persistence Helpers
const STORAGE_KEY_CONVS = 'shield_conversations';
const STORAGE_KEY_MSGS = 'shield_messages';

function getStoredConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONVS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('[Shield Mock] Error reading conversations from storage', e);
  }

  // Default initial consultation thread
  const defaultConv: Conversation = {
    id: 'consultation-default',
    title: 'Business Funding Consultation',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_message: 'Hi! I am the Shield Funding AI Assistant.',
    is_pinned: true,
  };
  saveStoredConversations([defaultConv]);
  return [defaultConv];
}

function saveStoredConversations(convs: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(convs));
  } catch (e) {
    console.warn('[Shield Mock] Error saving conversations', e);
  }
}

function getStoredMessages(convId: string): Message[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_MSGS}_${convId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('[Shield Mock] Error reading messages for', convId, e);
  }
  return [];
}

function saveStoredMessages(convId: string, messages: Message[]) {
  try {
    localStorage.setItem(`${STORAGE_KEY_MSGS}_${convId}`, JSON.stringify(messages));
  } catch (e) {
    console.warn('[Shield Mock] Error saving messages for', convId, e);
  }
}

// Clean Mock API Service for Shield Funding
export const shieldMockService = {
  getConversations: async (): Promise<{ items: Conversation[]; total: number }> => {
    const items = getStoredConversations();
    return { items, total: items.length };
  },

  createConversation: async (title = 'New Funding Inquiry'): Promise<Conversation> => {
    const newConv: Conversation = {
      id: `shield-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message: null,
      is_pinned: false,
    };
    const current = getStoredConversations();
    const updated = [newConv, ...current];
    saveStoredConversations(updated);
    return newConv;
  },

  updateConversationTitle: async (id: string, title: string): Promise<Conversation> => {
    const current = getStoredConversations();
    const updated = current.map((c) => (c.id === id ? { ...c, title, updated_at: new Date().toISOString() } : c));
    saveStoredConversations(updated);
    const found = updated.find((c) => c.id === id);
    if (!found) throw new Error('Conversation not found');
    return found;
  },

  togglePin: async (id: string): Promise<Conversation> => {
    const current = getStoredConversations();
    const updated = current.map((c) => (c.id === id ? { ...c, is_pinned: !c.is_pinned } : c));
    saveStoredConversations(updated);
    const found = updated.find((c) => c.id === id);
    if (!found) throw new Error('Conversation not found');
    return found;
  },

  deleteConversation: async (id: string): Promise<void> => {
    const current = getStoredConversations();
    const filtered = current.filter((c) => c.id !== id);
    saveStoredConversations(filtered);
    try {
      localStorage.removeItem(`${STORAGE_KEY_MSGS}_${id}`);
    } catch {}
  },

  deleteAllConversations: async (): Promise<void> => {
    const current = getStoredConversations();
    for (const c of current) {
      try {
        localStorage.removeItem(`${STORAGE_KEY_MSGS}_${c.id}`);
      } catch {}
    }
    saveStoredConversations([]);
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    return getStoredMessages(conversationId);
  },

  sendMessageStream: async (
    data: ChatRequest,
    onChunk: (chunk: string) => void,
    onStart?: (conversationId: string, userMessage: Message) => void,
    onDone?: (conversationId: string, assistantMessage: Message) => void,
    onError?: (err: any) => void
  ): Promise<void> => {
    try {
      // 1. Resolve or create active conversation
      let convId = data.conversation_id;
      let convs = getStoredConversations();

      if (!convId || !convs.some((c) => c.id === convId)) {
        const titleSnippet = data.message.length > 30 ? `${data.message.slice(0, 30)}...` : data.message;
        const newConv = await shieldMockService.createConversation(titleSnippet || 'Funding Inquiry');
        convId = newConv.id;
        convs = getStoredConversations();
      }

      // 2. Build User Message
      const userMessage: Message = {
        id: `msg-${Date.now()}-user`,
        conversation_id: convId,
        role: 'user',
        content: data.message,
        attachments: data.attachments || [],
        intent: 'funding_inquiry',
        confidence: 0.98,
        created_at: new Date().toISOString(),
      };

      // Save user message
      const existingMsgs = getStoredMessages(convId);
      const updatedMsgsWithUser = [...existingMsgs, userMessage];
      saveStoredMessages(convId, updatedMsgsWithUser);

      if (onStart) {
        onStart(convId, userMessage);
      }

      // 3. Real-Time Token Streaming from live Gemini 3.6 Flash SSE endpoint
      let apiBase = (import.meta.env.VITE_API_URL || 'https://atlas-backend-five.vercel.app').trim().replace(/\/+$/, '');
      if (typeof window !== 'undefined') {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isLocal && (apiBase.includes('localhost') || !apiBase)) {
          apiBase = 'https://atlas-backend-five.vercel.app';
        }
      }
      let fullResponseText = '';
      let streamedDirectlyFromBackend = false;

      try {
        const streamEndpoint = `${apiBase}/api/chat/stream`;
        const response = await fetch(streamEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: data.message,
            history: existingMsgs.slice(-6).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (response.ok && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                try {
                  const payload = JSON.parse(trimmed.slice(6));
                  if (payload.type === 'chunk' && payload.text) {
                    fullResponseText += payload.text;
                    onChunk(payload.text);
                    streamedDirectlyFromBackend = true;
                  } else if (payload.type === 'done' && payload.reply && !fullResponseText) {
                    fullResponseText = payload.reply;
                  }
                } catch {
                  // Ignore JSON parse error on incomplete chunks
                }
              }
            }
          }
        }
      } catch (streamErr) {
        console.warn('[Shield Service] Backend SSE stream unreachable, utilizing local RAG engine:', streamErr);
      }

      // 4. Fallback: If backend stream was not available, synthesize and stream locally
      if (!streamedDirectlyFromBackend) {
        if (!fullResponseText) {
          fullResponseText = generateShieldResponse(data.message);
        }

        const words = fullResponseText.split(' ');
        for (let i = 0; i < words.length; i++) {
          const token = (i === 0 ? '' : ' ') + words[i];
          onChunk(token);
          await new Promise((resolve) => setTimeout(resolve, 15 + Math.random() * 18));
        }
      }

      // 5. Build Assistant Message
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        conversation_id: convId,
        role: 'assistant',
        content: fullResponseText,
        attachments: [],
        intent: 'shield_advisory',
        confidence: 0.99,
        created_at: new Date().toISOString(),
      };

      // Save assistant message and update conversation
      const finalMsgs = [...updatedMsgsWithUser, assistantMessage];
      saveStoredMessages(convId, finalMsgs);

      const updatedConvs = convs.map((c) =>
        c.id === convId
          ? {
              ...c,
              last_message: fullResponseText.slice(0, 60),
              updated_at: new Date().toISOString(),
            }
          : c
      );
      saveStoredConversations(updatedConvs);

      if (onDone) {
        onDone(convId, assistantMessage);
      }
    } catch (err) {
      console.error('[Shield Mock Service Error]', err);
      if (onError) onError(err);
    }
  },
};
