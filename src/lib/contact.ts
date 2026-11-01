// Kontak admin kelas. Ganti nomor di sini sekali, semua tombol ikut.
export const ADMIN_WHATSAPP = '6285654487583'

/** Link WhatsApp siap pakai, bisa di-sisipi teks pembuka. */
export function waLink(message?: string): string {
  const base = `https://wa.me/${ADMIN_WHATSAPP}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}