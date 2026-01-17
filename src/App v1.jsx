import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Phone, MessageCircle, Menu, X, ChevronDown, Filter, Car, Sparkles, Send, Loader2, Bot } from 'lucide-react';

// --- Configuration ---
const apiKey = ""; // 如果您有Key，填在这里

// --- Mock Data ---
const INITIAL_CARS = [
    {
        id: 1,
        title: "2024 Toyota Alphard Executive Lounge",
        price: 109900,
        mileage: 107,
        year: 2024,
        fuel: "Hybrid",
        location: "Burwood Showroom",
        image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000",
        status: "New Arrival"
    },
    {
        id: 2,
        title: "2024 Toyota Vellfire Z Premier",
        price: 101800,
        mileage: 10,
        year: 2024,
        fuel: "Petrol",
        location: "Strathfield Showroom",
        image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=1000",
        status: "In Stock"
    },
    {
        id: 3,
        title: "2023 Toyota Alphard SC Package",
        price: 94800,
        mileage: 5500,
        year: 2023,
        fuel: "Petrol",
        location: "Burwood Showroom",
        image: "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&q=80&w=1000",
        status: "Best Seller"
    },
    {
        id: 4,
        title: "2024 Toyota Vellfire Executive",
        price: 105800,
        mileage: 4708,
        year: 2024,
        fuel: "Hybrid",
        location: "Strathfield Showroom",
        image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1000",
        status: "In Stock"
    },
    {
        id: 5,
        title: "2023 Toyota Vellfire Golden Eyes",
        price: 101800,
        mileage: 6087,
        year: 2023,
        fuel: "Petrol",
        location: "Burwood Showroom",
        image: "https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=1000",
        status: "Reserved"
    },
    {
        id: 6,
        title: "2024 Toyota Alphard Z",
        price: 89800,
        mileage: 15,
        year: 2024,
        fuel: "Petrol",
        location: "Burwood Showroom",
        image: "https://images.unsplash.com/photo-1594276779774-4b53114995f3?auto=format&fit=crop&q=80&w=1000",
        status: "New Arrival"
    }
];

// --- AI Service ---
const generateAIResponse = async (prompt, systemInstruction = "") => {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                }),
            }
        );
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
    } catch (error) {
        console.error("AI Error:", error);
        return "Sorry, our AI service is currently unavailable. Please try again later.";
    }
};

const CarCard = ({ car, onOpenHighlights }) => {
    return (
        <div className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full relative">
            {/* Image Container */}
            <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                    src={car.image}
                    alt={car.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {car.status}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-xs font-medium flex items-center gap-1">
                        <MapPin size={12} /> {car.location}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 min-h-[3.5rem] mb-2 group-hover:text-red-600 transition-colors">
                    {car.title}
                </h3>

                <div className="flex flex-wrap gap-2 mb-4 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded">{car.year}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">{car.mileage.toLocaleString()} kms</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">{car.fuel}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">Auto</span>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400">Drive Away Price</span>
                        <span className="text-xl font-bold text-red-600">${car.price.toLocaleString()}</span>
                    </div>

                    <div className="flex gap-2">
                        {/* AI Feature Button */}
                        <button
                            onClick={() => onOpenHighlights(car)}
                            className="bg-indigo-100 text-indigo-700 p-2 rounded-full hover:bg-indigo-200 transition-colors group/ai relative"
                            title="Generate AI Highlights"
                        >
                            <Sparkles size={20} />
                        </button>
                        <button className="bg-gray-900 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                            <MessageCircle size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FilterWidget = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg -mt-16 relative z-20 mx-4 lg:mx-auto max-w-6xl border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Make/Model */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Make & Model</label>
                    <div className="relative">
                        <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-700 font-medium">
                            <option>Any Make</option>
                            <option>Toyota Alphard</option>
                            <option>Toyota Vellfire</option>
                            <option>Lexus LM</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>

                {/* Year Range */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Year Range</label>
                    <div className="relative">
                        <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-700 font-medium">
                            <option>Any Year</option>
                            <option>2024+</option>
                            <option>2023 - 2024</option>
                            <option>2020 - 2022</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>

                {/* Price Range */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Price Range</label>
                    <div className="relative">
                        <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-700 font-medium">
                            <option>Any Price</option>
                            <option>$80k - $100k</option>
                            <option>$100k - $120k</option>
                            <option>$120k+</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Search size={20} />
                        Search Cars
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- AI Chat Widget ---
const ChatWidget = ({ cars }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! I'm your AI Assistant. I can help you find the perfect Alphard or Vellfire from our current stock. How can I help you today?" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg = inputValue;
        setInputValue("");
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        // Prepare system prompt with inventory data
        const systemPrompt = `
      You are a professional, helpful, and polite sales assistant for 'AUTO DEALER', a luxury car dealership in Sydney specializing in Toyota Alphard and Vellfire.
      
      Here is our CURRENT INVENTORY data (JSON format):
      ${JSON.stringify(cars)}

      Rules:
      1. ONLY recommend cars from the provided inventory list.
      2. If a user asks for something we don't have, politely suggest the closest alternative from our list.
      3. Be concise and use bullet points when listing cars.
      4. If asked about location, we have showrooms in Burwood and Strathfield.
      5. Highlight low mileage and recent years as key selling points.
      6. Use emojis occasionally to be friendly.
      7. All prices are in Australian Dollars (AUD).
    `;

        const aiReply = await generateAIResponse(userMsg, systemPrompt);

        setMessages(prev => [...prev, { role: 'assistant', text: aiReply }]);
        setIsLoading(false);
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white p-4 rounded-full shadow-2xl hover:bg-red-600 transition-all duration-300 transform hover:scale-110 flex items-center gap-2"
            >
                {isOpen ? <X size={24} /> : <><Sparkles size={20} className="animate-pulse" /><MessageCircle size={24} /></>}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden max-h-[600px] h-[500px] animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-gray-900 p-4 text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold">AI Sales Assistant</h3>
                            <p className="text-xs text-gray-300 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                            </p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-red-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                                    }`}>
                                    <div className="whitespace-pre-wrap">{msg.text}</div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-red-600" />
                                    <span className="text-xs text-gray-400">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about our cars..."
                                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !inputValue.trim()}
                                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// --- AI Highlights Modal ---
const HighlightsModal = ({ car, onClose }) => {
    const [highlights, setHighlights] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHighlights = async () => {
            const prompt = `
        Analyze this car and generate 3 short, punchy, and exciting bullet points (max 10 words each) explaining why a customer should buy it.
        Car: ${car.title}
        Price: $${car.price}
        Mileage: ${car.mileage}km
        Year: ${car.year}
        Status: ${car.status}
        
        Format: Just the bullet points, start each with an emoji.
      `;
            const result = await generateAIResponse(prompt);
            setHighlights(result);
            setLoading(false);
        };
        fetchHighlights();
    }, [car]);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                        <Sparkles size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">AI Smart Highlights</h3>
                </div>

                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                        <img src={car.image} alt="mini" className="w-16 h-12 object-cover rounded" />
                        <div>
                            <p className="font-bold text-sm text-gray-900 line-clamp-1">{car.title}</p>
                            <p className="text-xs text-red-600 font-bold">${car.price.toLocaleString()}</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-3 py-4">
                            <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
                            <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse"></div>
                            <p className="text-center text-xs text-gray-400 mt-2">AI is analyzing vehicle specs...</p>
                        </div>
                    ) : (
                        <div className="prose prose-sm prose-indigo">
                            <div className="whitespace-pre-line font-medium text-gray-700 leading-relaxed">
                                {highlights}
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={onClose} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors">
                    Got it!
                </button>
            </div>
        </div>
    );
};

export default function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [cars, setCars] = useState(INITIAL_CARS);
    const [scrolled, setScrolled] = useState(false);

    // AI Modal State
    const [selectedCarForAI, setSelectedCarForAI] = useState(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">

            {/* --- Top Bar (Contact Info) --- */}
            <div className="bg-gray-900 text-gray-300 py-2 text-xs md:text-sm">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 hover:text-white cursor-pointer"><Phone size={14} /> 02 8970 2037</span>
                        <span className="hidden md:flex items-center gap-1 hover:text-white cursor-pointer"><MapPin size={14} /> Burwood & Strathfield</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="hover:text-white cursor-pointer">WeChat: Autohome388</span>
                        <span className="hidden sm:inline">|</span>
                        <span className="hover:text-white cursor-pointer">Language: EN / 中文</span>
                    </div>
                </div>
            </div>

            {/* --- Main Navigation --- */}
            <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 backdrop-blur-sm py-4'}`}>
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center">
                        {/* Logo Area */}
                        <div className="flex items-center gap-3">
                            <img
                                src="https://static.wixstatic.com/media/943eef_77866c00442d480bbe5b61d50c9bb6bb~mv2.jpg/v1/fill/w_387,h_269,al_c,lg_1,q_80,enc_avif,quality_auto/image_edited.jpg"
                                alt="Logo"
                                className="h-10 w-auto object-contain rounded"
                            />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 leading-none tracking-tight">AUTO DEALER</h1>
                                <p className="text-xs text-gray-500 tracking-widest uppercase">Premium Imports</p>
                            </div>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-8 font-medium text-gray-700">
                            <a href="#" className="hover:text-red-600 transition-colors">Home</a>
                            <a href="#" className="text-red-600">Buy a Car</a>
                            <a href="#" className="hover:text-red-600 transition-colors">Sell Your Car</a>
                            <a href="#" className="hover:text-red-600 transition-colors">Showrooms</a>
                            <a href="#" className="hover:text-red-600 transition-colors">About Us</a>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-gray-700 p-2"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
                        <div className="flex flex-col p-4 gap-4">
                            <a href="#" className="font-medium text-gray-900">Home</a>
                            <a href="#" className="font-medium text-red-600">Buy a Car</a>
                            <a href="#" className="font-medium text-gray-900">Sell Your Car</a>
                            <a href="#" className="font-medium text-gray-900">Showrooms</a>
                            <a href="#" className="font-medium text-gray-900">Contact</a>
                        </div>
                    </div>
                )}
            </nav>

            {/* --- Hero Section --- */}
            <header className="relative h-[500px] md:h-[600px] bg-gray-900 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=2000"
                        alt="Luxury MPV"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
                    <div className="max-w-2xl text-white">
                        <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                            Australia's #1 Specialist
                        </span>
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Premium Alphard & <br /> Vellfire Dealer
                        </h2>
                        <p className="text-lg text-gray-200 mb-8 max-w-lg">
                            Experience the pinnacle of luxury travel. We specialize in importing the finest 7-seater vehicles for your family and business needs.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="bg-white text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
                                View Inventory
                            </button>
                            <button className="border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-gray-900 transition-colors">
                                Visit Showroom
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Search Widget Overlay --- */}
            <FilterWidget />

            {/* --- Inventory Section --- */}
            <section className="py-16 container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Latest Arrivals</h2>
                        <p className="text-gray-500">Discover our hand-picked selection of premium vehicles.</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
                        <button className="px-4 py-2 bg-gray-100 text-gray-900 font-medium rounded text-sm">All Cars</button>
                        <button className="px-4 py-2 text-gray-500 hover:bg-gray-50 font-medium rounded text-sm transition-colors">Alphard</button>
                        <button className="px-4 py-2 text-gray-500 hover:bg-gray-50 font-medium rounded text-sm transition-colors">Vellfire</button>
                    </div>
                </div>

                {/* Car Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cars.map(car => (
                        <CarCard
                            key={car.id}
                            car={car}
                            onOpenHighlights={setSelectedCarForAI}
                        />
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <button className="inline-flex items-center gap-2 text-red-600 font-bold border-2 border-red-600 px-8 py-3 rounded-lg hover:bg-red-600 hover:text-white transition-colors">
                        View All Inventory <Car size={20} />
                    </button>
                </div>
            </section>

            {/* --- Services / Features Strip --- */}
            <section className="bg-gray-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-6 border border-gray-800 rounded-xl bg-gray-800/50">
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🏆</div>
                            <h3 className="text-xl font-bold mb-2">Trusted Quality</h3>
                            <p className="text-gray-400">Every vehicle undergoes a rigorous 100-point mechanical inspection before sale.</p>
                        </div>
                        <div className="p-6 border border-gray-800 rounded-xl bg-gray-800/50">
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🌏</div>
                            <h3 className="text-xl font-bold mb-2">Direct Import</h3>
                            <p className="text-gray-400">We source directly from Japan to ensure the highest grade and lowest mileage.</p>
                        </div>
                        <div className="p-6 border border-gray-800 rounded-xl bg-gray-800/50">
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🔧</div>
                            <h3 className="text-xl font-bold mb-2">Extended Warranty</h3>
                            <p className="text-gray-400">Drive with peace of mind with our comprehensive warranty options available.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        {/* Brand Column */}
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <img
                                    src="https://via.placeholder.com/50x50/dc2626/ffffff?text=LOGO"
                                    alt="Logo"
                                    className="h-8 w-auto object-contain rounded"
                                />
                                <span className="font-bold text-lg text-gray-900">AUTO DEALER</span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                Your premier destination for luxury 7-seater vehicles in Sydney. Dedicated to quality, service, and integrity.
                            </p>
                            <div className="flex gap-4">
                                {/* Social Placeholders */}
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"><MessageCircle size={16} /></div>
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"><Phone size={16} /></div>
                            </div>
                        </div>

                        {/* Links Column */}
                        <div>
                            <h4 className="font-bold text-gray-900 mb-6">Quick Links</h4>
                            <ul className="space-y-3 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-red-600">Home</a></li>
                                <li><a href="#" className="hover:text-red-600">Showroom Inventory</a></li>
                                <li><a href="#" className="hover:text-red-600">Sell Your Car</a></li>
                                <li><a href="#" className="hover:text-red-600">Finance Calculator</a></li>
                                <li><a href="#" className="hover:text-red-600">About Us</a></li>
                            </ul>
                        </div>

                        {/* Locations Column */}
                        <div>
                            <h4 className="font-bold text-gray-900 mb-6">Our Showrooms</h4>
                            <div className="space-y-4 text-sm text-gray-500">
                                <div>
                                    <strong className="block text-gray-900 mb-1">Burwood</strong>
                                    <p>388-390 Parramatta Road<br />Burwood NSW 2134</p>
                                </div>
                                <div>
                                    <strong className="block text-gray-900 mb-1">Strathfield</strong>
                                    <p>416 Parramatta Road<br />Strathfield NSW 2135</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Column */}
                        <div>
                            <h4 className="font-bold text-gray-900 mb-6">Contact Us</h4>
                            <ul className="space-y-4 text-sm text-gray-500">
                                <li className="flex items-start gap-3">
                                    <Phone size={18} className="text-red-600 mt-0.5" />
                                    <span>02 8970 2037</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <MessageCircle size={18} className="text-red-600 mt-0.5" />
                                    <span>WeChat: Autohome388</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-4 h-4 rounded-full bg-green-500 mt-1"></div>
                                    <span>Open 7 Days<br />9:30am - 5:30pm</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                        <p>&copy; 2024 Auto Dealer Pty Ltd. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-gray-600">Privacy Policy</a>
                            <a href="#" className="hover:text-gray-600">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* --- AI Chat Overlay --- */}
            <ChatWidget cars={cars} />

            {/* --- AI Highlights Modal (Conditionally Rendered) --- */}
            {selectedCarForAI && (
                <HighlightsModal
                    car={selectedCarForAI}
                    onClose={() => setSelectedCarForAI(null)}
                />
            )}
        </div>
    );
}