try {
  const dns = require('dns');
  dns.setServers(['1.1.1.1', '8.8.8.8']);
} catch (e) {
  // Ignore DNS override errors
}

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { User } = require('./models/User');
const { Product } = require('./models/Product');
const { Order } = require('./models/Order');
const { connectDB } = require('./config/db');

dotenv.config();

const realTechVaultProducts = [
  {
    name: 'Sony WH-1000XM5 Noise-Cancelling Headphones',
    price: 349.99,
    description: 'Industry-leading noise cancellation with two processors and 8 microphones. Crystal clear hands-free calling and 30-hour battery life with quick charging.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Apple Watch Ultra 2 Titanium GPS + Cellular',
    price: 799.00,
    description: 'The ultimate sports & adventure smartwatch. Rugged 49mm titanium case, precision dual-frequency GPS, and up to 72 hours of battery life.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
    price: 199.99,
    description: 'Full aluminum CNC body, hot-swappable switches, double-gasket design, and Bluetooth 5.1 wireless connectivity for Mac and Windows.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Logitech G Pro X Superlight 2 Wireless Gaming Mouse',
    price: 159.00,
    description: 'Ultra-lightweight 60g design, HERO 2 sensor with 32,000 DPI, LIGHTSPEED wireless technology, and hybrid optical-mechanical switches.',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'DJI Mini 4 Pro Drone with RC 2 Smart Controller',
    price: 759.00,
    description: 'Under 249g ultra-light foldable camera drone. 4K/60fps HDR true vertical shooting, omnidirectional obstacle sensing, and 20km video transmission.',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Apple MacBook Air 15-inch M3 Chip (16GB RAM, 512GB SSD)',
    price: 1499.00,
    description: 'Strikingly thin design with Liquid Retina display, next-gen M3 performance, MagSafe 3 charging, and all-day 18-hour battery longevity.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'ASUS ROG Swift 27-inch 240Hz OLED Gaming Monitor',
    price: 799.99,
    description: '1440p QHD OLED panel with 0.03ms response time, 99% DCI-P3 color gamut, anti-glare micro-texture coating, and custom heatsink design.',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Marshall Emberton II Portable Bluetooth Speaker',
    price: 169.99,
    description: 'Heavyweight sound in a compact frame. True Stereophonic 360-degree multi-directional audio, 30+ hours of playback, and IP67 dust & water resistance.',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'GoPro HERO12 Black 5.3K Waterproof Action Camera',
    price: 399.00,
    description: 'HyperSmooth 6.0 video stabilization, HDR 5.3K and 4K recording, rugged waterproof chassis up to 33ft, and Bluetooth audio support for external mics.',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Apple AirPods Pro (2nd Gen) with MagSafe Case USB-C',
    price: 249.00,
    description: 'Next-level Active Noise Cancellation with Adaptive Audio, Transparency mode, Personalized Spatial Audio, and precision tracking find-my case.',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Anker Prime 20,000mAh 200W Output Power Bank',
    price: 129.99,
    description: 'Massive 200W total output with dual USB-C high-speed ports. Smart digital display showing real-time wattage, battery capacity, and recharge status.',
    image: 'https://images.unsplash.com/photo-1609592424364-586bf30761e0?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Belkin BoostCharge Pro 3-in-1 MagSafe Fast Wireless Charger',
    price: 149.95,
    description: 'Premium modern chrome-and-silicone stand providing fast wireless charging simultaneously for iPhone (15W), Apple Watch, and AirPods.',
    image: 'https://images.unsplash.com/photo-1622445262464-84b14e074551?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'iPad Air 11-inch M2 Liquid Retina Display (128GB)',
    price: 599.00,
    description: 'Powered by the Apple M2 chip. Gorgeous Liquid Retina display with P3 wide color, landscape 12MP front camera, and Apple Pencil Pro support.',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Elgato Stream Deck MK.2 Live Content Studio Controller',
    price: 149.99,
    description: '15 customizable LCD keys to trigger instant actions, switch scenes, adjust audio, launch apps, and streamline your streaming and creator workflow.',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Razer BlackShark V2 Pro Wireless Esports Gaming Headset',
    price: 199.99,
    description: 'HyperClear Super Wideband microphone, TriForce Titanium 50mm drivers, and ultra-soft memory foam noise-isolating ear cushions.',
    image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sony Alpha ZV-E10 4K Mirrorless Creator Camera',
    price: 698.00,
    description: 'Large 24.2 MP APS-C Exmor CMOS sensor, interchangeable lens system, 4K HDR movie recording, directional 3-capsule mic, and flip-out LCD screen.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Samsung Galaxy Watch 6 Classic 47mm Bluetooth',
    price: 349.99,
    description: 'Iconic rotating physical bezel, sapphire crystal glass, advanced BIA body composition analysis, sleep coaching, and heart rate monitoring.',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Marshall Stanmore III Bluetooth Wireless Home Speaker',
    price: 379.99,
    description: 'Iconic vintage amp aesthetic delivering room-filling, immersive stereo sound with redesigned acoustic tweeters and analog brass control knobs.',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=700&auto=format&fit=crop&q=80',
  },
];

const importData = async () => {
  try {
    await connectDB();

    // Clear existing products
    await Product.deleteMany();

    // Check if users already exist so we don't wipe existing customer passwords
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash('admin123', salt);
      const userPassword = await bcrypt.hash('password123', salt);

      await User.insertMany([
        {
          name: 'Admin Manager',
          email: 'admin@codev.com',
          password: adminPassword,
          role: 'admin',
        },
        {
          name: 'Customer Demo',
          email: 'customer@codev.com',
          password: userPassword,
          role: 'user',
        },
      ]);
      console.log('👤 Created default Admin & Customer accounts.');
    } else {
      console.log(`👤 Keeping ${userCount} existing registered users.`);
    }

    // Insert real TechVault products
    const inserted = await Product.insertMany(realTechVaultProducts);

    console.log(`✅ Success! Seeded ${inserted.length} real TechVault products into MongoDB.`);
    console.log(`🌐 First Product ID: ${inserted[0]._id} (${inserted[0].name})`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Data Import Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('🗑️ All Database Data Cleared.');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Data Destroy Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
