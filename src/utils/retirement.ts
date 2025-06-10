import type {
  FutureOneTimeExpense,
  RetirementCalculationParams,
  RetirementCalculationsResult,
  YearlyProjection,
} from "../types/retirement";

export function calculateRetirement({
  currentAge,
  retirementAge,
  inflation,
  monthlyExpenses,
  expenseType,
  investmentBuckets,
  monthlySavingsBuckets,
  oneTimeExpenses,
}: RetirementCalculationParams): RetirementCalculationsResult {
  // Calculate future value of all monthly savings buckets at retirement age
  const yearsToInvest = Math.max(0, retirementAge - currentAge);
  const monthsToInvest = yearsToInvest * 12;
  const monthlySavingsFV = monthlySavingsBuckets.reduce((sum, bucket) => {
    // FV = P * [((1 + r)^n - 1) / r]
    // r = monthly rate, n = months
    const r = bucket.return / 100 / 12;
    const n = monthsToInvest;
    const fv =
      r > 0
        ? bucket.amount * ((Math.pow(1 + r, n) - 1) / r)
        : bucket.amount * n;
    return sum + fv;
  }, 0);

  const totalCorpus =
    investmentBuckets.reduce((sum, bucket) => sum + bucket.amount, 0) +
    monthlySavingsFV;

  // Calculate weighted average return
  // Weighted return: combine investment buckets and monthly savings FV
  const weightedReturn =
    totalCorpus > 0
      ? (investmentBuckets.reduce(
          (sum, bucket) => sum + bucket.amount * bucket.return,
          0
        ) +
          (monthlySavingsFV > 0
            ? monthlySavingsBuckets.reduce(
                (sum, bucket) =>
                  sum +
                  // Weight by FV contribution
                  bucket.return *
                    // FV for this bucket
                    (() => {
                      const r = bucket.return / 100 / 12;
                      const n = monthsToInvest;
                      return r > 0
                        ? bucket.amount * ((Math.pow(1 + r, n) - 1) / r)
                        : bucket.amount * n;
                    })(),
                0
              )
            : 0)) /
        totalCorpus
      : 0;

  // Convert expenses to annual if monthly
  const annualExpenses =
    expenseType === "monthly" ? monthlyExpenses * 12 : monthlyExpenses;

  // Real return (return - inflation)
  const realReturn = weightedReturn - inflation;

  // Calculate future values of one-time expenses
  const futureOneTimeExpenses: FutureOneTimeExpense[] = oneTimeExpenses.map(
    (expense) => ({
      ...expense,
      futureValue:
        expense.currentCost *
        Math.pow(1 + expense.inflationRate / 100, expense.yearsFromNow),
      ageWhenDue: currentAge + expense.yearsFromNow,
    })
  );

  // Calculate how long corpus will last with one-time expenses
  let yearsLeft = 0;
  let remainingCorpus = totalCorpus;
  const yearlyData: YearlyProjection[] = [];

  if (weightedReturn <= 0) {
    // Simple calculation without growth
    let totalExpenses = 0;
    for (let year = 1; year <= 100; year++) {
      const currentExpenses =
        annualExpenses * Math.pow(1 + inflation / 100, year - 1);
      totalExpenses += currentExpenses;

      // Add one-time expenses for this year
      const oneTimeForYear = futureOneTimeExpenses.filter(
        (exp) => exp.yearsFromNow === year
      );
      totalExpenses += oneTimeForYear.reduce(
        (sum, exp) => sum + exp.futureValue,
        0
      );

      if (totalExpenses >= totalCorpus) {
        yearsLeft = year - (totalExpenses - totalCorpus) / currentExpenses;
        break;
      }
    }
    if (totalExpenses < totalCorpus) yearsLeft = 100;
  } else {
    // Calculate year by year with compound growth and expenses
    let currentExpenses = annualExpenses;
    let year = 0;

    while (remainingCorpus > 0 && year < 100) {
      year++;

      // Apply return to remaining corpus
      remainingCorpus = remainingCorpus * (1 + weightedReturn / 100);

      // Subtract regular expenses
      remainingCorpus -= currentExpenses;

      // Subtract one-time expenses for this year
      const oneTimeForYear = futureOneTimeExpenses.filter(
        (exp) => exp.yearsFromNow === year
      );
      const oneTimeExpenseAmount = oneTimeForYear.reduce(
        (sum, exp) => sum + exp.futureValue,
        0
      );
      remainingCorpus -= oneTimeExpenseAmount;

      // Store year data
      yearlyData.push({
        year,
        corpus: Math.max(0, remainingCorpus),
        regularExpenses: currentExpenses,
        oneTimeExpenses: oneTimeExpenseAmount,
        oneTimeItems: oneTimeForYear,
        age: currentAge + year,
      });

      // Increase regular expenses by inflation for next year
      currentExpenses = currentExpenses * (1 + inflation / 100);

      if (remainingCorpus <= 0) {
        yearsLeft = year - Math.abs(remainingCorpus) / currentExpenses;
        break;
      }
    }

    if (remainingCorpus > 0) {
      yearsLeft = 100; // Corpus lasts very long
    }
  }

  return {
    totalCorpus,
    weightedReturn,
    realReturn,
    yearsLeft,
    annualExpenses,
    futureOneTimeExpenses,
    yearlyData: yearlyData.slice(0, Math.min(30, yearlyData.length)),
    survivalAge: currentAge + yearsLeft,
  };
}
