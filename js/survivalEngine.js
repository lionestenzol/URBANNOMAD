export function calculateSurvival({ money, dailyFood, gasPrice, mpg, foodRatio = 0.7 }) {
  const foodBudget = money * foodRatio;
  const fuelBudget = money * (1 - foodRatio);

  const foodDays = Math.floor(foodBudget / dailyFood);
  const gallons = fuelBudget / gasPrice;
  const range = gallons * mpg;

  return {
    foodDays,
    range,
    gallons,
    money,
    foodBudget,
    fuelBudget,
    foodRatio
  };
}
