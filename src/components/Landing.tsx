import React, { useState, useEffect } from 'react';

//import { Link } from 'react-router-dom';


import Login from './Login';
import Register from './Register';

import image1 from '../assets/reading_tracker_window.jpg'
import image2 from '../assets/reading_tracker_ai_prediction.jpg'

import CountUp from './Countup'
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsofService';

const Landing: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openModal, setOpenModal] = useState<'privacy' | 'terms' | null>(null)


    useEffect(() => {
        // Debug: Log all environment variables to see what's available
        console.log("All env vars:", import.meta.env);

        // Log the specific API URL
        console.log("API URL value:", import.meta.env.VITE_API_URL);

        // If you're using VITE_APP_API_URL instead of VITE_API_URL
        console.log("Alternative API URL value:", import.meta.env.VITE_APP_API_URL);
    }, []);

    return (



        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Navigation */}
            <nav className="px-6 py-4 flex justify-between items-center relative"> {/* Added relative positioning */}
                <div className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xl font-bold text-gray-800">ReadTime</span>
                </div>

                {/* Desktop navigation hidden on mobile */}
                <div className="hidden md:flex space-x-6">
                    <a href="#auth-section" className="text-gray-600 hover:text-indigo-600 transition-colors">Register</a>
                    <a href="#auth-section" className="text-gray-600 hover:text-indigo-600 transition-colors">Login</a>
                    <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
                    <a href="#about" className="text-gray-600 hover:text-indigo-600 transition-colors">About</a>
                    <a href="#FAQ" className="text-gray-600 hover:text-indigo-600 transition-colors">FAQ</a>
                </div>

                {/* Mobile menu button */}
                <button
                    className='md:hidden text-gray-600 focus:outline-none'
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-expanded={mobileMenuOpen}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {mobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>

                {/* Mobile Menu - Dropdown version */}
                <div className={`
    md:hidden 
    absolute top-full left-0 right-0 
    bg-white shadow-lg z-50 
    transition-all duration-300 ease-in-out 
    overflow-hidden
    ${mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
  `}>
                    <div className="flex flex-col p-2 space-y-1">
                        <a
                            href="#auth-section"
                            className="text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg px-4 py-3 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Register
                        </a>
                        <a
                            href="#auth-section"
                            className="text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg px-4 py-3 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Login
                        </a>
                        <a
                            href="#features"
                            className="text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg px-4 py-3 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Features
                        </a>
                        <a
                            href="#about"
                            className="text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg px-4 py-3 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            About
                        </a>
                        <a
                            href="#FAQ"
                            className="text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg px-4 py-3 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            FAQ
                        </a>
                    </div>
                </div>



            </nav>

            {/* Hero Section */}
            <div className="container mx-auto px-6 py-16 flex flex-col md:flex-row items-center">
                {/* Left column - Hero Content */}
                <div className="md:w-1/2 flex flex-col items-start">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                        Track Your Study Time
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Monitor your daily reading hours, visualize your progress, and get personalized recommendations to improve your study habits.
                    </p>
                    <button
                        onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition-colors shadow-md"
                    >
                        Start Tracking
                    </button>
                </div>

                {/* Right column - Hero Image */}
                <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center">
                    <div className="relative">
                        <div className="absolute -top-6 -left-6 w-64 h-64 bg-indigo-200 rounded-full opacity-30"></div>
                        <img
                            //src="/assets/reading_tracker_window.jpg" 
                            src={image1}

                            alt="Reading time tracking dashboard preview"
                            className="relative z-10 rounded-lg shadow-xl"
                        />
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <section id="features" className="bg-white py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Key Features</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Feature 1 */}
                        <div className="flex flex-col items-center">
                            <div className="bg-indigo-100 p-3 rounded-full mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Track Reading Hours</h3>
                            <p className="text-gray-600 text-center">Log your daily reading time with our simple tracking system and build consistent study habits.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex flex-col items-center">
                            <div className="bg-indigo-100 p-3 rounded-full mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Visual Progress Charts</h3>
                            <p className="text-gray-600 text-center">See your reading patterns with intuitive charts and identify your most productive times.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex flex-col items-center">
                            <div className="bg-indigo-100 p-3 rounded-full mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Recommendations</h3>
                            <p className="text-gray-600 text-center">Receive personalized suggestions to optimize your reading schedule based on your data.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Auth Section */}
            <section id="auth-section" className="bg-gray-50 py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Start Your Reading Journey</h2>

                    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="flex border-b">
                            <button
                                className={`cursor-pointer w-1/2 py-4 text-center font-medium ${activeTab === 'login' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('login')}
                            >
                                Login
                            </button>
                            <button
                                className={`cursor-pointer w-1/2 py-4 text-center font-medium ${activeTab === 'register' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('register')}
                            >
                                Register
                            </button>
                        </div>

                        <div className="p-6">
                            {activeTab === 'login' ? <Login /> : <Register />}
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="bg-white py-16">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 mb-8 md:mb-0">
                            <div className="relative">
                                <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-indigo-200 rounded-full opacity-30"></div>
                                <img

                                    src={image2}

                                    alt="Student using ReadTime app"
                                    className="relative z-10 rounded-lg shadow-xl"
                                />
                            </div>
                        </div>
                        <div className="md:w-1/2 md:pl-12">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">About ReadTime</h2>
                            <p className="text-gray-600 mb-4">
                                ReadTime was developed by Chasfat Projects to help students track and optimize their reading habits. Our goal is to help you build consistent study routines and improve academic performance.
                            </p>
                            <p className="text-gray-600 mb-4">
                                With our analytics-driven platform, you can understand your reading patterns, set achievable goals, and make data-informed decisions about your study time.
                            </p>
                            <p className="text-gray-600">
                                Whether you're preparing for exams or developing lifelong learning habits, ReadTime provides the tools you need to make the most of your study sessions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section (New) */}
            <section className="bg-indigo-700 py-16 text-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">Results That Speak</h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                        <div>
                            {/*   <div className="text-4xl font-bold mb-2">87%</div> */}

                            <div className="text-4xl font-bold mb-2">
                                <CountUp end={87} suffix="%" duration={1500} />
                            </div>
                            <p className="text-indigo-200">of users improve study consistency</p>


                        </div>
                        <div>
                            {/*    <div className="text-4xl font-bold mb-2">2.5x</div> */}

                            <div className="text-4xl font-bold mb-2">
                                <CountUp end={2.5} suffix="x" duration={1500} decimals={1} />
                            </div>
                            <p className="text-indigo-200">average increase in focused reading time</p>
                        </div>
                        <div>
                            {/* <div className="text-4xl font-bold mb-2">93%</div> */}

                            <div className="text-4xl font-bold mb-2">
                                <CountUp end={93} suffix="%" duration={1500} />
                            </div>
                            <p className="text-indigo-200">user satisfaction rating</p>
                        </div>
                        <div>
                            {/*    <div className="text-4xl font-bold mb-2">10k+</div> */}

                            <div className="text-4xl font-bold mb-2">
                                <CountUp end={10000} prefix="+" duration={1500} />
                            </div>
                            <p className="text-indigo-200">students tracking their progress</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Usage Steps (New) */}
            <section className="bg-gray-50 py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">1</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Log Your Reading Time</h3>
                            <p className="text-gray-600">Use our simple timer or manual entry to track each study session. Its hassle-free</p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">2</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Analyze Your Data</h3>
                            <p className="text-gray-600">View detailed charts showing your reading patterns by time of day, day of week, and over longer periods.</p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">3</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Get Smart Suggestions</h3>
                            <p className="text-gray-600">Our AI analyzes your patterns and suggests optimal study times based on your most productive periods.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="FAQ" className="bg-white py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Frequently Asked Questions</h2>

                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="border-b border-gray-200 pb-4">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">How does the tracking work?</h3>
                            <p className="text-gray-600">Our app uses simple timers and manual entry options to accurately record your study sessions.</p>
                        </div>

                        <div className="border-b border-gray-200 pb-4">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Is my data private?</h3>
                            <p className="text-gray-600">Yes, all your reading data is stored securely and only visible to you.</p>
                        </div>

                        <div className="border-b border-gray-200 pb-4">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Can I use it on multiple devices?</h3>
                            <p className="text-gray-600">Absolutely! Your account syncs across all your devices in real-time.</p>
                        </div>
                    </div>
                </div>
            </section>




            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xl font-bold">ReadTime</span>
                        </div>
                        <div className="flex space-x-4">



                            {/*}
              <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>

                */}
                            <button
                                onClick={() => setOpenModal('privacy')}
                                className='cursor-pointer hover:text-indigo-400 transition-colors focus:outline-none'>
                                Privacy Policy
                            </button>
                            <button
                                onClick={() => setOpenModal('terms')}
                                className="cursor-pointer hover:text-indigo-400 transition-colors focus:outline-none"
                            >
                                Terms of Service
                            </button>





                            <a href="#FAQ" className="hover:text-indigo-400 transition-colors">FAQ</a>
                        </div>
                    </div>

                   {/* Modal Backdrop */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-800 rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-2 border-b border-gray-200 pb-2">
                  {openModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h3>
                <button 
                  onClick={() => setOpenModal(null)}
                  className=" cursor-pointer font-extrabold text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="prose prose-indigo">
                {openModal === 'privacy' ? <PrivacyPolicy /> : <TermsOfService />}
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setOpenModal(null)}
                  className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}











                    <div className="text-center mt-8 text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} ReadTime. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;