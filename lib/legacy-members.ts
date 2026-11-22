import type { Member } from '@/lib/preview';
import { normalizeKenyanPhone } from '@/lib/leetec';

const importedAt = new Date().toISOString();

const namesAndPhones = [
  ['Jamesdavidson Mukhwana', '0712729894'],
  ['Abigail Nafula', '0798196693'],
  ['Joseph Gitahi', '0706009086'],
  ['Lee Bungei', '0723617436'],
  ['Maroa Christopher', '0741973584'],
  ['Atemo Boaz', '0714287991'],
  ['Millicent Wambui', '0141035290'],
  ['Asenath Nyakundi', '0790181288'],
  ['Joshua Sakhasia', '0119530535'],
  ['Patrick Mulei', '0117395887'],
  ['Waweru Kamau', '0718006369'],
  ['Leon Wayne', '0740691542'],
  ['Victor Kipngetich', '0724359308'],
  ['Miriam Wamucii', '0113577891'],
  ['Joel Muchai', '0743455907'],
  ['Shani Dorine', '0113599939'],
  ['George Ngugi', '0117682041'],
  ['Cynthia Chepkorir', '0741529174'],
  ['Eugine W. Juma', '0112435450'],
  ['Shem Yamami', '0743242368'],
  ['Bushira Misenya', '0759738861'],
  ['Damaris Akinyi Mollyne', '0706846072'],
  ['Rooney David Ogongo', '0769529801'],
  ['Gladwin Nyarichi', '0117111905'],
  ['Regina Mutemi', '0748483312'],
  ['Purity Cherono', '0117754575'],
  ['Linet Wanjiru', '+254141612890'],
  ['Rosemary Makokha', '0717479386'],
  ['Davidson Kiarii', '+254708572612'],
  ['Susan Wambui', '+254714122907'],
  ['Melvin Goga', '+254758037007'],
  ['Cheryne Oyuko', '0719668911'],
] as const;

export function buildLegacyMembers() {
  return namesAndPhones.map(([name, rawPhone], index): Member => {
    const regNo = `LULS/LEGACY/${String(index + 1).padStart(4, '0')}/26`;
    const phone = normalizeKenyanPhone(rawPhone);
    return {
      slug: `legacy-${String(index + 1).padStart(4, '0')}`,
      regNo,
      name,
      email: '',
      phone,
      paymentPhone: phone,
      level: 'Legacy registered member',
      role: 'LULS member',
      interests: ['LULS registered member'],
      bio: 'Imported from the LULS registered-members list.',
      status: 'approved',
      paymentStatus: 'paid',
      paymentAmount: 100,
      paymentCurrency: 'KES',
      paymentMethod: 'M-Pesa · legacy import',
      paymentReference: `LEGACY-PAID-${String(index + 1).padStart(4, '0')}`,
      createdAt: importedAt,
      paidAt: importedAt,
    };
  });
}
