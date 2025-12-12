import { useState, useContext, useEffect } from "react";
import { LayoutDashboard, Album, RotateCcw, Telescope, ShoppingCart, Shield } from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../hooks/AuthHOC";

function SideBar() {
    const { user } = useContext(AuthContext);
    console.log("Sidebar user:", user);  // <── ADD THIS

    const navigate = useNavigate();
    const location = useLocation();

    const [activeItem, setActiveItem] = useState(0);

    // Default menu items
    const menuItems = [
        { icon: LayoutDashboard, label: 'Grid', link: "/dashboard" },
        { icon: Album, label: 'Save', link: "/mylibrary" },
        { icon: RotateCcw, label: 'Rotate', link: "/book/borrow" },
        { icon: Telescope, label: 'Share', link: "/explore" },
        { icon: ShoppingCart, label: 'Cart', link: "/store" },
    ];

    // Add admin menu if user is admin
    if (user?.role === 'admin') {
        menuItems.push({ icon: Shield, label: 'Admin', link: "/admin" });
    }

    // Set active menu based on current path
    useEffect(() => {
        const currentIndex = menuItems.findIndex(item => item.link === location.pathname);
        if (currentIndex !== -1) setActiveItem(currentIndex);
    }, [location.pathname, user]); // rerun if path or user changes

    const handleClick = (link, index) => {
        setActiveItem(index);
        navigate(link);
    };

    // Show loading placeholder if user not loaded yet
    if (!user) {
        return (
            <div className="fixed left-0 top-0 h-screen flex items-center z-50 ml-6">
                <div className="flex flex-col gap-4 h-fit px-3 py-3 rounded-full bg-[var(--secondary-background)]">
                    <p className="text-gray-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed left-0 top-0 h-screen flex items-center z-50 ml-6">
            <div className="flex flex-col gap-4 h-fit px-3 py-3 rounded-full bg-[var(--secondary-background)]">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeItem === index;

                    return (
                        <button
                            key={index}
                            onClick={() => handleClick(item.link, index)}
                            className={`
                                w-12 h-12 rounded-full flex items-center justify-center
                                transition-all duration-200 ease-in-out
                                ${isActive
                                    ? 'bg-[var(--primary)] text-white shadow-lg transform scale-105'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm hover:scale-105'
                                }
                            `}
                            title={item.label}
                        >
                            <Icon size={18} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default SideBar;
