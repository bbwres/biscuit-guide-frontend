<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2 class="title">
        {{ t('login.title') }}
      </h2>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="0"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            :placeholder="t('login.username')"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            :placeholder="t('login.password')"
            prefix-icon="Lock"
            @keyup.enter="onSubmit"
          />
        </el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          class="submit"
          @click="onSubmit"
        >
          {{ t('login.submit') }}
        </el-button>
      </el-form>
    </el-card>

    <!-- 滑块验证码遮罩（tac 自身已有完整 UI，无需再套 el-dialog） -->
    <div
      v-if="captchaVisible"
      class="captcha-mask"
      @click.self="closeCaptcha"
    >
      <div id="captcha-box" class="captcha-box" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { login } from '@/api/system/login'
import { getUserMenus, getUserRoles } from '@/api/system/user'
import { collectButtonPermissions } from '@/utils/menu'
import { useUserStore } from '@/stores/user'
import { setRefreshToken } from '@/utils/auth'
import { encryptLoginPassword } from '@/utils/cipher'
import type { UserInfo } from '@/types/auth'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ username: '', password: '' })
const rules = reactive<FormRules>({
  username: [{ required: true, message: () => t('login.usernameRequired'), trigger: 'blur' }],
  password: [{ required: true, message: () => t('login.passwordRequired'), trigger: 'blur' }]
})

// ==================== 登录失败计数（带时效） ====================
// 超过 FAIL_TTL 无新失败则视为失效，自动清零
const LOGIN_FAIL_KEY = 'biscuit-login-fail'
const FAIL_TTL = 30 * 60 * 1000 // 30 分钟

interface FailRecord { count: number; lastAt: number }

function readFail(): FailRecord {
  try {
    const raw = localStorage.getItem(LOGIN_FAIL_KEY)
    if (!raw) return { count: 0, lastAt: 0 }
    const obj = JSON.parse(raw) as FailRecord
    // 距离上次失败超过 TTL，视为过期
    if (Date.now() - obj.lastAt > FAIL_TTL) {
      localStorage.removeItem(LOGIN_FAIL_KEY)
      return { count: 0, lastAt: 0 }
    }
    return obj
  } catch {
    return { count: 0, lastAt: 0 }
  }
}

function addLoginFailCount() {
  const cur = readFail()
  const next: FailRecord = { count: cur.count + 1, lastAt: Date.now() }
  localStorage.setItem(LOGIN_FAIL_KEY, JSON.stringify(next))
}

function resetLoginFailCount() {
  localStorage.removeItem(LOGIN_FAIL_KEY)
}

function getLoginFailCount(): number {
  return readFail().count
}

/** 登录失败超过 3 次需要验证码 */
function needCaptcha(): boolean {
  return getLoginFailCount() >= 3
}

// ==================== 官方 tianai-captcha 验证码 ====================
const captchaVisible = ref(false)
let tacInstance: any = null
/** 验证码 id（如 SLIDER_xxxx），登录时作为 captcha_verification 发给后端 */
let captchaVerification = ''

/** 动态加载 load.min.js（仅加载一次） */
function loadTACScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.loadTAC) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = '/tac/js/load.min.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load tac/load.min.js'))
    document.head.appendChild(script)
  })
}

/** 初始化验证码（弹出遮罩后调用） */
async function initCaptcha() {
  captchaVerification = ''

  const baseURL = import.meta.env.VITE_API_BASE_URL || ''

  try {
    await loadTACScript()
    await nextTick() // 等 #captcha-box 渲染出来

    tacInstance = await window.loadTAC('/tac', {
      requestCaptchaDataUrl: `${baseURL}/auth/captcha/create?type=SLIDER`,
      validCaptchaUrl: `${baseURL}/auth/captcha/checkCaptcha`,
      bindEl: '#captcha-box',
      validSuccess: (res: any, _c: any, tac: any) => {
        // 后端登录接口要求 captcha_verification = 验证码校验返回的 data（如 SLIDER_xxxx）
        captchaVerification = res?.data || ''
        tac.destroyWindow()
        captchaVisible.value = false
        doLogin()
      },
      validFail: (_res: any, _c: any, tac: any) => {
        tac.reloadCaptcha()
      },
      btnCloseFun: () => {
        closeCaptcha()
      }
    }, {
      // 隐藏 tac 默认 logo
      logoUrl: null
    })

    tacInstance.init()
  } catch (e) {
    console.error('验证码加载失败', e)
    ElMessage.error('验证码加载失败')
    captchaVisible.value = false
    loading.value = false
  }
}

/** 关闭验证码遮罩 */
function closeCaptcha() {
  captchaVisible.value = false
}

// 关闭遮罩时销毁 tac 实例
watch(captchaVisible, (visible) => {
  if (visible) {
    initCaptcha()
  } else {
    if (tacInstance) {
      try { tacInstance.destroyWindow() } catch { /* ignore */ }
      tacInstance = null
    }
    if (!captchaVerification) {
      loading.value = false
    }
  }
})

onBeforeUnmount(() => {
  if (tacInstance) {
    try { tacInstance.destroyWindow() } catch { /* ignore */ }
    tacInstance = null
  }
})

// ==================== 登录主流程 ====================
async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()
  loading.value = true

  if (needCaptcha()) {
    captchaVisible.value = true
  } else {
    doLogin()
  }
}

async function doLogin() {
  try {
    // 用 RSA 公钥加密 { password, timestamp, nonce }，密文作为 password 字段提交
    const encryptedPassword = encryptLoginPassword(form.password)
    const params: any = { username: form.username, password: encryptedPassword }
    if (captchaVerification) {
      params.captchaVerification = captchaVerification
    }
    const resp = await login(params)
    userStore.setToken(resp.access_token)
    if (resp.refresh_token) {
      setRefreshToken(resp.refresh_token)
    }

    // 登录成功，重置失败计数
    resetLoginFailCount()

    // 拉角色 + 菜单树
    const [roles, menus] = await Promise.all([
      getUserRoles().catch(() => []),
      getUserMenus().catch(() => [])
    ])
    const roleCodes = (roles ?? []).map((r) => r.roleCode).filter(Boolean)
    const permissions = collectButtonPermissions(menus ?? [])

    const info: UserInfo = {
      id: resp.custom_user_id || form.username,
      loginName: form.username,
      userName: resp.custom_zh_name || form.username,
      roles: resp.custom_roles ?? roleCodes,
      permissions,
      tenantId: resp.custom_tenant_id
    }
    userStore.setUserInfo(info)

    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (e: any) {
    // 登录失败，累加计数（错误提示已由 request.ts 拦截器展示，不重复弹）
    addLoginFailCount()

    // 验证码错误（resultCode 101001009）：清空旧凭证，重新弹出验证码
    if (e?.resultCode === '101001009') {
      captchaVerification = ''
      captchaVisible.value = true
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
}
.login-card { width: 380px; padding: 24px 8px; }
.title { text-align: center; margin: 0 0 24px; }
.submit { width: 100%; }

/* 验证码遮罩：透明叠层，让 tac 自带的卡片样式直接呈现 */
.captcha-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.captcha-box {
  /* 不加边框/背景，避免与 tac 自身样式叠成两层 */
  background: transparent;
}
</style>

<!-- 非 scoped：覆盖 tac 注入的全局验证码样式 -->
<style>
/* 滑块按钮：保留原始尺寸与定位（与拼图块联动），仅加边框/背景提升可见性 */
#tianai-captcha.tianai-captcha-slider .slider-move .slider-move-btn {
  background-color: #f0f2f5 !important;
  border: 1px solid #d0d3d9;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
}

/* 窗体高度自适应内容，去掉底部按钮下方的多余空白 */
#tianai-captcha-parent {
  height: auto !important;
}
</style>
