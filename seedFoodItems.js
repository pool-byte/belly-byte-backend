require('dotenv').config();
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  category: String,
  unit: String,
  startingQuantity: Number,
  currentQuantity: Number,
});

const ingredientSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  quantityUsed: Number,
  unit: String,
}, { _id: false });

const foodItemSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  price: Number,
  ingredients: [ingredientSchema],
}, { timestamps: true });

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);
const FoodItem = mongoose.models.FoodItem || mongoose.model('FoodItem', foodItemSchema);

async function seedFoodItems() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const items = await Item.find();
    console.log(`Found ${items.length} raw material items in DB.`);

    const findItem = (namePart) => items.find((i) => i.name.toLowerCase().includes(namePart.toLowerCase()));

    const bun = findItem('bun');
    const sauce = findItem('sauce');
    const cheese = findItem('cheese') || findItem('mozzarella');
    const veg = findItem('veg') || findItem('corn');
    const coffee = findItem('coffee');
    const sugar = findItem('sugar');
    const milk = findItem('milk');
    const ice = findItem('ice');
    const vanilla = findItem('vanilla');
    const box = findItem('packaging') || findItem('box');
    const cup = findItem('cup');

    const foodData = [
      {
        name: 'Cheese Grilled Sandwich',
        price: 120,
        ingredients: [
          bun && { itemId: bun._id, quantityUsed: 1, unit: 'pcs' },
          sauce && { itemId: sauce._id, quantityUsed: 35, unit: 'g' },
          cheese && { itemId: cheese._id, quantityUsed: 25, unit: 'g' },
          veg && { itemId: veg._id, quantityUsed: 100, unit: 'g' },
          box && { itemId: box._id, quantityUsed: 1, unit: 'pcs' },
        ].filter(Boolean),
      },
      {
        name: 'Classic Cold Coffee (350ml)',
        price: 90,
        ingredients: [
          coffee && { itemId: coffee._id, quantityUsed: 10, unit: 'g' },
          sugar && { itemId: sugar._id, quantityUsed: 20, unit: 'g' },
          milk && { itemId: milk._id, quantityUsed: 165, unit: 'ml' },
          ice && { itemId: ice._id, quantityUsed: 150, unit: 'g' },
          vanilla && { itemId: vanilla._id, quantityUsed: 5, unit: 'ml' },
          cup && { itemId: cup._id, quantityUsed: 1, unit: 'pcs' },
        ].filter(Boolean),
      },
      {
        name: 'Veg Supreme Sandwich',
        price: 100,
        ingredients: [
          bun && { itemId: bun._id, quantityUsed: 1, unit: 'pcs' },
          sauce && { itemId: sauce._id, quantityUsed: 25, unit: 'g' },
          veg && { itemId: veg._id, quantityUsed: 120, unit: 'g' },
          box && { itemId: box._id, quantityUsed: 1, unit: 'pcs' },
        ].filter(Boolean),
      },
      {
        name: 'Hot Cappuccino / Espresso',
        price: 70,
        ingredients: [
          coffee && { itemId: coffee._id, quantityUsed: 15, unit: 'g' },
          sugar && { itemId: sugar._id, quantityUsed: 15, unit: 'g' },
          milk && { itemId: milk._id, quantityUsed: 120, unit: 'ml' },
          cup && { itemId: cup._id, quantityUsed: 1, unit: 'pcs' },
        ].filter(Boolean),
      },
    ];

    for (const food of foodData) {
      await FoodItem.findOneAndUpdate(
        { name: food.name },
        food,
        { upsert: true, new: true }
      );
      console.log(`Seeded Food Item: ${food.name} (₹${food.price}) with ${food.ingredients.length} ingredients.`);
    }

    console.log('✅ All Food Items successfully seeded into MongoDB!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding food items:', err);
    process.exit(1);
  }
}

seedFoodItems();
