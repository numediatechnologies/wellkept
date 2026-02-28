import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./shell/AppShell";
import {
  AdminPage,
  AlertsPage,
  BrowsePage,
  BuyerWizardPage,
  DashboardPage,
  GeographyPage,
  HomePage,
  ListingDetailPage,
  NotFoundPage,
  SellerWizardPage,
} from "./views/pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "browse", element: <BrowsePage /> },
      { path: "browse/:categorySlug", element: <BrowsePage /> },
      {
        path: "browse/:categorySlug/:provinceSlug/:citySlug",
        element: <BrowsePage />,
      },
      { path: "listing/:listingSlug", element: <ListingDetailPage /> },
      { path: "buyer-post/new", element: <BuyerWizardPage /> },
      { path: "seller/listing/new", element: <SellerWizardPage /> },
      { path: "alerts", element: <AlertsPage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "south-africa", element: <GeographyPage /> },
      { path: "south-africa/:provinceSlug", element: <GeographyPage /> },
      {
        path: "south-africa/:provinceSlug/:citySlug",
        element: <GeographyPage />,
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
