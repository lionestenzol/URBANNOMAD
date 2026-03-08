function calculateSurvival({ money, dailyFood, gasPrice, mpg }) {
  const foodDays = Math.floor(money / dailyFood);
  const gallons = money / gasPrice;
  const range = gallons * mpg;

  return {
    foodDays,
    range
  };
}
