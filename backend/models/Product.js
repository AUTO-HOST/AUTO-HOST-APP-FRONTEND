// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    user: {
      type: String, // <-- ¡CAMBIO CLAVE AQUÍ! Ahora es un String para los UIDs de Firebase
      required: true,
      ref: 'User', // Mantener ref para indicar que se relaciona con el modelo User (aunque populate no lo use directamente sin ObjectId)
    },
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    sellerEmail: { // Este campo también podría no ser necesario si siempre usas 'user' y lo buscas en Firestore/Auth
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 1,
    },
    isOnOffer: {
      type: Boolean,
      default: false,
    },
    originalPrice: {
      type: Number,
    },
    discountPercentage: {
      type: Number,
    },
    marca_refaccion: { type: String },
    lado: { type: String },
    numero_parte: { type: String },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;