const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');

// Declaramos las variables en el ámbito superior para que sean visibles en todo el archivo.
let authMiddleware;
let admin;

try {
  // Importamos y asignamos las dependencias de una manera segura y robusta.
  ({ authMiddleware } = require('../middleware/authMiddleware'));
  ({ admin } = require('../firebaseAdmin'));

  // Verificamos que los módulos críticos se hayan cargado correctamente.
  if (typeof authMiddleware !== 'function' || !admin) {
    throw new Error('Falló la inicialización de un módulo crítico (authMiddleware o firebaseAdmin).');
  }
} catch(e) {
  // Si algo sale mal durante la importación, lo mostramos en la consola y detenemos el servidor.
  // Esto previene que el servidor arranque en un estado inestable.
  console.error("--- ERROR CATASTRÓFICO EN productRoutes.js ---", e.message); 
  process.exit(1);
}

// Configuración de Multer para manejar la subida de archivos en la memoria del servidor.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Asegúrate de que 'admin' esté inicializado antes de intentar acceder a 'admin.storage()'
// Esto ya lo validamos en el bloque try/catch de arriba, así que deberíamos estar seguros aquí.
const bucket = admin.storage().bucket();

// --- RUTA PARA CREAR UN NUEVO PRODUCTO (POST /api/products) ---
// Protegida por authMiddleware para asegurar que solo usuarios autenticados puedan crear productos.
router.post('/', 
  (req, res, next) => {
    console.log("DEBUG: Solicitud POST /api/products enrutada."); 
    next(); 
  },
  authMiddleware, 
  (req, res, next) => {
    console.log("DEBUG: authMiddleware procesado. Usuario:", req.user ? req.user.userId : "No autenticado");
    next(); 
  },
  upload.single('image'), 
  (req, res, next) => {
    console.log("DEBUG: Multer procesado. Archivo:", req.file ? req.file.originalname : "No hay archivo");
    next(); 
  },
  async (req, res) => {
    console.log("¡Solicitud POST /api/products recibida en el backend - dentro de la lógica!"); 
    console.log("DEBUG: Contenido de req.body:", req.body); 
    
    try {
      const sellerId = req.user.userId;

      if (!req.file) {
        return res.status(400).json({ message: 'No se ha subido ninguna imagen.' });
      }
      
      const sanitizedFilename = `${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
      const file = bucket.file(`products/${sanitizedFilename}`);
      
      const stream = file.createWriteStream({ 
        metadata: { contentType: req.file.mimetype } 
      });

      stream.on('error', (err) => {
        console.error("Error al subir a Firebase Storage:", err);
        res.status(500).send({ message: 'Error interno al subir la imagen.' });
      });

      stream.on('finish', async () => {
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        
        const newProduct = new Product({ 
          ...req.body, 
          imageUrl: publicUrl, 
          user: sellerId 
        });
        const savedProduct = await newProduct.save();
        
        res.status(201).json(savedProduct);
      });

      stream.end(req.file.buffer);

    } catch (error) {
      console.error("Error en la ruta de creación de producto:", error);
      res.status(400).json({ message: 'Error al procesar la solicitud para crear el producto.', error: error.message });
    }
  }
);

// --- RUTA PARA OBTENER TODOS LOS PRODUCTOS (GET /api/products) CON PAGINACIÓN, FILTROS Y ORDENAMIENTO ---
router.get('/', async (req, res) => {
    try {
        const { name, category, condition, minPrice, maxPrice, brand, sellerId, page, limit, sort } = req.query; // <-- ¡Añadido 'sort' aquí!
        
        // Construir el objeto de filtro
        let filter = {};

        if (name) { filter.name = { $regex: name, $options: 'i' }; }
        if (category && category !== 'Todas') { filter.category = category; }
        if (condition && condition !== 'Todas') { filter.condition = condition; }
        if (brand && brand !== 'Todas') { filter.marca_refaccion = brand; }
        if (sellerId) { filter.user = sellerId; }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) { filter.price.$gte = parseFloat(minPrice); }
            if (maxPrice) { filter.price.$lte = parseFloat(maxPrice); }
        }

        // Lógica de Paginación
        const pageNumber = parseInt(page) || 1; 
        const limitNumber = parseInt(limit) || 9; 
        const skip = (pageNumber - 1) * limitNumber; 

        // Lógica de Ordenamiento
        let sortOptions = {};
        switch (sort) {
            case 'priceAsc':
                sortOptions = { price: 1 }; // 1 para ascendente
                break;
            case 'priceDesc':
                sortOptions = { price: -1 }; // -1 para descendente
                break;
            case 'recent':
            default:
                sortOptions = { createdAt: -1 }; // Por defecto, los más recientes primero
                break;
        }

        // 1. Obtener el total de productos que coinciden con el filtro (sin paginación)
        const totalProducts = await Product.countDocuments(filter);

        // 2. Obtener los productos para la página actual con los filtros, paginación y ordenamiento
        const products = await Product.find(filter)
                                      .sort(sortOptions) // <-- ¡APLICAR ORDENAMIENTO AQUÍ!
                                      .skip(skip)
                                      .limit(limitNumber); 
        
        res.json({
            products,
            totalProducts,
            currentPage: pageNumber,
            productsPerPage: limitNumber
        });

    } catch(err) {
        console.error("Error al obtener productos con filtros y paginación:", err);
        res.status(500).json({ message: "Error del servidor al obtener los productos" });
    }
});

// --- RUTA PARA OBTENER UN PRODUCTO POR SU ID (GET /api/products/:id) ---
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id); 
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Producto no encontrado.' });
        }
    } catch(err) {
        console.error("Error al obtener un producto por ID:", err);
        res.status(500).json({ message: "Error del servidor al obtener el producto" });
    }
});

// --- RUTA: ACTUALIZAR UN PRODUCTO (PUT /api/products/:id) ---
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    console.log(`DEBUG: Solicitud PUT /api/products/${req.params.id} recibida.`);
    console.log("DEBUG: Contenido de req.body para PUT:", req.body);
    try {
        const productId = req.params.id;
        const userId = req.user.userId;

        const product = await Product.findById(productId);

        if (!product) {
            console.error("Error PUT: Producto no encontrado para actualizar.");
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        if (product.user !== userId) {
            console.error(`Error PUT: Acceso denegado. Producto ${productId} no pertenece a usuario ${userId}. Dueño real: ${product.user}`);
            return res.status(403).json({ message: 'Acceso denegado. No tienes permiso para editar este producto.' });
        }

        const updateData = { ...req.body };

        if (req.file) {
            if (product.imageUrl && !product.imageUrl.includes("placehold.it")) {
                try {
                    const fileName = product.imageUrl.split('/').pop().split('?')[0];
                    const fileRef = bucket.file(`products/${fileName}`);
                    await fileRef.delete();
                    console.log(`DEBUG: Imagen antigua ${fileName} eliminada de Storage.`);
                } catch (storageErr) {
                    console.warn("ADVERTENCIA: No se pudo eliminar la imagen antigua de Storage:", storageErr.message);
                }
            }
            const sanitizedFilename = `${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
            const file = bucket.file(`products/${sanitizedFilename}`);
            const stream = file.createWriteStream({ metadata: { contentType: req.file.mimetype } });

            await new Promise((resolve, reject) => {
                stream.on('error', reject);
                stream.on('finish', resolve);
                stream.end(req.file.buffer);
            });
            await file.makePublic();
            updateData.imageUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
            console.log(`DEBUG: Nueva imagen subida a Storage: ${updateData.imageUrl}`);
        } else {
            updateData.imageUrl = product.imageUrl;
            console.log("DEBUG: No se subió nueva imagen, manteniendo la existente.");
        }

        const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true });

        if (!updatedProduct) {
            console.error("Error PUT: No se pudo actualizar el producto (findByIdAndUpdate falló).");
            return res.status(500).json({ message: 'Error al actualizar el producto.' });
        }

        console.log("DEBUG: Producto actualizado con éxito:", updatedProduct._id);
        res.status(200).json(updatedProduct);

    } catch (error) {
        console.error("Error en la ruta PUT /api/products/:id:", error);
        res.status(400).json({ message: 'Error al procesar la solicitud de actualización.', error: error.message });
    }
});

// --- RUTA: ELIMINAR UN PRODUCTO (DELETE /api/products/:id) ---
router.delete('/:id', authMiddleware, async (req, res) => {
    console.log(`DEBUG: Solicitud DELETE /api/products/${req.params.id} recibida.`);
    try {
        const productId = req.params.id;
        const userId = req.user.userId;

        console.log(`DEBUG: Intentando eliminar producto con ID: ${productId} por usuario: ${userId}`); 

        let product;
        try { 
            product = await Product.findById(productId);
            console.log(`DEBUG: Producto encontrado (si existe):`, product ? product._id : 'null/undefined'); 
        } catch (findError) {
            console.error("Error DELETE: Falló Product.findById:", findError.message); 
            if (findError.name === 'CastError') { 
                return res.status(400).json({ message: 'ID de producto inválido.' });
            }
            return res.status(500).json({ message: 'Error al buscar el producto para eliminar.' });
        }
        
        if (!product) {
            console.error("Error DELETE: Producto no encontrado para eliminar.");
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        console.log(`DEBUG: Producto encontrado. ID del producto: ${product._id}, ID de su dueño: ${product.user}`); 
        console.log(`DEBUG: ID del usuario autenticado: ${userId}`); 

        if (product.user !== userId) { 
            console.error(`Error DELETE: Acceso denegado. Producto ${productId} no pertenece a usuario ${userId}. Dueño real: ${product.user}`); 
            return res.status(403).json({ message: 'Acceso denegado. No tienes permiso para eliminar este producto.' });
        }
        console.log("DEBUG: Verificación de propiedad exitosa."); 

        if (product.imageUrl && !product.imageUrl.includes("placehold.it")) { 
            try {
                const fileName = product.imageUrl.split('/').pop().split('?')[0]; 
                const fileRef = bucket.file(`products/${fileName}`); 
                await fileRef.delete();
                console.log(`DEBUG: Imagen ${fileName} eliminada de Storage.`);
            } catch (storageErr) {
                console.warn("ADVERTENCIA: No se pudo eliminar la imagen antigua de Storage:", storageErr.message); 
            }
        }
        console.log("DEBUG: Lógica de eliminación de imagen completada."); 

        const deletedProduct = await Product.findByIdAndDelete(productId);
        console.log(`DEBUG: Resultado de findByIdAndDelete:`, deletedProduct ? deletedProduct._id : 'null/undefined'); 

        if (!deletedProduct) {
            console.error("Error DELETE: No se pudo eliminar el producto (findByIdAndDelete falló).");
            return res.status(500).json({ message: 'Error al eliminar el producto.' });
        }

        console.log("DEBUG: Producto eliminado con éxito:", deletedProduct._id); 
        res.status(200).json({ message: 'Producto eliminado exitosamente', deletedProduct: deletedProduct });

    } catch (error) { 
        console.error("Error en la ruta DELETE /api/products/:id:", error); 
        res.status(400).json({ message: 'Error al procesar la solicitud de eliminación.', error: error.message });
    }
});


// Exportamos el router para que server.js pueda usarlo.
module.exports = router;
