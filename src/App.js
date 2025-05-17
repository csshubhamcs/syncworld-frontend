// Filename: src/App.js
import React, { useState, useEffect, useRef } from 'react';
import Keycloak from 'keycloak-js';
import { 
    ChevronDown, LogIn, LogOut, UserCircle, CalendarDays, PlusCircle, 
    Zap, Users, MessageSquare, Settings, Search, ArrowRight, Clock,
    Lightbulb, Palette, Brain, Globe, ShieldCheck, BookOpen, Airplay, BarChart3, CheckCircle
} from 'lucide-react';

// --- Keycloak Configuration ---
const keycloakConfig = {
    url: 'http://localhost:8080',
    realm: 'syncworld-realm',
    clientId: 'syncworld-frontend-app'
};

// --- Enhanced Mock Data for Sessions ---
const mockUpcomingSessions = [
    { id: '1', title: 'Quantum Entanglement Explained', host: 'Dr. Eva Core', dateTime: '2025-08-15T18:00:00Z', description: 'Unravel quantum mechanics and its future in computing. A beginner-friendly exploration of a mind-bending topic.', category: 'Deep Tech', tags: ['Quantum Physics', 'Future Tech', 'Science'], duration: '90 mins', level: 'Beginner', icon: <Lightbulb size={32} className="text-purple-300"/>, color: 'purple', accentColor: 'rose' },
    { id: '2', title: 'AI-Driven Art & Design Workshop', host: 'Arturo Synth', dateTime: '2025-08-17T15:30:00Z', description: 'Use cutting-edge AI to create stunning visual art and designs. No prior art experience needed!', category: 'Creative AI', tags: ['AI', 'Art', 'Design', 'Workshop'], duration: '3 hours', level: 'All Levels', icon: <Palette size={32} className="text-pink-300"/>, color: 'pink', accentColor: 'rose' },
    { id: '3', title: 'The Future of DAOs & Web3 Governance', host: 'Lex Crypton', dateTime: '2025-08-20T20:00:00Z', description: 'Exploring the structure, governance models, and societal impact of Decentralized Autonomous Organizations.', category: 'Web3', tags: ['Blockchain', 'DAO', 'Governance'], duration: '2 hours', level: 'Intermediate', icon: <ShieldCheck size={32} className="text-indigo-300"/>, color: 'indigo', accentColor: 'rose' },
    { id: '4', title: 'Neuro-Linguistic Programming for Peak Performance', host: 'Max Well', dateTime: '2025-08-22T13:00:00Z', description: 'Unlock your potential by understanding and reprogramming your mind for ultimate success and clarity.', category: 'Mind Science', tags: ['NLP', 'Mindset', 'Productivity'], duration: '75 mins', level: 'Beginner', icon: <Brain size={32} className="text-green-300"/>, color: 'green', accentColor: 'rose' },
    { id: '5', title: 'Sustainable Urban Ecosystems: 2050 Vision', host: 'Terra Verde', dateTime: '2025-08-25T11:00:00Z', description: 'A visionary look at eco-cities, smart infrastructure, and community-based sustainability solutions for the next generation.', category: 'Sustainability', tags: ['Urban Planning', 'Eco-Living', 'Smart City'], duration: '2.5 hours', level: 'All Levels', icon: <Globe size={32} className="text-teal-300"/>, color: 'teal', accentColor: 'rose' },
    { id: '6', title: 'Advanced Asynchronous JavaScript Patterns', host: 'Dev Async', dateTime: '2025-08-28T10:00:00Z', description: 'From callbacks to Promises and Async/Await, and beyond. Conquer complex async logic in modern JS.', category: 'Software Development', tags: ['JavaScript', 'Web Dev', 'Advanced'], duration: '4 hours', level: 'Advanced', icon: <BookOpen size={32} className="text-yellow-300"/>, color: 'yellow', accentColor: 'rose' },
];

// --- Helper Components ---
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full">
        <svg className="animate-spin h-20 w-20 text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const Modal = ({ isOpen, onClose, title, children, size = 'lg' }) => {
    if (!isOpen) return null;
    const sizeClasses = {
        sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl', '3xl': 'max-w-3xl'
    };
    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-out opacity-0 animate-fade-in">
            <div className={`bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl p-6 sm:p-8 w-full ${sizeClasses[size]} transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modal-appear relative`}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-colors rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-800/80 hover:bg-slate-700/90"
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <h2 className="text-2xl sm:text-3xl font-bold text-rose-400 mb-6 sm:mb-8 text-center sm:text-left">{title}</h2>
                {children}
            </div>
            <style jsx global>{`
                @keyframes fadeInAnimation { to { opacity: 1; } }
                .animate-fade-in { animation: fadeInAnimation 0.3s forwards; }
                @keyframes modalAppearAnimation { to { opacity: 1; transform: scale(1); } }
                .animate-modal-appear { animation: modalAppearAnimation 0.3s 0.1s forwards; }
            `}</style>
        </div>
    );
};
// --- End Helper Components ---

const App = () => {
    const [keycloak, setKeycloak] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false);
    
    const profileDropdownRef = useRef(null);
    const keycloakInitialized = useRef(false);

    useEffect(() => {
        if (keycloakInitialized.current) return;
        keycloakInitialized.current = true;
        const kcInstance = new Keycloak(keycloakConfig);

        kcInstance.onReady = (auth) => console.log("[DEBUG] Keycloak onReady, authenticated:", auth);
        kcInstance.onAuthSuccess = () => {
            console.log("[DEBUG] Keycloak onAuthSuccess.");
            if (window.location.search.includes("code=") || window.location.hash.includes("code=")) {
                window.history.replaceState(null, '', window.location.pathname);
            }
        };
        kcInstance.onAuthError = (err) => console.error("[DEBUG] Keycloak onAuthError:", err);
        kcInstance.onAuthLogout = () => {
            console.log("[DEBUG] Keycloak onAuthLogout");
            setAuthenticated(false); setUserInfo(null); setKeycloak(null); 
            keycloakInitialized.current = false; 
        };
        kcInstance.onTokenExpired = () => kcInstance.updateToken(30).catch(() => kcInstance.logout());

        kcInstance.init({
            onLoad: 'check-sso', 
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html', 
            pkceMethod: 'S256',
            checkLoginIframe: true, 
        })
        .then(auth => {
            if (window.location.search.includes("code=") || window.location.hash.includes("code=")) {
                window.history.replaceState(null, '', window.location.pathname);
            }
            setKeycloak(kcInstance); setAuthenticated(auth); setIsLoading(false); 
            if (auth) {
                kcInstance.loadUserInfo().then(info => setUserInfo(info));
                setUpcomingSessions(mockUpcomingSessions); 
            }
        })
        .catch(err => {
            setError(`Auth Init Error: ${err.error_description || err.error || JSON.stringify(err)}`);
            setIsLoading(false); keycloakInitialized.current = false; 
        });
    }, []); 

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const login = () => { if (keycloak) keycloak.login(); };
    const logout = () => { if (keycloak) keycloak.logout({ redirectUri: window.location.origin }); };
    
    const handleCreateSession = (sessionData) => {
        const newSession = { 
            ...sessionData, id: String(Date.now()), 
            host: userInfo?.name || userInfo?.preferred_username || 'You',
            icon: <Zap size={36} className="text-gray-400"/>,
            color: ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'teal'][Math.floor(Math.random() * 8)] 
        };
        setUpcomingSessions(prev => [newSession, ...prev]);
        setIsCreateSessionModalOpen(false);
    };

    const backgroundClass = "bg-slate-950 text-slate-300"; // Consistent dark background

    if (isLoading) {
        return (
            <div className={`min-h-screen ${backgroundClass} flex flex-col items-center justify-center p-4`}>
                <LoadingSpinner />
                <p className="mt-8 text-xl font-semibold text-rose-400 animate-pulse">Connecting to SyncWorld Matrix...</p>
            </div>
        );
    }
    if (error) { 
        return (
            <div className={`min-h-screen ${backgroundClass} flex flex-col items-center justify-center p-6 text-center`}>
                <Zap size={64} className="mb-6 text-red-500 animate-pulse" />
                <h1 className="text-4xl font-bold mb-4 text-red-400">System Anomaly Detected</h1>
                <p className="mb-4 text-slate-300 max-w-lg">{error}</p>
                <p className="text-md mb-8 text-slate-400 max-w-lg">Please verify Keycloak ('syncworld-frontend-app' in 'syncworld-realm') configuration: Valid Redirect URIs (e.g., http://localhost:3000/*) and Web Origins (e.g., http://localhost:3000).</p>
                <button onClick={() => { setError(null); setIsLoading(true); keycloakInitialized.current = false; window.location.reload(); }} className="mt-6 px-10 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-red-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-opacity-50 shadow-xl hover:shadow-red-500/40 transform hover:scale-105">
                    Re-Initiate Connection
                </button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${backgroundClass} font-sans antialiased selection:bg-rose-500 selection:text-white`}>
            {/* Futuristic Header */}
            <header className="bg-slate-900/80 backdrop-blur-2xl shadow-2xl sticky top-0 z-50 border-b border-slate-800/70">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-24">
                        <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => window.location.href = '/'}>
                            <Airplay className="h-10 w-10 sm:h-12 sm:w-12 text-rose-400 group-hover:text-rose-300 transition-colors duration-300 transform group-hover:animate-pulse-fast" />
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-red-400 to-pink-500 group-hover:opacity-90 transition-opacity">
                                SyncWorld
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4 sm:space-x-6">
                            {authenticated && (
                                <button
                                    onClick={() => setIsCreateSessionModalOpen(true)}
                                    className="flex items-center px-4 sm:px-5 py-2.5 sm:py-3 bg-rose-500 text-white text-sm sm:text-md font-semibold rounded-xl hover:bg-rose-600/90 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-opacity-75 shadow-xl hover:shadow-rose-500/50 transform hover:scale-105 active:scale-95"
                                >
                                    <PlusCircle size={18} className="mr-2" />
                                    Host Session
                                </button>
                            )}
                            {!authenticated ? (
                                <button
                                    onClick={login}
                                    className="flex items-center px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-sm sm:text-md font-semibold rounded-xl hover:from-sky-600 hover:to-cyan-600 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 shadow-xl hover:shadow-sky-500/50 transform hover:scale-105 active:scale-95"
                                >
                                    <LogIn size={18} className="mr-2" /> Connect / Register
                                </button>
                            ) : (
                                <div className="relative" ref={profileDropdownRef}>
                                    <button
                                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                        className="flex items-center space-x-2 p-2.5 sm:p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/90 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    >
                                        <UserCircle size={22} className="text-rose-400" />
                                        <span className="hidden lg:inline text-sm font-medium text-slate-300">{userInfo?.preferred_username || userInfo?.name || 'User Profile'}</span>
                                        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isProfileDropdownOpen && (
                                        <div className="absolute right-0 mt-3 w-64 bg-slate-800 rounded-xl shadow-2xl py-2.5 z-50 border border-slate-700 animate-fade-in-down overflow-hidden">
                                            <div className="px-4 py-3 border-b border-slate-700">
                                                <p className="text-sm font-semibold text-slate-100">Accessing As</p>
                                                <p className="text-xs text-rose-400 truncate" title={userInfo?.preferred_username}>{userInfo?.preferred_username}</p>
                                            </div>
                                            <a href="#" onClick={(e) => { e.preventDefault(); alert("My Sessions link clicked!"); setIsProfileDropdownOpen(false);}} className="flex items-center px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/70 hover:text-rose-300 transition-colors duration-150 group">
                                                <CalendarDays size={16} className="mr-3 text-slate-400 group-hover:text-rose-400 transition-colors" /> My Sessions
                                            </a>
                                            <a href="#" onClick={(e) => { e.preventDefault(); alert("Profile page link clicked!"); setIsProfileDropdownOpen(false);}} className="flex items-center px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/70 hover:text-rose-300 transition-colors duration-150 group">
                                                <Users size={16} className="mr-3 text-slate-400 group-hover:text-rose-400 transition-colors" /> Edit Profile
                                            </a>
                                            <a href="#" onClick={(e) => { e.preventDefault(); alert("Settings page link clicked!"); setIsProfileDropdownOpen(false);}} className="flex items-center px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/70 hover:text-rose-300 transition-colors duration-150 group">
                                                <Settings size={16} className="mr-3 text-slate-400 group-hover:text-rose-400 transition-colors" /> Account Settings
                                            </a>
                                            <div className="border-t border-slate-700 my-1.5"></div>
                                            <button onClick={logout} className="w-full text-left flex items-center px-4 py-3 text-sm text-red-400 hover:bg-slate-700/70 hover:text-red-300 transition-colors duration-150 group">
                                                <LogOut size={16} className="mr-3 text-red-500 group-hover:text-red-400 transition-colors" /> Disconnect
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
                {!authenticated ? (
                    <section id="hero-unauthenticated" className="text-center mt-12 sm:mt-16 p-8 sm:p-16 bg-slate-900/60 rounded-3xl shadow-2xl border border-slate-700/50 max-w-4xl mx-auto backdrop-blur-lg">
                        <div className="relative w-28 h-28 mx-auto mb-10">
                            <Zap size={112} className="absolute inset-0 text-rose-500 opacity-20 animate-ping-slow-once" style={{animationDuration: '2.5s'}} />
                            <Zap size={80} className="relative text-rose-400" />
                        </div>
                        <h2 className="text-4xl sm:text-6xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-red-400 to-pink-500 leading-tight">
                            Enter the SyncWorld
                        </h2>
                        <p className="text-lg sm:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                            A new dimension of collaborative live sessions. Discover unique experiences, host your own, and connect with a global community.
                        </p>
                        <button
                            onClick={login}
                            className="px-12 py-4 bg-gradient-to-r from-rose-500 to-red-600 text-white text-xl font-semibold rounded-xl hover:from-rose-600 hover:to-red-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-opacity-50 shadow-xl hover:shadow-red-500/50 transform hover:scale-105 active:scale-95"
                        >
                            Connect & Explore
                        </button>
                    </section>
                ) : (
                    <section id="dashboard-authenticated">
                        <div className="mb-12 sm:mb-16 p-6 sm:p-10 bg-slate-900/60 rounded-2xl shadow-xl border border-slate-700/50 backdrop-blur-lg">
                            <h2 className="text-3xl sm:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-rose-300 via-red-300 to-pink-400">
                                Welcome, {userInfo?.given_name || userInfo?.name || userInfo?.preferred_username || 'Syncronaut'}!
                            </h2>
                            <p className="text-slate-300 text-lg sm:text-xl">Your portal to live sessions. Explore, engage, or create.</p>
                        </div>
                        
                        <div className="mb-10 flex flex-col sm:flex-row justify-between items-center gap-6">
                            <h3 className="text-3xl sm:text-4xl font-semibold text-rose-300">Live & Upcoming Sessions</h3>
                            <div className="relative w-full sm:w-96">
                                <input type="text" placeholder="Search by title, host, or tag..." className="w-full pl-14 pr-4 py-3.5 bg-slate-800/90 border-2 border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none placeholder-slate-500 transition-all duration-300 shadow-inner" />
                                <Search size={22} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>
                        </div>

                        {upcomingSessions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                                {upcomingSessions.map(session => (
                                    <div key={session.id} className={`bg-slate-800/80 border-2 border-slate-700/70 rounded-2xl shadow-2xl hover:border-${session.color}-500/60 hover:shadow-${session.color}-500/40 transition-all duration-300 transform hover:-translate-y-2.5 flex flex-col overflow-hidden group backdrop-blur-md`}>
                                        <div className={`aspect-[16/10] ${session.imagePlaceholderColor || 'bg-rose-900/50'} flex items-center justify-center text-slate-600 group-hover:opacity-90 transition-opacity relative overflow-hidden`}>
                                            {session.icon || <Zap size={72} className="opacity-30" />}
                                            <div className={`absolute inset-0 bg-gradient-to-t from-${session.color}-700/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity`}></div>
                                            <span className={`absolute top-4 right-4 bg-${session.color}-500/80 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>{session.category || 'Event'}</span>
                                        </div>
                                        <div className="p-6 flex-grow flex flex-col">
                                            <h3 className={`text-2xl font-bold text-${session.color}-400 mb-3 leading-tight group-hover:text-${session.color}-300 transition-colors`}>{session.title}</h3>
                                            <div className="text-sm text-slate-400 mb-4 space-y-2">
                                                <p className="flex items-center"><UserCircle size={15} className="mr-2.5 text-slate-500" /> Hosted by: <span className="font-semibold text-slate-200 ml-1.5">{session.host}</span></p>
                                                <p className="flex items-center"><CalendarDays size={15} className="mr-2.5 text-slate-500" /> 
                                                    {new Date(session.dateTime).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    {' at '}
                                                    {new Date(session.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </p>
                                                <p className="flex items-center"><Clock size={15} className="mr-2.5 text-slate-500" /> Duration: <span className="font-semibold text-slate-200 ml-1.5">{session.duration || 'N/A'}</span></p>
                                                <p className="flex items-center"><BarChart3 size={15} className="mr-2.5 text-slate-500" /> Level: <span className="font-semibold text-slate-200 ml-1.5">{session.level || 'All'}</span></p>
                                            </div>
                                            <p className="text-slate-300 text-sm mb-6 leading-relaxed line-clamp-3 flex-grow group-hover:text-slate-200 transition-colors">{session.description}</p>
                                            <div className="flex flex-wrap gap-2.5 mb-6">
                                                {(session.tags || []).map(tag => (
                                                    <span key={tag} className={`text-xs bg-slate-700/90 text-slate-300 px-3 py-1.5 rounded-md hover:bg-${session.color}-500/40 hover:text-${session.color}-200 transition-all cursor-pointer shadow-sm`}>{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-6 border-t-2 border-slate-700/70 mt-auto bg-slate-800/50">
                                            <button className={`w-full flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-rose-500 to-red-500 text-white text-md font-semibold rounded-xl hover:from-rose-600 hover:to-red-600 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 shadow-lg hover:shadow-red-500/50 transform group-hover:scale-105 active:scale-100`}>
                                                Join Session <ArrowRight size={20} className="ml-2.5 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-slate-400 bg-slate-800/60 rounded-2xl border-2 border-slate-700/50 backdrop-blur-md">
                                <MessageSquare size={64} className="mx-auto mb-8 text-slate-600" />
                                <p className="text-2xl sm:text-3xl mb-4 font-semibold text-slate-300">No Sessions on the Horizon...</p>
                                <p className="text-slate-400 text-lg">Be the first to spark a new discussion or share your knowledge!</p>
                            </div>
                        )}
                    </section>
                )}
            </main>

            <footer className="py-16 text-center text-sm text-slate-500 border-t-2 border-slate-800/80 mt-24">
                &copy; {new Date().getFullYear()} SyncWorld Dynamics. All Rights Reserved.
                <p className="mt-2">Innovate. Collaborate. Inspire.</p>
            </footer>

            <CreateSessionModal
                isOpen={isCreateSessionModalOpen}
                onClose={() => setIsCreateSessionModalOpen(false)}
                onCreateSession={handleCreateSession}
            />
            <style jsx global>{`
                @keyframes pulseSlow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
                .animate-pulse-slow { animation: pulseSlow 2.5s infinite ease-in-out; }
                @keyframes pulseFast { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.03); } }
                .animate-pulse-fast { animation: pulseFast 1.5s infinite ease-in-out; }
                @keyframes pingSlowOnce { 0% { transform: scale(0.95); opacity: 0.5; } 70% { transform: scale(1.3); opacity: 0; } 100% { transform: scale(1.3); opacity: 0; } }
                .animate-ping-slow-once { animation: pingSlowOnce 2s ease-out; }
                @keyframes fadeInDown { from { opacity:0; transform: translate3d(0,-20px,0); } to { opacity:1; transform: translate3d(0,0,0); } }
                .animate-fade-in-down { animation: fadeInDown 0.3s ease-out forwards; }
                .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>
        </div>
    );
};

const CreateSessionModal = ({ isOpen, onClose, onCreateSession }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [category, setCategory] = useState('Technology');
    const [tags, setTags] = useState('');
    const [duration, setDuration] = useState('');
    const [level, setLevel] = useState('All Levels');
    const [formError, setFormError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !dateTime || !duration.trim() || !level.trim()) {
            setFormError('All fields marked with * are required.');
            return;
        }
        setFormError('');
        const sessionData = { 
            title, description, dateTime: new Date(dateTime).toISOString(), category,
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag && tag.length <= 20).slice(0, 5), // Max 5 tags, 20 chars each
            duration, level
        };
        onCreateSession(sessionData);
    };
    
    useEffect(() => {
        if (isOpen) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(10, 0, 0, 0);
            const formattedDateTime = tomorrow.toISOString().slice(0, 16);
            setDateTime(formattedDateTime);
            setTitle(''); setDescription(''); setCategory('Technology'); setTags(''); setDuration('90 mins'); setLevel('All Levels');
            setFormError('');
        }
    }, [isOpen]);

    const inputBaseClass = "w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600/80 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-100 placeholder-slate-400 transition-colors duration-200";
    const labelBaseClass = "block text-sm font-semibold text-rose-300 mb-2";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Launch New Session" size="2xl">
            <form onSubmit={handleSubmit} className="space-y-6 text-slate-300 max-h-[80vh] overflow-y-auto pr-3 sm:pr-4 custom-scrollbar-modal">
                <div>
                    <label htmlFor="sessionTitle" className={labelBaseClass}>Session Title <span className="text-red-500">*</span></label>
                    <input type="text" id="sessionTitle" value={title} onChange={(e) => setTitle(e.target.value)} className={inputBaseClass} placeholder="e.g., The Future of AI in Healthcare" required />
                </div>
                <div>
                    <label htmlFor="sessionDescription" className={labelBaseClass}>Full Description <span className="text-red-500">*</span></label>
                    <textarea id="sessionDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows="5" className={`${inputBaseClass} min-h-[120px]`} placeholder="Provide a comprehensive overview: key topics, learning objectives, what attendees can expect..." required ></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    <div>
                        <label htmlFor="sessionDateTime" className={labelBaseClass}>Date & Time <span className="text-red-500">*</span></label>
                        <input type="datetime-local" id="sessionDateTime" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className={`${inputBaseClass} appearance-none`} required min={new Date().toISOString().slice(0, 16)} />
                    </div>
                    <div>
                        <label htmlFor="sessionDuration" className={labelBaseClass}>Estimated Duration <span className="text-red-500">*</span></label>
                        <input type="text" id="sessionDuration" value={duration} onChange={(e) => setDuration(e.target.value)} className={inputBaseClass} placeholder="e.g., 90 mins, 2 hours" required />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    <div>
                        <label htmlFor="sessionCategory" className={labelBaseClass}>Category</label>
                        <select id="sessionCategory" value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputBaseClass} py-[0.8rem]`}>
                            <option>Technology</option><option>Science</option><option>Creative</option><option>Business</option><option>Personal Development</option><option>Sustainability</option><option>Workshop</option><option>Health & Wellness</option><option>Education</option><option>Finance</option><option>Gaming</option><option>General</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="sessionLevel" className={labelBaseClass}>Target Audience Level <span className="text-red-500">*</span></label>
                        <select id="sessionLevel" value={level} onChange={(e) => setLevel(e.target.value)} className={`${inputBaseClass} py-[0.8rem]`}>
                            <option>All Levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
                        </select>
                    </div>
                </div>
                 <div>
                    <label htmlFor="sessionTags" className={labelBaseClass}>Tags <span className="text-xs text-slate-400 font-normal">(comma-separated, max 5, e.g., AI, Web3)</span></label>
                    <input type="text" id="sessionTags" value={tags} onChange={(e) => setTags(e.target.value)} className={inputBaseClass} placeholder="AI, Machine Learning, Python" />
                </div>
                {formError && <p className="text-sm text-red-300 mt-3 text-center bg-red-700/30 p-3 rounded-lg border border-red-600">{formError}</p>}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                    <button type="button" onClick={onClose} className="w-full sm:w-auto px-8 py-3 text-sm font-semibold text-slate-200 bg-slate-600/90 rounded-xl hover:bg-slate-500/90 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors order-2 sm:order-1 shadow-md" >Cancel</button>
                    <button type="submit" className="w-full sm:w-auto px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-red-600 rounded-xl hover:from-rose-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 shadow-lg hover:shadow-red-500/50 transition-all order-1 sm:order-2" >Launch Session</button>
                </div>
            </form>
             <style jsx global>{`
                .custom-scrollbar-modal::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar-modal::-webkit-scrollbar-track { background: ${'#1e293b'}; /* slate-800 */ }
                .custom-scrollbar-modal::-webkit-scrollbar-thumb { background: ${'#475569'}; /* slate-600 */ border-radius: 4px; }
                .custom-scrollbar-modal::-webkit-scrollbar-thumb:hover { background: ${'#64748b'}; /* slate-500 */ }
                /* Style for datetime-local calendar icon */
                input[type="datetime-local"]::-webkit-calendar-picker-indicator {
                    filter: invert(0.6) brightness(100%) sepia(20%) saturate(500%) hue-rotate(180deg); /* Makes it a light blue/teal */
                    cursor: pointer;
                }
            `}</style>
        </Modal>
    );
};

export default App;
