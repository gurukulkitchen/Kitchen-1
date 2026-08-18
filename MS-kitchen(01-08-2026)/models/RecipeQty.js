import mongoose from 'mongoose';

const RecipeQtySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a recipe name'],
        trim: true
    },
    details: {
        type: String,
        default: '',
        trim: true
    },
    youtubeLink: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        default: '',
        trim: true
    },
    baseQuantity: {
        type: Number,
        default: 1
    },
    baseUnit: {
        type: String,
        default: 'Servings'
    },
    basePeople: {
        type: Map,
        of: Number,
        default: {}
    },
    ingredients: [{
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            default: 0
        },
        unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
        rate: {
            type: Number,
            default: 0
        }
    }],
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { timestamps: true });

// Compound index for uniqueness per company
RecipeQtySchema.index({ name: 1, companyId: 1 }, { unique: true });

if (mongoose.models.RecipeQty) {
    delete mongoose.models.RecipeQty;
}

export default mongoose.model('RecipeQty', RecipeQtySchema);
