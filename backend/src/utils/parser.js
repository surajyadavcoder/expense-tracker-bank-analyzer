const { categorize } = require('./categorizer');

// Regex patterns for common Indian bank statement formats
const TRANSACTION_PATTERNS = [
  // Pattern: date, description, debit/credit amount
  /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\s+(.+?)\s+(\d+(?:,\d+)*(?:\.\d{2})?)\s*(Dr|Cr|DR|CR)?/g,
  // Pattern: date description amount
  /(\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4})\s+([A-Za-z0-9\s\/\-\_\*]+?)\s+([\d,]+\.?\d*)/g,
];

function parseAmount(str) {
  return parseFloat(str.replace(/,/g, '')) || 0;
}

function parseDate(str) {
  const parts = str.split(/[-\/]/);
  if (parts.length === 3) {
    let [d, m, y] = parts;
    if (y.length === 2) y = '20' + y;
    return new Date(`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`);
  }
  return new Date();
}

function extractTransactions(text) {
  const lines = text.split('\n');
  const transactions = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 10) continue;

    // Try to find date pattern in line
    const dateMatch = trimmed.match(/\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/);
    if (!dateMatch) continue;

    // Try to find amount pattern
    const amountMatches = trimmed.match(/[\d,]+\.\d{2}/g);
    if (!amountMatches) continue;

    const amount = parseAmount(amountMatches[amountMatches.length - 1]);
    if (amount <= 0) continue;

    // Extract description (text between date and amount)
    const dateEnd = trimmed.indexOf(dateMatch[0]) + dateMatch[0].length;
    const amountStart = trimmed.lastIndexOf(amountMatches[amountMatches.length - 1]);
    let description = trimmed.slice(dateEnd, amountStart).trim();
    description = description.replace(/\s+/g, ' ').trim();
    if (!description) description = 'Transaction';

    // Determine if debit or credit
    const isCredit = /Cr|CR|credit/i.test(trimmed);

    transactions.push({
      id: Math.random().toString(36).substr(2, 9),
      date: parseDate(dateMatch[0]),
      dateStr: dateMatch[0],
      description,
      amount,
      type: isCredit ? 'credit' : 'debit',
      category: categorize(description),
    });
  }

  return transactions;
}

function generateSampleTransactions() {
  const samples = [
    { desc: 'Swiggy Order', amount: 320, type: 'debit', date: '01/05/2025' },
    { desc: 'Uber Ride', amount: 180, type: 'debit', date: '02/05/2025' },
    { desc: 'Amazon Purchase', amount: 1299, type: 'debit', date: '03/05/2025' },
    { desc: 'Netflix Subscription', amount: 499, type: 'debit', date: '04/05/2025' },
    { desc: 'Salary Credit', amount: 45000, type: 'credit', date: '05/05/2025' },
    { desc: 'Zomato Food Order', amount: 450, type: 'debit', date: '06/05/2025' },
    { desc: 'Metro Card Recharge', amount: 200, type: 'debit', date: '07/05/2025' },
    { desc: 'Apollo Pharmacy', amount: 650, type: 'debit', date: '08/05/2025' },
    { desc: 'Airtel Bill Payment', amount: 399, type: 'debit', date: '09/05/2025' },
    { desc: 'Flipkart Shopping', amount: 2499, type: 'debit', date: '10/05/2025' },
    { desc: 'Restaurant Dinner', amount: 890, type: 'debit', date: '11/05/2025' },
    { desc: 'IRCTC Train Ticket', amount: 750, type: 'debit', date: '12/05/2025' },
    { desc: 'Udemy Course', amount: 499, type: 'debit', date: '13/05/2025' },
    { desc: 'Gym Membership', amount: 1200, type: 'debit', date: '14/05/2025' },
    { desc: 'Electricity Bill', amount: 1100, type: 'debit', date: '15/05/2025' },
    { desc: 'Ola Cab', amount: 220, type: 'debit', date: '16/05/2025' },
    { desc: 'BigBasket Groceries', amount: 1560, type: 'debit', date: '17/05/2025' },
    { desc: 'BookMyShow Movie', amount: 600, type: 'debit', date: '18/05/2025' },
    { desc: 'Myntra Clothes', amount: 1899, type: 'debit', date: '19/05/2025' },
    { desc: 'Coffee Shop', amount: 280, type: 'debit', date: '20/05/2025' },
    { desc: 'Freelance Payment', amount: 8000, type: 'credit', date: '21/05/2025' },
    { desc: 'Petrol Fill', amount: 500, type: 'debit', date: '22/05/2025' },
    { desc: 'Medical Checkup', amount: 800, type: 'debit', date: '23/05/2025' },
    { desc: 'Pizza Hut Order', amount: 680, type: 'debit', date: '24/05/2025' },
    { desc: 'Jio Recharge', amount: 299, type: 'debit', date: '25/05/2025' },
  ];

  return samples.map(s => ({
    id: Math.random().toString(36).substr(2, 9),
    date: new Date(s.date.split('/').reverse().join('-')),
    dateStr: s.date,
    description: s.desc,
    amount: s.amount,
    type: s.type,
    category: categorize(s.desc),
  }));
}

function analyzeTransactions(transactions) {
  const debits = transactions.filter(t => t.type === 'debit');
  const credits = transactions.filter(t => t.type === 'credit');

  const totalSpent = debits.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = credits.reduce((sum, t) => sum + t.amount, 0);

  // Category breakdown
  const categoryBreakdown = {};
  for (const t of debits) {
    if (!categoryBreakdown[t.category]) {
      categoryBreakdown[t.category] = { total: 0, count: 0, transactions: [] };
    }
    categoryBreakdown[t.category].total += t.amount;
    categoryBreakdown[t.category].count += 1;
    categoryBreakdown[t.category].transactions.push(t);
  }

  // Monthly breakdown
  const monthlyBreakdown = {};
  for (const t of debits) {
    const month = t.date instanceof Date
      ? t.date.toLocaleString('default', { month: 'short', year: 'numeric' })
      : 'Unknown';
    if (!monthlyBreakdown[month]) monthlyBreakdown[month] = 0;
    monthlyBreakdown[month] += t.amount;
  }

  // Budget alerts (if category > 30% of total spending)
  const alerts = [];
  for (const [cat, data] of Object.entries(categoryBreakdown)) {
    const pct = (data.total / totalSpent) * 100;
    if (pct > 30) {
      alerts.push({
        category: cat,
        message: `You spent ${pct.toFixed(0)}% of total budget on ${cat}`,
        amount: data.total,
        severity: 'high',
      });
    } else if (pct > 20) {
      alerts.push({
        category: cat,
        message: `${cat} spending is ${pct.toFixed(0)}% of total budget`,
        amount: data.total,
        severity: 'medium',
      });
    }
  }

  return {
    totalSpent,
    totalIncome,
    totalTransactions: transactions.length,
    categoryBreakdown,
    monthlyBreakdown,
    alerts,
  };
}

module.exports = { extractTransactions, generateSampleTransactions, analyzeTransactions };
