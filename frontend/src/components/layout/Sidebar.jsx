import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import client from "../../api/client";

import {
  LayoutDashboard,
  UserCircle,
  ScanFace,
  CalendarCheck,
  ShoppingBag,
  TrendingUp,
  Stethoscope,
  Bell,
  Settings,
  Sparkles,
  FlaskConical,
} from "lucide-react";

export default function Sidebar() {
  const { user } = useAuth();

  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // =========================================================
  // LOAD UNREAD NOTIFICATIONS
  // =========================================================

  const loadUnreadNotifications = async () => {
    try {
      const response = await client.get("/notifications");

      const notifications = response.data || [];

      const unread = notifications.filter(
        (notification) => !notification.is_read
      ).length;

      setUnreadNotifications(unread);
    } catch (error) {
      console.error(
        "Failed to load notification count:",
        error
      );
    }
  };

  // =========================================================
  // LOAD WHEN USER LOGS IN
  // =========================================================

  useEffect(() => {
    if (!user) return;

    loadUnreadNotifications();

    // Check for new notifications every 10 seconds
    const interval = setInterval(() => {
      loadUnreadNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  // =========================================================
  // IF NO USER
  // =========================================================

  if (!user) return null;

  const isPatient = user.role === "user";

  const isProvider = [
    "consultant",
    "dermatologist",
  ].includes(user.role);

  const isAdmin = user.role === "admin";

  const menu = [];

  // =========================================================
  // PATIENT MENU
  // =========================================================

  if (isPatient) {
    menu.push(
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
        name: "Ingredient Intelligence",
        path: "/ingredients",
        icon: FlaskConical,
      },
      {
        name: "Progress",
        path: "/progress",
        icon: TrendingUp,
      },
      
      {
        name: "Appointments",
        path: "/appointments",
        icon: Stethoscope,
      },
      {
        name: "Notifications",
        path: "/notifications",
        icon: Bell,
        notification: true,
      },
      {
        name: "Settings",
        path: "/settings",
        icon: Settings,
      }
    );
  }

  // =========================================================
  // CONSULTANT / DERMATOLOGIST MENU
  // =========================================================

  if (isProvider) {
    menu.push(
      {
        name: "Dashboard",
        path: "/provider-dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Clients",
        path: "/clients",
        icon: UserCircle,
      },
      {
        name: "Appointments",
        path: "/consultant",
        icon: CalendarCheck,
      },
      {
        name: "Notifications",
        path: "/notifications",
        icon: Bell,
        notification: true,
      },
      {
        name: "Settings",
        path: "/settings",
        icon: Settings,
      }
    );
  }

  // =========================================================
  // ADMIN MENU
  // =========================================================

  if (isAdmin) {
    menu.push(
      {
        name: "Dashboard",
        path: "/admin",
        icon: LayoutDashboard,
      },
      {
        name: "Clients",
        path: "/clients",
        icon: UserCircle,
      },
      {
        name: "Notifications",
        path: "/notifications",
        icon: Bell,
        notification: true,
      },
      {
        name: "Settings",
        path: "/settings",
        icon: Settings,
      }
    );
  }

  // =========================================================
  // SIDEBAR
  // =========================================================

  return (
    <aside className="w-72 h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col">

      {/* =====================================================
          LOGO
      ====================================================== */}

      <div className="p-6 border-b">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center">

            <Sparkles
              className="text-white"
              size={24}
            />

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

      {/* =====================================================
          MENU
      ====================================================== */}

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">

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

              <span className="font-medium flex-1">
                {item.name}
              </span>

              {/* =================================================
                  NOTIFICATION BADGE
              ================================================== */}

              {item.notification &&
                unreadNotifications > 0 && (
                  <span
                    className="min-w-[24px] h-6 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
                  >
                    {unreadNotifications > 99
                      ? "99+"
                      : unreadNotifications}
                  </span>
                )}

            </NavLink>
          );
        })}

      </nav>

      
    </aside>
  );
}