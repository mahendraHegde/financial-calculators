import {
  AlertCircle,
  Calculator,
  PiggyBank,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import type {
  FutureOneTimeExpense,
  InvestmentBucket,
  OneTimeExpense,
  RetirementCalculationsResult,
  YearlyProjection,
} from "../types/retirement";
import { calculateRetirement } from "../utils/retirement";
import {
  getInitialRetirementConfig,
  saveRetirementConfig,
  type RetirementCalculatorConfig,
} from "../utils/storage";

const RetirementCalculator = () => {
  // Get initial config from storage or default
  const initialConfig: RetirementCalculatorConfig =
    getInitialRetirementConfig();

  const [currentAge, setCurrentAge] = useState<number>(
    initialConfig.currentAge
  );
  const [inflation, setInflation] = useState<number>(initialConfig.inflation);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(
    initialConfig.monthlyExpenses
  );
  const [expenseType, setExpenseType] = useState<"monthly" | "yearly">(
    initialConfig.expenseType
  );

  // Dynamic investment buckets
  const [investmentBuckets, setInvestmentBuckets] = useState<
    InvestmentBucket[]
  >(initialConfig.investmentBuckets);

  // One-time expenses
  const [oneTimeExpenses, setOneTimeExpenses] = useState<OneTimeExpense[]>(
    initialConfig.oneTimeExpenses
  );

  const [nextBucketId, setNextBucketId] = useState<number>(
    initialConfig.nextBucketId
  );
  const [nextExpenseId, setNextExpenseId] = useState<number>(
    initialConfig.nextExpenseId
  );

  // Save feedback state
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  // Save handler
  const handleSave = () => {
    saveRetirementConfig({
      currentAge,
      inflation,
      monthlyExpenses,
      expenseType,
      investmentBuckets,
      oneTimeExpenses,
      nextBucketId,
      nextExpenseId,
    });
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  // Save button component
  const SaveButton = () => (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSave}
        className="px-4 cursor-pointer py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        type="button"
      >
        Save
      </button>
      {saveStatus === "saved" && (
        <span className="text-green-600 text-sm font-medium">Saved!</span>
      )}
    </div>
  );

  // Functions to manage investment buckets
  const addInvestmentBucket = () => {
    setInvestmentBuckets((prev) => [
      ...prev,
      {
        id: nextBucketId,
        name: "New Investment",
        amount: 0,
        return: 0,
      },
    ]);
    setNextBucketId((prev) => prev + 1);
  };

  const updateInvestmentBucket = (
    id: number,
    field: keyof InvestmentBucket,
    value: string | number
  ) => {
    setInvestmentBuckets((buckets) =>
      buckets.map((bucket) =>
        bucket.id === id ? { ...bucket, [field]: value } : bucket
      )
    );
  };

  const removeInvestmentBucket = (id: number) => {
    setInvestmentBuckets((buckets) =>
      buckets.filter((bucket) => bucket.id !== id)
    );
  };

  // Functions to manage one-time expenses
  const addOneTimeExpense = () => {
    setOneTimeExpenses((prev) => [
      ...prev,
      {
        id: nextExpenseId,
        name: "New Expense",
        yearsFromNow: 1,
        currentCost: 0,
        inflationRate: 6,
      },
    ]);
    setNextExpenseId((prev) => prev + 1);
  };

  const updateOneTimeExpense = (
    id: number,
    field: keyof OneTimeExpense,
    value: string | number
  ) => {
    setOneTimeExpenses((expenses) =>
      expenses.map((expense) =>
        expense.id === id ? { ...expense, [field]: value } : expense
      )
    );
  };

  const removeOneTimeExpense = (id: number) => {
    setOneTimeExpenses((expenses) =>
      expenses.filter((expense) => expense.id !== id)
    );
  };

  const calculations: RetirementCalculationsResult = useMemo(
    () =>
      calculateRetirement({
        currentAge,
        inflation,
        monthlyExpenses,
        expenseType,
        investmentBuckets,
        oneTimeExpenses,
      }),
    [
      currentAge,
      inflation,
      monthlyExpenses,
      expenseType,
      investmentBuckets,
      oneTimeExpenses,
    ]
  );

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <Calculator className="text-blue-600" />
          Retirement Runway Calculator
        </h1>
        <p className="text-gray-600">
          Plan your retirement with dynamic investment buckets and one-time
          expenses
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Basic Details */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-800">
                Basic Details
              </h2>
              <SaveButton />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Age
                </label>
                <input
                  type="number"
                  value={currentAge}
                  onChange={(e) => setCurrentAge(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Inflation (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inflation}
                  onChange={(e) => setInflation(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expense Type
                </label>
                <select
                  value={expenseType}
                  onChange={(e) =>
                    setExpenseType(e.target.value as "monthly" | "yearly")
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected {expenseType === "monthly" ? "Monthly" : "Yearly"}{" "}
                  Expenses (₹)
                </label>
                <input
                  type="number"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Investment Buckets */}
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-green-800">
                Investment Buckets
              </h2>
              <button
                onClick={addInvestmentBucket}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                <Plus size={16} />
                Add Bucket
              </button>
            </div>

            {investmentBuckets.map((bucket) => (
              <div
                key={bucket.id}
                className="mb-4 p-4 bg-white rounded-md border"
              >
                <div className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-4">
                    <label className="block text-xs text-gray-600 mb-1">
                      Investment Name
                    </label>
                    <input
                      type="text"
                      value={bucket.name}
                      onChange={(e) =>
                        updateInvestmentBucket(
                          bucket.id,
                          "name",
                          e.target.value
                        )
                      }
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                      placeholder="e.g., Crypto, Gold, etc."
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs text-gray-600 mb-1">
                      Amount ({formatCurrency(bucket.amount)})
                    </label>
                    <input
                      type="number"
                      value={bucket.amount}
                      onChange={(e) =>
                        updateInvestmentBucket(
                          bucket.id,
                          "amount",
                          Number(e.target.value)
                        )
                      }
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs text-gray-600 mb-1">
                      Post-tax Return (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={bucket.return}
                      onChange={(e) =>
                        updateInvestmentBucket(
                          bucket.id,
                          "return",
                          Number(e.target.value)
                        )
                      }
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={() => removeInvestmentBucket(bucket.id)}
                      className="w-full p-2 text-red-600 hover:bg-red-50 rounded"
                      disabled={investmentBuckets.length === 1}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* One-Time Expenses */}
          <div className="bg-orange-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-orange-800">
                One-Time Expenses
              </h2>
              <button
                onClick={addOneTimeExpense}
                className="flex items-center gap-1 px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
              >
                <Plus size={16} />
                Add Expense
              </button>
            </div>

            {oneTimeExpenses.map((expense) => (
              <div
                key={expense.id}
                className="mb-4 p-4 bg-white rounded-md border"
              >
                <div className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-3">
                    <label className="block text-xs text-gray-600 mb-1">
                      Expense Name
                    </label>
                    <input
                      type="text"
                      value={expense.name}
                      onChange={(e) =>
                        updateOneTimeExpense(expense.id, "name", e.target.value)
                      }
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                      placeholder="e.g., Car, Education"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">
                      Years from Now
                    </label>
                    <input
                      type="number"
                      value={expense.yearsFromNow}
                      onChange={(e) =>
                        updateOneTimeExpense(
                          expense.id,
                          "yearsFromNow",
                          Number(e.target.value)
                        )
                      }
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs text-gray-600 mb-1">
                      Current Cost ({formatCurrency(expense.currentCost)})
                    </label>
                    <input
                      type="number"
                      value={expense.currentCost}
                      onChange={(e) =>
                        updateOneTimeExpense(
                          expense.id,
                          "currentCost",
                          Number(e.target.value)
                        )
                      }
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">
                      Inflation (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={expense.inflationRate}
                      onChange={(e) =>
                        updateOneTimeExpense(
                          expense.id,
                          "inflationRate",
                          Number(e.target.value)
                        )
                      }
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={() => removeOneTimeExpense(expense.id)}
                      className="w-full p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank size={20} />
                <span className="text-sm opacity-90">Total Corpus</span>
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(calculations.totalCorpus)}
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} />
                <span className="text-sm opacity-90">Weighted Return</span>
              </div>
              <div className="text-2xl font-bold">
                {calculations.weightedReturn.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-yellow-800">
              Key Metrics
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Annual Expenses:</span>
                <span className="font-semibold">
                  {formatCurrency(calculations.annualExpenses)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">
                  Real Return (after inflation):
                </span>
                <span
                  className={`font-semibold ${
                    calculations.realReturn >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {calculations.realReturn.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Corpus Duration:</span>
                <span className="font-semibold text-blue-600">
                  {calculations.yearsLeft >= 100
                    ? "100+ years"
                    : `${calculations.yearsLeft.toFixed(1)} years`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Money lasts until age:</span>
                <span className="font-semibold text-purple-600">
                  {calculations.survivalAge >= 130
                    ? "100+"
                    : Math.round(calculations.survivalAge)}
                </span>
              </div>
            </div>
          </div>

          {/* Future One-Time Expenses */}
          {calculations.futureOneTimeExpenses.length > 0 && (
            <div className="bg-red-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-red-800">
                Future One-Time Expenses
              </h2>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {calculations.futureOneTimeExpenses.map(
                  (expense: FutureOneTimeExpense, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {expense.name} (Age {expense.ageWhenDue}):
                      </span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(expense.futureValue)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Warnings */}
          {calculations.realReturn < 0 && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <AlertCircle size={20} />
                <span className="font-semibold">
                  Warning: Negative Real Return
                </span>
              </div>
              <p className="text-red-600 text-sm">
                Your weighted return ({calculations.weightedReturn.toFixed(1)}%)
                is lower than inflation ({inflation}%). Consider increasing
                allocation to higher-return investments.
              </p>
            </div>
          )}

          {calculations.yearsLeft < 20 && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <AlertCircle size={20} />
                <span className="font-semibold">Low Duration Alert</span>
              </div>
              <p className="text-orange-600 text-sm">
                Your corpus may last only {calculations.yearsLeft.toFixed(1)}{" "}
                years. Consider increasing your corpus or reducing expenses.
              </p>
            </div>
          )}

          {/* Portfolio Allocation */}
          <div className="bg-purple-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">
              Portfolio Allocation
            </h2>
            <div className="space-y-2">
              {investmentBuckets.map((bucket, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{bucket.name}:</span>
                  <span className="text-sm font-medium">
                    {((bucket.amount / calculations.totalCorpus) * 100).toFixed(
                      1
                    )}
                    % ({formatCurrency(bucket.amount)})
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Projection
            </h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {calculations.yearlyData.map(
                (data: YearlyProjection, index: number) => (
                  <div key={index} className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age {data.age}:</span>
                      <span className="font-medium">
                        {formatCurrency(data.corpus)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      Regular: {formatCurrency(data.regularExpenses)}
                      {data.oneTimeExpenses > 0 && (
                        <span className="text-red-600 ml-2">
                          One-time: {formatCurrency(data.oneTimeExpenses)}
                          {data.oneTimeItems.length > 0 && (
                            <span className="ml-1">
                              (
                              {data.oneTimeItems
                                .map((item: FutureOneTimeExpense) => item.name)
                                .join(", ")}
                              )
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetirementCalculator;
