const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://10.27.1.115:27017/gurukul";

const SubMenuSchema = new mongoose.Schema({
    label: { type: String, required: true },
    route: { type: String, default: '#' },
    icon: { type: String, default: 'Circle' },
    iconClassName: { type: String, default: '' },
    order: { type: Number, default: 0 }
});

const MenuSchema = new mongoose.Schema({
    label: { type: String, required: true },
    route: { type: String, default: '#' },
    icon: { type: String, default: 'Circle' },
    iconClassName: { type: String, default: '' },
    type: { type: String, enum: ['link', 'parent'], default: 'link' },
    children: [SubMenuSchema],
    order: { type: Number, default: 0 }
});

const Menu = mongoose.models.Menu || mongoose.model('Menu', MenuSchema);

async function printMenus() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to DB");
    const menus = await Menu.find({}).sort({ order: 1 });
    console.log(JSON.stringify(menus, null, 2));
    process.exit(0);
}

printMenus().catch(err => {
    console.error(err);
    process.exit(1);
});
