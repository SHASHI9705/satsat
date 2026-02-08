import { Suspense } from 'react';

export default function SelectedItemLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div></div>}>
      {children}
    </Suspense>
  );
}