
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { BottomNavigation } from "./BottomNavigation";
import Navbar from "./Navbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { LayoutContainer } from "./layout/LayoutContainer";
import { LayoutWrapper } from "./layout/LayoutWrapper";
import { Toaster } from "@/components/ui/toaster";
import { PushNotificationSetup } from "./notifications/PushNotificationSetup";
import { Capacitor } from "@capacitor/core";

export default function Layout() {
  const isMobile = useIsMobile();
  const isMobileApp = Capacitor.isNativePlatform();

  return (
    <LayoutContainer isMobile={isMobile} pageTransition={false}>
      {!isMobile && <Sidebar />}
      <LayoutWrapper>
        <Navbar />
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-4 pb-20 md:pb-4">
              {/* Show push notification setup only on mobile app */}
              {isMobileApp && (
                <div className="mb-4">
                  <PushNotificationSetup />
                </div>
              )}
              <Outlet />
            </div>
          </div>
        </main>
        {isMobile && <BottomNavigation />}
      </LayoutWrapper>
      <Toaster />
    </LayoutContainer>
  );
}
