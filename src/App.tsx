import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { GuestProvider } from "./context/GuestContext";
import { Layout } from "./components/Layout";

import { GuideHome } from "./pages/public/GuideHome";
import { HousePage } from "./pages/public/HousePage";
import { RestaurantsPage } from "./pages/public/RestaurantsPage";
import { GroceriesPage } from "./pages/public/GroceriesPage";
import { ActivitiesPage } from "./pages/public/ActivitiesPage";
import { PracticalPage } from "./pages/public/PracticalPage";
import { GettingHerePage } from "./pages/public/GettingHerePage";
import { PrivacyPage } from "./pages/public/PrivacyPage";

import { ManualLayout } from "./pages/manual/ManualLayout";
import { ManualHome } from "./pages/manual/ManualHome";
import { ManualSectionPage } from "./pages/manual/ManualSectionPage";

import { LoginPage } from "./pages/admin/LoginPage";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { RestaurantsAdmin } from "./pages/admin/RestaurantsAdmin";
import { GroceriesAdmin } from "./pages/admin/GroceriesAdmin";
import { ActivitiesAdmin } from "./pages/admin/ActivitiesAdmin";
import { PracticalAdmin } from "./pages/admin/PracticalAdmin";
import { HouseManualAdmin } from "./pages/admin/HouseManualAdmin";
import { HouseShowcaseAdmin } from "./pages/admin/HouseShowcaseAdmin";

function App() {
  return (
    <AuthProvider>
      <GuestProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<GuideHome />} />
              <Route path="house" element={<HousePage />} />
              <Route path="restaurants" element={<RestaurantsPage />} />
              <Route path="groceries" element={<GroceriesPage />} />
              <Route path="activities" element={<ActivitiesPage />} />
              <Route path="practical" element={<PracticalPage />} />
              <Route path="getting-here" element={<GettingHerePage />} />
              <Route path="privacy" element={<PrivacyPage />} />

              <Route path="manual" element={<ManualLayout />}>
                <Route index element={<ManualHome />} />
                <Route path=":key" element={<ManualSectionPage />} />
              </Route>
            </Route>

            <Route path="admin/login" element={<LoginPage />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="restaurants" element={<RestaurantsAdmin />} />
              <Route path="groceries" element={<GroceriesAdmin />} />
              <Route path="activities" element={<ActivitiesAdmin />} />
              <Route path="practical" element={<PracticalAdmin />} />
              <Route path="manual" element={<HouseManualAdmin />} />
              <Route path="showcase" element={<HouseShowcaseAdmin />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </GuestProvider>
    </AuthProvider>
  );
}

export default App;
