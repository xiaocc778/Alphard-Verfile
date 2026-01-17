import React, { useState, useEffect } from 'react';
// 1. 引入路由核心组件
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, Menu, X, ChevronDown, Car, ArrowLeft, Mail, Info, Instagram, Facebook, Globe, Wrench, ShieldCheck, Clock, DollarSign, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

// 🔥🔥🔥 核心修改：这里引入了 Python 脚本生成的真实数据！
// 如果报错 "Module not found"，请确保您运行了 `python generate_data.py` 并且 src 目录下有 carsData.js
import { cars as INITIAL_CARS } from './carsData';

// --- Configuration ---
const LOGO_URL = "https://static.wixstatic.com/media/943eef_77866c00442d480bbe5b61d50c9bb6bb~mv2.jpg/v1/fill/w_387,h_269,al_c,lg_1,q_80,enc_avif,quality_auto/image_edited.jpg";

// --- 🛠️ 核心工具：图片路径生成器 ---
// 逻辑：根据 文件夹名 和 图片数量，自动生成所有图片路径
const getCarImage = (folderName, imageCount, type = 'cover') => {
    // 如果没填文件夹名，返回默认网络占位图
    if (!folderName) {
        if (type === 'cover') return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000";
        return ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000"];
    }

    // 封面图路径：/stock/{folderName}/cover.jpg
    if (type === 'cover') {
        return `/stock/${folderName}/cover.jpg`;
    }

    // 相册图路径：/stock/{folderName}/1.jpg, 2.jpg ...
    // 这里做了一个小容错：如果 imageCount 为 0 或 undefined，返回空数组
    const count = imageCount || 0;
    if (count === 0) return [];
    return Array.from({ length: count }, (_, i) => `/stock/${folderName}/${i + 1}.jpg`);
};

// --- Utility Components ---
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
};

// --- Sub-Components ---

const CarCard = ({ car }) => {
    const navigate = useNavigate();
    // 自动获取封面图
    const imageUrl = getCarImage(car.folderName, car.imageCount, 'cover');

    return (
        <div
            onClick={() => navigate(`/vehicle/${car.id}`)}
            className="group bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col h-full relative cursor-pointer"
        >
            <div className="relative h-56 overflow-hidden bg-gray-200">
                <img
                    src={imageUrl}
                    alt={car.title}
                    // 如果找不到本地图（比如文件名不对），显示默认图防止白屏
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000"; }}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
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

const HomePage = ({ cars }) => {
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
                    {cars.slice(0, 6).map(car => <CarCard key={car.id} car={car} />)}
                </div>
                <button onClick={() => navigate('/inventory')} className="md:hidden w-full mt-8 border-2 border-gray-900 text-gray-900 font-bold py-3 rounded-xl">View All Stock</button>
            </section>
        </>
    );
};

const InventoryPage = ({ cars, category }) => {
    const [visibleCount, setVisibleCount] = useState(12);
    let filteredCars = cars;
    let pageTitle = "Current Inventory";

    if (category === 'toyota') {
        filteredCars = cars.filter(car =>
            (car.title && (car.title.includes("Alphard") || car.title.includes("Vellfire"))) ||
            (car.folderName && (car.folderName.includes("Alphard") || car.folderName.includes("Vellfire")))
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
            {filteredCars.length === 0 ? (
                <div className="text-center py-20 text-gray-500">No vehicles found in this category.</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {displayedCars.map(car => <CarCard key={car.id} car={car} />)}
                    </div>
                    {visibleCount < filteredCars.length && (
                        <div className="text-center">
                            <button onClick={() => setVisibleCount(prev => prev + 6)} className="bg-white border-2 border-gray-200 text-gray-900 font-bold py-3 px-10 rounded-full hover:bg-gray-50 transition-colors">Load More Vehicles</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const CarDetailPage = ({ cars }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const car = cars.find(c => c.id === parseInt(id));

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!car) {
        return <div className="p-20 text-center text-xl">Car not found!</div>;
    }

    // ✨ 核心魔法：自动生成图片列表
    const galleryImages = getCarImage(car.folderName, car.imageCount, 'gallery');
    const activeImage = galleryImages[currentImageIndex] || "https://via.placeholder.com/800x600?text=No+Image";

    const nextImage = () => {
        if (galleryImages.length <= 1) return;
        setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    };

    const prevImage = () => {
        if (galleryImages.length <= 1) return;
        setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    };

    return (
        <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
            <button onClick={() => navigate('/inventory')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-medium transition-colors">
                <ArrowLeft size={18} /> Return to Inventory
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-8 space-y-4">
                    <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-sm group">
                        <img
                            src={activeImage}
                            alt={car.title}
                            onError={(e) => { e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Found"; }}
                            className="w-full h-full object-cover"
                        />
                        {galleryImages.length > 1 && (
                            <>
                                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronLeft size={24} />
                                </button>
                                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight size={24} />
                                </button>
                                <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                                    {currentImageIndex + 1} / {galleryImages.length}
                                </div>
                            </>
                        )}
                    </div>

                    {galleryImages.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {galleryImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all relative ${currentImageIndex === idx ? 'border-red-600 ring-2 ring-red-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                >
                                    <img src={img} alt="thumb" onError={(e) => { e.target.style.display = 'none'; }} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Vehicle Description</h3>
                        <p className="text-gray-600 leading-7 mb-8">{car.description}</p>
                        {car.features && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Key Features</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {car.features.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg">
                                            <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                                            <span className="text-sm font-medium">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                        <div className="mb-6">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">{car.status}</span>
                            <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-2 leading-tight">{car.title}</h1>
                            <p className="text-gray-500 text-sm flex items-center gap-1 mb-4"><MapPin size={14} /> {car.location || "Sydney"}</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-bold text-red-700">${(car.price || 0).toLocaleString()}</p>
                            </div>
                            <p className="text-xs text-gray-400">Excl. Gov. Charges</p>
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
                            <a href="tel:0289702037" className="w-full border border-gray-200 text-gray-900 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"><Phone size={18} /> Call Dealer</a>
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
    // 使用初始数据
    const cars = INITIAL_CARS;

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
                        <Link to="/inventory" className="block text-lg font-bold text-gray-900">Toyota Alphard</Link>
                        <Link to="/gac" className="block text-lg font-bold text-gray-900">GAC Motor</Link>
                    </div>
                    <Link to="/sell" className="text-xl font-bold text-gray-900 text-left">SELL YOUR CAR</Link>
                    <Link to="/contact" className="text-xl font-bold text-gray-900 text-left">CONTACT</Link>
                </div>
            )}

            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<HomePage cars={cars} />} />
                    <Route path="/inventory" element={<InventoryPage cars={cars} />} />
                    <Route path="/brands/toyota" element={<InventoryPage cars={cars} category="toyota" />} />
                    <Route path="/vehicle/:id" element={<CarDetailPage cars={cars} />} />
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