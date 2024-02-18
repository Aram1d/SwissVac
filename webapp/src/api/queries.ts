import { useQuery } from '@tanstack/react-query';
import { getIDBManual, listIDBManuals } from '@/api/indexDb';
import { Cache, useStore } from '@/api/store';
import { shouldUpdateRevs } from '@/utils/utils';
import { loadVfrManual } from '@/utils/pdfUtils';
import { useDisclosure } from '@mantine/hooks';

export enum QueryKey {
  listRevisions = 'listRevisions',
  computeCache = 'computeCache',
}

type ComputedCache = Cache & { blob: Blob };

export const useListRevisions = () => {
  const [askNewToken, { open, close: closeAskNewToken }] = useDisclosure(false);
  return {
    ...useQuery({
      retry: false,
      queryKey: [QueryKey.listRevisions],
      queryFn: async () => {
        const usedToken = useStore.getState().authToken; // (context.meta?.token as string) || authToken;
        const local = await listIDBManuals();
        const localRevs = new Set(local);

        if (!localRevs.has(useStore.getState().revision)) useStore.getState().setRevision('');

        let distantText = '';

        if (shouldUpdateRevs(local)) {
          if (!usedToken) {
            open();
            throw new Error('No revisions available, please try again later');
          }

          distantText =
            (await fetch(
              import.meta.env.DEV
                ? import.meta.env.VITE_MANUALS_SYNC_URL
                : import.meta.env.VITE_MANUALS_SYNC_URL_PROD,
              {
                headers: { authorization: usedToken },
              }
            ).then((res) => {
              if (!res.ok) {
                if (res.status === 401) open();
                throw new Error('Your token is invalid.');
              }
              closeAskNewToken();
              return res.text();
            })) ?? '';
        }

        const revInListBucketRegex = /(?<=<Key>)[0-9]+(?=\.pdf<\/Key>)/g;
        const distant = new Set(distantText.match(revInListBucketRegex));

        const newRevs = new Set([...distant].filter((r) => !localRevs.has(r)));

        if (!localRevs.size && !newRevs.size) {
          throw new Error('No revisions available, please try again later');
        }

        return { localRevs, newRevs };
      },
    }),
    askNewToken,
  };
};

export const useComputedCache = () => {
  const { rev } = useStore((s) => ({
    rev: s.revision,
  }));

  return useQuery<ComputedCache | null>({
    queryKey: [QueryKey.computeCache, rev],
    queryFn: async () => {
      if (!rev) return null;
      const fromCache = useStore.getState().cache.get(rev);
      const blob = await getIDBManual(rev);
      if (!blob) throw new Error('Could not load VFR cached manual');

      if (fromCache) return { ...fromCache, blob };
      return await loadVfrManual(blob).then((c) => {
        useStore.getState().setCache(rev, c);
        return c;
      });
    },
  });
};
