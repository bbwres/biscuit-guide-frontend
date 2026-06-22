import { useHttp } from '@/utils/request'
import type { FileBusiness } from '@/types/basic'

export function listFileBusiness(): Promise<FileBusiness[]> {
  return useHttp().get('/basic/fileBusiness/list')
}

export function addFileBusiness(body: Partial<FileBusiness>): Promise<void> {
  return useHttp().post('/basic/fileBusiness/add', body)
}

export function editFileBusiness(body: Partial<FileBusiness>): Promise<void> {
  return useHttp().post('/basic/fileBusiness/edit', body)
}

export function deleteFileBusiness(id: string): Promise<void> {
  return useHttp().get('/basic/fileBusiness/delete', { params: { id } })
}
