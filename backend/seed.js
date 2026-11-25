import dns from "dns";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Category from "./models/categoryModel.js";
import Product from "./models/productModel.js";
import User from "./models/userModel.js";

dotenv.config();

// Fallback to public DNS locally when ISP DNS blocks MongoDB SRV lookups
if (!process.env.VERCEL) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const SAMPLE_CATEGORIES = ["Smartphones", "Laptops", "Audio", "Accessories"];

const SAMPLE_PRODUCTS = [
  {
    name: "iPhone 13 Pro",
    brand: "Apple",
    categoryName: "Smartphones",
    price: 1099.99,
    quantity: 56,
    countInStock: 56,
    rating: 4.8,
    numReviews: 12,
    image: "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/1.webp",
    description:
      "The iPhone 13 Pro is a cutting-edge smartphone with a powerful Pro camera system, high-performance chip, and Super Retina XDR display.",
  },
  {
    name: "Samsung Galaxy S10",
    brand: "Samsung",
    categoryName: "Smartphones",
    price: 699.99,
    quantity: 19,
    countInStock: 19,
    rating: 4.5,
    numReviews: 8,
    image: "https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s10/1.webp",
    description:
      "The Samsung Galaxy S10 features a dynamic AMOLED display, versatile triple-camera system, and flagship performance.",
  },
  {
    name: "Realme XT",
    brand: "Realme",
    categoryName: "Smartphones",
    price: 349.99,
    quantity: 80,
    countInStock: 80,
    rating: 4.6,
    numReviews: 15,
    image: "https://cdn.dummyjson.com/product-images/smartphones/realme-xt/1.webp",
    description:
      "The Realme XT comes equipped with a 64MP quad camera sensor, Super AMOLED display, and fast charging for everyday creators.",
  },
  {
    name: "Apple MacBook Pro 14 Inch Space Grey",
    brand: "Apple",
    categoryName: "Laptops",
    price: 1999.99,
    quantity: 24,
    countInStock: 24,
    rating: 4.9,
    numReviews: 21,
    image:
      "https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/1.webp",
    description:
      "The MacBook Pro 14 Inch in Space Grey delivers pro-level performance with a Liquid Retina XDR display and all-day battery life.",
  },
  {
    name: "Asus Zenbook Pro Dual Screen Laptop",
    brand: "Asus",
    categoryName: "Laptops",
    price: 1799.99,
    quantity: 45,
    countInStock: 45,
    rating: 4.7,
    numReviews: 11,
    image:
      "https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-laptop/1.webp",
    description:
      "The Asus Zenbook Pro Dual Screen Laptop offers dual displays and workstation-grade speed built for multitasking and creative workflows.",
  },
  {
    name: "New DELL XPS 13 9300 Laptop",
    brand: "Dell",
    categoryName: "Laptops",
    price: 1499.99,
    quantity: 74,
    countInStock: 74,
    rating: 4.6,
    numReviews: 9,
    image:
      "https://cdn.dummyjson.com/product-images/laptops/new-dell-xps-13-9300-laptop/1.webp",
    description:
      "Compact ultrabook featuring a virtually borderless InfinityEdge display, precision CNC aluminum chassis, and snappy performance.",
  },
  {
    name: "Huawei Matebook X Pro",
    brand: "Huawei",
    categoryName: "Laptops",
    price: 1399.99,
    quantity: 75,
    countInStock: 75,
    rating: 4.9,
    numReviews: 14,
    image:
      "https://cdn.dummyjson.com/product-images/laptops/huawei-matebook-x-pro/1.webp",
    description:
      "Slim and lightweight flagship ultrabook with a 3K FullView touchscreen display and studio-quality quad speakers.",
  },
  {
    name: "Apple AirPods Max Silver",
    brand: "Apple",
    categoryName: "Audio",
    price: 549.99,
    quantity: 59,
    countInStock: 59,
    rating: 4.7,
    numReviews: 18,
    image:
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/1.webp",
    description:
      "Premium over-ear headphones featuring high-fidelity audio, Adaptive EQ, Spatial Audio, and active noise cancellation.",
  },
  {
    name: "Apple Airpods",
    brand: "Apple",
    categoryName: "Audio",
    price: 129.99,
    quantity: 67,
    countInStock: 67,
    rating: 4.4,
    numReviews: 26,
    image:
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/1.webp",
    description:
      "Seamless wireless audio with instant device pairing, crisp sound, and compact charging case for all-day listening.",
  },
  {
    name: "Amazon Echo Plus",
    brand: "Amazon",
    categoryName: "Audio",
    price: 99.99,
    quantity: 61,
    countInStock: 61,
    rating: 4.8,
    numReviews: 19,
    image:
      "https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/1.webp",
    description:
      "Smart speaker with 360-degree Dolby audio and built-in Zigbee smart home hub powered by Alexa voice control.",
  },
  {
    name: "Apple Airpower Wireless Charger",
    brand: "Apple",
    categoryName: "Accessories",
    price: 79.99,
    quantity: 30,
    countInStock: 30,
    rating: 4.3,
    numReviews: 7,
    image:
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpower-wireless-charger/1.webp",
    description:
      "Sleek wireless charging mat designed to power compatible smartphones, earbuds, and smartwatches effortlessly.",
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    const categoryMap = new Map();
    for (const name of SAMPLE_CATEGORIES) {
      let category = await Category.findOne({ name });
      if (!category) {
        category = await Category.create({ name });
        console.log(`Created category: ${name}`);
      }
      categoryMap.set(name, category._id);
    }

    let createdCount = 0;
    for (const item of SAMPLE_PRODUCTS) {
      const exists = await Product.findOne({ name: item.name });
      if (!exists) {
        await Product.create({
          name: item.name,
          brand: item.brand,
          category: categoryMap.get(item.categoryName),
          price: item.price,
          quantity: item.quantity,
          countInStock: item.countInStock,
          rating: item.rating,
          numReviews: item.numReviews,
          image: item.image,
          description: item.description,
        });
        createdCount += 1;
      }
    }
    console.log(`Seeded ${createdCount} new products.`);

    const adminResult = await User.updateMany(
      { email: { $in: ["ankitpareek2005@gmail.com", "2024kuec2077@iiitkota.ac.in"] } },
      { $set: { isAdmin: true } }
    );
    console.log(`Updated admin status for ${adminResult.modifiedCount} matching user(s).`);

    await mongoose.disconnect();
    console.log("Seeding complete.");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seedDatabase();
