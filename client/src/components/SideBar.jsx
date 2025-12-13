import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../hooks/AuthHOC";
import { LayoutDashboard, Album, Telescope, Users, Shield } from "lucide-react";

function SideBar() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [activeItem, setActiveItem] = useState(0);

    // Define menu based on user role
    let menuItems = [];

    if (user?.role === "admin") {
        menuItems = [
            { icon: LayoutDashboard, label: "Admin Dashboard", link: "/admin" },
            { icon: Album, label: "All Books", link: "/admin/books" },
            { icon: Users, label: "All Users", link: "/admin/users" },
            { icon: Telescope, label: "Explore", link: "/explore" }, // optional
        ];
    } else {
        menuItems = [
            { icon: LayoutDashboard, label: "Dashboard", link: "/dashboard" },
            { icon: Album, label: "My Library", link: "/mylibrary" },
            { icon: Telescope, label: "Explore", link: "/explore" },
        ];
    }

    // Set active menu based on current path
    useEffect(() => {
        const currentIndex = menuItems.findIndex(item => item.link === location.pathname);
        if (currentIndex !== -1) setActiveItem(currentIndex);
    }, [location.pathname, user]);

    const handleClick = (link, index) => {
        setActiveItem(index);
        navigate(link);
    };

    // Loading state if user is not yet fetched
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
