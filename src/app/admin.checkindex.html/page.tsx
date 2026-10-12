import { redirect } from 'next/navigation';

export default function AdminCheckIndexRedirect() {
  redirect('/index-status-checker');
}
