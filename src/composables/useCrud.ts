import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export function useCrud<TAdd, TUpdate extends { id: string }>(
  apis: {
    add: (body: TAdd) => Promise<void>
    update: (body: TUpdate) => Promise<void>
    remove: (id: string) => Promise<void>
  }
) {
  const dialogVisible = ref(false)
  const dialogMode = ref<'add' | 'edit'>('add')
  const editingId = ref<string | null>(null)
  const submitting = ref(false)

  function openAdd() {
    dialogMode.value = 'add'
    editingId.value = null
    dialogVisible.value = true
  }
  function openEdit(id: string) {
    dialogMode.value = 'edit'
    editingId.value = id
    dialogVisible.value = true
  }
  async function submit(form: TAdd | TUpdate) {
    submitting.value = true
    try {
      if (dialogMode.value === 'add') {
        await apis.add(form as TAdd)
        ElMessage.success('新增成功')
      } else {
        await apis.update({ ...(form as any), id: editingId.value } as TUpdate)
        ElMessage.success('修改成功')
      }
      dialogVisible.value = false
      return true
    } catch (e: any) {
      ElMessage.error(e?.message || '操作失败')
      return false
    } finally {
      submitting.value = false
    }
  }
  async function remove(id: string) {
    try {
      await apis.remove(id)
      ElMessage.success('删除成功')
      return true
    } catch (e: any) {
      ElMessage.error(e?.message || '删除失败')
      return false
    }
  }

  return { dialogVisible, dialogMode, editingId, submitting, openAdd, openEdit, submit, remove }
}
