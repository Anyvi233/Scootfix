import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Company</h3>
          <ul className="space-y-1">
            <li><Link href="/about">About ScootFix</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
            <li><Link href="/shop">Shop EV Spares</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Support</h3>
          <ul className="space-y-1">
            <li><Link href="/contact">Help Center</Link></li>
            <li><Link href="/orders">Track Order</Link></li>
            <li><Link href="/guides">Installation Guides</Link></li>
            <li><Link href="/profile">My Account</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Trust & Legal</h3>
          <ul className="space-y-1">
            <li><Link href="/terms">Terms &amp; Conditions</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/returns">Refund Policy</Link></li>
            <li><Link href="/shipping">Shipping Policy</Link></li>
            <li><Link href="/warranty">Warranty Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="text-center mt-4 text-sm">
        © {new Date().getFullYear()} ScootFix. All rights reserved.
      </div>
    </footer>
  );
}
