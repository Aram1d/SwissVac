import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { storeIDBManual } from '@/api/indexDb';
import { useStore } from '@/api/store';

export const useUpdateRevisions = () => {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const { authToken } = useStore(({ authToken }) => ({ authToken }));

  const mutation = useMutation<string, Error, string>({
    mutationKey: ['dlRevisions'],
    mutationFn: async (rev) =>
      new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(
          'GET',
          `${
            import.meta.env.DEV
              ? import.meta.env.VITE_MANUALS_SYNC_URL
              : import.meta.env.VITE_MANUALS_SYNC_URL_PROD
          }/${rev}.pdf`
        );
        xhr.setRequestHeader('authorization', authToken);
        xhr.responseType = 'blob';

        xhr.onprogress = (event) => {
          if (event.lengthComputable)
            setProgress((state) => ({
              ...state,
              [rev]: Math.round((event.loaded / event.total) * 100),
            }));
        };

        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress((state) => {
              const { [rev]: _, ...rest } = state;
              if (Object.values(rest).every((p) => p === 100)) return {};
              return {
                ...state,
                [rev]: 100,
              };
            }); // Update progress state
            resolve((await storeIDBManual({ rev: rev, blob: xhr.response })) as string);
          } else reject(new Error('Update failed due to server error'));
        };

        xhr.onerror = () => reject(new Error('Update failed due to network error'));
        xhr.send();
      }),
  });

  return { ...mutation, progress };
};
