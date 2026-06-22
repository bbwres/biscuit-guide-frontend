import { useHttp } from '@/utils/request'
import type { FileInfo } from '@/types/basic'
import type { PageReq, PageResp } from '@/types/api'

export function pageFileInfo(q: PageReq<Partial<FileInfo>>): Promise<PageResp<FileInfo>> {
  return useHttp().post('/basic/fileInfo/page', q)
}

export function uploadFile(formData: FormData): Promise<FileInfo> {
  return useHttp().upload('/basic/fileInfo/upload', formData)
}

export function deleteFile(id: string): Promise<void> {
  return useHttp().get('/basic/fileInfo/delete', { params: { id } })
}
