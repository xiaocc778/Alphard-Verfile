import React, { useCallback, useMemo, useState, useEffect } from 'react';
// 1. 引入路由核心组件
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
// 2. 引入图标库
import { MapPin, Phone, MessageCircle, Menu, X, ChevronDown, ArrowLeft, Mail, Info, Instagram, Facebook, Globe, Wrench, ShieldCheck, Clock, DollarSign, ChevronLeft, ChevronRight, CheckCircle2, Star, Award, Users, Car, Sparkles, Play, ArrowRight, Shield, Truck, ThumbsUp, Search, User, HelpCircle, Settings, FileText, BookOpen } from 'lucide-react';
import HeroSection from './components/HeroSection.jsx';
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

const useScrollReveal = () => {
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const elements = Array.from(document.querySelectorAll('[data-reveal]'));
        if (!elements.length) return;
        if (!('IntersectionObserver' in window)) {
            elements.forEach((el) => el.classList.add('is-visible'));
            return;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
        );
        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);
};

const useParallaxHero = () => {
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        const root = document.documentElement;
        let rafId = 0;
        const onScroll = () => {
            const y = window.scrollY || 0;
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                root.style.setProperty('--parallax-y', `${Math.min(y, 600)}px`);
            });
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);
};

// --- Sub-Components ---
const CarCard = ({ car }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const imageUrl = getCarImage(car.folderName, car.imageCount, 'cover', car);
    
    // 判断是否为 Alphard 或 Vellfire
    const isPremium = car.title?.toLowerCase().includes('alphard') || car.title?.toLowerCase().includes('vellfire');

    const openDetails = () =>
        navigate(`/vehicle/${car.id}`, {
            state: { from: `${location.pathname}${location.search}` },
        });

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={t('View vehicle details', '查看车辆详情')}
            onClick={openDetails}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openDetails();
                }
            }}
            className="group toyota-card cursor-pointer flex flex-col h-full overflow-hidden reveal"
            data-reveal
        >
            {/* Image Container */}
            <div className="relative h-56 overflow-hidden bg-surface">
                <img
                    src={imageUrl}
                    alt={car.title}
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1600661653561-629509216228?auto=format&fit=crop&q=80&w=1000"; }}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-85 transition-opacity duration-300"></div>
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] shadow-sm ${
                        car.status === 'In Stock' || car.status === 'Brand New' ? 'bg-brand text-white' : 'bg-black/70 text-white'
                    }`}>
                        {car.status}
                    </span>
                    {isPremium && (
                        <span className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] bg-white/90 text-text-heading flex items-center gap-1 shadow-sm">
                            <Star size={10} fill="currentColor" className="text-brand" /> {t('Premium', '精选')}
                        </span>
                    )}
                </div>

                {/* Quick View Button */}
                <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="px-4 py-2 rounded-full text-[11px] font-bold tracking-[0.12em] text-white bg-brand shadow-md">
                        {t('View details', '查看详情')} <ArrowRight size={14} className="inline" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                {/* Title */}
                <h3 className="text-lg font-bold text-text-heading line-clamp-2 leading-snug group-hover:text-brand transition-colors mb-4">
                    {car.title}
                </h3>

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-surface rounded-lg p-3 text-center border border-black/5">
                        <p className="text-[10px] text-text-muted mb-1 font-bold uppercase tracking-[0.14em]">{t('Year', '年份')}</p>
                        <p className="font-bold text-text-heading text-sm">{car.year}</p>
                    </div>
                    <div className="bg-surface rounded-lg p-3 text-center border border-black/5">
                        <p className="text-[10px] text-text-muted mb-1 font-bold uppercase tracking-[0.14em]">{t('Mileage', '里程')}</p>
                        <p className="font-bold text-text-heading text-sm">
                            {(car.mileage || 0).toLocaleString()}
                            <span className="text-[10px] text-text-muted ml-1">{t('km', '公里')}</span>
                        </p>
                    </div>
                    <div className="bg-surface rounded-lg p-3 text-center border border-black/5">
                        <p className="text-[10px] text-text-muted mb-1 font-bold uppercase tracking-[0.14em]">{t('Fuel', '燃料')}</p>
                        <p className="font-bold text-text-heading text-sm truncate">{car.fuel || 'Petrol'}</p>
                    </div>
                </div>

                {/* Price Section */}
                <div className="mt-auto pt-5 border-t border-black/10 flex items-center justify-between">
                    <div>
                        {car.price > 0 ? (
                            <>
                                <p className="text-2xl font-bold text-text-heading tracking-tight">${car.price.toLocaleString()}</p>
                                <p className="text-[10px] text-text-muted uppercase font-semibold tracking-wide">
                                    {t('Excl. Gov. Charges', '不含政府费用')}
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-xl font-bold text-brand">{t('Contact for Price', '价格面议')}</p>
                                <p className="text-[10px] text-text-muted uppercase font-semibold tracking-wide">
                                    {t('Enquire for price', '询价请联系')}
                                </p>
                            </>
                        )}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-surface border border-black/5 flex items-center justify-center text-text-muted group-hover:text-text-heading transition-colors">
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
        <div className="toyota-card overflow-hidden">
            {/* Header */}
            <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-black/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                        <Car className="text-white" size={16} />
                    </div>
                    <div>
                        <h3 className="text-text-heading font-bold">{t('Filter Vehicles', '筛选车辆')}</h3>
                        <p className="text-text-muted text-xs">{isToyotaCategory ? t('Brand Showcase', '品牌专题') : t('Buy a Car', '选购车辆')}</p>
                    </div>
                </div>
                <div className="text-text-heading text-sm">
                    <span className="text-2xl font-black">{resultCount}</span>
                    <span className="text-text-muted ml-1">{t('results', '结果')}</span>
                </div>
            </div>

            {/* Filter Grid */}
            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                    {/* Keyword */}
                    <div className="space-y-2 lg:col-span-2">
                        <label className="text-[11px] font-black text-white/55 uppercase tracking-[0.22em] flex items-center gap-1">
                            {t('Keyword', '关键词')}
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                                value={tempFilters.keyword || ''}
                                onChange={(e) => setTempFilters({ ...tempFilters, keyword: e.target.value })}
                                onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }}
                                placeholder={t('Alphard / Hybrid / SUV / 7 seats...', 'Alphard / 混动 / SUV / 7座...')}
                                className="w-full pl-10 pr-4 p-3 rounded-lg border border-black/10 bg-white text-text-heading placeholder:text-text-muted focus:ring-4 focus:ring-brand/10 focus:border-brand font-medium text-sm transition-all"
                            />
                        </div>
                    </div>
                    {/* Brand */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-white/55 uppercase tracking-[0.22em] flex items-center gap-1">
                            {t('Brand', '品牌')}
                        </label>
                        {isToyotaCategory ? (
                            <div className="w-full p-3 rounded-lg bg-surface border border-black/10 text-text-body font-semibold text-sm flex items-center justify-between">
                                <span className="font-bold">{t('Toyota', '丰田')}</span>
                                <span className="text-[11px] text-text-muted font-bold uppercase tracking-[0.12em]">{t('Locked', '锁定')}</span>
                            </div>
                        ) : (
                            <div className="relative group">
                            <select 
                                    value={tempFilters.brand}
                                    onChange={(e) => setTempFilters({...tempFilters, brand: e.target.value})}
                                className="w-full p-3 rounded-lg appearance-none cursor-pointer transition-all border border-black/10 bg-white text-text-heading focus:ring-4 focus:ring-brand/10 focus:border-brand font-medium text-sm"
                                >
                                    <option value="">{t('All Brands', '全部品牌')}</option>
                                    {ALL_BRANDS.map((brand) => (
                                        <option key={brand} value={brand}>
                                            {brand} ({brandCounts[brand] || 0})
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
                            </div>
                        )}
                    </div>

                    {/* Year From */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-white/55 uppercase tracking-[0.22em] flex items-center gap-1">
                            {t('Year', '年份')}
                        </label>
                        <div className="relative group">
                            <select 
                                value={tempFilters.yearFrom}
                                onChange={(e) => setTempFilters({...tempFilters, yearFrom: e.target.value})}
                                className="w-full p-3 rounded-lg appearance-none cursor-pointer transition-all border border-black/10 bg-white text-text-heading focus:ring-4 focus:ring-brand/10 focus:border-brand font-medium text-sm"
                            >
                                <option value="">{t('Any Year', '不限年份')}</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}+</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-white/55 uppercase tracking-[0.22em] flex items-center gap-1">
                            {t('Price', '价格')}
                        </label>
                        <div className="relative group">
                            <select 
                                value={tempFilters.priceRange}
                                onChange={(e) => setTempFilters({...tempFilters, priceRange: e.target.value})}
                                className="w-full p-3 rounded-lg appearance-none cursor-pointer transition-all border border-black/10 bg-white text-text-heading focus:ring-4 focus:ring-brand/10 focus:border-brand font-medium text-sm"
                            >
                                <option value="">{t('Any Price', '不限价格')}</option>
                                <option value="1">{t('Under $30,000', '30,000 以下')}</option>
                                <option value="2">{t('$30,000 - $60,000', '30,000 - 60,000')}</option>
                                <option value="3">{t('$60,000 - $100,000', '60,000 - 100,000')}</option>
                                <option value="4">{t('$100,000+', '100,000 以上')}</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Sort By */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-white/55 uppercase tracking-[0.22em] flex items-center gap-1">
                            {t('Sort', '排序')}
                        </label>
                        <div className="relative group">
                            <select 
                                value={tempFilters.sortBy}
                                onChange={(e) => setTempFilters({...tempFilters, sortBy: e.target.value})}
                                className="w-full p-3 rounded-lg appearance-none cursor-pointer transition-all border border-black/10 bg-white text-text-heading focus:ring-4 focus:ring-brand/10 focus:border-brand font-medium text-sm"
                            >
                                <option value="newest">{t('Newest First', '最新优先')}</option>
                                <option value="oldest">{t('Oldest First', '最旧优先')}</option>
                                <option value="price-low">{t('Price: Low → High', '价格：低到高')}</option>
                                <option value="price-high">{t('Price: High → Low', '价格：高到低')}</option>
                                <option value="mileage-low">{t('Mileage: Low → High', '里程：低到高')}</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Reset Button */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-transparent">{t('Reset', '重置')}</label>
                            <button
                            onClick={onReset}
                                className="w-full p-3 toyota-btn-secondary flex items-center justify-center gap-2"
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
                            className="w-full p-3 toyota-btn-primary flex items-center justify-center gap-2"
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
                                    navigate('/inventory');
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

            {/* ========== SCROLL REVEAL FEATURE (Toyota-style) ========== */}
            <section className="relative bg-white">
                <div className="relative h-[58vh] md:h-[68vh] overflow-hidden">
                    <img
                        src="/stock/20 Mercedes G63/cover.jpg"
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
                </div>
                <div className="absolute inset-0 flex items-center">
                    <div className="container mx-auto px-6">
                        <div className="max-w-xl text-white reveal reveal-slide" data-reveal>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                                {t('Featured story', '精选故事')}
                            </p>
                            <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">
                                {t('Designed for every journey', '为每一段旅程而生')}
                            </h2>
                            <p className="mt-4 text-base md:text-lg text-white/80 leading-relaxed">
                                {t(
                                    'A refined driving experience with comfort, confidence, and craftsmanship in every detail.',
                                    '以舒适、信心与匠心细节，打造更优雅的驾驶体验。'
                                )}
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => navigate('/inventory')}
                                    className="inline-flex items-center justify-center rounded-full border border-white/70 px-7 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
                                >
                                    {t('Explore the range', '浏览车型')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== FIND YOUR IDEAL (Toyota-style tiles) ========== */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-site mx-auto">
                        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10 reveal" data-reveal data-reveal-delay="1">
                            <div>
                                <span className="inline-block bg-surface text-text-muted font-bold text-[11px] uppercase tracking-[0.14em] px-4 py-2 rounded-full border border-black/10 mb-4">
                                    {t('Find your ideal Toyota', '找到你的理想座驾')}
                                </span>
                                <h2 className="text-3xl md:text-4xl font-black text-text-heading">
                                    {t('Browse by body type', '按车型分类浏览')}
                                </h2>
                                <p className="text-text-body mt-3 max-w-2xl">
                                    {t('Explore our curated range with clean, spacious tiles and clear labels.', '用简洁清晰的图块布局，快速找到适合你的车型。')}
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/inventory')}
                                className="toyota-btn-secondary px-6 py-3"
                            >
                                {t('Browse all vehicles', '浏览全部车型')}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    title: t('Luxury MPV', '豪华 MPV'),
                                    desc: t('Executive comfort for family and business.', '家庭与商务的行政舒适体验。'),
                                    image: '/stock/2024 Toyota Vellfire/cover.jpg',
                                },
                                {
                                    title: t('Premium Sedan', '高端轿车'),
                                    desc: t('Balanced everyday luxury and performance.', '兼具日常舒适与驾驶质感。'),
                                    image: '/stock/2023 Toyota Alphard 2.5L/cover.jpg',
                                },
                                {
                                    title: t('SUV & 4WD', 'SUV / 4WD'),
                                    desc: t('Confidence on any road.', '从城市到远途都从容。'),
                                    image: '/stock/20 Mercedes G63/cover.jpg',
                                },
                                {
                                    title: t('Performance', '性能车'),
                                    desc: t('Sharper response, bolder design.', '更锋利的操控与更大胆的设计。'),
                                    image: '/stock/18 Ford Mustang GT 5.0/cover.jpg',
                                },
                                {
                                    title: t('Family Select', '家庭精选'),
                                    desc: t('Comfort-focused picks for families.', '为家庭打造的舒适选择。'),
                                    image: '/stock/2024 Toyota Vellfire/cover.jpg',
                                },
                                {
                                    title: t('New Arrivals', '最新到库'),
                                    desc: t('Fresh arrivals updated weekly.', '每周更新新到车源。'),
                                    image: '/stock/2023 Toyota Alphard 2.5L/cover.jpg',
                                },
                            ].map((item) => (
                                <div key={item.title} className="toyota-card overflow-hidden group reveal" data-reveal data-reveal-delay="2">
                                    <div className="relative">
                                        <img src={item.image} alt="" className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                                                {t('Category', '分类')}
                                            </p>
                                            <h3 className="text-lg font-black">{item.title}</h3>
                                            <p className="text-sm text-white/85 mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                    <div className="p-5 flex items-center justify-between">
                                        <span className="text-sm font-bold text-text-heading">{t('See models', '查看车型')}</span>
                                        <ArrowRight size={18} className="text-brand" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== QUICK SEARCH BAR ========== */}
            <section className="relative z-20 -mt-12">
                <div className="container mx-auto px-4 reveal" data-reveal data-reveal-delay="2">
                    <HomeFilterWidget cars={safeCars} />
                </div>
            </section>

            {/* ========== VIDEO SHOWCASE ========== */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 reveal" data-reveal data-reveal-delay="1">
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
    useScrollReveal();
    useParallaxHero();

    const alphardVellfireCount = safeCars.filter(car => {
        const searchStr = `${car.title} ${car.folderName}`.toLowerCase();
        return searchStr.includes('alphard') || searchStr.includes('vellfire');
    }).length;

    // Hero copy reveal: trigger is at bottom of Welcome section
    // When trigger scrolls out of viewport, show Hero copy
    const triggerRef = React.useRef(null);
    const [heroCopyVisible, setHeroCopyVisible] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !triggerRef.current) return;
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setHeroCopyVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                // When trigger is NOT intersecting (scrolled out), show copy
                // When trigger IS intersecting (scrolled back), hide copy
                setHeroCopyVisible(!entry.isIntersecting);
            },
            {
                root: null,
                rootMargin: '0px 0px 0px 0px',
                threshold: 0,
            }
        );

        observer.observe(triggerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="relative">
            <section className="bg-white">
                <div className="container mx-auto px-6 py-16 md:py-20">
                    <div className="max-w-4xl mx-auto text-center reveal" data-reveal>
                        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-text-heading">
                            {t('Welcome to Best Auto', '欢迎来到 Best Auto')}
                        </h1>
                        <p className="mt-4 text-lg md:text-xl text-text-body">
                            {t("Your journey starts here, let's go.", '旅程从这里开始，一起出发。')}
                        </p>
                    </div>
                </div>
                {/* Trigger: when this scrolls out of view, Hero copy appears */}
                <div ref={triggerRef} className="h-1 w-full" aria-hidden="true" />
            </section>

            <HeroSection t={t} copyVisible={heroCopyVisible} onExplore={() => navigate('/inventory')} />

            <main className="relative z-10 bg-white">
                {/* ========== 1. FIND YOUR IDEAL VEHICLE ========== */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="max-w-site mx-auto">
                            <div className="text-center mb-12 reveal" data-reveal>
                                <h2 className="text-3xl md:text-4xl font-bold text-text-heading">
                                    {t('Find your ideal vehicle', '找到您的理想座驾')}
                                </h2>
                                <p className="mt-3 text-text-muted">{t('Browse our vehicles.', '浏览我们的车辆。')}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {[
                                    { 
                                        name: t('Alphard', '埃尔法'), 
                                        desc: t('Executive luxury for discerning travelers.', '行政级豪华，尊贵出行首选。'),
                                        image: '/stock/2023 Toyota Alphard 2.5L/cover.jpg',
                                        filter: 'alphard'
                                    },
                                    { 
                                        name: t('Vellfire', '威尔法'), 
                                        desc: t('Bold design meets refined comfort.', '动感外观，舒适内在。'),
                                        image: '/stock/2024 Toyota Vellfire/cover.jpg',
                                        filter: 'vellfire'
                                    },
                                    { 
                                        name: t('Executive Lounge', '行政套房'), 
                                        desc: t('Ultimate luxury seating experience.', '极致奢华座椅体验。'),
                                        image: '/stock/25 Toyota Vellfire Executive Lounge/cover.jpg',
                                        filter: 'executive'
                                    },
                                    { 
                                        name: t('All Vehicles', '全部车辆'), 
                                        desc: t('View our complete inventory.', '查看全部库存。'),
                                        image: '/stock/back/hero-alphard.jpg.jpg',
                                        filter: ''
                                    },
                                ].map((cat, idx) => (
                                    <div 
                                        key={cat.name} 
                                        className="group cursor-pointer reveal" 
                                        data-reveal 
                                        data-reveal-delay={idx + 1}
                                        onClick={() => navigate(cat.filter ? `/inventory?q=${cat.filter}` : '/inventory')}
                                    >
                                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
                                            <img 
                                                src={cat.image} 
                                                alt="" 
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                        </div>
                                        <h3 className="font-bold text-text-heading group-hover:text-brand transition-colors">{cat.name}</h3>
                                        <p className="text-sm text-text-muted mt-1 hidden md:block">{cat.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== 3. 双栏推广区 (Accessories + Finance) ========== */}
                <section className="py-16 bg-section">
                    <div className="container mx-auto px-6">
                        <div className="max-w-site mx-auto space-y-6">
                            {/* Accessories */}
                            <div className="grid md:grid-cols-2 gap-0 toyota-card overflow-hidden reveal" data-reveal data-reveal-delay="1">
                                <div className="relative h-64 md:h-auto">
                                    <img src="/stock/2024 Toyota Vellfire/cover.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
                                </div>
                                <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">{t('Featured', '精选')}</p>
                                    <h3 className="text-2xl md:text-3xl font-bold text-text-heading mt-3">
                                        {t('Genuine Accessories', '原厂精品配件')}
                                    </h3>
                                    <p className="text-text-muted mt-4">
                                        {t('Make it yours with accessories designed to integrate seamlessly.', '原厂配件，无缝融合，彰显个性。')}
                                    </p>
                                    <button onClick={() => navigate('/contact')} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand/80 transition-colors">
                                        {t('Explore accessories', '查看配件')} <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Finance */}
                            <div className="grid md:grid-cols-2 gap-0 toyota-card overflow-hidden reveal" data-reveal data-reveal-delay="2">
                                <div className="p-8 md:p-12 flex flex-col justify-center bg-white order-2 md:order-1">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">{t('Finance', '金融服务')}</p>
                                    <h3 className="text-2xl md:text-3xl font-bold text-text-heading mt-3">
                                        {t('Flexible Finance Options', '灵活金融方案')}
                                    </h3>
                                    <p className="text-text-muted mt-4">
                                        {t('Discover flexible options and estimate your personalised repayments.', '快速测算分期方案，灵活选择，轻松拥车。')}
                                    </p>
                                    <button onClick={() => navigate('/contact')} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand/80 transition-colors">
                                        {t('Estimate my repayments', '估算分期')} <ArrowRight size={16} />
                                    </button>
                                </div>
                                <div className="relative h-64 md:h-auto order-1 md:order-2">
                                    <img src="/stock/2023 Toyota Alphard 2.5L/cover.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== 4. SEE WHAT'S NEW ========== */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="max-w-site mx-auto">
                            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10 reveal" data-reveal>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-text-muted">{t("See what's new", '最新动态')}</p>
                                    <h2 className="text-3xl md:text-4xl font-bold text-text-heading mt-3">
                                        {t("We're here for tomorrow, as well as today.", '我们为您的今天与明天，时刻准备。')}
                                    </h2>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {safeCars.slice(0, 3).map((car, idx) => (
                                    <div 
                                        key={car.id} 
                                        className="toyota-card overflow-hidden cursor-pointer group reveal" 
                                        data-reveal 
                                        data-reveal-delay={idx + 1}
                                        onClick={() => navigate(`/vehicle/${car.id}`)}
                                    >
                                        <div className="relative h-52">
                                            <img src={getCarImage(car.folderName, car.imageCount, 'cover', car)} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                            <span className="absolute top-4 left-4 bg-white text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full">
                                                {t('New Arrival', '新到')}
                                            </span>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-lg font-bold text-text-heading group-hover:text-brand transition-colors">{car.title}</h3>
                                            <p className="text-sm text-text-muted mt-2">{t('Available now', '现车在售')}</p>
                                            <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand">
                                                {t('Dive in', '了解更多')} <ArrowRight size={16} />
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== 5. EXPLORE MORE ========== */}
                <section className="py-16 bg-section">
                    <div className="container mx-auto px-6">
                        <div className="max-w-site mx-auto">
                            <h2 className="text-2xl md:text-3xl font-bold text-text-heading mb-10 reveal" data-reveal>
                                {t('Explore more from Best Auto', '探索更多 Best Auto 服务')}
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {[
                                    { 
                                        title: t('Quality Assured', '品质保障'), 
                                        desc: t('Every vehicle inspected and certified.', '每辆车经过严格检测认证。'),
                                        icon: <ShieldCheck size={28} className="text-brand" />,
                                        to: '/about'
                                    },
                                    { 
                                        title: t('Trade-In Service', '以旧换新'), 
                                        desc: t('Get a fair value for your current vehicle.', '您的座驾，我们高价收购。'),
                                        icon: <Car size={28} className="text-brand" />,
                                        to: '/sell'
                                    },
                                    { 
                                        title: t('Current Offers', '优惠活动'), 
                                        desc: t('Browse deals designed to give you more.', '精选优惠，为您省更多。'),
                                        icon: <DollarSign size={28} className="text-brand" />,
                                        to: '/inventory'
                                    },
                                    { 
                                        title: t('Contact Us', '联系我们'), 
                                        desc: t('Our team speaks English, Mandarin & Cantonese.', '中英粤三语服务，沟通无障碍。'),
                                        icon: <Phone size={28} className="text-brand" />,
                                        to: '/contact'
                                    },
                                ].map((item, idx) => (
                                    <div 
                                        key={item.title} 
                                        className="toyota-card p-6 cursor-pointer group reveal hover:shadow-lg transition-shadow" 
                                        data-reveal 
                                        data-reveal-delay={idx + 1}
                                        onClick={() => navigate(item.to)}
                                    >
                                        <div className="mb-4">{item.icon}</div>
                                        <h3 className="font-bold text-text-heading group-hover:text-brand transition-colors">{item.title}</h3>
                                        <p className="text-sm text-text-muted mt-2 hidden md:block">{item.desc}</p>
                                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand">
                                            {t('Tell me more', '了解更多')} <ArrowRight size={14} />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== 6. INVENTORY PREVIEW ========== */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="max-w-site mx-auto">
                            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10 reveal" data-reveal>
                                <div>
                                    <span className="inline-block bg-section text-text-muted font-bold text-[11px] uppercase tracking-[0.14em] px-4 py-2 rounded-full border border-black/5 mb-4">
                                        {t('Curated inventory', '精选车源')}
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-bold text-text-heading">
                                        {t('Executive Lounge Highlights', '行政贵宾精选')}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => navigate('/inventory')}
                                    className="toyota-btn-secondary px-6 py-3"
                                >
                                    {t('View all', '查看全部')} {safeCars.length} {t('vehicles', '台')}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {safeCars.slice(0, 6).map(car => <CarCard key={car.id} car={car} />)}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
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
        <div className="min-h-screen bg-page pb-20">
            {/* Header (Toyota-style: full-bleed media + light overlay + black text) */}
            <header className="relative overflow-hidden bg-white">
                <div className="absolute inset-0">
                    <img
                        src="/stock/2024 Toyota Vellfire/cover.jpg"
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-white/35 to-white/10" />
                </div>

                <div className="relative container mx-auto px-4 py-16 md:py-20">
                    <div className="max-w-3xl">
                        {isToyotaPage && (
                            <div className="inline-flex items-center gap-2 bg-white/90 border border-black/10 px-4 py-2 rounded-full mb-6">
                                <span className="text-xs font-bold tracking-widest uppercase text-text-heading">{t('Brand Showcase', '品牌专题')}</span>
                                <span className="text-xs text-text-muted">|</span>
                                <span className="text-xs text-text-body">{t('Alphard / Vellfire', '埃尔法 / 威尔法')}</span>
                            </div>
                        )}
                        <h1 className="text-4xl md:text-6xl font-black mb-4 text-text-heading">{pageTitle}</h1>
                        <p className="text-text-body max-w-3xl text-lg leading-relaxed">{pageDesc}</p>

                        {isToyotaPage && (
                            <div className="mt-8 flex flex-wrap gap-3 text-sm">
                                <span className="px-4 py-2 rounded-full bg-white/90 border border-black/10 text-text-heading font-semibold">
                                    {filteredCars.length} {t('Available', '在库')}
                                </span>
                                <span className="px-4 py-2 rounded-full bg-white/90 border border-black/10 text-text-heading font-semibold">
                                    {t('Alphard/Vellfire Specialist', '埃尔法/威尔法 专家')}
                                </span>
                                <span className="px-4 py-2 rounded-full bg-white/90 border border-black/10 text-text-heading font-semibold">
                                    {t('Service & Repairs', '保养维修')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Toyota 专题页：增加一个专题介绍区，和 Buy a Car 形成“独立页面”感 */}
            {isToyotaPage && (
                <div className="container mx-auto px-4 -mt-14 relative z-10 mb-8">
                    <div className="toyota-card p-6 md:p-10">
                        <div className="grid md:grid-cols-12 gap-8 items-center">
                            <div className="md:col-span-7 space-y-4">
                                <h2 className="text-2xl md:text-3xl font-black text-text-heading">
                                    {t(
                                        'Focused Alphard & Vellfire premium inventory',
                                        '专注 埃尔法 / 威尔法 的精品现车'
                                    )}
                                </h2>
                                <p className="text-text-body leading-relaxed">
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
                                        <div key={x.k} className="bg-surface rounded-lg p-4 border border-black/10">
                                            <p className="text-xs font-bold text-text-muted uppercase tracking-[0.12em]">{t(x.k, x.v)}</p>
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
                                        className="flex-1 toyota-btn-primary py-3"
                                    >
                                        {t('Enquire Now', '立即咨询')}
                                    </button>
                                    <a
                                        href={`tel:${SALES_PHONE}`}
                                        className="flex-1 toyota-btn-secondary py-3 text-center"
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
                <div className="toyota-card mb-8 py-4 px-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-black text-text-heading">{filteredCars.length}</span>
                            <span className="text-text-muted font-medium">{t('vehicles', '车辆')}</span>
                        </div>
                        {filteredCars.length > 0 && (
                            <div className="hidden md:flex items-center gap-2 text-text-muted text-sm border-l border-black/10 pl-4">
                                <DollarSign size={14} />
                                <span>{t('Avg.', '均价')} ${avgPrice.toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Active Filters Tags */}
                    {activeTags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-text-muted font-medium">{t('Active filters:', '当前筛选:')}</span>
                            {activeTags.map(tag => (
                                <span
                                    key={tag.key}
                                    className="px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 border border-black/10 bg-surface text-text-heading"
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
                                className="text-xs text-white/55 hover:text-cyan-200 font-medium underline underline-offset-2"
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
                                    className="bg-white border-2 border-black/10 text-text-heading font-bold py-3 px-10 rounded-full hover:border-brand hover:text-brand transition-colors shadow-sm"
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
        <div className="bg-page min-h-screen pb-20">
            <div className="bg-white border-b border-black/10 sticky top-[80px] z-30 shadow-sm/50">
                <div className="container mx-auto px-4 py-4">
                    <button onClick={() => navigate(backTarget)} className="flex items-center gap-2 text-text-muted hover:text-brand font-medium transition-colors text-sm">
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
                        {galleryImages.length > 1 && <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">{galleryImages.map((img, idx) => (<button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all relative ${currentImageIndex === idx ? 'border-brand ring-2 ring-brand/10' : 'border-transparent opacity-60 hover:opacity-100'}`}><img src={img} alt="thumb" className="w-full h-full object-cover" /></button>))}</div>}
                        <div className="toyota-card p-10">
                            <h3 className="text-xl font-bold text-text-heading mb-6 flex items-center gap-2">
                                <Info size={20} className="text-brand" /> {t('Vehicle Overview', '车辆概览')}
                            </h3>
                            <p className="text-text-body leading-8 mb-10">{car.description}</p>
                            {car.features && (
                                <div>
                                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">
                                        {t('Key Features', '核心配置')}
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {car.features.map((f, i) => (
                                            <div key={i} className="flex items-center gap-3 text-text-body bg-surface p-4 rounded-lg border border-black/10">
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
                        <div className="toyota-card p-8">
                            <div className="mb-8 pb-8 border-b border-black/10">
                                <div className="flex items-center gap-2 mb-4"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${car.status === 'In Stock' ? 'bg-emerald-100 text-emerald-700' : 'bg-surface text-text-heading border border-black/10'}`}>{car.status}</span><span className="text-text-muted text-xs font-bold flex items-center gap-1"><MapPin size={12} /> {car.location || "Homebush"}</span></div>
                                <h1 className="text-2xl font-bold text-text-heading mt-3 mb-2 leading-tight">{car.title}</h1>
                                <div className="flex items-baseline gap-2"><p className="text-4xl font-bold text-brand">${(car.price || 0).toLocaleString()}</p></div>
                                <p className="text-xs text-text-muted font-medium mt-1">
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
                                    <div key={i} className="bg-surface p-3 rounded-lg border border-black/10">
                                        <span className="block text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">{item.l}</span>
                                        <span className="font-bold text-text-heading text-sm truncate block" title={item.v}>{item.v}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4">
                                <button onClick={() => navigate('/contact')} className="w-full toyota-btn-primary py-4 active:scale-95">
                                    {t('Enquire Now', '立即咨询')}
                                </button>
                                <a href={`tel:${SALES_PHONE}`} className="w-full toyota-btn-secondary py-4 flex items-center justify-center gap-2 active:scale-95">
                                    <Phone size={20} className="text-brand" /> {t('Call Sales', '致电销售')}
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
        {/* Hero - image + Toyota-like overlays */}
        <header className="relative overflow-hidden h-[62vh] min-h-[460px]">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/stock/back/explore-hero.jpg.jpg')" }}
                aria-hidden="true"
            />
            {/* Overlays for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/35" aria-hidden="true" />

            <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 text-white">
                        <Award size={14} />
                        <span className="text-xs font-bold tracking-widest uppercase">{t('About', '关于')}</span>
                        <span className="text-xs text-white/60">·</span>
                        <span className="text-xs text-white/80">{t('Alphard & Vellfire Specialist', '埃尔法 / 威尔法 专家')}</span>
                    </div>
                    <h1
                        className="text-4xl md:text-6xl font-bold tracking-tight text-white"
                        style={{ textShadow: '0 2px 24px rgba(0,0,0,0.55)' }}
                    >
                        {BRAND_NAME} Pty Ltd
                    </h1>
                    <p
                        className="text-white/85 mt-5 max-w-2xl text-lg md:text-xl"
                        style={{ textShadow: '0 1px 14px rgba(0,0,0,0.45)' }}
                    >
                        {t('Specialist in Toyota Alphard & Vellfire · Sales · Service · Repairs', '埃尔法 / 威尔法 专营｜销售 · 保养 · 维修')}
                    </p>
                </div>
            </div>
        </header>

        <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="max-w-5xl mx-auto">
                <div className="grid lg:grid-cols-12 gap-10 items-start">
                    <div className="lg:col-span-6">
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

                    <div className="lg:col-span-6">
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
                                {/* Stack by default to avoid cramped columns in the sidebar */}
                                <div className="mt-8 grid gap-4">
                                    {/* Visit / Contact card */}
                                    <div className="bg-slate-950 text-white rounded-2xl p-6">
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

                                    {/* Location card (no embedded map) */}
                                    <div className="bg-white rounded-2xl border border-black/10 p-6">
                                        <h4 className="font-black text-text-heading mb-4 flex items-center gap-2">
                                            <MapPin className="text-brand" size={18} /> {t('Locations', '地址导航')}
                                        </h4>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <a
                                                href={`https://www.google.com/maps?q=${encodeURIComponent(SHOWROOM_ADDRESS)}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="group block rounded-xl border border-black/10 bg-section hover:bg-black/5 transition-colors p-4"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold tracking-[0.18em] uppercase text-text-muted">{t('Showroom', '展厅')}</p>
                                                        <p className="mt-1 font-bold text-text-heading leading-snug truncate">{SHOWROOM_ADDRESS}</p>
                                                        <p className="mt-1 text-xs text-text-muted">{t('Open in Google Maps', '在 Google 地图中打开')}</p>
                                                    </div>
                                                    <span className="text-sm font-bold text-brand whitespace-nowrap group-hover:text-brand/80">{t('Open', '打开')}</span>
                                                </div>
                                            </a>
                                            <a
                                                href={`https://www.google.com/maps?q=${encodeURIComponent(SERVICE_ADDRESS)}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="group block rounded-xl border border-black/10 bg-section hover:bg-black/5 transition-colors p-4"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold tracking-[0.18em] uppercase text-text-muted">{t('Service centre', '服务中心')}</p>
                                                        <p className="mt-1 font-bold text-text-heading leading-snug truncate">{SERVICE_ADDRESS}</p>
                                                        <p className="mt-1 text-xs text-text-muted">{t('Open in Google Maps', '在 Google 地图中打开')}</p>
                                                    </div>
                                                    <span className="text-sm font-bold text-brand whitespace-nowrap group-hover:text-brand/80">{t('Open', '打开')}</span>
                                                </div>
                                            </a>
                                        </div>
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
    <div className="min-h-screen bg-white">
        {/* Hero - clean red gradient */}
        <header className="relative overflow-hidden bg-gradient-to-br from-brand via-red-600 to-red-700">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.2),transparent_50%)]" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-20 md:py-28 text-center text-white">
                <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                    <Phone size={14} />
                    <span className="text-xs font-bold tracking-widest uppercase">{t('Contact', '联系')}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{t('Get in Touch', '联系我们')}</h1>
                <p className="text-white/90 mt-5 max-w-2xl mx-auto text-lg">
                    {t('Homebush showroom · Clyde service center', 'Homebush 展厅 · Clyde 服务中心')}
                </p>
            </div>
        </header>

        <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <div className="toyota-card p-10">
                    <h3 className="text-2xl font-black text-text-heading mb-2">{t('Send a Message', '发送消息')}</h3>
                    <p className="text-text-body mb-8">{t("We'll respond as soon as possible.", '我们会尽快回复。')}</p>
                    <form className="space-y-6" action={CONTACT_FORM_ACTION} method="POST">
                        <input type="hidden" name="_subject" value={t('[BEST AUTO] New contact enquiry', '[BEST AUTO] 新联系咨询')} />
                        <input type="hidden" name="_captcha" value="false" />
                        <input type="hidden" name="_template" value="table" />
                        <div>
                            <label className="block text-sm font-bold text-text-heading mb-2">{t('Full Name', '姓名')}</label>
                            <input name="name" required type="text" className="w-full p-4 bg-white border border-black/10 rounded-lg focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all" placeholder={t('John Doe', '张三')} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-heading mb-2">{t('Phone Number', '联系电话')}</label>
                            <input name="phone" required type="tel" className="w-full p-4 bg-white border border-black/10 rounded-lg focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all" placeholder="0400 000 000" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-heading mb-2">{t('Your Enquiry', '咨询内容')}</label>
                            <textarea name="message" required className="w-full p-4 bg-white border border-black/10 rounded-lg focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none h-40 resize-none" placeholder={t("I'm interested in...", '我想咨询...')} ></textarea>
                        </div>
                        <button className="w-full toyota-btn-primary py-4">
                            {t('Send Message', '发送')}
                        </button>
                    </form>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <a href={`tel:${SALES_PHONE}`} className="toyota-btn-secondary py-3 flex items-center justify-center gap-2">
                            <Phone size={18} className="text-brand" /> {t('Call Sales:', '销售电话:')} {SALES_PHONE_DISPLAY}
                        </a>
                        <a href={`tel:${SERVICE_PHONE}`} className="toyota-btn-secondary py-3 flex items-center justify-center gap-2">
                            <Wrench size={18} className="text-brand" /> {t('Service:', '保养:')} {SERVICE_PHONE_DISPLAY}
                        </a>
                    </div>
                </div>

                <div className="space-y-8">
                    {[
                        { name: t('Best Auto Showroom (Homebush)', 'Best Auto 展厅（Homebush）'), address: SHOWROOM_ADDRESS, map: `https://www.google.com/maps?q=${encodeURIComponent(SHOWROOM_ADDRESS)}&output=embed`, note: t(`Phone/WeChat: ${WECHAT_ID} · ${SALES_PHONE_DISPLAY}`, `电话/微信: ${WECHAT_ID} · ${SALES_PHONE_DISPLAY}`) },
                        { name: t('Best Auto Service Centre (Clyde)', 'Best Auto 维修中心（Clyde）'), address: SERVICE_ADDRESS, map: `https://www.google.com/maps?q=${encodeURIComponent(SERVICE_ADDRESS)}&output=embed`, note: t(`Service: ${SERVICE_PHONE_DISPLAY}`, `服务: ${SERVICE_PHONE_DISPLAY}`) },
                    ].map((loc, idx) => (
                        <div key={idx} className="toyota-card p-6 overflow-hidden">
                            <h4 className="font-black text-text-heading mb-3 flex items-center gap-2 text-lg">
                                <MapPin className="text-brand" /> {loc.name}
                            </h4>
                            <p className="text-text-body mb-2 ml-8 text-sm">{loc.address}</p>
                            <p className="text-text-muted mb-4 ml-8 text-xs">{loc.note}</p>
                            <div className="h-48 bg-surface rounded-lg overflow-hidden relative border border-black/10">
                                <iframe src={loc.map} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"></iframe>
                            </div>
                        </div>
                    ))}

                    <div className="toyota-card p-8">
                        <h4 className="font-black mb-6 flex items-center gap-3 text-lg text-text-heading">
                            <Clock className="text-brand" /> {t('Opening Hours', '营业时间')}
                        </h4>
                        <div className="space-y-4 text-sm text-text-body">
                            <div className="flex justify-between border-b border-black/10 pb-2">
                                <span>{t('Everyday', '每天')}</span><span className="font-black text-text-heading">{t('10:00 AM - 5:30 PM', '10:00 - 17:30')}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-text-muted">{t('WeChat', '微信')}</span><span className="font-black text-text-heading">{WECHAT_ID}</span>
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
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-white">
            {/* Hero with full image */}
            <section className="relative h-[70vh] min-h-[500px]">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/stock/back/shop-hero.jpg.jpg')" }}
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" aria-hidden="true" />
                <div className="relative z-10 h-full flex items-center">
                    <div className="container mx-auto px-6 md:px-12">
                        <div className="max-w-xl">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                                {t('Trade-In', '以旧换新')}
                            </h1>
                            <p className="text-white/80 mt-4 text-lg">
                                {t('Upgrade to Alphard or Vellfire today.', '今天就置换埃尔法或威尔法。')}
                            </p>
                            <button 
                                onClick={() => navigate('/contact')}
                                className="mt-8 toyota-btn-primary py-4 px-10"
                            >
                                {t('Get a Quote', '获取报价')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simple value props with image */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="max-w-site mx-auto grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                            <img 
                                src="/stock/2023 Toyota Alphard 2.5L/cover.jpg" 
                                alt="" 
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-text-heading">
                                {t('Fair. Fast. Simple.', '公平 · 快捷 · 简单')}
                            </h2>
                            <ul className="mt-8 space-y-4">
                                <li className="flex items-start gap-4">
                                    <CheckCircle2 className="text-brand flex-shrink-0 mt-1" size={22} />
                                    <span className="text-text-body">{t('Competitive market valuations', '有竞争力的市场估价')}</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <CheckCircle2 className="text-brand flex-shrink-0 mt-1" size={22} />
                                    <span className="text-text-body">{t('Same-day offers available', '当日即可获得报价')}</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <CheckCircle2 className="text-brand flex-shrink-0 mt-1" size={22} />
                                    <span className="text-text-body">{t('Apply value to your new vehicle', '抵扣新车款项')}</span>
                                </li>
                            </ul>
                            <button 
                                onClick={() => navigate('/contact')}
                                className="mt-10 toyota-btn-primary py-4 px-10"
                            >
                                {t('Enquire Now', '立即咨询')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const ServicesPage = () => {
    const { t } = useLanguage();
    const location = useLocation();
    const services = [
        {
            id: 'maintenance',
            icon: Wrench,
            title: t('Regular Maintenance', '常规保养'),
            desc: t(
                'Oil changes, filters, brake pads, and scheduled servicing for your Alphard or Vellfire.',
                '机油更换、滤芯、刹车片及埃尔法/威尔法定期保养。'
            ),
        },
        {
            id: 'repairs',
            icon: Settings,
            title: t('Repairs & Diagnostics', '维修与诊断'),
            desc: t(
                'Expert diagnosis and repair for mechanical, electrical, and electronic systems.',
                '机械、电气和电子系统的专业诊断与维修。'
            ),
        },
        {
            icon: ShieldCheck,
            title: t('Warranty Support', '质保服务'),
            desc: t('We honour manufacturer warranties and offer extended protection plans.', '我们履行厂家质保并提供延长保护计划。'),
        },
        {
            icon: Car,
            title: t('Detailing & Care', '美容护理'),
            desc: t('Interior deep cleaning, paint correction, and ceramic coating services.', '内饰深度清洁、漆面修复和镀晶服务。'),
        },
    ];

    useEffect(() => {
        if (!location.hash) return;
        const id = location.hash.replace('#', '');
        const el = document.getElementById(id);
        if (!el) return;
        // Offset for sticky header
        const yOffset = -96;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }, [location.hash]);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero (steering wheel) */}
            <header className="relative overflow-hidden h-[62vh] min-h-[460px]">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/stock/back/services-hero.jpg.jpg')" }}
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/35" aria-hidden="true" />
                <div className="relative z-10 h-full flex items-center">
                    <div className="container mx-auto px-6">
                        <div className="max-w-2xl text-white">
                            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                                <Wrench size={14} />
                                <span className="text-xs font-bold tracking-widest uppercase">{t('Services', '服务')}</span>
                            </div>
                            <h1
                                className="text-4xl md:text-6xl font-bold tracking-tight text-white"
                                style={{ textShadow: '0 2px 24px rgba(0,0,0,0.55)' }}
                            >
                                {t('Service & Maintenance', '保养与维修')}
                            </h1>
                            <p
                                className="text-white/85 mt-5 max-w-xl text-lg"
                                style={{ textShadow: '0 1px 14px rgba(0,0,0,0.45)' }}
                            >
                                {t('Specialist care at our Clyde service centre.', 'Clyde 服务中心 · 专业保养与维修。')}
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <Link to="/contact" className="toyota-btn-primary py-4 px-10">
                                    {t('Book a Service', '预约服务')}
                                </Link>
                                <a
                                    href={`tel:${SERVICE_PHONE}`}
                                    className="toyota-btn-secondary py-4 px-10 flex items-center justify-center gap-2 bg-white/15 border-white/25 text-white hover:bg-white/20"
                                >
                                    <Phone size={18} /> {SERVICE_PHONE_DISPLAY}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Service Cards */}
            <section className="py-16 md:py-20">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {services.map((svc, idx) => (
                            <div key={idx} id={svc.id} className="toyota-card p-8 flex gap-5 scroll-mt-24">
                                <div className="w-14 h-14 rounded-full bg-brand/10 text-brand flex-shrink-0 flex items-center justify-center">
                                    <svc.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-heading text-lg mb-2">{svc.title}</h3>
                                    <p className="text-text-body text-sm">{svc.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Location */}
            <section className="py-16 bg-section">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-text-heading mb-4">{t('Service Centre Location', '服务中心位置')}</h2>
                    <p className="text-text-body mb-2">{SERVICE_ADDRESS}</p>
                    <p className="text-text-muted text-sm mb-8">{t('Monday – Saturday: 8:30am – 5:30pm', '周一至周六：8:30am – 5:30pm')}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/contact" className="toyota-btn-primary py-4 px-10">{t('Book a Service', '预约服务')}</Link>
                        <a href={`tel:${SERVICE_PHONE}`} className="toyota-btn-secondary py-4 px-10 flex items-center justify-center gap-2"><Phone size={18} /> {SERVICE_PHONE_DISPLAY}</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

const OwnersPage = () => {
    const { t } = useLanguage();
    const benefits = [
        { icon: ShieldCheck, title: t('Warranty Coverage', '质保覆盖'), desc: t('Understand your warranty terms and coverage periods.', '了解您的质保条款和覆盖期限。') },
        { icon: FileText, title: t('Service History', '服务记录'), desc: t('Keep track of all maintenance performed on your vehicle.', '记录您车辆的所有保养维修。') },
        { icon: BookOpen, title: t('Owner Manuals', '车主手册'), desc: t('Access digital copies of your vehicle manuals and guides.', '获取您车辆手册和指南的电子版。') },
        { icon: Phone, title: t('Roadside Assistance', '道路救援'), desc: t('24/7 support when you need it most.', '24/7 全天候支持。') },
    ];
    return (
        <div className="min-h-screen bg-page">
            {/* Hero (image background) */}
            <header className="relative overflow-hidden h-[62vh] min-h-[460px]">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/stock/2024 Toyota Vellfire/3.jpg')" }}
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/35" aria-hidden="true" />

                <div className="relative container mx-auto px-6 h-full flex items-center">
                    <div className="max-w-3xl text-white">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-6">
                        <Users size={16} />
                        <span className="text-xs font-bold tracking-widest uppercase">{t('Owners', '车主')}</span>
                    </div>
                    <h1
                        className="text-4xl md:text-6xl font-bold tracking-tight text-white"
                        style={{ textShadow: '0 2px 24px rgba(0,0,0,0.55)' }}
                    >
                        {t('Owner Benefits', '车主权益')}
                    </h1>
                    <p
                        className="text-white/85 mt-5 max-w-xl text-lg"
                        style={{ textShadow: '0 1px 14px rgba(0,0,0,0.45)' }}
                    >
                        {t('Exclusive resources and support for Best Auto vehicle owners.', 'Best Auto 车主专属资源和支持。')}
                    </p>
                    </div>
                </div>
            </header>

            {/* Benefits Grid */}
            <section className="py-16 md:py-20">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {benefits.map((item, idx) => (
                            <div key={idx} className="toyota-card p-8 flex gap-5">
                                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-600 flex-shrink-0 flex items-center justify-center">
                                    <item.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-heading text-lg mb-2">{item.title}</h3>
                                    <p className="text-text-body text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-section">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-text-heading mb-4">{t('Need Assistance?', '需要帮助？')}</h2>
                    <p className="text-text-body mb-8 max-w-xl mx-auto">{t('Our owner support team is here to help with any questions.', '我们的车主支持团队随时为您解答问题。')}</p>
                    <Link to="/contact" className="toyota-btn-primary py-4 px-10">{t('Contact Support', '联系支持')}</Link>
                </div>
            </section>
        </div>
    );
};

const SupportPage = () => {
    const { t } = useLanguage();
    const faqs = useMemo(
        () => [
            {
                key: 'hours',
                q: t('What are your opening hours?', '营业时间是什么？'),
                a: t(
                    'Showroom: Mon-Sat 9am-6pm, Sun 10am-4pm. Service: Mon-Sat 8:30am-5:30pm.',
                    '展厅：周一至周六 9am-6pm，周日 10am-4pm。服务：周一至周六 8:30am-5:30pm。'
                ),
                icon: <Clock size={18} className="text-white" />,
                img: '/stock/back/services-hero.jpg.jpg',
                tag: t('Hours', '营业时间'),
            },
            {
                key: 'location',
                q: t('Where are you located?', '你们在哪里？'),
                a: t(
                    'We have a Homebush showroom and a Clyde service centre. Tap to open Google Maps.',
                    '我们有 Homebush 展厅与 Clyde 服务中心，点击可打开地图导航。'
                ),
                icon: <MapPin size={18} className="text-white" />,
                img: '/stock/back/explore-hero.jpg.jpg',
                tag: t('Location', '地址'),
            },
            {
                key: 'testdrive',
                q: t('Do you offer test drives?', '可以试驾吗？'),
                a: t(
                    'Yes. Contact us to book a test drive at our Homebush showroom.',
                    '可以。请联系我们在 Homebush 展厅预约试驾。'
                ),
                icon: <Car size={18} className="text-white" />,
                img: '/stock/2024 Toyota Vellfire/1.jpg',
                tag: t('Test drive', '试驾'),
            },
            {
                key: 'tradein',
                q: t('Can I trade in my current vehicle?', '可以置换吗？'),
                a: t('Yes, we accept trade-ins. Contact us for a valuation.', '可以，我们接受置换。联系我们获取估价。'),
                icon: <DollarSign size={18} className="text-white" />,
                img: '/stock/back/shop-hero.jpg.jpg',
                tag: t('Trade-in', '置换'),
            },
            {
                key: 'shipping',
                q: t('Do you ship interstate?', '可以跨州运送吗？'),
                a: t('Yes, we can arrange delivery Australia-wide.', '可以，我们可以安排全澳配送。'),
                icon: <Truck size={18} className="text-white" />,
                img: '/stock/2024 Toyota Vellfire/2.jpg',
                tag: t('Delivery', '配送'),
            },
        ],
        [t]
    );
    const [activeFaqKey, setActiveFaqKey] = useState('hours');
    const activeFaq = useMemo(() => faqs.find((x) => x.key === activeFaqKey) || faqs[0], [activeFaqKey, faqs]);
    return (
        <div className="min-h-screen bg-page">
            {/* Hero (image background) */}
            <header className="relative overflow-hidden h-[62vh] min-h-[460px]">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/stock/2024 Toyota Vellfire/4.jpg')" }}
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/35" aria-hidden="true" />

                <div className="relative container mx-auto px-6 h-full flex items-center">
                    <div className="max-w-3xl text-white">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-6">
                        <HelpCircle size={16} />
                        <span className="text-xs font-bold tracking-widest uppercase">{t('Support', '支持')}</span>
                    </div>
                    <h1
                        className="text-4xl md:text-6xl font-bold tracking-tight text-white"
                        style={{ textShadow: '0 2px 24px rgba(0,0,0,0.55)' }}
                    >
                        {t('How Can We Help?', '我们能帮您什么？')}
                    </h1>
                    <p
                        className="text-white/85 mt-5 max-w-xl text-lg"
                        style={{ textShadow: '0 1px 14px rgba(0,0,0,0.45)' }}
                    >
                        {t('Find answers to common questions or contact our team directly.', '查找常见问题的答案或直接联系我们的团队。')}
                    </p>
                    </div>
                </div>
            </header>

            {/* FAQ */}
            <section className="py-16 md:py-20">
                <div className="container mx-auto px-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-text-heading text-center mb-12">{t('Frequently Asked Questions', '常见问题')}</h2>
                    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
                        {/* Left: FAQ list */}
                        <div className="space-y-3">
                            {faqs.map((faq) => {
                                const isActive = faq.key === activeFaqKey;
                                return (
                                    <div key={faq.key} className={`toyota-card p-0 overflow-hidden ${isActive ? 'ring-2 ring-brand/20' : ''}`}>
                                        <button
                                            type="button"
                                            onClick={() => setActiveFaqKey(faq.key)}
                                            className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                                            aria-expanded={isActive}
                                        >
                                            <div>
                                                <p className="font-bold text-text-heading">{faq.q}</p>
                                                <p className={`mt-2 text-sm ${isActive ? 'text-text-body' : 'text-text-muted'} line-clamp-2`}>{faq.a}</p>
                                            </div>
                                            <ChevronDown size={20} className={`text-text-muted transition-transform ${isActive ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Mobile: media panel under the active item */}
                                        {isActive && (
                                            <div className="lg:hidden border-t border-black/5 bg-section">
                                                <div className="p-5">
                                                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                                                        <div
                                                            className="absolute inset-0 bg-cover bg-center"
                                                            style={{ backgroundImage: `url('${faq.img}')` }}
                                                            aria-hidden="true"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" aria-hidden="true" />
                                                        <div className="absolute left-4 top-4 inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm text-white rounded-full px-4 py-2">
                                                            {faq.icon}
                                                            <span className="text-xs font-bold tracking-widest uppercase">{faq.tag}</span>
                                                        </div>
                                                    </div>
                                                    {faq.key === 'location' && (
                                                        <div className="mt-4 flex flex-col sm:flex-row gap-3">
                                                            <a
                                                                href={`https://www.google.com/maps?q=${encodeURIComponent(SHOWROOM_ADDRESS)}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="toyota-btn-secondary py-3 px-6 text-center"
                                                            >
                                                                {t('Open Homebush map', '打开 Homebush 地图')}
                                                            </a>
                                                            <a
                                                                href={`https://www.google.com/maps?q=${encodeURIComponent(SERVICE_ADDRESS)}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="toyota-btn-secondary py-3 px-6 text-center"
                                                            >
                                                                {t('Open Clyde map', '打开 Clyde 地图')}
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right: media panel (desktop) */}
                        <div className="hidden lg:block sticky top-28">
                            <div className="toyota-card overflow-hidden">
                                <div className="relative aspect-[16/10]">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{ backgroundImage: `url('${activeFaq?.img}')` }}
                                        aria-hidden="true"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" aria-hidden="true" />
                                    <div className="absolute left-6 top-6 inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm text-white rounded-full px-4 py-2">
                                        {activeFaq?.icon}
                                        <span className="text-xs font-bold tracking-widest uppercase">{activeFaq?.tag}</span>
                                    </div>
                                    <div className="absolute left-6 bottom-6 right-6 text-white">
                                        <p className="text-lg font-bold" style={{ textShadow: '0 1px 14px rgba(0,0,0,0.45)' }}>
                                            {activeFaq?.q}
                                        </p>
                                        <p className="text-white/85 mt-2 text-sm" style={{ textShadow: '0 1px 14px rgba(0,0,0,0.45)' }}>
                                            {activeFaq?.a}
                                        </p>
                                        {activeFaq?.key === 'location' && (
                                            <div className="mt-4 flex flex-wrap gap-3">
                                                <a
                                                    href={`https://www.google.com/maps?q=${encodeURIComponent(SHOWROOM_ADDRESS)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm px-5 py-2 text-sm font-bold text-white hover:bg-white/15 transition-colors"
                                                >
                                                    {t('Homebush map', 'Homebush 地图')}
                                                </a>
                                                <a
                                                    href={`https://www.google.com/maps?q=${encodeURIComponent(SERVICE_ADDRESS)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm px-5 py-2 text-sm font-bold text-white hover:bg-white/15 transition-colors"
                                                >
                                                    {t('Clyde map', 'Clyde 地图')}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Options */}
            <section className="py-16 bg-section">
                <div className="container mx-auto px-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-text-heading text-center mb-12">{t('Contact Us', '联系我们')}</h2>
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className="toyota-card p-8 text-center">
                            <Phone size={32} className="mx-auto text-brand mb-4" />
                            <h3 className="font-bold text-text-heading mb-2">{t('Sales', '销售')}</h3>
                            <a href={`tel:${SALES_PHONE}`} className="text-brand font-bold">{SALES_PHONE_DISPLAY}</a>
                        </div>
                        <div className="toyota-card p-8 text-center">
                            <Wrench size={32} className="mx-auto text-brand mb-4" />
                            <h3 className="font-bold text-text-heading mb-2">{t('Service', '服务')}</h3>
                            <a href={`tel:${SERVICE_PHONE}`} className="text-brand font-bold">{SERVICE_PHONE_DISPLAY}</a>
                        </div>
                        <div className="toyota-card p-8 text-center">
                            <Mail size={32} className="mx-auto text-brand mb-4" />
                            <h3 className="font-bold text-text-heading mb-2">{t('Email', '邮箱')}</h3>
                            <Link to="/contact" className="text-brand font-bold hover:underline">{t('Send Message', '发送消息')}</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

// --- App Content ---
export function AppContent() {
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

    const TOP_NAV_ITEMS = useMemo(
        () => [
            {
                label: 'Models',
                to: '/inventory',
                dropdown: [
                    { label: 'Alphard', to: '/inventory?q=alphard' },
                    { label: 'Vellfire', to: '/inventory?q=vellfire' },
                    { label: 'GAC', to: '/inventory?q=gac' },
                    { label: t('All vehicles', '全部车辆'), to: '/inventory' },
                ],
            },
            {
                label: 'Shop',
                to: '/sell',
                dropdown: [
                    { label: t('Vehicles', '车辆库存'), to: '/inventory' },
                    { label: t('Accessories', '配件'), to: '/contact' },
                    { label: t('Trade-in', '以旧换新'), to: '/sell' },
                ],
            },
            {
                label: 'Services',
                to: '/services',
                dropdown: [
                    { label: t('Maintenance', '保养'), to: '/services#maintenance' },
                    { label: t('Repairs', '维修'), to: '/services#repairs' },
                    { label: t('Enquire / Book', '咨询 / 预约'), to: '/contact' },
                ],
            },
            {
                label: 'Owners',
                to: '/owners',
                dropdown: [
                    { label: t('Warranty', '质保'), to: '/owners' },
                    { label: t('Owner resources', '车主资源'), to: '/owners' },
                    { label: t('Roadside assist', '道路救援'), to: '/support' },
                ],
            },
            {
                label: 'Explore',
                to: '/about',
                dropdown: [
                    { label: t('About us', '关于我们'), to: '/about' },
                    { label: t('Latest arrivals', '最新到店'), to: '/inventory' },
                    { label: t('Careers', '加入我们'), to: '/contact' },
                ],
            },
            {
                label: 'Support',
                to: '/support',
                dropdown: [
                    { label: t('Contact us', '联系我们'), to: '/contact' },
                    { label: t('FAQs', '常见问题'), to: '/support' },
                    { label: SALES_PHONE_DISPLAY, to: `tel:${SALES_PHONE}` },
                ],
            },
        ],
        [t]
    );

    const NavItem = ({ path, label, dropdown }) => (
        <div className="group relative h-full flex items-center">
            {dropdown?.length ? (
                <button
                    type="button"
                    className="flex items-center gap-1.5 text-text-heading hover:text-brand transition-colors font-bold text-sm tracking-wide"
                >
                    {label} <ChevronDown size={14} className="text-text-muted group-hover:text-brand group-hover:rotate-180 transition-all duration-300" />
                </button>
            ) : (
                <Link
                    to={path}
                    className="flex items-center gap-1.5 font-medium text-[15px] tracking-wide text-text-heading hover:text-brand transition-colors"
                >
                    {label}
                </Link>
            )}
            {dropdown?.length ? (
                <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="bg-white shadow-2xl rounded-lg border border-black/10 overflow-hidden w-72 p-2">
                        <div className="px-4 py-2">
                            <p className="text-[10px] font-bold tracking-[0.22em] text-text-muted uppercase">{t('Browse', '浏览')}</p>
                        </div>
                        <div className="max-h-80 overflow-auto px-1 pb-2">
                            {dropdown.map((item) => {
                                const isTel = typeof item.to === 'string' && item.to.startsWith('tel:');
                                const Key = `${label}-${item.label}-${item.to}`;
                                return isTel ? (
                                    <a
                                        key={Key}
                                        href={item.to}
                                        className="block w-full text-left px-3 py-2.5 text-sm font-semibold text-text-body hover:bg-surface rounded-lg transition-colors"
                                    >
                                        {item.label}
                                    </a>
                                ) : (
                                    <Link
                                        key={Key}
                                        to={item.to}
                                        className="block w-full text-left px-3 py-2.5 text-sm font-semibold text-text-body hover:bg-surface rounded-lg transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );

    return (
        <div className="min-h-screen bg-page font-sans">
            <ScrollToTop />

            {/* Toyota.com.au-like Header (layout-only; account/search non-functional) */}
            <nav className="sticky top-0 z-40 bg-white border-b border-black/10 h-20">
                <div className="container mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-12 h-full">
                        {/* Brand */}
                        <Link to="/" className="flex items-center gap-3">
                            <img src={LOGO_URL} alt="Logo" className="h-10 w-auto object-contain" />
                            <span className="sr-only">{BRAND_NAME}</span>
                        </Link>

                        {/* Primary nav */}
                        <div className="hidden md:flex items-center gap-10 h-full">
                            {TOP_NAV_ITEMS.map((item) => (
                                <NavItem key={item.label} path={item.to} label={item.label} dropdown={item.dropdown} />
                            ))}
                        </div>
                    </div>

                    {/* Utilities */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={toggleLang}
                            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 bg-white text-xs font-bold text-text-heading hover:bg-surface transition-colors"
                            aria-label={t('Switch language', '切换语言')}
                        >
                            <Globe size={16} />
                            {lang === 'zh' ? 'EN' : '中文'}
                        </button>

                        <button
                            className="md:hidden p-2 text-text-heading bg-surface rounded-full hover:bg-black/5 transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label={t('Open menu', '打开菜单')}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 top-[80px] bg-white z-30 p-6 flex flex-col gap-6 overflow-y-auto border-t border-black/10">
                    {TOP_NAV_ITEMS.map((item) => (
                        <Link key={item.label} to={item.to} className="text-2xl font-bold text-text-heading tracking-tight">
                            {item.label}
                        </Link>
                    ))}
                    <button
                        type="button"
                        onClick={toggleLang}
                        className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-black/10 bg-white text-sm font-bold text-text-heading hover:bg-surface transition-colors"
                    >
                        <Globe size={16} />
                        {lang === 'zh' ? 'English' : '中文'}
                    </button>
                </div>
            )}

            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<AlphardHomePage cars={carsWithLocalStock} />} />
                    <Route path="/inventory" element={<InventoryPage cars={carsWithLocalStock} category="toyota" />} />
                    <Route path="/vehicle/:id" element={<CarDetailPage cars={carsWithLocalStock} />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/sell" element={<SellPage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/owners" element={<OwnersPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                </Routes>
            </main>

            {/* ========== TOYOTA-STYLE FOOTER ========== */}
            <footer className="bg-white border-t border-black/10 text-text-body">
                {/* Main Footer Links */}
                <div className="container mx-auto px-6 py-16">
                    <div className="max-w-site mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-6">
                        {/* Column 1: Models */}
                        <div>
                            <h5 className="font-bold text-text-heading text-sm mb-4">{t('Models', '车型')}</h5>
                            <ul className="space-y-2.5 text-sm">
                                <li><Link to="/inventory?q=alphard" className="hover:text-brand transition-colors">Alphard</Link></li>
                                <li><Link to="/inventory?q=vellfire" className="hover:text-brand transition-colors">Vellfire</Link></li>
                                <li><Link to="/inventory?q=gac" className="hover:text-brand transition-colors">GAC</Link></li>
                                <li><Link to="/inventory" className="hover:text-brand transition-colors">{t('All vehicles', '全部车辆')}</Link></li>
                            </ul>
                        </div>

                        {/* Column 2: Shop */}
                        <div>
                            <h5 className="font-bold text-text-heading text-sm mb-4">{t('Shop', '选购')}</h5>
                            <ul className="space-y-2.5 text-sm">
                                <li><Link to="/inventory" className="hover:text-brand transition-colors">{t('Vehicles', '车辆库存')}</Link></li>
                                <li><Link to="/contact" className="hover:text-brand transition-colors">{t('Accessories', '配件')}</Link></li>
                                <li><Link to="/sell" className="hover:text-brand transition-colors">{t('Trade-in', '以旧换新')}</Link></li>
                            </ul>
                        </div>

                        {/* Column 3: Services */}
                        <div>
                            <h5 className="font-bold text-text-heading text-sm mb-4">{t('Services', '服务')}</h5>
                            <ul className="space-y-2.5 text-sm">
                                <li><Link to="/services#maintenance" className="hover:text-brand transition-colors">{t('Maintenance', '保养')}</Link></li>
                                <li><Link to="/services#repairs" className="hover:text-brand transition-colors">{t('Repairs', '维修')}</Link></li>
                                <li><Link to="/contact" className="hover:text-brand transition-colors">{t('Enquire / Book', '咨询 / 预约')}</Link></li>
                            </ul>
                        </div>

                        {/* Column 4: Owners */}
                        <div>
                            <h5 className="font-bold text-text-heading text-sm mb-4">{t('Owners', '车主')}</h5>
                            <ul className="space-y-2.5 text-sm">
                                <li><Link to="/owners" className="hover:text-brand transition-colors">{t('Warranty', '质保')}</Link></li>
                                <li><Link to="/owners" className="hover:text-brand transition-colors">{t('Owner resources', '车主资源')}</Link></li>
                                <li><Link to="/support" className="hover:text-brand transition-colors">{t('Roadside assist', '道路救援')}</Link></li>
                            </ul>
                        </div>

                        {/* Column 5: Explore */}
                        <div>
                            <h5 className="font-bold text-text-heading text-sm mb-4">{t('Explore', '探索')}</h5>
                            <ul className="space-y-2.5 text-sm">
                                <li><Link to="/about" className="hover:text-brand transition-colors">{t('About us', '关于我们')}</Link></li>
                                <li><Link to="/inventory" className="hover:text-brand transition-colors">{t('Latest arrivals', '最新到店')}</Link></li>
                                <li><Link to="/contact" className="hover:text-brand transition-colors">{t('Careers', '加入我们')}</Link></li>
                            </ul>
                        </div>

                        {/* Column 6: Support */}
                        <div>
                            <h5 className="font-bold text-text-heading text-sm mb-4">{t('Support', '支持')}</h5>
                            <ul className="space-y-2.5 text-sm">
                                <li><Link to="/contact" className="hover:text-brand transition-colors">{t('Contact us', '联系我们')}</Link></li>
                                <li><Link to="/support" className="hover:text-brand transition-colors">{t('FAQs', '常见问题')}</Link></li>
                                <li><a href={`tel:${SALES_PHONE}`} className="hover:text-brand transition-colors">{SALES_PHONE_DISPLAY}</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Contact Bar */}
                <div className="border-t border-black/5 bg-section">
                    <div className="container mx-auto px-6 py-8">
                        <div className="max-w-site mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-center gap-4">
                                <img src={LOGO_URL} alt="Logo" className="h-10 w-auto object-contain" />
                                <div>
                                    <p className="font-bold text-text-heading">{BRAND_NAME}</p>
                                    <p className="text-sm text-text-muted">{t('Premium Alphard & Vellfire Specialist', 'Alphard & Vellfire 专营')}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                                <a href={`https://www.google.com/maps?q=${encodeURIComponent(SHOWROOM_ADDRESS)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:text-brand transition-colors">
                                    <MapPin size={16} className="text-brand" />
                                    <span className="hidden sm:inline">{SHOWROOM_ADDRESS}</span>
                                    <span className="sm:hidden">{t('Homebush', 'Homebush')}</span>
                                </a>
                                <a href={`tel:${SALES_PHONE}`} className="flex items-center gap-2 text-sm hover:text-brand transition-colors">
                                    <Phone size={16} className="text-brand" />
                                    {SALES_PHONE_DISPLAY}
                                </a>
                                <div className="flex items-center gap-3">
                                    <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="w-9 h-9 bg-white border border-black/10 rounded-full flex items-center justify-center hover:bg-brand hover:border-brand hover:text-white transition-all" aria-label="Instagram"><Instagram size={16} /></a>
                                    <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" className="w-9 h-9 bg-white border border-black/10 rounded-full flex items-center justify-center hover:bg-brand hover:border-brand hover:text-white transition-all" aria-label="Facebook"><Facebook size={16} /></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-black/5">
                    <div className="container mx-auto px-6 py-6">
                        <div className="max-w-site mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted">
                            <p>&copy; 2026 {BRAND_NAME}. {t('All rights reserved.', '保留所有权利。')}</p>
                            <div className="flex flex-wrap justify-center gap-6">
                                <Link to="/support" className="hover:text-text-body transition-colors">{t('Privacy policy', '隐私政策')}</Link>
                                <Link to="/support" className="hover:text-text-body transition-colors">{t('Conditions of use', '使用条款')}</Link>
                                <Link to="/contact" className="hover:text-text-body transition-colors">{t('Complaints', '投诉')}</Link>
                            </div>
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