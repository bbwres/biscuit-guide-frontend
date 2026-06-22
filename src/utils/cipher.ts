import { JSEncrypt } from 'jsencrypt'

/**
 * RSA 公钥加密登录密码。
 *
 * 与后端 cn.bbwres.biscuit.module.auth.config.PasswordDecryptFilter 配套：
 *   1. 构造 payload: { password, timestamp, nonce }
 *   2. JSON 序列化后用 RSA 公钥（PKCS#1 v1.5 padding）加密
 *   3. 返回 Base64 字符串，作为 OAuth2 password grant 的 password 字段提交
 *
 * 公钥从 import.meta.env.VITE_LOGIN_PUBLIC_KEY 读取（写在 .env 中，跟代码一起发布）。
 * 公钥本身就是设计为公开的，不存在"泄露"概念——前端代码本来就可被用户查看。
 */

const PUBLIC_KEY = import.meta.env.VITE_LOGIN_PUBLIC_KEY as string | undefined

let encryptor: JSEncrypt | null = null

function getEncryptor(): JSEncrypt {
  if (!PUBLIC_KEY) {
    throw new Error('VITE_LOGIN_PUBLIC_KEY 未配置，无法加密登录密码')
  }
  if (!encryptor) {
    encryptor = new JSEncrypt()
    // jsencrypt 接受带 PEM 头尾的格式，也接受去掉头尾的 Base64
    encryptor.setPublicKey(PUBLIC_KEY)
  }
  return encryptor
}

/** 生成 16 字节 hex 随机串作为 nonce（后端目前不校验，预留） */
function randomNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * 加密登录密码
 * @param password 用户输入的明文密码
 * @returns Base64 编码的密文，可直接作为 password 字段提交
 */
export function encryptLoginPassword(password: string): string {
  const payload = {
    password,
    timestamp: Date.now(),
    nonce: randomNonce()
  }
  const json = JSON.stringify(payload)
  const cipher = getEncryptor().encrypt(json)
  if (cipher === false || !cipher) {
    throw new Error('登录密码加密失败')
  }
  return cipher
}
