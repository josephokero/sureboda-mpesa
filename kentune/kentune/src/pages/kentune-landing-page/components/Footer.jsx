
import React from 'react';

import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa';


const Footer = () => (
  <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12 px-4">
      {/* Left: Logo, Description, Contact */}
      <div className="flex-1 min-w-[250px]">
        <div className="mb-6">
          <span className="bg-orange-500 text-white font-bold px-4 py-2 rounded-lg text-2xl">KENTUNEZ</span>
        </div>
        <p className="text-gray-300 mb-6 max-w-md">
          Kenya's leading music distribution platform. Helping Kenyan artists reach global audiences and earn from their music.
        </p>
        <div className="flex flex-col items-start text-left text-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <span role="img" aria-label="location" className="text-orange-400">📍</span>
            <span>Nairobi, Kenya</span>
          </div>
          <div className="flex items-center gap-2">
            <span role="img" aria-label="email" className="text-orange-400">✉️</span>
            <a href="mailto:support@kentunez.com" className="hover:text-orange-400 transition-colors">support@kentunez.com</a>
          </div>
          <div className="flex items-center gap-2">
            <span role="img" aria-label="phone" className="text-orange-400">📞</span>
            <a href="tel:+254701956808" className="hover:text-orange-400 transition-colors">+254701956808</a>
          </div>
        </div>
      </div>
      {/* Right: Socials and Copyright */}
      <div className="flex-1 min-w-[250px] flex flex-col items-center md:items-end text-center md:text-right">
        <div className="mb-6 w-full">
          <span className="text-gray-300">Follow us:</span>
          <div className="flex items-center gap-4 mt-3 justify-center md:justify-end">
            <a href="https://www.facebook.com/share/1CGXf6HyUt/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="bg-gray-800 rounded-full p-3 hover:bg-orange-500 transition-colors" aria-label="Facebook"><FaFacebookF size={20} /></a>
            <a href="https://www.instagram.com/kentunez_music?igsh=bGRoaTlxeXlkNGRq&utm_source=qr" target="_blank" rel="noopener noreferrer" className="bg-gray-800 rounded-full p-3 hover:bg-orange-500 transition-colors" aria-label="Instagram"><FaInstagram size={20} /></a>
            <a href="https://youtube.com/@kentunez_music?si=H97KvovGA9wMAgh4" target="_blank" rel="noopener noreferrer" className="bg-gray-800 rounded-full p-3 hover:bg-orange-500 transition-colors" aria-label="YouTube"><FaYoutube size={20} /></a>
            <a href="https://www.tiktok.com/@kentunez_music?_t=ZM-8zNeBCxBDPh&_r=1" target="_blank" rel="noopener noreferrer" className="bg-gray-800 rounded-full p-3 hover:bg-orange-500 transition-colors" aria-label="TikTok"><FaTiktok size={20} /></a>
          </div>
          <div className="flex justify-center md:justify-end mt-4 text-xs text-gray-400 w-full">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <div className="flex flex-col space-y-3">
                <div>
                  <Link to="/about-us" className="hover:text-white font-semibold transition-colors">About Us</Link>
                  <div className="text-[11px] text-gray-500">Learn about our mission, vision, and team.</div>
                </div>
                <div>
                  <Link to="/how-it-works" className="hover:text-white font-semibold transition-colors">How It Works</Link>
                  <div className="text-[11px] text-gray-500">Step-by-step guide to using KENTUNEZ.</div>
                </div>
                <div>
                  <Link to="/faqs" className="hover:text-white font-semibold transition-colors">FAQs</Link>
                  <div className="text-[11px] text-gray-500">Answers to common questions about our platform.</div>
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <div>
                  <Link to="/contact-us" className="hover:text-white font-semibold transition-colors">Contact Us</Link>
                  <div className="text-[11px] text-gray-500">Get in touch with our support team.</div>
                </div>
                <div>
                  <Link to="/artist-resources" className="hover:text-white font-semibold transition-colors">Artist Resources</Link>
                  <div className="text-[11px] text-gray-500">Guides and tools to help you grow as an artist.</div>
                </div>
                <div>
                  <Link to="/success-stories" className="hover:text-white font-semibold transition-colors">Success Stories</Link>
                  <div className="text-[11px] text-gray-500">Real stories from artists who use KENTUNEZ.</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 justify-center md:justify-end mt-4 text-xs text-gray-400">
            <Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms and Conditions</Link>
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
        <div className="text-xs text-gray-400 mb-2">
          © 2025 KENTUNEZ. All rights reserved. Empowering Kenyan music globally.<br />
          Powered by Astute Pro Music.
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;