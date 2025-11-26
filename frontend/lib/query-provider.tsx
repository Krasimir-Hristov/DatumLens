'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Създаваме клиента веднъж при стартиране
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Данните се считат за "свежи" 1 минута
            // През това време няма да се правят нови заявки автоматично
            staleTime: 60 * 1000,

            // Ако заявката се провали, пробвай още веднъж преди да покажеш грешка
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
