// Utilitários para formatação e validação de CPF

/**
 * Remove todos os caracteres não numéricos do CPF
 */
export function cleanCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

/**
 * Aplica a máscara 000.000.000-00 ao string informado
 */
export function formatCpf(value: string): string {
  const digits = cleanCpf(value).slice(0, 11);
  
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

/**
 * Valida o CPF usando o algoritmo oficial de dígitos verificadores
 */
export function validateCpf(cpf: string): boolean {
  const cleaned = cleanCpf(cpf);
  
  if (cleaned.length !== 11) return false;
  
  // Elimina CPFs com todos os dígitos iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  // Valida 1º Dígito
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleaned.charAt(9))) return false;
  
  // Valida 2º Dígito
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleaned.charAt(10))) return false;
  
  return true;
}

/**
 * Converte o CPF limpo num e-mail fictício interno para uso transparente no Firebase Auth
 */
export function cpfToEmail(cpf: string): string {
  const cleaned = cleanCpf(cpf);
  return `${cleaned}@sangaview.app`;
}
