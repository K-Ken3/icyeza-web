export const normalizePhone = (phone) => {
  if (typeof phone !== 'string') return phone;
  let cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+250')) {
    return '0' + cleaned.slice(4);
  }
  if (cleaned.startsWith('250') && cleaned.length === 12) {
    return '0' + cleaned.slice(3);
  }
  return cleaned;
};

export const isValidRwPhone = (phone) => {
  const cleaned = normalizePhone(phone);
  return /^07[2389]\d{7}$/.test(cleaned);
};

export const formatRWF = (amount) => {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
  }).format(amount);
};
