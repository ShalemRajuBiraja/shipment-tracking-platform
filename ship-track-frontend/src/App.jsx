import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/toast.css";

// Public Pages
import Home from "./pages/Home/Home";
import Register from "./pages/Auth/Register";
import AdminLogin from "./pages/Auth/AdminLogin";
import ForgotPassword from "./pages/Auth/ForgotPassword";

// Customer Pages
import CustomerDashboard from "./pages/Customer/CustomerDashboard";
import CustomerLayout from "./pages/Customer/CustomerLayout";
import ShipmentHistory from "./pages/Customer/ShipmentHistory";
import CustomerSettings from "./pages/Customer/Settings";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminLayout from "./pages/Admin/AdminLayout";
import Users from "./pages/Admin/Users";
import Settings from "./pages/Admin/Settings";
import CreateShipment from "./pages/Admin/CreateShipment";
import Shipments from "./pages/Admin/Shipments";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

// Operator Pages
import OperatorShipments from "./pages/LogisticsOperator/OperatorShipments";
import OperatorSettings from "./pages/LogisticsOperator/OperatorSettings";
import OperatorShipmentDetails from "./pages/LogisticsOperator/OperatorShipmentDetails";
import OperatorLayout from "./pages/LogisticsOperator/OperatorLayout";
import OperatorSupport from "./pages/LogisticsOperator/OperatorSupport";


// Authentication
import ProtectedRoute from "./components/ProtectedRoute";

// Support Agent Pages
import SupportDashboard from "./pages/SupportAgent/SupportDashboard";
import SupportLayout from "./pages/SupportAgent/SupportLayout";
import SupportRequests from "./pages/SupportAgent/SupportRequests";
import ShipmentLookup from "./pages/SupportAgent/ShipmentLookup";
import ResolvedRequests from "./pages/SupportAgent/ResolvedRequests";
import SupportSettings from "./pages/SupportAgent/SupportSettings";

// Business Client Pages
import BusinessLayout from "./pages/Business/BusinessLayout";
import BusinessDashboard from "./pages/Business/BusinessDashboard";
import BusinessShipments from "./pages/Business/BusinessShipments";
import CreateBusinessShipment from "./pages/Business/CreateBusinessShipment";
import BusinessSettings from "./pages/Business/BusinessSettings";
import BusinessSupport from "./pages/Business/BusinessSupport";
import BusinessShipmentDetails from "./pages/Business/BusinessShipmentDetails";
import CustomerSupport from "./pages/Customer/CustomerSupport";
import ShipmentTracking from "./pages/Customer/ShipmentTracking";
import AdminShipmentDetails from "./pages/Admin/AdminShipmentDetails";
import DeliveryConfirmation from "./pages/Customer/DeliveryConfirmation";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/auth/register" element={<Register />}/>
        <Route path="/auth/admin/login" element={<AdminLogin />}/>
        <Route path="/auth/forgot-password" element={<ForgotPassword />}/>

        {/* CUSTOMER ROUTES*/}
        <Route path="/customer" element={ <ProtectedRoute allowedRole="CUSTOMER"> <CustomerLayout /> </ProtectedRoute> } >
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="shipment-history" element={<ShipmentHistory />} />
        <Route path="settings"element={<CustomerSettings />}/>
        <Route path="support" element={<CustomerSupport />}/>
        <Route path="shipment/:trackingNumber" element={<ShipmentTracking />} />
        <Route path="delivery-confirmation/:trackingNumber"  element={<DeliveryConfirmation />}/>
        </Route>


        {/*ADMIN ROUTES*/}
        <Route path="/admin" element={  <ProtectedRoute allowedRole="ADMIN"> <AdminLayout /> </ProtectedRoute>  } >
        <Route path="dashboard" element={<AdminDashboard />}/>
        <Route path="settings" element={<Settings />}/>
        <Route path="users" element={<Users />} />
        <Route path="create-shipment"  element={<CreateShipment />} />
        <Route path="shipments"  element={<Shipments />}/>
        <Route path="/admin/shipments/:id" element={<AdminShipmentDetails />}/>
        <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* LOGISTICS OPERATOR ROUTES */}
        <Route path="/logistics-operator" element={<ProtectedRoute allowedRole="LOGISTICS_OPERATOR"><OperatorLayout /></ProtectedRoute>}>
        <Route path="shipments" element={<OperatorShipments />} />
        <Route path="settings" element={<OperatorSettings />} />
        <Route path="shipments/:id" element={<OperatorShipmentDetails />}/>
        <Route path="support" element={<OperatorSupport />}/>
        </Route>

        {/* SUPPORT AGENT ROUTES */}
      <Route path="/support-agent" element={<ProtectedRoute allowedRole="SUPPORT_AGENT"><SupportLayout /></ProtectedRoute>}>
      <Route path="dashboard" element={<SupportDashboard />} />
      <Route path="requests" element={<SupportRequests />} />
      <Route path="shipment-lookup" element={<ShipmentLookup />} />
      <Route path="resolved" element={<ResolvedRequests />} />
      <Route path="settings" element={<SupportSettings />} />
      </Route>

      {/* BUSINESS CLIENT ROUTES */}
      <Route path="/business" element={ <ProtectedRoute allowedRole="BUSINESS_CLIENT">  <BusinessLayout /> </ProtectedRoute> }>
      <Route path="dashboard" element={<BusinessDashboard />} />
      <Route path="shipments" element={<BusinessShipments />} />
      <Route path="create-shipment" element={<CreateBusinessShipment />} /> 
      <Route path="settings" element={<BusinessSettings />} />
      <Route path="support" element={<BusinessSupport />}/>
      <Route path="/business/shipments/:id" element={<BusinessShipmentDetails />}/>
      </Route>

      </Routes>


      {/* TOAST NOTIFICATIONS
      ========================== */}

      <ToastContainer
        position="top-center"
        autoClose={1000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        limit={3}
      />

    </BrowserRouter>
  );
}

export default App;
