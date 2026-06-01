'use client';

import { useState, useMemo } from 'react';
import { X, Search, Check } from 'lucide-react';
import {
  FaTshirt, FaShoePrints, FaGlasses, FaHatCowboy,
  FaUtensils, FaCoffee, FaAppleAlt, FaPizzaSlice, FaHamburger,
  FaWineGlassAlt, FaBeer, FaIceCream, FaFish, FaCarrot,
  FaPlane, FaCar, FaTrain, FaShip, FaHotel, FaMapMarkerAlt,
  FaCompass, FaUmbrellaBeach, FaMountain, FaGlobeAmericas,
  FaRunning, FaBiking, FaDumbbell, FaFutbol, FaBasketballBall,
  FaSwimmer, FaFootballBall, FaTableTennis, FaGolfBall, FaSkiing,
  FaLaptop, FaMobileAlt, FaCamera, FaGamepad, FaHeadphones,
  FaRobot, FaMicrochip, FaDesktop, FaKeyboard, FaPrint,
  FaSpa, FaHeart, FaCut, FaHands, FaKissWinkHeart,
  FaHome, FaCouch, FaTree, FaLeaf, FaBed, FaBath, FaTools,
  FaBriefcase, FaBuilding, FaChartBar, FaStore, FaMoneyBillWave,
  FaHandshake, FaChartLine, FaCoins, FaCreditCard, FaPiggyBank,
  FaBook, FaGraduationCap, FaChalkboard, FaAtom, FaFlask, FaMicroscope,
  FaHeartbeat, FaMedkit, FaStethoscope, FaPills, FaHospital, FaWeight,
  FaDumbbell as FaFitness, FaAmbulance,
  FaMusic, FaFilm, FaPaintBrush, FaTheaterMasks, FaPalette, FaGuitar,
  FaShoppingCart, FaShoppingBag, FaTag, FaGift, FaBarcode,
  FaSun, FaSnowflake, FaCloud, FaFire, FaWater, FaLeaf as FaNature,
  FaDog, FaCat, FaPaw, FaKiwiBird, FaHorse,
  FaMosque, FaPrayingHands, FaStarAndCrescent,
  FaFlag, FaStar, FaRocket, FaBolt, FaGem,
  FaSmile, FaUsers, FaChild, FaBabyCarriage,
  FaSeedling, FaBowlingBall, FaVolleyballBall, FaBaseballBall,
  FaIceCream as FaDessert, FaBreadSlice, FaCheese, FaEgg,
  FaMapMarked, FaPassport, FaLandmark, FaCity,
  FaWifi, FaBluetooth, FaServer, FaDatabase,
  FaRecycle, FaSolarPanel, FaWind,
  FaHandHoldingHeart, FaDonate, FaHandsHelping,
  FaPaintRoller, FaDraftingCompass, FaRuler, FaWrench,
  FaTruck, FaMotorcycle, FaBus, FaSubway, FaHelicopter,
  FaUmbrella, FaBinoculars, FaCampground, FaFlagCheckered,
  FaHatWizard, FaMask, FaTrophy, FaMedal, FaAward,
  FaChessKing, FaDice, FaSpinner, FaPuzzlePiece,
  FaLanguage, FaGlobeAsia, FaGlobeEurope, FaGlobeAfrica,
} from 'react-icons/fa';

import {
  MdRestaurant, MdLocalCafe, MdFastfood, MdOutdoorGrill,
  MdSportsBasketball, MdSportsSoccer, MdSportsTennis, MdSportsGolf,
  MdSportsEsports, MdSportsMartialArts, MdDirectionsBike,
  MdBusiness, MdWork, MdStorefront, MdShoppingCart,
  MdSchool, MdScience, MdComputer, MdSmartphone,
  MdHome, MdHotel, MdApartment, MdLocationCity,
  MdFlight, MdDirectionsCar, MdTrain, MdDirectionsBoat,
  MdHealthAndSafety, MdLocalHospital, MdFitnessCenter,
  MdMusicNote, MdMovie, MdPhotoCamera, MdBrush,
  MdPets, MdNature, MdPark, MdTerrain,
  MdAccountBalance, MdAttachMoney, MdCreditCard, MdSavings,
  MdChildCare, MdFamilyRestroom, MdElderly, MdPerson,
  MdStar, MdFavorite, MdThumbUp, MdPublic,
  MdRecycling, MdEnergySavingsLeaf, MdWater, MdWbSunny,
  MdVolunteerActivism, MdHandshake,
  MdAutoFixHigh, MdDesignServices, MdArchitecture,
  MdLocalFlorist, MdGrass, MdYard, MdForest,
  MdDiamond, MdWatch, MdShoppingBag, MdStyle,
} from 'react-icons/md';

export interface SelectedIcon {
  name: string;
  svg: string;
}

interface IconEntry {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  tags: string[];
}

const ICON_LIBRARY: IconEntry[] = [
  // Fashion & Style
  { name: 'Shirt', component: FaTshirt, tags: ['fashion', 'clothing', 'apparel', 'shirt', 'tshirt'] },
  { name: 'Shoe', component: FaShoePrints, tags: ['fashion', 'shoes', 'footwear'] },
  { name: 'Glasses', component: FaGlasses, tags: ['fashion', 'accessories', 'glasses', 'eyewear'] },
  { name: 'Hat', component: FaHatCowboy, tags: ['fashion', 'accessories', 'hat'] },
  { name: 'Gem', component: FaGem, tags: ['fashion', 'jewelry', 'luxury', 'diamond'] },
  { name: 'Diamond', component: MdDiamond, tags: ['fashion', 'jewelry', 'luxury', 'gem'] },
  { name: 'Watch', component: MdWatch, tags: ['fashion', 'accessories', 'watch', 'time'] },
  { name: 'Style', component: MdStyle, tags: ['fashion', 'style', 'clothing'] },
  { name: 'Bags', component: MdShoppingBag, tags: ['fashion', 'bags', 'accessories'] },

  // Food & Drink
  { name: 'Utensils', component: FaUtensils, tags: ['food', 'restaurant', 'eat', 'dining'] },
  { name: 'Coffee', component: FaCoffee, tags: ['food', 'drink', 'coffee', 'cafe', 'beverage'] },
  { name: 'Apple', component: FaAppleAlt, tags: ['food', 'fruit', 'healthy', 'organic'] },
  { name: 'Pizza', component: FaPizzaSlice, tags: ['food', 'pizza', 'fast food'] },
  { name: 'Burger', component: FaHamburger, tags: ['food', 'burger', 'fast food'] },
  { name: 'Wine', component: FaWineGlassAlt, tags: ['food', 'drink', 'wine', 'alcohol', 'beverage'] },
  { name: 'Beer', component: FaBeer, tags: ['food', 'drink', 'beer', 'alcohol', 'beverage'] },
  { name: 'Ice Cream', component: FaIceCream, tags: ['food', 'dessert', 'ice cream', 'sweet'] },
  { name: 'Fish', component: FaFish, tags: ['food', 'seafood', 'fish'] },
  { name: 'Carrot', component: FaCarrot, tags: ['food', 'vegetable', 'healthy', 'organic'] },
  { name: 'Bread', component: FaBreadSlice, tags: ['food', 'bread', 'bakery'] },
  { name: 'Cheese', component: FaCheese, tags: ['food', 'cheese', 'dairy'] },
  { name: 'Egg', component: FaEgg, tags: ['food', 'egg', 'breakfast', 'protein'] },
  { name: 'Restaurant', component: MdRestaurant, tags: ['food', 'restaurant', 'dining'] },
  { name: 'Cafe', component: MdLocalCafe, tags: ['food', 'drink', 'coffee', 'cafe'] },
  { name: 'Fast Food', component: MdFastfood, tags: ['food', 'fast food', 'burger'] },
  { name: 'BBQ', component: MdOutdoorGrill, tags: ['food', 'bbq', 'grill', 'outdoor'] },

  // Travel & Transport
  { name: 'Plane', component: FaPlane, tags: ['travel', 'flight', 'air', 'transport'] },
  { name: 'Car', component: FaCar, tags: ['travel', 'car', 'drive', 'transport', 'auto'] },
  { name: 'Train', component: FaTrain, tags: ['travel', 'train', 'rail', 'transport'] },
  { name: 'Ship', component: FaShip, tags: ['travel', 'sea', 'cruise', 'transport', 'boat'] },
  { name: 'Hotel', component: FaHotel, tags: ['travel', 'hotel', 'accommodation', 'stay'] },
  { name: 'Map Pin', component: FaMapMarkerAlt, tags: ['travel', 'location', 'map', 'pin'] },
  { name: 'Compass', component: FaCompass, tags: ['travel', 'compass', 'navigation', 'explore'] },
  { name: 'Beach', component: FaUmbrellaBeach, tags: ['travel', 'beach', 'summer', 'vacation'] },
  { name: 'Mountain', component: FaMountain, tags: ['travel', 'mountain', 'hiking', 'nature'] },
  { name: 'Globe', component: FaGlobeAmericas, tags: ['travel', 'world', 'global', 'international'] },
  { name: 'Passport', component: FaPassport, tags: ['travel', 'passport', 'document', 'international'] },
  { name: 'Map', component: FaMapMarked, tags: ['travel', 'map', 'location', 'navigation'] },
  { name: 'Landmark', component: FaLandmark, tags: ['travel', 'landmark', 'tourism', 'monument'] },
  { name: 'City', component: FaCity, tags: ['travel', 'city', 'urban', 'tourism'] },
  { name: 'Truck', component: FaTruck, tags: ['travel', 'truck', 'delivery', 'transport', 'logistics'] },
  { name: 'Motorcycle', component: FaMotorcycle, tags: ['travel', 'motorcycle', 'bike', 'transport'] },
  { name: 'Bus', component: FaBus, tags: ['travel', 'bus', 'public transport'] },
  { name: 'Helicopter', component: FaHelicopter, tags: ['travel', 'helicopter', 'air', 'transport'] },
  { name: 'Flight', component: MdFlight, tags: ['travel', 'flight', 'air', 'transport'] },

  // Sports & Fitness
  { name: 'Running', component: FaRunning, tags: ['sports', 'fitness', 'running', 'exercise'] },
  { name: 'Cycling', component: FaBiking, tags: ['sports', 'fitness', 'cycling', 'bike'] },
  { name: 'Dumbbell', component: FaDumbbell, tags: ['sports', 'fitness', 'gym', 'workout', 'training'] },
  { name: 'Soccer', component: FaFutbol, tags: ['sports', 'football', 'soccer'] },
  { name: 'Basketball', component: FaBasketballBall, tags: ['sports', 'basketball'] },
  { name: 'Swimming', component: FaSwimmer, tags: ['sports', 'swimming', 'water', 'fitness'] },
  { name: 'American Football', component: FaFootballBall, tags: ['sports', 'american football'] },
  { name: 'Table Tennis', component: FaTableTennis, tags: ['sports', 'ping pong', 'table tennis'] },
  { name: 'Golf', component: FaGolfBall, tags: ['sports', 'golf'] },
  { name: 'Skiing', component: FaSkiing, tags: ['sports', 'skiing', 'winter', 'snow'] },
  { name: 'Volleyball', component: FaVolleyballBall, tags: ['sports', 'volleyball'] },
  { name: 'Baseball', component: FaBaseballBall, tags: ['sports', 'baseball'] },
  { name: 'Bowling', component: FaBowlingBall, tags: ['sports', 'bowling'] },
  { name: 'Fitness', component: MdFitnessCenter, tags: ['sports', 'fitness', 'gym', 'workout'] },
  { name: 'Esports', component: MdSportsEsports, tags: ['sports', 'gaming', 'esports', 'video games'] },
  { name: 'Martial Arts', component: MdSportsMartialArts, tags: ['sports', 'martial arts', 'combat', 'fighting'] },
  { name: 'Trophy', component: FaTrophy, tags: ['sports', 'trophy', 'winner', 'achievement'] },
  { name: 'Medal', component: FaMedal, tags: ['sports', 'medal', 'achievement', 'award'] },

  // Technology
  { name: 'Laptop', component: FaLaptop, tags: ['tech', 'computer', 'laptop', 'technology'] },
  { name: 'Mobile', component: FaMobileAlt, tags: ['tech', 'mobile', 'phone', 'smartphone', 'technology'] },
  { name: 'Camera', component: FaCamera, tags: ['tech', 'photography', 'camera', 'photo'] },
  { name: 'Gamepad', component: FaGamepad, tags: ['tech', 'gaming', 'games', 'controller'] },
  { name: 'Headphones', component: FaHeadphones, tags: ['tech', 'audio', 'headphones', 'music', 'sound'] },
  { name: 'Robot', component: FaRobot, tags: ['tech', 'ai', 'robot', 'automation', 'artificial intelligence'] },
  { name: 'Microchip', component: FaMicrochip, tags: ['tech', 'chip', 'hardware', 'processor'] },
  { name: 'Desktop', component: FaDesktop, tags: ['tech', 'computer', 'desktop', 'screen'] },
  { name: 'Keyboard', component: FaKeyboard, tags: ['tech', 'keyboard', 'typing', 'input'] },
  { name: 'Printer', component: FaPrint, tags: ['tech', 'printer', 'print', 'office'] },
  { name: 'WiFi', component: FaWifi, tags: ['tech', 'wifi', 'internet', 'wireless', 'network'] },
  { name: 'Server', component: FaServer, tags: ['tech', 'server', 'database', 'cloud', 'hosting'] },
  { name: 'Database', component: FaDatabase, tags: ['tech', 'database', 'data', 'storage'] },
  { name: 'Smartphone', component: MdSmartphone, tags: ['tech', 'mobile', 'smartphone', 'phone'] },
  { name: 'Computer', component: MdComputer, tags: ['tech', 'computer', 'pc', 'desktop'] },
  { name: 'Photo Camera', component: MdPhotoCamera, tags: ['tech', 'photography', 'camera', 'photo'] },

  // Beauty & Wellness
  { name: 'Spa', component: FaSpa, tags: ['beauty', 'spa', 'wellness', 'relax', 'massage'] },
  { name: 'Heart', component: FaHeart, tags: ['beauty', 'love', 'health', 'wellness', 'care'] },
  { name: 'Haircut', component: FaCut, tags: ['beauty', 'haircut', 'salon', 'grooming', 'cut'] },
  { name: 'Hands', component: FaHands, tags: ['beauty', 'care', 'hands', 'massage', 'wellness'] },
  { name: 'Flower', component: MdLocalFlorist, tags: ['beauty', 'flower', 'floral', 'garden', 'nature'] },

  // Home & Living
  { name: 'Home', component: FaHome, tags: ['home', 'house', 'real estate', 'living'] },
  { name: 'Couch', component: FaCouch, tags: ['home', 'furniture', 'couch', 'sofa', 'living room'] },
  { name: 'Tree', component: FaTree, tags: ['home', 'garden', 'nature', 'tree', 'outdoor'] },
  { name: 'Leaf', component: FaLeaf, tags: ['home', 'garden', 'nature', 'plant', 'organic', 'eco'] },
  { name: 'Bed', component: FaBed, tags: ['home', 'bedroom', 'sleep', 'furniture'] },
  { name: 'Bath', component: FaBath, tags: ['home', 'bathroom', 'bath', 'hygiene'] },
  { name: 'Tools', component: FaTools, tags: ['home', 'tools', 'repair', 'fix', 'diy', 'maintenance'] },
  { name: 'Paint Roller', component: FaPaintRoller, tags: ['home', 'paint', 'renovation', 'diy', 'interior'] },
  { name: 'Ruler', component: FaRuler, tags: ['home', 'design', 'architecture', 'measurement'] },
  { name: 'Wrench', component: FaWrench, tags: ['home', 'tools', 'repair', 'fix', 'maintenance'] },
  { name: 'Apartment', component: MdApartment, tags: ['home', 'apartment', 'real estate', 'living'] },
  { name: 'Hotel Building', component: MdHotel, tags: ['home', 'hotel', 'accommodation', 'stay'] },
  { name: 'Grass', component: MdGrass, tags: ['home', 'garden', 'grass', 'lawn', 'outdoor'] },
  { name: 'Yard', component: MdYard, tags: ['home', 'garden', 'yard', 'outdoor'] },

  // Business & Finance
  { name: 'Briefcase', component: FaBriefcase, tags: ['business', 'work', 'office', 'professional'] },
  { name: 'Building', component: FaBuilding, tags: ['business', 'office', 'corporate', 'company'] },
  { name: 'Bar Chart', component: FaChartBar, tags: ['business', 'analytics', 'data', 'statistics', 'finance'] },
  { name: 'Store', component: FaStore, tags: ['business', 'store', 'shop', 'retail', 'ecommerce'] },
  { name: 'Money', component: FaMoneyBillWave, tags: ['business', 'finance', 'money', 'cash', 'payment'] },
  { name: 'Handshake', component: FaHandshake, tags: ['business', 'partnership', 'deal', 'agreement'] },
  { name: 'Line Chart', component: FaChartLine, tags: ['business', 'finance', 'stock', 'analytics', 'growth'] },
  { name: 'Coins', component: FaCoins, tags: ['business', 'finance', 'money', 'coins', 'currency'] },
  { name: 'Credit Card', component: FaCreditCard, tags: ['business', 'finance', 'payment', 'card', 'banking'] },
  { name: 'Piggy Bank', component: FaPiggyBank, tags: ['business', 'finance', 'saving', 'bank', 'savings'] },
  { name: 'Bank', component: MdAccountBalance, tags: ['business', 'finance', 'bank', 'institution', 'banking'] },
  { name: 'Savings', component: MdSavings, tags: ['business', 'finance', 'savings', 'investment'] },
  { name: 'Storefront', component: MdStorefront, tags: ['business', 'store', 'retail', 'shop'] },

  // Education & Science
  { name: 'Book', component: FaBook, tags: ['education', 'learning', 'book', 'reading', 'library'] },
  { name: 'Graduation', component: FaGraduationCap, tags: ['education', 'graduation', 'school', 'university', 'degree'] },
  { name: 'Chalkboard', component: FaChalkboard, tags: ['education', 'school', 'teaching', 'classroom', 'learning'] },
  { name: 'Atom', component: FaAtom, tags: ['education', 'science', 'physics', 'chemistry', 'research'] },
  { name: 'Flask', component: FaFlask, tags: ['education', 'science', 'chemistry', 'experiment', 'laboratory'] },
  { name: 'Microscope', component: FaMicroscope, tags: ['education', 'science', 'research', 'biology', 'laboratory'] },
  { name: 'School', component: MdSchool, tags: ['education', 'school', 'university', 'learning'] },
  { name: 'Science', component: MdScience, tags: ['education', 'science', 'research', 'experiment'] },
  { name: 'Puzzle', component: FaPuzzlePiece, tags: ['education', 'puzzle', 'games', 'problem solving', 'kids'] },
  { name: 'Language', component: FaLanguage, tags: ['education', 'language', 'communication', 'linguistics'] },
  { name: 'Drawing', component: FaDraftingCompass, tags: ['education', 'drawing', 'design', 'engineering', 'architecture'] },

  // Health & Medical
  { name: 'Heartbeat', component: FaHeartbeat, tags: ['health', 'medical', 'heart', 'pulse', 'cardio'] },
  { name: 'First Aid', component: FaMedkit, tags: ['health', 'medical', 'first aid', 'emergency', 'kit'] },
  { name: 'Stethoscope', component: FaStethoscope, tags: ['health', 'medical', 'doctor', 'stethoscope'] },
  { name: 'Pills', component: FaPills, tags: ['health', 'medical', 'medicine', 'pharmacy', 'pills', 'drugs'] },
  { name: 'Hospital', component: FaHospital, tags: ['health', 'medical', 'hospital', 'clinic'] },
  { name: 'Weight', component: FaWeight, tags: ['health', 'fitness', 'weight', 'diet', 'health'] },
  { name: 'Ambulance', component: FaAmbulance, tags: ['health', 'medical', 'emergency', 'ambulance'] },
  { name: 'Health Safety', component: MdHealthAndSafety, tags: ['health', 'safety', 'medical', 'protection'] },
  { name: 'Local Hospital', component: MdLocalHospital, tags: ['health', 'hospital', 'medical', 'clinic'] },

  // Arts & Entertainment
  { name: 'Music', component: FaMusic, tags: ['arts', 'music', 'entertainment', 'audio', 'song'] },
  { name: 'Film', component: FaFilm, tags: ['arts', 'film', 'movie', 'cinema', 'entertainment'] },
  { name: 'Paintbrush', component: FaPaintBrush, tags: ['arts', 'art', 'painting', 'creative', 'design'] },
  { name: 'Theater', component: FaTheaterMasks, tags: ['arts', 'theater', 'drama', 'performance'] },
  { name: 'Palette', component: FaPalette, tags: ['arts', 'art', 'color', 'creative', 'design', 'painting'] },
  { name: 'Guitar', component: FaGuitar, tags: ['arts', 'music', 'guitar', 'instrument', 'entertainment'] },
  { name: 'Music Note', component: MdMusicNote, tags: ['arts', 'music', 'entertainment', 'audio', 'melody'] },
  { name: 'Movie', component: MdMovie, tags: ['arts', 'film', 'movie', 'cinema', 'entertainment'] },
  { name: 'Brush', component: MdBrush, tags: ['arts', 'design', 'art', 'creative', 'painting'] },
  { name: 'Design Services', component: MdDesignServices, tags: ['arts', 'design', 'creative', 'graphic design'] },
  { name: 'Magic', component: MdAutoFixHigh, tags: ['arts', 'magic', 'creative', 'effects', 'entertainment'] },
  { name: 'Architecture', component: MdArchitecture, tags: ['arts', 'architecture', 'design', 'building'] },
  { name: 'Chess', component: FaChessKing, tags: ['arts', 'chess', 'strategy', 'game', 'intelligence'] },
  { name: 'Dice', component: FaDice, tags: ['arts', 'games', 'dice', 'gambling', 'entertainment'] },
  { name: 'Wizard', component: FaHatWizard, tags: ['arts', 'fantasy', 'magic', 'halloween', 'entertainment'] },
  { name: 'Mask', component: FaMask, tags: ['arts', 'mask', 'theater', 'halloween', 'costume'] },

  // Shopping & Commerce
  { name: 'Shopping Cart', component: FaShoppingCart, tags: ['shopping', 'ecommerce', 'cart', 'buy', 'retail'] },
  { name: 'Shopping Bag', component: FaShoppingBag, tags: ['shopping', 'ecommerce', 'bag', 'buy', 'retail'] },
  { name: 'Tag', component: FaTag, tags: ['shopping', 'price', 'tag', 'sale', 'discount'] },
  { name: 'Gift', component: FaGift, tags: ['shopping', 'gift', 'present', 'birthday', 'celebration'] },
  { name: 'Barcode', component: FaBarcode, tags: ['shopping', 'barcode', 'product', 'scan', 'retail'] },

  // Nature & Environment
  { name: 'Sun', component: FaSun, tags: ['nature', 'sun', 'solar', 'weather', 'energy'] },
  { name: 'Snowflake', component: FaSnowflake, tags: ['nature', 'snow', 'winter', 'cold', 'weather'] },
  { name: 'Cloud', component: FaCloud, tags: ['nature', 'cloud', 'weather', 'sky', 'rain'] },
  { name: 'Fire', component: FaFire, tags: ['nature', 'fire', 'flame', 'heat', 'energy'] },
  { name: 'Water', component: FaWater, tags: ['nature', 'water', 'ocean', 'sea', 'liquid'] },
  { name: 'Seedling', component: FaSeedling, tags: ['nature', 'plant', 'seedling', 'grow', 'organic', 'eco'] },
  { name: 'Recycling', component: MdRecycling, tags: ['nature', 'environment', 'recycling', 'eco', 'green', 'sustainability'] },
  { name: 'Solar', component: MdEnergySavingsLeaf, tags: ['nature', 'environment', 'solar', 'eco', 'green', 'energy'] },
  { name: 'Forest', component: MdForest, tags: ['nature', 'forest', 'trees', 'woods', 'environment'] },
  { name: 'Park', component: MdPark, tags: ['nature', 'park', 'outdoor', 'green', 'trees'] },
  { name: 'Camping', component: FaCampground, tags: ['nature', 'camping', 'outdoor', 'adventure'] },
  { name: 'Binoculars', component: FaBinoculars, tags: ['nature', 'binoculars', 'wildlife', 'explore', 'observe'] },

  // Pets & Animals
  { name: 'Dog', component: FaDog, tags: ['pets', 'dog', 'animal', 'puppy'] },
  { name: 'Cat', component: FaCat, tags: ['pets', 'cat', 'animal', 'kitten'] },
  { name: 'Paw', component: FaPaw, tags: ['pets', 'animals', 'paw', 'pet', 'veterinary'] },
  { name: 'Bird', component: FaKiwiBird, tags: ['pets', 'bird', 'animal', 'wildlife'] },
  { name: 'Horse', component: FaHorse, tags: ['pets', 'horse', 'animal', 'equine', 'riding'] },
  { name: 'Pets', component: MdPets, tags: ['pets', 'animals', 'care', 'veterinary'] },

  // Community & Social
  { name: 'Users', component: FaUsers, tags: ['community', 'social', 'people', 'group', 'team'] },
  { name: 'Child', component: FaChild, tags: ['community', 'kids', 'children', 'family'] },
  { name: 'Baby', component: FaBabyCarriage, tags: ['community', 'baby', 'parenting', 'family', 'newborn'] },
  { name: 'Smile', component: FaSmile, tags: ['community', 'happy', 'emoji', 'lifestyle', 'social'] },
  { name: 'Volunteer', component: FaHandHoldingHeart, tags: ['community', 'volunteer', 'charity', 'care', 'giving'] },
  { name: 'Donate', component: FaDonate, tags: ['community', 'donation', 'charity', 'giving', 'help'] },
  { name: 'Help', component: FaHandsHelping, tags: ['community', 'help', 'support', 'volunteering', 'solidarity'] },
  { name: 'Child Care', component: MdChildCare, tags: ['community', 'children', 'daycare', 'kids', 'parenting'] },
  { name: 'Family', component: MdFamilyRestroom, tags: ['community', 'family', 'parents', 'kids'] },
  { name: 'Elderly', component: MdElderly, tags: ['community', 'elderly', 'senior', 'old', 'aging'] },

  // Islamic / Religious
  { name: 'Mosque', component: FaMosque, tags: ['religion', 'islamic', 'mosque', 'worship', 'prayer', 'halal'] },
  { name: 'Praying Hands', component: FaPrayingHands, tags: ['religion', 'prayer', 'worship', 'faith', 'islamic', 'spiritual'] },
  { name: 'Star Crescent', component: FaStarAndCrescent, tags: ['religion', 'islamic', 'crescent', 'star', 'symbol', 'halal'] },

  // General / Misc
  { name: 'Star', component: FaStar, tags: ['general', 'star', 'favorite', 'rating', 'featured'] },
  { name: 'Rocket', component: FaRocket, tags: ['general', 'rocket', 'launch', 'startup', 'space', 'tech'] },
  { name: 'Bolt', component: FaBolt, tags: ['general', 'lightning', 'energy', 'power', 'fast', 'electric'] },
  { name: 'Flag', component: FaFlag, tags: ['general', 'flag', 'country', 'nation', 'symbol'] },
  { name: 'Trophy', component: FaTrophy, tags: ['general', 'trophy', 'win', 'achievement', 'success'] },
  { name: 'Globe Americas', component: FaGlobeAmericas, tags: ['general', 'global', 'world', 'international', 'americas'] },
  { name: 'Globe Asia', component: FaGlobeAsia, tags: ['general', 'global', 'world', 'asia', 'international'] },
  { name: 'Globe Europe', component: FaGlobeEurope, tags: ['general', 'global', 'world', 'europe', 'international'] },
  { name: 'Globe Africa', component: FaGlobeAfrica, tags: ['general', 'global', 'world', 'africa', 'international'] },
  { name: 'Award', component: FaAward, tags: ['general', 'award', 'prize', 'recognition', 'achievement'] },
  { name: 'Public', component: MdPublic, tags: ['general', 'public', 'global', 'world', 'open'] },
  { name: 'Favorite', component: MdFavorite, tags: ['general', 'favorite', 'heart', 'love', 'like'] },
  { name: 'Thumb Up', component: MdThumbUp, tags: ['general', 'like', 'approve', 'positive', 'social'] },
  { name: 'Person', component: MdPerson, tags: ['general', 'person', 'user', 'profile', 'account'] },
  { name: 'Check Flag', component: FaFlagCheckered, tags: ['general', 'racing', 'finish', 'winner', 'goal'] },
  { name: 'Umbrella', component: FaUmbrella, tags: ['general', 'umbrella', 'rain', 'protection', 'weather'] },
  { name: 'Location City', component: MdLocationCity, tags: ['general', 'city', 'urban', 'location', 'place'] },
  { name: 'Volunteer', component: MdVolunteerActivism, tags: ['general', 'volunteer', 'charity', 'care', 'giving'] },
  { name: 'Partnership', component: MdHandshake, tags: ['general', 'handshake', 'partnership', 'deal', 'agreement'] },
];

interface IconPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (icon: SelectedIcon) => void;
  currentIcon?: string;
}

export function IconPicker({ isOpen, onClose, onSelect, currentIcon }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SelectedIcon | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return ICON_LIBRARY;
    const q = search.toLowerCase();
    return ICON_LIBRARY.filter(
      (icon) =>
        icon.name.toLowerCase().includes(q) ||
        icon.tags.some((tag) => tag.includes(q))
    );
  }, [search]);

  const handleIconClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    iconName: string
  ) => {
    const btn = e.currentTarget;
    const svgEl = btn.querySelector('svg');
    if (svgEl) {
      const clone = svgEl.cloneNode(true) as SVGElement;
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      // Ensure dimensions are not hardcoded from react-icons
      clone.removeAttribute('width');
      clone.removeAttribute('height');
      clone.setAttribute('viewBox', clone.getAttribute('viewBox') || '0 0 24 24');
      setSelected({ name: iconName, svg: clone.outerHTML });
    }
  };

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      onClose();
      setSelected(null);
      setSearch('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => {
          onClose();
          setSelected(null);
          setSearch('');
        }}
      />
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div
          className="relative dark:bg-[var(--bg-card)] bg-[var(--bg-card)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border-color)]">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Choose Icon</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                {ICON_LIBRARY.length} icons available · search by name or category
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                setSelected(null);
                setSearch('');
              }}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-[var(--border-color)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search icons (e.g. food, travel, fashion…)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Icon Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-[var(--text-secondary)]">
                <Search className="w-10 h-10 mb-3 opacity-40" />
                <p className="font-medium">No icons found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
                {filtered.map((icon, i) => {
                  const isSelected = selected?.name === icon.name;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => handleIconClick(e, icon.name)}
                      title={icon.name}
                      className={`relative flex flex-col items-center justify-center p-2.5 rounded-lg transition-all group ${
                        isSelected
                          ? 'bg-[var(--primary)] text-white shadow-md scale-105'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--primary)] hover:scale-105'
                      }`}
                    >
                      <icon.component size={22} />
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--border-color)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {selected ? (
                <div className="flex items-center gap-2.5 bg-[var(--primary-light)] rounded-lg px-3 py-2">
                  <span
                    className="w-7 h-7 text-[var(--primary)] flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: selected.svg }}
                  />
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Selected</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{selected.name}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">Click an icon to select it</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setSelected(null);
                  setSearch('');
                }}
                className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selected}
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Use Icon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
