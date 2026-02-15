'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface User {
    name: string;
    email: string;
    role: 'admin' | 'sales_rep';
}

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const storedUser = localStorage.getItem('crm_user');
        if (!storedUser && !pathname.includes('/login') && !pathname.includes('/signup') && !pathname.includes('/forgot-password') && !pathname.includes('/reset-password')) {
            router.push('/login');
        } else if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, [router, pathname]);

    const handleLogout = () => {
        localStorage.removeItem('crm_user');
        router.push('/login');
    };

    if (!user && !pathname.includes('/login') && !pathname.includes('/signup') && !pathname.includes('/forgot-password') && !pathname.includes('/reset-password')) {
        return <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">Loading...</div>;
    }

    if (pathname.includes('/login') || pathname.includes('/signup') || pathname.includes('/forgot-password') || pathname.includes('/reset-password')) {
        return <>{children}</>;
    }

    const navItems = user?.role === 'admin' ? [
        { name: 'Dashboard', href: '/admin/dashboard' },
        { name: 'Leads', href: '/admin/leads' },
        { name: 'Pipeline', href: '/admin/pipeline' },
        { name: 'Users', href: '/admin/users' },
        { name: 'Templates', href: '/admin/templates' },
    ] : [
        { name: 'Dashboard', href: '/rep/dashboard' },
        { name: 'Leads', href: '/rep/leads' },
        { name: 'Pipeline', href: '/rep/pipeline' },
        { name: 'Follow-ups', href: '/rep/followups' },
    ];

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">CRM Pro</h1>
                </div>
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`block px-4 py-2 text-sm font-medium rounded-md ${pathname === item.href
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            {user?.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
