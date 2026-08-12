import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UserCircle,
  ScanFace,
  CalendarCheck,
  ShoppingBag,
  TrendingUp,
  Stethoscope,
  FileText,
  Bell,
  Settings,
  Sparkles,
} from "lucide-react";

const menu = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Skin Profile",
    path: "/profile",
    icon: UserCircle,
  },
  {
    name: "AI Assessment",
    path: "/assessment",
    icon: ScanFace,
  },
  {
    name: "Routine",
    path: "/routine",
    icon: CalendarCheck,
  },
  {
    name: "Products",
    path: "/products",
    icon: ShoppingBag,
  },
  {
    name: "Progress",
    path: "/progress",
    icon: TrendingUp,
  },
  {
    name: "Consultant",
    path: "/consultant",
    icon: Stethoscope,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: FileText,
  },
  {
    name: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-72 h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col">

      {/* Logo */}

      <div className="p-6 border-b">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center">

            <Sparkles className="text-white" size={24} />

          </div>

          <div>

            <h1 className="text-2xl font-bold text-gray-800">
              SkinIQ
            </h1>

            <p className="text-xs text-gray-500">
              AI Skin Intelligence
            </p>

          </div>

        </div>

      </div>

      {/* Menu */}

      <nav className="flex-1 p-4 space-y-2">

        {menu.map((item) => {

          const Icon = item.icon;

          return (

            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-violet-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-violet-50 hover:text-violet-600"
                }`
              }
            >
              <Icon size={22} />

              <span className="font-medium">
                {item.name}
              </span>

            </NavLink>

          );

        })}

      </nav>

      {/* Bottom */}

      <div className="p-5 border-t">

        <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white">

          <h3 className="font-semibold">
            AI Skin Scan
          </h3>

          <p className="text-sm opacity-90 mt-2">
            Scan your skin today and receive personalized insights.
          </p>

          <button className="mt-4 w-full bg-white text-violet-700 py-2 rounded-xl font-semibold hover:bg-gray-100 transition">
            Scan Now
          </button>

        </div>

      </div>

    </aside>
  );
}