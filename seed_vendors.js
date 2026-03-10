import { createVendor } from './services/api';

const SEED_VENDORS = [
    { name: "John Smith", company: "Swift Plumbers", phone: "555-0101", email: "john@swift.com", serviceArea: "North Region" },
    { name: "Sarah Miller", company: "Leak Finders", phone: "555-0102", email: "sarah@leakfinders.com", serviceArea: "South Region" },
    { name: "Mike Ross", company: "Premium Pipes", phone: "555-0103", email: "mike@pipes.com", serviceArea: "Central City" }
];

async function seed() {
    console.log("Seeding vendors...");
    for (const v of SEED_VENDORS) {
        try {
            await createVendor(v);
            console.log(`Seeded: ${v.name}`);
        } catch (e) {
            console.error(`Failed: ${v.name}`);
        }
    }
}

seed();
