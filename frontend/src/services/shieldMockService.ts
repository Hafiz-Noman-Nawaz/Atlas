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

// Shield Funding Knowledge Base Responses
export function generateShieldResponse(query: string): string {
  const q = query.toLowerCase().trim();

  // 1. Funding Options Overview
  if (
    q.includes('funding option') ||
    q.includes('what options') ||
    q.includes('what products') ||
    q.includes('types of loan') ||
    q.includes('services') ||
    q.includes('what do you offer')
  ) {
    return `### 🛡️ Shield Funding Business Financing Solutions

Shield Funding provides fast, flexible capital solutions tailored to your unique cash flow needs and growth goals. Here is an overview of our core financing products:

---

#### 1. **Merchant Cash Advance (MCA)**
* **Funding Amount:** $5,000 to $500,000+
* **Speed to Capital:** 24 to 48 hours *(Same-day approvals)*
* **Best For:** Fast working capital, payroll, seasonal inventory.
* **Key Feature:** Flexible remittances that adjust automatically with your daily or weekly credit card/bank sales. Bad credit accepted.

#### 2. **Business Line of Credit**
* **Funding Amount:** $10,000 to $250,000
* **Speed to Capital:** 1 to 3 business days
* **Best For:** Managing ongoing cash flow fluctuations & unexpected expenses.
* **Key Feature:** Draw capital on-demand and pay interest **only on the funds you use**.

#### 3. **Small Business Term Loans**
* **Funding Amount:** $10,000 to $1,000,000+
* **Term Length:** 6 to 36 months
* **Best For:** Major expansion, hiring, bulk purchasing, or new equipment.
* **Key Feature:** Predictable fixed payments with competitive rates starting from 8.99%.

#### 4. **Equipment Financing**
* **Funding Amount:** Up to $2,000,000 *(Up to 100% equipment cost)*
* **Best For:** Heavy machinery, commercial vehicles, technology, restaurant gear.
* **Key Feature:** The equipment itself secures the financing, preserving working capital.

#### 5. **Invoice Factoring (A/R Financing)**
* **Funding Amount:** $20,000 to $1,500,000
* **Best For:** B2B companies with 30, 60, or 90-day client payment terms.
* **Key Feature:** Advance up to 90% of unpaid invoices within 24 hours.

---

### 📋 Basic Requirements:
• **4+ Months** in business  
• **$10,000+** in gross monthly revenue ($120k/year)  
• **U.S. Business Checking Account**

Would you like to check your eligibility for a specific product or calculate your estimated funding amount?`;
  }

  // 2. Requirements & Qualifications
  if (
    q.includes('requirement') ||
    q.includes('qualify') ||
    q.includes('eligible') ||
    q.includes('criteria') ||
    q.includes('minimum')
  ) {
    return `### 📋 Shield Funding Qualification Requirements

At Shield Funding, our underwriting focuses primarily on your **business cash flow and revenue health**, rather than strict personal credit scores or endless bureaucratic paperwork.

---

#### 🎯 Core Minimum Qualifications:
1. **Time in Business:** At least **4+ months** of active operations *(6–12+ months opens access to prime rates & higher credit lines)*.
2. **Monthly Revenue:** A minimum of **$10,000+ in monthly gross sales** ($120,000 annual gross revenue).
3. **Business Bank Account:** An active U.S. business checking account in the company's legal name.
4. **Credit Considerations:** We work with **all credit profiles (500+ FICO)**. Bad credit or past bankruptcies do not automatically disqualify you.

---

#### 📑 Documents Needed for Fast Approval:
* **Completed 1-Page Online Application** (takes under 2 minutes).
* **3 to 4 Months of Recent Business Bank Statements** (PDFs or secure digital link).
* **Government-Issued Photo ID** (Driver's License or Passport).
* **Voided Business Check** (for ACH disbursement).

> 💡 **No Tax Returns or Extensive Financial Statements** are required for standard working capital advances and business lines of credit under $150,000!

---

📞 **Speak to a Funding Specialist Today:** Call [(888) 882-6117](tel:8888826117) or start your [Quick Application Online](https://shieldfunding.com/apply/).`;
  }

  // 3. Funding Speed & Timelines
  if (
    q.includes('how quick') ||
    q.includes('how fast') ||
    q.includes('same day') ||
    q.includes('timeline') ||
    q.includes('speed') ||
    q.includes('how long')
  ) {
    return `### ⚡ Shield Funding Timeline: From Application to Funded

Shield Funding specializes in high-speed commercial capital. Here is our exact approval and disbursement timeline:

---

| Stage | Expected Duration | What Happens |
| :--- | :--- | :--- |
| **1. Digital Application** | **2 Minutes** | Fill out our secure 1-page form with basic business & revenue details. |
| **2. Underwriting Review** | **2 – 4 Hours** | Your dedicated funding advisor evaluates your bank statements and matches you with top lenders. |
| **3. Decision & Offer** | **Same Day** | Receive your official term sheet showing approved amount, rates, and remittance options. |
| **4. Capital Disbursement** | **24 – 48 Hours** | Wire transfer or ACH direct deposit directly into your business checking account. |

---

#### 🚀 Need Same-Day Emergency Funding?
For urgent payroll, supplier demands, or inventory purchases, submit your application and bank statements **before 1:00 PM EST** to qualify for **Same-Day ACH Wire Transfer**.

Ready to get started? [Apply Now in 2 Minutes](https://shieldfunding.com/apply/) or call [(888) 882-6117](tel:8888826117).`;
  }

  // 4. Bad Credit / Credit Score Questions
  if (
    q.includes('bad credit') ||
    q.includes('credit score') ||
    q.includes('low credit') ||
    q.includes('fico') ||
    q.includes('poor credit')
  ) {
    return `### 🛡️ Does Shield Funding Work with Bad or Fair Credit?

**Yes, absolutely.** Shield Funding has helped thousands of business owners obtain funding regardless of their personal credit score.

---

#### Why Credit Score Isn’t the Only Factor:
* **Revenue-Based Underwriting:** We evaluate your business based on its **monthly cash flow, consistent bank deposits, and revenue trajectory** — not just your personal FICO score.
* **Minimum FICO:** We can fund business owners with credit scores as low as **500 FICO**.
* **Past Bankruptcies or Tax Liens:** While they are reviewed, open or satisfied credit challenges do not automatically bar you from receiving capital.
* **Credit Building Opportunity:** Making timely payments on a Business Line of Credit or Term Loan can help build and strengthen your commercial credit profile.

---

#### Recommended Products for Bad/Fair Credit:
1. **Merchant Cash Advance (MCA):** Fastest approval, structured directly around your daily sales volume.
2. **Invoice Factoring:** Approvals based on your **customers' credit**, not yours.
3. **Equipment Financing:** The physical machinery acts as collateral, reducing credit requirements.

Would you like to explore what funding tier your monthly revenue qualifies for?`;
  }

  // 5. MCA vs Business Loan Comparison
  if (
    q.includes('mca') ||
    q.includes('difference') ||
    q.includes('versus') ||
    q.includes('vs') ||
    q.includes('merchant cash advance vs')
  ) {
    return `### 📊 Merchant Cash Advance (MCA) vs. Traditional Business Loan

Understanding the difference between an MCA and a term loan helps you choose the right financing strategy for your business:

---

| Comparison Factor | Merchant Cash Advance (MCA) | Traditional Business Loan |
| :--- | :--- | :--- |
| **Legal Nature** | Purchase of future receivables | Debt loan with principal + interest |
| **Funding Speed** | **24 – 48 Hours** (Same-day available) | **1 – 4 Weeks** (Longer underwriting) |
| **Credit Requirement** | **Flexible (500+ FICO)** | **Stricter (650+ FICO typically)** |
| **Collateral** | **None Required** (Unsecured) | Real estate, equipment, or assets |
| **Repayment Structure** | **Flexible % of daily/weekly sales** | **Fixed monthly amortized payments** |
| **Slow Season Impact** | **Payments drop during slow sales** | Fixed payment remains the same |
| **Pricing Metric** | Factor Rate (e.g., 1.15 – 1.40) | Annual Percentage Rate (APR) |

---

#### 💡 When to Choose an MCA:
* You need capital in under 48 hours for immediate opportunities or emergencies.
* Your revenue fluctuates seasonally and you want payments that drop when sales slow.
* You have less-than-perfect credit but strong, consistent monthly deposits ($10k+).

#### 💡 When to Choose a Term Loan:
* You have established credit (650+) and want a predictable fixed monthly payment over 1 to 3 years.
* You are funding a planned long-term capital expansion.

Feel free to ask for a custom recommendation based on your business model!`;
  }

  // 6. Application Process / How to Apply
  if (
    q.includes('apply') ||
    q.includes('how to start') ||
    q.includes('application') ||
    q.includes('get started') ||
    q.includes('sign up')
  ) {
    return `### 🚀 How to Apply for Funding with Shield Funding

Applying with Shield Funding is fast, secure, and will **not affect your personal credit score** during the initial review.

---

#### 4 Simple Steps to Get Funded:

1. **Step 1: Complete the Online Application (2 Minutes)**
   Fill out basic details about your business name, monthly revenue, and requested funding amount at [shieldfunding.com/apply](https://shieldfunding.com/apply/).

2. **Step 2: Submit 3 Months of Bank Statements**
   Upload PDF copies of your 3 most recent business bank statements, or connect securely via our digital bank verification partner for instant review.

3. **Step 3: Review Your Custom Offers**
   Your dedicated Shield Funding advisor will contact you with matched funding offers, transparent terms, and repayment options.

4. **Step 4: Receive Your Capital in 24 Hours**
   Sign your digital agreement and receive your funds directly via ACH deposit into your business checking account.

---

📞 **Prefer to apply over the phone?**  
Call our senior funding team directly at **[(888) 882-6117](tel:8888826117)** (Mon–Fri, 9:00 AM – 7:00 PM EST).`;
  }

  // 7. Contact / Phone / About Company
  if (
    q.includes('contact') ||
    q.includes('phone') ||
    q.includes('call') ||
    q.includes('number') ||
    q.includes('address') ||
    q.includes('about') ||
    q.includes('who are you')
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

  // 8. Default Tailored Financial Response
  return `### 🛡️ Shield Funding AI Assistant

Thank you for your inquiry regarding business financing options with Shield Funding.

---

#### 💡 How We Can Help Your Business:
* **Fast Working Capital:** Access from **$5,000 up to $1,000,000+** within 24 to 48 hours.
* **Flexible Options:** Merchant Cash Advances, Business Lines of Credit, Term Loans, Equipment Financing, and Invoice Factoring.
* **Simple Requirements:** Only **4+ months in business** and **$10,000+ monthly revenue** required. All credit scores considered.

---

#### 🔍 Popular Questions You Can Ask:
1. *"What funding options does Shield Funding offer?"*
2. *"What are the requirements to qualify?"*
3. *"How quickly can I get funded?"*
4. *"Do you work with businesses with bad credit?"*
5. *"What is the difference between an MCA and a business term loan?"*

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
      const apiBase = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');
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
