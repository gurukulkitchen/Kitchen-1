import mongoose from 'mongoose';

const SubMenuSchema = new mongoose.Schema({
    label: { type: String, required: true },
    route: { type: String, default: '#' },
    icon: { type: String, default: 'Circle' },
    iconClassName: { type: String, default: '' },
    order: { type: Number, default: 0 }
});

const MenuSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
    },
    route: {
        type: String,
        default: '#',
    },
    icon: {
        type: String,
        default: 'Circle',
    },
    iconClassName: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        enum: ['link', 'parent'],
        default: 'link',
    },
    children: [SubMenuSchema],
    order: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

if (mongoose.models.Menu) {
    delete mongoose.models.Menu;
}

export default mongoose.models.Menu || mongoose.model('Menu', MenuSchema);
