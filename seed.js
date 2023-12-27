const mongoose = require("mongoose");
// Panggil Model
const Product = require("./models/product");

mongoose
  .connect("mongodb://127.0.0.1/shop_db")
  .then((result) => {
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.log(err);
  });

//data dummy
const seedProducts = [
  {
    name: "Kemja Flanel",
    brand: "Hollister",
    price: 750000,
    color: "biru",
    size: "S",
  },
  {
    name: "Kemja Putih",
    brand: "Adidas",
    price: 120000,
    color: "putih",
    category: "Baju",
  },
  {
    name: "Tas Ransel",
    brand: "Eiger",
    price: 250000,
    color: "hitamm",
    category: "Aksesoris",
  },
  {
    name: "Celana Chino",
    brand: "Levi's",
    price: 950000,
    color: "krem",
    category: "Celana",
  },
];

Product.insertMany(seedProducts)
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });
