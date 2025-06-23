// app/components/NavigationBar.js
import Link from 'next/link';

export default function NavigationBar() {
  return (
    <nav>
      <ul>
        <li><Link href="/dashboard">Dashboard</Link></li>
        <li><Link href="/admin">Admin</Link></li>
        <li><Link href="/teachers">Teachers</Link></li>
        {/* Add more links as needed */}
      </ul>
    </nav>
  );
}