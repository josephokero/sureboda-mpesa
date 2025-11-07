import React from 'react';
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa';
const AuthFooter = ({ children }) => {
  return (
    <footer className="mt-8 pt-8 border-t border-border text-center text-gray-700">
      <span className="bg-primary text-white font-bold px-4 py-1 rounded mb-2 text-lg tracking-wide">KENTUNEZ</span>
      <div className="text-xs text-gray-500 mt-2">© 2025 KENTUNEZ. All rights reserved.</div>
      <div className="flex justify-center gap-6 mt-2 text-xs">
        <a href="/privacy-policy" className="hover:underline text-primary">Privacy Policy</a>
        <a href="/terms-and-conditions" className="hover:underline text-primary">Terms and Conditions</a>
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <a href="https://www.facebook.com/share/1CGXf6HyUt/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="rounded-full p-0.5" aria-label="Facebook">
            <FaFacebookF size={36} color="#1877F3" style={{ filter: 'drop-shadow(0 2px 6px #1877F3AA)' }} />
          </a>
          <a href="https://www.instagram.com/kentunez_music?igsh=bGRoaTlxeXlkNGRq&utm_source=qr" target="_blank" rel="noopener noreferrer" className="rounded-full p-0.5" aria-label="Instagram">
            <FaInstagram size={36} color="#E4405F" style={{ filter: 'drop-shadow(0 2px 6px #E4405FAA)' }} />
          </a>
          <a href="https://youtube.com/@kentunez_music?si=H97KvovGA9wMAgh4" target="_blank" rel="noopener noreferrer" className="rounded-full p-0.5" aria-label="YouTube">
            <FaYoutube size={36} color="#FF0000" style={{ filter: 'drop-shadow(0 2px 6px #FF0000AA)' }} />
          </a>
          <a href="https://www.tiktok.com/@kentunez_music?_t=ZM-8zNeBCxBDPh&_r=1" target="_blank" rel="noopener noreferrer" className="rounded-full p-0.5" aria-label="TikTok">
            <FaTiktok size={36} color="#000" style={{ filter: 'drop-shadow(0 2px 6px #000000AA)' }} />
          </a>
      </div>
      {/* Extra children (e.g. sign in link) */}
      <div className="mt-4">{children}</div>
    </footer>
  );
};

export default AuthFooter;