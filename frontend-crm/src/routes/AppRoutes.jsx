import { BrowserRouter, Route, Routes } from "react-router-dom";

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
                    {/* Protected routes will be added when their pages are committed */}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
