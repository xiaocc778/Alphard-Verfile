import React, { useCallback, useMemo, useState, useEffect } from 'react';
// 1. 引入路由核心组件
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
// 2. 引入图标库
import { MapPin, Phone, MessageCircle, Menu, X, ChevronDown, ArrowLeft, Mail, Info, Instagram, Facebook, Globe, Wrench, ShieldCheck, Clock, DollarSign, ChevronLeft, ChevronRight, CheckCircle2, Star, Award, Users, Car, Sparkles, Play, ArrowRight, Shield, Truck, ThumbsUp, Search } from 'lucide-react';
// 3. 引入车辆数据
import { cars as carsFromData } from './carsData.js';
import { useCarsData } from './hooks/useCarsData.js';
import ImportPage from './admin/ImportPage.jsx';
import { STOCK_FOLDERS } from './stockManifest.js';

// --- Language ---
const LANGUAGE_STORAGE_KEY = 'bestauto.language';
const LanguageContext = React.createContext(null);

const useLanguage = () => {
    const context = React.useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageContext');
    }
    return context;
};

// --- Configuration ---
const LOGO_URL = "https://static.wixstatic.com/media/943eef_77866c00442d480bbe5b61d50c9bb6bb~mv2.jpg/v1/fill/w_387,h_269,al_c,lg_1,q_80,enc_avif,quality_auto/image_edited.jpg";
const BRAND_NAME = "BEST AUTO";
const SALES_PHONE = "+61431618668";
const SALES_PHONE_DISPLAY = "0431 618 668";
const SERVICE_PHONE = "+61298973406";
const SERVICE_PHONE_DISPLAY = "+61 2 9897 3406";
const WECHAT_ID = "Alphard sales specialist";
const SHOWROOM_ADDRESS = "17 Kanoona Ave, Homebush NSW 2140";
const SERVICE_ADDRESS = "19 George St, Clyde NSW 2142";
const CONTACT_EMAIL = "1078500421@qq.com";
const CONTACT_FORM_ACTION = `https://formsubmit.co/${CONTACT_EMAIL}`;
const PROMO_VIDEO = {
    title: { en: "Brand Story Video", zh: "品牌宣传视频" },
    subtitle: {
        en: "A quick look at our showroom, inventory, and service standards.",
        zh: "快速了解我们的展厅、库存与服务标准。",
    },
    mp4: "",
    webm: "",
    poster: "/stock/2024 Toyota Vellfire/cover.jpg",
};
const ALPHARD_SITE_URL = "/alphard.html#/brands/alphard-vellfire";

// --- 🛠️ 核心工具：图片路径生成器 ---
const getCarImage = (folderName, imageCount, type = 'cover', car = null) => {
    // Prefer explicit URLs if provided (e.g. scraped cover images)
    if (car && type === 'cover' && car.coverUrl) return car.coverUrl;
    if (car && type === 'gallery' && Array.isArray(car.galleryUrls)) return car.galleryUrls;

    if (!folderName) {
        if (type === 'cover') return "https://images.unsplash.com/photo-1600661653561-629509216228?auto=format&fit=crop&q=80&w=1000";
        return ["https://images.unsplash.com/photo-1600661653561-629509216228?auto=format&fit=crop&q=80&w=1000"];
    }
    if (type === 'cover') {
        return `/stock/${folderName}/cover.jpg`;
    }
    const count = imageCount || 0;
    if (count === 0) return [];
    return Array.from({ length: count }, (_, i) => `/stock/${folderName}/${i + 1}.jpg`);
};

// --- DATA: 车辆数据 (内置于此，保证稳定运行) ---
const INITIAL_CARS = [
    {
        id: 1,
        title: "2024 Toyota Vellfire Hybrid Z Premier",
        price: 99999,
        mileage: 3200,
        year: 2024,
        fuel: "Hybrid",
        location: "Homebush",
        status: "In Stock",
        folderName: "Toyota Vellfire 2024",
        imageCount: 5,
        description: "Almost brand new 2024 Toyota Vellfire Hybrid. Experience the pinnacle of luxury with advanced hybrid efficiency. Features premium leather seats, dual sunroofs, and the latest Toyota Safety Sense.",
        features: ["Dual Sunroof", "Nappa Leather", "360 Camera", "Apple CarPlay"]
    },
    {
        id: 2,
        title: "2025 Toyota Voxy S-Z (Brand New)",
        price: 63990,
        mileage: 28,
        year: 2025,
        fuel: "Petrol",
        location: "Homebush",
        status: "Brand New",
        folderName: "",
        imageCount: 0,
        description: "The all-new 2025 Toyota Voxy. A perfect family MPV with spacious interior, aggressive styling, and modern tech.",
        features: ["Dual Power Doors", "Wireless Charger", "7 Seats"]
    },
    {
        id: 3,
        title: "2023 Toyota Alphard 2.5L SC",
        price: 69000,
        mileage: 25000,
        year: 2023,
        fuel: "Petrol",
        location: "Homebush",
        status: "Best Seller",
        folderName: "Toyota Alphard 2023",
        imageCount: 8,
        description: "Highly sought-after 30 Series Alphard SC Package. Includes pilot seats and power tailgate. Excellent condition with moderate mileage.",
        features: ["Pilot Seats", "Power Tailgate", "Sunroof", "Alcantara"]
    },
    { id: 4, title: "2019 BMW X5 xDrive30d M Sport", price: 67900, mileage: 51000, year: 2019, fuel: "Diesel", location: "Homebush", status: "Premium Used", folderName: "", imageCount: 0, description: "Luxury SUV performance.", features: ["M Sport Package", "Panoramic Sunroof", "Heads-up Display", "20-inch Alloys"] },
    { id: 5, title: "2022 Toyota RAV4 Cruiser Hybrid", price: 47900, mileage: 25000, year: 2022, fuel: "Hybrid", location: "Homebush", status: "In Stock", folderName: "", imageCount: 0, description: "Australia's favorite SUV.", features: ["JBL Sound System", "Leather Interior", "360 Camera", "Hybrid System"] },
    { id: 6, title: "2015 Jaguar XE R-Sport", price: 18900, mileage: 67000, year: 2015, fuel: "Petrol", location: "Homebush", status: "Clearance", folderName: "", imageCount: 0, description: "Sporty elegance.", features: ["R-Sport Body Kit", "Navigation"] },
    {
        id: 13,
        title: "2024 Toyota Alphard 40 Series Executive Lounge",
        price: 168000,
        mileage: 15,
        year: 2024,
        fuel: "Hybrid",
        location: "Homebush",
        status: "Brand New",
        folderName: "Toyota Alphard 40 Series",
        imageCount: 0,
        description: "The all-new 40 Series Alphard. Redesigned from the ground up for ultimate luxury.",
        features: ["TNGA-K Platform", "14-inch Infotainment", "Executive Lounge Seats"]
    }
];

// --- Utility Components ---
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
};

// --- Sub-Components ---
const CarCard = ({ car }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const imageUrl = getCarImage(car.folderName, car.imageCount, 'cover', car);
    
    // 判断是否为 Alphard 或 Vellfire
    const isPremium = car.title?.toLowerCase().includes('alphard') || car.title?.toLowerCase().includes('vellfire');

    return (
        <div
            onClick={() =>
                navigate(`/vehicle/${car.id}`, {
                    state: { from: `${location.pathname}${location.search}` },
                })
            }
            className="group bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full border border-slate-200"
        >
            {/* Image Container */}
            <div className="relative h-56 overflow-hidden bg-slate-100">
                <img
                    src={imageUrl}
                    alt={car.title}
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1600661653561-629509216228?auto=format&fit=crop&q=80&w=1000"; }}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm text-white ${car.status === 'In Stock' || car.status === 'Brand New' ? 'bg-emerald-700' : 'bg-slate-900'}`}>
                        {car.status}
                    </span>
                    {isPremium && (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm text-white bg-slate-800 flex items-center gap-1">
                            <Star size={10} fill="currentColor" /> Premium
                        </span>
                    )}
                </div>

                {/* Quick View Button */}
                <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white text-slate-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
                        {t('View Details', '查看详情')} <ArrowRight size={14} />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors mb-4">
                    {car.title}
                </h3>

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                        <p className="text-xs text-slate-400 mb-1">{t('Year', '年份')}</p>
                        <p className="font-bold text-slate-900 text-sm">{car.year}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                        <p className="text-xs text-slate-400 mb-1">{t('Mileage', '里程')}</p>
                        <p className="font-bold text-slate-900 text-sm">
                            {(car.mileage || 0).toLocaleString()}
                            <span className="text-xs text-slate-400">{t('km', '公里')}</span>
                        </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                        <p className="text-xs text-slate-400 mb-1">{t('Fuel', '燃料')}</p>
                        <p className="font-bold text-slate-900 text-sm truncate">{car.fuel || 'Petrol'}</p>
                    </div>
                </div>

                {/* Price Section */}
                <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        {car.price > 0 ? (
                            <>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">${car.price.toLocaleString()}</p>
                                <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">
                                    {t('Excl. Gov. Charges', '不含政府费用')}
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-xl font-bold text-red-600">{t('Contact for Price', '价格面议')}</p>
                                <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">
                                    {t('Enquire for price', '询价请联系')}
                                </p>
                            </>
                        )}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                        <ArrowRight size={20} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 品牌常量与提取函数 ---
const ALL_BRANDS = [
    'Toyota',
    'BMW',
    'Mercedes-Benz',
    'Audi',
    'Lexus',
    'Mazda',
    'Honda',
    'Volkswagen',
    'Subaru',
    'Nissan',
    'Ford',
    'Jeep',
    'Land Rover',
    'Jaguar',
    'Kia',
    'Suzuki',
    'Mitsubishi',
    'Infiniti',
    'Tesla',
    'BYD',
];

const getBrandFromTitle = (title) => {
    const t = (title || "").toLowerCase();
    if (t.includes('toyota')) return 'Toyota';
    if (t.includes('bmw')) return 'BMW';
    if (t.includes('mercedes') || t.includes('amg')) return 'Mercedes-Benz';
    if (t.includes('audi')) return 'Audi';
    if (t.includes('lexus')) return 'Lexus';
    if (t.includes('mazda')) return 'Mazda';
    if (t.includes('honda')) return 'Honda';
    if (t.includes('volkswagen') || t.includes('vw') || t.includes('tiguan') || t.includes('golf')) return 'Volkswagen';
    if (t.includes('subaru') || t.includes('wrx')) return 'Subaru';
    if (t.includes('nissan') || t.includes('elgrand') || t.includes('gt-r')) return 'Nissan';
    if (t.includes('ford') || t.includes('mustang') || t.includes('ranger')) return 'Ford';
    if (t.includes('jeep')) return 'Jeep';
    if (t.includes('land rover') || t.includes('range rover')) return 'Land Rover';
    if (t.includes('jaguar')) return 'Jaguar';
    if (t.includes('kia')) return 'Kia';
    if (t.includes('suzuki') || t.includes('swift')) return 'Suzuki';
    if (t.includes('mitsubishi') || t.includes('lancer') || t.includes('evo')) return 'Mitsubishi';
    if (t.includes('infiniti') || t.includes('infinity')) return 'Infiniti';
    if (t.includes('tesla')) return 'Tesla';
    if (t.includes('byd')) return 'BYD';
    return null;
};

// --- 库存页筛选组件 ---
const InventoryFilterWidget = ({ tempFilters, setTempFilters, onSearch, onReset, cars, resultCount, isToyotaCategory = false }) => {
    const { t } = useLanguage();
    // 品牌库存数量（用于展示，即使为 0 也允许选择）
    const brandCounts = cars.reduce((acc, car) => {
        const b = getBrandFromTitle(car.title);
        if (!b) return acc;
        acc[b] = (acc[b] || 0) + 1;
        return acc;
    }, {});

    // 年份选项
    const years = [...new Set(cars.map(car => car.year))].filter(Boolean).sort((a, b) => b - a);

    return (
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/10 border border-white/60 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-950 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                        <Car className="text-white" size={16} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">{t('Filter Vehicles', '筛选车辆')}</h3>
                        <p className="text-slate-400 text-xs">{isToyotaCategory ? t('Brand Showcase', '品牌专题') : t('Buy a Car', '选购车辆')}</p>
                    </div>
                </div>
                <div className="text-white text-sm">
                    <span className="text-2xl font-black">{resultCount}</span>
                    <span className="text-slate-400 ml-1">{t('results', '结果')}</span>
                </div>
            </div>

            {/* Filter Grid */}
            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                    {/* Keyword */}
                    <div className="space-y-2 lg:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            {t('Keyword', '关键词')}
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                value={tempFilters.keyword || ''}
                                onChange={(e) => setTempFilters({ ...tempFilters, keyword: e.target.value })}
                                onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }}
                                placeholder={t('Alphard / Hybrid / SUV / 7 seats...', 'Alphard / 混动 / SUV / 7座...')}
                                className={`w-full pl-10 pr-4 p-3 border-2 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 font-medium text-sm transition-all ${
                                    tempFilters.keyword ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                                }`}
                            />
                        </div>
                    </div>
                    {/* Brand */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            {t('Brand', '品牌')}
                        </label>
                        {isToyotaCategory ? (
                            <div className="w-full p-3 border-2 rounded-xl bg-slate-100 border-slate-200 text-slate-600 font-semibold text-sm flex items-center justify-between">
                                <span>{t('Toyota', '丰田')}</span>
                                <span className="text-xs text-slate-400">{t('Locked', '锁定')}</span>
                            </div>
                        ) : (
                            <div className="relative group">
                            <select 
                                    value={tempFilters.brand}
                                    onChange={(e) => setTempFilters({...tempFilters, brand: e.target.value})}
                                className={`w-full p-3 border-2 rounded-xl appearance-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 font-medium text-sm cursor-pointer transition-all ${tempFilters.brand ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'}`}
                                >
                                    <option value="">{t('All Brands', '全部品牌')}</option>
                                    {ALL_BRANDS.map((brand) => (
                                        <option key={brand} value={brand}>
                                            {brand} ({brandCounts[brand] || 0})
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        )}
                    </div>

                    {/* Year From */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            {t('Year', '年份')}
                        </label>
                        <div className="relative group">
                            <select 
                                value={tempFilters.yearFrom}
                                onChange={(e) => setTempFilters({...tempFilters, yearFrom: e.target.value})}
                                className={`w-full p-3 border-2 rounded-xl appearance-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 font-medium text-sm cursor-pointer transition-all ${tempFilters.yearFrom ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'}`}
                            >
                                <option value="">{t('Any Year', '不限年份')}</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}+</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            {t('Price', '价格')}
                        </label>
                        <div className="relative group">
                            <select 
                                value={tempFilters.priceRange}
                                onChange={(e) => setTempFilters({...tempFilters, priceRange: e.target.value})}
                                className={`w-full p-3 border-2 rounded-xl appearance-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 font-medium text-sm cursor-pointer transition-all ${tempFilters.priceRange ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'}`}
                            >
                                <option value="">{t('Any Price', '不限价格')}</option>
                                <option value="1">{t('Under $30,000', '30,000 以下')}</option>
                                <option value="2">{t('$30,000 - $60,000', '30,000 - 60,000')}</option>
                                <option value="3">{t('$60,000 - $100,000', '60,000 - 100,000')}</option>
                                <option value="4">{t('$100,000+', '100,000 以上')}</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Sort By */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            {t('Sort', '排序')}
                        </label>
                        <div className="relative group">
                            <select 
                                value={tempFilters.sortBy}
                                onChange={(e) => setTempFilters({...tempFilters, sortBy: e.target.value})}
                                className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl appearance-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 text-slate-800 font-medium text-sm cursor-pointer transition-all hover:border-slate-300"
                            >
                                <option value="newest">{t('Newest First', '最新优先')}</option>
                                <option value="oldest">{t('Oldest First', '最旧优先')}</option>
                                <option value="price-low">{t('Price: Low → High', '价格：低到高')}</option>
                                <option value="price-high">{t('Price: High → Low', '价格：高到低')}</option>
                                <option value="mileage-low">{t('Mileage: Low → High', '里程：低到高')}</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Reset Button */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-transparent">{t('Reset', '重置')}</label>
                        <button
                            onClick={onReset}
                            className="w-full p-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-slate-300"
                        >
                            <X size={16} />
                            <span>{t('Reset', '重置')}</span>
                        </button>
                    </div>

                    {/* Search Button */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-transparent">{t('Search', '搜索')}</label>
                        <button
                            onClick={onSearch}
                            className="w-full bg-slate-900 hover:bg-black text-white font-bold p-3 rounded-xl transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                        >
                            <span>{t('Search', '搜索')}</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 首页搜索组件 - 点击 Search 才跳转并传递参数
const HomeFilterWidget = ({ cars }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [brand, setBrand] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [yearFrom, setYearFrom] = useState('');
    const [keyword, setKeyword] = useState('');
    const openAlphardSite = () => {
        window.location.href = ALPHARD_SITE_URL;
    };
    
    // 首页品牌下拉：固定品牌列表（即使当前库存为 0，也允许选择，进入无结果页）
    const brandCounts = cars.reduce((acc, car) => {
        const b = getBrandFromTitle(car.title);
        if (!b) return acc;
        acc[b] = (acc[b] || 0) + 1;
        return acc;
    }, {});

    // 提取可用的年份
    const availableYears = [...new Set(cars.map(car => car.year))].sort((a, b) => b - a);

    // 点击搜索时构建 URL 参数并跳转
    const handleSearch = () => {
        const params = new URLSearchParams();
        if (brand) params.set('brand', brand);
        if (priceRange) params.set('price', priceRange);
        if (yearFrom) params.set('yearFrom', yearFrom);
        if (keyword && keyword.trim()) params.set('q', keyword.trim());
        
        const queryString = params.toString();
        navigate(queryString ? `/inventory?${queryString}` : '/inventory');
    };
    
    return (
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/10 border border-white/60 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-950 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                            <Car className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">{t('Search Inventory', '搜索库存')}</h3>
                            <p className="text-slate-400 text-xs">{t('Buy a Car', '选购车辆')} · {cars.length}+ {t('vehicles', '辆')}</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span>{t('All vehicles inspected', '所有车辆均经过检测')}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Keyword */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <span className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center text-slate-400">0</span>
                            {t('Keyword', '关键词')}
                        </label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors" size={18} />
                            <input
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                                placeholder={t('Alphard / Hybrid / 7 seats...', 'Alphard / 混动 / 7座...')}
                                className="w-full pl-11 pr-4 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl appearance-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 text-slate-800 font-semibold text-sm transition-all hover:border-slate-300"
                            />
                        </div>
                    </div>
                    {/* Brand */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <span className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center text-slate-400">1</span>
                            {t('Brand', '品牌')}
                        </label>
                        <div className="relative group">
                            <select 
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl appearance-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 text-slate-800 font-semibold text-sm cursor-pointer transition-all hover:border-slate-300"
                            >
                                <option value="">{t('All Brands', '全部品牌')}</option>
                                {ALL_BRANDS.map((b) => (
                                    <option key={b} value={b}>
                                        {b} ({brandCounts[b] || 0})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" size={18} />
                        </div>
                    </div>

                    {/* Year */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <span className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center text-slate-400">2</span>
                            {t('Year', '年份')}
                        </label>
                        <div className="relative group">
                            <select 
                                value={yearFrom}
                                onChange={(e) => setYearFrom(e.target.value)}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl appearance-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 text-slate-800 font-semibold text-sm cursor-pointer transition-all hover:border-slate-300"
                            >
                                <option value="">{t('Any Year', '不限年份')}</option>
                                {availableYears.map(y => <option key={y} value={y}>{y}+</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" size={18} />
                        </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <span className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center text-slate-400">3</span>
                            {t('Price', '价格')}
                        </label>
                        <div className="relative group">
                            <select 
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl appearance-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 text-slate-800 font-semibold text-sm cursor-pointer transition-all hover:border-slate-300"
                            >
                                <option value="">{t('Any Price', '不限价格')}</option>
                                <option value="1">{t('Under $30,000', '30,000 以下')}</option>
                                <option value="2">{t('$30,000 - $60,000', '30,000 - 60,000')}</option>
                                <option value="3">{t('$60,000 - $100,000', '60,000 - 100,000')}</option>
                                <option value="4">{t('$100,000+', '100,000 以上')}</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" size={18} />
                        </div>
                    </div>

                    {/* Search Button */}
                    <div className="flex items-end">
                        <button
                            onClick={handleSearch}
                            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-black/10 hover:-translate-y-0.5 flex items-center justify-center gap-3 group"
                        >
                            <Car size={20} />
                            <span>{t('Search', '搜索')}</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium">{t('Quick:', '快捷:')}</span>
                    {[
                        t('Toyota Alphard', '丰田埃尔法'),
                        t('Vellfire', '威尔法'),
                        t('SUV', '越野车'),
                        t('Under $50k', '5万以下')
                    ].map((tag, idx) => (
                        <button 
                            key={idx}
                            onClick={() => {
                                if (tag === 'Toyota Alphard' || tag === '丰田埃尔法' || tag === 'Vellfire' || tag === '威尔法') {
                                    openAlphardSite();
                                } else if (tag === 'Under $50k' || tag === '5万以下') {
                                    navigate('/inventory?price=1');
                                } else {
                                    navigate('/inventory');
                                }
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-full transition-colors"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Pages ---
const HomePage = ({ cars }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const safeCars = cars || [];
    const openAlphardSite = () => {
        window.location.href = ALPHARD_SITE_URL;
    };
    
    // 统计 Alphard 和 Vellfire 的数量
    const alphardVellfireCount = safeCars.filter(car => {
        const searchStr = `${car.title} ${car.folderName}`.toLowerCase();
        return searchStr.includes('alphard') || searchStr.includes('vellfire');
    }).length;

    return (
        <>
            {/* ========== HERO SECTION ========== */}
            <header className="relative min-h-[100vh] bg-black overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                    {/* Subtle local car photos (replaceable later) */}
                    <img
                        src="/stock/2024 Toyota Vellfire/cover.jpg"
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale contrast-110"
                    />
                    <img
                        src="/stock/2023 Toyota Alphard 2.5L/cover.jpg"
                        alt=""
                        className="absolute right-0 top-0 w-[60%] h-full object-cover opacity-07 grayscale contrast-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/65 to-black/40"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/45"></div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-20 right-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>

                {/* Main Content */}
                <div className="relative z-10 container mx-auto px-4 min-h-[100vh] flex items-center">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full py-32">
                        {/* Left Content */}
                        <div className="space-y-8">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                                <Sparkles className="text-amber-400" size={16} />
                                <span className="text-white/90 text-sm font-medium">
                                    {t("Sydney's Premium Pre-Owned Vehicle Specialist", "悉尼精品二手车专家")}
                                </span>
                            </div>

                            {/* Main Heading */}
                            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1]">
                                {t('Redefine Your', '重新定义')}
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-amber-400">
                                    {t('Driving Experience', '驾乘体验')}
                                </span>
                            </h1>

                            {/* Subtitle */}
                            <p className="text-xl text-white/60 max-w-lg leading-relaxed">
                                {t(
                                    'Sydney premium pre-owned vehicles, specializing in Alphard and Vellfire luxury MPVs with trusted quality and fair pricing.',
                                    '悉尼精品二手车专家，专注 Alphard、Vellfire 等豪华MPV，品质保证、价格实惠'
                                )}
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-4 pt-4">
                                <button
                                    onClick={() => navigate('/inventory')}
                                    className="group bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-4 px-8 rounded-full transition-all shadow-lg shadow-red-600/30 hover:shadow-red-500/50 hover:-translate-y-1 flex items-center gap-3"
                                >
                                    <Car size={20} />
                                    {t('Browse', '浏览')} {safeCars.length}+ {t('Vehicles', '车辆')}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => navigate('/contact')}
                                    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold py-4 px-8 rounded-full transition-all border border-white/30 hover:border-white/50 flex items-center gap-3"
                                >
                                    <Phone size={18} />
                                    {t('Contact Us', '联系我们')}
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex flex-wrap gap-6 pt-8 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                        <Shield className="text-emerald-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">{t('Alphard/Vellfire Specialist', '埃尔法/威尔法 专家')}</p>
                                        <p className="text-white/50 text-xs">{t('Focused on premium MPVs', '专注高端MPV')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                                        <Wrench className="text-blue-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">{t('Service & Repairs', '保养维修')}</p>
                                        <p className="text-white/50 text-xs">{t('One-stop service', '一站式服务')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="text-amber-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">{t('Quality Inspected', '严选车况')}</p>
                                        <p className="text-white/50 text-xs">{t('Professional inspection', '专业严格验车')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Stats Card */}
                        <div className="hidden lg:block">
                            <div className="relative">
                                {/* Main Feature Card */}
                                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30">
                                            <Award className="text-white" size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-xl">{t('Why Choose Us', '为什么选择我们')}</h3>
                                            <p className="text-white/50 text-sm">{t('Trusted by 1000+ customers', '1000+ 客户信赖')}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { number: "10+", label: t('Years Experience', '年经验'), icon: Clock },
                                                { number: `${safeCars.length}+`, label: t('Vehicles in Stock', '库存车辆'), icon: Car },
                                                { number: "1000+", label: t('Happy Customers', '满意客户'), icon: Users },
                                                { number: "4.9", label: t('Google Rating', '谷歌评分'), icon: Star },
                                            ].map((stat, idx) => (
                                            <div key={idx} className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors group">
                                                <stat.icon className="text-red-400 mb-2 group-hover:scale-110 transition-transform" size={20} />
                                                <p className="text-3xl font-black text-white">{stat.number}</p>
                                                <p className="text-white/50 text-sm">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
                    <span className="text-white/40 text-xs uppercase tracking-widest">{t('Scroll', '向下')}</span>
                    <ChevronDown className="text-white/40" size={20} />
                </div>
            </header>

            {/* ========== QUICK SEARCH BAR ========== */}
            <section className="relative z-20 -mt-12">
                <div className="container mx-auto px-4">
                    <HomeFilterWidget cars={safeCars} />
                </div>
            </section>

            {/* ========== VIDEO SHOWCASE ========== */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        <div className="lg:col-span-5 space-y-6">
                            <span className="inline-flex items-center gap-2 bg-red-100 text-red-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                                <Play size={14} />
                                {t("Video Showcase", "视频展示")}
                            </span>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                                {t(PROMO_VIDEO.title.en, PROMO_VIDEO.title.zh)}
                            </h2>
                            <p className="text-slate-600 text-lg leading-relaxed">
                                {t(PROMO_VIDEO.subtitle.en, PROMO_VIDEO.subtitle.zh)}
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => navigate('/contact')}
                                    className="bg-slate-900 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
                                >
                                    {t('Contact Us', '联系我们')}
                                </button>
                                <button
                                    onClick={() => navigate('/inventory')}
                                    className="bg-white border-2 border-slate-200 text-slate-900 font-bold py-3 px-6 rounded-full hover:border-red-600 hover:text-red-600 transition-colors"
                                >
                                    {t('Browse Inventory', '浏览库存')}
                                </button>
                            </div>
                        </div>
                        <div className="lg:col-span-7">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-black">
                                {(PROMO_VIDEO.mp4 || PROMO_VIDEO.webm) ? (
                                    <video
                                        controls
                                        playsInline
                                        preload="metadata"
                                        poster={PROMO_VIDEO.poster}
                                        className="w-full h-full object-cover"
                                    >
                                        {PROMO_VIDEO.webm && <source src={PROMO_VIDEO.webm} type="video/webm" />}
                                        {PROMO_VIDEO.mp4 && <source src={PROMO_VIDEO.mp4} type="video/mp4" />}
                                    </video>
                                ) : (
                                    <div className="relative">
                                        <img
                                            src={PROMO_VIDEO.poster}
                                            alt={t('Promo video placeholder', '宣传视频占位图')}
                                            className="w-full h-full object-cover opacity-90"
                                        />
                                        <div className="absolute inset-0 bg-black/45"></div>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
                                            <div className="w-16 h-16 rounded-full bg-white/15 border border-white/30 flex items-center justify-center">
                                                <Play size={26} />
                                            </div>
                                            <p className="text-sm font-semibold">
                                                {t('Video coming soon', '视频即将上线')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== WHY CHOOSE US ========== */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="inline-block bg-red-100 text-red-600 font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-4">
                            {t('Our Advantages', '我们的优势')}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900">
                            {t('Why', '为什么')} <span className="text-red-600">1000+</span> {t('Customers Trust Us', '客户信赖我们')}
                        </h2>
                        <p className="text-slate-500 mt-4 max-w-2xl mx-auto text-lg">
                            {t(
                                'Premium pre-owned vehicle service with transparent condition, fair pricing, and worry-free after-sales.',
                                '专业精品二手车服务，车况透明、价格实惠、售后无忧'
                            )}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {(() => {
                            const colorUI = {
                                blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
                                emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
                                amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
                                red: { bg: 'bg-red-100', text: 'text-red-600' },
                            };
                            const items = [
                                {
                                    icon: CheckCircle2,
                                    title: t('Quality Inspected', '严格品质检验'),
                                    desc: t(
                                        'Every vehicle undergoes comprehensive inspection with full transparency on history and condition.',
                                        '每台车都经过全面检测，车况与历史透明公开。'
                                    ),
                                    color: "blue",
                                },
                                {
                                    icon: Shield,
                                    title: t('5-Year Warranty', '五年免费保修'),
                                    desc: t(
                                        'Drive with confidence. Comprehensive warranty coverage included at no extra cost.',
                                        '安心购车，所有车辆提供完善保修保障。'
                                    ),
                                    color: "emerald",
                                },
                                {
                                    icon: Wrench,
                                    title: t('10-Year Service', '十年免费保养'),
                                    desc: t(
                                        'Certified technicians maintain your vehicle to factory standards for long-term peace of mind.',
                                        '专业技师按原厂标准维护，长期安心用车。'
                                    ),
                                    color: "amber",
                                },
                                {
                                    icon: ThumbsUp,
                                    title: t('Best Value', '超值性价比'),
                                    desc: t(
                                        'Premium quality at competitive prices. Transparent pricing with no hidden fees.',
                                        '优质车源，价格公道，费用透明无隐藏。'
                                    ),
                                    color: "red",
                                },
                            ];
                            return items.map((item, idx) => {
                                const ui = colorUI[item.color] || colorUI.red;
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={idx}
                                        className="group relative bg-slate-50 hover:bg-white rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 border border-transparent hover:border-slate-100"
                                    >
                                        <div className={`w-16 h-16 ${ui.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                            <Icon className={ui.text} size={28} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                        <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
            </section>

            {/* ========== FEATURED BRAND - Alphard & Vellfire ========== */}
            <section className="py-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
                <div className="container mx-auto px-4">
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <span className="inline-block bg-red-600 text-white font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-4">
                            {t('Our Specialty', '我们的专长')}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                            {t('Toyota Alphard & Vellfire', '丰田埃尔法 / 威尔法')}
                        </h2>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto">
                            {t(
                                `Sydney's most complete Alphard/Vellfire inventory — ${alphardVellfireCount}+ premium cars available.`,
                                `悉尼最全的埃尔法/威尔法库存，${alphardVellfireCount}+ 台精品现车任您挑选`
                            )}
                        </p>
                    </div>

                    {/* Image Gallery - 3 cars */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {[
                            { img: "/stock/25 Toyota Vellfire Executive Lounge/cover.jpg", name: "2025 Vellfire Executive Lounge", price: "$168,990" },
                            { img: "/stock/2024 Toyota Vellfire/cover.jpg", name: "2024 Vellfire Hybrid", price: "$115,990" },
                            { img: "/stock/2023 Toyota Alphard 2.5L/cover.jpg", name: "2023 Alphard 2.5L", price: "$98,990" },
                        ].map((car, idx) => (
                            <div 
                                key={idx} 
                                onClick={openAlphardSite}
                                className="group relative rounded-2xl overflow-hidden cursor-pointer h-72"
                            >
                                <img 
                                    src={car.img} 
                                    alt={car.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    onError={(e) => { e.target.src = "/stock/21 Toyota Alphard/cover.jpg"; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <p className="text-white font-bold text-lg">{car.name}</p>
                                    <p className="text-red-400 font-bold">{car.price}</p>
                                </div>
                                {idx === 0 && (
                                    <div className="absolute top-4 right-4 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                                        {t('TOP SPEC', '顶配')}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Features & CTA */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
                            {[
                                { label: "行政座椅", en: "Executive Seats" },
                                { label: "双侧电滑门", en: "Power Doors" },
                                { label: "JBL音响", en: "JBL Audio" },
                                { label: "安全系统", en: "Safety Suite" },
                            ].map((feature, idx) => (
                                <div key={idx} className="text-center">
                                    <CheckCircle2 className="text-emerald-400 mx-auto mb-2" size={24} />
                                    <p className="text-white font-bold text-sm">{t(feature.en, feature.label)}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={openAlphardSite}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-full transition-all shadow-lg shadow-red-600/30 flex items-center gap-3 whitespace-nowrap"
                        >
                            {t('View all', '查看全部')} {alphardVellfireCount}+ {t('vehicles', '台')}
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ========== FEATURED INVENTORY ========== */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
                        <div>
                            <span className="inline-block bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-4">
                                {t('Fresh Arrivals', '新到车辆')}
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900">{t('Featured Vehicles', '精选车辆')}</h2>
                            <p className="text-slate-500 mt-2">{t('Hand-picked for quality', '精选推荐 · 品质保证')}</p>
                        </div>
                        <button 
                            onClick={() => navigate('/inventory')} 
                            className="group flex items-center gap-2 text-slate-900 font-bold hover:text-red-600 transition-colors"
                        >
                            {t('View All', '查看全部')} {safeCars.length} {t('Vehicles', '车辆')} 
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {safeCars.slice(0, 6).map(car => <CarCard key={car.id} car={car} />)}
                    </div>
                    
                    <div className="mt-12 text-center">
                        <button 
                            onClick={() => navigate('/inventory')} 
                            className="bg-slate-900 hover:bg-red-600 text-white font-bold py-4 px-12 rounded-full transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-3"
                        >
                            <Car size={20} />
                            {t('Explore Full Inventory', '浏览全部库存')}
                        </button>
                    </div>
                </div>
            </section>

            {/* ========== CTA SECTION ========== */}
            <section className="py-24 bg-gradient-to-r from-red-600 to-red-500 relative overflow-hidden">
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                        {t('Ready to Find Your Perfect Car?', '准备好找到您的理想座驾了吗？')}
                    </h2>
                    <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto">
                        {t(
                            'Visit our showroom to see our quality pre-owned vehicles. We speak English, Mandarin & Cantonese.',
                            '欢迎来店看车，中英粤语服务，现场验车更放心。'
                        )}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => navigate('/contact')}
                            className="bg-white text-red-600 font-bold py-4 px-10 rounded-full hover:bg-slate-100 transition-all shadow-xl flex items-center gap-2"
                        >
                            <MapPin size={20} />
                            {t('Visit Showroom', '到店看车')}
                        </button>
                        <a
                            href={`tel:${SALES_PHONE}`}
                            className="bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-10 rounded-full hover:bg-white/30 transition-all border border-white/30 flex items-center gap-2"
                        >
                            <Phone size={20} />
                            {SALES_PHONE_DISPLAY}
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
};

const AlphardHomePage = ({ cars }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const safeCars = cars || [];

    const alphardVellfireCount = safeCars.filter(car => {
        const searchStr = `${car.title} ${car.folderName}`.toLowerCase();
        return searchStr.includes('alphard') || searchStr.includes('vellfire');
    }).length;

    return (
        <>
            {/* ========== HERO ========== */}
            <header className="relative min-h-[88vh] bg-black overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="/stock/2024 Toyota Vellfire/cover.jpg"
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-25 grayscale contrast-125"
                    />
                    <img
                        src="/stock/2023 Toyota Alphard 2.5L/cover.jpg"
                        alt=""
                        className="absolute right-0 top-0 w-[60%] h-full object-cover opacity-18 grayscale contrast-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/50"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30"></div>
                </div>

                <div className="relative z-10 container mx-auto px-4 min-h-[85vh] flex items-center">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full py-24">
                        <div className="lg:col-span-7 space-y-8">
                            <span className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-200 text-xs font-bold uppercase tracking-[0.28em] px-4 py-2 rounded-full border border-amber-300/20">
                                <Award size={14} />
                                {t('Executive MPV Atelier', '高端MPV定制馆')}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                                {t('Alphard & Vellfire', '埃尔法 / 威尔法')}
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-red-400">
                                    {t('Executive Lounge Collection', '行政贵宾专属')}
                                </span>
                            </h1>
                            <p className="text-lg text-white/70 leading-relaxed">
                                {t(
                                    `Curated Alphard & Vellfire inventory with ${alphardVellfireCount}+ vehicles in stock. Discreet service, verified condition, and private viewing.`,
                                    `精选埃尔法 / 威尔法现车，${alphardVellfireCount}+ 台库存。私密看车、车况可溯、服务专业。`
                                )}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => navigate('/inventory')}
                                    className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-4 px-8 rounded-full transition-all shadow-lg shadow-amber-400/30"
                                >
                                    {t('View Collection', '查看专属车源')}
                                </button>
                                <button
                                    onClick={() => navigate('/contact')}
                                    className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-full border border-white/20 transition-all"
                                >
                                    {t('Private Appointment', '预约私享看车')}
                                </button>
                            </div>
                        </div>
                        <div className="lg:col-span-5">
                            <div className="bg-white/10 border border-white/15 rounded-3xl p-6 backdrop-blur-xl">
                                <div className="flex items-center justify-between mb-6">
                                    <p className="text-xs text-white/60 uppercase tracking-[0.2em]">{t('Executive Metrics', '专属数据')}</p>
                                    <span className="text-amber-200 text-xs font-bold">{t('Verified', '已认证')}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: t('In Stock', '现车'), value: `${alphardVellfireCount}+` },
                                        { label: t('Executive Spec', '高配车型'), value: t('Curated', '精选') },
                                        { label: t('Aftercare', '售后保障'), value: t('Concierge', '管家式') },
                                        { label: t('Inspection', '检测'), value: t('Certified', '认证') },
                                    ].map((item) => (
                                        <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white">
                                            <p className="text-xs text-white/60 font-semibold uppercase tracking-[0.2em]">{item.label}</p>
                                            <p className="text-2xl font-black mt-2">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 border-t border-white/10 pt-4 text-white/70 text-sm">
                                    {t('Private showroom appointments available daily.', '可预约私享看车，支持每日到店。')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ========== SIGNATURE SERVICES ========== */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-4">
                            <h2 className="text-3xl font-black text-slate-900 mb-4">
                                {t('Signature Services', '尊享服务')}
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                {t('A refined experience built around executive MPV ownership.', '围绕高端MPV车主打造的尊享体验。')}
                            </p>
                        </div>
                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { title: t('Concierge Delivery', '管家式交付'), desc: t('Private handover, tailored setup.', '私享交付，专属设置。') },
                                { title: t('Certified Condition', '车况认证'), desc: t('Full inspection with documented history.', '全项检测，历史透明。') },
                                { title: t('Aftercare Plan', '售后计划'), desc: t('Service reminders and priority booking.', '保养提醒，优先预约。') },
                            ].map((item) => (
                                <div key={item.title} className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== INVENTORY PREVIEW ========== */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
                        <div>
                            <span className="inline-block bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-4">
                                {t('Curated Inventory', '精选车源')}
                            </span>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                                {t('Executive Lounge Highlights', '行政贵宾精选')}
                            </h2>
                        </div>
                        <button
                            onClick={() => navigate('/inventory')}
                            className="text-slate-900 font-bold hover:text-red-600 transition-colors flex items-center gap-2"
                        >
                            {t('View All Inventory', '查看全部现车')}
                            <ArrowRight size={18} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {safeCars.slice(0, 6).map(car => <CarCard key={car.id} car={car} />)}
                    </div>
                </div>
            </section>

            {/* ========== SERVICE CTA ========== */}
            <section className="py-20 bg-gradient-to-r from-black via-slate-950 to-slate-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-2xl md:text-3xl font-black mb-3">
                                {t('Concierge Service & Aftercare', '尊享管家式服务')}
                            </h3>
                            <p className="text-white/70 text-lg">
                                {t('Sales, service, and aftercare tailored for Alphard/Vellfire owners.', '为埃尔法/威尔法车主提供购车、保养与售后一体化服务。')}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => navigate('/contact')}
                                className="bg-amber-300 text-slate-900 font-bold py-3 px-6 rounded-full hover:bg-amber-200 transition-colors"
                            >
                                {t('Talk to Us', '立即咨询')}
                            </button>
                            <a
                                href={`tel:${SALES_PHONE}`}
                                className="bg-white/10 border border-white/30 text-white font-bold py-3 px-6 rounded-full hover:bg-white/20 transition-colors"
                            >
                                {t('Call Sales', '致电销售')}
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

const InventoryPage = ({ cars, category }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [visibleCount, setVisibleCount] = useState(12);
    
    const safeCars = cars || [];

    // 实际应用的筛选条件
    const [appliedFilters, setAppliedFilters] = useState({
        keyword: '',
        brand: '',
        yearFrom: '',
        priceRange: '',
        sortBy: 'newest'
    });
    // 临时筛选条件 (用户正在修改的)
    const [tempFilters, setTempFilters] = useState({
        keyword: '',
        brand: '',
        yearFrom: '',
        priceRange: '',
        sortBy: 'newest'
    });

    // 当 URL 变化时更新筛选条件
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const newFilters = {
            keyword: params.get('q') || '',
            brand: category === 'toyota' ? 'Toyota' : (params.get('brand') || ''),
            yearFrom: params.get('yearFrom') || '',
            priceRange: params.get('price') || '',
            sortBy: params.get('sort') || 'newest'
        };
        setAppliedFilters(newFilters);
        setTempFilters(newFilters);
    }, [location.search, category]);
    
    // 价格区间定义
    const priceRanges = [
        { min: 0, max: Infinity },      // 0: Any
        { min: 0, max: 30000 },         // 1: Under $30k
        { min: 30000, max: 60000 },     // 2: $30k-$60k
        { min: 60000, max: 100000 },    // 3: $60k-$100k
        { min: 100000, max: Infinity }, // 4: $100k+
    ];

    // 使用 appliedFilters 应用筛选（只有点击 Search 后才会更新）
    let filteredCars = safeCars.filter(car => {
        // 特殊处理：Alphard/Vellfire 页面
        if (category === 'toyota') {
            const searchStr = `${car.title || ''} ${car.folderName || ''}`.toLowerCase();
            if (!searchStr.includes('alphard') && !searchStr.includes('vellfire')) {
                return false;
            }
            // Toyota 页面不需要再筛选品牌
            // 但仍然可以筛选年份和价格
        }
        
        // 品牌筛选（非 Toyota 页面）
        if (appliedFilters.brand && category !== 'toyota') {
            const carBrand = getBrandFromTitle(car.title);
            // 确保品牌匹配（忽略大小写）
            if (!carBrand || carBrand.toLowerCase() !== appliedFilters.brand.toLowerCase()) {
                return false;
            }
        }
        
        // 年份筛选
        if (appliedFilters.yearFrom) {
            const yearFrom = parseInt(appliedFilters.yearFrom);
            if (!isNaN(yearFrom) && car.year < yearFrom) {
                return false;
            }
        }
        
        // 价格筛选
        if (appliedFilters.priceRange) {
            const rangeIndex = parseInt(appliedFilters.priceRange);
            const range = priceRanges[rangeIndex];
            if (range) {
                const carPrice = car.price || 0;
                if (carPrice < range.min || carPrice >= range.max) {
                    return false;
                }
            }
        }

        // 关键词筛选（标题/描述/参数/配置）
        if (appliedFilters.keyword && appliedFilters.keyword.trim()) {
            const q = appliedFilters.keyword.trim().toLowerCase();
            const hay = [
                car.title,
                car.description,
                car.engine,
                car.transmission,
                car.fuel,
                car.color,
                car.location,
                Array.isArray(car.features) ? car.features.join(' ') : '',
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            if (!hay.includes(q)) return false;
        }
        
        return true;
    });

    // 排序
    filteredCars = [...filteredCars].sort((a, b) => {
        switch (appliedFilters.sortBy) {
            case 'newest': return b.year - a.year;
            case 'oldest': return a.year - b.year;
            case 'price-low': return a.price - b.price;
            case 'price-high': return b.price - a.price;
            case 'mileage-low': return (a.mileage || 0) - (b.mileage || 0);
            default: return 0;
        }
    });

    // 点击 Search 按钮时应用筛选
    const handleSearch = () => {
        // 构建 URL 参数
        const params = new URLSearchParams();
        if (tempFilters.keyword && tempFilters.keyword.trim()) params.set('q', tempFilters.keyword.trim());
        if (tempFilters.brand && category !== 'toyota') params.set('brand', tempFilters.brand);
        if (tempFilters.yearFrom) params.set('yearFrom', tempFilters.yearFrom);
        if (tempFilters.priceRange) params.set('price', tempFilters.priceRange);
        if (tempFilters.sortBy && tempFilters.sortBy !== 'newest') params.set('sort', tempFilters.sortBy);
        
        // 更新 URL（这会触发 useEffect 来更新 appliedFilters）
        const basePath = category === 'toyota' ? '/brands/alphard-vellfire' : '/inventory';
        const queryString = params.toString();
        navigate(queryString ? `${basePath}?${queryString}` : basePath);
    };

    // 重置筛选
    const handleReset = () => {
        const defaultFilters = {
            keyword: '',
            brand: category === 'toyota' ? 'Toyota' : '',
            yearFrom: '',
            priceRange: '',
            sortBy: 'newest'
        };
        setTempFilters(defaultFilters);
        const basePath = category === 'toyota' ? '/brands/alphard-vellfire' : '/inventory';
        navigate(basePath);
    };

    // 页面标题
    let pageTitle = t('Buy a Car', '选购车辆');
    let pageDesc = t('Browse our selection of quality pre-owned vehicles.', '浏览我们精选的优质二手车。');

    if (category === 'toyota') {
        pageTitle = t('Toyota Alphard & Vellfire', '丰田埃尔法 / 威尔法');
        pageDesc = t('Alphard/Vellfire showcase · Focused premium MPV selection.', '埃尔法/威尔法 专题页 · 更聚焦、更高端的 MPV 选择');
    } else if (appliedFilters.brand) {
        pageTitle = `${appliedFilters.brand} — ${t('Buy a Car', '选购车辆')}`;
        pageDesc = t(`Browse our ${appliedFilters.brand} collection`, `浏览 ${appliedFilters.brand} 车型集合`);
    }

    const displayedCars = filteredCars.slice(0, visibleCount);

    // 统计信息
    const avgPrice = filteredCars.length > 0 
        ? Math.round(filteredCars.reduce((sum, car) => sum + (car.price || 0), 0) / filteredCars.length) 
        : 0;

    // 获取活跃筛选标签
    const getActiveFilterTags = () => {
        const tags = [];
        if (appliedFilters.keyword && appliedFilters.keyword.trim()) {
            tags.push({ key: 'q', label: `${t('Search', '搜索')}: ${appliedFilters.keyword.trim()}`, color: 'slate' });
        }
        if (appliedFilters.brand && category !== 'toyota') {
            tags.push({ key: 'brand', label: appliedFilters.brand, color: 'red' });
        }
        if (appliedFilters.yearFrom) {
            tags.push({ key: 'year', label: `${appliedFilters.yearFrom}+`, color: 'blue' });
        }
        if (appliedFilters.priceRange) {
            const priceLabels = [
                '',
                t('Under $30k', '3万以下'),
                t('$30k-$60k', '3万-6万'),
                t('$60k-$100k', '6万-10万'),
                t('$100k+', '10万以上'),
            ];
            tags.push({ key: 'price', label: priceLabels[appliedFilters.priceRange], color: 'green' });
        }
        return tags;
    };

    const activeTags = getActiveFilterTags();

    const isToyotaPage = category === 'toyota';
    const basePath = isToyotaPage ? '/brands/alphard-vellfire' : '/inventory';

    const removeFilter = (key) => {
        const params = new URLSearchParams(location.search);
        if (key === 'brand') params.delete('brand');
        if (key === 'year') params.delete('yearFrom');
        if (key === 'price') params.delete('price');
        if (key === 'sort') params.delete('sort');
        if (key === 'q') params.delete('q');
        const queryString = params.toString();
        navigate(queryString ? `${basePath}?${queryString}` : basePath);
    };

    return (
        <div className="min-h-screen bg-transparent pb-20">
            {/* Header */}
            <div
                className={`text-white pt-20 pb-32 relative overflow-hidden ${
                    isToyotaPage
                        ? "bg-gradient-to-br from-black via-slate-950 to-slate-900"
                        : "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800"
                }`}
            >
                {/* Decorative elements */}
                <div className="absolute inset-0">
                    {/* Business background car images (subtle & replaceable later) */}
                    {isToyotaPage ? (
                        <>
                            <img
                                src="/stock/2024 Toyota Vellfire/cover.jpg"
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover opacity-12 grayscale contrast-110"
                            />
                            <img
                                src="/stock/2023 Toyota Alphard 2.5L/cover.jpg"
                                alt=""
                                className="absolute right-0 top-0 w-[55%] h-full object-cover opacity-08 grayscale contrast-110"
                            />
                        </>
                    ) : (
                        <>
                            <img
                                src="/stock/2024 Toyota Vellfire/cover.jpg"
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale contrast-110"
                            />
                            <img
                                src="/stock/2023 Toyota Alphard 2.5L/cover.jpg"
                                alt=""
                                className="absolute right-0 top-0 w-[55%] h-full object-cover opacity-07 grayscale contrast-110"
                            />
                        </>
                    )}

                    {/* Overlays for readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/30"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/35"></div>
                </div>
                <div className="absolute top-0 left-0 w-64 h-64 bg-red-600/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
                
                <div className="relative z-10 container mx-auto px-4 text-center">
                    {isToyotaPage && (
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                        <span className="text-xs font-bold tracking-widest uppercase text-white/90">{t('Brand Showcase', '品牌专题')}</span>
                        <span className="text-xs text-white/60">|</span>
                        <span className="text-xs text-white/80">{t('Alphard / Vellfire', '埃尔法 / 威尔法')}</span>
                    </div>
                    )}
                    <h1 className="text-4xl md:text-6xl font-black mb-4">{pageTitle}</h1>
                    <p className="text-white/70 max-w-3xl mx-auto text-lg leading-relaxed">{pageDesc}</p>
                    {isToyotaPage && (
                        <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm">
                            <span className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white/90 font-semibold">
                                {filteredCars.length} {t('Available', '在库')}
                            </span>
                            <span className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white/90 font-semibold">
                                {t('Alphard/Vellfire Specialist', '埃尔法/威尔法 专家')}
                            </span>
                            <span className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white/90 font-semibold">
                                {t('Service & Repairs', '保养维修')}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Toyota 专题页：增加一个专题介绍区，和 Buy a Car 形成“独立页面”感 */}
            {isToyotaPage && (
                <div className="container mx-auto px-4 -mt-14 relative z-10 mb-8">
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl shadow-black/10 p-6 md:p-10">
                        <div className="grid md:grid-cols-12 gap-8 items-center">
                            <div className="md:col-span-7 space-y-4">
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                                    {t(
                                        'Focused Alphard & Vellfire premium inventory',
                                        '专注 埃尔法 / 威尔法 的精品现车'
                                    )}
                                </h2>
                                <p className="text-slate-600 leading-relaxed">
                                    {t(
                                        'This dedicated brand page shows only Alphard/Vellfire stock to help customers decide faster for family or business use.',
                                        '这里是独立的品牌专题页：只展示 埃尔法 / 威尔法 库存，方便客户快速做决定（家庭/商务两相宜）。'
                                    )}
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                                    {[
                                        { k: "Executive Seats", v: "行政座椅" },
                                        { k: "Power Doors", v: "双侧电滑门" },
                                        { k: "Premium Audio", v: "JBL/Bose 等" },
                                        { k: "Safety Suite", v: "安全系统" },
                                    ].map((x) => (
                                        <div key={x.k} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t(x.k, x.v)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="md:col-span-5">
                                <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-lg">
                                    <img
                                        src="/stock/2024 Toyota Vellfire/cover.jpg"
                                        alt={t('Alphard / Vellfire showcase', '埃尔法 / 威尔法展示')}
                                        className="w-full h-64 md:h-72 object-cover"
                                    />
                                </div>
                                <div className="mt-4 flex gap-3">
                                    <button
                                        onClick={() => navigate('/contact')}
                                        className="flex-1 bg-slate-900 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors"
                                    >
                                        {t('Enquire Now', '立即咨询')}
                                    </button>
                                    <a
                                        href={`tel:${SALES_PHONE}`}
                                        className="flex-1 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold py-3 rounded-xl transition-colors text-center"
                                    >
                                        {t('Call Sales', '致电销售')}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Section */}
            <div className={`container mx-auto px-4 relative z-10 mb-8 ${isToyotaPage ? "" : "-mt-16"}`}>
                <InventoryFilterWidget 
                    tempFilters={tempFilters}
                    setTempFilters={setTempFilters}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    cars={safeCars}
                    resultCount={filteredCars.length}
                    isToyotaCategory={isToyotaPage}
                />
            </div>

            {/* Results */}
            <div className="container mx-auto px-4">
                {/* Stats Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 py-4 px-6 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-black text-slate-900">{filteredCars.length}</span>
                            <span className="text-slate-500 font-medium">{t('vehicles', '车辆')}</span>
                        </div>
                        {filteredCars.length > 0 && (
                            <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm border-l border-slate-200 pl-4">
                                <DollarSign size={14} />
                                <span>{t('Avg.', '均价')} ${avgPrice.toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Active Filters Tags */}
                    {activeTags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-400 font-medium">{t('Active filters:', '当前筛选:')}</span>
                            {activeTags.map(tag => (
                                <span
                                    key={tag.key}
                                    className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 ${
                                        tag.color === 'red' ? 'bg-red-100 text-red-700' :
                                        tag.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                        tag.color === 'green' ? 'bg-emerald-100 text-emerald-700' :
                                        'bg-slate-100 text-slate-700'
                                    }`}
                                >
                                    {tag.label}
                                    <button
                                        type="button"
                                        onClick={() => removeFilter(tag.key)}
                                        className="opacity-70 hover:opacity-100 transition-opacity"
                                        aria-label={`Remove filter ${tag.label}`}
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                            <button 
                                onClick={handleReset}
                                className="text-xs text-slate-500 hover:text-red-600 font-medium underline underline-offset-2"
                            >
                                {t('Clear all', '清空')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Results Grid */}
                {filteredCars.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                        <Car size={64} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-xl text-slate-500 mb-2">{t('No vehicles found', '未找到车辆')}</p>
                        <p className="text-slate-400 mb-6">{t('Try adjusting your filters', '请调整筛选条件')}</p>
                        <button 
                            onClick={handleReset}
                            className="bg-red-600 text-white font-bold py-3 px-8 rounded-full hover:bg-red-700 transition-colors"
                        >
                            {t('Clear all filters', '清除筛选')}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {displayedCars.map(car => <CarCard key={car.id} car={car} />)}
                        </div>
                        
                        {/* Load More */}
                        {visibleCount < filteredCars.length && (
                            <div className="text-center">
                                <p className="text-slate-400 text-sm mb-4">
                                    {t('Showing', '已显示')} {displayedCars.length} {t('of', '/')} {filteredCars.length} {t('vehicles', '车辆')}
                                </p>
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 9)}
                                    className="bg-white border-2 border-slate-200 text-slate-900 font-bold py-3 px-10 rounded-full hover:border-red-600 hover:text-red-600 transition-colors shadow-sm"
                                >
                                    {t('Load More Vehicles', '加载更多车辆')}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const CarDetailPage = ({ cars }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const safeCars = cars || [];
    const car = safeCars.find(c => c.id === parseInt(id));
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const from = typeof location.state?.from === 'string' ? location.state.from : null;
    const backTarget = from || '/inventory';

    if (!car) {
        return (
            <div className="p-20 text-center">
                <h2 className="text-2xl font-bold mb-4">{t('Car Not Found', '未找到车辆')}</h2>
                <button onClick={() => navigate(backTarget)} className="text-red-600 font-bold hover:underline">
                    {t('Return to Results', '返回结果')}
                </button>
            </div>
        );
    }

    const galleryImages = getCarImage(car.folderName, car.imageCount, 'gallery', car);
    const activeImage = galleryImages[currentImageIndex] || "https://images.unsplash.com/photo-1600661653561-629509216228?auto=format&fit=crop&q=80&w=1000";

    const nextImage = () => { if (galleryImages.length <= 1) return; setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1)); };
    const prevImage = () => { if (galleryImages.length <= 1) return; setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1)); };

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            <div className="bg-white border-b border-slate-200 sticky top-[80px] z-30 shadow-sm/50">
                <div className="container mx-auto px-4 py-4">
                    <button onClick={() => navigate(backTarget)} className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-medium transition-colors text-sm">
                        <ArrowLeft size={16} /> {t('Back to Results', '返回结果')}
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="relative aspect-[16/10] bg-black rounded-3xl overflow-hidden shadow-lg group">
                            <img src={activeImage} alt={car.title} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1600661653561-629509216228?auto=format&fit=crop&q=80&w=1000"; }} className="w-full h-full object-contain" />
                            {galleryImages.length > 1 && <>
                                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white text-white hover:text-black p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"><ChevronLeft size={24} /></button>
                                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white text-white hover:text-black p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"><ChevronRight size={24} /></button>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur text-white text-xs px-4 py-1.5 rounded-full font-medium tracking-widest">{currentImageIndex + 1} / {galleryImages.length}</div>
                            </>}
                        </div>
                        {galleryImages.length > 1 && <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">{galleryImages.map((img, idx) => (<button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all relative ${currentImageIndex === idx ? 'border-red-600 ring-2 ring-red-100' : 'border-transparent opacity-60 hover:opacity-100'}`}><img src={img} alt="thumb" className="w-full h-full object-cover" /></button>))}</div>}
                        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Info size={20} className="text-red-600" /> {t('Vehicle Overview', '车辆概览')}
                            </h3>
                            <p className="text-slate-600 leading-8 mb-10">{car.description}</p>
                            {car.features && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                        {t('Key Features', '核心配置')}
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {car.features.map((f, i) => (
                                            <div key={i} className="flex items-center gap-3 text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100/50">
                                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                                <span className="text-sm font-semibold">{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
                        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                            <div className="mb-8 pb-8 border-b border-slate-100">
                                <div className="flex items-center gap-2 mb-4"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${car.status === 'In Stock' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{car.status}</span><span className="text-slate-400 text-xs font-bold flex items-center gap-1"><MapPin size={12} /> {car.location || "Homebush"}</span></div>
                                <h1 className="text-2xl font-bold text-slate-900 mt-3 mb-2 leading-tight">{car.title}</h1>
                                <div className="flex items-baseline gap-2"><p className="text-4xl font-bold text-red-700">${(car.price || 0).toLocaleString()}</p></div>
                                <p className="text-xs text-slate-400 font-medium mt-1">
                                    {t('Excluding Government Charges', '不含政府费用')}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {[
                                    { l: t('Year', '年份'), v: car.year },
                                    { l: t('Mileage', '里程'), v: `${(car.mileage || 0).toLocaleString()} km` },
                                    { l: t('Engine', '发动机'), v: car.engine || t('N/A', '无') },
                                    { l: t('Transmission', '变速箱'), v: car.transmission || t('Auto', '自动') },
                                    { l: t('Fuel', '燃料'), v: car.fuel || t('N/A', '无') },
                                    { l: t('Seats', '座位'), v: car.seats || t('N/A', '无') },
                                ].map((item, i) => (
                                    <div key={i} className="bg-slate-50 p-3 rounded-xl">
                                        <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">{item.l}</span>
                                        <span className="font-bold text-slate-900 text-sm truncate block" title={item.v}>{item.v}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4">
                                <button onClick={() => navigate('/contact')} className="w-full bg-red-700 text-white font-bold py-4 rounded-xl hover:bg-red-800 transition-all shadow-lg shadow-red-700/20 active:scale-95">
                                    {t('Enquire Now', '立即咨询')}
                                </button>
                                <a href={`tel:${SALES_PHONE}`} className="w-full border-2 border-slate-200 text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 active:scale-95">
                                    <Phone size={20} className="text-red-600" /> {t('Call Sales', '致电销售')}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- About Page ---
const AboutPage = () => {
    const { t } = useLanguage();
    return (
    <div className="min-h-screen bg-white">
        {/* Hero w/ Background (SilkProperty-like) */}
        <header className="relative overflow-hidden">
            <div className="absolute inset-0">
                <img
                    src="/stock/20 Mercedes G63/cover.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "/stock/18 Ford Mustang GT 5.0/cover.jpg"; }}
                />
                <div className="absolute inset-0 bg-black/55"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/40"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-24 md:py-32 text-center text-white">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                    <span className="text-xs font-black tracking-widest uppercase">{t('About', '关于')}</span>
                    <span className="text-xs text-white/60">·</span>
                    <span className="text-xs text-white/80">{t('Alphard & Vellfire Specialist', '埃尔法 / 威尔法 专家')}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight">{BRAND_NAME} Pty Ltd</h1>
                <p className="text-white/75 mt-5 max-w-3xl mx-auto text-lg leading-relaxed">
                    {t('Specialist in Toyota Alphard & Vellfire · Sales · Service · Repairs', '日本 丰田埃尔法 / 威尔法 专业车行｜销售 · 保养 · 维修 一站式服务')}
                </p>
            </div>
        </header>

        <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="max-w-5xl mx-auto">
                <div className="grid lg:grid-cols-12 gap-10 items-start">
                    <div className="lg:col-span-7">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">{t('About us', '公司简介')}</h2>
                        <p className="text-lg text-slate-600 leading-8">
                            {t(
                                `${BRAND_NAME} Pty Ltd is a professional pre-owned vehicle dealer in Homebush, Sydney, NSW. We specialize in Japanese parallel imports such as Toyota Alphard and Vellfire, offering a complete journey from selection and purchase to long-term service.`,
                                `${BRAND_NAME} Pty Ltd 是一家位于澳洲新南威尔士州悉尼 Homebush 的专业二手车买卖经销商，多年来专注于日本平行进口 丰田埃尔法与威尔法，致力于为客户提供从选车、购车到后续保养维修的完整用车解决方案。`
                            )}
                        </p>
                        <p className="text-slate-500 leading-8 mt-5">
                            {t(
                                'We understand Alphard and Vellfire owners value comfort, stability, and long-term ownership experience, so we focus on service quality beyond the sale.',
                                '我们深知 Alphard 与 Vellfire 车主对舒适度、稳定性与后期用车体验的要求，因此不只卖车，更重视「买后十年」的服务品质。'
                            )}
                        </p>
                        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { k: t('Specialist', '专注'), v: t('Alphard / Vellfire specialist', '埃尔法 / 威尔法 专门店') },
                                { k: t('Import', '进口'), v: t('Parallel imports from Japan', '日本平行进口') },
                                { k: t('Service', '服务'), v: t('Sales · Service · Repairs', '保养 · 维修一站式') },
                                { k: t('Support', '保障'), v: t('Long-term ownership support', '长期用车管理') },
                            ].map((x) => (
                                <div key={x.k} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">{x.k}</p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">{x.v}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 grid md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                                <h3 className="text-lg font-black text-slate-900 mb-4">{t('🚙 Vehicle sourcing & standards', '🚙 车辆来源与选品标准')}</h3>
                                <ul className="space-y-3 text-slate-600 leading-7">
                                    <li className="flex gap-3"><span className="text-emerald-600 font-black">•</span><span>{t('🇯🇵 Direct sourcing from Japan with clear origins', '🇯🇵 日本直采进口，来源清晰')}</span></li>
                                    <li className="flex gap-3"><span className="text-emerald-600 font-black">•</span><span>{t('🔍 Strict condition checks, no accident or flood cars', '🔍 严选车况，拒绝事故车 / 水泡车')}</span></li>
                                    <li className="flex gap-3"><span className="text-emerald-600 font-black">•</span><span>{t('📋 Full documentation with transparent disclosures', '📋 提供完整车辆资料与透明说明')}</span></li>
                                </ul>
                            </div>
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                                <h3 className="text-lg font-black text-slate-900 mb-4">{t('🔧 One-stop after-sales service', '🔧 一站式售后服务体系')}</h3>
                                <p className="text-slate-600 leading-7 mb-4">
                                    {t("We're not just a dealer — we manage your long-term ownership journey.", '我们不只是车商，而是你的长期用车管理中心。')}
                                </p>
                                <ul className="space-y-3 text-slate-600 leading-7">
                                    <li className="flex gap-3"><span className="text-emerald-600 font-black">•</span><span>{t('In-house/partner service centers for regular maintenance and repairs', '自有 / 合作保养中心 & 修理场：定期保养、机械维修')}</span></li>
                                    <li className="flex gap-3"><span className="text-emerald-600 font-black">•</span><span>{t('Deep expertise in Alphard/Vellfire structure and common issues', '熟悉 埃尔法 / 威尔法 结构与常见问题')}</span></li>
                                    <li className="flex gap-3"><span className="text-emerald-600 font-black">•</span><span>{t('Dedicated after-sales support with long-term planning advice', '专人售后跟进：一对一用车顾问、长期规划建议')}</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden">
                            <div className="p-8">
                                <h3 className="text-xl font-black text-slate-900 mb-6">{t('⭐ Our positioning', '⭐ 我们的核心定位')}</h3>
                                <div className="space-y-4">
                                    {[
                                        { icon: Star, title: t('Alphard & Vellfire specialist', '埃尔法 / 威尔法 专门店'), titleCn: t('Premium MPV focus', '高端 MPV 专注'), desc: t('Focused selection and expert advice to help you choose faster.', '更聚焦的选品、更专业的建议，帮你更快做对选择。') },
                                        { icon: Truck, title: t('Premium MPV parallel imports', '日本平行进口高端 MPV 专卖'), titleCn: t('Clear sourcing', '来源清晰'), desc: t('Direct Japan sourcing with transparent documentation.', '日本直采进口，提供透明资料与清晰说明。') },
                                        { icon: Wrench, title: t('Sales · Service · Repairs', '买车 · 保养 · 维修 一站式完成'), titleCn: t('After-sales partner', '买后十年'), desc: t('From purchase to long-term maintenance planning.', '从购车到长期保养维修规划，持续陪伴你的用车周期。') },
                                    ].map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={item.title} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-red-600 shrink-0">
                                                    <Icon size={22} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900">{item.title}</p>
                                                    <p className="text-xs font-bold text-red-600 mt-0.5">{item.titleCn}</p>
                                                    <p className="text-sm text-slate-500 mt-2 leading-6">{item.desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-8 bg-slate-950 text-white rounded-2xl p-6">
                                    <h4 className="font-black text-white mb-4 flex items-center gap-2">
                                        <MapPin className="text-red-500" size={18} /> {t('Visit / Contact', '到店 / 联系')}
                                    </h4>
                                    <div className="space-y-3 text-sm text-white/80">
                                        <div className="flex items-start gap-3"><span className="text-white/50">{t('Showroom', '展厅')}</span><span className="font-semibold text-white">{SHOWROOM_ADDRESS}</span></div>
                                        <div className="flex items-start gap-3"><span className="text-white/50">{t('Service', '服务')}</span><span className="font-semibold text-white">{SERVICE_ADDRESS}</span></div>
                                        <div className="flex items-start gap-3"><span className="text-white/50">{t('Phone', '电话')}</span><a className="font-semibold text-white hover:text-red-300" href={`tel:${SALES_PHONE}`}>{SALES_PHONE_DISPLAY}</a></div>
                                        <div className="flex items-start gap-3"><span className="text-white/50">{t('WeChat', '微信')}</span><span className="font-semibold text-white">{WECHAT_ID}</span></div>
                                        <div className="flex items-start gap-3"><span className="text-white/50">{t('Hours', '营业时间')}</span><span className="font-semibold text-white">{t('Daily', '每天')} 10:00 – 5:30</span></div>
                                    </div>
                                </div>
                                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                    <Link to="/inventory" className="flex-1 bg-slate-900 hover:bg-black text-white font-black py-3 rounded-xl text-center transition-colors">
                                        {t('View Inventory', '查看库存')}
                                    </Link>
                                    <Link to="/contact" className="flex-1 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-900 font-black py-3 rounded-xl text-center transition-colors">
                                        {t('Contact Us', '联系我们')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

// --- Contact Page ---
const ContactPage = () => {
    const { t } = useLanguage();

    return (
    <div className="min-h-screen bg-slate-50">
        {/* Hero w/ Background (SilkProperty-like) */}
        <header className="relative overflow-hidden">
            <div className="absolute inset-0">
                <img
                    src="/stock/18 Ford Mustang GT 5.0/cover.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "/stock/20 Mercedes G63/cover.jpg"; }}
                />
                <div className="absolute inset-0 bg-black/55"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/40"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-24 md:py-32 text-center text-white">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                    <span className="text-xs font-black tracking-widest uppercase">{t('Contact', '联系')}</span>
                    <span className="text-xs text-white/60">·</span>
                    <span className="text-xs text-white/80">{t('Get in touch', '联系我们')}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight">{t('Contact Us', '联系我们')}</h1>
                <p className="text-white/75 mt-5 max-w-3xl mx-auto text-lg leading-relaxed">
                    {t('Homebush showroom · Clyde service center · Alphard/Vellfire specialist support', 'Homebush 展馆看车 · Clyde 保养维修中心 · 埃尔法/威尔法 专业支持')}
                </p>
            </div>
        </header>

        <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{t('Send a Message', '发送消息')}</h3>
                    <p className="text-slate-500 mb-8">{t("We'll respond as soon as possible.", '我们会尽快回复。')}</p>
                    <form className="space-y-6" action={CONTACT_FORM_ACTION} method="POST">
                        <input type="hidden" name="_subject" value={t('[BEST AUTO] New contact enquiry', '[BEST AUTO] 新联系咨询')} />
                        <input type="hidden" name="_captcha" value="false" />
                        <input type="hidden" name="_template" value="table" />
                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-2">{t('Full Name', '姓名')}</label>
                            <input name="name" required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all" placeholder={t('John Doe', '张三')} />
                        </div>
                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-2">{t('Phone Number', '联系电话')}</label>
                            <input name="phone" required type="tel" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all" placeholder="0400 000 000" />
                        </div>
                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-2">{t('Your Enquiry', '咨询内容')}</label>
                            <textarea name="message" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 outline-none h-40 resize-none" placeholder={t("I'm interested in...", '我想咨询...')} ></textarea>
                        </div>
                        <button className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-red-700 transition-colors shadow-lg">
                            {t('Send Message', '发送')}
                        </button>
                    </form>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <a href={`tel:${SALES_PHONE}`} className="bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-900 font-black py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                            <Phone size={18} className="text-red-600" /> {t('Call Sales:', '销售电话:')} {SALES_PHONE_DISPLAY}
                        </a>
                        <a href={`tel:${SERVICE_PHONE}`} className="bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-900 font-black py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                            <Wrench size={18} className="text-red-600" /> {t('Service:', '保养:')} {SERVICE_PHONE_DISPLAY}
                        </a>
                    </div>
                </div>

                <div className="space-y-8">
                    {[
                        { name: t('Best Auto Showroom (Homebush)', 'Best Auto 展厅（Homebush）'), address: SHOWROOM_ADDRESS, map: `https://www.google.com/maps?q=${encodeURIComponent(SHOWROOM_ADDRESS)}&output=embed`, note: t(`Phone/WeChat: ${WECHAT_ID} · ${SALES_PHONE_DISPLAY}`, `电话/微信: ${WECHAT_ID} · ${SALES_PHONE_DISPLAY}`) },
                        { name: t('Best Auto Service Centre (Clyde)', 'Best Auto 维修中心（Clyde）'), address: SERVICE_ADDRESS, map: `https://www.google.com/maps?q=${encodeURIComponent(SERVICE_ADDRESS)}&output=embed`, note: t(`Service: ${SERVICE_PHONE_DISPLAY}`, `服务: ${SERVICE_PHONE_DISPLAY}`) },
                    ].map((loc, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                            <h4 className="font-black text-slate-900 mb-3 flex items-center gap-2 text-lg">
                                <MapPin className="text-red-600" /> {loc.name}
                            </h4>
                            <p className="text-slate-500 mb-2 ml-8 text-sm">{loc.address}</p>
                            <p className="text-slate-400 mb-4 ml-8 text-xs">{loc.note}</p>
                            <div className="h-48 bg-slate-200 rounded-2xl overflow-hidden relative">
                                <iframe src={loc.map} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"></iframe>
                            </div>
                        </div>
                    ))}

                    <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
                        <h4 className="font-black mb-6 flex items-center gap-3 text-lg">
                            <Clock className="text-red-500" /> {t('Opening Hours', '营业时间')}
                        </h4>
                        <div className="space-y-4 text-sm text-slate-300">
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span>{t('Everyday', '每天')}</span><span className="font-black text-white">{t('10:00 AM - 5:30 PM', '10:00 - 17:30')}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-white/70">{t('WeChat', '微信')}</span><span className="font-black text-white">{WECHAT_ID}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

// --- Simple Pages ---
const SellPage = () => {
    const { t } = useLanguage();
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center p-12 bg-white rounded-3xl shadow-xl max-w-2xl mx-4">
                <DollarSign size={64} className="mx-auto text-slate-300 mb-6" />
                <h1 className="text-4xl font-bold text-slate-900 mb-4">{t('Sell Your Car', '卖车')}</h1>
                <p className="text-lg text-slate-500 mb-8">
                    {t('Instant valuations coming soon. Please contact us directly for trade-in offers.', '即时估价即将上线，置换请直接联系我们。')}
                </p>
                <Link to="/contact" className="bg-slate-900 text-white font-bold py-4 px-10 rounded-xl hover:bg-slate-800 transition-colors">
                    {t('Contact Team', '联系团队')}
                </Link>
            </div>
        </div>
    );
};

// --- App Content ---
export function AppContent({ siteVariant = 'main' }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const { lang, t, toggleLang } = useLanguage();
    const { cars, source, setImportedCars, clearImportedCars } = useCarsData({ defaultCars: carsFromData });

    const stockFolderSet = useMemo(() => new Set(STOCK_FOLDERS), []);

    // 只保留本地 public/stock 里有 cover.jpg 的车型（避免“无图车型都用同一张默认图”）
    const carsWithLocalStock = useMemo(() => {
        const list = cars || [];
        return list.filter((car) => car?.folderName && stockFolderSet.has(car.folderName));
    }, [cars, stockFolderSet]);

    const brandCounts = useMemo(() => {
        return (carsWithLocalStock || []).reduce((acc, car) => {
            const b = getBrandFromTitle(car.title);
            if (!b) return acc;
            acc[b] = (acc[b] || 0) + 1;
            return acc;
        }, {});
    }, [carsWithLocalStock]);

    const topBrands = useMemo(() => {
        return Object.entries(brandCounts)
            .map(([brand, count]) => ({ brand, count }))
            .sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand))
            .slice(0, 10);
    }, [brandCounts]);

    useEffect(() => { setIsMenuOpen(false); }, [location]);

    const NavItem = ({ path, label, hasDropdown }) => (
        <div className="group relative h-full flex items-center">
            {hasDropdown ? (
                <button
                    type="button"
                    className="flex items-center gap-1.5 hover:text-red-600 transition-all font-bold text-sm tracking-wide text-slate-800"
                >
                    {label} <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                </button>
            ) : (
                <Link
                    to={path}
                    className={`flex items-center gap-1.5 hover:text-red-600 transition-all font-bold text-sm tracking-wide ${
                        location.pathname === path ? 'text-red-600' : 'text-slate-800'
                    }`}
                >
                    {label}
                </Link>
            )}
            {hasDropdown && (
                <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-slate-100 overflow-hidden w-72 p-2">
                        <div className="px-4 py-2">
                            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{t('Featured', '精选')}</p>
                        </div>
                        <a
                            href={ALPHARD_SITE_URL}
                            className="block w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-700 rounded-xl transition-colors"
                        >
                            {t('Alphard / Vellfire', '埃尔法 / 威尔法')} <span className="text-xs text-slate-400 font-semibold">· {t('MPV', 'MPV')}</span>
                        </a>
                        <div className="px-4 pt-4 pb-2">
                            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{t('Top brands', '热门品牌')}</p>
                        </div>
                        <div className="max-h-72 overflow-auto px-1 pb-2">
                            {topBrands.map(({ brand, count }) => (
                                <Link
                                    key={brand}
                                    to={`/inventory?brand=${encodeURIComponent(brand)}`}
                                    className="block w-full text-left px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors flex items-center justify-between"
                                >
                                    <span>{brand}</span>
                                    <span className="text-xs text-slate-400 font-bold">{count}</span>
                                </Link>
                            ))}
                        </div>
                        <div className="border-t border-slate-100 mt-1 pt-2 px-2">
                            <Link
                                to="/inventory"
                                className="block w-full text-center px-4 py-2 text-sm font-bold text-slate-900 hover:text-red-700 rounded-xl transition-colors"
                            >
                                {t('View all inventory', '查看全部库存')}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const isAlphardSite = siteVariant === 'alphard';

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-red-100 selection:text-red-900">
            <ScrollToTop />

            {/* Navbar (Make background solid to match logo white and reduce edge contrast) */}
            <nav className="sticky top-0 z-40 bg-white border-b border-slate-200/70 shadow-sm h-20 transition-all">
                <div className="container mx-auto px-4 h-full flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 cursor-pointer group">
                        <img src={LOGO_URL} alt="Logo" className="h-10 w-auto object-contain group-hover:opacity-80 transition-opacity" />
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-black text-slate-900 leading-none tracking-[0.22em] uppercase">{BRAND_NAME}</h1>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 h-full">
                        <NavItem path="/" label={t('HOME', '首页')} />
                        <NavItem path="/inventory" label={t('BUY A CAR', '选购车辆')} />
                        {!isAlphardSite && <NavItem path="#" label={t('OUR BRANDS', '品牌')} hasDropdown />}
                        {!isAlphardSite && <NavItem path="/sell" label={t('SELL YOUR CAR', '卖车')} />}
                        {!isAlphardSite && <NavItem path="/about" label={t('ABOUT', '关于我们')} />}
                        <NavItem path="/contact" label={t('CONTACT', '联系')} />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={toggleLang}
                            className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:text-red-600 hover:border-red-200 transition-colors"
                            aria-label={t('Switch language', '切换语言')}
                        >
                            <Globe size={16} />
                            {lang === 'zh' ? 'EN' : '中文'}
                        </button>
                        <button className="md:hidden p-2 text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 top-[80px] bg-white/95 backdrop-blur-xl z-30 p-6 flex flex-col gap-6 animate-in slide-in-from-right-10 overflow-y-auto border-t border-slate-100">
                    <Link to="/" className="text-2xl font-bold text-slate-900 tracking-tight">{t('HOME', '首页')}</Link>
                    <Link to="/inventory" className="text-2xl font-bold text-slate-900 tracking-tight">{t('BUY A CAR', '选购车辆')}</Link>
                    {!isAlphardSite && (
                        <div className="space-y-4 pl-4 border-l-4 border-red-500">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('OUR BRANDS', '品牌')}</p>
                            <a href={ALPHARD_SITE_URL} className="block text-lg font-bold text-slate-700">{t('Toyota Alphard', '丰田埃尔法')}</a>
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                {topBrands.slice(0, 6).map(({ brand }) => (
                                    <Link key={brand} to={`/inventory?brand=${encodeURIComponent(brand)}`} className="text-sm font-bold text-slate-600 hover:text-red-700">
                                        {brand}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                    {!isAlphardSite && <Link to="/sell" className="text-2xl font-bold text-slate-900 tracking-tight">{t('SELL YOUR CAR', '卖车')}</Link>}
                    {!isAlphardSite && <Link to="/about" className="text-2xl font-bold text-slate-900 tracking-tight">{t('ABOUT', '关于我们')}</Link>}
                    <Link to="/contact" className="text-2xl font-bold text-slate-900 tracking-tight">{t('CONTACT', '联系')}</Link>
                    <button
                        type="button"
                        onClick={toggleLang}
                        className="mt-4 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:text-red-600 hover:border-red-200 transition-colors"
                    >
                        <Globe size={16} />
                        {lang === 'zh' ? 'English' : '中文'}
                    </button>
                </div>
            )}

            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={isAlphardSite ? <AlphardHomePage cars={carsWithLocalStock} /> : <HomePage cars={carsWithLocalStock} />} />
                    <Route path="/inventory" element={<InventoryPage cars={carsWithLocalStock} />} />
                    <Route path="/brands/toyota" element={<InventoryPage cars={carsWithLocalStock} category="toyota" />} />
                    <Route path="/brands/alphard-vellfire" element={<InventoryPage cars={carsWithLocalStock} category="toyota" />} />
                    <Route path="/vehicle/:id" element={<CarDetailPage cars={carsWithLocalStock} />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/sell" element={<SellPage />} />
                    <Route path="/admin/import" element={<ImportPage source={source} onImport={setImportedCars} onClear={clearImportedCars} />} />
                </Routes>
            </main>

            <footer className="bg-slate-950 text-slate-400 pt-24 pb-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <img src={LOGO_URL} alt="Logo" className="h-8 w-auto brightness-0 invert opacity-90" />
                                <span className="font-black text-white tracking-[0.22em] text-lg uppercase">{BRAND_NAME}</span>
                            </div>
                            <p className="text-sm leading-7 text-slate-500">
                                {t(
                                    'Your trusted partner for premium pre-owned vehicles in Sydney. Quality cars, transparent pricing, and exceptional service since 2015.',
                                    '悉尼精品二手车值得信赖的伙伴。优质车源、透明定价与专业服务，始于 2015。'
                                )}
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"><Instagram size={18} /></a>
                                <a href="#" className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all"><Facebook size={18} /></a>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 tracking-widest text-xs uppercase">{t('Homebush Showroom', 'Homebush 展厅')}</h4>
                            <div className="space-y-4 text-sm">
                                <a href={`https://www.google.com/maps?q=${encodeURIComponent(SHOWROOM_ADDRESS)}`} target="_blank" rel="noreferrer" className="flex items-start gap-3 hover:text-white transition-colors group"><MapPin size={16} className="text-red-600 mt-1 group-hover:scale-110 transition-transform" /><span className="leading-relaxed">{SHOWROOM_ADDRESS}</span></a>
                                <a href={`tel:${SALES_PHONE}`} className="flex items-center gap-3 hover:text-white transition-colors group"><Phone size={16} className="text-red-600 group-hover:scale-110 transition-transform" /><span>{SALES_PHONE_DISPLAY}</span></a>
                                <p className="flex items-center gap-3"><MessageCircle size={16} className="text-red-600" /><span>{t('WeChat', '微信')}: {WECHAT_ID}</span></p>
                                <p className="flex items-center gap-3"><Clock size={16} className="text-red-600" /><span>{t('Daily', '每天')} 10:00 – 5:30</span></p>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 tracking-widest text-xs uppercase">{t('Clyde Service Centre', 'Clyde 服务中心')}</h4>
                            <div className="space-y-4 text-sm">
                                <a href={`https://www.google.com/maps?q=${encodeURIComponent(SERVICE_ADDRESS)}`} target="_blank" rel="noreferrer" className="flex items-start gap-3 hover:text-white transition-colors group"><MapPin size={16} className="text-red-600 mt-1 group-hover:scale-110 transition-transform" /><span className="leading-relaxed">{SERVICE_ADDRESS}</span></a>
                                <a href={`tel:${SERVICE_PHONE}`} className="flex items-center gap-3 hover:text-white transition-colors group"><Phone size={16} className="text-red-600 group-hover:scale-110 transition-transform" /><span>{SERVICE_PHONE_DISPLAY}</span></a>
                            </div>
                        </div>
                        {!isAlphardSite && (
                            <div>
                                <h4 className="text-white font-bold mb-6 tracking-widest text-xs uppercase">{t('Quick Links', '快速链接')}</h4>
                                <ul className="space-y-3 text-sm">
                                    {[
                                        { label: t('Home', '首页'), to: '/' },
                                        { label: t('Buy a Car', '选购车辆'), to: '/inventory' },
                                        { label: t('Toyota Alphard / Vellfire', '丰田埃尔法 / 威尔法'), to: ALPHARD_SITE_URL, external: true },
                                        { label: t('Sell Your Car', '卖车'), to: '/sell' },
                                        { label: t('About Us', '关于我们'), to: '/about' },
                                        { label: t('Contact', '联系'), to: '/contact' },
                                    ].map((item) => (
                                        <li key={item.to}>
                                            {item.external ? (
                                                <a href={item.to} className="hover:text-red-500 hover:translate-x-1 transition-all inline-block">
                                                    {item.label}
                                                </a>
                                            ) : (
                                                <Link to={item.to} className="hover:text-red-500 hover:translate-x-1 transition-all inline-block">
                                                    {item.label}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
                        <p>&copy; 2026 {BRAND_NAME}. {t('All rights reserved.', '保留所有权利。')}</p>
                        <div className="flex gap-8 hover:text-slate-400 transition-colors cursor-pointer">
                            <span>{t('Privacy Policy', '隐私政策')}</span>
                            <span>{t('Terms & Conditions', '条款与条件')}</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// --- Root App Component (Default Export) ---
export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        if (typeof window === 'undefined') return 'en';
        const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
        return stored === 'zh' ? 'zh' : 'en';
    });

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
        }
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        }
    }, [lang]);

    const t = useCallback((en, zh) => (lang === 'zh' ? (zh ?? en) : en), [lang]);
    const toggleLang = useCallback(() => {
        setLang((prev) => (prev === 'zh' ? 'en' : 'zh'));
    }, []);

    const languageValue = useMemo(() => ({ lang, t, toggleLang }), [lang, t, toggleLang]);

    return (
        <LanguageContext.Provider value={languageValue}>
            {children}
        </LanguageContext.Provider>
    );
}

export default function App() {
    return (
        <LanguageProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </LanguageProvider>
    );
}