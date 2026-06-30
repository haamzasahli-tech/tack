import { CategoryInfo, CategoryBudget, Transaction } from './types';

// Transfer-type categories (never counted as expense or income)
export const TRANSFER_CATS = new Set(['withdrawal', 'transfer', 'bank']);
// Income-type categories
export const INCOME_CATS = new Set(['salary', 'freelance', 'investment']);

export const CATS: Record<string, CategoryInfo> = {
  food:         { label: 'Food',          icon: '🍔', color: '#f97316' },
  coffee:       { label: 'Coffee',        icon: '☕', color: '#a78bfa' },
  grocery:      { label: 'Grocery',       icon: '🛒', color: '#22c55e' },
  transport:    { label: 'Transport',     icon: '🚗', color: '#3b82f6' },
  car:          { label: 'Car',           icon: '🚙', color: '#4f8ef7' },
  health:       { label: 'Health',        icon: '🏥', color: '#2dd4bf' },
  bills:        { label: 'Bills',         icon: '💡', color: '#fbbf24' },
  rent:         { label: 'Rent',          icon: '🏠', color: '#f472b6' },
  entertainment:{ label: 'Entertainment', icon: '🎬', color: '#c084fc' },
  shopping:     { label: 'Shopping',      icon: '🛍', color: '#fb7185' },
  education:    { label: 'Education',     icon: '📚', color: '#60a5fa' },
  travel:       { label: 'Travel',        icon: '✈️', color: '#34d399' },
  gift:         { label: 'Gift',          icon: '🎁', color: '#f87171' },
  salary:       { label: 'Salary',        icon: '💰', color: '#4ade80' },
  freelance:    { label: 'Freelance',     icon: '💼', color: '#a3e635' },
  investment:   { label: 'Investment',    icon: '📈', color: '#38bdf8' },
  bank:         { label: 'Bank',          icon: '🏦', color: '#818cf8' },
  fees:         { label: 'Fees',          icon: '💳', color: '#fb923c' },
  withdrawal:   { label: 'Withdrawal',    icon: '💵', color: '#94a3b8' },
  transfer:     { label: 'Transfer',      icon: '💸', color: '#64748b' },
  family:       { label: 'Family',        icon: '❤️', color: '#f43f5e' },
  pets:         { label: 'Pets',          icon: '🐶', color: '#d97706' },
  subscription: { label: 'Subscription',  icon: '📱', color: '#7c3aed' },
  online:       { label: 'Online Shop',   icon: '📦', color: '#0ea5e9' },
  taxes:        { label: 'Taxes',         icon: '📋', color: '#dc2626' },
  maintenance:  { label: 'Maintenance',   icon: '🔧', color: '#78716c' },
  other:        { label: 'Other',         icon: '📦', color: '#8895aa' },
};

export const BUDGETS: CategoryBudget = {
  food: 500,
  coffee: 100,
  grocery: 450,
  transport: 200,
  car: 300,
  health: 300,
  bills: 400,
  rent: 1200,
  entertainment: 150,
  shopping: 300,
  education: 100,
  travel: 500,
  gift: 150,
  salary: 0,
  freelance: 0,
  investment: 0,
  bank: 0,
  fees: 50,
  withdrawal: 0,
  transfer: 0,
  family: 200,
  pets: 100,
  subscription: 80,
  online: 200,
  taxes: 300,
  maintenance: 150,
  other: 200,
};

// Keyword mapping for automated categorization based on transaction titles
export const KW: Record<string, string> = {
  pizza: 'food', burger: 'food', kebab: 'food', sandwich: 'food', meal: 'food', lunch: 'food',
  dinner: 'food', breakfast: 'food', restaurant: 'food', food: 'food', eat: 'food', shawarma: 'food',
  coffee: 'coffee', cafe: 'coffee', espresso: 'coffee', latte: 'coffee', cappuccino: 'coffee', tea: 'coffee', starbucks: 'coffee',
  grocery: 'grocery', groceries: 'grocery', supermarket: 'grocery', market: 'grocery', carrefour: 'grocery', monoprix: 'grocery', mg: 'grocery',
  taxi: 'transport', uber: 'transport', lyft: 'transport', metro: 'transport', bus: 'transport', transport: 'transport', ticket: 'transport', train: 'transport', tram: 'transport', bolt: 'transport',
  car: 'car', petrol: 'car', fuel: 'car', parking: 'car', garage: 'car', mechanic: 'car', oil: 'car', gasoline: 'car',
  pharmacy: 'health', doctor: 'health', hospital: 'health', medical: 'health', dentist: 'health', medicine: 'health', clinic: 'health', health: 'health',
  electricity: 'bills', water: 'bills', internet: 'bills', phone: 'bills', bill: 'bills', bills: 'bills', invoice: 'bills', utility: 'bills', telecom: 'bills', steg: 'bills', sonede: 'bills',
  rent: 'rent', loyer: 'rent', appartement: 'rent',
  cinema: 'entertainment', netflix: 'entertainment', spotify: 'entertainment', game: 'entertainment', entertainment: 'entertainment', movie: 'entertainment', concert: 'entertainment', theater: 'entertainment',
  shopping: 'shopping', zara: 'shopping', clothes: 'shopping', vetement: 'shopping', malls: 'shopping',
  school: 'education', university: 'education', book: 'education', cours: 'education', formation: 'education', education: 'education', tuition: 'education',
  flight: 'travel', hotel: 'travel', travel: 'travel', voyage: 'travel', airbnb: 'travel', ticket_plane: 'travel',
  gift: 'gift', cadeau: 'gift', present: 'gift',
  salary: 'salary', salaire: 'salary', paie: 'salary', virement_salaire: 'salary', pay: 'salary', paycheck: 'salary',
  freelance: 'freelance', invoice_out: 'freelance', contract: 'freelance', upwork: 'freelance', client: 'freelance',
  investment: 'investment', bourse: 'investment', crypto: 'investment', epargne: 'investment', stocks: 'investment', div: 'investment',
  bank: 'bank', banque: 'bank', agence: 'bank',
  frais: 'fees', fees: 'fees', commission: 'fees', fee: 'fees',
  retrait: 'withdrawal', withdrawal: 'withdrawal', atm: 'withdrawal', cash_out: 'withdrawal',
  virement: 'transfer', transfer: 'transfer',
  famille: 'family', family: 'family', parent: 'family', kids: 'family',
  pet: 'pets', dog: 'pets', cat: 'pets', vet: 'pets', pets: 'pets', petfood: 'pets',
  abonnement: 'subscription', subscription: 'subscription', apple: 'subscription', google: 'subscription', cloud: 'subscription',
  amazon: 'online', aliexpress: 'online', jumia: 'online', livraison: 'online', delivery: 'online', shein: 'online',
  impot: 'taxes', tax: 'taxes', taxes: 'taxes', tax_bill: 'taxes',
  maintenance: 'maintenance', reparation: 'maintenance', plumber: 'maintenance', electrician: 'maintenance',
};

export const PM_CONFIGS: Record<string, { icon: string, color: string }> = {
  'Cash':            { icon: '💵', color: '#22c55e' },
  'Card':            { icon: '💳', color: '#3b82f6' },
  'Bank Transfer':   { icon: '🏦', color: '#a78bfa' },
  'Mobile Payment':  { icon: '📱', color: '#fb923c' },
};

// Generates NO mock transactions. Guaranteed empty!
export const getMockTransactions = (): Transaction[] => {
  return [];
};
