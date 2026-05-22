const pdfParse = require('pdf-parse');

// Category keywords mapping
const CATEGORIES = {
  Food: [
    'swiggy', 'zomato', 'dominos', 'pizza', 'burger', 'kfc', 'mcdonalds',
    'restaurant', 'cafe', 'food', 'eat', 'dining', 'biryani', 'hotel',
    'bakery', 'kitchen', 'diner', 'subway', 'starbucks', 'dunkin', 'barbeque',
    'haldiram', 'amul', 'milk', 'grocery', 'bigbasket', 'grofers', 'blinkit'
  ],
  Travel: [
    'uber', 'ola', 'rapido', 'irctc', 'railway', 'flight', 'airline',
    'indigo', 'spicejet', 'air india', 'bus', 'metro', 'petrol', 'fuel',
    'makemytrip', 'goibibo', 'yatra', 'redbus', 'cab', 'taxi', 'toll',
    'fastag', 'parking', 'travel', 'transport'
  ],
  Shopping: [
    'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'snapdeal',
    'tatacliq', 'reliance', 'shoppers stop', 'westside', 'zara', 'h&m',
    'lifestyle', 'big bazaar', 'dmart', 'walmart', 'shop', 'store', 'mart',
    'purchase', 'buy', 'retail'
  ],
  Entertainment: [
    'netflix', 'amazon prime', 'hotstar', 'disney', 'spotify', 'youtube',
    'bookmyshow', 'pvr', 'inox', 'cinema', 'movie', 'game', 'steam',
    'playstation', 'xbox', 'music', 'subscription'
  ],
  Health: [
    'pharmacy', 'medical', 'hospital', 'clinic', 'doctor', 'medicine',
    'apollo', 'medplus', 'netmeds', 'practo', 'gym', 'fitness', '1mg',
    'pharmeasy', 'diagnostic', 'lab', 'health'
  ],
  Utilities: [
    'electricity', 'water', 'gas', 'internet', 'broadband', 'jio', 'airtel',
    'bsnl', 'vi', 'vodafone', 'recharge', 'bill', 'utility', 'maintenance',
    'rent', 'insurance', 'lic', 'emi'
  ]
};

function categorizeTransaction(description) {
  const lower = description.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      return category;
    }
  }
  return 'Others';
}

function parseAmount(str) {
  const cleaned = str.replace(/[,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseDate(str) {
  // Multiple date formats
  const formats = [
    /(\d{2})[-\/](\d{2})[-\/](\d{4})/,
    /(\d{2})[-\/](\d{2})[-\/](\d{2})/,
    /(\d{4})[-\/](\d{2})[-\/](\d{2})/,
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i
  ];

  for (const fmt of formats) {
    const match = str.match(fmt);
    if (match) return match[0];
  }
  return null;
}

function extractTransactionsFromText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
  const transactions = [];

  // Regex patterns for common bank statement formats
  const patterns = [
    // Pattern: date description amount
    /(\d{2}[-\/]\d{2}[-\/]\d{2,4})\s+(.{5,50}?)\s+([\d,]+\.\d{2})/,
    // Pattern: date description dr/cr amount
    /(\d{2}[-\/]\d{2}[-\/]\d{2,4})\s+(.{5,50}?)\s+(Dr|Cr)?\s*([\d,]+\.\d{2})/i,
    // Pattern with INR
    /(\d{2}[-\/]\d{2}[-\/]\d{2,4})\s+(.{5,50}?)\s+(?:INR|Rs\.?|₹)?\s*([\d,]+\.?\d*)/i
  ];

  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const dateStr = match[1];
        const description = match[2]?.trim() || 'Unknown';
        const amountStr = match[match.length - 1];
        const amount = parseAmount(amountStr);

        if (amount && amount > 0 && amount < 1000000) {
          const isDebit = line.toLowerCase().includes('dr') ||
            line.toLowerCase().includes('debit') ||
            !line.toLowerCase().includes('cr');

          transactions.push({
            date: dateStr,
            description: description.replace(/\s+/g, ' '),
            amount,
            type: isDebit ? 'debit' : 'credit',
            category: categorizeTransaction(description)
          });
          break;
        }
      }
    }
  }

  return transactions;
}

function generateMockTransactions() {
  // Demo data when PDF parsing yields no results
  const now = new Date();
  const transactions = [
    { description: 'Swiggy Order', amount: 350, type: 'debit' },
    { description: 'Uber Cab Ride', amount: 180, type: 'debit' },
    { description: 'Amazon Purchase', amount: 1299, type: 'debit' },
    { description: 'Zomato Food Order', amount: 420, type: 'debit' },
    { description: 'Netflix Subscription', amount: 649, type: 'debit' },
    { description: 'Salary Credit', amount: 45000, type: 'credit' },
    { description: 'Flipkart Shopping', amount: 899, type: 'debit' },
    { description: 'Ola Cab', amount: 220, type: 'debit' },
    { description: 'Dominos Pizza', amount: 560, type: 'debit' },
    { description: 'Apollo Pharmacy', amount: 340, type: 'debit' },
    { description: 'Airtel Recharge', amount: 299, type: 'debit' },
    { description: 'BigBasket Grocery', amount: 1850, type: 'debit' },
    { description: 'IRCTC Train Ticket', amount: 780, type: 'debit' },
    { description: 'Myntra Shopping', amount: 1200, type: 'debit' },
    { description: 'Starbucks Coffee', amount: 450, type: 'debit' },
    { description: 'Spotify Premium', amount: 119, type: 'debit' },
    { description: 'Petrol Fuel', amount: 1000, type: 'debit' },
    { description: 'Restaurant Dinner', amount: 850, type: 'debit' },
    { description: 'Gym Membership', amount: 2000, type: 'debit' },
    { description: 'Freelance Payment', amount: 15000, type: 'credit' },
  ];

  return transactions.map((t, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 1.5));
    return {
      ...t,
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      category: categorizeTransaction(t.description)
    };
  });
}

function buildSummary(transactions) {
  const debits = transactions.filter(t => t.type === 'debit');

  // Category totals
  const categoryTotals = {};
  for (const t of debits) {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  }

  // Monthly totals
  const monthlyTotals = {};
  for (const t of debits) {
    const parts = t.date.split(/[-\/]/);
    let month = 'Unknown';
    if (parts.length >= 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = parseInt(parts[1]) - 1;
      const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
      month = `${months[monthIndex] || 'Jan'} ${year}`;
    }
    monthlyTotals[month] = (monthlyTotals[month] || 0) + t.amount;
  }

  const totalSpent = debits.reduce((sum, t) => sum + t.amount, 0);
  const totalCredit = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalTransactions: transactions.length,
    totalSpent,
    totalCredit,
    categoryTotals,
    monthlyTotals,
    topCategory: Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Others'
  };
}

function generateAlerts(summary, budgets = {}) {
  const alerts = [];
  const defaultBudgets = {
    Food: 3000,
    Travel: 2000,
    Shopping: 3000,
    Entertainment: 1000,
    Health: 2000,
    Utilities: 2000,
    Others: 1000
  };

  const activeBudgets = { ...defaultBudgets, ...budgets };

  for (const [category, spent] of Object.entries(summary.categoryTotals)) {
    const budget = activeBudgets[category];
    if (budget) {
      const percent = Math.round((spent / budget) * 100);
      if (percent >= 100) {
        alerts.push({
          type: 'danger',
          message: `You exceeded your ${category} budget by ${percent - 100}%`,
          category,
          percent
        });
      } else if (percent >= 80) {
        alerts.push({
          type: 'warning',
          message: `You have used ${percent}% of your ${category} budget`,
          category,
          percent
        });
      }
    }
  }

  return alerts;
}

const parsePDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    let transactions = [];
    let usedDemo = false;

    try {
      const data = await pdfParse(req.file.buffer);
      transactions = extractTransactionsFromText(data.text);
    } catch (err) {
      console.log('PDF parse error, using demo data');
    }

    if (transactions.length === 0) {
      transactions = generateMockTransactions();
      usedDemo = true;
    }

    const summary = buildSummary(transactions);
    const alerts = generateAlerts(summary);

    res.json({
      success: true,
      usedDemo,
      transactions,
      summary,
      alerts,
      message: usedDemo
        ? 'PDF format not recognized. Showing demo data to illustrate functionality.'
        : `Successfully parsed ${transactions.length} transactions.`
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process PDF', details: error.message });
  }
};

const analyzeBudget = async (req, res) => {
  try {
    const { transactions, budgets } = req.body;
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Invalid transactions data' });
    }
    const summary = buildSummary(transactions);
    const alerts = generateAlerts(summary, budgets);
    res.json({ success: true, summary, alerts });
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
};

module.exports = { parsePDF, analyzeBudget };
