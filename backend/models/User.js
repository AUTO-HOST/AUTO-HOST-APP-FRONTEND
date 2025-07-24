const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre_completo: { type: String, required: false },
  businessName: { type: String, required: false },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  type: { type: String, required: true, enum: ['comprador', 'vendedor'] },
  rfc: { type: String, required: false },
  clabe: { type: String, required: false },
}, {
  timestamps: true,
});

// IMPORTANTE: Este código se ejecuta ANTES de que un usuario se guarde en la DB
userSchema.pre('save', async function (next) {
  // Si la contraseña no ha sido modificada, no hagas nada
  if (!this.isModified('password')) {
    return next();
  }

  // "Sala" la contraseña para hacerla más segura y luego la encripta
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
// Este modelo define la estructura de los documentos de usuario en la base de datos MongoDB
// y se encarga de encriptar las contraseñas antes de guardarlas.
