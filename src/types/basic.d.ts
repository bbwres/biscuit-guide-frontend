import type { CommonStatus, PageResp } from './api'

export interface FileInfo {
  id?: string
  fileName: string
  originalName: string
  filePath: string
  fileSize: number
  contentType?: string
  bucket?: string
  status: CommonStatus
  businessId?: string
  businessType?: string
  createTime?: string
}

export type FileInfoPageResp = PageResp<FileInfo>

export interface FileBusiness {
  id?: string
  businessCode: string
  businessName: string
  description?: string
  status: CommonStatus
}

export interface TempFile {
  id?: string
  fileName: string
  originalName: string
  fileSize: number
  expireTime?: string
  createTime?: string
}
