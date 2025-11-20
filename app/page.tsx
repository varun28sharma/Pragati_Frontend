'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, type FormEvent } from 'react';
import { ChevronRight, Menu, X, BookOpen, Users, BarChart3, Shield, Zap, ChevronLeft, ChevronDown, Search } from 'lucide-react';

type PublicNotice = {
  id: string;
  schoolId?: string;
  title: string;
  body: string;
  category?: string;
  priority?: number;
  isPublic?: boolean;
  activeFrom?: string;
  activeTill?: string;
};

export default function PragatiLanding() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [heroGlow, setHeroGlow] = useState<{ x: number; y: number } | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [publicNotices, setPublicNotices] = useState<PublicNotice[]>([]);
  const [isNoticesLoading, setIsNoticesLoading] = useState(false);
  const [noticeError, setNoticeError] = useState<string | null>(null);
  const bannersRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const rolesRef = useRef<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
  const notificationsUrl = `${backendUrl}/api/communications/notifications/public`;

  const scrollWithOffset = (element: HTMLElement, offset: number) => {
    const elementTop = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(elementTop - offset, 0), behavior: 'smooth' });
    element.focus({ preventScroll: true });
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const heroElement = heroRef.current;
    if (!heroElement) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = heroElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setHeroGlow({ x, y });
    };

    const handleMouseLeave = () => {
      setHeroGlow(null);
    };

    heroElement.addEventListener('mousemove', handleMouseMove);
    heroElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      heroElement.removeEventListener('mousemove', handleMouseMove);
      heroElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
    document.body.style.overflow = '';
  }, [isSearchOpen]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const fetchNotices = async () => {
      setIsNoticesLoading(true);
      try {
        const response = await fetch(notificationsUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Failed to load notices');
        }
        const data = await response.json();
        if (isMounted) {
          setPublicNotices(Array.isArray(data?.items) ? data.items : []);
          setNoticeError(null);
        }
      } catch (error) {
        if (isMounted && (error as Error).name !== 'AbortError') {
          setNoticeError('Unable to load notices right now.');
        }
      } finally {
        if (isMounted) {
          setIsNoticesLoading(false);
        }
      }
    };

    fetchNotices();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [notificationsUrl]);

  const roles = [
    {
      id: 'student',
      title: 'Student',
      icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
      description: 'Track attendance, view marks',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'teacher',
      title: 'Teacher',
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      description: 'Mark attendance efficiently',
      color: 'from-teal-500 to-green-500',
    },
    {
      id: 'principal',
      title: 'Principal',
      icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />,
      description: 'Monitor school-wide data',
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'government',
      title: 'Government',
      icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6" />,
      description: 'Access compliance reports',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const governmentPrograms = [
    {
      id: 1,
      title: 'Mid-Day Meal Scheme',
      description: 'Nutrition support for all enrolled students',
      color: 'bg-gradient-to-br from-orange-400 to-orange-600',
      icon: '🍽️',
    },
    {
      id: 2,
      title: 'National Education Policy 2020',
      description: 'Implementation of NEP 2020 guidelines',
      color: 'bg-gradient-to-br from-blue-400 to-blue-600',
      icon: '📚',
    },
    {
      id: 3,
      title: 'PM Shri Scheme',
      description: 'Pradhan Mantri Schools for Rising India',
      color: 'bg-gradient-to-br from-green-400 to-green-600',
      icon: '🏫',
    },
    {
      id: 4,
      title: 'DIKSHA Platform',
      description: 'Digital Infrastructure for Knowledge Sharing',
      color: 'bg-gradient-to-br from-purple-400 to-purple-600',
      icon: '💻',
    },
    {
      id: 5,
      title: 'SAMAGRA Portal',
      description: 'Student & Academic Management',
      color: 'bg-gradient-to-br from-red-400 to-red-600',
      icon: '📊',
    },
    {
      id: 6,
      title: 'e-Pathshala Resources',
      description: 'Digital Learning Content Access',
      color: 'bg-gradient-to-br from-teal-400 to-teal-600',
      icon: '🎓',
    },
  ];

  const features = [
    { icon: <Zap className="w-6 h-6" />, title: 'Real-time Tracking', desc: 'Instant attendance updates' },
    { icon: <BarChart3 className="w-6 h-6" />, title: 'Smart Analytics', desc: 'Comprehensive reports' },
    { icon: <Shield className="w-6 h-6" />, title: 'Secure Data', desc: 'Government-grade security' },
    { icon: <Users className="w-6 h-6" />, title: 'Multi-Role Access', desc: 'Role-based dashboards' },
  ];

  const searchTargets = [
    {
      id: 'hero',
      label: 'Overview & Get Started',
      description: 'Return to the hero banner and CTA',
      keywords: ['home', 'top', 'overview', 'start'],
      offset: 120,
    },
    {
      id: 'roles',
      label: 'Role-Based Access',
      description: 'Jump to role-specific dashboards',
      keywords: ['login', 'roles', 'access'],
      offset: 150,
    },
    {
      id: 'features',
      label: 'Key Features',
      description: 'See why Pragati works for rural schools',
      keywords: ['benefits', 'features', 'why'],
      offset: 150,
    },
    {
      id: 'notices',
      label: 'Updates & Notices',
      description: 'Latest announcements and deadlines',
      keywords: ['updates', 'news', 'notices'],
      offset: 150,
    },
    {
      id: 'programs',
      label: 'Government Programs',
      description: 'Explore flagship education initiatives',
      keywords: ['schemes', 'programs', 'government'],
      offset: 150,
    },
    {
      id: 'contact',
      label: 'Contact & Support',
      description: 'Reach out for help or information',
      keywords: ['contact', 'support', 'help'],
      offset: 150,
    },
  ];

  const scrollToSection = (section: 'hero' | 'roles') => {
    const targetRef = section === 'hero' ? heroRef : rolesRef;
    const offset = section === 'hero' ? 120 : 150;
    if (targetRef.current) {
      scrollWithOffset(targetRef.current, offset);
      return;
    }
    const fallbackId = section === 'hero' ? 'hero' : 'roles';
    const element = document.getElementById(fallbackId);
    if (element) {
      scrollWithOffset(element, offset);
    }
  };

  const scrollToId = (targetId: string, offset = 150) => {
    const element = document.getElementById(targetId);
    if (element) {
      scrollWithOffset(element, offset);
    }
  };

  const handleSearchSelect = (targetId: string, offset = 150) => {
    scrollToId(targetId, offset);
    setIsSearchOpen(false);
    setSearchQuery('');
    setIsMenuOpen(false);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTargets = searchTargets.filter((target) => {
    if (!normalizedQuery) {
      return true;
    }
    const haystack = `${target.label} ${target.description}`.toLowerCase();
    const keywordMatch = target.keywords?.some((keyword) => keyword.toLowerCase().includes(normalizedQuery));
    return haystack.includes(normalizedQuery) || Boolean(keywordMatch);
  });
  const visibleTargets = filteredTargets.slice(0, 6);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const firstMatch = visibleTargets[0];
    if (firstMatch) {
      handleSearchSelect(firstMatch.id, firstMatch.offset);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    try {
      return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  const handlePrimaryNavigation = () => {
    const isAtTop = scrollY <= 10;
    if (isAtTop) {
      scrollToSection('roles');
    } else {
      scrollToSection('hero');
    }
    setIsSearchOpen(false);
    setSearchQuery('');
    setIsMenuOpen(false);
  };

  const handleRoleLogin = (roleId: string) => {
    setActiveRole(roleId);
    switch (roleId) {
      case 'student':
        router.push('/login/student');
        break;
      case 'teacher':
        router.push('/login/teacher');
        break;
      case 'principal':
        router.push('/login/principal');
        break;
      case 'government':
        router.push('/login/government');
        break;
      default:
        router.push('/roles');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 overflow-x-hidden">
      {/* Government Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs font-bold">🇮🇳</div>
            <span className="font-semibold">GOVERNMENT OF INDIA</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handlePrimaryNavigation}
              className="hidden sm:inline cursor-pointer hover:opacity-80 transition"
            >
              Skip to main content
            </button>
            <button className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition">
              <span>🌐</span>
              English
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="fixed top-10 sm:top-11 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo Section */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Image
                src="/pragati-logo.png"
                alt="Pragati e-Punjab School logo"
                width={80}
                height={80}
                priority
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow"
              />
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-gray-700 dark:text-gray-300">Pragati</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">e-Punjab School</div>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <div className="group relative">
                <button className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary flex items-center gap-1 transition">
                  Activities <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <a href="#roles" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition">
                Roles
              </a>
              <a href="#programs" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition">
                Programs
              </a>
              <a href="#notices" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition">
                Updates
              </a>
              <a href="#contact" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition">
                Help
              </a>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setIsSearchOpen((prev) => !prev);
                  setIsMenuOpen(false);
                }}
                aria-label="Search sections"
                aria-expanded={isSearchOpen}
                className={`p-2 rounded-lg transition border border-transparent hover:border-primary/30 ${
                  isSearchOpen ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => router.push('/roles')}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center text-white cursor-pointer font-bold hover:shadow-lg hover:shadow-red-400/40 transition"
              >
                👤
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
              <a href="#roles" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition">
                Roles
              </a>
              <a href="#programs" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition">
                Programs
              </a>
              <a href="#notices" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition">
                Updates
              </a>
            </div>
          )}
        </div>
      </nav>

      {isSearchOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Section search"
            className="fixed inset-x-4 top-[7.5rem] sm:top-32 sm:inset-auto sm:right-8 sm:left-auto z-50 w-auto sm:w-[420px] max-h-[80vh] overflow-hidden bg-white/95 dark:bg-slate-900/95 border border-white/30 dark:border-white/10 rounded-3xl shadow-2xl transition-transform duration-300 ease-out"
          >
            <form onSubmit={handleSearchSubmit} className="p-4 border-b border-white/20 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick search</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Close
                </button>
              </div>
              <label htmlFor="section-search" className="sr-only">
                Search sections
              </label>
              <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-3 py-2 rounded-2xl">
                <Search className="w-4 h-4 text-primary" />
                <input
                  ref={searchInputRef}
                  id="section-search"
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search for sections..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
                />
              </div>
            </form>
            <div className="max-h-[60vh] overflow-y-auto">
              {visibleTargets.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No sections match that search.</p>
              ) : (
                visibleTargets.map((target, idx) => (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => handleSearchSelect(target.id, target.offset)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition ${
                      idx % 2 === 0 ? 'bg-white/60 dark:bg-white/5' : 'bg-white/40 dark:bg-white/0'
                    } hover:bg-primary/10`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{target.label}</p>
                      <p className="text-xs text-muted-foreground">{target.description}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary">Jump</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Hero Section */}
      <section
        id="hero"
        ref={heroRef}
        tabIndex={-1}
        className="relative min-h-screen flex items-center justify-center pt-32 sm:pt-40 pb-20 overflow-hidden scroll-mt-32 sm:scroll-mt-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"
            style={{ top: '10%', left: '10%' }}
          />
          <div
            className="absolute w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow"
            style={{ top: '50%', right: '10%', animationDelay: '2s' }}
          />
          <div
            className="absolute w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse-slow"
            style={{ bottom: '10%', left: '50%', animationDelay: '4s' }}
          />
          {heroGlow && (
            <div
              className="absolute w-80 h-80 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent rounded-full blur-3xl opacity-60 transition-transform duration-150 ease-out"
              style={{
                transform: `translate3d(${heroGlow.x - 160}px, ${heroGlow.y - 160}px, 0)`,
              }}
            />
          )}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6 animate-in fade-in duration-1000">
            <div className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-white/30 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-sm shadow-primary/10 hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5">
              <span className="relative text-sm font-semibold text-primary">
                <span className="absolute inset-0 rounded-full bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative">Government Education Initiative</span>
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
              <span className="gradient-text">Pragati</span>
              <br />
              <span className="text-foreground">Smart Attendance System</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Transforming rural education through intelligent attendance tracking. Empowering teachers, students, and administrators with real-time insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={handlePrimaryNavigation}
                className="px-8 py-3 rounded-xl font-semibold text-primary bg-white/70 dark:bg-slate-900/70 border border-white/60 backdrop-blur-xl shadow-sm shadow-primary/10 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                Get Started <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition inline-block ml-2" />
              </button>
              <button className="px-8 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:shadow-lg hover:shadow-accent/30 transition">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Access Section */}
      <section
        id="roles"
        ref={rolesRef}
        tabIndex={-1}
        className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative z-20 bg-white/30 dark:bg-white/5 backdrop-blur-lg scroll-mt-40"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Role-Based <span className="gradient-text">Access</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Tailored interfaces for each stakeholder. Choose your role to login.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onMouseEnter={() => setActiveRole(role.id)}
                onFocus={() => setActiveRole(role.id)}
                onMouseLeave={() => setActiveRole(null)}
                onBlur={() => setActiveRole(null)}
                onClick={() => handleRoleLogin(role.id)}
                className={`rounded-2xl border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden ${
                  activeRole === role.id
                    ? 'border-accent/50 bg-gradient-to-br ' + role.color + '/10 shadow-lg shadow-accent/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-accent/30'
                }`}
              >
                {/* Icon and basic info */}
                <div className="p-3 sm:p-4 flex flex-col items-center text-center">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br ${role.color} text-white flex-shrink-0`}
                  >
                    {role.icon}
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm mb-1">{role.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{role.description}</p>
                  
                  {/* Login Button inside card */}
                  <div
                    className={`w-full px-2 sm:px-3 py-2 rounded-lg font-semibold text-xs transition group ${
                      activeRole === role.id
                        ? `bg-gradient-to-r ${role.color} text-white shadow-lg`
                        : 'bg-white/70 dark:bg-slate-900/70 border border-white/40 hover:bg-white/90 dark:hover:bg-slate-900/90 backdrop-blur-xl'
                    }`}
                  >
                    Login <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition inline-block ml-1" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        id="features"
        tabIndex={-1}
        className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 scroll-mt-40"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Why <span className="gradient-text">Pragati?</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Addressing the challenges of rural education with modern technology and thoughtful design.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-3 sm:p-4 border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl transition-all duration-200 hover:border-white/70 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 group flex flex-col items-center text-center"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white mb-2 sm:mb-3 group-hover:scale-110 transition text-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xs sm:text-sm font-bold mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="notices"
        tabIndex={-1}
        className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white/40 dark:bg-white/5 backdrop-blur-lg scroll-mt-40"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 sm:mb-8 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-1">Latest Updates</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Verified notices from the Pragati backend</p>
            </div>
            <span className="hidden sm:inline text-[11px] text-muted-foreground">Showing up to 5 active notices</span>
          </div>

          <div className="rounded-2xl border border-white/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-4 sm:p-5 flex flex-col max-w-xl sm:max-w-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Campus notices</p>
                <h3 className="text-sm sm:text-base font-semibold">Digital board</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">Live</span>
            </div>

            {isNoticesLoading ? (
              <p className="text-sm text-muted-foreground">Loading updates...</p>
            ) : noticeError ? (
              <p className="text-sm text-red-500">{noticeError}</p>
            ) : publicNotices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No public notices right now. Check back soon.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {publicNotices.slice(0, 5).map((notice) => (
                  <div key={notice.id} className="rounded-xl border border-white/30 p-3 bg-white/70 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <h4 className="font-semibold text-xs sm:text-sm truncate">{notice.title}</h4>
                      {notice.priority ? (
                        <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                          Priority {notice.priority}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{notice.body}</p>
                    <div className="text-[10px] text-muted-foreground flex items-center justify-between mt-1.5">
                      <span>{formatDate(notice.activeFrom)}</span>
                      {notice.schoolId ? <span>School #{notice.schoolId}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Government Programs Section */}
      <section
        id="programs"
        tabIndex={-1}
        className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-white/5 backdrop-blur-sm scroll-mt-40"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Government Programs & Schemes</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Important initiatives aligned with our attendance system</p>
          </div>

          {/* Banners Carousel */}
          <div className="relative">
            <button
              onClick={() => window.scrollBy({ left: -400, behavior: 'smooth' })}
              className="absolute -left-4 sm:left-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={bannersRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
              style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
            >
              {governmentPrograms.map((program) => (
                <div
                  key={program.id}
                  className="flex-shrink-0 w-full sm:w-80 snap-start"
                >
                  <div className={`${program.color} rounded-2xl p-4 sm:p-6 text-white h-full flex flex-col justify-between group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
                    <div>
                      <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{program.icon}</div>
                      <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">{program.title}</h3>
                      <p className="text-xs sm:text-sm text-white/90">{program.description}</p>
                    </div>
                    <button className="mt-3 sm:mt-4 text-xs sm:text-sm font-semibold text-white/80 hover:text-white flex items-center gap-2 transition">
                      Learn More <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => window.scrollBy({ left: 400, behavior: 'smooth' })}
              className="absolute -right-4 sm:right-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile scroll indicator */}
          <div className="sm:hidden text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            Swipe to see more programs
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        tabIndex={-1}
        className="border-t border-white/20 bg-white/30 dark:bg-white/5 backdrop-blur-lg py-8 sm:py-12 px-4 sm:px-6 lg:px-8 scroll-mt-40"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Image
                    src="/pragati-logo.png"
                    alt="Pragati e-Punjab School logo"
                    width={56}
                    height={56}
                    className="w-12 h-12 object-contain drop-shadow"
                  />
                  <span className="font-bold text-sm sm:text-base">Pragati</span>
                </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Smart attendance for rural schools</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">Features</a></li>
                <li><a href="#" className="hover:text-primary transition">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">About</a></li>
                <li><a href="#" className="hover:text-primary transition">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
            <p>&copy; 2025 Pragati. Transforming rural education in India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
