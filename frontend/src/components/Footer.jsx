import React from 'react';
import { Github, Linkedin, Trophy } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-card border-t border-border mt-auto py-8 px-6 pb-24 sm:pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Branding */}
        <div className="flex items-center gap-2">
          <div className="bg-accent text-accent-foreground p-2 rounded-xl shadow-lg shadow-accent/20">
            <Trophy size={18} />
          </div>
          <span className="font-black text-xl tracking-tight bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
            AuraPlay
          </span>
        </div>

        {/* Developer Credits */}
        <div className="text-center md:text-left text-sm font-medium text-muted-foreground">
          <span>Developed with ⚡ by </span>
          <span className="text-foreground font-bold hover:text-accent transition-colors duration-200">
            Rishi Varun Tatavarthi
          </span>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          <a 
            href="https://www.linkedin.com/in/tatavarthi-rishi-varun/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-secondary hover:bg-accent hover:text-accent-foreground text-foreground transition-all duration-300 hover:scale-110 shadow-sm"
            aria-label="LinkedIn"
          >
            <Linkedin size={18} />
          </a>
          <a 
            href="https://github.com/rishivaruntatavarthi" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-secondary hover:bg-accent hover:text-accent-foreground text-foreground transition-all duration-300 hover:scale-110 shadow-sm"
            aria-label="GitHub"
          >
            <Github size={18} />
          </a>
        </div>

      </div>
      
      {/* Copyright Line */}
      <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} AuraPlay. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
