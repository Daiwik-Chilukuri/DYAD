// Gridline Dashboard UI Inspiration Prototype Entry Point
// Exporting icons, layouts, and dashboard inspiration components for DYAD

// 1. Assets & Icons
export { WorkspacesIcon, SidebarToggleIcon } from "./src/assets/icons";
export { Logo as GridlineLogo } from "./src/assets/logo";
export {
  IconCatalogGrid,
  ICON_INSPIRATION_ITEMS,
  type IconInspirationItem,
} from "./src/assets/icon-catalog";

// 2. Visual Wireframe Blueprints (Placements & Layout)
export {
  WireframeRailSidebar,
  WireframeTopNavbar,
  WireframeBentoWorkspace,
  WireframeSplitInspector,
} from "./src/components/layout/wireframe-layouts";

// 3. Extracted Layout Components
export { AppSidebar, MobileNavigation } from "./src/components/layout/app-sidebar";
export { TopNavbar } from "./src/components/layout/top-navbar";
export { DashboardShell } from "./src/components/layout/dashboard-shell";
export { SidebarNavigationItem } from "./src/components/layout/sidebar-navigation-item";

// 4. Extracted Dashboard Views
export { DashboardContent } from "./src/components/dashboard/dashboard-content";
export { FlexibilityDashboard } from "./src/components/dashboard/flexibility-dashboard";
export { ModellingDashboard } from "./src/components/dashboard/modelling-dashboard";
export { default as DashboardView } from "./src/dashboardView";
export { default as GridlineDashboardDemo } from "./src/demo";

// 5. Data & Metadata Contracts
export * from "./src/data";
