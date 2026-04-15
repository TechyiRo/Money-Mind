import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getSmartEmoji = (text) => {
  const lower = text.toLowerCase();
  
  if (lower.includes('water') || lower.includes('watter') || lower.includes('pani')) return '💧';
  if (lower.includes('light') || lower.includes('electric') || lower.includes('power') || lower.includes('current')) return '💡';
  if (lower.includes('rent') || lower.includes('home') || lower.includes('house') || lower.includes('room')) return '🏠';
  if (lower.includes('food') || lower.includes('dine') || lower.includes('eat') || lower.includes('zomato') || lower.includes('swiggy') || lower.includes('cafe') || lower.includes('restaurant')) return '🍔';
  if (lower.includes('shop') || lower.includes('amazon') || lower.includes('flipkart') || lower.includes('myntra') || lower.includes('mall') || lower.includes('clothes')) return '🛍️';
  if (lower.includes('transport') || lower.includes('cab') || lower.includes('uber') || lower.includes('ola') || lower.includes('auto') || lower.includes('train') || lower.includes('metro')) return '🚕';
  if (lower.includes('petrol') || lower.includes('fuel') || lower.includes('gas') || lower.includes('diesel') || lower.includes('cng')) return '⛽';
  if (lower.includes('emi') || lower.includes('loan') || lower.includes('bank') || lower.includes('mortgage')) return '🏦';
  if (lower.includes('movie') || lower.includes('netflix') || lower.includes('prime') || lower.includes('entertainment') || lower.includes('spotify') || lower.includes('gaming') || lower.includes('ps5')) return '🎬';
  if (lower.includes('health') || lower.includes('doctor') || lower.includes('hospital') || lower.includes('medical') || lower.includes('pharmacy') || lower.includes('medicine')) return '⚕️';
  if (lower.includes('gym') || lower.includes('workout') || lower.includes('fitness') || lower.includes('sports') || lower.includes('football') || lower.includes('cricket')) return '🏋️';
  if (lower.includes('bill') || lower.includes('invoice') || lower.includes('fee') || lower.includes('tax') || lower.includes('recharge')) return '📄';
  if (lower.includes('salary') || lower.includes('pay') || lower.includes('income') || lower.includes('bonus') || lower.includes('refund')) return '💰';
  if (lower.includes('fund') || lower.includes('stock') || lower.includes('invest') || lower.includes('sip') || lower.includes('crypto') || lower.includes('bitcoin') || lower.includes('trading')) return '📈';
  if (lower.includes('grocery') || lower.includes('supermarket') || lower.includes('dmart') || lower.includes('blinkit') || lower.includes('zepto')) return '🛒';
  if (lower.includes('gift') || lower.includes('present') || lower.includes('party') || lower.includes('wedding')) return '🎁';
  if (lower.includes('education') || lower.includes('school') || lower.includes('college') || lower.includes('course') || lower.includes('skill')) return '🎓';
  if (lower.includes('travel') || lower.includes('flight') || lower.includes('hotel') || lower.includes('vacation') || lower.includes('trip')) return '✈️';
  if (lower.includes('insurance') || lower.includes('policy') || lower.includes('protection')) return '🛡️';
  if (lower.includes('charity') || lower.includes('donation') || lower.includes('help')) return '❤️';
  if (lower.includes('subscription') || lower.includes('recurring') || lower.includes('membership')) return '🔄';
  
  return '📦';
};

export const extractCategoryDetails = (categoryString) => {
  if (!categoryString) return { name: 'Unknown', icon: '📦' };
  
  const emojiRegex = /^([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/;
  const match = categoryString.match(emojiRegex);
  
  if (match) {
    return {
      icon: match[0],
      name: categoryString.replace(match[0], '').trim()
    };
  }
  
  return {
    icon: getSmartEmoji(categoryString),
    name: categoryString.trim()
  };
};
