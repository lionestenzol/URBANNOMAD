export function calculateSurvival({ money, dailyFood, gasPrice, mpg }) {
  const foodBudget = money * 0.7;
  const fuelBudget = money * 0.3;

  const foodDays = Math.floor(foodBudget / dailyFood);
  const gallons = fuelBudget / gasPrice;
  const range = gallons * mpg;

  return {
    foodDays,
    range,
    gallons,
    money,
    foodBudget,
    fuelBudget
  };
}
