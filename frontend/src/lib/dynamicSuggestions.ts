import type { Message } from '../types';

export interface SuggestionChip {
  id: string;
  label: string;
  prompt: string;
  category?: string;
  icon?: string;
}

// Default initial suggestions when a consultation starts
export const INITIAL_SUGGESTIONS: SuggestionChip[] = [
  {
    id: 'init-qualify',
    label: '⚡ How to Qualify',
    prompt: 'What are the minimum requirements to qualify for business funding?',
    category: 'qualify',
  },
  {
    id: 'init-mca',
    label: '💰 Merchant Cash Advance',
    prompt: 'How does a Merchant Cash Advance (MCA) work, and what are typical factor rates?',
    category: 'mca',
  },
  {
    id: 'init-loc',
    label: '🔄 Line of Credit',
    prompt: 'How does a business line of credit work, and what interest rates apply?',
    category: 'loc',
  },
  {
    id: 'init-bad-credit',
    label: '🛡️ Bad Credit Funding',
    prompt: 'Can I get approved for funding if I have bad or fair credit (under 600)?',
    category: 'credit',
  },
  {
    id: 'init-speed',
    label: '⏱️ Funding Speed',
    prompt: 'How quickly can funds be wired to my business account after applying?',
    category: 'speed',
  },
  {
    id: 'init-compare',
    label: '📊 Term Loan vs MCA',
    prompt: 'What is the difference between an MCA and a traditional commercial term loan?',
    category: 'compare',
  },
];

/**
 * Intelligently analyzes recent conversation messages and user input
 * to generate dynamic, ultra-relevant prompt questions.
 */
export function getDynamicSuggestions(
  messages: Message[] = [],
  currentInput: string = ''
): SuggestionChip[] {
  if (!messages || messages.length === 0) {
    return INITIAL_SUGGESTIONS;
  }

  // Examine the last 3 messages to understand current conversation context
  const recentMessages = messages.slice(-3);
  const combinedContext = (
    recentMessages.map((m) => m.content).join(' ') + ' ' + (currentInput || '')
  ).toLowerCase();

  // 1. Merchant Cash Advance Context
  if (
    combinedContext.includes('mca') ||
    combinedContext.includes('cash advance') ||
    combinedContext.includes('factor rate') ||
    combinedContext.includes('remittance')
  ) {
    return [
      {
        id: 'mca-rates',
        label: '⚡ Factor Rates & Cost',
        prompt: 'What are the typical factor rates (e.g. 1.15 to 1.35) and total cost of an MCA?',
        category: 'mca',
      },
      {
        id: 'mca-calc',
        label: '📊 Remittance Schedule',
        prompt: 'How are daily or weekly remittances calculated from my card sales or bank deposits?',
        category: 'mca',
      },
      {
        id: 'mca-credit',
        label: '🛡️ 500 FICO Approval',
        prompt: 'Can I qualify for an MCA with a 500 FICO score or past credit challenges?',
        category: 'mca',
      },
      {
        id: 'mca-early',
        label: '💵 Early Payoff Discount',
        prompt: 'Does Shield Funding offer early payoff discounts or fee reductions on advances?',
        category: 'mca',
      },
      {
        id: 'mca-compare',
        label: '🔄 MCA vs Line of Credit',
        prompt: 'Would a business line of credit be better or cheaper for my business than an MCA?',
        category: 'compare',
      },
    ];
  }

  // 2. Line of Credit Context
  if (
    combinedContext.includes('line of credit') ||
    combinedContext.includes('credit line') ||
    combinedContext.includes('revolving') ||
    combinedContext.includes('draw')
  ) {
    return [
      {
        id: 'loc-interest',
        label: '📈 Monthly Interest Rates',
        prompt: 'What interest rates apply when drawing funds from a business line of credit?',
        category: 'loc',
      },
      {
        id: 'loc-replenish',
        label: '🔄 How Revolving Works',
        prompt: 'How does the credit line replenish as I repay drawn funds?',
        category: 'loc',
      },
      {
        id: 'loc-docs',
        label: '📋 Required Documents',
        prompt: 'What documentation is required to approve a revolving line of credit?',
        category: 'loc',
      },
      {
        id: 'loc-portal',
        label: '💻 On-Demand Draws',
        prompt: 'Can I draw funds 24/7 through an online portal into my business checking account?',
        category: 'loc',
      },
      {
        id: 'loc-compare',
        label: '📊 Line of Credit vs Term Loan',
        prompt: 'How does a revolving line of credit compare to a fixed small business term loan?',
        category: 'compare',
      },
    ];
  }

  // 3. Small Business Term Loans Context
  if (
    combinedContext.includes('term loan') ||
    combinedContext.includes('fixed rate') ||
    combinedContext.includes('monthly payment') ||
    combinedContext.includes('term business')
  ) {
    return [
      {
        id: 'term-duration',
        label: '📅 Loan Terms & Length',
        prompt: 'What repayment terms are available for term loans (e.g. 6 to 36 months)?',
        category: 'term',
      },
      {
        id: 'term-collateral',
        label: '🛡️ Collateral Needed?',
        prompt: 'Is commercial or personal collateral required for a small business term loan?',
        category: 'term',
      },
      {
        id: 'term-prepay',
        label: '⚡ Prepayment Penalties',
        prompt: 'Are there any prepayment penalties if I pay off my term loan early?',
        category: 'term',
      },
      {
        id: 'term-revenue',
        label: '💵 Minimum Annual Revenue',
        prompt: 'What is the minimum annual revenue required to qualify for a commercial term loan?',
        category: 'term',
      },
      {
        id: 'term-speed',
        label: '⏱️ Approval Timeline',
        prompt: 'How quickly can a term loan application be approved and funded?',
        category: 'speed',
      },
    ];
  }

  // 4. Equipment Financing Context
  if (
    combinedContext.includes('equipment') ||
    combinedContext.includes('machinery') ||
    combinedContext.includes('vehicle') ||
    combinedContext.includes('truck') ||
    combinedContext.includes('lease')
  ) {
    return [
      {
        id: 'equip-100',
        label: '🚜 100% Equipment Financed',
        prompt: 'Can I finance up to 100% of equipment cost without a large cash down payment?',
        category: 'equipment',
      },
      {
        id: 'equip-tax',
        label: '💵 Section 179 Deductions',
        prompt: 'How does Section 179 tax deduction work with commercial equipment financing?',
        category: 'equipment',
      },
      {
        id: 'equip-types',
        label: '📄 Eligible Equipment',
        prompt: 'What types of commercial equipment, medical tools, or vehicles can be financed?',
        category: 'equipment',
      },
      {
        id: 'equip-terms',
        label: '📅 Financing Terms',
        prompt: 'What are typical terms (2 to 7 years) and interest rates for equipment loans?',
        category: 'equipment',
      },
    ];
  }

  // 5. Invoice Factoring Context
  if (
    combinedContext.includes('factoring') ||
    combinedContext.includes('invoice') ||
    combinedContext.includes('receivable') ||
    combinedContext.includes('net 30') ||
    combinedContext.includes('b2b')
  ) {
    return [
      {
        id: 'factor-advance',
        label: '🧾 Advance Percentage',
        prompt: 'What percentage of my unpaid B2B invoices can be advanced upfront (e.g. 80-90%)?',
        category: 'factoring',
      },
      {
        id: 'factor-fees',
        label: '💳 Factoring Fees',
        prompt: 'What are the typical factoring discount fees for 30 to 60 day client net terms?',
        category: 'factoring',
      },
      {
        id: 'factor-clients',
        label: '🏢 Client Notification',
        prompt: 'Do my clients know I am factoring my accounts receivable invoices?',
        category: 'factoring',
      },
      {
        id: 'factor-debt',
        label: '🛡️ Zero Balance Sheet Debt',
        prompt: 'Why is invoice factoring considered asset sale rather than business loan debt?',
        category: 'factoring',
      },
    ];
  }

  // 6. Qualifications / Credit Score / Revenue Requirements Context
  if (
    combinedContext.includes('qualif') ||
    combinedContext.includes('require') ||
    combinedContext.includes('credit score') ||
    combinedContext.includes('bad credit') ||
    combinedContext.includes('fico') ||
    combinedContext.includes('revenue') ||
    combinedContext.includes('months in business')
  ) {
    return [
      {
        id: 'qual-low-credit',
        label: '🛡️ Credit Score Under 550',
        prompt: 'Can I qualify for funding if my personal credit score is below 550?',
        category: 'qualify',
      },
      {
        id: 'qual-statements',
        label: '📄 Bank Statements Needed',
        prompt: 'How many months of business bank statements are required to verify revenue?',
        category: 'qualify',
      },
      {
        id: 'qual-soft-pull',
        label: '🔍 Soft Credit Pull Impact',
        prompt: 'Will pre-qualifying or applying result in a hard inquiry on my personal credit?',
        category: 'qualify',
      },
      {
        id: 'qual-bankruptcy',
        label: '⚡ Bankruptcies & Tax Liens',
        prompt: 'Does Shield Funding accept businesses with past bankruptcies or tax liens?',
        category: 'qualify',
      },
      {
        id: 'qual-speed',
        label: '⏱️ Application Approval Time',
        prompt: 'How long does the underwriting review take after submitting bank statements?',
        category: 'speed',
      },
    ];
  }

  // 7. Funding Speed / Wire / Process Context
  if (
    combinedContext.includes('fast') ||
    combinedContext.includes('speed') ||
    combinedContext.includes('same day') ||
    combinedContext.includes('deposit') ||
    combinedContext.includes('wire') ||
    combinedContext.includes('how long')
  ) {
    return [
      {
        id: 'spd-sameday',
        label: '⚡ Same-Day Wire Funding',
        prompt: 'What are the steps to guarantee same-day wire funding into my account?',
        category: 'speed',
      },
      {
        id: 'spd-docs',
        label: '📄 Minimum Documents',
        prompt: 'What is the absolute minimum documentation required for instant approval?',
        category: 'speed',
      },
      {
        id: 'spd-advisor',
        label: '📞 Direct Underwriter Phone',
        prompt: 'How can I connect with an underwriter immediately at (888) 882-6117?',
        category: 'advisor',
      },
      {
        id: 'spd-apply',
        label: '🔗 Official Application Link',
        prompt: 'Where can I submit the online application form to get started right now?',
        category: 'apply',
      },
    ];
  }

  // 8. Rates / Cost / Fees / Calculator Context
  if (
    combinedContext.includes('rate') ||
    combinedContext.includes('cost') ||
    combinedContext.includes('fee') ||
    combinedContext.includes('apr') ||
    combinedContext.includes('percent') ||
    combinedContext.includes('calculator')
  ) {
    return [
      {
        id: 'rate-calc',
        label: '🧮 Loan Payment Calculator',
        prompt: 'Can you estimate payments for a $50,000 and $100,000 funding advance?',
        category: 'calc',
      },
      {
        id: 'rate-hidden',
        label: '💵 Hidden or Upfront Fees',
        prompt: 'Are there any upfront application, origination, or maintenance fees?',
        category: 'rates',
      },
      {
        id: 'rate-apr-vs-factor',
        label: '📊 Factor Rate vs APR',
        prompt: 'What is the difference between a factor rate (1.20) and annual percentage rate (APR)?',
        category: 'rates',
      },
      {
        id: 'rate-tax',
        label: '🧾 Tax Deductible Interest',
        prompt: 'Are financing costs and remittances tax deductible for my business?',
        category: 'rates',
      },
    ];
  }

  // Fallback: Dynamic general exploration based on recent discussion
  return [
    {
      id: 'gen-options',
      label: '📋 Which Program Fits Me?',
      prompt: 'Based on my business situation, which of your 6 capital programs is best?',
      category: 'general',
    },
    {
      id: 'gen-estimate',
      label: '🧮 Estimate My Payments',
      prompt: 'How much can I borrow, and what would my daily or monthly payment look like?',
      category: 'calc',
    },
    {
      id: 'gen-qual',
      label: '⚡ Minimum Requirements',
      prompt: 'What are the minimum revenue and time in business requirements to qualify?',
      category: 'qualify',
    },
    {
      id: 'gen-phone',
      label: '📞 Speak to Advisor',
      prompt: 'How can I speak directly with a human loan advisor right now?',
      category: 'advisor',
    },
  ];
}
