const mongoose = require('mongoose');
const Category = require('./models/category'); // Replace with your model path
const Item = require('./models/item'); // Replace with your model path

mongoose.set('strictQuery', false);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);
const mongoDB = userArgs[0]; // Replace with your actual MongoDB connection string

const main = async () => {
  console.log('Debug: About to connect');
  await mongoose.connect(mongoDB);
  console.log('Debug: Connected!');

  await createCategories();
  await createItems();
  // ... (your existing code from populateDB.js goes here) ...

  // Call the update function after item creation
  const categories = await Category.find({});
  await updateCategories(categories);

  console.log('Debug: Closing mongoose');
  mongoose.connection.close();
};

main().catch((err) => console.log(err));

const createCategories = async () => {
  // Check if Mongoose is already connected
  if (!mongoose.connection.readyState) {
    console.log('Mongoose is not connected. Please start your app first.');
    process.exit(1); // Exit with an error code if not connected
  }

  console.log('Using existing Mongoose connection...');

  // Clear existing categories (optional, uncomment if needed)
  // await Category.deleteMany({});

  // Create and save categories
  const categories = [
    { name: 'PC Games', description: 'Games designed for personal computers' },
    { name: 'Console Games', description: 'Games designed for video game consoles' },
    { name: 'Mobile Games', description: 'Games designed for mobile devices' },
  ];

  await Category.insertMany(categories);

  console.log('Categories populated successfully!');
};

const createItems = async () => {
  // Check if Mongoose is already connected
  if (!mongoose.connection.readyState) {
    console.log('Mongoose is not connected. Please start your app first.');
    process.exit(1); // Exit with an error code if not connected
  }

  console.log('Using existing Mongoose connection...');

  // Clear existing data (optional, uncomment if needed)
  // await Category.deleteMany({});
  // await Item.deleteMany({});

  // Get categories by name (assuming categories are already populated)
  const pcCategory = await Category.findOne({ name: 'PC Games' });
  const consoleCategory = await Category.findOne({ name: 'Console Games' });
  const mobileCategory = await Category.findOne({ name: 'Mobile Games' });

  // Create and save PC-only games
  const pcGames = [
    {
      name: 'The Witcher 3: Wild Hunt',
      description:
        'A sprawling open-world RPG where you play as Geralt of Rivia, a monster hunter for hire. Explore a fantastical world, hunt mythical beasts, and uncover a dark secret that threatens the entire world.',
      price: 39.99,
      quantity: 10,
      images: [
        { url: 'https://i.pinimg.com/originals/49/c7/2d/49c72d80f7cdd7fc25df51c77d7fd0dc.jpg' }, // Replace with actual image URLs
      ],
      category: pcCategory._id,
    },
    {
      name: 'Elden Ring',
      description:
        'Embark on a vast journey through the Lands Between, a new fantasy world created by Hidetaka Miyazaki and George R. R. Martin. Unravel the secrets of the Elden Ring and face formidable foes to claim the power of the Elden Lord.',
      price: 59.99,
      quantity: 15,
      images: [
        { url: 'https://www.chromethemer.com/download/hd-wallpapers/elden-ring-2560x1440.jpg' }, // Replace with actual image URLs
      ],
      category: pcCategory._id,
    },
    {
      name: 'Hollow Knight',
      description:
        'Descend into a sprawling, interconnected world of forgotten ruins and ancient secrets. Master your combat skills, uncover hidden depths, and conquer monstrous foes in this challenging Metroidvania action-adventure.',
      price: 14.99,
      quantity: 20,
      images: [
        { url: 'https://i.pinimg.com/originals/be/6c/a7/be6ca75c943aec7d4fbd4dd3c9173a9a.jpg' }, // Replace with actual image URLs
      ],
      category: pcCategory._id,
    },
  ];

  await Item.insertMany(pcGames);

  // Create and save console-only games
  const consoleGames = [
    {
      name: 'God of War',
      description:
        'Kratos, a vengeful warrior, and his son Atreus embark on a perilous journey through the Norse realms. Fight against monstrous creatures from Norse mythology and forge a lasting bond as father and son.',
      price: 59.99,
      quantity: 5,
      images: [
        { url: 'https://www.digitaltrends.com/wp-content/uploads/2022/01/god-of-war-pc-performance-1.jpg?fit=2560%2C1440&p=1' }, // Replace with actual image URLs
      ],
      category: consoleCategory._id,
    },
    {
      name: 'Horizon Zero Dawn',
      description:
        'Aloy, a skilled hunter, explores a post-apocalyptic world overrun by machines. Uncover the secrets of the past and face awe-inspiring mechanical creatures in this open-world action RPG.',
      price: 29.99,
      quantity: 8,
      images: [
        { url: 'https://i.pinimg.com/originals/1d/ef/8e/1def8e6b9c051d92a0fd6dc0b211fe03.jpg' }, // Replace with actual image URLs
      ],
      category: consoleCategory._id,
    },
    {
      name: 'Super Mario Odyssey',
      description:
        'Join Mario on a globe-trotting adventure to collect Power Moons and foil Bowser’s wedding plans! Explore colorful kingdoms, utilize captured abilities, and discover secrets in this delightful 3D platformer.',
      price: 59.99,
      quantity: 12,
      images: [
        { url: 'https://i0.wp.com/awardsradar.com/wp-content/uploads/2023/04/the-super-mario-bros-movie-poster-4k-wallpaper-scaled-1.jpg?fit=2560%2C1440&ssl=1' }, // Replace with actual image URLs
      ],
      category: consoleCategory._id,
    },
    // ... add 2 more console-only games with similar structure (optional)
  ];

  await Item.insertMany(consoleGames);

  // Create and save mobile-only games
  const mobileGames = [
    {
      name: 'Genshin Impact',
      description:
        'Explore a vast open world filled with wonder, conquer challenging enemies, and uncover the mysteries of Teyvat. Team up with a diverse cast of characters and embark on an epic adventure.',
      price: 0.00, // Free-to-play game
      quantity: Infinity, // Set quantity to Infinity for virtual items
      images: [
        { url: 'https://cdn1.epicgames.com/salesEvent/salesEvent/EGS_GenshinImpact_miHoYoLimited_S1_2560x1440-91c6cd7312cc2647c3ebccca10f30399' }, // Replace with actual image URLs
      ],
      category: mobileCategory._id,
    },
    {
      name: 'Pokemon Go',
      description:
        'Catch, train, and battle Pokémon in the real world with Pokémon Go! Explore your surroundings, find wild Pokémon, and join forces with friends to raid powerful Pokémon Gyms.',
      price: 0.00, // Free-to-play game with in-app purchases
      quantity: Infinity, // Set quantity to Infinity for virtual items
      images: [
        { url: 'https://wallpapercave.com/wp/wp1826515.jpg' }, // Replace with actual image URLs
      ],
      category: mobileCategory._id,
    },
    {
      name: 'Call of Duty: Mobile',
      description:
        'Experience the thrill of fast-paced multiplayer action on the go with Call of Duty: Mobile. Create your loadout, jump into iconic maps and modes, and battle against players from around the world.',
      price: 0.00, // Free-to-play game with in-app purchases
      quantity: Infinity, // Set quantity to Infinity for virtual items
      images: [
        { url: 'https://wallpapers.com/images/hd/4k-call-of-duty-mobile-poster-5c50tuqihdfcliuz.jpg' }, // Replace with actual image URLs
      ],
      category: mobileCategory._id,
    },
    // ... add 2 more mobile-only games with similar structure (optional)
  ];
};

const updateCategories = async (categories) => {
  // Use async/await with Promise.all for parallel updates
  await Promise.all(categories.map(async (category) => {
    // Find items belonging to this category
    const categoryItems = await Item.find({ category: category._id });

    // Update the category's items array with item IDs
    category.items = categoryItems.map((item) => item._id);

    // Save the updated category
    await category.save();
  }));

  console.log('Categories updated with item IDs');
};
