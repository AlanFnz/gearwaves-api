/* eslint-disable no-console */
const multer = require('multer');
const sharp = require('sharp');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// Multer
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Middlewares

exports.uploadProductImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'imageLeft', maxCount: 1 },
  { name: 'imageCenter', maxCount: 1 },
  { name: 'imageRight', maxCount: 1 },
]);

exports.resizeImageCover = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.imageCover) return next();

  req.body.imageCover = `product-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/products/${req.body.imageCover}`);

  next();
});

exports.resizeImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  const imagesIndex = ['imageCover', 'imageLeft', 'imageCenter', 'imageRight'];
  try {
    await Promise.all(
      imagesIndex.map(async (index, i) => {
        if (typeof req.files[index] !== 'undefined') {
          req.body[index] = `product-${req.params.id}-${Date.now()}-${
            index === 'imageCover' ? 'cover' : i + 0
          }.jpeg`;
          await sharp(req.files[index][0].buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 60 })
            .toFile(`public/img/products/${req.body[index]}`);
        }
      })
    );
  } catch (err) {
    console.log(err);
  }
  next();
});

exports.aliasTopProducts = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary';
  next();
};

exports.viewProduct = catchAsync(async (req, res, next) => {
  // Geting the data, for the requested product. Populate reviews
  const product = await Product.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!product) {
    return next(new AppError('There is no product with that name.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: product,
    },
  });
});

exports.getAllProducts = factory.getAll(Product);
exports.getProduct = factory.getOne(Product, { path: 'reviews' });
exports.createProduct = factory.createOne(Product);
exports.updateProduct = factory.updateOne(Product);
exports.deleteProduct = factory.deleteOne(Product);

exports.getProductStats = catchAsync(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$createdAt' },
        numProducts: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

// api/v1/products/products-within/400/center/34.111745,-118.113491/unit/mi
exports.getProductsWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  const products = await Product.find({
    madeIn: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      data: products,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Product.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
