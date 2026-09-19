export type PasswordStrengthLevel =
  | "empty"
  | "weak"
  | "fair"
  | "good"
  | "strong";

export type PasswordChecks = {
  minLength: boolean;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
};

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  level: PasswordStrengthLevel;
  label: string;
  checks: PasswordChecks;
  percent: number;
};

const LABELS: Record<PasswordStrengthLevel, string> = {
  empty: "",
  weak: "Weak",
  fair: "Fair",
  good: "Good",
  strong: "Strong",
};

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const checks: PasswordChecks = {
    minLength: password.length >= 8,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  };

  if (!password) {
    return {
      score: 0,
      level: "empty",
      label: "",
      checks,
      percent: 0,
    };
  }

  let score = 0;
  if (checks.minLength) score += 1;
  if (password.length >= 12) score += 1;
  if (checks.hasLower && checks.hasUpper) score += 1;
  if (checks.hasNumber) score += 1;
  if (checks.hasSymbol) score += 1;

  // Cap and map to 0–4
  const normalized = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
  let level: PasswordStrengthLevel = "weak";
  if (normalized >= 4) level = "strong";
  else if (normalized === 3) level = "good";
  else if (normalized === 2) level = "fair";
  else level = "weak";

  // Require basics for anything above weak
  if (!checks.minLength || !(checks.hasLower || checks.hasUpper) || !checks.hasNumber) {
    if (normalized > 1) {
      return {
        score: 1,
        level: "weak",
        label: LABELS.weak,
        checks,
        percent: 25,
      };
    }
  }

  return {
    score: normalized === 0 ? 1 : normalized,
    level,
    label: LABELS[level],
    checks,
    percent: (normalized === 0 ? 1 : normalized) * 25,
  };
}

export function isPasswordAcceptable(password: string): boolean {
  const { checks, score } = evaluatePasswordStrength(password);
  return (
    checks.minLength &&
    checks.hasLower &&
    checks.hasUpper &&
    checks.hasNumber &&
    score >= 2
  );
}

export const PASSWORD_RULES = [
  { key: "minLength" as const, label: "At least 8 characters" },
  { key: "hasUpper" as const, label: "One uppercase letter" },
  { key: "hasLower" as const, label: "One lowercase letter" },
  { key: "hasNumber" as const, label: "One number" },
  { key: "hasSymbol" as const, label: "One symbol (!@#$…)" },
];
