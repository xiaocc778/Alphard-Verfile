import React, { useState, useEffect } from 'react';
// 1. 引入路由核心组件
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, Menu, X, ChevronDown, Car, ArrowLeft, Mail, Info, Instagram, Facebook, Globe, Wrench, ShieldCheck, Clock, DollarSign, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

// --- Configuration ---
const LOGO_URL = "https://static.wixstatic.com/media/943eef_77866c00442d480bbe5b61d50c9bb6bb~mv2.jpg/v1/fill/w_387,h_269,al_c,lg_1,q_80,enc_avif,quality_auto/image_edited.jpg";

// --- Mock Data ---
const INITIAL_CARS = [
    // --- Real Stock (From Best Auto) ---
    {
        id: 1,
        title: "2024 Toyota Vellfire Hybrid Z Premier",
        price: 99999,
        mileage: 3200,
        year: 2024,
        fuel: "Hybrid",
        transmission: "CVT",
        engine: "2.5L Hybrid",
        seats: 7,
        color: "Black",
        location: "Homebush",
        status: "In Stock",
        image: "https://images.unsplash.com/photo-1621255562439-d364841d6365?auto=format&fit=crop&q=80&w=1000",
        // 模拟多张图片
        images: [
            "https://images.unsplash.com/photo-1621255562439-d364841d6365?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000"
        ],
        description: "Almost brand new 2024 Toyota Vellfire Hybrid. Experience the pinnacle of luxury with advanced hybrid efficiency.",
        // 新增：配置列表
        features: ["Dual Sunroof", "Nappa Leather Seats", "360 Camera", "Apple CarPlay", "Heated Seats", "Power Tailgate", "Radar Cruise Control", "Lane Keep Assist"]
    },
    {
        id: 2,
        title: "2025 Toyota Voxy S-Z (Brand New)",
        price: 63990,
        mileage: 28,
        year: 2025,
        fuel: "Petrol",
        transmission: "CVT",
        engine: "2.0L",
        seats: 7,
        color: "White",
        location: "Homebush",
        status: "Brand New",
        image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000",
        images: ["https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000"],
        description: "The all-new 2025 Toyota Voxy. A perfect family MPV with spacious interior, aggressive styling, and modern tech.",
        features: ["Dual Power Sliding Doors", "Wireless Charger", "Digital Rear View Mirror", "7 Seats", "Toyota Safety Sense"]
    },
    {
        id: 3,
        title: "2023 Toyota Alphard 2.5L SC",
        price: 69000,
        mileage: 25000,
        year: 2023,
        fuel: "Petrol",
        transmission: "CVT",
        engine: "2.5L",
        seats: 7,
        color: "Pearl White",
        location: "Homebush",
        status: "Best Seller",
        image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=1000",
        images: ["https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=1000"],
        description: "Highly sought-after 30 Series Alphard SC Package. Includes pilot seats, power sliding doors, and power tailgate.",
        features: ["Pilot Seats", "Power Tailgate", "Sunroof", "Alcantara Seats"]
    },
    {
        id: 4,
        title: "2019 BMW X5 xDrive30d M Sport",
        price: 67900,
        mileage: 51000,
        year: 2019,
        fuel: "Diesel",
        transmission: "Automatic",
        engine: "3.0L Turbo Diesel",
        seats: 5,
        color: "Sapphire Black",
        location: "Homebush",
        status: "Premium Used",
        image: "https://images.unsplash.com/photo-1556189250-72ba95452e6d?auto=format&fit=crop&q=80&w=1000",
        images: ["https://images.unsplash.com/photo-1556189250-72ba95452e6d?auto=format&fit=crop&q=80&w=1000"],
        description: "Luxury SUV performance. 2019 BMW X5 with M Sport package. Features panoramic sunroof, heads-up display.",
        features: ["M Sport Package", "Panoramic Sunroof", "Heads-up Display", "20-inch Alloys"]
    },
    {
        id: 5,
        title: "2022 Toyota RAV4 Cruiser Hybrid",
        price: 47900,
        mileage: 25000,
        year: 2022,
        fuel: "Hybrid",
        transmission: "CVT",
        engine: "2.5L Hybrid",
        seats: 5,
        color: "Silver",
        location: "Homebush",
        status: "In Stock",
        image: "https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?auto=format&fit=crop&q=80&w=1000",
        images: ["https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?auto=format&fit=crop&q=80&w=1000"],
        description: "Australia's favorite SUV. The RAV4 Cruiser Hybrid offers incredible fuel economy and reliability.",
        features: ["JBL Sound System", "Leather Interior", "360 Camera", "Hybrid System"]
    },
    {
        id: 6,
        title: "2015 Jaguar XE R-Sport",
        price: 18900,
        mileage: 67000,
        year: 2015,
        fuel: "Petrol",
        transmission: "Automatic",
        engine: "2.0L Turbo",
        seats: 5,
        color: "Red",
        location: "Homebush",
        status: "Clearance",
        image: "https://images.unsplash.com/photo-1539799139339-50c5fe1e2b1b?auto=format&fit=crop&q=80&w=1000",
        images: ["https://images.unsplash.com/photo-1539799139339-50c5fe1e2b1b?auto=format&fit=crop&q=80&w=1000"],
        description: "Sporty elegance at an affordable price. Jaguar XE R-Sport with dynamic handling and distinctive British styling.",
        features: ["R-Sport Body Kit", "Navigation", "Meridian Sound", "Red/Black Leather"]
    },
    // ... 其他车辆数据保持结构一致
];

// --- Utility Components ---
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

// --- Sub-Components ---

const CarCard = ({ car }) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/vehicle/${car.id}`)}
            className="group bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col h-full relative cursor-pointer"
        >
            <div className="relative h-56 overflow-hidden">
                <img src={car.image} alt={car.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-sm">{car.status}</div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-red-700 transition-colors">{car.title}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 font-medium">
                    <span className="flex items-center gap-1"><MapPin size={12} className="text-red-600" /> {car.location || "Sydney"}</span>
                    <span>•</span>
                    <span>{(car.mileage || 0).toLocaleString()} kms</span>
                    <span>•</span>
                    <span>{car.year}</span>
                </div>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                    <div>
                        <p className="text-2xl font-bold text-gray-900">${(car.price || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Excl. Gov. Charges</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <ArrowLeft size={16} className="rotate-180" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const FilterWidget = () => {
    const navigate = useNavigate();
    return (
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-100/50 -mt-20 relative z-20 mx-4 lg:mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {['Make & Model', 'Year Range', 'Price Range'].map((label, idx) => (
                    <div key={idx} className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
                        <div className="relative">
                            <select className="w-full p-3.5 bg-gray-50 border-0 rounded-xl appearance-none focus:ring-2 focus:ring-red-100 text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-colors cursor-pointer">
                                <option>Any {label.split(' ')[0]}</option>
                                <option>Option 1</option>
                            </select>
                            <ChevronDown className="absolute right-3.5 top-3.5 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                ))}
                <div className="flex items-end">
                    <button
                        onClick={() => navigate('/inventory')}
                        className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-red-700/20 flex items-center justify-center gap-2"
                    >
                        Search Inventory
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Pages ---

const HomePage = () => {
    const navigate = useNavigate();
    return (
        <>
            <header className="relative h-[600px] bg-black overflow-hidden">
                <div className="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=2000" alt="Hero" className="w-full h-full object-cover opacity-50 scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                </div>
                <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                    <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">Luxury in Motion</h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl font-light">
                        Sydney's premier destination for Toyota Alphard, Vellfire, and GAC luxury vehicles.
                    </p>
                    <div className="flex gap-4">
                        <button onClick={() => navigate('/inventory')} className="bg-white text-black font-bold py-4 px-10 rounded-full hover:bg-gray-200 transition-colors">
                            Browse Collection
                        </button>
                    </div>
                </div>
            </header>

            <FilterWidget />

            <section className="py-20 container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Brands</h2>
                    <div className="w-16 h-1 bg-red-600 mx-auto rounded-full"></div>
                </div>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* 修改：点击 Toyota 品牌卡片跳转到品牌专区 */}
                    <div onClick={() => navigate('/brands/toyota')} className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-lg">
                        <img src="https://images.unsplash.com/photo-1621255562439-d364841d6365?auto=format&fit=crop&q=80&w=1000" alt="Toyota" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                            <h3 className="text-3xl font-bold text-white border-b-2 border-white/0 group-hover:border-white transition-all pb-1">Toyota Alphard & Vellfire</h3>
                        </div>
                    </div>
                    <div onClick={() => navigate('/gac')} className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-lg bg-gray-900 flex items-center justify-center">
                        <div className="text-center group-hover:scale-105 transition-transform duration-300">
                            <h3 className="text-3xl font-bold text-white mb-2">GAC Motor</h3>
                            <p className="text-gray-400 text-sm">Coming Soon • Enquire Now</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pb-20 container mx-auto px-4">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Inventory</h2>
                        <p className="text-gray-500">Hand-picked quality vehicles available now.</p>
                    </div>
                    <button onClick={() => navigate('/inventory')} className="hidden md:block text-gray-900 font-bold hover:text-red-700 transition-colors">View All Stock &rarr;</button>
                </div>
                {/* Only show top 6 items on Homepage */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {INITIAL_CARS.slice(0, 6).map(car => <CarCard key={car.id} car={car} />)}
                </div>
                <button onClick={() => navigate('/inventory')} className="md:hidden w-full mt-8 border-2 border-gray-900 text-gray-900 font-bold py-3 rounded-xl">View All Stock</button>
            </section>
        </>
    );
};

// 修改：InventoryPage 现在支持接收 category 参数用于筛选
const InventoryPage = ({ category }) => {
    // 简单的“加载更多”逻辑
    const [visibleCount, setVisibleCount] = useState(6);

    // 根据 category 筛选数据
    let filteredCars = INITIAL_CARS;
    let pageTitle = "Current Inventory";

    if (category === 'toyota') {
        // 筛选 Alphard 和 Vellfire
        filteredCars = INITIAL_CARS.filter(car =>
            car.title.includes("Alphard") || car.title.includes("Vellfire")
        );
        pageTitle = "Toyota Alphard & Vellfire Collection";
    }

    const displayedCars = filteredCars.slice(0, visibleCount);

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">{pageTitle}</h2>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">{filteredCars.length} Vehicles</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {displayedCars.map(car => <CarCard key={car.id} car={car} />)}
            </div>

            {/* Load More Button - 只在还有更多车没显示时出现 */}
            {visibleCount < filteredCars.length && (
                <div className="text-center">
                    <button
                        onClick={() => setVisibleCount(prev => prev + 6)}
                        className="bg-white border-2 border-gray-200 text-gray-900 font-bold py-3 px-10 rounded-full hover:bg-gray-50 transition-colors"
                    >
                        Load More Vehicles
                    </button>
                </div>
            )}
        </div>
    );
};

// 重写：CarDetailPage - 增强版画廊和配置列表
const CarDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const car = INITIAL_CARS.find(c => c.id === parseInt(id));

    // State for image gallery index
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!car) {
        return <div className="p-20 text-center text-xl">Car not found!</div>;
    }

    // Ensure images array exists, fallback to main image if empty
    const galleryImages = (car.images && car.images.length > 0) ? car.images : [car.image];

    // Gallery Navigation Functions
    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    };

    return (
        <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
            <button onClick={() => navigate('/inventory')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-medium transition-colors">
                <ArrowLeft size={18} /> Return to Inventory
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Left: Images (Gallery) */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-sm group">
                        <img src={galleryImages[currentImageIndex]} alt={car.title} className="w-full h-full object-cover" />

                        {/* Gallery Controls (Only if multiple images) */}
                        {galleryImages.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <ChevronRight size={24} />
                                </button>
                                <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                                    {currentImageIndex + 1} / {galleryImages.length}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {galleryImages.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {galleryImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all relative ${currentImageIndex === idx ? 'border-red-600 ring-2 ring-red-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                >
                                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Content Block */}
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Vehicle Description</h3>
                        <p className="text-gray-600 leading-7 mb-8">{car.description}</p>

                        {/* Features List (New) */}
                        {car.features && car.features.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Key Features</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {car.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg">
                                            <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                                            <span className="text-sm font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Sidebar Info (Sticky) */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                        <div className="mb-6">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">{car.status}</span>
                            <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-2 leading-tight">{car.title}</h1>
                            <p className="text-gray-500 text-sm flex items-center gap-1 mb-4"><MapPin size={14} /> {car.location || "Sydney"}</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-bold text-red-700">${(car.price || 0).toLocaleString()}</p>
                            </div>
                            <p className="text-xs text-gray-400 font-medium">Excluding Government Charges</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {[
                                { l: 'Year', v: car.year },
                                { l: 'Mileage', v: `${(car.mileage || 0).toLocaleString()} km` },
                                { l: 'Engine', v: car.engine || "N/A" },
                                { l: 'Trans', v: car.transmission || "Auto" },
                                { l: 'Seats', v: car.seats || "N/A" },
                                { l: 'Fuel', v: car.fuel },
                            ].map((item, i) => (
                                <div key={i} className="bg-gray-50 p-3 rounded-lg">
                                    <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">{item.l}</span>
                                    <span className="font-semibold text-gray-900 text-sm">{item.v}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <button onClick={() => navigate('/contact')} className="w-full bg-red-700 text-white font-bold py-3.5 rounded-xl hover:bg-red-800 transition-colors shadow-lg shadow-red-700/20">
                                Enquire Now
                            </button>
                            <a href="tel:0289702037" className="w-full border border-gray-200 text-gray-900 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                <Phone size={18} /> Call Dealer
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- About Page (Content Filled) ---
const AboutPage = () => (
    <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">About AUTOHOME AU</h2>
            <p className="text-xl text-gray-500 leading-relaxed">
                We are Sydney's premier destination for luxury Japanese MPVs. With over 10 years of experience, we specialize in importing the finest Toyota Alphard and Vellfire models directly from Japan, ensuring quality, transparency, and value for our customers.
            </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
                { icon: <Globe size={32} />, title: "Direct Import", desc: "We source directly from Japan auctions, ensuring high grade and low mileage." },
                { icon: <Wrench size={32} />, title: "In-House Workshop", desc: "Every vehicle is inspected and serviced by our qualified technicians." },
                { icon: <ShieldCheck size={32} />, title: "Extended Warranty", desc: "Drive away with peace of mind with our comprehensive warranty options." }
            ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-8 rounded-2xl text-center hover:bg-white hover:shadow-xl transition-all border border-gray-100">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-500">{item.desc}</p>
                </div>
            ))}
        </div>
    </div>
);

// --- Contact Page (Map & Form) ---
const ContactPage = () => (
    <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-500">Visit our showrooms or send us an enquiry below.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Send an Enquiry</h3>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Message sent! (This is a demo)"); }}>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                        <input type="text" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" placeholder="Your full name" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                        <input type="tel" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" placeholder="Mobile number" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                        <textarea className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none h-32" placeholder="I'm interested in..." ></textarea>
                    </div>
                    <button className="w-full bg-red-700 text-white font-bold py-4 rounded-xl hover:bg-red-800 transition-colors shadow-lg shadow-red-700/20">
                        Send Message
                    </button>
                </form>
            </div>

            {/* Locations & Info */}
            <div className="space-y-8">
                {/* Showroom 1 */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><MapPin className="text-red-600" /> Burwood Showroom</h4>
                    <p className="text-gray-600 ml-8 mb-4">388-390 Parramatta Road, Burwood NSW 2134</p>
                    <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden">
                        {/* Google Maps Embed Placeholder (Burwood) */}
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.926694632734!2d151.1038!3d-33.8658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12a4c8c8c8c8c9%3A0x1234567890abcdef!2s388%20Parramatta%20Rd%2C%20Burwood%20NSW%202134!5e0!3m2!1sen!2sau!4v1620000000000!5m2!1sen!2sau"
                            width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
                        ></iframe>
                    </div>
                </div>

                {/* Showroom 2 */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><MapPin className="text-red-600" /> Strathfield Showroom</h4>
                    <p className="text-gray-600 ml-8 mb-4">416 Parramatta Road, Strathfield NSW 2135</p>
                    <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden">
                        {/* Google Maps Embed Placeholder (Strathfield) */}
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.926694632734!2d151.0938!3d-33.8658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12a4c8c8c8c8c9%3A0x1234567890abcdef!2s416%20Parramatta%20Rd%2C%20Strathfield%20NSW%202135!5e0!3m2!1sen!2sau!4v1620000000000!5m2!1sen!2sau"
                            width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
                        ></iframe>
                    </div>
                </div>

                {/* Hours */}
                <div className="bg-gray-900 text-white p-6 rounded-2xl">
                    <h4 className="font-bold mb-4 flex items-center gap-2"><Clock size={20} /> Opening Hours</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex justify-between"><span>Monday - Friday</span><span>9:30 AM - 5:30 PM</span></div>
                        <div className="flex justify-between"><span>Saturday</span><span>9:30 AM - 5:00 PM</span></div>
                        <div className="flex justify-between"><span>Sunday</span><span>10:00 AM - 4:00 PM</span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// --- GAC Page (New Placeholder) ---
const GacPage = () => (
    <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">GAC Motor</h2>
        <div className="bg-gray-900 text-white rounded-2xl p-12 max-w-4xl mx-auto relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">Coming Soon to Burwood</h3>
                <p className="text-xl text-gray-300 mb-8">We are excited to announce that we will soon be an authorized dealer for GAC Motor. Stay tuned for the latest models.</p>
                <Link to="/contact" className="inline-block bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors">
                    Register Interest
                </Link>
            </div>
            {/* Abstract Background Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        </div>
    </div>
);

// --- Sell Page (New Placeholder) ---
const SellPage = () => (
    <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">Sell Your Car</h2>
        <p className="text-xl text-gray-500 mb-8">
            Looking to upgrade? We offer competitive trade-in valuations for your current vehicle.
        </p>
        <div className="bg-gray-50 p-12 rounded-2xl border border-gray-200 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign size={40} className="text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Online Valuation Coming Soon</h3>
            <p className="text-gray-600 mb-8">
                We are currently building our online valuation tool to give you an instant estimate. In the meantime, please contact our team directly.
            </p>
            <Link to="/contact" className="inline-block bg-gray-900 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors">
                Contact Team for Valuation
            </Link>
        </div>
    </div>
);

// --- App Content (Internal) ---
function AppContent() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    const NavItem = ({ path, label, hasDropdown }) => (
        <div className="group relative h-full flex items-center">
            <Link
                to={hasDropdown ? '#' : path}
                className={`flex items-center gap-1 hover:text-red-700 transition-colors font-medium text-sm tracking-wide ${location.pathname === path ? 'text-red-700' : 'text-gray-900'}`}
            >
                {label} {hasDropdown && <ChevronDown size={14} />}
            </Link>

            {hasDropdown && (
                <div className="absolute top-full left-0 mt-0 w-48 bg-white shadow-xl rounded-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
                    <div className="py-2">
                        <Link to="/brands/toyota" className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors">Alphard / Vellfire</Link>
                        {/* 修正：跳转到 GAC 专属页面 */}
                        <Link to="/gac" className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors">GAC Burwood</Link>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col selection:bg-red-100 selection:text-red-900">
            <ScrollToTop />

            <div className="bg-black text-gray-400 py-2.5 text-xs border-b border-gray-800">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <a href="tel:0289702037" className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><Phone size={14} className="text-red-600" /> 02 8970 2037</a>
                        <a href="https://goo.gl/maps/placeholder" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><MapPin size={14} className="text-red-600" /> Burwood & Strathfield</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="hover:text-white cursor-pointer transition-colors">WeChat: Autohome388</span>
                    </div>
                </div>
            </div>

            <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 h-20">
                <div className="container mx-auto px-4 h-full flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 cursor-pointer">
                        <img src={LOGO_URL} alt="Logo" className="h-12 w-auto object-contain" />
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold text-gray-900 leading-none tracking-tight">AUTOHOME AU</h1>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 h-full">
                        <NavItem path="/" label="HOME" />
                        <NavItem path="/inventory" label="BUY A CAR" />
                        <NavItem path="#" label="OUR BRANDS" hasDropdown />
                        <NavItem path="/sell" label="SELL YOUR CAR" />
                        <NavItem path="/about" label="ABOUT" />
                        <NavItem path="/contact" label="CONTACT" />
                    </div>

                    <button className="md:hidden p-2 text-gray-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 top-[110px] bg-white z-30 p-6 flex flex-col gap-6 animate-in slide-in-from-right-10 overflow-y-auto pb-20">
                    <Link to="/" className="text-xl font-bold text-gray-900 text-left">HOME</Link>
                    <Link to="/inventory" className="text-xl font-bold text-gray-900 text-left">BUY A CAR</Link>
                    <div className="space-y-4 pl-4 border-l-2 border-red-100">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">OUR BRANDS</p>
                        {/* 修改：手机端链接更新 */}
                        <Link to="/brands/toyota" className="block text-lg font-bold text-gray-900">Toyota Alphard</Link>
                        <Link to="/gac" className="block text-lg font-bold text-gray-900">GAC Motor</Link>
                    </div>
                    <Link to="/sell" className="text-xl font-bold text-gray-900 text-left">SELL YOUR CAR</Link>
                    <Link to="/contact" className="text-xl font-bold text-gray-900 text-left">CONTACT</Link>
                </div>
            )}

            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    {/* Inventory Route (All Cars) */}
                    <Route path="/inventory" element={<InventoryPage />} />
                    {/* Brand Route (Toyota Only) */}
                    <Route path="/brands/toyota" element={<InventoryPage category="toyota" />} />
                    <Route path="/vehicle/:id" element={<CarDetailPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/sell" element={<SellPage />} />
                    <Route path="/gac" element={<GacPage />} />
                </Routes>
            </main>

            <footer className="bg-gray-900 text-gray-300 pt-20 pb-10 border-t border-gray-800">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <img src={LOGO_URL} alt="Logo" className="h-8 w-auto brightness-0 invert opacity-80" />
                                <span className="font-bold text-white tracking-widest">AUTOHOME</span>
                            </div>
                            <p className="text-sm leading-7 text-gray-400 mb-6">
                                Your trusted partner for luxury vehicle imports in Sydney. Delivering quality, enthusiasm, and value.
                            </p>
                            <div className="flex gap-4">
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-700 hover:text-white transition-all cursor-pointer"><Instagram size={18} /></a>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all cursor-pointer"><Facebook size={18} /></a>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 tracking-wide">BURWOOD SHOWROOM</h4>
                            <div className="space-y-4 text-sm text-gray-400">
                                <a href="https://goo.gl/maps/placeholder" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-white"><MapPin size={16} className="text-red-700 shrink-0 mt-1" /><span>388-390 Parramatta Road<br />Burwood NSW 2134</span></a>
                                <a href="tel:0289702037" className="flex items-center gap-3 hover:text-white"><Phone size={16} className="text-red-700 shrink-0" /><span>0289702037</span></a>
                                <p className="flex items-center gap-3"><MessageCircle size={16} className="text-red-700 shrink-0" /><span>WeChat: Autohome388</span></p>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 tracking-wide">STRATHFIELD SHOWROOM</h4>
                            <div className="space-y-4 text-sm text-gray-400">
                                <a href="https://goo.gl/maps/placeholder" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-white"><MapPin size={16} className="text-red-700 shrink-0 mt-1" /><span>416 Parramatta Road<br />Strathfield NSW 2135</span></a>
                                <a href="tel:0289702037" className="flex items-center gap-3 hover:text-white"><Phone size={16} className="text-red-700 shrink-0" /><span>0289702037</span></a>
                                <a href="mailto:enquiries@auto-home.com.au" className="flex items-center gap-3 hover:text-white"><Mail size={16} className="text-red-700 shrink-0" /><span>enquiries@auto-home.com.au</span></a>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 tracking-wide">QUICK LINKS</h4>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                                <li><Link to="/inventory" className="hover:text-white transition-colors">Buy a Car</Link></li>
                                <li><Link to="/sell" className="hover:text-white transition-colors">Sell Your Car</Link></li>
                                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                        <p>&copy; 2026 Autohome AU. All rights reserved.</p>
                        <div className="flex gap-8"><span>Privacy Policy</span><span>Terms & Conditions</span></div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// --- Root App Component (Default Export) ---
export default function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}