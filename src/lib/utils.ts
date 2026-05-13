import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanObject(obj: any) {
  const result: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined && obj[key] !== '') {
      result[key] = obj[key];
    }
  });
  return result;
}

export function formatDate(date: any) {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('de-DE');
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

export function getZodiacSign(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth() + 1;

  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Wassermann";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Fische";
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Widder";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Stier";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Zwilling";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Krebs";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Löwe";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Jungfrau";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Waage";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Skorpion";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Schütze";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Steinbock";
  return "";
}
