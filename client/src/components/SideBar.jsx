import { useState } from "react";
import { LayoutDashboard, Album, RotateCcw, Telescope, ShoppingCart } from 'lucide-react';
import { useNavigate } from "react-router-dom";

function SideBar() {
 const [activeItem, setActiveItem] = useState(0);
 const navigate = useNavigate();
 const handleClick = (item,index) => {
      setActiveItem(index);
      navigate(item.link)
 }

  const menuItems = [
     { icon: LayoutDashboard, label: 'Grid' , link : "/dashboard" },
    { icon: Album, label: 'Save' , link : "/mylibrary" },
    { icon: RotateCcw, label: 'Rotate', link : "/book/borrow"},
    { icon: Telescope, label: 'Share', link : "/explore"},
    { icon: ShoppingCart, label: 'Cart', link : "/store"},
  ];

  return (
    <div className="fixed left-0 top-0 h-screen flex items-center z-50 ml-6 ">
      <div className=" flex flex-col gap-4 h-fit px-3 py-3 rounded-full bg-[var(--secondary-background)]">
        {menuItems.map((item,index) => {
          const Icon = item.icon;
          const isActive = activeItem === index;
          
          return (
            <button
              key={index}
              onClick={() => handleClick(item,index)}
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

export default SideBar