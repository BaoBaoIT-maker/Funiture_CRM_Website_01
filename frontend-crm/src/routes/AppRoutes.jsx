import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Login from "../pages/Login";
import Products from "../pages/Products";
import RequireAuth from "./RequireAuth";
import Dashboard from "../pages/Dashboard.jsx";
import Customers from "../pages/Customers.jsx";

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
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/customers" element={<Customers />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
