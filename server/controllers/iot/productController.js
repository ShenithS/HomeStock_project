const Product = require("../../models/iot/Product");


exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, category, temperature, humidity } = req.body;

    const product = new Product({
      name,
      category,
      temperature: temperature || Math.floor(Math.random() * 11) + 20,
      humidity: humidity || Math.floor(Math.random() * 41) + 60,
    });

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, category, temperature, humidity } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, temperature, humidity },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
