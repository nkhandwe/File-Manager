import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowRight, CheckCircle, Eye, EyeOff, LoaderCircle, Lock, Mail, Monitor, Moon, Shield, Sun } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import TextLink from '@/components/text-link';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    // Initialize dark mode from localStorage or system preference
    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);

        if (newDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    if (!mounted) {
        return null; // Prevent hydration mismatch
    }

    return (
        <>
            <Head title="Sign In - DC Installation Management" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 transition-colors duration-300 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
                {/* Background Pattern */}
                <div className="bg-grid-pattern absolute inset-0 opacity-5 dark:opacity-10"></div>

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="fixed top-6 right-6 z-50 rounded-full border border-gray-200 bg-white/80 p-3 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800/80"
                    aria-label="Toggle dark mode"
                >
                    {darkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-indigo-600" />}
                </button>

                <div className="relative w-full max-w-md">
                    {/* Background Glow Effect */}
                    <div className="absolute -inset-1 animate-pulse rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-20 blur-lg dark:opacity-30"></div>

                    {/* Main Card */}
                    <div className="relative space-y-8 rounded-2xl border border-white/20 bg-white/90 p-8 shadow-2xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/90">
                        {/* Header */}
                        <div className="space-y-4 text-center">
                            {/* Logo */}
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                                <Monitor className="h-8 w-8 text-white" />
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-gray-300">
                                    Welcome Back
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">Sign in to your DC Installation Management account</p>
                            </div>
                        </div>

                        {/* Status Messages */}
                        {status && (
                            <div className="flex items-center space-x-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20">
                                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-medium text-green-800 dark:text-green-200">{status}</span>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={submit} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    <Mail className="h-4 w-4" />
                                    <span>Email Address</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full rounded-xl border border-gray-300 bg-white/50 px-4 py-3 pl-12 text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-400"
                                    />
                                    <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                                </div>
                                {errors.email && (
                                    <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-sm">{errors.email}</span>
                                    </div>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label className="flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    <div className="flex items-center space-x-2">
                                        <Lock className="h-4 w-4" />
                                        <span>Password</span>
                                    </div>
                                    {canResetPassword && (
                                        <TextLink
                                            href="/forgot-password"
                                            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full rounded-xl border border-gray-300 bg-white/50 px-4 py-3 pr-12 pl-12 text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-400"
                                    />
                                    <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute top-1/2 right-4 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-sm">{errors.password}</span>
                                    </div>
                                )}
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        tabIndex={3}
                                        className="h-5 w-5 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-blue-400"
                                    />
                                </div>
                                <label htmlFor="remember" className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Remember me for 30 days
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                tabIndex={4}
                                className="group flex w-full transform items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:scale-100 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none"
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="h-5 w-5 animate-spin" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </form>

                        
                        {/* Security Note */}
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
                            <div className="flex items-center space-x-3">
                                <Shield className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                    <span className="font-medium">Secure Login:</span> Your data is protected with enterprise-grade security.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        <p>© 2025 ASK Technologies - Cybernet IT Pvt. Ltd.</p>
                        <p className="mt-1">DC Installation Management System</p>
                    </div>
                </div>
            </div>

            {/* Custom CSS for grid pattern */}
            <style>{`
                .bg-grid-pattern {
                    background-image:
                        linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
            `}</style>
        </>
    );
}
