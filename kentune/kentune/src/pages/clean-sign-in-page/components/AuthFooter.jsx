import React from 'react';
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa';
const AuthFooter = ({ children }) => {
  return (
    <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col items-center gap-4 mt-2">
            <div className="flex justify-center gap-4">
              <a href="https://www.facebook.com/share/1CGXf6HyUt/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="rounded-full p-3 shadow-lg hover:scale-110 transition-transform" aria-label="Facebook">
                  <FaFacebookF size={36} color="#1877F3" style={{ filter: 'drop-shadow(0 0 8px #1877F3AA)' }} />
              </a>
              <a href="https://www.instagram.com/kentunez_music?igsh=bGRoaTlxeXlkNGRq&utm_source=qr" target="_blank" rel="noopener noreferrer" className="rounded-full p-3 shadow-lg hover:scale-110 transition-transform" aria-label="Instagram">
                  <FaInstagram size={36} color="#E4405F" style={{ filter: 'drop-shadow(0 0 8px #E4405FAA)' }} />
              </a>
              <a href="https://youtube.com/@kentunez_music?si=H97KvovGA9wMAgh4" target="_blank" rel="noopener noreferrer" className="rounded-full p-3 shadow-lg hover:scale-110 transition-transform" aria-label="YouTube">
                  <FaYoutube size={36} color="#FF0000" style={{ filter: 'drop-shadow(0 0 8px #FF0000AA)' }} />
              </a>
              <a href="https://www.tiktok.com/@kentunez_music?_t=ZM-8zNeBCxBDPh&_r=1" target="_blank" rel="noopener noreferrer" className="rounded-full p-3 shadow-lg hover:scale-110 transition-transform" aria-label="TikTok">
                  <FaTiktok size={36} color="#000" style={{ filter: 'drop-shadow(0 0 8px #000000AA)' }} />
              </a>
            </div>
            <div className="flex justify-center gap-6 text-xs mt-2">
      <a href="/privacy-policy" className="hover:underline text-primary">Privacy Policy</a>
      <a href="/terms-and-conditions" className="hover:underline text-primary">Terms and Conditions</a>
            </div>
          </div>
      {children}
    </div>
  );
};

export default AuthFooter;