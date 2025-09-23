# Complete Moroccan Salary Calculation Formulas (From Excel Analysis)

## Overview
This document contains the **complete formulas and rates** for calculating net salary in Morocco, extracted from an actual payroll Excel file and the fiscamaroc.com calculator.

## 1. Prime d'Ancienneté (Seniority Bonus)

| Duration (months) | Years | Rate |
|------------------|-------|------|
| 0-24 | < 2 years | 0% |
| 25-60 | 2-5 years | 5% |
| 61-144 | 5-12 years | 10% |
| 145-240 | 12-20 years | 15% |
| 241-300 | 20-25 years | 20% |
| 301+ | > 25 years | 25% |

**Excel Formula:**
```excel
=IF(G23*H21=0,"",H21*G23)  // Where H21 is base salary, G23 is seniority rate
```

## 2. Salaire Brut Global (SBG) - Gross Global Salary

**Excel Formula:**
```excel
=SUM(H21:H33)  // Sum of base salary + all bonuses + benefits
```

## 3. Salaire Brut Imposable (SBI) - Gross Taxable Salary

**Excel Formula:**
```excel
=H35-H37-H38  // SBG minus non-taxable elements
```

## 4. CNSS (Social Security) Calculations

### Employee Contribution
- **Rate:** 4.48% (0.0448)
- **Ceiling:** 6,000 MAD/month
- **Maximum deduction:** 268.80 MAD/month

**Excel Formula:**
```excel
=IF(AND(H40>6000),6000*F42,H40*F42)
// If SBI > 6000, then 6000 * 0.0448, else SBI * 0.0448
```

### Employer Contributions (from Parameters sheet)
- **Social Benefits:** 6.40% (0.0640)
- **Professional Training Tax:** 1.60% (0.0160)
- **Total Employer CNSS:** 8.00% (on capped salary)

## 5. AMO (Medical Insurance)

### Employee Contribution
- **Rate:** 2.26% (0.0226)
- **No ceiling**

**Excel Formula:**
```excel
=H40*F43  // SBI * 0.0226
```

### Employer Contribution
- **AMO Participation:** 1.85% (0.0185)
- **Total with employee:** 4.11%

## 6. CIMR (Complementary Retirement) - Optional

**Excel Formula:**
```excel
=IF(H40*F44=0, ,H40*F44)  // SBI * CIMR_rate (if applicable)
```

## 7. Frais Professionnels (Professional Expenses)

**Two-tier system from Excel:**
- **For SBI ≤ 6,500 MAD:** 35%
- **For SBI > 6,500 MAD:** 25% (capped at 2,916.70 MAD/month)

**Excel Formulas:**
```excel
// Determine rate
=IF(H40<=6500,35%,25%)

// Calculate deduction
=IF(F46=25%,MIN(H40*F46,2916.7),H40*F46)
```

**Note:** The standard rate per law is 20% with 2,500 MAD cap, but some companies use different rates.

## 8. Salaire Net Imposable (SNI) - Net Taxable Salary

**Excel Formula:**
```excel
=H40-(SUM(H42:H46))
// SBI - (CNSS + AMO + CIMR + Insurance + Professional Expenses)
```

## 9. IR (Income Tax) Calculation

### Monthly Tax Brackets with Excel Formulas

| Bracket (MAD) | Rate | Deduction | Excel Formula |
|--------------|------|-----------|---------------|
| 0 - 2,500 | 0% | 0 | Not taxed |
| 2,501 - 4,166 | 10% | 250 | `=IF(AND(H48>=2501,H48<=4166),H48*0.10-250,0)` |
| 4,167 - 5,000 | 20% | 666.67 | `=IF(AND(H48>=4167,H48<=5000),H48*0.20-666.67,0)` |
| 5,001 - 6,666 | 30% | 1,167.66 | `=IF(AND(H48>=5001,H48<=6666),H48*0.30-1167.66,0)` |
| 6,667 - 15,000 | 34% | 1,433.33 | `=IF(AND(H48>=6667,H48<=15000),H48*0.34-1433.33,0)` |
| 15,001+ | 38% | 2,033 | `=IF(H48>15000,H48*0.38-2033,0)` |

**IR Brut Calculation:**
```excel
=SUM(H51:H55)  // Sum all bracket calculations
```

### Family Deductions (Charges Familiales)

**Excel Formula:**
```excel
=IF(F9="CELEBATAIRE",0,IF(AND(F9="MARIE",H8=0),30,IF(H8>5,180,30*H8+30)))
```

**Breakdown:**
- Single: 0 MAD/month
- Married without children: 30 MAD/month
- Married with children: 30 + (30 × number of children) MAD/month
- Maximum (6+ children): 180 MAD/month

### IR Net (Final Income Tax)

**Excel Formula:**
```excel
=IF(H50-H57<=0,0,H50-H57)  // IR Brut - Family deductions (minimum 0)
```

## 10. Salaire Net (Net Salary)

**Excel Formula:**
```excel
=H35-H42-H43-H44-H45-H59-H61
// SBG - CNSS - AMO - CIMR - Insurance - IR - Other deductions
```

## Complete JavaScript Implementation

```javascript
function calculateMoroccanSalary(params) {
  const {
    salaire_base = 0,
    anciennete_mois = 0,
    primes_imposables = 0,
    primes_non_imposables = 0,
    situation_familiale = "CELIBATAIRE", // or "MARIE"
    nombre_enfants = 0,
    cimr_taux = 0,  // Optional CIMR rate
    assurance_taux = 0,  // Optional insurance rate
    autres_deductions = 0
  } = params;

  // 1. Calculate seniority rate
  let taux_anciennete = 0;
  if (anciennete_mois >= 301) taux_anciennete = 0.25;
  else if (anciennete_mois >= 241) taux_anciennete = 0.20;
  else if (anciennete_mois >= 145) taux_anciennete = 0.15;
  else if (anciennete_mois >= 61) taux_anciennete = 0.10;
  else if (anciennete_mois >= 25) taux_anciennete = 0.05;

  const prime_anciennete = salaire_base * taux_anciennete;

  // 2. Salaire Brut Global (SBG)
  const salaire_brut_global = salaire_base + prime_anciennete + primes_imposables;

  // 3. Salaire Brut Imposable (SBI)
  const salaire_brut_imposable = salaire_brut_global; // Simplified

  // 4. CNSS (4.48%, capped at 6000 MAD)
  const cnss_salariale = salaire_brut_imposable > 6000
    ? 6000 * 0.0448
    : salaire_brut_imposable * 0.0448;

  // 5. AMO (2.26%, no cap)
  const amo_salariale = salaire_brut_imposable * 0.0226;

  // 6. CIMR (optional)
  const cimr_montant = cimr_taux ? salaire_brut_imposable * cimr_taux : 0;

  // 7. Insurance (optional)
  const assurance_montant = assurance_taux ? salaire_brut_imposable * assurance_taux : 0;

  // 8. Frais Professionnels (Professional expenses)
  let frais_prof_taux = salaire_brut_imposable <= 6500 ? 0.35 : 0.25;
  let frais_professionnels = salaire_brut_imposable * frais_prof_taux;

  // Apply cap for 25% rate
  if (frais_prof_taux === 0.25) {
    frais_professionnels = Math.min(frais_professionnels, 2916.67);
  }

  // 9. Salaire Net Imposable (SNI)
  const salaire_net_imposable = salaire_brut_imposable
    - cnss_salariale
    - amo_salariale
    - cimr_montant
    - assurance_montant
    - frais_professionnels;

  // 10. Calculate IR Brut (Income Tax)
  let ir_brut = 0;
  const sni = salaire_net_imposable;

  if (sni > 15000) {
    ir_brut = sni * 0.38 - 2033;
  } else if (sni >= 6667) {
    ir_brut = sni * 0.34 - 1433.33;
  } else if (sni >= 5001) {
    ir_brut = sni * 0.30 - 1167.66;
  } else if (sni >= 4167) {
    ir_brut = sni * 0.20 - 666.67;
  } else if (sni >= 2501) {
    ir_brut = sni * 0.10 - 250;
  }

  // 11. Family deductions
  let charges_familiales = 0;
  if (situation_familiale === "CELIBATAIRE") {
    charges_familiales = 0;
  } else if (situation_familiale === "MARIE" && nombre_enfants === 0) {
    charges_familiales = 30;
  } else if (nombre_enfants > 5) {
    charges_familiales = 180;
  } else {
    charges_familiales = 30 + (30 * nombre_enfants);
  }

  // 12. IR Net
  const ir_net = Math.max(0, ir_brut - charges_familiales);

  // 13. Salaire Net
  const salaire_net = salaire_brut_global
    - cnss_salariale
    - amo_salariale
    - cimr_montant
    - assurance_montant
    - ir_net
    - autres_deductions
    + primes_non_imposables;

  // Employer contributions (for information)
  const cnss_patronale = Math.min(salaire_brut_imposable, 6000) * 0.08;
  const amo_patronale = salaire_brut_imposable * 0.0185;
  const taxe_formation = salaire_brut_imposable * 0.016;

  return {
    // Input values
    salaire_base,
    prime_anciennete,
    taux_anciennete: (taux_anciennete * 100) + '%',

    // Gross calculations
    salaire_brut_global,
    salaire_brut_imposable,

    // Deductions
    cnss_salariale: cnss_salariale.toFixed(2),
    amo_salariale: amo_salariale.toFixed(2),
    cimr_montant: cimr_montant.toFixed(2),
    assurance_montant: assurance_montant.toFixed(2),
    frais_professionnels: frais_professionnels.toFixed(2),
    frais_prof_taux: (frais_prof_taux * 100) + '%',

    // Tax calculations
    salaire_net_imposable: salaire_net_imposable.toFixed(2),
    ir_brut: ir_brut.toFixed(2),
    charges_familiales,
    ir_net: ir_net.toFixed(2),

    // Final result
    salaire_net: salaire_net.toFixed(2),

    // Employer contributions
    contributions_patronales: {
      cnss: cnss_patronale.toFixed(2),
      amo: amo_patronale.toFixed(2),
      formation: taxe_formation.toFixed(2),
      total: (cnss_patronale + amo_patronale + taxe_formation).toFixed(2)
    }
  };
}

// Example usage
const result = calculateMoroccanSalary({
  salaire_base: 10000,
  anciennete_mois: 150,  // 12.5 years = 15% bonus
  primes_imposables: 1000,
  primes_non_imposables: 500,
  situation_familiale: "MARIE",
  nombre_enfants: 2,
  cimr_taux: 0.06,  // 6% CIMR
  assurance_taux: 0.02  // 2% insurance
});

console.log(result);
```

## Key Differences from Standard Rates

Based on the Excel analysis, some companies may use:
1. **Professional Expenses:** 35% for low salaries (≤6,500 MAD) vs standard 20%
2. **Professional Expenses:** 25% for higher salaries with 2,916.67 MAD cap vs standard 2,500 MAD cap
3. **CIMR:** Variable rates based on company agreements (typically 3-10%)
4. **Private Insurance:** Variable rates (typically 1-3%)

## Summary of All Rates

| Deduction | Employee Rate | Employer Rate | Cap/Limit |
|-----------|--------------|---------------|-----------|
| **CNSS** | 4.48% | 8.00% | 6,000 MAD base |
| **AMO** | 2.26% | 1.85% | No cap |
| **Professional Expenses** | 20-35% | N/A | 2,500-2,916.67 MAD |
| **CIMR** | Variable | Variable | Based on agreement |
| **Insurance** | Variable | Variable | Based on policy |
| **IR (Income Tax)** | 0-38% | N/A | Progressive brackets |
| **Family Deduction** | Flat amount | N/A | 30 MAD/person, max 180 |

## Notes
1. The Excel file uses a two-tier professional expenses system which may be company-specific
2. CIMR and private insurance are optional and rates vary by employer
3. Some employers may have collective agreements that modify standard rates
4. The formulas above are from actual payroll calculations and may differ slightly from theoretical calculations