'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/lib/features/auth/authApi';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const { login: setAuthCredentials, isAuthenticated } = useAuth();
    const [login, { isLoading }] = useLoginMutation();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            const result = await login(formData).unwrap();

            if (result.success) {
                setAuthCredentials(result.token, { ...result.admin, isActive: true });
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.log(err)
            setError(err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setError('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
            <div className="w-full max-w-md">
                {/* Login Card */}
                <div className="dark:bg-[var(--bg-card)] rounded-xl sm:rounded-2xl shadow-xl border border-gray-400 p-6 sm:p-8 transition-colors">
                    {/* Logo and Title */}
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="flex justify-center mb-3 sm:mb-4">
                            <div className="relative w-12 h-12 sm:w-14 sm:h-14">
                                <Image
                                    src="/ahid_logo.png"
                                    alt="Ahid Logo"
                                    fill
                                    sizes="(max-width: 640px) 48px, 56px"
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] mb-1">
                            Welcome Back
                        </h1>
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                            Sign in to your admin account
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-5 sm:mb-6 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs sm:text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all"
                                    placeholder="admin@ahid.com"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-2 sm:py-2.5 text-xs sm:text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 sm:py-2.5 px-4 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-xs sm:text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-5 sm:mt-6 text-center text-xs text-[var(--text-tertiary)]">
                        <p>Admin access only • Ahid Platform</p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-3 sm:mt-4 text-center">
                    <p className="text-xs text-white/80">
                        © 2026 Ahid. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
