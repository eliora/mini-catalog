import { redirect } from 'next/navigation';

export default function CatalogPage() {
  // Since catalog is now the homepage, redirect to root
  redirect('/');
}
