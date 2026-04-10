import { BrowserRouter, Route, Routes } from "react-router-dom";

// IMPORT ĐÚNG PATH
import Login from "../pages/Login";
// import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
// import Customers from "../pages/Customers";
// import CustomerDetail from "../pages/CustomerDetail";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/Login";
import RequireAuth from "./RequireAuth";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                    element={(
                        <RequireAuth>
                            <MainLayout />
                        </RequireAuth>
                    )}
                >
                    {/*<Route path="/" element={<Dashboard />} />*/}
                    <Route path="/products" element={<Products />} />
                    {/*<Route path="/customers" element={<Customers />} />*/}
                    {/*<Route path="/customers/:id" element={<CustomerDetail />} />*/}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
