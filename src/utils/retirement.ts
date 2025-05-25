import type {
  FutureOneTimeExpense,
  YearlyProjection,
  RetirementCalculationsResult,
  RetirementCalculationParams,
} from "../types/retirement";

export function calculateRetirement({
  currentAge,
  inflation,
  monthlyExpenses,
  expenseType,
  investmentBuckets,
  oneTimeExpenses,
}: RetirementCalculationParams): RetirementCalculationsResult {
  const totalCorpus = investmentBuckets.reduce(
    (sum, bucket) => sum + bucket.amount,
    0
  );

  // Calculate weighted average return
  const weightedReturn =
    totalCorpus > 0
      ? investmentBuckets.reduce(
          (sum, bucket) => sum + bucket.amount * bucket.return,
          0
        ) / totalCorpus
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
