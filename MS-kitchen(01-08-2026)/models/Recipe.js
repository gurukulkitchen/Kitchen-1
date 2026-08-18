import mongoose from 'mongoose';

const RecipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a recipe name'],
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    youtubeLink: {
        type: String,
        trim: true
    },
    ingredients: [{
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'KitchenItem',
            required: true
        },
        name: String, // Cached name for display
        unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' }, // Reference to Unit model
        qtd: {
            students: { type: Number, default: 0 },
            haribhakts: { type: Number, default: 0 },
            vvip: { type: Number, default: 0 },
            others: { type: Number, default: 0 }
        }
    }],
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { timestamps: true });

// Compound index to ensure unique recipe names per company
RecipeSchema.index({ name: 1, companyId: 1 }, { unique: true });

// Export Recipe model
// Force delete model to ensure schema updates are applied in dev mode
if (mongoose.models.Recipe) {
    delete mongoose.models.Recipe;
}

export default mongoose.model('Recipe', RecipeSchema);
