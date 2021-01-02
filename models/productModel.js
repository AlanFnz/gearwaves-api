/* eslint-disable no-console */
const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A product must have a name'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A product name must have less or equal than 40 characters',
      ],
      minlength: [
        10,
        'A product name must have more or equal than 10 characters',
      ],
    },
    slug: String,
    warrantly: {
      type: Number,
      required: [true, 'A product must have a warrantly'],
    },
    stock: {
      type: Number,
      required: [true, 'A product must have a stock number'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A product must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // This only points to current doc on NEW document creation, it doesn't work on updates.
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A product must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A product must have a cover image'],
    },
    imageLeft: {
      type: String,
      required: [
        true,
        'A product must have a cover image and three product images',
      ],
    },
    imageCenter: {
      type: String,
      required: [
        true,
        'A product must have a cover image and three product images',
      ],
    },
    imageRight: {
      type: String,
      required: [
        true,
        'A product must have a cover image and three product images',
      ],
    },
    madeIn: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        name: String,
        description: String,
      },
    ],
    experts: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ slug: 1 });
productSchema.index({ madeIn: '2dsphere' });

// Virtual populate
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

// Document middlewares
productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Query middlewares
// productSchema.pre('find', function (next) {
productSchema.pre(/^find/, function (next) {
  this.find({ secretProduct: { $ne: true } });
  this.start = Date.now();
  next();
});

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'experts',
    select: '-__v -passwordChangedAt',
  });

  next();
});

productSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} ms`);
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
