import React, { Children } from "react";
import Navbar from "../components/admin/AdminNavbar";
import Footer from "../components/admin/AdminFooter";
import AdminSidebar from "../components/admin/AdminSidebar";


const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
    <div className="mx-4 sm:mx=[10%]">
        <Navbar />
        <div className="flex">
            <AdminSidebar />
            <div className="flex-1">
                {children}
            </div>
        </div>
        <Footer />
    </div>
    )
}


export default AdminLayout