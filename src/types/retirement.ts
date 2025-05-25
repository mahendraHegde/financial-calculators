export interface InvestmentBucket {
  id: number;
  name: string;
  amount: number;
  return: number;
}

export interface OneTimeExpense {
  id: number;
  name: string;
  yearsFromNow: number;
  currentCost: number;
  inflationRate: number;
}

export interface FutureOneTimeExpense extends OneTimeExpense {
  futureValue: number;
  ageWhenDue: number;
}

export interface YearlyProjection {
  year: number;
  corpus: number;
  regularExpenses: number;
  oneTimeExpenses: number;
  oneTimeItems: FutureOneTimeExpense[];
  age: number;
}

export interface RetirementCalculationsResult {
  totalCorpus: number;
  weightedReturn: number;
  realReturn: number;
  yearsLeft: number;
  annualExpenses: number;
  futureOneTimeExpenses: FutureOneTimeExpense[];
  yearlyData: YearlyProjection[];
  survivalAge: number;
}

export interface RetirementCalculationParams {
  currentAge: number;
  inflation: number;
  monthlyExpenses: number;
  expenseType: 'monthly' | 'yearly';
  investmentBuckets: InvestmentBucket[];
  oneTimeExpenses: OneTimeExpense[];
}