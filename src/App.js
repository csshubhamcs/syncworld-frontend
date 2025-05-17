// Filename: src/App.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Keycloak from 'keycloak-js';
import { 
    ChevronDown, LogIn, LogOut, UserCircle, CalendarDays, PlusCircle, 
    Zap, Users, MessageSquare, Settings, Search, ArrowRight, Clock,
    Lightbulb, Palette, Brain, Globe, ShieldCheck, BookOpen, Airplay, BarChart3, 
    Edit3, Save, XCircle, AlertTriangle, CheckCircle2
} from 'lucide-react';

// --- API Configuration ---
const API_BASE_URL = 'http://localhost:8081'; // Your user-service backend URL

// --- Keycloak Configuration ---
const keycloakConfig = {
    url: 'http://localhost:8080',
    realm: 'syncworld-realm',
    clientId: 'syncworld-frontend-app'
};

// --- Enhanced Mock Data for Sessions ---
const mockUpcomingSessions = [
    { id: '1', title: 'Quantum Entanglement Explained', host: 'Dr. Eva Core', dateTime: '2025-08-15T18:00:00Z', description: 'Unravel quantum mechanics and its future in computing. A beginner-friendly exploration of a mind-bending topic.', category: 'Deep Tech', tags: ['Quantum Physics', 'Future Tech', 'Science'], duration: '90 mins', level: 'Beginner', icon: <Lightbulb size={36} className="text-purple-300"/>, color: 'purple', accentColor: 'rose' },
    { id: '2', title: 'AI-Driven Art & Design Workshop', host: 'Arturo Synth', dateTime: '2025-08-17T15:30:00Z', description: 'Use cutting-edge AI to create stunning visual art and designs. No prior art experience needed!', category: 'Creative AI', tags: ['AI', 'Art', 'Design', 'Workshop'], duration: '3 hours', level: 'All Levels', icon: <Palette size={36} className="text-pink-300"/>, color: 'pink', accentColor: 'rose' },
    { id: '3', title: 'The Future of DAOs & Web3 Governance', host: 'Lex Crypton', dateTime: '2025-08-20T20:00:00Z', description: 'Exploring the structure, governance models, and societal impact of Decentralized Autonomous Organizations.', category: 'Web3', tags: ['Blockchain', 'DAO', 'Governance'], duration: '2 hours', level: 'Intermediate', icon: <ShieldCheck size={36} className="text-indigo-300"/>, color: 'indigo', accentColor: 'rose' },
    { id: '4', title: 'NLP for Peak Performance', host: 'Max Well', dateTime: '2025-08-22T13:00:00Z', description: 'Unlock your potential by understanding and reprogramming your mind for ultimate success and clarity.', category: 'Mind Science', tags: ['NLP', 'Mindset', 'Productivity'], duration: '75 mins', level: 'Beginner', icon: <Brain size={36} className="text-green-300"/>, color: 'green', accentColor: 'rose' },
    { id: '5', title: 'Sustainable Urban Futures', host: 'Terra Verde', dateTime: '2025-08-25T11:00:00Z', description: 'A visionary look at eco-cities, smart infrastructure, and community-based sustainability solutions for the next generation.', category: 'Sustainability', tags: ['Urban Planning', 'Eco-Living', 'Smart City'], duration: '2.5 hours', level: 'All Levels', icon: <Globe size={36} className="text-teal-300"/>, color: 'teal', accentColor: 'rose' },
    { id: '6', title: 'Mastering Async JavaScript', host: 'Dev Async', dateTime: '2025-08-28T10:00:00Z', description: 'From callbacks to Promises and Async/Await - conquer complex async logic in modern JS.', category: 'Software Development', tags: ['JavaScript', 'Web Dev', 'Advanced'], duration: '4 hours', level: 'Advanced', icon: <BookOpen size={36} className="text-yellow-300"/>, color: 'yellow', accentColor: 'rose' },
];

// --- Helper Components ---
const LoadingSpinner = ({size = "h-16 w-16", color = "text-rose-500"}) => (
    <div className="flex justify-center items-center h-full">
        <svg className={`animate-spin ${size} ${color}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                    className="absolute top-4 right-4 text-slate-400 hover:text-rose-400 transition-colors rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-800/80 hover:bg-slate-700/90"
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <h2 className="text-2xl sm:text-3xl font-bold text-rose-400 mb-6 sm:mb-8 text-center sm:text-left">{title}</h2>
                {children}
            </div>
            <style jsx="true" global="true">{`
                @keyframes fadeInAnimation { to { opacity: 1; } }
                .animate-fade-in { animation: fadeInAnimation 0.3s forwards; }
                @keyframes modalAppearAnimation { to { opacity: 1; transform: scale(1); } }
                .animate-modal-appear { animation: modalAppearAnimation 0.3s 0.1s forwards; }
            `}</style>
        </div>
    );
};

const AlertMessage = ({ type = 'info', message, onDismiss }) => {
    if (!message) return null;

    const baseClasses = "p-4 rounded-lg border flex items-start space-x-3 shadow-lg my-4";
    const typeClasses = {
        success: "bg-green-800/50 border-green-600/60 text-green-200",
        error: "bg-red-800/50 border-red-600/60 text-red-200",
        info: "bg-sky-800/50 border-sky-600/60 text-sky-200",
        warning: "bg-yellow-800/50 border-yellow-600/60 text-yellow-200",
    };
    const Icon = {
        success: <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />,
        error: <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />,
        info: <Lightbulb className="h-5 w-5 text-sky-400 flex-shrink-0" />,
        warning: <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />,
    }[type];

    return (
        <div className={`${baseClasses} ${typeClasses[type]} animate-fade-in-down`}>
            <div>{Icon}</div>
            <p className="text-sm flex-grow">{message}</p>
            {onDismiss && (
                <button onClick={onDismiss} className="text-sm hover:opacity-75 transition-opacity ml-auto flex-shrink-0">&times;</button>
            )}
        </div>
    );
};
// --- End Helper Components ---

const App = () => {
    const [keycloak, setKeycloak] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [kcUserInfo, setKcUserInfo] = useState(null); 
    const [userProfile, setUserProfile] = useState(null); 
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [appError, setAppError] = useState(null); 
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState('home'); 
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState(null);
    const [profileSuccess, setProfileSuccess] = useState(null);
    
    const profileDropdownRef = useRef(null);
    const keycloakInitialized = useRef(false);

    const fetchUserProfile = useCallback(async (kcInstanceToUse) => {
        const currentKc = kcInstanceToUse || keycloak; 
        if (!currentKc || !currentKc.token) {
            setProfileError("Authentication token not available to fetch profile.");
            console.warn("[DEBUG] fetchUserProfile: No token available.");
            return;
        }
        console.log("[DEBUG] fetchUserProfile: Fetching profile...");
        setProfileLoading(true); setProfileError(null); setProfileSuccess(null);
        try {
            // Use API_BASE_URL
            const response = await fetch(`${API_BASE_URL}/api/v1/users/profiles/me`, {
                headers: { 'Authorization': `Bearer ${currentKc.token}` }
            });

            if (response.status === 404) {
                console.log("[DEBUG] fetchUserProfile: Profile not found (404), setting empty profile object to indicate creation is needed.");
                setUserProfile({}); 
                return; 
            }
            
            const contentType = response.headers.get("content-type");
            if (!response.ok) {
                let errorDetail = `HTTP error ${response.status}`;
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json().catch(() => ({ message: "Failed to parse error from server."})); 
                    errorDetail = errorData.detail || errorData.title || errorData.message || `Server error ${response.status}`;
                } else {
                    const textError = await response.text().catch(() => "Could not retrieve error details from server.");
                    errorDetail = `Server returned non-JSON error (status ${response.status}): ${textError.substring(0, 100)}${textError.length > 100 ? '...' : ''}`;
                    console.error("[DEBUG] fetchUserProfile: Non-JSON error response body:", textError);
                }
                throw new Error(errorDetail);
            }

            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                console.log("[DEBUG] fetchUserProfile: Profile data received:", data);
                setUserProfile(data);
            } else {
                console.warn("[DEBUG] fetchUserProfile: Successful response but not JSON. Content-Type:", contentType);
                const responseText = await response.text(); 
                console.warn("[DEBUG] fetchUserProfile: Response text:", responseText.substring(0, 500)); 
                throw new Error("Received unexpected non-JSON response from server for profile data.");
            }

        } catch (err) {
            console.error("[DEBUG] fetchUserProfile: Catch block error:", err);
            setProfileError(err.message || "Could not fetch your profile. Please check network connection or try again later.");
        } finally {
            setProfileLoading(false);
        }
    }, [keycloak]); // keycloak is a dependency here


    useEffect(() => {
        if (keycloakInitialized.current) return;
        keycloakInitialized.current = true;
        const kcInstance = new Keycloak(keycloakConfig);

        kcInstance.onAuthSuccess = () => {
            if ((window.location.search.includes("code=") || window.location.hash.includes("code="))) {
                window.history.replaceState(null, '', window.location.pathname);
            }
        };
        kcInstance.onAuthError = (err) => setAppError(`Auth Error: ${err.error_description || err.error}`);
        kcInstance.onAuthLogout = () => {
            setAuthenticated(false); setKcUserInfo(null); setUserProfile(null); setKeycloak(null); 
            keycloakInitialized.current = false; setCurrentPage('home');
        };
        kcInstance.onTokenExpired = () => kcInstance.updateToken(30).catch(() => kcInstance.logout());

        kcInstance.init({
            onLoad: 'check-sso', 
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html', 
            pkceMethod: 'S256',
            checkLoginIframe: true, 
        })
        .then(async (auth) => {
            if ((window.location.search.includes("code=") || window.location.hash.includes("code="))) {
                window.history.replaceState(null, '', window.location.pathname);
            }
            setKeycloak(kcInstance); setAuthenticated(auth); 
            if (auth) {
                try {
                    const kcUser = await kcInstance.loadUserInfo();
                    setKcUserInfo(kcUser);
                    await fetchUserProfile(kcInstance); 
                } catch (err) {
                    setProfileError("Could not load your Keycloak user info or application profile.");
                }
                setUpcomingSessions(mockUpcomingSessions); 
            }
            setIsLoading(false); 
        })
        .catch(err => {
            setAppError(`Keycloak Init Failed: ${err.error_description || err.error || JSON.stringify(err)}`);
            setIsLoading(false); keycloakInitialized.current = false; 
        });
    }, [fetchUserProfile]); 


    const handleUpdateProfile = async (profileData) => {
        if (!keycloak || !keycloak.token) {
            setProfileError("Not authenticated. Cannot update profile."); return false;
        }
        setProfileLoading(true); setProfileError(null); setProfileSuccess(null);
        // Determine if creating a new profile (POST) or updating existing (PUT)
        const isCreatingNewProfile = !userProfile || Object.keys(userProfile).length === 0 || !userProfile.id;
        const endpoint = `${API_BASE_URL}/api/v1/users/profiles/me`;
        const method = isCreatingNewProfile ? 'POST' : 'PUT';

        console.log(`[DEBUG] handleUpdateProfile: Method=${method}, Endpoint=${endpoint}, Profile Exists=${!!(userProfile && userProfile.id)}`);

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keycloak.token}`},
                body: JSON.stringify(profileData)
            });

            const contentType = response.headers.get("content-type");
            if (!response.ok) {
                let errorDetail = `HTTP error ${response.status}`;
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json().catch(() => ({}));
                    errorDetail = errorData.detail || errorData.title || errorData.message || `HTTP error ${response.status}`;
                } else {
                    const textError = await response.text().catch(() => "Could not retrieve error details.");
                    errorDetail = `Server returned non-JSON error (status ${response.status}): ${textError.substring(0,100)}${textError.length > 100 ? '...' : ''}`;
                }
                throw new Error(errorDetail);
            }
            
            if (contentType && contentType.includes("application/json")) {
                const updatedProfile = await response.json();
                setUserProfile(updatedProfile);
                setProfileSuccess(`Profile ${method === 'POST' ? 'created' : 'updated'} successfully!`);
                setTimeout(() => setProfileSuccess(null), 4000);
                return true;
            } else {
                 throw new Error("Received non-JSON response from server after profile update.");
            }

        } catch (err) {
            setProfileError(err.message || "Could not update your profile.");
            setTimeout(() => setProfileError(null), 6000);
            return false;
        } finally {
            setProfileLoading(false);
        }
    };

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
            host: kcUserInfo?.name || kcUserInfo?.preferred_username || 'You',
            icon: <Zap size={36} className="text-gray-400"/>,
            color: ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'teal'][Math.floor(Math.random() * 8)] 
        };
        setUpcomingSessions(prev => [newSession, ...prev]);
        setIsCreateSessionModalOpen(false);
    };

    const backgroundClass = "bg-slate-950 text-slate-300";

    if (isLoading) { /* Loading JSX */ }
    if (appError) { /* App Error JSX */ }

    return (
        <div className={`min-h-screen ${backgroundClass} font-sans antialiased selection:bg-rose-500 selection:text-white`}>
            <Header 
                authenticated={authenticated} userInfo={kcUserInfo} onLogin={login} onLogout={logout} 
                profileDropdownRef={profileDropdownRef} isProfileDropdownOpen={isProfileDropdownOpen} setIsProfileDropdownOpen={setIsProfileDropdownOpen}
                onNavigate={setCurrentPage} onOpenCreateSession={() => setIsCreateSessionModalOpen(true)}
            />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                {currentPage === 'home' && <HomePage authenticated={authenticated} userInfo={kcUserInfo} onLogin={login} upcomingSessions={upcomingSessions} />}
                {currentPage === 'profile' && authenticated && 
                    <UserProfilePage 
                        userProfile={userProfile} kcUserInfo={kcUserInfo} onUpdateProfile={handleUpdateProfile}
                        isLoading={profileLoading} 
                        error={profileError} setProfileError={setProfileError} 
                        success={profileSuccess} setProfileSuccess={setProfileSuccess} 
                        onFetchProfile={() => fetchUserProfile(keycloak)} 
                    />
                }
                {!authenticated && currentPage === 'profile' && (
                     <div className="text-center mt-12 sm:mt-16 p-8 sm:p-12 bg-slate-900/60 rounded-2xl shadow-2xl border border-slate-700/50 max-w-3xl mx-auto backdrop-blur-lg">
                        <UserCircle size={64} className="mx-auto mb-6 text-rose-400 opacity-70" />
                        <h2 className="text-3xl font-bold mb-4 text-rose-400">Profile Access Restricted</h2>
                        <p className="text-lg text-slate-300 mb-8">Please log in to view and manage your SyncWorld profile.</p>
                        <button 
                            onClick={login} 
                            className="px-8 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-red-700 transition-all shadow-lg hover:shadow-red-500/40"
                        >
                            Login to Access Profile
                        </button>
                    </div>
                )}
            </main>
            <Footer />
            <CreateSessionModal isOpen={isCreateSessionModalOpen} onClose={() => setIsCreateSessionModalOpen(false)} onCreateSession={handleCreateSession} />
            <style jsx="true" global="true">{`
                @keyframes pulseFast { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
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

// --- Reusable Components ---
const Header = ({ authenticated, userInfo, onLogin, onLogout, profileDropdownRef, isProfileDropdownOpen, setIsProfileDropdownOpen, onNavigate, onOpenCreateSession }) => (
    <header className="bg-slate-900/80 backdrop-blur-2xl shadow-2xl sticky top-0 z-50 border-b border-slate-800/70">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-24">
                <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => onNavigate('home')}>
                    <Airplay className="h-10 w-10 sm:h-12 sm:w-12 text-rose-400 group-hover:text-rose-300 transition-colors duration-300 transform group-hover:animate-pulse-fast" />
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-red-400 to-pink-500 group-hover:opacity-90 transition-opacity">
                        SyncWorld
                    </h1>
                </div>
                <div className="flex items-center space-x-4 sm:space-x-6">
                    {authenticated && (
                        <button onClick={onOpenCreateSession} className="flex items-center px-4 sm:px-5 py-2.5 sm:py-3 bg-rose-500 text-white text-sm sm:text-md font-semibold rounded-xl hover:bg-rose-600/90 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-opacity-75 shadow-xl hover:shadow-rose-500/50 transform hover:scale-105 active:scale-95">
                            <PlusCircle size={18} className="mr-2" /> Host Session
                        </button>
                    )}
                    {!authenticated ? (
                        <button onClick={onLogin} className="flex items-center px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-sm sm:text-md font-semibold rounded-xl hover:from-sky-600 hover:to-cyan-600 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 shadow-xl hover:shadow-sky-500/50 transform hover:scale-105 active:scale-95">
                            <LogIn size={18} className="mr-2" /> Connect / Register
                        </button>
                    ) : (
                        <div className="relative" ref={profileDropdownRef}>
                            <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center space-x-2 p-2.5 sm:p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/90 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500">
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
                                    <button onClick={() => { onNavigate('profile'); setIsProfileDropdownOpen(false); }} className="w-full text-left flex items-center px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/70 hover:text-rose-300 transition-colors duration-150 group">
                                        <Users size={16} className="mr-3 text-slate-400 group-hover:text-rose-400 transition-colors" /> My Profile
                                    </button>
                                    <button onClick={(e) => { e.preventDefault(); alert("Settings page link clicked!"); setIsProfileDropdownOpen(false);}} className="w-full text-left flex items-center px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/70 hover:text-rose-300 transition-colors duration-150 group">
                                        <Settings size={16} className="mr-3 text-slate-400 group-hover:text-rose-400 transition-colors" /> Account Settings
                                    </button>
                                    <div className="border-t border-slate-700 my-1.5"></div>
                                    <button onClick={onLogout} className="w-full text-left flex items-center px-4 py-3 text-sm text-red-400 hover:bg-slate-700/70 hover:text-red-300 transition-colors duration-150 group">
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
);

const HomePage = ({ authenticated, userInfo, onLogin, upcomingSessions }) => (
    !authenticated ? (
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
            <button onClick={onLogin} className="px-12 py-4 bg-gradient-to-r from-rose-500 to-red-600 text-white text-xl font-semibold rounded-xl hover:from-rose-600 hover:to-red-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-opacity-50 shadow-xl hover:shadow-red-500/50 transform hover:scale-105 active:scale-95">
                Connect & Explore
            </button>
        </section>
    ) : (
        <section id="dashboard-authenticated">
            <div className="mb-12 sm:mb-16 p-6 sm:p-10 bg-slate-900/60 rounded-2xl shadow-xl border border-slate-700/50 backdrop-blur-lg">
                <h2 className="text-3xl sm:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-rose-300 via-red-300 to-pink-400">
                    Welcome back, {userInfo?.given_name || userInfo?.name || userInfo?.preferred_username || 'Syncronaut'}!
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-10">
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
                                <button className={`w-full flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-${session.accentColor}-500 to-${session.accentColor}-600 text-white text-md font-semibold rounded-xl hover:from-${session.accentColor}-600 hover:to-${session.accentColor}-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-${session.accentColor}-400 focus:ring-opacity-75 shadow-lg hover:shadow-${session.accentColor}-500/50 transform group-hover:scale-105 active:scale-100`}>
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
    )
);

const UserProfilePage = ({ 
    userProfile, kcUserInfo, onUpdateProfile, isLoading, 
    error, setProfileError, 
    success, setProfileSuccess, 
    onFetchProfile 
}) => {
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (!userProfile && !isLoading && !error) { 
            onFetchProfile(); 
        } else if (userProfile) {
             setFormData({
                firstName: userProfile.firstName || kcUserInfo?.given_name || '',
                lastName: userProfile.lastName || kcUserInfo?.family_name || '',
                email: userProfile.email || kcUserInfo?.email || '',
                contactNumber: userProfile.contactNumber || '',
                bio: userProfile.bio || '',
                areasOfExpertise: userProfile.areasOfExpertise ? userProfile.areasOfExpertise.join(', ') : '',
                currentCompany: userProfile.currentCompany || '',
                experienceSummary: userProfile.experienceSummary || '',
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [userProfile, kcUserInfo, isLoading, error]); // Removed onFetchProfile from here to break potential loop, call it explicitly


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const areasOfExpertiseString = formData.areasOfExpertise || ''; 
        const profileDataToSubmit = {
            ...formData,
            areasOfExpertise: areasOfExpertiseString.split(',').map(s => s.trim()).filter(s => s),
        };
        const updateSuccess = await onUpdateProfile(profileDataToSubmit);
        if (updateSuccess) {
            setEditMode(false); 
        }
    };

    const inputBaseClass = "w-full px-4 py-3 bg-slate-700/80 border-2 border-slate-600/90 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-100 placeholder-slate-400 transition-colors duration-200";
    const labelBaseClass = "block text-sm font-semibold text-rose-300 mb-2 tracking-wide";
    const displayFieldClass = "text-lg text-slate-100 py-1.5";
    const fieldContainerClass = "mb-8 pb-8 border-b-2 border-slate-700/80";

    if (isLoading && (!userProfile || Object.keys(userProfile).length === 0) && !error) {
        return <div className="flex justify-center items-center py-20"><LoadingSpinner /> <p className="ml-4 text-xl text-rose-400">Loading Your Profile Matrix...</p></div>;
    }
    
    return (
        <section id="user-profile-section" className="max-w-4xl mx-auto p-6 sm:p-10 bg-slate-900/70 rounded-3xl shadow-2xl border-2 border-slate-700/60 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12">
                <h2 className="text-3xl sm:text-5xl font-bold text-rose-400 mb-4 sm:mb-0">My Profile Nexus</h2>
                {!editMode && userProfile && ( 
                    <button 
                        onClick={() => setEditMode(true)}
                        className="flex items-center px-6 py-3 bg-slate-700/80 text-rose-300 text-sm font-semibold rounded-xl hover:bg-slate-600/90 border border-slate-600 transition-colors shadow-lg hover:shadow-rose-500/20"
                    >
                        <Edit3 size={18} className="mr-2.5"/> Modify Profile
                    </button>
                )}
            </div>

            {success && <AlertMessage type="success" message={success} onDismiss={() => setProfileSuccess(null)} />}
            {error && <AlertMessage type="error" message={error} onDismiss={() => setProfileError(null)} />}
            
            {(!userProfile || Object.keys(userProfile).length === 0) && !isLoading && !editMode && (
                 <div className="text-center py-12 px-6 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50">
                    <UserCircle size={72} className="mx-auto text-slate-600 mb-5" />
                    <p className="text-2xl text-slate-300 mb-4 font-semibold">Your Profile Awaits Configuration.</p>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">Craft your SyncWorld identity to connect and share your unique expertise with the community.</p>
                    <button 
                        onClick={() => setEditMode(true)}
                        className="px-8 py-3.5 bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-red-700 transition-all shadow-lg hover:shadow-red-500/40"
                    >
                        Initialize Profile
                    </button>
                </div>
            )}

            {(userProfile && Object.keys(userProfile).length > 0 && !editMode) && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className={fieldContainerClass.replace('mb-8 pb-8', 'mb-0 pb-0 md:border-b-0 md:pr-4 md:border-r-2')}> <label className={labelBaseClass}>First Name</label> <p className={displayFieldClass}>{formData.firstName || <span className="text-slate-500 italic">N/A</span>}</p> </div>
                        <div className={fieldContainerClass.replace('mb-8 pb-8', 'mb-0 pb-0 md:pl-4')}> <label className={labelBaseClass}>Last Name</label> <p className={displayFieldClass}>{formData.lastName || <span className="text-slate-500 italic">N/A</span>}</p> </div>
                    </div>
                    <div className={fieldContainerClass}> <label className={labelBaseClass}>Email Address</label> <p className={displayFieldClass}>{formData.email || <span className="text-slate-500 italic">N/A</span>}</p> </div>
                    <div className={fieldContainerClass}> <label className={labelBaseClass}>Contact Number</label> <p className={displayFieldClass}>{formData.contactNumber || <span className="text-slate-500 italic">Not provided</span>}</p> </div>
                    <div className={fieldContainerClass}> <label className={labelBaseClass}>SyncWorld ID</label> <p className={`${displayFieldClass} font-mono text-sky-400 tracking-wider`}>{userProfile.syncWorldId || <span className="text-slate-500 italic">N/A</span>}</p> </div>
                    <div className={fieldContainerClass}> <label className={labelBaseClass}>Bio / Introduction</label> <p className={`${displayFieldClass} whitespace-pre-wrap leading-relaxed`}>{formData.bio || <span className="text-slate-500 italic">Share something about yourself...</span>}</p> </div>
                    <div className={fieldContainerClass}>
                        <label className={labelBaseClass}>Areas of Expertise</label>
                        {formData.areasOfExpertise && formData.areasOfExpertise.length > 0 ? (
                            <div className="flex flex-wrap gap-3 mt-2">
                                {formData.areasOfExpertise.split(',').map(s => s.trim()).filter(s => s).map((area, index) => (
                                    <span key={index} className="bg-slate-700/90 text-rose-300 text-sm px-4 py-2 rounded-lg shadow-md">{area}</span>
                                ))}
                            </div>
                        ) : <p className="text-slate-500 italic text-lg py-1">No expertise listed yet.</p>}
                    </div>
                     <div className={fieldContainerClass}> <label className={labelBaseClass}>Current Company / Affiliation</label> <p className={displayFieldClass}>{formData.currentCompany || <span className="text-slate-500 italic">Not specified</span>}</p> </div>
                    <div className="pb-0"> <label className={labelBaseClass}>Experience Summary</label> <p className={`${displayFieldClass} whitespace-pre-wrap leading-relaxed`}>{formData.experienceSummary || <span className="text-slate-500 italic">Tell us about your journey...</span>}</p> </div>
                </div>
            )}

            {editMode && (
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                        <div> <label htmlFor="firstName" className={labelBaseClass}>First Name</label> <input type="text" name="firstName" id="firstName" value={formData.firstName || ''} onChange={handleChange} className={inputBaseClass} /> </div>
                        <div> <label htmlFor="lastName" className={labelBaseClass}>Last Name</label> <input type="text" name="lastName" id="lastName" value={formData.lastName || ''} onChange={handleChange} className={inputBaseClass} /> </div>
                    </div>
                    <div> <label htmlFor="email" className={labelBaseClass}>Email Address <span className="text-slate-400 text-xs font-normal">(must be unique)</span></label> <input type="email" name="email" id="email" value={formData.email || ''} onChange={handleChange} className={inputBaseClass} /> </div>
                    <div> <label htmlFor="contactNumber" className={labelBaseClass}>Contact Number</label> <input type="tel" name="contactNumber" id="contactNumber" value={formData.contactNumber || ''} onChange={handleChange} className={inputBaseClass} placeholder="e.g., +1-555-123-4567"/> </div>
                    <div> <label htmlFor="bio" className={labelBaseClass}>Bio / Introduction</label> <textarea name="bio" id="bio" rows="5" value={formData.bio || ''} onChange={handleChange} className={`${inputBaseClass} min-h-[120px]`} placeholder="A short introduction about yourself, your passions, and what you bring to SyncWorld..."></textarea> </div>
                    <div> <label htmlFor="areasOfExpertise" className={labelBaseClass}>Areas of Expertise <span className="text-xs text-slate-400 font-normal">(comma-separated)</span></label> <input type="text" name="areasOfExpertise" id="areasOfExpertise" value={formData.areasOfExpertise || ''} onChange={handleChange} className={inputBaseClass} placeholder="e.g., AI, Web Development, Quantum Physics"/> </div>
                    <div> <label htmlFor="currentCompany" className={labelBaseClass}>Current Company / Affiliation</label> <input type="text" name="currentCompany" id="currentCompany" value={formData.currentCompany || ''} onChange={handleChange} className={inputBaseClass} placeholder="e.g., SyncWorld Inc., Independent Researcher"/> </div>
                    <div> <label htmlFor="experienceSummary" className={labelBaseClass}>Experience Summary</label> <textarea name="experienceSummary" id="experienceSummary" rows="5" value={formData.experienceSummary || ''} onChange={handleChange} className={`${inputBaseClass} min-h-[120px]`} placeholder="Briefly describe your professional journey, key skills, and accomplishments..."></textarea> </div>
                    <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-8">
                        <button type="button" onClick={() => { setEditMode(false); setProfileError(null); setProfileSuccess(null); if(userProfile && userProfile.id) onFetchProfile(); /* Re-fetch to reset form to saved state if profile exists */ else setFormData({}); /* Clear form if it was a new profile attempt */ }} className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-slate-200 bg-slate-600/90 rounded-xl hover:bg-slate-500/90 transition-colors shadow-md order-2 sm:order-1"> Cancel Edits </button>
                        <button type="submit" disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-red-600 rounded-xl hover:from-rose-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed order-1 sm:order-2">
                            {isLoading ? <LoadingSpinner size="h-5 w-5" color="text-white"/> : <><Save size={18} className="mr-2.5"/> Update Profile</>}
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
};


const Footer = () => (
    <footer className="py-16 text-center text-sm text-slate-500 border-t-2 border-slate-800/80 mt-24">
        &copy; {new Date().getFullYear()} SyncWorld Dynamics. All Rights Reserved.
        <p className="mt-2">Innovate. Collaborate. Inspire.</p>
    </footer>
);

// CreateSessionModal (same as previous version, with minor style tweaks for consistency)
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
            setFormError('Title, Description, Date & Time, Duration, and Level are required.'); return;
        }
        setFormError('');
        onCreateSession({ 
            title, description, dateTime: new Date(dateTime).toISOString(), category,
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag && tag.length <= 25).slice(0, 7), // Max 7 tags, 25 chars each
            duration, level
        });
    };
    useEffect(() => {
        if (isOpen) {
            const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(10, 0, 0, 0);
            setDateTime(tomorrow.toISOString().slice(0, 16));
            setTitle(''); setDescription(''); setCategory('Technology'); setTags(''); setDuration('90 mins'); setLevel('All Levels');
            setFormError('');
        }
    }, [isOpen]);
    const inputBaseClass = "w-full px-4 py-3 bg-slate-700/80 border-2 border-slate-600/90 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-100 placeholder-slate-400 transition-colors duration-200";
    const labelBaseClass = "block text-sm font-semibold text-rose-300 mb-2 tracking-wide";
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Host a New Session" size="2xl">
            <form onSubmit={handleSubmit} className="space-y-6 text-slate-300 max-h-[75vh] overflow-y-auto pr-3 sm:pr-4 custom-scrollbar-modal">
                <div><label htmlFor="sessionTitleM" className={labelBaseClass}>Session Title <span className="text-red-500">*</span></label><input type="text" id="sessionTitleM" value={title} onChange={(e) => setTitle(e.target.value)} className={inputBaseClass} placeholder="e.g., The Future of AI in Healthcare" required /></div>
                <div><label htmlFor="sessionDescriptionM" className={labelBaseClass}>Full Description <span className="text-red-500">*</span></label><textarea id="sessionDescriptionM" value={description} onChange={(e) => setDescription(e.target.value)} rows="5" className={`${inputBaseClass} min-h-[120px]`} placeholder="Provide a comprehensive overview..." required ></textarea></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    <div><label htmlFor="sessionDateTimeM" className={labelBaseClass}>Date & Time <span className="text-red-500">*</span></label><input type="datetime-local" id="sessionDateTimeM" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className={`${inputBaseClass} appearance-none`} required min={new Date().toISOString().slice(0, 16)} /></div>
                    <div><label htmlFor="sessionDurationM" className={labelBaseClass}>Estimated Duration <span className="text-red-500">*</span></label><input type="text" id="sessionDurationM" value={duration} onChange={(e) => setDuration(e.target.value)} className={inputBaseClass} placeholder="e.g., 90 mins, 2 hours" required /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    <div><label htmlFor="sessionCategoryM" className={labelBaseClass}>Category</label><select id="sessionCategoryM" value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputBaseClass} py-[0.8rem]`}><option>Technology</option><option>Science</option><option>Creative</option><option>Business</option><option>Personal Development</option><option>Sustainability</option><option>Workshop</option><option>Health & Wellness</option><option>Education</option><option>Finance</option><option>Gaming</option><option>General</option></select></div>
                    <div><label htmlFor="sessionLevelM" className={labelBaseClass}>Target Audience Level <span className="text-red-500">*</span></label><select id="sessionLevelM" value={level} onChange={(e) => setLevel(e.target.value)} className={`${inputBaseClass} py-[0.8rem]`}><option>All Levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option></select></div>
                </div>
                <div><label htmlFor="sessionTagsM" className={labelBaseClass}>Tags <span className="text-xs text-slate-400 font-normal">(comma-separated, max 7)</span></label><input type="text" id="sessionTagsM" value={tags} onChange={(e) => setTags(e.target.value)} className={inputBaseClass} placeholder="AI, Web3, Mindfulness" /></div>
                {formError && <p className="text-sm text-red-300 mt-3 text-center bg-red-700/30 p-3 rounded-lg border border-red-600">{formError}</p>}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                    <button type="button" onClick={onClose} className="w-full sm:w-auto px-8 py-3 text-sm font-semibold text-slate-200 bg-slate-600/90 rounded-xl hover:bg-slate-500/90 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors order-2 sm:order-1 shadow-md" >Cancel</button>
                    <button type="submit" className="w-full sm:w-auto px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-red-600 rounded-xl hover:from-rose-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 shadow-lg hover:shadow-red-500/50 transition-all order-1 sm:order-2" >Launch Session</button>
                </div>
            </form>
            <style jsx="true" global="true">{`
                .custom-scrollbar-modal::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar-modal::-webkit-scrollbar-track { background: ${'#1e293b'}; } /* slate-800 */
                .custom-scrollbar-modal::-webkit-scrollbar-thumb { background: ${'#475569'}; border-radius: 4px; } /* slate-600 */
                .custom-scrollbar-modal::-webkit-scrollbar-thumb:hover { background: ${'#64748b'}; } /* slate-500 */
                input[type="datetime-local"]::-webkit-calendar-picker-indicator {
                    filter: invert(0.8) brightness(100%) sepia(10%) saturate(200%) hue-rotate(150deg); /* Adjust for better visibility on dark inputs */
                    cursor: pointer;
                    padding: 0.25rem;
                }
            `}</style>
        </Modal>
    );
};

export default App;
