import React, { Children } from "react";
import Navbar from "../components/user/Navbar";
import Footer from "../components/user/Footer";


const UserLayout = ({ children }: { children: React.ReactNode }) => {
    return (
    <div className="mx-4 sm:mx-[10%]">
        <Navbar />
        {children}
        <Footer />
    </div>
    )
}


export default UserLayout