import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KB_DIR = path.resolve(__dirname, '../../data/knowledge_base/knowledgebase');

/**
 * Clean and chunk knowledge base markdown documents into semantic passages
 */
export function generateKnowledgeChunks() {
  const chunks = [];

  if (!fs.existsSync(KB_DIR)) {
    console.warn(`[Chunker] Knowledge base directory not found at: ${KB_DIR}`);
    return chunks;
  }

  // 1. Company Profile
  const profilePath = path.join(KB_DIR, 'Shield_Funding_Company_Profile.md');
  if (fs.existsSync(profilePath)) {
    const text = fs.readFileSync(profilePath, 'utf-8').trim();
    chunks.push({
      chunkId: 'company-profile-01',
      source: 'Shield_Funding_Company_Profile.md',
      category: 'company_profile',
      title: 'Shield Funding Credibility, BBB Rating & Contact Info',
      content: text,
      metadata: {
        phone: '888-882-6117',
        experience: '18+ years',
        bbb: 'A+',
      },
    });
  }

  // 2. Products Offered
  const productsPath = path.join(KB_DIR, 'Shield_Funding_Products_Offered.md');
  if (fs.existsSync(productsPath)) {
    const text = fs.readFileSync(productsPath, 'utf-8');
    const sections = text.split(/## Loan Type \d+:\s*/i);

    // Summary chunk
    chunks.push({
      chunkId: 'products-overview-01',
      source: 'Shield_Funding_Products_Offered.md',
      category: 'products',
      title: 'Overview of Shield Funding Loan Programs',
      content: `Shield Funding offers 6 primary commercial lending products: Merchant Cash Advance (MCA), Business Line of Credit, Term Business Loans, Equipment Financing, Invoice Factoring, and SBA Loans. All products feature soft credit pulls with fast approvals.`,
      metadata: { type: 'overview' },
    });

    sections.slice(1).forEach((sec, idx) => {
      const lines = sec.trim().split('\n');
      const prodName = lines[0].trim();
      chunks.push({
        chunkId: `product-${idx + 1}-${prodName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        source: 'Shield_Funding_Products_Offered.md',
        category: 'products',
        title: `Product: ${prodName}`,
        content: `### ${prodName}\n\n${lines.slice(1).join('\n').trim()}`,
        metadata: { productName: prodName },
      });
    });
  }

  // 3. Borrower Qualifications
  const qualPath = path.join(KB_DIR, 'Shield_Funding_Qualify_Requirements.md');
  if (fs.existsSync(qualPath)) {
    const text = fs.readFileSync(qualPath, 'utf-8');
    const minMatch = text.match(/## Minimum Borrower Qualifications([\s\S]*?)(?=##|$)/i);
    if (minMatch) {
      chunks.push({
        chunkId: 'qualifications-minimum-01',
        source: 'Shield_Funding_Qualify_Requirements.md',
        category: 'qualifications',
        title: 'Minimum Borrower Qualifications',
        content: `### Minimum Borrower Qualifications\n${minMatch[1].trim()}`,
        metadata: { level: 'minimum' },
      });
    }

    const premMatch = text.match(/## Premium Borrower Qualifications([\s\S]*?)(?=##|$)/i);
    if (premMatch) {
      chunks.push({
        chunkId: 'qualifications-premium-01',
        source: 'Shield_Funding_Qualify_Requirements.md',
        category: 'qualifications',
        title: 'Premium Borrower Qualifications',
        content: `### Premium Borrower Qualifications\n${premMatch[1].trim()}`,
        metadata: { level: 'premium' },
      });
    }

    const addMatch = text.match(/## Additional Qualification Questions Answered([\s\S]*?)$/i);
    if (addMatch) {
      chunks.push({
        chunkId: 'qualifications-flexible-01',
        source: 'Shield_Funding_Qualify_Requirements.md',
        category: 'qualifications',
        title: 'Flexible Underwriting: Bankruptcy, Tax Liens, Multiple MCAs, Credit',
        content: `### Flexible Qualification Factors (Non-SBA)\n${addMatch[1].trim()}`,
        metadata: { level: 'flexible' },
      });
    }
  }

  // 4. FAQs
  const faqsPath = path.join(KB_DIR, 'Shield_Funding_General_FAQs.md');
  if (fs.existsSync(faqsPath)) {
    const text = fs.readFileSync(faqsPath, 'utf-8');
    const qBlocks = text.split(/## Question:\s*/i);

    qBlocks.slice(1).forEach((block, idx) => {
      const parts = block.split(/\n-\s*Answer:\s*/i);
      if (parts.length >= 2) {
        const question = parts[0].trim();
        const answer = parts.slice(1).join('\n').trim();
        chunks.push({
          chunkId: `faq-${idx + 1}`,
          source: 'Shield_Funding_General_FAQs.md',
          category: 'faqs',
          title: `FAQ: ${question}`,
          content: `**Question:** ${question}\n**Answer:** ${answer}`,
          metadata: { question },
        });
      }
    });
  }

  // 5. Process Questions
  const processPath = path.join(KB_DIR, 'Shield_Funding_Process_Questions.md');
  if (fs.existsSync(processPath)) {
    const text = fs.readFileSync(processPath, 'utf-8');
    const sections = text.split(/##\s+/);

    sections.slice(1).forEach((sec, idx) => {
      const lines = sec.trim().split('\n');
      const title = lines[0].trim();
      chunks.push({
        chunkId: `process-${idx + 1}-${title.toLowerCase().slice(0, 20).replace(/[^a-z0-9]/g, '-')}`,
        source: 'Shield_Funding_Process_Questions.md',
        category: 'process',
        title: `Process: ${title}`,
        content: `### ${title}\n\n${lines.slice(1).join('\n').trim()}`,
        metadata: { processTopic: title },
      });
    });
  }

  // 6. Rebuttals & Objections
  const rebuttalsPath = path.join(KB_DIR, 'Shield_Funding_Rebuttals.md');
  if (fs.existsSync(rebuttalsPath)) {
    const text = fs.readFileSync(rebuttalsPath, 'utf-8');
    const blocks = text.split(/## OBJECTION:\s*/i);

    blocks.slice(1).forEach((b, idx) => {
      const nameMatch = b.match(/^([^\n]+)/);
      const triggersMatch = b.match(/TRIGGERS:([\s\S]*?)(?=PRIMARY REBUTTAL:|$)/i);
      const rebuttalMatch = b.match(/PRIMARY REBUTTAL:([\s\S]*?)(?=##|$)/i);

      if (nameMatch && rebuttalMatch) {
        const objection = nameMatch[1].trim();
        const triggers = triggersMatch ? triggersMatch[1].trim() : '';
        const rebuttal = rebuttalMatch[1].trim();

        chunks.push({
          chunkId: `rebuttal-${idx + 1}-${objection.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          source: 'Shield_Funding_Rebuttals.md',
          category: 'rebuttals',
          title: `Objection Rebuttal: ${objection}`,
          content: `**Objection Category:** ${objection}\n**Common Client Expressions:**\n${triggers}\n\n**Official Shield Funding Response:**\n${rebuttal}`,
          metadata: { objection },
        });
      }
    });
  }

  // 7. Decline Reasons & Advice
  const declinePath = path.join(KB_DIR, 'Decline_Reasons_and_Advice.md');
  if (fs.existsSync(declinePath)) {
    const text = fs.readFileSync(declinePath, 'utf-8');
    const items = text.split(/\n(?=\d+\.\s+)/);

    items.forEach((item, idx) => {
      const match = item.match(/^\d+\.\s+([^\n]+)\n(?:Answer:\s*)?([\s\S]*)$/i);
      if (match) {
        const reason = match[1].trim();
        const advice = match[2].trim();
        chunks.push({
          chunkId: `decline-advice-${idx + 1}`,
          source: 'Decline_Reasons_and_Advice.md',
          category: 'decline_advice',
          title: `Decline Reason: ${reason}`,
          content: `**Decline Reason:** ${reason}\n**Actionable Advice & Remedy:**\n${advice}`,
          metadata: { reason },
        });
      }
    });
  }

  // 8. Bank Loan vs MCA Comparison
  const compPath = path.join(KB_DIR, 'Bank_Loan_vs_Credit_Card_vs_MCA.md');
  if (fs.existsSync(compPath)) {
    const text = fs.readFileSync(compPath, 'utf-8').trim();
    chunks.push({
      chunkId: 'comparison-bank-mca-cc-01',
      source: 'Bank_Loan_vs_Credit_Card_vs_MCA.md',
      category: 'comparison',
      title: 'Financial Comparison: Bank Loan vs Factor Rate Loan (MCA) vs Credit Card',
      content: text,
      metadata: { topic: 'comparison' },
    });
  }

  // 9. How AI Helps Clients
  const aiPath = path.join(KB_DIR, 'How_AI_Helps_Clients.md');
  if (fs.existsSync(aiPath)) {
    const text = fs.readFileSync(aiPath, 'utf-8').trim();
    chunks.push({
      chunkId: 'ai-benefits-01',
      source: 'How_AI_Helps_Clients.md',
      category: 'ai_benefits',
      title: 'How AI Automation Benefits Shield Funding Clients',
      content: text,
      metadata: { topic: 'ai_underwriting' },
    });
  }

  console.log(`[Chunker] Generated ${chunks.length} semantically structured knowledge chunks.`);
  return chunks;
}
