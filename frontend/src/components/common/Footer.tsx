import { assets } from "../../assets/user/assets";

const Footer = () => (
  <footer className="bg-slate-950 text-slate-400">
    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 px-6 md:px-10 py-16">
      <div>
        <img
          src={assets.logo_dark ?? assets.logo}
          alt="logo"
          className="w-40 mb-4"
        />
        <p className="max-w-sm leading-7">
          MediSlot brings world‑class healthcare to your fingertips with instant
          booking, secure video consults, and digital records — all wrapped in a
          stunning experience.
        </p>
      </div>

      <div>
        <h4 className="text-white mb-4 font-semibold">Company</h4>
        <ul className="space-y-2">
          <li>Home</li>
          <li>About</li>
          <li>Contact</li>
          <li>Privacy</li>
        </ul>
      </div>

      <div>
        <h4 className="text-white mb-4 font-semibold">Get in touch</h4>
        <ul className="space-y-2">
          <li>+1‑212‑456‑7890</li>
          <li>support@medislot.com</li>
        </ul>
      </div>
    </div>

    <p className="text-center text-xs py-6 border-t border-white/10">
      © 2025 MediSlot • All rights reserved
    </p>
  </footer>
);

export default Footer;
