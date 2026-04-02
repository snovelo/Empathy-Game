import { redirect } from 'next/navigation';

// Short URL: /join/HERO42 → /join?code=HERO42
export default function DirectJoinPage({ params }: { params: { code: string } }) {
  redirect(`/join?code=${params.code.toUpperCase()}`);
}
