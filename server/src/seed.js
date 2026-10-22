// Seeds an admin account plus sample locations and destination templates.
// Usage: npm run seed            (keeps existing data, upserts admin)
//        npm run seed -- --reset (clears locations & templates first)
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Location from './models/Location.js';
import Template from './models/Template.js';

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=60`;

const LOCATIONS = [
  {
    name: 'Kyoto', city: 'Kyoto', country: 'Japan', category: 'heritage', bestTimeToVisit: 'Mar – May, Oct – Nov',
    description: 'Former imperial capital with thousands of temples, shrines and traditional wooden machiya houses.',
    imageUrl: img('photo-1493976040374-85c8e12f0c0e'),
  },
  {
    name: 'Paris', city: 'Paris', country: 'France', category: 'city', bestTimeToVisit: 'Apr – Jun, Sep – Oct',
    description: 'The City of Light — world-class museums, cafés, and walks along the Seine.',
    imageUrl: img('photo-1502602898657-3e91760cbb34'),
  },
  {
    name: 'Bali', city: 'Ubud', country: 'Indonesia', category: 'beach', bestTimeToVisit: 'Apr – Oct',
    description: 'Rice terraces, surf beaches and a vibrant arts and wellness scene.',
    imageUrl: img('photo-1537996194471-e657df975ab4'),
  },
  {
    name: 'Munnar', city: 'Munnar', country: 'India', category: 'mountain', bestTimeToVisit: 'Sep – Mar',
    description: 'Misty hill station in Kerala famous for rolling tea estates and cool mountain air.',
    imageUrl: img('photo-1609920658906-8223bd289001'),
  },
];

const a = (time, title, place, category = 'sightseeing') => ({ time, title, place, category });

const TEMPLATES = [
  {
    location: 'Kyoto', title: '3 Days of Temples & Tea in Kyoto', durationDays: 3, tags: ['culture', 'food', 'walking'],
    summary: 'Classic first-timer route: shrines at dawn, Zen gardens, geisha district evenings and a tea ceremony.',
    days: [
      { dayNumber: 1, title: 'Southern Higashiyama', activities: [a('07:00', 'Fushimi Inari torii gates', 'Fushimi'), a('12:30', 'Lunch at Nishiki Market', 'Nakagyo', 'food'), a('15:00', 'Kiyomizu-dera', 'Higashiyama'), a('18:30', 'Evening stroll in Gion', 'Gion')] },
      { dayNumber: 2, title: 'Arashiyama & the West', activities: [a('08:00', 'Bamboo grove', 'Arashiyama'), a('10:00', 'Tenryu-ji Zen garden', 'Arashiyama'), a('14:00', 'Kinkaku-ji (Golden Pavilion)', 'Kita'), a('16:00', 'Ryoan-ji rock garden', 'Ukyo')] },
      { dayNumber: 3, title: 'Slow day', activities: [a('09:30', 'Philosopher\'s Path walk', 'Sakyo'), a('11:00', 'Tea ceremony', 'Ginkaku-ji area', 'activity'), a('19:00', 'Kaiseki dinner', 'Pontocho', 'food')] },
    ],
  },
  {
    location: 'Paris', title: 'Paris Weekend Essentials', durationDays: 2, tags: ['art', 'romance', 'city-break'],
    summary: 'Two packed days covering the icons, the Louvre, and Montmartre at sunset.',
    days: [
      { dayNumber: 1, title: 'Icons along the Seine', activities: [a('09:00', 'Louvre Museum', '1st arr.'), a('13:00', 'Picnic in Tuileries', 'Tuileries', 'food'), a('15:30', 'Notre-Dame & Île de la Cité', '4th arr.'), a('20:00', 'Eiffel Tower at night', '7th arr.')] },
      { dayNumber: 2, title: 'Left Bank & Montmartre', activities: [a('09:30', 'Musée d\'Orsay', '7th arr.'), a('12:30', 'Café lunch in Saint-Germain', '6th arr.', 'food'), a('17:00', 'Sacré-Cœur sunset', 'Montmartre')] },
    ],
  },
  {
    location: 'Munnar', title: 'Munnar Tea Country Escape', durationDays: 3, tags: ['nature', 'hiking', 'relax'],
    summary: 'Tea plantations, a national park visit and waterfall hikes in the Western Ghats.',
    days: [
      { dayNumber: 1, title: 'Arrive & tea trails', activities: [a('14:00', 'Check in to estate bungalow', 'Munnar', 'stay'), a('16:00', 'Tea Museum (KDHP)', 'Nallathanni')] },
      { dayNumber: 2, title: 'Wildlife & views', activities: [a('07:30', 'Eravikulam National Park (Nilgiri tahr)', 'Rajamalai', 'activity'), a('13:00', 'Kerala meals lunch', 'Munnar town', 'food'), a('16:00', 'Mattupetty Dam & Echo Point', 'Mattupetty')] },
      { dayNumber: 3, title: 'Waterfalls', activities: [a('08:00', 'Attukal waterfall hike', 'Attukal', 'activity'), a('12:00', 'Spice garden visit', 'Pallivasal')] },
    ],
  },
];

async function run() {
  await connectDB(process.env.MONGO_URI);

  const email = (process.env.ADMIN_EMAIL || 'admin@travel.test').toLowerCase();
  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({ name: 'Admin', email, password: process.env.ADMIN_PASSWORD || 'admin123', role: 'admin' });
    console.log(`Created admin ${email}`);
  } else if (admin.role !== 'admin') {
    admin.role = 'admin';
    await admin.save();
    console.log(`Promoted ${email} to admin`);
  }

  if (process.argv.includes('--reset')) {
    await Promise.all([Template.deleteMany({}), Location.deleteMany({})]);
    console.log('Cleared locations and templates');
  }

  const byName = {};
  for (const loc of LOCATIONS) {
    byName[loc.name] = await Location.findOneAndUpdate(
      { name: loc.name, country: loc.country },
      { ...loc, createdBy: admin._id },
      { upsert: true, new: true }
    );
  }
  for (const tpl of TEMPLATES) {
    await Template.findOneAndUpdate(
      { title: tpl.title },
      { ...tpl, location: byName[tpl.location]._id, createdBy: admin._id, isPublished: true },
      { upsert: true, new: true }
    );
  }
  console.log(`Seeded ${LOCATIONS.length} locations and ${TEMPLATES.length} templates`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
