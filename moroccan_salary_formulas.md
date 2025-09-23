# Moroccan Salary Calculation Formulas

## Overview
This document contains the formulas and rules for calculating net salary from gross salary in Morocco, based on the fiscamaroc.com calculator.

## 1. Prime d'Ancienneté (Seniority Bonus)
Based on years of service in the same company:

| Duration | Years | Rate |
|----------|-------|------|
| 0-24 months | < 2 years | 0% |
| 25-60 months | 2-5 years | 5% |
| 61-144 months | 5-12 years | 10% |
| 145-240 months | 12-20 years | 15% |
| 241-300 months | 20-25 years | 20% |
| 301+ months | > 25 years | 25% |

**Formula:** `Prime_Anciennete = Salaire_Base * Taux_Anciennete`

## 2. Salaire Brut Imposable (Gross Taxable Salary)
```
Salaire_Brut_Imposable = Salaire_Base + Prime_Anciennete + Primes_Imposables
```

## 3. CNSS (Social Security) Deductions

### Employee Contribution (Part Salariale)
- **Rate:** 4.48% of gross taxable salary
- **Ceiling:** 6,000 MAD/month
- **Formula:**
```javascript
CNSS_Salariale = MIN(Salaire_Brut_Imposable * 0.0448, 6000 * 0.0448)
// Maximum: 268.80 MAD/month
```

### Employer Contribution (Part Patronale)
- **Rate:** 8.98% (for salaries ≤ 6,000 MAD)
- **Formula:**
```javascript
CNSS_Patronale = MIN(Salaire_Brut_Imposable, 6000) * 0.0898
```

## 4. AMO (Medical Insurance) Deductions

### Employee Contribution
- **Rate:** 2.26% of gross taxable salary
- **No ceiling**
- **Formula:**
```javascript
AMO_Salariale = Salaire_Brut_Imposable * 0.0226
```

### Employer Contribution
- **Rate:** 4.52% of gross taxable salary
- **Formula:**
```javascript
AMO_Patronale = Salaire_Brut_Imposable * 0.0452
```

## 5. Frais Professionnels (Professional Expenses)
- **Rate:** 20% of gross taxable salary (excluding benefits in kind)
- **Annual ceiling:** 30,000 MAD
- **Monthly ceiling:** 2,500 MAD
- **Formula:**
```javascript
Frais_Professionnels = MIN(
  (Salaire_Brut_Imposable - Avantages_Nature) * 0.20,
  2500
)
```

## 6. Salaire Net Imposable (Net Taxable Salary)
```javascript
Salaire_Net_Imposable = Salaire_Brut_Imposable
                       - CNSS_Salariale
                       - AMO_Salariale
                       - Frais_Professionnels
                       - CIMR_Montant  // Optional retirement
                       - Assurance_Maladie_Montant  // Optional health insurance
                       - Interet_Credit_Logement  // Home loan interest (max 10% of net taxable)
```

## 7. IR (Income Tax) Calculation

### Annual Tax Brackets (2024)
| Annual Income (MAD) | Tax Rate | Deduction (MAD) |
|-------------------|----------|-----------------|
| 0 - 30,000 | 0% | 0 |
| 30,001 - 50,000 | 10% | 3,000 |
| 50,001 - 60,000 | 20% | 8,000 |
| 60,001 - 80,000 | 30% | 14,000 |
| 80,001 - 180,000 | 34% | 17,200 |
| > 180,000 | 38% | 24,400 |

### Monthly Tax Brackets
| Monthly Income (MAD) | Tax Rate | Deduction (MAD) |
|--------------------|----------|-----------------|
| 0 - 2,500 | 0% | 0 |
| 2,501 - 4,166.67 | 10% | 250 |
| 4,167 - 5,000 | 20% | 666.67 |
| 5,001 - 6,666.67 | 30% | 1,166.67 |
| 6,667 - 15,000 | 34% | 1,433.33 |
| > 15,000 | 38% | 2,033.33 |

### IR Formula
```javascript
// Annual calculation
IR_Annuel_Brut = (Salaire_Net_Imposable_Annuel * Taux) - Forfait_Deduction

// Family deductions (annual)
Deduction_Familiale = 360 * (Nombre_Enfants_Charge)  // Max 6 children
// 360 MAD per child per year, max 2,160 MAD

IR_Annuel_Net = IR_Annuel_Brut - Deduction_Familiale

// Monthly IR
IR_Mensuel = IR_Annuel_Net / 12
```

## 8. Salaire Net (Net Salary)
```javascript
Salaire_Net = Salaire_Brut_Imposable
            - CNSS_Salariale
            - AMO_Salariale
            - IR_Mensuel
            - CIMR_Montant  // Optional
            - Assurance_Maladie_Montant  // Optional
            - Retenue_Pret  // Loan deductions
            + Primes_Non_Imposables  // Non-taxable bonuses
```

## Implementation Example (JavaScript)

```javascript
function calculateNetSalary(params) {
  const {
    salaire_base = 0,
    anciennete_mois = 0,
    primes_imposables = 0,
    primes_non_imposables = 0,
    nombre_enfants = 0,
    marie = false,
    cimr_montant = 0,
    assurance_maladie = 0,
    interet_credit_logement = 0,
    retenue_pret = 0
  } = params;

  // 1. Calculate seniority bonus
  let taux_anciennete = 0;
  if (anciennete_mois >= 301) taux_anciennete = 0.25;
  else if (anciennete_mois >= 241) taux_anciennete = 0.20;
  else if (anciennete_mois >= 145) taux_anciennete = 0.15;
  else if (anciennete_mois >= 61) taux_anciennete = 0.10;
  else if (anciennete_mois >= 25) taux_anciennete = 0.05;

  const prime_anciennete = salaire_base * taux_anciennete;

  // 2. Gross taxable salary
  const salaire_brut_imposable = salaire_base + prime_anciennete + primes_imposables;

  // 3. CNSS (capped at 6000 MAD)
  const cnss_base = Math.min(salaire_brut_imposable, 6000);
  const cnss_salariale = cnss_base * 0.0448;

  // 4. AMO (no ceiling)
  const amo_salariale = salaire_brut_imposable * 0.0226;

  // 5. Professional expenses (20%, max 2500/month)
  const frais_professionnels = Math.min(salaire_brut_imposable * 0.20, 2500);

  // 6. Net taxable salary
  const salaire_net_imposable = salaire_brut_imposable
                               - cnss_salariale
                               - amo_salariale
                               - frais_professionnels
                               - cimr_montant
                               - assurance_maladie
                               - Math.min(interet_credit_logement, salaire_net_imposable * 0.10);

  // 7. Calculate IR (Income Tax)
  const salaire_net_imposable_annuel = salaire_net_imposable * 12;
  let ir_annuel_brut = 0;

  if (salaire_net_imposable_annuel > 180000) {
    ir_annuel_brut = (salaire_net_imposable_annuel * 0.38) - 24400;
  } else if (salaire_net_imposable_annuel > 80000) {
    ir_annuel_brut = (salaire_net_imposable_annuel * 0.34) - 17200;
  } else if (salaire_net_imposable_annuel > 60000) {
    ir_annuel_brut = (salaire_net_imposable_annuel * 0.30) - 14000;
  } else if (salaire_net_imposable_annuel > 50000) {
    ir_annuel_brut = (salaire_net_imposable_annuel * 0.20) - 8000;
  } else if (salaire_net_imposable_annuel > 30000) {
    ir_annuel_brut = (salaire_net_imposable_annuel * 0.10) - 3000;
  }

  // Family deductions
  const deduction_familiale = Math.min(nombre_enfants, 6) * 360;
  const ir_annuel_net = Math.max(0, ir_annuel_brut - deduction_familiale);
  const ir_mensuel = ir_annuel_net / 12;

  // 8. Final net salary
  const salaire_net = salaire_brut_imposable
                    - cnss_salariale
                    - amo_salariale
                    - ir_mensuel
                    - cimr_montant
                    - assurance_maladie
                    - retenue_pret
                    + primes_non_imposables;

  return {
    salaire_base,
    prime_anciennete,
    salaire_brut_imposable,
    cnss_salariale,
    amo_salariale,
    frais_professionnels,
    salaire_net_imposable,
    ir_mensuel,
    salaire_net,
    // Employer contributions
    cnss_patronale: cnss_base * 0.0898,
    amo_patronale: salaire_brut_imposable * 0.0452
  };
}

// Example usage
const result = calculateNetSalary({
  salaire_base: 10000,
  anciennete_mois: 36,  // 3 years
  primes_imposables: 1000,
  primes_non_imposables: 500,
  nombre_enfants: 2,
  marie: true
});

console.log(result);
```

## Notes
1. The calculator at fiscamaroc.com uses server-side calculation via POST request
2. The tax calculation is cumulative from January to current month
3. Some employers may have additional collective agreements affecting calculations
4. CIMR (complementary retirement) is optional and rates vary by employer
5. The formulas above represent the standard legal calculations as of 2024

## API Endpoint (fiscamaroc.com)
- **URL:** `https://www.fiscamaroc.com/fr/simulateur/calcul-salaire-bulletin-paie.htm`
- **Method:** POST
- **Type:** Form submission (not REST API)
- **Response:** HTML page with calculated results

To use their calculator programmatically, you would need to:
1. Submit a POST request with form data
2. Parse the returned HTML to extract results
3. Or implement the formulas above in your own application