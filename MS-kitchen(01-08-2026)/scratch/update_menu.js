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

async function updateMenu() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to DB");
    
    // Find and update 'Stock Data' to 'Inventory'
    const result = await Menu.updateOne({ label: "Stock Data" }, { $set: { label: "Inventory" } });
    console.log("Updated main menu result:", result);
    
    process.exit(0);
}

updateMenu().catch(err => {
    console.error(err);
    process.exit(1);
});
