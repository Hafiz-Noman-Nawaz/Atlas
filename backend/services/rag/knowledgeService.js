import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to knowledge base documents
const KB_DIR = path.resolve(__dirname, '../../data/knowledge_base/knowledgebase');
const PROMPT_DIR = path.resolve(__dirname, '../../data/knowledge_base/prompt');

class KnowledgeService {
  constructor() {
    this.isInitialized = false;
    this.companyProfile = '';
    this.products = [];
    this.qualifications = {
      minimum: [],
      premium: [],
      additional: [],
    };
    this.faqs = [];
    this.rebuttals = [];
    this.declineReasons = [];
    this.comparisons = '';
    this.aiBenefits = '';
    this.systemPrompt = '';
    this.fallbackResponse =
      'I do not have that specific answer in my current knowledgebase, but our team can help through the contact page at https://shieldfunding.com/contact/ or by calling (888) 882-6117.';
  }

  /**
   * Load and parse all knowledge base files
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      this.loadCompanyProfile();
      this.loadProducts();
      this.loadQualifications();
      this.loadFAQs();
      this.loadRebuttals();
      this.loadDeclineReasons();
      this.loadComparisons();
      this.loadAIBenefits();
      this.loadSystemPrompt();

      this.isInitialized = true;
      console.log(`[KnowledgeService] Successfully loaded and indexed knowledge base:`);
      console.log(`  - FAQs:            ${this.faqs.length} parsed`);
      console.log(`  - Products:        ${this.products.length} parsed`);
      console.log(`  - Rebuttals:       ${this.rebuttals.length} parsed`);
      console.log(`  - Decline Reasons: ${this.declineReasons.length} parsed`);
    } catch (error) {
      console.error('[KnowledgeService] Error loading knowledge base:', error);
    }
  }

  loadCompanyProfile() {
    const filePath = path.join(KB_DIR, 'Shield_Funding_Company_Profile.md');
    if (fs.existsSync(filePath)) {
      this.companyProfile = fs.readFileSync(filePath, 'utf-8').trim();
    }
  }

  loadProducts() {
    const filePath = path.join(KB_DIR, 'Shield_Funding_Products_Offered.md');
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    const sections = content.split(/## Loan Type \d+:\s*/i);

    this.products = sections.slice(1).map((sec) => {
      const lines = sec.trim().split('\n');
      const name = lines[0].trim();
      const details = lines.slice(1).join('\n').trim();
      return { name, details, raw: sec.trim() };
    });
  }

  loadQualifications() {
    const filePath = path.join(KB_DIR, 'Shield_Funding_Qualify_Requirements.md');
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    this.qualifications.raw = content;

    // Split into sections
    const minMatch = content.match(/## Minimum Borrower Qualifications([\s\S]*?)(?=##|$)/i);
    if (minMatch) {
      this.qualifications.minimum = minMatch[1]
        .split('\n')
        .map((l) => l.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean);
    }

    const premMatch = content.match(/## Premium Borrower Qualifications([\s\S]*?)(?=##|$)/i);
    if (premMatch) {
      this.qualifications.premium = premMatch[1]
        .split('\n')
        .map((l) => l.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean);
    }

    const addMatch = content.match(/## Additional Qualification Questions Answered([\s\S]*?)$/i);
    if (addMatch) {
      this.qualifications.additional = addMatch[1]
        .split('\n')
        .map((l) => l.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean);
    }
  }

  loadFAQs() {
    const filePath = path.join(KB_DIR, 'Shield_Funding_General_FAQs.md');
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    const qMatches = content.split(/## Question:\s*/i);

    for (let i = 1; i < qMatches.length; i++) {
      const block = qMatches[i];
      const parts = block.split(/\n-\s*Answer:\s*/i);
      if (parts.length >= 2) {
        const question = parts[0].trim();
        const answer = parts.slice(1).join('\n').trim();
        this.faqs.push({
          question,
          answer,
          keywords: question.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/),
        });
      }
    }
  }

  loadRebuttals() {
    const filePath = path.join(KB_DIR, 'Shield_Funding_Rebuttals.md');
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    const blocks = content.split(/## OBJECTION:\s*/i);

    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i];
      const nameMatch = block.match(/^([^\n]+)/);
      const triggersMatch = block.match(/TRIGGERS:([\s\S]*?)(?=PRIMARY REBUTTAL:|$)/i);
      const rebuttalMatch = block.match(/PRIMARY REBUTTAL:([\s\S]*?)(?=##|$)/i);

      if (nameMatch && triggersMatch && rebuttalMatch) {
        const objection = nameMatch[1].trim();
        const triggers = triggersMatch[1]
          .split('\n')
          .map((t) => t.replace(/^[-*]\s*/, '').trim().toLowerCase())
          .filter(Boolean);
        const rebuttal = rebuttalMatch[1].trim();

        this.rebuttals.push({
          objection,
          triggers,
          rebuttal,
        });
      }
    }
  }

  loadDeclineReasons() {
    const filePath = path.join(KB_DIR, 'Decline_Reasons_and_Advice.md');
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    const items = content.split(/\n(?=\d+\.\s+)/);

    for (const item of items) {
      const match = item.match(/^\d+\.\s+([^\n]+)\n(?:Answer:\s*)?([\s\S]*)$/i);
      if (match) {
        this.declineReasons.push({
          reason: match[1].trim(),
          advice: match[2].trim(),
        });
      }
    }
  }

  loadComparisons() {
    const filePath = path.join(KB_DIR, 'Bank_Loan_vs_Credit_Card_vs_MCA.md');
    if (fs.existsSync(filePath)) {
      this.comparisons = fs.readFileSync(filePath, 'utf-8').trim();
    }
  }

  loadAIBenefits() {
    const filePath = path.join(KB_DIR, 'How_AI_Helps_Clients.md');
    if (fs.existsSync(filePath)) {
      this.aiBenefits = fs.readFileSync(filePath, 'utf-8').trim();
    }
  }

  loadSystemPrompt() {
    const filePath = path.join(PROMPT_DIR, 'Email_Support_Agent_Prompt.md');
    if (fs.existsSync(filePath)) {
      this.systemPrompt = fs.readFileSync(filePath, 'utf-8').trim();
    }
  }

  /**
   * Search knowledge base for the most relevant match for a user's question
   */
  findBestMatch(query) {
    if (!this.isInitialized) {
      this.initialize();
    }

    const cleanQuery = query.toLowerCase().trim();

    // 1. General Products / Funding Options Overview
    if (
      cleanQuery.includes('funding option') ||
      cleanQuery.includes('what funding') ||
      cleanQuery.includes('what options') ||
      cleanQuery.includes('what do you offer') ||
      cleanQuery.includes('what products') ||
      cleanQuery.includes('types of loan') ||
      cleanQuery.includes('types of funding') ||
      cleanQuery.includes('available products')
    ) {
      return {
        type: 'product_overview',
        title: 'Shield Funding Commercial Loan Programs',
        content: `### Shield Funding Commercial Loan Programs

Shield Funding offers 6 specialized commercial financing solutions:

1. **Merchant Cash Advance (MCA)**
   - **Amounts:** Up to $2,000,000 (no minimum)
   - **Factor Rates:** 1.1 to 1.5
   - **Terms:** 3 to 24 months (daily or weekly payment)
   - **Early Payment Discounts:** Up to 25%–100% of interest

2. **Business Line of Credit**
   - **Limit:** Up to $200,000
   - **Monthly Interest:** 1%–6%
   - **Terms:** 24 months renewable (monthly payment)

3. **Term Business Loans**
   - **Amounts:** Up to $2,000,000
   - **Rates:** Starting at ~30% APR
   - **Terms:** Up to 48 months (weekly or monthly)

4. **Equipment Financing**
   - **Amounts:** $10,000 up to multi-million dollars
   - **Requirements:** 620 FICO, 1+ year in business, 90% construction/medical
   - **Terms:** Typically 5 years, 10%–15% annual rate, same-day approval

5. **Invoice Factoring**
   - **Amounts:** $100,000 – $500,000 (up to 90% advance rate)
   - **Requirements:** B2B companies with 30–90 day terms (startups accepted)

6. **SBA Business Loans**
   - **Amounts:** Up to $15,000,000
   - **Rates:** ~Prime + 3%
   - **Terms:** Up to 25 years (unsecured under $350K)

---
*Would you like to review qualification criteria or apply online at [shieldfunding.com/apply](https://shieldfunding.com/apply/)?*`,
      };
    }

    // 2. Check for Objection / Rebuttal Triggers
    for (const item of this.rebuttals) {
      for (const trigger of item.triggers) {
        if (cleanQuery.includes(trigger) || trigger.includes(cleanQuery)) {
          return {
            type: 'rebuttal',
            title: `Shield Funding Advisor (${item.objection})`,
            content: item.rebuttal,
          };
        }
      }
    }

    // 3. Check Specific Products Offered
    for (const prod of this.products) {
      const prodLower = prod.name.toLowerCase();
      if (
        cleanQuery.includes(prodLower) ||
        (prodLower.includes('merchant cash advance') && (cleanQuery.includes('mca') || cleanQuery.includes('cash advance'))) ||
        (prodLower.includes('line of credit') && cleanQuery.includes('line of credit')) ||
        (prodLower.includes('equipment') && cleanQuery.includes('equipment')) ||
        (prodLower.includes('factoring') && (cleanQuery.includes('factoring') || cleanQuery.includes('invoice'))) ||
        (prodLower.includes('sba') && cleanQuery.includes('sba')) ||
        (prodLower.includes('term business loans') && (cleanQuery.includes('term loan') || cleanQuery.includes('term business')))
      ) {
        return {
          type: 'product',
          title: prod.name,
          content: `### ${prod.name}\n\n${prod.details}`,
        };
      }
    }

    // 4. Check Qualifications
    if (
      cleanQuery.includes('qualif') ||
      cleanQuery.includes('require') ||
      cleanQuery.includes('eligible') ||
      cleanQuery.includes('minimum revenue') ||
      cleanQuery.includes('fico') ||
      cleanQuery.includes('credit score') ||
      cleanQuery.includes('bad credit') ||
      cleanQuery.includes('bankruptcy') ||
      cleanQuery.includes('tax lien') ||
      cleanQuery.includes('nsf')
    ) {
      const minText = this.qualifications.minimum.map((q) => `• ${q}`).join('\n');
      const addText = this.qualifications.additional.map((q) => `• ${q}`).join('\n');
      return {
        type: 'qualification',
        title: 'Shield Funding Borrower Qualifications',
        content: `### Minimum Borrower Qualifications\n\n${minText}\n\n### Flexible Qualification Factors\n\n${addText}\n\n*Applying with Shield Funding will not affect your credit score.*`,
      };
    }

    // 5. Check Comparison (Bank Loan vs MCA vs Credit Card)
    if (
      cleanQuery.includes('compare') ||
      cleanQuery.includes('bank loan vs') ||
      cleanQuery.includes('difference between mca and') ||
      cleanQuery.includes('mca vs') ||
      cleanQuery.includes('credit card vs')
    ) {
      return {
        type: 'comparison',
        title: 'Bank Loan vs Factor Rate Loan (MCA) vs Credit Card',
        content: this.comparisons,
      };
    }

    // 6. Check FAQ exact & high-confidence keyword matches
    let bestFaq = null;
    let maxMatchScore = 0;
    const queryWords = cleanQuery.replace(/[^\w\s]/g, '').split(/\s+/).filter((w) => w.length > 2);

    for (const faq of this.faqs) {
      const faqLower = faq.question.toLowerCase();
      if (cleanQuery === faqLower || cleanQuery.includes(faqLower) || faqLower.includes(cleanQuery)) {
        return {
          type: 'faq',
          title: faq.question,
          content: faq.answer,
        };
      }

      let matches = 0;
      for (const word of queryWords) {
        if (faqLower.includes(word)) {
          matches++;
        }
      }

      const score = matches / Math.max(queryWords.length, 1);
      if (score > maxMatchScore && score >= 0.6) {
        maxMatchScore = score;
        bestFaq = faq;
      }
    }

    if (bestFaq) {
      return {
        type: 'faq',
        title: bestFaq.question,
        content: bestFaq.answer,
      };
    }

    // 7. Check Application Process
    if (
      cleanQuery.includes('process') ||
      cleanQuery.includes('how to apply') ||
      cleanQuery.includes('steps') ||
      cleanQuery.includes('documents') ||
      cleanQuery.includes('what documents')
    ) {
      return {
        type: 'process',
        title: 'Application Process & Required Documents',
        content: `### Shield Funding Application Process\n\n1. **Complete a 1-page digital application** at [shieldfunding.com/apply](https://shieldfunding.com/apply/).\n2. **Upload 4 recent business bank statements** (all that is required for initial approval).\n3. Approvals are typically completed within **2 hours** if all documents are submitted promptly.\n4. Shield Funding conducts **soft credit pulls only** that do not affect your credit score.\n5. Contracts require clear ID and a voided business check to wire funds within **24–48 hours**.\n\n*Early prepayment discounts feature 10%–100% remaining interest forgiveness on select products.*`,
      };
    }

    // 8. Company Reputation & Contact
    if (
      cleanQuery.includes('who are you') ||
      cleanQuery.includes('shield funding') ||
      cleanQuery.includes('contact') ||
      cleanQuery.includes('phone') ||
      cleanQuery.includes('bbb') ||
      cleanQuery.includes('reviews')
    ) {
      return {
        type: 'company_profile',
        title: 'About Shield Funding',
        content: `### Shield Funding Company Profile\n\n• **Experience:** 18+ years in the commercial financing industry.\n• **BBB Rating:** A+\n• **Customer Reviews:** Nearly 1,000 five-star verified reviews.\n• **Reach:** Trusted by tens of thousands of U.S. small and medium business owners.\n• **Phone:** (888) 882-6117\n• **Website:** [shieldfunding.com](https://shieldfunding.com)`,
      };
    }

    // 9. Default / Fallback from Email_Support_Agent_Prompt.md
    return {
      type: 'fallback',
      title: 'Shield Funding AI Assistant',
      content: this.fallbackResponse,
    };
  }
}

export const knowledgeService = new KnowledgeService();
