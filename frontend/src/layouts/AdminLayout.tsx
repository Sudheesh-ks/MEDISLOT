import React, { Children } from "react";
import Navbar from "../components/admin/AdminNavbar";
import Footer from "../components/admin/AdminFooter";


const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
    <div className="mx-4 sm:mx=[10%]">
        <Navbar />
        {children}
        <Footer />
    </div>
    )
}


export default AdminLayout