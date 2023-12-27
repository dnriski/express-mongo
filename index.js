const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const methodeOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const app = express();
const ErrorHandler = require("./ErrorHandler");

// Panggil Model
const Product = require("./models/product");
const Garment = require("./models/garments");

//mongoose connect
mongoose
  .connect("mongodb://127.0.0.1/shop_db")
  .then((result) => {
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodeOverride("_method"));
app.use(
  session({
    secret: "testttst",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.flash_messages = req.flash("flash_messages");
  next();
});

//callback untuk handling error async
function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
}

app.get("/", (req, res) => {
  res.send("Selamat Pagi Rakyat Jelata");
});

app.get(
  "/garments",
  wrapAsync(async (req, res) => {
    const garments = await Garment.find({});
    res.render("garment/index", { garments, message: req.flash("success") });
  })
);

app.get("/garments/create", (req, res) => {
  res.render("garment/create");
});

app.post(
  "/garments",
  wrapAsync(async (req, res) => {
    const garment = new Garment(req.body);
    await garment.save();
    req.flash("flash_messages", "Berhasil menambahkan data Pabrik!");
    res.redirect(`/garments`);
  })
);

app.get(
  "/garments/:id",
  wrapAsync(async (req, res) => {
    const garment = await Garment.findById(req.params.id).populate("products");
    res.render("garment/show", { garment });
  })
);

app.get("/garments/:garment_id/products/create", async (req, res) => {
  const { garment_id } = req.params;
  res.render("products/create", { garment_id });
});

app.post(
  "/garments/:garment_id/products",
  wrapAsync(async (req, res) => {
    const { garment_id } = req.params;
    const garment = await Garment.findById(garment_id);
    const product = new Product(req.body);
    garment.products.push(product);
    product.garment = garment;
    await garment.save();
    await product.save();
    res.redirect(`/garments/${garment_id}`);
  })
);
app.delete(
  "/garments/:garment_id",
  wrapAsync(async (req, res) => {
    const { garment_id } = req.params;
    await Garment.findOneAndDelete({ _id: garment_id });
    res.redirect("/garments");
  })
);

//ambil products dan filter
app.get(
  "/products",
  wrapAsync(async (req, res) => {
    const { category } = req.query;
    if (category) {
      const products = await Product.find({ category });
      res.render("products/index", { products, category });
    } else {
      const products = await Product.find({});
      res.render("products/index", { products, category: "All" });
    }
  })
);

app.get("/products/create", (req, res) => {
  res.render("products/create");
});

app.post(
  "/products",
  wrapAsync(async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.redirect(`/products/${product._id}`);
  })
);

app.post(
  "/products",
  wrapAsync(async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.redirect(`/products/${product._id}`);
  })
);

app.get(
  "/products/:id",
  wrapAsync(async (req, res) => {
    const product = await Product.findById(req.params.id).populate("garment");
    res.render("products/show", { product });
    // res.send(product);
  })
);

app.get(
  "/products/:id/edit",
  wrapAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render("products/edit", { product });
  })
);

app.put(
  "/products/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      runValidators: true,
    });
    res.redirect(`/products/${product._id}`);
  })
);

app.delete(
  "/products/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id)
      .then((result) => {
        res.redirect(`/products`);
      })
      .catch((err) => {
        console.log(err);
      });
  })
);

app.use((err, req, res, next) => {
  console.dir(err);
  if (err.name === "ValidationError") {
    err.status = 400;
    err.message = Object.values(err.errors).map((item) => item.message);
  }
  if (err.name === "CastError") {
    err.status = 404;
    err.message = "Product Not Found Ya";
  }
  next(err);
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Soemting went wrong" } = err;
  res.status(status).send(message);
});

app.listen(3000, () => {
  console.log("Aplikasi berjalan di port 3000");
});
