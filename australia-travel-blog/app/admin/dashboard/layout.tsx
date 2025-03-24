'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutGrid, 
  FileText, 
  Map, 
  Tag, 
  Image, 
  Users, 
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Link2,
  Home,
  Folder,
  Settings as SettingsIcon,
  Image as ImageIcon,
  FileText as FileTextIcon,
  Folder as FolderIcon
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [directorySubmenuOpen, setDirectorySubmenuOpen] = useState(false);
  const [blogSubmenuOpen, setBlogSubmenuOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.push('/admin/login');
      } else {
        console.error('Failed to sign out');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const MENU_ITEMS = [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: <Home className="w-5 h-5" />,
    },
    {
      title: 'Blog',
      href: '/admin/dashboard/blog',
      icon: <FileTextIcon className="w-5 h-5" />,
      submenu: [
        {
          title: 'Posts',
          href: '/admin/dashboard/blog/posts',
        },
        {
          title: 'Categories',
          href: '/admin/dashboard/blog/categories',
        },
        {
          title: 'Tags',
          href: '/admin/dashboard/blog/tags',
        },
      ],
    },
    {
      title: 'Media',
      href: '/admin/dashboard/media',
      icon: <ImageIcon className="w-5 h-5" />,
    },
    {
      title: 'Directory',
      href: '/admin/dashboard/directory',
      icon: <FolderIcon className="w-5 h-5" />,
      submenu: [
        {
          title: 'Listings',
          href: '/admin/dashboard/directory/listings',
        },
        {
          title: 'Categories',
          href: '/admin/dashboard/directory/categories',
        },
      ],
    },
    {
      title: 'Settings',
      href: '/admin/dashboard/settings',
      icon: <SettingsIcon className="w-5 h-5" />,
    },
    // Add other menu items as needed
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile Sidebar Toggle Button */}
      <button
        className="fixed z-50 bottom-4 right-4 p-2 rounded-full bg-blue-600 text-white lg:hidden"
        onClick={toggleMobileSidebar}
      >
        {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar - Desktop */}
      <div
        className={`hidden lg:block ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className={`${!isSidebarOpen && 'hidden'} font-semibold text-lg`}>
            Admin Panel
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isSidebarOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <nav className="mt-4 px-2">
          <ul className="space-y-1">
            {MENU_ITEMS.map((item, index) => (
              <li key={index}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => setBlogSubmenuOpen(!blogSubmenuOpen)}
                      className={`flex items-center w-full p-2 text-left rounded-md ${
                        blogSubmenuOpen ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {isSidebarOpen && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {blogSubmenuOpen ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </>
                      )}
                    </button>
                    {blogSubmenuOpen && isSidebarOpen && (
                      <ul className="pl-10 mt-1 space-y-1">
                        {item.submenu.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <Link
                              href={subItem.href}
                              className={`block p-2 rounded-md ${
                                pathname === subItem.href
                                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              {subItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href || '#'}
                    className={`flex items-center p-2 rounded-md ${
                      pathname === item.href
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {isSidebarOpen && <span>{item.title}</span>}
                  </Link>
                )}
              </li>
            ))}
            <li className="mt-6">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
              >
                <LogOut className="w-5 h-5 mr-3" />
                {isSidebarOpen && <span>Sign Out</span>}
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Sidebar - Mobile */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileSidebar}></div>
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-white dark:bg-gray-800 shadow-xl">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
              <div className="font-semibold text-lg">Admin Panel</div>
              <button
                onClick={toggleMobileSidebar}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto mt-4 px-2">
              <ul className="space-y-1">
                {MENU_ITEMS.map((item, index) => (
                  <li key={index}>
                    {item.submenu ? (
                      <>
                        <button
                          onClick={() => setBlogSubmenuOpen(!blogSubmenuOpen)}
                          className={`flex items-center w-full p-2 text-left rounded-md ${
                            blogSubmenuOpen ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <span className="mr-3">{item.icon}</span>
                          <span className="flex-1">{item.title}</span>
                          {blogSubmenuOpen ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                        {blogSubmenuOpen && (
                          <ul className="pl-10 mt-1 space-y-1">
                            {item.submenu.map((subItem, subIndex) => (
                              <li key={subIndex}>
                                <Link
                                  href={subItem.href}
                                  onClick={toggleMobileSidebar}
                                  className={`block p-2 rounded-md ${
                                    pathname === subItem.href
                                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                  }`}
                                >
                                  {subItem.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href || '#'}
                        onClick={toggleMobileSidebar}
                        className={`flex items-center p-2 rounded-md ${
                          pathname === item.href
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.title}</span>
                      </Link>
                    )}
                  </li>
                ))}
                <li className="mt-6">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span>Sign Out</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center px-6">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 