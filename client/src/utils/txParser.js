/**
 * Smart Transaction Parser for Indian Bank & UPI SMS
 */
export const parseSMS = (text) => {
  if (!text) return null;

  const result = {
    amount: null,
    type: 'expense', // default
    description: '',
    date: new Date().toISOString().split('T')[0],
  };

  // 1. Amount Extraction (detects ₹, Rs, INR)
  const amountRegex = /(?:Rs|INR|₹)\.?\s?([0-9,]+(?:\.[0-9]{1,2})?)/i;
  const amountMatch = text.match(amountRegex);
  if (amountMatch) {
    result.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  // 2. Type Detection (Income vs Expense)
  const incomeKeywords = ['received', 'credited', 'refunded', 'deposited'];
  const expenseKeywords = ['sent', 'debited', 'paid', 'spent', 'transferred'];

  const lowerText = text.toLowerCase();
  if (incomeKeywords.some(key => lowerText.includes(key))) {
    result.type = 'income';
  } else if (expenseKeywords.some(key => lowerText.includes(key))) {
    result.type = 'expense';
  }

  // 3. Date Extraction (extracts DD-MM-YYYY or DD-MM-YY)
  const dateRegex = /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/;
  const dateMatch = text.match(dateRegex);
  if (dateMatch) {
    let day = dateMatch[1].padStart(2, '0');
    let month = dateMatch[2].padStart(2, '0');
    let year = dateMatch[3];
    if (year.length === 2) year = '20' + year;
    result.date = `${year}-${month}-${day}`;
  }

  // 4. Description Extraction (Merchant Name)
  // Logic: for Sent to XYZ on... or Paid at XYZ...
  const payeeRegex = /(?:to|at|info|transf to|sent to)\s+([\w\s&]+?)(?=\s+on|\s+ref|\s+via|\.|$)/i;
  const payeeMatch = text.match(payeeRegex);
  if (payeeMatch) {
    result.description = payeeMatch[1].trim();
  } else {
    // Fallback: extract first word group after amount if payee not found
    result.description = text.substring(0, 50).trim() + "...";
  }

  return result;
};

/**
 * Intelligent Categorization Based on Merchant Keywords
 */
const MERCHANT_MAP = {
  'Food': ['swiggy', 'zomato', 'blinkit', 'zepto', 'dominos', 'kfc', 'mcdonalds', 'pizza', 'burger', 'restaurant', 'hotel', 'dhaba', 'starbucks', 'cafe', 'bakery', 'tea', 'chai'],
  'Transport': ['uber', 'ola', 'rapido', 'petrol', 'hpcl', 'bpcl', 'shell', 'irctc', 'railway', 'metro', 'bus', 'fuel', 'oil', 'auto', 'service station', 'puncture', 'garage'],
  'Shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'reliancedigital', 'croma', 'dmart', 'retail', 'mart', 'store', 'mall', 'supermarket', 'market', 'fashion', 'clothing'],
  'Entertainment': ['netflix', 'prime', 'hotstar', 'spotify', 'pvr', 'inox', 'theatre', 'gaming', 'steam', 'bookmyshow', 'multiplex', 'movies'],
  'Health': ['apollo', 'pharmeasy', 'practo', 'hospital', 'medical', 'clinic', 'gym', 'cult', 'fitness', 'doctor', 'physio', 'medplus'],
  'Bills': ['electricity', 'mseb', 'bescom', 'bsnl', 'jio', 'airtel', 'vi', 'vodafone', 'water', 'gas', 'broadband', 'recharge', 'wifi', 'tata sky', 'dish tv', 'prepaid', 'postpaid', 'bill'],
  'Salary': ['salary', 'allowance', 'bonus', 'payout', 'stipend', 'wage'],
  'Investment': ['zerodha', 'groww', 'upstox', 'coin', 'mutual fund', 'sip', 'stock', 'share', 'kite', 'etmoney'],
};

export const suggestCategory = (description) => {
  if (!description) return 'Other';
  
  const lowerDesc = description.toLowerCase();
  
  // High-priority matches (Exact or strong landmarks)
  if (lowerDesc.includes('recharge')) return 'Bills';
  if (lowerDesc.includes('service station')) return 'Transport';
  if (lowerDesc.includes('petrol')) return 'Transport';
  if (lowerDesc.includes('medical')) return 'Health';

  for (const [category, keywords] of Object.entries(MERCHANT_MAP)) {
    if (keywords.some(key => lowerDesc.includes(key))) {
      return category;
    }
  }
  
  return 'Other';
};
