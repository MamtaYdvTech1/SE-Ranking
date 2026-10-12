import { redirect } from 'next/navigation';

export default function AdminAutocompleteRedirect() {
  redirect('/search-autocomplete');
}
