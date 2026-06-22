import { useHttp } from '@/utils/request'
import type { TempFile } from '@/types/basic'
import type { PageReq, PageResp } from '@/types/api'

export function pageTempFile(q: PageReq<Partial<TempFile>>): Promise<PageResp<TempFile>> {
  return useHttp().post('/basic/tempFile/page', q)
}

export function cleanupTempFile(): Promise<void> {
  return useHttp().post('/basic/tempFile/cleanup')
}
