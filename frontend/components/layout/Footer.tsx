'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // TODO: Implementar suscripción al newsletter
      console.log('Newsletter subscription:', email);
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const footerLinks = {
    company: [
      { label: 'Nosotros', href: '/nosotros' },
      { label: 'Nuestra Historia', href: '/historia' },
      { label: 'Carreras', href: '/carreras' },
      { label: 'Prensa', href: '/prensa' },
    ],
    customer: [
      { label: 'Centro de Ayuda', href: '/ayuda' },
      { label: 'Guía de Tallas', href: '/guias/tallas' },
      { label: 'Guía de Cuidado', href: '/guias/cuidado' },
      { label: 'Programa de Fidelidad', href: '/fidelidad' },
    ],
    shopping: [
      { label: 'Cómo Comprar', href: '/como-comprar' },
      { label: 'Envíos y Entregas', href: '/envios' },
      { label: 'Devoluciones', href: '/devoluciones' },
      { label: 'Preguntas Frecuentes', href: '/faq' },
    ],
    legal: [
      { label: 'Términos y Condiciones', href: '/terminos' },
      { label: 'Política de Privacidad', href: '/privacidad' },
      { label: 'Política de Cookies', href: '/cookies' },
      { label: 'Aviso Legal', href: '/legal' },
    ],
  };

  const socialLinks = [
    { name: 'Instagram', href: '#', icon: '📷' },
    { name: 'Facebook', href: '#', icon: '📘' },
    { name: 'TikTok', href: '#', icon: '🎵' },
    { name: 'YouTube', href: '#', icon: '📺' },
  ];

  const FooterSection = ({ 
    title, 
    links, 
    sectionKey, 
    isMobile = false 
  }: { 
    title: string; 
    links: Array<{ label: string; href: string }>; 
    sectionKey: string;
    isMobile?: boolean;
  }) => {
    const isExpanded = expandedSections.has(sectionKey);

    if (isMobile) {
      return (
        <div className="border-b border-gray-200 last:border-b-0">
          <button
            onClick={() => toggleSection(sectionKey)}
            className="flex items-center justify-between w-full py-4 text-left"
          >
            <span className="font-semibold text-gray-900">{title}</span>
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {isExpanded && (
            <div className="pb-4">
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <footer className={cn('bg-gray-900 text-white', className)}>
      {/* Newsletter Section */}
      <div className="bg-primary-600">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-2">Mantente al día con las últimas tendencias</h2>
            <p className="text-primary-100 mb-6">
              Recibe ofertas exclusivas, nuevos productos y contenido especial en tu bandeja de entrada
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="flex-1 bg-white text-gray-900 placeholder-gray-500"
                  required
                />
                <Button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-6 py-2 whitespace-nowrap"
                >
                  {isSubscribed ? '¡Suscrito!' : 'Suscribirse'}
                </Button>
              </div>
              {isSubscribed && (
                <p className="text-primary-100 text-sm mt-2">
                  ¡Gracias por suscribirte! Recibirás nuestras mejores ofertas.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">G</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">Gamarriando</h1>
                  <p className="text-sm text-gray-400">Tu marketplace favorito</p>
                </div>
              </Link>
              <p className="text-gray-300 text-sm mb-6">
                Somos la tienda de streetwear peruano líder en tendencias gamer y moda urbana. 
                Conectamos la cultura gaming con el estilo de vida moderno.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-primary-400" />
                <span className="text-gray-300 text-sm">+51 999 999 999</span>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-primary-400" />
                <span className="text-gray-300 text-sm">hola@gamarriando.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-primary-400" />
                <span className="text-gray-300 text-sm">Lima, Perú</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="lg:col-span-3 hidden lg:grid grid-cols-3 gap-8">
            <FooterSection
              title="Empresa"
              links={footerLinks.company}
              sectionKey="company"
            />
            <FooterSection
              title="Atención al Cliente"
              links={footerLinks.customer}
              sectionKey="customer"
            />
            <FooterSection
              title="Compras"
              links={footerLinks.shopping}
              sectionKey="shopping"
            />
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden col-span-1">
            <FooterSection
              title="Empresa"
              links={footerLinks.company}
              sectionKey="company"
              isMobile
            />
            <FooterSection
              title="Atención al Cliente"
              links={footerLinks.customer}
              sectionKey="customer"
              isMobile
            />
            <FooterSection
              title="Compras"
              links={footerLinks.shopping}
              sectionKey="shopping"
              isMobile
            />
            <FooterSection
              title="Legal"
              links={footerLinks.legal}
              sectionKey="legal"
              isMobile
            />
          </div>
        </div>

        {/* Social Media & Legal */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Social Media */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm mr-2">Síguenos:</span>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                  aria-label={social.name}
                >
                  <span className="text-xl">{social.icon}</span>
                </a>
              ))}
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center lg:justify-end gap-4 text-sm">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Gamarriando. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Hecho con ❤️ en Perú</span>
              <div className="flex items-center space-x-2">
                <span>🇵🇪</span>
                <span>Lima, Perú</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
